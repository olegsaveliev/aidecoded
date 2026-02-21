import { useState, useEffect, useRef } from 'react'

const TARGET = '<AI Decoded />'
const BLUE_CHARS = new Set(['<', '/', '>'])
const CHAR_DELAY = 80

function TypewriterTitle({ delay = 0, onComplete, className }) {
  const [charCount, setCharCount] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [started, setStarted] = useState(delay === 0)
  const completeCalled = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (delay === 0) return
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started || charCount >= TARGET.length) return
    const timer = setTimeout(() => setCharCount((c) => c + 1), CHAR_DELAY)
    return () => clearTimeout(timer)
  }, [started, charCount])

  useEffect(() => {
    if (charCount < TARGET.length) return
    setShowCursor(false)
    if (!completeCalled.current) {
      completeCalled.current = true
      onCompleteRef.current?.()
    }
  }, [charCount])

  return (
    <h1 className={className}>
      {TARGET.slice(0, charCount).split('').map((ch, i) => (
        <span
          key={i}
          style={BLUE_CHARS.has(ch) ? { color: 'var(--accent)' } : undefined}
        >
          {ch}
        </span>
      ))}
      {showCursor && started && <span className="typewriter-cursor">|</span>}
    </h1>
  )
}

export default TypewriterTitle
