'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, Trash2, Copy, Check } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utils
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type UploadedImage = {
  id: number
  originalName: string
  url: string
  createdAt: string
}

export default function Home() {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState<UploadedImage[]>([])
  const [lastUploaded, setLastUploaded] = useState<UploadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // New States
  const [format, setFormat] = useState('webp')
  const [customName, setCustomName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [copiedId, setCopiedId] = useState<number | string | null>(null)

  const copyToClipboard = async (text: string, id: number | string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/upload')
      if (res.ok) {
        const data = await res.json()
        setHistory(data)
      }
    } catch (e) {
      console.error('Failed to fetch history', e)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this item from history?')) return

    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id))
      } else {
        console.error('Failed to delete')
      }
    } catch (e) {
      console.error('Error deleting', e)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      prepareUpload(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      prepareUpload(e.target.files[0])
    }
    // Reset inputs value to allow selecting same file again if canceled
    e.target.value = ''
  }

  const prepareUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError("Please upload an image file.")
        return
    }
    setPendingFile(file)
    setError(null)
  }

  const confirmUpload = async () => {
    if (!pendingFile) return
    
    setUploading(true)
    setError(null)
    setLastUploaded(null)

    const formData = new FormData()
    formData.append('file', pendingFile)
    formData.append('format', format)
    if (customName) {
        formData.append('name', customName)
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        setLastUploaded(data.image)
        fetchHistory()
        setPendingFile(null)
        setCustomName('') 
      } else {
        setError(data.error || 'Upload failed')
        setPendingFile(null) // Close modal on error to allow retry
      }
    } catch (e) {
      setError('An unexpected error occurred')
      setPendingFile(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-purple-500/30">
        <div className="max-w-2xl mx-auto space-y-12">
            
            {/* Header */}
            <header className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Image Resizer & Uploader
                </h1>
                <p className="text-neutral-400">
                    Resize to WebP & Upload to pic.in.th automatically
                </p>
            </header>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-sm font-medium text-neutral-400" htmlFor="custom-name">Custom Filename (Optional)</label>
                    <input
                        id="custom-name"
                        type="text"
                        placeholder="e.g. holiday-photo"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition placeholder:text-neutral-600"
                    />
                </div>
                <div className="w-full sm:w-48 space-y-1">
                    <label className="text-sm font-medium text-neutral-400" htmlFor="format-select">Format</label>
                    <div className="relative">
                        <select
                            id="format-select"
                            value={format}
                            onChange={(e) => setFormat(e.target.value)}
                            className="w-full appearance-none bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition cursor-pointer"
                        >
                            <option value="webp">WebP (Default)</option>
                            <option value="png">PNG</option>
                            <option value="jpeg">JPEG</option>
                        </select>
                        {/* Custom arrow could go here */}
                    </div>
                </div>
            </div>

            {/* Confirm Dialog / Upload Zone */}
            <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                    {pendingFile ? (
                        <motion.div 
                            key="confirm-dialog"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 z-10"
                        >
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">Confirm Upload</h3>
                                <p className="text-neutral-400">
                                    Ready to process and upload <span className="text-purple-400 font-medium">{pendingFile.name}</span>
                                </p>
                                <div className="text-sm text-neutral-500 bg-neutral-950/50 py-2 px-4 rounded-lg inline-block">
                                    Size: {(pendingFile.size / 1024).toFixed(1)} KB • Output: {format.toUpperCase()}
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setPendingFile(null)}
                                    disabled={uploading}
                                    className="px-6 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmUpload}
                                    disabled={uploading}
                                    className="px-6 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition font-medium shadow-lg shadow-purple-900/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {uploading ? 'Uploading...' : 'Upload Now'}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload-zone"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn(
                                "absolute inset-0 group cursor-pointer transition-all duration-300 ease-out",
                                "border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-center",
                                dragActive 
                                    ? "border-purple-500 bg-purple-500/10 scale-[1.02]" 
                                    : "border-neutral-800 hover:border-neutral-600 bg-neutral-900/50"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <input 
                                type="file" 
                                id="file-upload" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleChange}
                            />
                            
                            <div className="flex flex-col items-center justify-center space-y-4 p-12">
                                <div className={cn(
                                    "p-4 rounded-full transition-colors",
                                    dragActive ? "bg-purple-500/20 text-purple-400" : "bg-neutral-800 text-neutral-400 group-hover:bg-neutral-700"
                                )}>
                                    {uploading ? (
                                        <Loader2 className="w-10 h-10 animate-spin" />
                                    ) : (
                                        <Upload className="w-10 h-10" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-medium">
                                        {uploading ? "Processing..." : "Drop your image here"}
                                    </p>
                                    <p className="text-sm text-neutral-500">
                                        or click to browse
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
                {lastUploaded && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl flex flex-col items-center gap-4 text-center"
                    >
                        <div className="bg-green-500/20 p-3 rounded-full text-green-400">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-green-400">Upload Successful!</h3>
                            <div className="mt-2 flex items-center justify-center gap-2">
                                <a 
                                    href={lastUploaded.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-neutral-300 hover:text-white underline underline-offset-4 break-all text-sm"
                                >
                                    {lastUploaded.url}
                                </a>
                                <button
                                    onClick={() => copyToClipboard(lastUploaded.url, 'last')}
                                    className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition shrink-0"
                                    title="Copy link"
                                >
                                    {copiedId === 'last' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History */}
            <div className="space-y-6">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-200">
                    <ImageIcon className="w-5 h-5" />
                    Recent Uploads
                </h2>
                
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <p className="text-neutral-600 text-center py-8">No uploads yet.</p>
                    ) : (
                        history.map((img) => (
                            <motion.div 
                                key={img.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-neutral-900 p-4 rounded-xl flex items-center justify-between border border-neutral-800 hover:border-neutral-700 transition group"
                            >
                                <div className="flex-1 min-w-0 mr-4">
                                    <p className="font-medium text-neutral-300 truncate">{img.originalName}</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {new Date(img.createdAt).toLocaleDateString()} • {new Date(img.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => copyToClipboard(img.url, img.id)}
                                        className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition"
                                        title="Copy link"
                                    >
                                        {copiedId === img.id ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <a 
                                        href={img.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 rounded-lg bg-neutral-800 text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition"
                                    >
                                        Open
                                    </a>
                                    <button
                                        onClick={() => handleDelete(img.id)}
                                        className="p-2 rounded-lg text-neutral-600 hover:bg-red-500/10 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                                        title="Remove from history"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

        </div>
    </main>
  )
}
