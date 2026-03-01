import { useState, useEffect } from 'react'
import TypewriterTitle from './TypewriterTitle.jsx'
import NeuronNetwork from './NeuronNetwork.jsx'
import './LandingPage.css'

function LandingPage({ fadingOut, onGetStarted, onSelectTab, darkMode, setDarkMode }) {
  const [reveal, setReveal] = useState(false)
  const [titleDone, setTitleDone] = useState(false)

  // Mark body so CSS can hide theme toggle on mobile landing only
  useEffect(() => {
    document.body.classList.add('on-landing')
    return () => document.body.classList.remove('on-landing')
  }, [])

  // Trigger blur-reveal animation shortly after mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setReveal(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div className={`landing ${fadingOut ? 'landing-fade-out' : ''}`}>
      <NeuronNetwork fire={titleDone} onSelectTab={onSelectTab} />
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
      <div className={`landing-hero${reveal ? ' landing-reveal' : ''}`}>
        <TypewriterTitle
          delay={300}
          onComplete={() => setTitleDone(true)}
          className="landing-heading"
        />
        <p className={`landing-sub${titleDone ? ' landing-sub-in' : ''}`}>Your interactive journey into AI</p>
        <button className={`landing-cta${titleDone ? ' landing-cta-in' : ''}`} onClick={onGetStarted}>
          Explore All Modules &rarr;
        </button>
        <p className={`landing-hint${titleDone ? ' landing-hint-in' : ''}`}>Click any glowing node &mdash; locked ones require sign-in</p>
      </div>
    </div>
  )
}

export default LandingPage
