import React from 'react'

interface UploadControlsProps {
  customName: string
  setCustomName: (name: string) => void
  format: string
  setFormat: (format: string) => void
}

/**
 * Component for controlling upload settings like custom filename and output format.
 */
export function UploadControls({
  customName,
  setCustomName,
  format,
  setFormat,
}: UploadControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 space-y-1">
        <label className="text-sm font-medium text-neutral-400" htmlFor="custom-name">
          Custom Filename (Optional)
        </label>
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
        <label className="text-sm font-medium text-neutral-400" htmlFor="format-select">
          Format
        </label>
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
        </div>
      </div>
    </div>
  )
}
