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
import AgenticAI from './AgenticAI.jsx'
import MachineLearning from './MachineLearning.jsx'
import DeepLearning from './DeepLearning.jsx'
import FineTuning from './FineTuning.jsx'
import GenerativeAI from './GenerativeAI.jsx'
import AICityBuilder from './AICityBuilder.jsx'
import AILabExplorer from './AILabExplorer.jsx'
import PromptHeist from './PromptHeist.jsx'
import TokenBudget from './TokenBudget.jsx'
import AIEthicsTribunal from './AIEthicsTribunal.jsx'
import PMSimulator from './PMSimulator.jsx'
import AINativePM from './AINativePM.jsx'
import AISafety from './AISafety.jsx'
import AIFluency from './AIFluency.jsx'
import AIStartupSimulator from './AIStartupSimulator.jsx'
import PrecisionRecall from './PrecisionRecall.jsx'
import RAGUnderTheHood from './RAGUnderTheHood.jsx'
import AIInProduction from './AIInProduction.jsx'
import AlignmentGame from './AlignmentGame.jsx'
import NeuralNetworks from './NeuralNetworks.jsx'
import ChoosingAIModel from './ChoosingAIModel.jsx'
import UserProfile from './UserProfile.jsx'
import LandingPage from './LandingPage.jsx'
import NeuronBackground from './NeuronBackground.jsx'
import HomeScreen from './HomeScreen.jsx'
import NavDropdown from './NavDropdown.jsx'
import Breadcrumb from './Breadcrumb.jsx'
import FeedbackWidget from './FeedbackWidget.jsx'
import TypewriterTitle from './TypewriterTitle.jsx'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import AuthModal from './AuthModal.jsx'
import { useAuth, FREE_MODULES } from './AuthContext'
import { UserIcon, SignOutIcon } from './ContentIcons.jsx'
import ALL_MODULES from './moduleData.js'
import logoImg from './assets/logo_dark.png'
import './App.css'

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

const VALID_TABS = [
  'home', 'playground', 'tokenizer', 'generation',
  'how-llms-work', 'model-training', 'machine-learning',
  'deep-learning', 'fine-tuning', 'prompt-engineering',
  'context-engineering', 'rag', 'generative-ai',
  'agentic-ai', 'ai-native-pm', 'ai-city-builder',
  'ai-lab-explorer', 'prompt-heist', 'token-budget',
  'ai-ethics-tribunal', 'pm-simulator', 'ai-safety', 'ai-fluency',
  'ai-startup-simulator', 'precision-recall', 'rag-under-the-hood', 'ai-in-production',
  'alignment-game', 'choosing-ai-model', 'neural-networks',
  'profile'
]

function getTabFromUrl() {
  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  if (tab && VALID_TABS.includes(tab)) return tab
  return null
}

const AUTH_UNLOCK_MESSAGE = 'Create a free account to unlock all modules'

