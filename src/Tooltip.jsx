import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Tooltip({ text }) {
  const iconRef = useRef(null)
  const tooltipRef = useRef(null)
  const [pos, setPos] = useState(null) // null = closed, {left,top} = open
  const pinnedRef = useRef(false)
  const timerRef = useRef(null)

  function calcPos() {
    const el = iconRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { left: r.left + r.width / 2, top: r.top - 8 }
  }

  function open() {
    const p = calcPos()
    if (p) setPos(p)
  }

  function close() {
    clearTimeout(timerRef.current)
    pinnedRef.current = false
    setPos(null)
  }

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
          style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, -100%)' }}
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
