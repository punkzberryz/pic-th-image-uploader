import React from 'react'

/**
 * Header component displaying the application title and description.
 */
export function Header() {
  return (
    <header className="text-center space-y-2">
      <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Image Resizer & Uploader
      </h1>
      <p className="text-neutral-400">
        Resize to WebP & Upload to pic.in.th automatically
      </p>
    </header>
  )
}
