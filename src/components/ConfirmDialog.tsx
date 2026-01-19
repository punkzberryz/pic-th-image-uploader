import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  pendingFile: File
  uploading: boolean
  format: string
  setPendingFile: (file: File | null) => void
  confirmUpload: () => void
}

/**
 * Component for the upload confirmation dialog.
 */
export function ConfirmDialog({
  pendingFile,
  uploading,
  format,
  setPendingFile,
  confirmUpload,
}: ConfirmDialogProps) {
  return (
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
  )
}
