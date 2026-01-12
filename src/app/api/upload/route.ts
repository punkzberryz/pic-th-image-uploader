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

    // 1. Convert/Resize Image (Client side logic handles desired resize dims? Or here? 
    // The requirement says "resize the image... when I drop the image into the tool input"
    // I'll assume we want a standard webp conversion.
    // For now, let's just convert to WebP and ensure max width? 
    // "similar to squoosh" implies user control, but user said "tool to help me resize... then upload".
    // I will implement a default resize to 1920px width if larger, and convert to WebP.
    // I can add params later if needed.
    
    const buffer = Buffer.from(await file.arrayBuffer())
    
    const processedImageBuffer = await sharp(buffer)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    // 2. Upload to pic.in.th
    const apiKey = process.env.PIC_IN_TH_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 })
    }

    // Prepare FormData for external API
    // We need to send the buffer. native fetch with FormData and Blob/Buffer can be tricky in Node environment
    // Next.js App Router runs on Node (usually).
    const uploadFormData = new FormData()
    // We need to append a Blob.
    const blob = new Blob([new Uint8Array(processedImageBuffer)], { type: 'image/webp' })
    uploadFormData.append('source', blob, 'image.webp')
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
