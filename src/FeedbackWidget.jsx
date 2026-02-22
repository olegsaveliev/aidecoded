import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { NAV_GROUPS, getGroupForTab } from './NavDropdown.jsx'
import './FeedbackWidget.css'

// SETUP: Add FORMSPREE_ID to your .env and Vercel environment variables
// Create a free form at formspree.io, copy the form ID
// Submissions arrive at your registered Formspree email

const FEEDBACK_TYPES = [
  { id: 'bug', icon: '🐛', label: 'Bug Report' },
  { id: 'wrong-info', icon: '📝', label: 'Wrong Info' },
  { id: 'suggestion', icon: '💡', label: 'Suggestion' },
  { id: 'other', icon: '⭐', label: 'Other' },
]

const PLACEHOLDERS = {
  bug: 'Describe what happened and what you expected...',
  'wrong-info': 'What information seems incorrect or outdated?',
  suggestion: 'What would make this better?',
  other: 'Tell us anything...',
}

function getPageContext({ showHome, showLanding, activeTab, subPage }) {
  if (showLanding) return 'Landing Page'
  if (showHome) return 'Home Screen'

  const group = getGroupForTab(activeTab)
  const tabItem = group?.items.find((item) => item.id === activeTab)
  const parts = []
  if (group) parts.push(group.label)
  if (tabItem) parts.push(tabItem.name)
  if (subPage) parts.push(subPage)
  return parts.join(' → ') || activeTab
}

function getInitialPos() {
  try {
    const saved = localStorage.getItem('feedbackBtnPos')
    if (saved) {
      const parsed = JSON.parse(saved)
      // Clamp to current viewport in case window was resized
      return {
        x: Math.min(Math.max(0, parsed.x), window.innerWidth - 100),
        y: Math.min(Math.max(0, parsed.y), window.innerHeight - 60),
      }
    }
  } catch {}
  return { x: window.innerWidth - 90, y: window.innerHeight - 90 }
}

