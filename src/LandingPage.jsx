import { useState, useEffect, useRef, useCallback } from 'react'
import TypewriterTitle from './TypewriterTitle.jsx'
import NeuralNetworkCanvas from './NeuralNetworkCanvas.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth, FREE_MODULES } from './AuthContext'
import './LandingPage.css'

const TAGLINE = 'Your interactive journey into AI'
const TAGLINE_CHAR_DELAY = 40

const MOBILE_MODULES = [
  { id: 'playground', label: 'Playground', color: '#0071E3' },
  { id: 'tokenizer', label: 'Tokenizer', color: '#AF52DE' },
  { id: 'how-llms-work', label: 'How LLMs Work', color: '#FF9500' },
  { id: 'generation', label: 'Generation', color: '#0071E3' },
  { id: 'prompt-engineering', label: 'Prompting', color: '#34C759' },
  { id: 'rag', label: 'RAG', color: '#FF9500' },
  { id: 'agentic-ai', label: 'Agentic AI', color: '#5856D6' },
  { id: 'deep-learning', label: 'Deep Learning', color: '#5856D6' },
  { id: 'fine-tuning', label: 'Fine-Tuning', color: '#5856D6' },
  { id: 'generative-ai', label: 'Generative AI', color: '#FF9500' },
  { id: 'ai-city-builder', label: 'City Builder', color: '#F59E0B' },
  { id: 'ai-lab-explorer', label: 'Lab Explorer', color: '#F59E0B' },
  { id: 'prompt-heist', label: 'Prompt Heist', color: '#F59E0B' },
  { id: 'token-budget', label: 'Token Budget', color: '#F59E0B' },
  { id: 'ai-ethics-tribunal', label: 'Ethics Tribunal', color: '#F59E0B' },
  { id: 'pm-simulator', label: 'PM Simulator', color: '#F59E0B' },
  { id: 'ai-native-pm', label: 'AI-Native PM', color: '#0EA5E9' },
]

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

function LandingPage({ fadingOut, onGetStarted, onSelectTab, darkMode, setDarkMode, onOpenAuth }) {
  const { user } = useAuth()
  const [titleDone, setTitleDone] = useState(false)
  const [taglineCharCount, setTaglineCharCount] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const mobileGridRef = useRef(null)
  const isMobile = useIsMobile()

  // Mark body so CSS can hide theme toggle on mobile landing only
  useEffect(() => {
    document.body.classList.add('on-landing')
    return () => document.body.classList.remove('on-landing')
  }, [])

  // Tagline typewriter
  useEffect(() => {
    if (!titleDone) return
    if (taglineCharCount >= TAGLINE.length) {
      // Brief pause before network appears
      const timer = setTimeout(() => setTypingDone(true), 400)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setTaglineCharCount((c) => c + 1), TAGLINE_CHAR_DELAY)
    return () => clearTimeout(timer)
  }, [titleDone, taglineCharCount])

  function handleNodeSelect(tabId) {
    if (onSelectTab) {
      onSelectTab(tabId)
    }
  }

  const scrollToModules = useCallback(() => {
    if (mobileGridRef.current) {
      mobileGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  return (
    <div className={`landing ${fadingOut ? 'landing-fade-out' : ''}`}>
      <NeuronBackground landing />
      {!isMobile && (
        <button
          className="header-icon-btn landing-theme-toggle"
          onClick={() => setDarkMode((d) => !d)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      )}
      <div className={`landing-content ${typingDone ? 'landing-typed' : ''}`}>
        {/* Desktop: TypewriterTitle as before */}
        <TypewriterTitle
          delay={300}
          onComplete={() => setTitleDone(true)}
          className="landing-title landing-title-desktop"
        />
        <p className="landing-tagline landing-tagline-desktop">
          {titleDone && TAGLINE.slice(0, taglineCharCount)}
          {titleDone && taglineCharCount < TAGLINE.length && <span className="typewriter-cursor">|</span>}
        </p>

        {/* Mobile hero section — typewriter sequence like desktop */}
        <div className="landing-mobile-hero">
          <ModuleIcon module="playground" size={48} style={{ color: 'var(--accent)' }} />
          <TypewriterTitle
            delay={300}
            onComplete={() => setTitleDone(true)}
            className="landing-mobile-hero-title"
          />
          <p className="landing-mobile-hero-tagline">
            {titleDone && TAGLINE.slice(0, taglineCharCount)}
            {titleDone && taglineCharCount < TAGLINE.length && <span className="typewriter-cursor">|</span>}
          </p>
          <button className={`entry-screen-btn landing-mobile-hero-cta${typingDone ? ' landing-mobile-hero-cta-in' : ''}`} onClick={scrollToModules}>
            Explore Modules &rarr;
          </button>
        </div>

        <div className="landing-network-wrapper">
          {typingDone && <NeuralNetworkCanvas onSelectTab={handleNodeSelect} />}
        </div>

        {/* Mobile module grid (phase 2) */}
        <div className="landing-mobile-grid" ref={mobileGridRef}>
          <div className="landing-mobile-grid-label">What you will learn</div>
          <div className="landing-mobile-grid-pills">
            {MOBILE_MODULES.map((m) => {
              const locked = !user && !FREE_MODULES.includes(m.id)
              return (
                <button
                  key={m.id}
                  className={`landing-mobile-pill${locked ? ' landing-mobile-pill-locked' : ''}`}
                  style={{ '--pill-color': m.color }}
                  onClick={() => locked ? onOpenAuth() : handleNodeSelect(m.id)}
                >
                  <span className="landing-mobile-pill-dot" style={{ background: locked ? 'var(--text-tertiary)' : m.color }} />
                  <span className="landing-mobile-pill-label">{m.label}</span>
                  {locked && (
                    <svg className="landing-mobile-pill-lock" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          {!user && (
            <button className="landing-mobile-signin" onClick={onOpenAuth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Sign in to track progress
            </button>
          )}
        </div>

        <button className="landing-cta" onClick={onGetStarted}>
          Explore All Modules &rarr;
        </button>
        <p className="landing-hint">Click any node to jump directly to a module</p>
      </div>
    </div>
  )
}

export default LandingPage
