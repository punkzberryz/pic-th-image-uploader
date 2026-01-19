import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Copy, Check, Trash2 } from 'lucide-react'
import { UploadedImage } from '@/lib/types'

interface HistoryProps {
  history: UploadedImage[]
  copiedId: number | string | null
  copyToClipboard: (text: string, id: number | string) => void
  handleDelete: (id: number) => void
}

/**
 * Component for displaying the history of recent uploads.
 */
export function History({
  history,
  copiedId,
  copyToClipboard,
  handleDelete,
}: HistoryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-neutral-200">
        <ImageIcon className="w-5 h-5" />
        Recent Uploads
      </h2>

      <div className="space-y-3">
        {history.length === 0 ? (
          <p className="text-neutral-600 text-center py-8">No uploads yet.</p>
        ) : (
          <AnimatePresence mode="popLayout">
            {history.map((img) => (
              <HistoryItem
                key={img.id}
                img={img}
                copiedId={copiedId}
                copyToClipboard={copyToClipboard}
                handleDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

interface HistoryItemProps {
  img: UploadedImage
  copiedId: number | string | null
  copyToClipboard: (text: string, id: number | string) => void
  handleDelete: (id: number) => void
}

/**
 * Individual history item showing image details and actions.
 */
function HistoryItem({
  img,
  copiedId,
  copyToClipboard,
  handleDelete,
}: HistoryItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-neutral-900 p-4 rounded-xl flex items-center justify-between border border-neutral-800 hover:border-neutral-700 transition group"
    >
      <div className="flex-1 min-w-0 mr-4">
        <p className="font-medium text-neutral-300 truncate">{img.originalName}</p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {new Date(img.createdAt).toLocaleDateString()} •{' '}
          {new Date(img.createdAt).toLocaleTimeString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => copyToClipboard(img.url, img.id)}
          className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition"
          title="Copy link"
        >
          {copiedId === img.id ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
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
  )
}
