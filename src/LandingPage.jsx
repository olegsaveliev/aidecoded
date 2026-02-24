import { useState, useEffect } from 'react'
import TypewriterTitle from './TypewriterTitle.jsx'
import NeuralNetworkCanvas from './NeuralNetworkCanvas.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import './LandingPage.css'

const TAGLINE = 'Your interactive journey into AI'
const TAGLINE_CHAR_DELAY = 40

const INTRO_LINES = [
  'Learn how AI really works',
  'Explore tokens, prompts & agents',
  'Build skills with hands-on modules',
]
const INTRO_CHAR_DELAY = 35

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth <= 768)
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return mobile
}

function LandingPage({ fadingOut, onGetStarted, onSelectTab, darkMode, setDarkMode }) {
  const [titleDone, setTitleDone] = useState(false)
  const [taglineCharCount, setTaglineCharCount] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const [mobilePhase, setMobilePhase] = useState(1) // 1 = hero, 2 = intro lines
  const [introLineIndex, setIntroLineIndex] = useState(0)
  const [introCharCount, setIntroCharCount] = useState(0)
  const [introAllDone, setIntroAllDone] = useState(false)
  const isMobile = useIsMobile()

  // Mark body so CSS can hide theme toggle on mobile landing only
  useEffect(() => {
    document.body.classList.add('on-landing')
    return () => document.body.classList.remove('on-landing')
  }, [])

  // Tagline typewriter (hero phase)
  useEffect(() => {
    if (!titleDone) return
    if (taglineCharCount >= TAGLINE.length) {
      const timer = setTimeout(() => setTypingDone(true), 400)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setTaglineCharCount((c) => c + 1), TAGLINE_CHAR_DELAY)
    return () => clearTimeout(timer)
  }, [titleDone, taglineCharCount])

  // Intro lines typewriter (phase 2)
  useEffect(() => {
    if (mobilePhase !== 2 || introAllDone) return
    const currentLine = INTRO_LINES[introLineIndex]
    if (introCharCount >= currentLine.length) {
      // Line done — pause, then move to next or finish
      const timer = setTimeout(() => {
        if (introLineIndex < INTRO_LINES.length - 1) {
          setIntroLineIndex((i) => i + 1)
          setIntroCharCount(0)
        } else {
          setIntroAllDone(true)
        }
      }, 400)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setIntroCharCount((c) => c + 1), INTRO_CHAR_DELAY)
    return () => clearTimeout(timer)
  }, [mobilePhase, introLineIndex, introCharCount, introAllDone])

  // Auto-transition to home after intro lines finish
  useEffect(() => {
    if (!introAllDone) return
    const timer = setTimeout(() => onGetStarted(), 800)
    return () => clearTimeout(timer)
  }, [introAllDone, onGetStarted])

  function handleNodeSelect(tabId) {
    if (onSelectTab) {
      onSelectTab(tabId)
    }
  }

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

        {/* Mobile phase 1: Hero with typewriter */}
        {mobilePhase === 1 && (
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
            <button
              className={`entry-screen-btn landing-mobile-hero-cta${typingDone ? ' landing-mobile-hero-cta-in' : ''}`}
              onClick={() => setMobilePhase(2)}
            >
              Explore Modules &rarr;
            </button>
          </div>
        )}

        {/* Mobile phase 2: Intro taglines typing out */}
        {mobilePhase === 2 && (
          <div className="landing-mobile-intro">
            {INTRO_LINES.map((line, i) => (
              <p key={i} className={`landing-mobile-intro-line${i <= introLineIndex ? ' landing-mobile-intro-line-visible' : ''}`}>
                {i < introLineIndex
                  ? line
                  : i === introLineIndex
                    ? <>
                        {line.slice(0, introCharCount)}
                        {introCharCount < line.length && <span className="typewriter-cursor">|</span>}
                      </>
                    : ''
                }
              </p>
            ))}
          </div>
        )}

        <div className="landing-network-wrapper">
          {typingDone && <NeuralNetworkCanvas onSelectTab={handleNodeSelect} />}
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
