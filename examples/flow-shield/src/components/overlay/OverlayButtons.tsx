'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { COLORS } from '../theme/theme'
import { useIsMobile } from '../../hooks/useIsMobile'
import styles from './OverlayButtons.module.css'

export type Preset = 'default' | 'droideka'

interface OverlayButtonsProps {
  showGrid: boolean
  onToggleGrid: () => void
  hideLeva: boolean
  onToggleLeva: () => void
  hasGlb: boolean
  onLoadGlb: (file: File) => void
  onClearGlb: () => void
  preset: Preset
  onSetPreset: (p: Preset) => void
}

export default function OverlayButtons({
  showGrid,
  onToggleGrid,
  hideLeva,
  onToggleLeva,
  hasGlb,
  onLoadGlb,
  onClearGlb,
  preset,
  onSetPreset
}: OverlayButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onLoadGlb(file)
    e.target.value = ''
  }

  const close = useCallback(() => setOpen(false), [])

  // close popover on outside tap
  useEffect(() => {
    if (!open || !isMobile) return
    const handler = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) close()
    }
    document.addEventListener('pointerdown', handler, true)
    return () => document.removeEventListener('pointerdown', handler, true)
  }, [open, isMobile, close])

  const cssVars = {
    '--overlay-bg': COLORS.bg,
    '--overlay-surface': COLORS.surface,
    '--overlay-border': COLORS.border,
    '--overlay-text': COLORS.text,
    '--overlay-accent': COLORS.accent
  } as React.CSSProperties

  const fileInput = (
    <input ref={fileInputRef} type="file" accept=".glb,.gltf" className={styles.fileInput} onChange={handleFileChange} />
  )

  const controls = (
    <>
      {/* Preset selector */}
      <div className={styles.presetGroup}>
        <button
          onClick={() => onSetPreset('default')}
          className={`${styles.presetBtn} ${preset === 'default' ? styles.active : styles.inactive}`}
        >
          Default
        </button>
        <button
          onClick={() => onSetPreset('droideka')}
          className={`${styles.presetBtn} ${preset === 'droideka' ? styles.active : styles.inactive}`}
        >
          Droideka
        </button>
      </div>

      <div className={styles.separator} />

      {/* Load GLB */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className={`${styles.importBtn} ${hasGlb ? styles.active : ''}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M8 2v8M5 7l3 3 3-3" />
          <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" />
        </svg>
        <span className={styles.importLabel}>Import GLB</span>
      </button>

      {/* Clear GLB */}
      {hasGlb && (
        <button onClick={onClearGlb} className={styles.btn} title="Remove model">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="4" y1="4" x2="12" y2="12" />
            <line x1="12" y1="4" x2="4" y2="12" />
          </svg>
        </button>
      )}

      {/* Toggle Grid */}
      <button
        onClick={onToggleGrid}
        className={`${styles.btn} ${showGrid ? styles.active : styles.inactive}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="1" y="1" width="6" height="6" />
          <rect x="9" y="1" width="6" height="6" />
          <rect x="1" y="9" width="6" height="6" />
          <rect x="9" y="9" width="6" height="6" />
        </svg>
      </button>

      {/* Toggle Leva Controls */}
      <button
        onClick={onToggleLeva}
        className={`${styles.btn} ${!hideLeva ? styles.active : styles.inactive}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
          <line x1="2" y1="4" x2="14" y2="4" />
          <circle cx="10" cy="4" r="1.5" fill="currentColor" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <circle cx="5" cy="8" r="1.5" fill="currentColor" />
          <line x1="2" y1="12" x2="14" y2="12" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </button>
    </>
  )

  /* ── Desktop: inline strip (unchanged) ─────────────────────────── */
  if (!isMobile) {
    return (
      <div className={styles.container} style={cssVars}>
        {fileInput}
        {controls}
      </div>
    )
  }

  /* ── Mobile: FAB + popover ─────────────────────────────────────── */
  return (
    <div ref={popoverRef} className={styles.mobileRoot} style={cssVars}>
      {fileInput}

      {/* Popover panel */}
      <div className={`${styles.popover} ${open ? styles.popoverOpen : ''}`}>
        {controls}
      </div>

      {/* FAB trigger */}
      <button className={styles.fab} onClick={() => setOpen((v) => !v)} aria-label="Options">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          className={`${styles.fabIcon} ${open ? styles.fabIconOpen : ''}`}
        >
          {open ? (
            <>
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </>
          ) : (
            <>
              <circle cx="10" cy="4" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="16" r="1.5" fill="currentColor" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
