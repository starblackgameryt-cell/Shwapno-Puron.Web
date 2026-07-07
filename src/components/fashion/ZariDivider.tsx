'use client'

interface ZariDividerProps {
  className?: string
}

/**
 * Signature brand element — a horizontal gold zari-thread divider
 * with a centered diamond motif, inspired by embroidery border patterns.
 * Used sparingly between major sections to tie the brand together.
 */
export function ZariDivider({ className = '' }: ZariDividerProps) {
  return (
    <div className={`zari-divider ${className}`} aria-hidden="true">
      <span className="zari-divider__dot" />
    </div>
  )
}
