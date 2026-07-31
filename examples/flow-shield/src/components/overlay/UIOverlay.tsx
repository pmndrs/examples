'use client'

import OverlayHeader from './OverlayHeader'
import styles from './UIOverlay.module.css'

export default function UIOverlay() {
  return (
    <div className={styles.overlay}>
      <OverlayHeader />
    </div>
  )
}