function FeedbackWidget({ showHome, showLanding, activeTab, subPage }) {
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [messageError, setMessageError] = useState('')
  const modalRef = useRef(null)

  // Draggable state
  const [pos, setPos] = useState(getInitialPos)
  const [dragging, setDragging] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPos, setTooltipPos] = useState(null)
  const hasDragged = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const buttonRef = useRef(null)
  const tooltipRef = useRef(null)

  const pageContext = getPageContext({ showHome, showLanding, activeTab, subPage })

  // --- Drag: mouse handlers ---
  const onMouseDown = (e) => {
    setDragging(true)
    setShowTooltip(false)
    hasDragged.current = false
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onMouseMove = (e) => {
      hasDragged.current = true
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragStart.current.x), window.innerWidth - 100),
        y: Math.min(Math.max(0, e.clientY - dragStart.current.y), window.innerHeight - 60),
      })
    }
    const onMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging])

  // --- Drag: touch handlers ---
  const onTouchStart = (e) => {
    const touch = e.touches[0]
    setDragging(true)
    hasDragged.current = false
    dragStart.current = { x: touch.clientX - pos.x, y: touch.clientY - pos.y }
  }

  useEffect(() => {
    if (!dragging) return
    const onTouchMove = (e) => {
      e.preventDefault()
      hasDragged.current = true
      const touch = e.touches[0]
      setPos({
        x: Math.min(Math.max(0, touch.clientX - dragStart.current.x), window.innerWidth - 100),
        y: Math.min(Math.max(0, touch.clientY - dragStart.current.y), window.innerHeight - 60),
      })
    }
    const onTouchEnd = () => setDragging(false)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [dragging])

  // --- Save position to localStorage after drag ends ---
  useEffect(() => {
    if (!dragging && hasDragged.current) {
      localStorage.setItem('feedbackBtnPos', JSON.stringify(pos))
    }
  }, [dragging])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKey(e) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  // Auto-close after success
  useEffect(() => {
    if (status !== 'success') return
    const timer = setTimeout(() => {
      setIsOpen(false)
      // Reset form after close animation
      setTimeout(() => {
        setStatus('idle')
        setType('bug')
        setMessage('')
        setEmail('')
        setMessageError('')
      }, 300)
    }, 2500)
    return () => clearTimeout(timer)
  }, [status])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Tooltip positioning
  useLayoutEffect(() => {
    if (!showTooltip || !buttonRef.current) return
    const r = buttonRef.current.getBoundingClientRect()
    setTooltipPos({ left: r.left + r.width / 2, top: r.top - 10 })
  }, [showTooltip, pos])

  function handleMouseEnter() {
    if (!dragging && !isOpen) setShowTooltip(true)
  }

  function handleMouseLeave() {
    setShowTooltip(false)
  }

  function handleOpen() {
    if (hasDragged.current) return
    setShowTooltip(false)
    setIsOpen(true)
    setStatus('idle')
    setMessageError('')
  }

  function handleClose() {
    if (status === 'sending') return
    setIsOpen(false)
    // Reset after animation
    setTimeout(() => {
      if (status === 'success') {
        setStatus('idle')
        setType('bug')
        setMessage('')
        setEmail('')
        setMessageError('')
      }
    }, 300)
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (message.trim().length < 10) {
      setMessageError('Please describe the issue (at least 10 characters)')
      return
    }
    setMessageError('')
    setStatus('sending')

    try {
      const res = await fetch(
        `https://formspree.io/f/${import.meta.env.FORMSPREE_ID}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            page: pageContext,
            message: message.trim(),
            email: email.trim() || 'Not provided',
            timestamp: new Date().toISOString(),
          }),
        }
      )

      if (!res.ok) throw new Error('Failed to send')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div
        ref={buttonRef}
        className={`feedback-bubble-wrap${dragging ? ' feedback-bubble-dragging' : ''}`}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Share Feedback"
        style={{
          left: pos.x,
          top: pos.y,
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        <div className="feedback-bubble-large" />
        <div className="feedback-bubble-small">
          <span />
          <span />
          <span />
        </div>
      </div>

      {showTooltip && !dragging && tooltipPos && createPortal(
        <span
          ref={tooltipRef}
          className="feedback-tooltip"
          style={{ left: tooltipPos.left, top: tooltipPos.top }}
        >
          Share Feedback
        </span>,
        document.body
      )}

      {isOpen && (
        <div className="feedback-backdrop" onClick={handleBackdropClick}>
          <div className="feedback-modal" ref={modalRef} role="dialog" aria-modal="true">
            <button className="feedback-close" onClick={handleClose} aria-label="Close feedback">
              ✕
            </button>

            {status === 'success' ? (
              <div className="feedback-success">
                <div className="feedback-success-icon">✅</div>
                <div className="feedback-success-title">Thank you! We'll look into it.</div>
                <div className="feedback-success-subtitle">
                  Your feedback helps make AI Decoded better
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="feedback-title">💬 Share Feedback</h2>
                <p className="feedback-subtitle">Found a bug or outdated info? Let us know!</p>

                <div className="feedback-types">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`feedback-type-btn ${type === t.id ? 'feedback-type-active' : ''}`}
                      onClick={() => setType(t.id)}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="feedback-field">
                  <label className="feedback-label">Where are you?</label>
                  <div className="feedback-page-context">{pageContext}</div>
                </div>

                <div className="feedback-field">
                  <label className="feedback-label" htmlFor="feedback-message">Message</label>
                  <textarea
                    id="feedback-message"
                    className={`feedback-textarea ${messageError ? 'feedback-textarea-error' : ''}`}
                    placeholder={PLACEHOLDERS[type]}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (messageError && e.target.value.trim().length >= 10) {
                        setMessageError('')
                      }
                    }}
                  />
                  {messageError && (
                    <div className="feedback-error">{messageError}</div>
                  )}
                </div>

                <div className="feedback-field">
                  <label className="feedback-label" htmlFor="feedback-email">Email (optional)</label>
                  <input
                    id="feedback-email"
                    className="feedback-input"
                    type="email"
                    placeholder="your@email.com (optional, for follow-up)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="feedback-submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Feedback →'}
                </button>

                {status === 'error' && (
                  <div className="feedback-error feedback-submit-error">
                    Couldn't send feedback. Please try again.
                  </div>
                )}

                <button
                  type="button"
                  className="feedback-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FeedbackWidget