function App() {
  const { user, loading: authLoading, signOut, isModuleLocked, markModuleStarted, markModuleComplete } = useAuth()
  const skipPush = useRef(false)
  const showLandingRef = useRef(false)
  const isModuleLockedRef = useRef(isModuleLocked)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authUnlockMessage, setAuthUnlockMessage] = useState('')
  const [showAvatarDropdown, setShowAvatarDropdown] = useState(false)

  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  )

  // Suppress transitions on initial mount to prevent theme animation flash
  useEffect(() => {
    document.documentElement.classList.add('no-transitions')
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('no-transitions')
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Disable all transitions so theme switches instantly (no partial flash)
    document.documentElement.classList.add('no-transitions')
    const theme = darkMode ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.style.colorScheme = theme
    const bg = darkMode ? '#1C1917' : '#ffffff'
    document.documentElement.style.backgroundColor = bg
    document.body.style.backgroundColor = bg
    localStorage.setItem('theme', theme)
    // Update browser chrome color (status bar, toolbar)
    // Strategy: setAttribute first (works on Android Chrome immediately),
    // then remove+recreate after a real delay (iOS Safari ignores setAttribute).
    const themeColor = darkMode ? '#1C1917' : '#ffffff'
    const existingMeta = document.querySelector('meta[name="theme-color"]')
    if (existingMeta) {
      existingMeta.setAttribute('content', themeColor)
    }
    // iOS Safari needs remove+recreate with a real timeout (not just rAF)
    const metaTimer = setTimeout(() => {
      const oldMeta = document.querySelector('meta[name="theme-color"]')
      if (oldMeta) oldMeta.remove()
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      newMeta.content = themeColor
      document.head.appendChild(newMeta)
    }, 50)
    // Re-enable transitions after theme is fully applied
    const transTimer = setTimeout(() => {
      document.documentElement.classList.remove('no-transitions')
    }, 100)
    return () => {
      clearTimeout(metaTimer)
      clearTimeout(transTimer)
    }
  }, [darkMode])

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!showAvatarDropdown) return
    function handleClick() { setShowAvatarDropdown(false) }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [showAvatarDropdown])

  const [feedbackMinimized, setFeedbackMinimized] = useState(() => !!sessionStorage.getItem('feedbackMinimized'))

  function handleFeedbackMinimize() {
    setFeedbackMinimized(true)
    sessionStorage.setItem('feedbackMinimized', 'true')
  }

  function handleFeedbackRestore() {
    setFeedbackMinimized(false)
    sessionStorage.removeItem('feedbackMinimized')
  }

  const [pendingAuthReturn, setPendingAuthReturn] = useState(() => {
    const tab = sessionStorage.getItem('auth_return_tab')
    // Only honor pendingAuthReturn during real OAuth redirects (URL has auth params).
    // Otherwise it's stale from a previous failed attempt — clear it.
    if (tab && !window.location.hash.includes('access_token') && !window.location.search.includes('code=')) {
      sessionStorage.removeItem('auth_return_tab')
      return null
    }
    return tab
  })

  // Restore navigation state: URL param > sessionStorage > default
  const urlTab = pendingAuthReturn ? null : getTabFromUrl()

  function readNav() {
    if (pendingAuthReturn) return null
    if (urlTab === 'home') return { activeTab: 'playground', showHome: true }
    if (urlTab) return { activeTab: urlTab, showHome: false }
    try { return JSON.parse(sessionStorage.getItem('nav_state')) } catch { return null }
  }

  const [showLanding, setShowLanding] = useState(() => readNav() ? false : pendingAuthReturn === 'landing' ? true : !pendingAuthReturn)
  const [fadingOut, setFadingOut] = useState(false)
  const [showBootScreen, setShowBootScreen] = useState(false)
  const [bootFadingOut, setBootFadingOut] = useState(false)
  const [showHome, setShowHome] = useState(() => readNav()?.showHome ?? (pendingAuthReturn === 'home' ? true : false))
  const [homeTransition, setHomeTransition] = useState(false)

  // Keep refs in sync for popstate handler (avoids stale closures)
  showLandingRef.current = showLanding
  isModuleLockedRef.current = isModuleLocked

  function handleGetStarted() {
    setFadingOut(true)
    setTimeout(() => {
      setShowLanding(false)
      setFadingOut(false)
      setShowBootScreen(true)
    }, 500)
  }

  function handleLandingTabSelect(tabId) {
    if (isModuleLocked(tabId)) {
      sessionStorage.setItem('auth_return_tab', tabId)
      setAuthUnlockMessage(AUTH_UNLOCK_MESSAGE)
      setShowAuthModal(true)
      return
    }
    setFadingOut(true)
    setTimeout(() => {
      setShowLanding(false)
      setFadingOut(false)
      setShowHome(false)
      setActiveTab(tabId)
      navigateTo(tabId)
    }, 500)
  }

  function handleBootComplete() {
    setBootFadingOut(true)
    setTimeout(() => {
      setShowBootScreen(false)
      setBootFadingOut(false)
      setShowHome(true)
      navigateTo('home')
    }, 500)
  }

  function scrollAllToTop() {
    // Reset all scroll containers (tab-content-wrapper → ancestors) then window
    let el = document.querySelector('.tab-content-wrapper') || document.querySelector('.app')
    while (el) {
      if (el.scrollTop > 0) el.scrollTop = 0
      el = el.parentElement
    }
    window.scrollTo(0, 0)
  }

  // Push tab to browser history (query param ?tab=)
  function navigateTo(tab) {
    if (skipPush.current) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === tab) return
    const url = (!tab || tab === 'home')
      ? window.location.pathname
      : window.location.pathname + '?tab=' + tab
    window.history.pushState({ tab: tab || 'home' }, '', url)
  }

  // Sync initial history entry so first back works correctly
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const currentTab = params.get('tab') || (showLanding ? null : showHome ? 'home' : activeTab)
    if (currentTab) {
      window.history.replaceState({ tab: currentTab }, '', window.location.href)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Browser back/forward navigation via popstate
  useEffect(() => {
    function onPopState(event) {
      const tab = event.state?.tab
      skipPush.current = true
      if (!tab || tab === 'home') {
        if (showLandingRef.current) {
          // Already on landing, nothing to do
        } else {
          setShowHome(true)
          setShowBootScreen(false)
          setHomeFilter(null)

        }
      } else if (VALID_TABS.includes(tab)) {
        if (isModuleLockedRef.current(tab)) {
          setShowHome(true)
          setHomeFilter(null)
        } else {
          setShowLanding(false)
          setShowBootScreen(false)
          setShowHome(false)
          setActiveTab(tab)
        }
    
      }
      scrollAllToTop()
      setTimeout(() => { skipPush.current = false }, 0)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleGoHome() {
    setHomeTransition(true)

    setHomeFilter(null)
    setTimeout(() => {
      setShowHome(true)
      setHomeTransition(false)
      scrollAllToTop()
      navigateTo('home')
    }, 200)
  }

  function handleBreadcrumbGroupClick(groupLabel) {
    setHomeTransition(true)

    setHomeFilter(groupLabel)
    setTimeout(() => {
      setShowHome(true)
      setHomeTransition(false)
      scrollAllToTop()
      navigateTo('home')
    }, 200)
  }

  function handleSelectTab(tab) {
    if (isModuleLocked(tab)) {
      sessionStorage.setItem('auth_return_tab', tab)
      setAuthUnlockMessage(AUTH_UNLOCK_MESSAGE)
      setShowAuthModal(true)
      return
    }
    setHomeTransition(true)

    setTimeout(() => {
      setShowHome(false)
      setActiveTab(tab)
      setHomeTransition(false)
      scrollAllToTop()
      navigateTo(tab)
    }, 200)
  }

  function handleSwitchTab(tab) {
    if (isModuleLocked(tab)) {
      sessionStorage.setItem('auth_return_tab', tab)
      setAuthUnlockMessage(AUTH_UNLOCK_MESSAGE)
      setShowAuthModal(true)
      return
    }
    setShowHome(false)
    setActiveTab(tab)

    scrollAllToTop()
    navigateTo(tab)
  }

  const [activeTab, setActiveTab] = useState(() => {
    const nav = readNav()
    if (nav) return nav.activeTab
    // During OAuth redirect, start on the pending tab to avoid a flash
    if (pendingAuthReturn && pendingAuthReturn !== 'landing' && pendingAuthReturn !== 'home') return pendingAuthReturn
    return 'playground'
  })

  // Restore tab after OAuth redirect
  useEffect(() => {
    if (!pendingAuthReturn) return
    if (user) {
      sessionStorage.removeItem('auth_return_tab')
      setPendingAuthReturn(null)
      if (pendingAuthReturn === 'landing' || pendingAuthReturn === 'home') {
        setShowLanding(false)
        setShowHome(true)
        navigateTo('home')
      } else {
        setShowHome(false)
        setActiveTab(pendingAuthReturn)
        navigateTo(pendingAuthReturn)
      }
      return
    }
    // Fallback: if user never appears after 3s, show landing
    const timeout = setTimeout(() => {
      sessionStorage.removeItem('auth_return_tab')
      setPendingAuthReturn(null)
      setShowLanding(true)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [user, pendingAuthReturn])

  // Guard: redirect locked modules to home for unauthenticated users (handles deep links + session expiry)
  // No modal — modal only appears on explicit user clicks (locked cards, nav items)
  useEffect(() => {
    if (authLoading) return
    if (!showHome && !showLanding && !FREE_MODULES.includes(activeTab) && !user) {
      setShowHome(true)
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [authLoading, activeTab, showHome, showLanding, user])

  // Persist navigation state for logged-in users
  useEffect(() => {
    if (user && !showLanding && !showBootScreen) {
      sessionStorage.setItem('nav_state', JSON.stringify({ activeTab, showHome }))
    }
    if (!user) {
      sessionStorage.removeItem('nav_state')
      sessionStorage.removeItem('module_stages')
      // Session expired while on profile — redirect to landing page
      if (activeTab === 'profile') {
        setShowLanding(true)
        setShowHome(false)
        window.history.replaceState(null, '', window.location.pathname)
      }
    }
  }, [user, activeTab, showHome, showLanding, showBootScreen])

  // Dynamic SEO: update document title and meta tags per module
  useEffect(() => {
    const base = 'AI Decoded'
    const defaultDesc = 'Learn how AI works through interactive tutorials and games. Tokenization, prompt engineering, RAG, agentic AI, deep learning and more — free.'
    let title = base
    let desc = defaultDesc

    if (showLanding) {
      title = `${base} — Interactive AI Learning Platform`
    } else if (showHome) {
      title = `${base} — Learn How AI Works`
    } else if (activeTab === 'profile') {
      title = `Profile — ${base}`
    } else {
      const mod = ALL_MODULES.find(m => m.id === activeTab)
      if (mod) {
        title = `${mod.title} — ${base}`
        desc = mod.description
      }
    }

    document.title = title

    const metaDesc = document.querySelector('meta[name="description"]')
    if (metaDesc) metaDesc.setAttribute('content', desc)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', desc)

    const ogUrl = document.querySelector('meta[property="og:url"]')
    if (ogUrl) {
      const url = activeTab && !showHome && !showLanding
        ? `https://www.aidecoded.academy/?tab=${activeTab}`
        : 'https://www.aidecoded.academy/'
      ogUrl.setAttribute('content', url)
    }
  }, [activeTab, showHome, showLanding])

  // Inject JSON-LD structured data from ALL_MODULES (auto-syncs with moduleData.js)
  useEffect(() => {
    const SITE = 'https://www.aidecoded.academy'
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'AI Decoded',
          url: `${SITE}/`,
          description: 'Interactive platform for learning how AI and Large Language Models work through hands-on tutorials and games.',
        },
        {
          '@type': 'Organization',
          name: 'AI Decoded',
          url: `${SITE}/`,
          logo: `${SITE}/favicon.png`,
          sameAs: ['https://www.linkedin.com/company/aidecoded/'],
        },
        {
          '@type': 'ItemList',
          name: 'AI Learning Modules',
          description: `${ALL_MODULES.length} interactive tutorials and games covering AI fundamentals, machine learning, prompt engineering, and more.`,
          numberOfItems: ALL_MODULES.length,
          itemListElement: ALL_MODULES.map((m, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: m.title,
            url: `${SITE}/?tab=${m.id}`,
            description: m.description,
          })),
        },
      ],
    }
    const existing = document.getElementById('ld-json-modules')
    if (existing) existing.remove()
    const script = document.createElement('script')
    script.id = 'ld-json-modules'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(jsonLd)
    document.head.appendChild(script)
    return () => script.remove()
  }, [])

  const [homeFilter, setHomeFilter] = useState(null)
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
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const [tempChanged, setTempChanged] = useState(false)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const assistantContent = data.choices[0].message.content
      const assistantMsg = {
        role: 'assistant',
        content: assistantContent,
        meta: { model, temperature, tokens: estimateTokens(assistantContent) },
      }
      setMessages((prev) => [...prev, assistantMsg])
      markModuleComplete('playground')
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

  // Progressive learning tips at milestones
  const assistantCount = messages.filter(m => m.role === 'assistant').length

  useEffect(() => {
    if (assistantCount === 1 && !dismissedTips.has('first') && !learnTip) {
      setLearnTip({ id: 'first', text: 'Nice! Now try changing Temperature to 1.5 in the sidebar and send the same message — see how the response changes.' })
    } else if (assistantCount >= 3 && !systemPrompt.trim() && !dismissedTips.has('system') && !learnTip) {
      setLearnTip({ id: 'system', text: 'Try setting a System Prompt above — click "Pirate" and ask the same question to see a completely different personality!' })
    } else if (assistantCount >= 5 && !tempChanged && !dismissedTips.has('temp') && !learnTip) {
      setLearnTip({ id: 'temp', text: 'You haven\'t changed Temperature yet! Slide it to 0.1 for focused answers or 1.5 for creative ones.' })
    }
  }, [assistantCount, systemPrompt, tempChanged, dismissedTips])

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips(prev => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    setTimeout(() => {
      setLearnTip(null)
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const assistantContent = data.choices[0].message.content
      const assistantMsg = {
        role: 'assistant',
        content: assistantContent,
        meta: { model, temperature, tokens: estimateTokens(assistantContent) },
      }
      setMessages((prev) => [...prev, assistantMsg])
      markModuleComplete('playground')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const showSidebar = !showHome && activeTab === 'playground' && !showPlaygroundEntry
  // Render guard: prevent locked module content from rendering (defense in depth for deep links)
  const canRenderModule = FREE_MODULES.includes(activeTab) || !!user

  if (showLanding) {
    return (
      <>
        <LandingPage fadingOut={fadingOut} onGetStarted={handleGetStarted} onSelectTab={handleLandingTabSelect} darkMode={darkMode} setDarkMode={setDarkMode} />
        <FeedbackWidget showLanding activeTab={activeTab} showHome={showHome} minimized={feedbackMinimized} onMinimize={handleFeedbackMinimize} onRestore={handleFeedbackRestore} />
      </>
    )
  }

  if (showBootScreen) {
    return <BootScreen fadingOut={bootFadingOut} onComplete={handleBootComplete} />
  }

  return (
    <div className={`app ${!showSidebar ? 'app-no-sidebar' : ''} app-fade-in`}>
      <NeuronBackground />
      <main className="main">
        <header className="header header-grouped">
          <div className="header-left">
            <div className="header-brand header-brand-clickable" onClick={handleGoHome} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}>
              <TypewriterTitle className="header-title" />
            </div>
          </div>
          <div className="header-center">
            <NavDropdown activeTab={activeTab} onSelectTab={handleSelectTab} showHome={showHome} />
          </div>
          <div className="header-right">
            {feedbackMinimized && (
              <button className="header-icon-btn" onClick={handleFeedbackRestore} aria-label="Share Feedback" title="Share Feedback">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            )}
            <button
              className="header-icon-btn header-theme-toggle"
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
            {!user ? (
              <button className="header-icon-btn" onClick={() => { sessionStorage.setItem('auth_return_tab', showLanding ? 'landing' : showHome ? 'home' : activeTab); setAuthUnlockMessage(''); setShowAuthModal(true) }} aria-label="Sign In" title="Sign In">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </button>
            ) : (
              <div className="header-avatar-wrap" onClick={(e) => e.stopPropagation()}>
                <button className="header-avatar-svg" onClick={() => setShowAvatarDropdown((v) => !v)} aria-label="Account menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
                {showAvatarDropdown && (
                  <div className="avatar-dropdown">
                    <div className="avatar-dropdown-info">
                      <div className="avatar-dropdown-name">{user.user_metadata?.display_name || user.user_metadata?.full_name || 'User'}</div>
                      <div className="avatar-dropdown-email">{user.email}</div>
                    </div>
                    <div className="avatar-dropdown-divider" />
                    <button className="avatar-dropdown-item" onClick={() => { setShowAvatarDropdown(false); handleSwitchTab('profile') }}>
                      <UserIcon size={16} color="var(--text-secondary)" /> Profile
                    </button>
                    <button className="avatar-dropdown-item avatar-dropdown-item-signout" onClick={() => { signOut(); setShowAvatarDropdown(false); setShowLanding(true); setShowHome(false); window.history.replaceState(null, '', window.location.pathname) }}>
                      <SignOutIcon size={16} color="#FF3B30" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <div className={`main-body ${showSidebar ? 'main-body-with-sidebar' : ''}`}>
        {showSidebar && (
          <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <button
              className="sidebar-toggle-mobile"
              onClick={() => setSidebarCollapsed((c) => !c)}
            >
              <span>Settings</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
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
              {/* Capped at 1.5 — values above ~1.3 produce increasingly garbled output that has no educational value */}
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={temperature}
                onChange={(e) => { setTemperature(parseFloat(e.target.value)); setTempChanged(true) }}
              />
              <span className="slider-mood">
                {temperature <= 0.3 ? 'Focused — predictable, factual answers'
                  : temperature <= 0.8 ? 'Balanced — good mix of accuracy and variety'
                  : temperature <= 1.3 ? 'Creative — more surprising and varied'
                  : 'Very creative — highly varied, less predictable'}
              </span>

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
              <span className="slider-mood">
                {maxTokens <= 300 ? 'Short — a few sentences'
                  : maxTokens <= 700 ? 'Medium — a paragraph or two'
                  : maxTokens <= 1500 ? 'Long — detailed explanations'
                  : 'Maximum — full essays'}
              </span>

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
              <span className="slider-mood">
                {topP <= 0.5 ? 'Narrow — only the most likely words'
                  : topP <= 0.9 ? 'Focused — common words preferred'
                  : 'Full range — all words considered'}
              </span>
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

        <div className={`tab-content-wrapper ${homeTransition ? 'tab-content-fading' : ''}`}>
        {showHome && (
          <>
            <Breadcrumb activeTab={activeTab} showHome={true} homeFilter={homeFilter} onGoHome={handleGoHome} />
            <HomeScreen onSelectTab={handleSelectTab} homeFilter={homeFilter} onClearFilter={() => setHomeFilter(null)} />
          </>
        )}

        {!showHome && (
          <Breadcrumb
            activeTab={activeTab}
            showHome={false}
            onGoHome={handleGoHome}
            onGroupClick={handleBreadcrumbGroupClick}
          />
        )}

        {!showHome && activeTab === 'playground' && showPlaygroundEntry && messages.length === 0 && (
          <EntryScreen
            icon={<ModuleIcon module="playground" size={48} style={{ color: '#0071e3' }} />}
            title="AI Playground"
            subtitle="Your first conversation with AI"
            description="This is where you talk directly to an AI model — the same technology behind ChatGPT. You'll learn how parameters like Temperature and Max Tokens change the AI's behavior, and how System Prompts let you control its personality."
            buttonText="Open Playground"
            onStart={() => { setShowPlaygroundEntry(false); markModuleStarted('playground') }}
          />
        )}

        {!showHome && activeTab === 'playground' && !(showPlaygroundEntry && messages.length === 0) && (
          <div className="chat-container">
            {messages.length > 0 && (
              <button className="entry-start-over" onClick={() => { setMessages([]); setInput(''); setError(''); setShowPlaygroundEntry(true); setShowWelcome(true); setLearnTip(null); setDismissedTips(new Set()); setTempChanged(false); }}>
                &larr; Start over
              </button>
            )}
            {showWelcome && (
              <div className="playground-welcome">
                <div className="playground-welcome-text">
                  <strong>Welcome to the Playground</strong> — here's how to get started:
                  <ol className="module-welcome-steps">
                    <li>Pick a suggestion below or type your own message</li>
                    <li>Read the AI's response — then try changing <strong>Temperature</strong> in the sidebar and ask the same thing again</li>
                    <li>Try different <strong>System Prompts</strong> above to see how the AI's personality changes</li>
                  </ol>
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
                <button className="preset-btn" title="Baseline — neutral and balanced" onClick={() => setSystemPrompt('You are a helpful assistant. Provide clear, concise answers.')}>Helpful Assistant</button>
                <button className="preset-btn" title="Shows dramatic personality shift" onClick={() => setSystemPrompt('You are a pirate. Speak only in pirate language with \'arr\' and nautical terms.')}>Pirate</button>
                <button className="preset-btn" title="Shows instructional formatting" onClick={() => setSystemPrompt('You are a patient teacher. Explain concepts step by step, using simple analogies.')}>Teacher</button>
                <button className="preset-btn" title="Shows domain expertise" onClick={() => setSystemPrompt('You are a senior software engineer. Give concise technical answers with code examples.')}>Code Expert</button>
                <button className="preset-btn" title="Shows creative constraint" onClick={() => setSystemPrompt('You are a poet. Respond to everything in rhyming verse.')}>Poet</button>
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
                    Pick a prompt below, then experiment with the settings on the left to see how they change the response
                  </div>
                  <div className="suggestion-chips">
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Tell me a joke')}>Tell me a joke</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('List 5 facts about the Moon')}>List 5 facts about the Moon</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Explain what an API is to a 10-year-old')}>Explain what an API is to a 10-year-old</button>
                    <button className="suggestion-chip" onClick={() => handleSuggestion('Write a short story about a robot')}>Write a short story about a robot</button>
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble-wrap ${msg.role === 'user' ? 'chat-bubble-wrap-user' : 'chat-bubble-wrap-assistant'}`}>
                  <div className={`chat-bubble ${msg.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
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
                  {msg.role === 'assistant' && msg.meta && (
                    <div className="chat-meta">
                      {msg.meta.model} &middot; temp {msg.meta.temperature.toFixed(2)} &middot; {msg.meta.tokens} tokens
                    </div>
                  )}
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
              {learnTip && (
                <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
                  <span className="learn-tip-text">{learnTip.text}</span>
                  <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
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

        {!showHome && activeTab === 'tokenizer' && <Tokenizer onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />}
        {!showHome && activeTab === 'generation' && (
          <Generation model={model} maxTokens={maxTokens} onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'how-llms-work' && (
          <HowLLMsWork model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'model-training' && (
          <ModelTraining onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'prompt-engineering' && (
          <PromptEngineering model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'context-engineering' && (
          <ContextEngineering model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'rag' && (
          <RAG model={model} temperature={temperature} topP={topP} maxTokens={maxTokens} onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'agentic-ai' && (
          <AgenticAI onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'rag-under-the-hood' && (
          <RAGUnderTheHood onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-in-production' && (
          <AIInProduction onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'machine-learning' && (
          <MachineLearning onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'neural-networks' && (
          <NeuralNetworks onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'deep-learning' && (
          <DeepLearning onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'fine-tuning' && (
          <FineTuning onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'generative-ai' && (
          <GenerativeAI onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-city-builder' && (
          <AICityBuilder onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-lab-explorer' && (
          <AILabExplorer onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'prompt-heist' && (
          <PromptHeist onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'token-budget' && (
          <TokenBudget onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-ethics-tribunal' && (
          <AIEthicsTribunal onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'pm-simulator' && (
          <PMSimulator onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-native-pm' && (
          <AINativePM onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-safety' && (
          <AISafety onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-fluency' && (
          <AIFluency onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'ai-startup-simulator' && (
          <AIStartupSimulator onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'alignment-game' && (
          <AlignmentGame onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'choosing-ai-model' && (
          <ChoosingAIModel onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && canRenderModule && activeTab === 'precision-recall' && (
          <PrecisionRecall onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        {!showHome && activeTab === 'profile' && (
          <UserProfile onSwitchTab={handleSwitchTab} onGoHome={handleGoHome} />
        )}
        </div>
        </div>
      </main>
      <FeedbackWidget showHome={showHome} activeTab={activeTab} minimized={feedbackMinimized} onMinimize={handleFeedbackMinimize} onRestore={handleFeedbackRestore} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} unlockMessage={authUnlockMessage} />
    </div>
  )
}

export default App
