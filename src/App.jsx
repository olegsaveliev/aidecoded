import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { encode } from 'gpt-tokenizer'
import Tokenizer from './Tokenizer.jsx'
import Generation from './Generation.jsx'
import HowLLMsWork from './HowLLMsWork.jsx'
import ModelTraining from './ModelTraining.jsx'
import PromptEngineering from './PromptEngineering.jsx'
import ContextEngineering from './ContextEngineering.jsx'
import RAG from './RAG.jsx'
import MachineLearning from './MachineLearning.jsx'
import LandingPage from './LandingPage.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import HomeScreen from './HomeScreen.jsx'
import NavDropdown from './NavDropdown.jsx'
import Breadcrumb from './Breadcrumb.jsx'
import TypewriterTitle from './TypewriterTitle.jsx'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import logoImg from './assets/logo_dark.png'
import './App.css'

const API_KEY = import.meta.env.OPENAI_API_KEY

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']

function estimateTokens(text) {
  if (!text) return 0
  try {
    return encode(text).length
  } catch {
    return Math.ceil(text.length / 4)
  }
}

const BOOT_LINES = [
  '> Initializing AI Decoded...',
  '> Loading modules...',
  '> Ready.',
]
const BOOT_CHAR_DELAY = 30

function BootScreen({ fadingOut, onComplete }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [lines, setLines] = useState([])
  const completedRef = useRef(false)

  useEffect(() => {
    if (lineIndex >= BOOT_LINES.length) {
      if (!completedRef.current) {
        completedRef.current = true
        const timer = setTimeout(onComplete, 400)
        return () => clearTimeout(timer)
      }
      return
    }

    const currentLine = BOOT_LINES[lineIndex]
    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => setCharIndex((c) => c + 1), BOOT_CHAR_DELAY)
      return () => clearTimeout(timer)
    }

    // Line done — pause briefly then move to next
    const timer = setTimeout(() => {
      setLines((prev) => [...prev, currentLine])
      setLineIndex((l) => l + 1)
      setCharIndex(0)
    }, 200)
    return () => clearTimeout(timer)
  }, [lineIndex, charIndex, onComplete])

  const isTyping = lineIndex < BOOT_LINES.length
  const currentPartial = isTyping ? BOOT_LINES[lineIndex].slice(0, charIndex) : ''

  return (
    <div className={`boot-screen ${fadingOut ? 'boot-screen-fadeout' : ''}`}>
      <div className="boot-terminal">
        {lines.map((line, i) => (
          <div key={i} className="boot-line">{line}</div>
        ))}
        {isTyping && (
          <div className="boot-line">
            {currentPartial}
            <span className="boot-cursor">|</span>
          </div>
        )}
      </div>
    </div>
  )
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
    localStorage.setItem('theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const [showLanding, setShowLanding] = useState(true)
  const [fadingOut, setFadingOut] = useState(false)
  const [showBootScreen, setShowBootScreen] = useState(false)
  const [bootFadingOut, setBootFadingOut] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const [homeTransition, setHomeTransition] = useState(false)

  function handleGetStarted() {
    setFadingOut(true)
    setTimeout(() => {
      setShowLanding(false)
      setFadingOut(false)
      setShowBootScreen(true)
    }, 500)
  }

  function handleLandingTabSelect(tabId) {
    setFadingOut(true)
    setTimeout(() => {
      setShowLanding(false)
      setFadingOut(false)
      setShowHome(false)
      setActiveTab(tabId)
    }, 500)
  }

  function handleBootComplete() {
    setBootFadingOut(true)
    setTimeout(() => {
      setShowBootScreen(false)
      setBootFadingOut(false)
      setShowHome(true)
    }, 500)
  }

  function handleGoHome() {
    setHomeTransition(true)
    setSubPage(null)
    setTimeout(() => {
      setShowHome(true)
      setHomeTransition(false)
    }, 200)
  }

  function handleSelectTab(tab) {
    setHomeTransition(true)
    setSubPage(null)
    setTimeout(() => {
      setShowHome(false)
      setActiveTab(tab)
      setHomeTransition(false)
    }, 200)
  }

  function handleTabReset(tabId) {
    setSubPage(null)
    setTabKey((k) => k + 1)
  }

  const [activeTab, setActiveTab] = useState('playground')
  const [subPage, setSubPage] = useState(null)
  const [navGroupToOpen, setNavGroupToOpen] = useState(null)
  const [tabKey, setTabKey] = useState(0)
  const [model, setModel] = useState('gpt-4o-mini')

  const [systemPrompt, setSystemPrompt] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  const [topP, setTopP] = useState(1)

  const [showPlaygroundEntry, setShowPlaygroundEntry] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  // Reset entry screen when navigating to playground tab
  useEffect(() => {
    if (activeTab === 'playground') {
      setShowPlaygroundEntry(true)
    }
  }, [activeTab])

  const [showWelcome, setShowWelcome] = useState(true)
  const [showLearnTip, setShowLearnTip] = useState(false)
  const [learnTipFading, setLearnTipFading] = useState(false)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)
  const learnTipTimer = useRef(null)
  const headerCanvasRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Header neural network animation
  useEffect(() => {
    const canvas = headerCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    const PARTICLE_COUNT = 30
    const CONNECTION_DIST = 100

    function resize() {
      const header = canvas.parentElement
      canvas.width = header.offsetWidth
      canvas.height = header.offsetHeight
    }

    function initParticles() {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 0.5,
        })
      }
    }

    function getThemeColors() {
      const style = getComputedStyle(document.documentElement)
      return {
        particleFill: style.getPropertyValue('--particle-fill').trim(),
        particleLine: style.getPropertyValue('--particle-line').trim(),
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const colors = getThemeColors()

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
            const baseOpacity = isDark ? 0.1 : 0.05
            const opacity = (1 - dist / CONNECTION_DIST) * baseOpacity
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = isDark ? `rgba(168, 162, 158, ${opacity})` : `rgba(0, 113, 227, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = colors.particleFill
        ctx.fill()
      }
    }

    function update() {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }
    }

    function loop() {
      update()
      draw()
      animId = requestAnimationFrame(loop)
    }

    function handleResize() {
      resize()
      initParticles()
    }

    resize()
    initParticles()
    loop()

    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [showLanding])

  const totalTokens = useMemo(() => {
    let total = 0
    if (systemPrompt.trim()) total += estimateTokens(systemPrompt)
    for (const msg of messages) {
      total += estimateTokens(msg.content) + 4
    }
    if (input.trim()) total += estimateTokens(input)
    return total
  }, [systemPrompt, messages, input])

  async function handleSend() {
    const text = input.trim()
    if (!text) return
    if (!API_KEY || API_KEY === 'your-api-key-here') {
      setError('Please set your OpenAI API key in the .env file.')
      return
    }

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError('')

    const apiMessages = []
    if (systemPrompt.trim()) {
      apiMessages.push({ role: 'system', content: systemPrompt.trim() })
    }
    apiMessages.push(
      ...updatedMessages.map((m) => ({ role: m.role, content: m.content }))
    )

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(
          errData?.error?.message || `API error: ${res.status} ${res.statusText}`
        )
      }

      const data = await res.json()
      const assistantMsg = {
        role: 'assistant',
        content: data.choices[0].message.content,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleClear() {
    setMessages([])
    setError('')
  }

  function handleExport() {
    if (messages.length === 0) return
    let text = ''
    if (systemPrompt.trim()) {
      text += `[System]\n${systemPrompt.trim()}\n\n`
    }
    for (const msg of messages) {
      const label = msg.role === 'user' ? 'You' : 'Assistant'
      text += `[${label}]\n${msg.content}\n\n`
    }
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Show learning tip after first AI response
  useEffect(() => {
    if (messages.length === 2 && messages[1].role === 'assistant') {
      setShowLearnTip(true)
      learnTipTimer.current = setTimeout(() => {
        setLearnTipFading(true)
        setTimeout(() => {
          setShowLearnTip(false)
          setLearnTipFading(false)
        }, 400)
      }, 8000)
    }
    return () => {
      if (learnTipTimer.current) clearTimeout(learnTipTimer.current)
    }
  }, [messages.length])

  function dismissLearnTip() {
    if (learnTipTimer.current) clearTimeout(learnTipTimer.current)
    setLearnTipFading(true)
    setTimeout(() => {
      setShowLearnTip(false)
      setLearnTipFading(false)
    }, 400)
  }

  function handleSuggestion(text) {
    setInput(text)
    setTimeout(() => {
      setInput(text)
      const fakeEvent = { trim: () => text }
      // Trigger send directly
      handleSendDirect(text)
    }, 0)
  }

  async function handleSendDirect(text) {
    if (!text) return
    if (!API_KEY || API_KEY === 'your-api-key-here') {
      setError('Please set your OpenAI API key in the .env file.')
      return
    }

    const userMsg = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    setError('')

    const apiMessages = []
    if (systemPrompt.trim()) {
      apiMessages.push({ role: 'system', content: systemPrompt.trim() })
    }
    apiMessages.push(
      ...updatedMessages.map((m) => ({ role: m.role, content: m.content }))
    )

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: apiMessages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(
          errData?.error?.message || `API error: ${res.status} ${res.statusText}`
        )
      }

      const data = await res.json()
      const assistantMsg = {
        role: 'assistant',
        content: data.choices[0].message.content,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const showSidebar = !showHome && activeTab === 'playground'

  if (showLanding) {
    return <LandingPage fadingOut={fadingOut} onGetStarted={handleGetStarted} onSelectTab={handleLandingTabSelect} darkMode={darkMode} setDarkMode={setDarkMode} />
  }

  if (showBootScreen) {
    return <BootScreen fadingOut={bootFadingOut} onComplete={handleBootComplete} />
  }

  return (
    <div className={`app ${!showSidebar ? 'app-no-sidebar' : ''} app-fade-in`}>
      <NeuronBackground />
      {showSidebar && (
        <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <button
            className="sidebar-toggle-mobile"
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            <span>Settings</span>
            <span>{sidebarCollapsed ? '\u25BC' : '\u25B2'}</span>
          </button>
          <div className="sidebar-section">
            <h2>
              Model
              <Tooltip text="GPT-4o is smarter but slower. GPT-4o-mini is faster and cheaper. GPT-3.5-turbo is the classic model — fast and affordable. Great for learning!" />
            </h2>
            <select
              className="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <h2>Parameters</h2>

            <label className="slider-label">
              <span className="slider-name">
                Temperature
                <Tooltip text="Controls creativity. Low (0.1) = predictable and factual. High (1.5) = creative and surprising. Start at 0.7." />
              </span>
              <span className="slider-value">{temperature.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
            />

            <label className="slider-label">
              <span className="slider-name">
                Max Tokens
                <Tooltip text="Maximum length of the AI response. 1 token ≈ 4 characters. 500 tokens ≈ 375 words." />
              </span>
              <span className="slider-value">{maxTokens}</span>
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="10"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            />

            <label className="slider-label">
              <span className="slider-name">
                Top-p
                <Tooltip text="Works with temperature to control variety. Leave at 1.0 unless experimenting." />
              </span>
              <span className="slider-value">{topP.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={topP}
              onChange={(e) => setTopP(parseFloat(e.target.value))}
            />
          </div>

          <div className="sidebar-actions">
            <button
              className="sidebar-btn"
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              Export Chat
            </button>
            <button className="sidebar-btn sidebar-btn-danger" onClick={handleClear}>
              Clear Chat
            </button>
          </div>

        </aside>
      )}

      <main className="main">
        <header className="header header-grouped">
          <canvas ref={headerCanvasRef} className="header-canvas" />
          <div className="header-left">
            <div className="header-brand header-brand-clickable" onClick={handleGoHome} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}>
              <TypewriterTitle className="header-title" />
            </div>
          </div>
          <div className="header-center">
            <NavDropdown activeTab={activeTab} onSelectTab={handleSelectTab} showHome={showHome} openGroupRequest={navGroupToOpen} onGroupOpened={() => setNavGroupToOpen(null)} />
          </div>
          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={() => setDarkMode((d) => !d)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className={`theme-toggle-track ${darkMode ? 'theme-toggle-dark' : ''}`}>
                <span className="theme-toggle-icon theme-toggle-sun">☀️</span>
                <span className="theme-toggle-icon theme-toggle-moon">🌙</span>
                <span className="theme-toggle-thumb" />
              </span>
            </button>
          </div>
        </header>

        <div className={`tab-content-wrapper ${homeTransition ? 'tab-content-fading' : ''}`}>
        {showHome && (
          <>
            <Breadcrumb activeTab={activeTab} showHome={true} />
            <HomeScreen onSelectTab={handleSelectTab} />
          </>
        )}

        {!showHome && (
          <Breadcrumb
            activeTab={activeTab}
            showHome={false}
            subPage={subPage}
            onGoHome={handleGoHome}
            onGroupClick={(groupId) => setNavGroupToOpen(groupId)}
            onTabClick={handleTabReset}
          />
        )}

        {!showHome && activeTab === 'playground' && showPlaygroundEntry && messages.length === 0 && (
          <EntryScreen
            icon="💬"
            title="AI Playground"
            description="Chat directly with AI and experiment with temperature, model selection and parameters in real time. See how small changes dramatically affect responses."
            buttonText="Open Playground"
            onStart={() => setShowPlaygroundEntry(false)}
          />
        )}

        {!showHome && activeTab === 'playground' && !(showPlaygroundEntry && messages.length === 0) && (
          <div className="chat-container">
            {messages.length > 0 && (
              <button className="entry-start-over" onClick={() => { setMessages([]); setInput(''); setError(''); setShowPlaygroundEntry(true); setShowWelcome(true); }}>
                &larr; Start over
              </button>
            )}
            {showWelcome && (
              <div className="playground-welcome">
                <div className="playground-welcome-text">
                  <strong>Welcome to the Playground</strong> — This is where you talk directly to AI. Try changing the parameters on the left to see how they affect the responses. Start by typing a message below!
                </div>
                <button className="playground-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
              </div>
            )}

            <div className="system-prompt-area">
              <label htmlFor="system-prompt">
                System Prompt
                <Tooltip text={'This is your instruction to the AI before the conversation starts. Think of it as setting the AI\'s role or personality. Example: "You are a helpful IT assistant" or "You are a pirate"'} />
              </label>
              <textarea
                id="system-prompt"
                placeholder="You are a helpful assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={2}
              />
              <div className="system-prompt-presets">
                <button className="preset-btn" onClick={() => setSystemPrompt('You are a helpful assistant. Provide clear, concise answers.')}>Helpful Assistant</button>
                <button className="preset-btn" onClick={() => setSystemPrompt('You are an experienced IT expert. Give technical but accessible explanations.')}>IT Expert</button>
                <button className="preset-btn" onClick={() => setSystemPrompt('You are a patient teacher. Explain concepts step by step with examples.')}>Teacher</button>
              </div>
            </div>

            <div className="chat-messages">
              {messages.length === 0 && !loading && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--placeholder)' }}>
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <div className="chat-empty-title">Start a conversation</div>
                  <div className="chat-empty-subtitle">
                    Type a message below or set a system prompt above to begin
                  </div>
                  <div className="suggestion-chips">
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Explain quantum computing simply')}>Explain quantum computing simply</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Write a haiku about JavaScript')}>Write a haiku about JavaScript</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('What is the difference between AI and ML?')}>What is the difference between AI and ML?</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Pretend you are my IT consultant')}>Pretend you are my IT consultant</button>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-assistant'}`}
                >
                  <div className="chat-content">
                    {msg.role === 'assistant' ? (
                      <div className="markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <div className="chat-text">{msg.content}</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble chat-assistant">
                  <div className="chat-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              {error && <div className="error-msg">{error}</div>}
              {showLearnTip && (
                <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} onClick={dismissLearnTip}>
                  Try sliding Temperature to 1.5 and asking the same question again — notice how the response changes!
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-wrapper">
              <div className="chat-input-area">
                <textarea
                  ref={inputRef}
                  className="chat-input"
                  placeholder="Message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <div className="send-spinner" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="chat-input-meta">
                <span className="chat-token-count">
                  ~{totalTokens} tokens
                </span>
                <span className="chat-shortcut-hint">
                  Return to send &middot; Shift+Return for new line
                </span>
              </div>
            </div>
          </div>
        )}

        {!showHome && activeTab === 'tokenizer' && <Tokenizer onGoHome={handleGoHome} />}
        {!showHome && activeTab === 'generation' && (
          <Generation model={model} maxTokens={maxTokens} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'how-llms-work' && (
          <HowLLMsWork key={tabKey} model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={setActiveTab} onGoHome={handleGoHome} onSubPageChange={setSubPage} />
        )}
        {!showHome && activeTab === 'model-training' && (
          <ModelTraining onSwitchTab={setActiveTab} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'prompt-engineering' && (
          <PromptEngineering model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={setActiveTab} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'context-engineering' && (
          <ContextEngineering model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={setActiveTab} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'rag' && (
          <RAG model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={setActiveTab} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'machine-learning' && (
          <MachineLearning onSwitchTab={setActiveTab} onGoHome={handleGoHome} />
        )}
        </div>
      </main>
    </div>
  )
}

export default App
