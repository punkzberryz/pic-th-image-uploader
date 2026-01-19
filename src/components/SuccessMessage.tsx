import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Copy, Check } from 'lucide-react'
import { UploadedImage } from '@/lib/types'

interface SuccessMessageProps {
  lastUploaded: UploadedImage
  copiedId: number | string | null
  copyToClipboard: (text: string, id: number | string) => void
}

/**
 * Component for displaying a success message after a successful upload.
 */
export function SuccessMessage({
  lastUploaded,
  copiedId,
  copyToClipboard,
}: SuccessMessageProps) {
  return (
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
            {copiedId === 'last' ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
