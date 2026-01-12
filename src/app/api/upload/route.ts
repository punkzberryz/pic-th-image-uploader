import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 1. Convert/Resize
    const format = (formData.get('format') as string) || 'webp'
    const customName = formData.get('name') as string | null
    const buffer = Buffer.from(await file.arrayBuffer())
    
    let pipeline = sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })

    if (format === 'png') {
        pipeline = pipeline.png({ quality: 80 })
    } else if (format === 'jpeg' || format === 'jpg') {
        pipeline = pipeline.jpeg({ quality: 80 })
    } else {
        pipeline = pipeline.webp({ quality: 80 })
    }
    
    const processedImageBuffer = await pipeline.toBuffer()

    // 2. Upload to pic.in.th
    const apiKey = process.env.PIC_IN_TH_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 })
    }

    const uploadFormData = new FormData()
    const mimeType = format === 'png' ? 'image/png' : (format === 'jpeg' || format === 'jpg') ? 'image/jpeg' : 'image/webp'
    const extension = format === 'jpeg' ? 'jpg' : format
    
    // Determine title: Use customName if provided, otherwise fallback to filename (without extension if possible, or just file.name)
    let title = customName
    if (!title) {
        // Remove extension from original name for cleaner title, or just use full name
        title = file.name.replace(/\.[^/.]+$/, "")
    }

    const filename = `${title}.${extension}`

    const blob = new Blob([new Uint8Array(processedImageBuffer)], { type: mimeType })
    uploadFormData.append('source', blob, filename)
    uploadFormData.append('title', title)
    // uploadFormData.append('format', 'json') // Default is json likely

    const response = await fetch('https://pic.in.th/api/1/upload', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
      },
      body: uploadFormData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload failed:', errorText)
      return NextResponse.json({ error: 'Upload to pic.in.th failed', details: errorText }, { status: 502 })
    }

    const result = await response.json()
    // result structure from pic.in.th docs usually has { image: { url: ... } } or similar.
    // Based on standard Chevereto API (which pic.in.th uses likely), it returns { image: { url: "..." } } or { url: "..." }
    // I should log it or try to find exact response. 
    // Summary said: "The pic.in.th API documentation... example call". 
    // Usually it returns `image.url`.
    // I'll assume `result.image.url` for now based on common patterns for this API software (Chevereto).
    
    const imageUrl = result.image?.url || result.url
    
    if (!imageUrl) {
       console.error('Unexpected response structure:', result)
       return NextResponse.json({ error: 'Failed to parse upload response' }, { status: 502 })
    }

    // 3. Save to Database
    const savedImage = await prisma.image.create({
      data: {
        originalName: file.name,
        url: imageUrl,
      },
    })

    return NextResponse.json({ success: true, image: savedImage })

  } catch (error) {
    console.error('Processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(images)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
