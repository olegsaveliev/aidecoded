import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({ text }) {
  const iconRef = useRef(null)
  const tooltipRef = useRef(null)
  const [pos, setPos] = useState(null) // null = closed, {left,top,flipped} = open
  const pinnedRef = useRef(false)
  const timerRef = useRef(null)
  const clampedRef = useRef(false)

  function open() {
    clampedRef.current = false
    const el = iconRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ left: r.left + r.width / 2, top: r.top - 8, bottom: r.bottom + 8, flipped: false })
  }

  function close() {
    clearTimeout(timerRef.current)
    pinnedRef.current = false
    setPos(null)
  }

  // Clamp tooltip within viewport after it renders
  useLayoutEffect(() => {
    if (!pos || !tooltipRef.current || clampedRef.current) return
    clampedRef.current = true
    const rect = tooltipRef.current.getBoundingClientRect()
    const pad = 12
    let dl = 0
    let dt = 0
    let flipped = pos.flipped

    // Horizontal clamp
    if (rect.left < pad) dl = pad - rect.left
    else if (rect.right > window.innerWidth - pad) dl = window.innerWidth - pad - rect.right

    // Vertical: if clipped above viewport, flip below the icon
    if (!flipped && rect.top < pad) flipped = true

    // Vertical: if clipped below viewport (when flipped), nudge up
    if (flipped && rect.bottom > window.innerHeight - pad) {
      dt = window.innerHeight - pad - rect.bottom
    }
    // Vertical: if still clipped above after flip, nudge down
    if (!flipped && (rect.top + dt) < pad) {
      dt = pad - rect.top
    }

    if (dl || dt || flipped !== pos.flipped) {
      setPos((p) => ({
        ...p,
        left: p.left + dl,
        top: p.top + dt,
        bottom: p.bottom + dt,
        flipped,
      }))
    }
  }, [pos])

  function handleIconClick(e) {
    e.stopPropagation()
    if (pinnedRef.current) {
      close()
    } else {
      pinnedRef.current = true
      open()
    }
  }

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    if (!pinnedRef.current && !pos) {
      open()
    }
  }

  function handleMouseLeave() {
    if (!pinnedRef.current) {
      timerRef.current = setTimeout(close, 120)
    }
  }

  function handleBubbleEnter() {
    clearTimeout(timerRef.current)
  }

  function handleBubbleLeave() {
    if (!pinnedRef.current) {
      timerRef.current = setTimeout(close, 120)
    }
  }

  // Outside click + Escape when open
  useEffect(() => {
    if (!pos) return

    function onDoc(e) {
      if (iconRef.current && iconRef.current.contains(e.target)) return
      if (tooltipRef.current && tooltipRef.current.contains(e.target)) return
      close()
    }

    function onKey(e) {
      if (e.key === 'Escape') close()
    }

    const id = setTimeout(() => {
      document.addEventListener('mousedown', onDoc, true)
      document.addEventListener('keydown', onKey)
    }, 0)

    return () => {
      clearTimeout(id)
      document.removeEventListener('mousedown', onDoc, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [pos])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <span
      className="app-tooltip"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span
        className={`app-tooltip-icon ${pos ? 'app-tooltip-icon-active' : ''}`}
        ref={iconRef}
        onClick={handleIconClick}
      >
        ?
      </span>
      {pos && createPortal(
        <span
          ref={tooltipRef}
          className="app-tooltip-text"
          style={{
            left: pos.left,
            top: pos.flipped ? pos.bottom : pos.top,
            transform: pos.flipped ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
          }}
          onMouseEnter={handleBubbleEnter}
          onMouseLeave={handleBubbleLeave}
        >
          {text}
        </span>,
        document.body
      )}
    </span>
  )
}
