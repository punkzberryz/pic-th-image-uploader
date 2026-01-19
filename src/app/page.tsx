'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

// Components
import { Header } from '@/components/Header'
import { UploadControls } from '@/components/UploadControls'
import { UploadZone } from '@/components/UploadZone'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { SuccessMessage } from '@/components/SuccessMessage'
import { History } from '@/components/History'

// Utils & Types
import { UploadedImage } from '@/lib/types'

/**
 * Main Home component managing the application state and layout.
 * It orchestrates image uploading, processing, and history tracking.
 */
export default function Home() {
  // --- State ---
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [history, setHistory] = useState<UploadedImage[]>([])
  const [lastUploaded, setLastUploaded] = useState<UploadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [format, setFormat] = useState('webp')
  const [customName, setCustomName] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [copiedId, setCopiedId] = useState<number | string | null>(null)

  // --- Handlers ---

  /**
   * Fetches the upload history from the API.
   */
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

  /**
   * Deletes an item from the history.
   */
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

  /**
   * Copies text to clipboard and provides visual feedback.
   */
  const copyToClipboard = async (text: string, id: number | string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // --- Drag and Drop Handlers ---

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

  /**
   * Prepares a file for upload after basic validation.
   */
  const prepareUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError("Please upload an image file.")
        return
    }
    setPendingFile(file)
    setError(null)
  }

  /**
   * Performs the actual upload to the API.
   */
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

  // --- Render ---

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8 font-sans selection:bg-purple-500/30">
        <div className="max-w-2xl mx-auto space-y-12">
            
            <Header />

            <UploadControls 
              customName={customName}
              setCustomName={setCustomName}
              format={format}
              setFormat={setFormat}
            />

            <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait">
                    {pendingFile ? (
                        <ConfirmDialog 
                          pendingFile={pendingFile}
                          uploading={uploading}
                          format={format}
                          setPendingFile={setPendingFile}
                          confirmUpload={confirmUpload}
                        />
                    ) : (
                        <UploadZone 
                          dragActive={dragActive}
                          uploading={uploading}
                          handleDrag={handleDrag}
                          handleDrop={handleDrop}
                          handleChange={handleChange}
                        />
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

            <AnimatePresence>
                {lastUploaded && (
                    <SuccessMessage 
                      lastUploaded={lastUploaded}
                      copiedId={copiedId}
                      copyToClipboard={copyToClipboard}
                    />
                )}
            </AnimatePresence>

            <History 
              history={history}
              copiedId={copiedId}
              copyToClipboard={copyToClipboard}
              handleDelete={handleDelete}
            />

        </div>
    </main>
  )
}
