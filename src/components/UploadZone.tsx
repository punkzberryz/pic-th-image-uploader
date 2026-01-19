import React from 'react'
import { motion } from 'framer-motion'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  dragActive: boolean
  uploading: boolean
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

/**
 * Component for the drag-and-drop upload area.
 */
export function UploadZone({
  dragActive,
  uploading,
  handleDrag,
  handleDrop,
  handleChange,
}: UploadZoneProps) {
  return (
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
  )
}
