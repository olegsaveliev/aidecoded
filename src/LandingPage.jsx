import { useState, useEffect } from 'react'
import TypewriterTitle from './TypewriterTitle.jsx'
import NeuralNetworkCanvas from './NeuralNetworkCanvas.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import './LandingPage.css'

const TAGLINE = 'Your interactive journey into AI'
const TAGLINE_CHAR_DELAY = 40

const MOBILE_MODULES = [
  { id: 'playground', icon: '\uD83D\uDCAC', label: 'Playground' },
  { id: 'tokenizer', icon: '\uD83E\uDDE9', label: 'Tokenizer' },
  { id: 'how-llms-work', icon: '\uD83E\uDDE0', label: 'How LLMs Work' },
  { id: 'generation', icon: '\u2728', label: 'Generation' },
  { id: 'prompt-engineering', icon: '\uD83C\uDFAF', label: 'Prompting' },
  { id: 'rag', icon: '\uD83D\uDD0D', label: 'RAG' },
]

function LandingPage({ fadingOut, onGetStarted, onSelectTab, darkMode, setDarkMode }) {
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
        className="theme-toggle landing-theme-toggle"
        onClick={() => setDarkMode((d) => !d)}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className={`theme-toggle-track ${darkMode ? 'theme-toggle-dark' : ''}`}>
          <span className="theme-toggle-icon theme-toggle-sun">{'\u2600\uFE0F'}</span>
          <span className="theme-toggle-icon theme-toggle-moon">{'\u{1F319}'}</span>
          <span className="theme-toggle-thumb" />
        </span>
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
            {MOBILE_MODULES.map((m) => (
              <button key={m.id} className="landing-mobile-card" onClick={() => handleNodeSelect(m.id)}>
                <div className="landing-mobile-card-icon">{m.icon}</div>
                <div className="landing-mobile-card-label">{m.label}</div>
              </button>
            ))}
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
