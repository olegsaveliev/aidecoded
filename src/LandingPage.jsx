import { useState, useEffect } from 'react'
import TypewriterTitle from './TypewriterTitle.jsx'
import NeuralNetworkCanvas from './NeuralNetworkCanvas.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { LockIcon } from './ContentIcons.jsx'
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
  { id: 'ai-city-builder', label: 'City Builder', color: '#F59E0B' },
  { id: 'ai-lab-explorer', label: 'Lab Explorer', color: '#F59E0B' },
  { id: 'prompt-heist', label: 'Prompt Heist', color: '#F59E0B' },
  { id: 'token-budget', label: 'Token Budget', color: '#F59E0B' },
  { id: 'ai-ethics-tribunal', label: 'Ethics Tribunal', color: '#F59E0B' },
]

function LandingPage({ fadingOut, onGetStarted, onSelectTab, darkMode, setDarkMode }) {
  const { user } = useAuth()
  const [titleDone, setTitleDone] = useState(false)
  const [taglineCharCount, setTaglineCharCount] = useState(0)
  const [typingDone, setTypingDone] = useState(false)

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

  return (
    <div className={`landing ${fadingOut ? 'landing-fade-out' : ''}`}>
      <NeuronBackground landing />
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
      <div className={`landing-content ${typingDone ? 'landing-typed' : ''}`}>
        <TypewriterTitle
          delay={300}
          onComplete={() => setTitleDone(true)}
          className="landing-title"
        />
        <p className="landing-tagline">
          {titleDone && TAGLINE.slice(0, taglineCharCount)}
          {titleDone && taglineCharCount < TAGLINE.length && <span className="typewriter-cursor">|</span>}
        </p>

        <div className="landing-network-wrapper">
          {typingDone && <NeuralNetworkCanvas onSelectTab={handleNodeSelect} />}
        </div>

        {typingDone && (
          <div className="landing-mobile-grid">
            {MOBILE_MODULES.map((m) => {
              const locked = !user && !FREE_MODULES.includes(m.id)
              return (
                <button key={m.id} className={`landing-mobile-card${locked ? ' landing-mobile-card-locked' : ''}`} onClick={() => handleNodeSelect(m.id)}>
                  {locked && (
                    <span className="landing-mobile-card-lock">
                      <LockIcon size={12} color="var(--text-tertiary, #86868b)" />
                    </span>
                  )}
                  <div className="landing-mobile-card-icon"><ModuleIcon module={m.id} size={28} style={{ color: m.color }} /></div>
                  <div className="landing-mobile-card-label">{m.label}</div>
                </button>
              )
            })}
          </div>
        )}

        <button className="landing-cta" onClick={onGetStarted}>
          Explore All Modules &rarr;
        </button>
        <p className="landing-hint">Click any node to jump directly to a module</p>
      </div>
    </div>
  )
}

export default LandingPage
