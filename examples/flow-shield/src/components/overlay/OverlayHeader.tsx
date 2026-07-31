'use client'

import styles from './OverlayHeader.module.css'

export default function OverlayHeader() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  })

  return (
    <div className={styles.header}>
      {/* Classification label */}
      <div className={styles.eyebrow}>
        SHIELD VFX WITH HIT DETECTION
      </div>

      {/* Horizontal rule */}
      <div className={styles.rule} />

      {/* Title */}
      <h1 className={styles.title}>SHIELD VFX</h1>

      {/* Designation subtitle */}
      <div className={styles.subtitle}>
        3D PLAYGROUND ENVIRONMENT
      </div>

      {/* Rev / Date metadata */}
      <div className={styles.meta}>
        V 1.01 &mdash; {dateStr.toUpperCase()} &mdash; R3F / DREI / LEVA
      </div>
    </div>
  )
}
