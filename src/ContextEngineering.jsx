import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { WarningIcon, SkullIcon, SparklesIcon, CrossIcon, CheckIcon, QuestionIcon, HashIcon, SearchIcon, FileIcon, PackageIcon, RobotIcon, LayersIcon, ScissorsIcon, TheaterIcon, RefreshIcon, MailIcon, BarChartIcon, BriefcaseIcon, WrenchIcon, EyeIcon, TargetIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { contextEngineeringQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './ContextEngineering.css'

const CE_TOOLS = {
  0: [
    { name: 'tiktoken', color: '#34C759', desc: 'Count tokens before sending to API' },
    { name: 'Claude.ai', color: '#0071E3', desc: 'Visualizes token usage in conversations' },
    { name: 'OpenAI Tokenizer', color: '#0071E3', desc: 'Web tool to see how text gets tokenized' },
  ],
  1: [
    { name: 'LangChain Memory', color: '#34C759', desc: 'Manage conversation context automatically' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Smart context retrieval and management' },
    { name: 'OpenAI API', color: '#0071E3', desc: 'Context window via messages parameter' },
  ],
  2: [
    { name: 'Guardrails AI', color: '#34C759', desc: 'Validate and sanitize LLM inputs/outputs' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Structured context with metadata filtering' },
    { name: 'Rebuff', color: '#34C759', desc: 'Prompt injection detection framework' },
  ],
  3: [
    { name: 'LangChain', color: '#34C759', desc: 'RAG chains with retrieval and generation' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Document indexing and query engines' },
    { name: 'Haystack', color: '#34C759', desc: 'Production-ready RAG pipelines' },
  ],
  4: [
    { name: 'LangChain', color: '#34C759', desc: 'Context strategies via memory modules' },
    { name: 'MemGPT', color: '#34C759', desc: 'Virtual context management for long conversations' },
    { name: 'Zep Memory', color: '#34C759', desc: 'Long-term memory layer for AI assistants' },
  ],
  5: [
    { name: 'LangChain', color: '#34C759', desc: 'Build use-case specific chains and agents' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Domain-specific document Q&A' },
    { name: 'Flowise', color: '#34C759', desc: 'No-code AI workflow builder' },
  ],
}

const STAGES = [
  { key: 'what-is-context', label: 'What is Context?' },
  { key: 'context-window', label: 'Context Window' },
  { key: 'context-poisoning', label: 'Context Poisoning' },
  { key: 'rag', label: 'RAG' },
  { key: 'strategies', label: 'Strategies' },
  { key: 'use-cases', label: 'Use Cases' },
]

const STAGE_TOOLTIPS = {
  'what-is-context': 'Everything the AI can see when generating a response — your prompt, history, and documents.',
  'context-window': 'The finite working memory of an AI model. Different models have different sizes.',
  'context-poisoning': 'How bad or contradictory context degrades AI output quality.',
  'rag': 'Retrieval Augmented Generation — teaching AI your documents without retraining.',
  'strategies': 'Pro techniques for managing context in production AI systems.',
  'use-cases': 'How to craft the right context for different tasks like email, analysis, and coding.',
}

const QUICK_REFERENCE = [
  { technique: 'Context Awareness', when: 'Every AI interaction', phrase: 'Include what changes the answer', icon: <EyeIcon size={24} color="#8E8E93" /> },
  { technique: 'Window Management', when: 'Long conversations', phrase: 'Monitor token usage', icon: <BarChartIcon size={24} color="#8E8E93" /> },
  { technique: 'Quality Control', when: 'Complex tasks', phrase: 'Every piece earns its place', icon: <CheckIcon size={24} color="#8E8E93" /> },
  { technique: 'RAG', when: 'Enterprise knowledge', phrase: 'Retrieve, inject, generate', icon: <SearchIcon size={24} color="#8E8E93" /> },
  { technique: 'Sandwich Method', when: 'Long content', phrase: 'Instructions + Content + Instructions', icon: <LayersIcon size={24} color="#8E8E93" /> },
  { technique: 'Use Case Matching', when: 'Specific tasks', phrase: 'Match context to task type', icon: <TargetIcon size={24} color="#8E8E93" /> },
]

/* ═══════════════════════════════════
   STAGE 1 — WHAT IS CONTEXT?
   ═══════════════════════════════════ */
function WhatIsContextViz({ active }) {
  const [tokenCount, setTokenCount] = useState(0)
  const [phase, setPhase] = useState(0) // 0=idle, 1=filling sections, 2=done
  const timerRef = useRef(null)

  const sections = [
    { label: 'System Prompt', tokens: 120, color: '#0071e3', width: 0 },
    { label: 'Chat History', tokens: 1800, color: '#34c759', width: 0 },
    { label: 'Retrieved Docs', tokens: 1500, color: '#ff9500', width: 0 },
    { label: 'User Message', tokens: 780, color: '#af52de', width: 0 },
  ]
  const totalCapacity = 128000
  const totalUsed = sections.reduce((sum, s) => sum + s.tokens, 0)

  useEffect(() => {
    if (!active || phase > 0) return
    setPhase(1)
    let count = 0
    const target = totalUsed
    const step = Math.ceil(target / 60)
    timerRef.current = setInterval(() => {
      count += step
      if (count >= target) {
        count = target
        clearInterval(timerRef.current)
        setPhase(2)
      }
      setTokenCount(count)
    }, 30)
    return () => clearInterval(timerRef.current)
  }, [active])

  const pct = Math.min((tokenCount / totalCapacity) * 100, 100)

  // Calculate running totals for each section
  let runningTotal = 0
  const sectionBars = sections.map((s) => {
    const start = runningTotal
    runningTotal += s.tokens
    const filled = Math.min(tokenCount, runningTotal) - start
    const widthPct = Math.max(0, (filled / totalCapacity) * 100)
    return { ...s, widthPct }
  })

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">See what fills your context window:</div>

      <div className="ce-context-bar-wrapper">
        <div className="ce-context-bar">
          {sectionBars.map((s, i) => (
            <div
              key={i}
              className="ce-context-bar-section"
              style={{
                width: `${s.widthPct}%`,
                backgroundColor: s.color,
                transition: 'width 0.3s ease-out',
              }}
            >
              {s.widthPct > 0.5 && (
                <span className="ce-context-bar-section-label">{s.label}</span>
              )}
            </div>
          ))}
        </div>
        <div className="ce-context-bar-counter">
          Your context window: {tokenCount.toLocaleString()} / {totalCapacity.toLocaleString()} tokens used
        </div>
      </div>

      <div className="ce-context-legend">
        {sections.map((s, i) => (
          <div key={i} className="ce-context-legend-item">
            <span className="ce-context-legend-dot" style={{ backgroundColor: s.color }} />
            <span>{s.label} ({s.tokens.toLocaleString()})</span>
          </div>
        ))}
      </div>

      <div className="ce-comparison">
        <div className="ce-comp-panel ce-comp-bad">
          <div className="ce-comp-label">Empty Context</div>
          <div className="ce-comp-prompt">"What should our pricing be?"</div>
          <div className="ce-comp-divider" />
          <div className="ce-comp-response">"Pricing depends on many factors..."</div>
          <div className="ce-comp-verdict ce-verdict-bad">Vague answer — AI has nothing to work with</div>
        </div>
        <div className="ce-comp-panel ce-comp-good">
          <div className="ce-comp-label">Rich Context</div>
          <div className="ce-comp-prompt">"We are a B2B SaaS targeting mid-market (100-500 employees). Our main competitor charges $50/user/month. Our COGS is $8/user. We need 60% gross margin. What should our pricing be?"</div>
          <div className="ce-comp-divider" />
          <div className="ce-comp-response">"Based on your $8 COGS and 60% margin requirement, your floor is $20/user. Given competitor pricing at $50 and your mid-market focus, I recommend $35-45/user..."</div>
          <div className="ce-comp-verdict ce-verdict-good">Specific, actionable answer</div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 2 — THE CONTEXT WINDOW
   ═══════════════════════════════════ */
function ContextWindowViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const [tokensRemaining, setTokensRemaining] = useState(128000)
  const timerRef = useRef(null)

  const windowSections = [
    { label: 'System Prompt', pct: 10, color: '#0071e3', tokens: 12800 },
    { label: 'Examples / Few-shot', pct: 20, color: '#34c759', tokens: 25600 },
    { label: 'Retrieved Documents', pct: 40, color: '#ff9500', tokens: 51200 },
    { label: 'Conversation History', pct: 20, color: '#ff3b30', tokens: 25600 },
    { label: 'Current Message', pct: 10, color: '#af52de', tokens: 12800 },
  ]

  useEffect(() => {
    if (!active || animStep > 0) return
    let step = 0
    let remaining = 128000
    timerRef.current = setInterval(() => {
      step++
      if (step <= windowSections.length) {
        remaining -= windowSections[step - 1].tokens
        setTokensRemaining(Math.max(0, remaining))
      }
      setAnimStep(step)
      if (step >= windowSections.length + 1) clearInterval(timerRef.current)
    }, 600)
    return () => clearInterval(timerRef.current)
  }, [active])

  const models = [
    { name: 'GPT-3.5', tokens: '16,000', words: '~12,000 words' },
    { name: 'GPT-4o', tokens: '128,000', words: '~96,000 words' },
    { name: 'Claude 3', tokens: '200,000', words: '~150,000 words' },
    { name: 'Gemini 1.5', tokens: '1,000,000', words: '~750,000 words' },
  ]

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">How the context window fills up:</div>

      <div className="ce-window-rect">
        {windowSections.map((s, i) => (
          <div
            key={i}
            className={`ce-window-section ${animStep > i ? 'ce-window-section-visible' : ''}`}
            style={{
              height: `${s.pct}%`,
              backgroundColor: s.color,
            }}
          >
            <span className="ce-window-section-label">
              <span className="ce-window-section-dot" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 6, background: s.color }} /> {s.label} (~{s.pct}%)
            </span>
          </div>
        ))}
      </div>

      {animStep > windowSections.length && (
        <div className="ce-window-warning how-pop-in">
          <span className="ce-window-warning-icon"><WarningIcon size={16} /></span>
          Context window full — oldest messages will be dropped
        </div>
      )}

      <div className="ce-tokens-remaining">
        Tokens remaining: <strong>{tokensRemaining.toLocaleString()}</strong>
      </div>

      <div className="ce-model-table">
        <div className="ce-model-table-title">Context window sizes by model:</div>
        <div className="ce-model-cards">
          {models.map((m) => (
            <div key={m.name} className="ce-model-card">
              <div className="ce-model-card-name">{m.name}</div>
              <div className="ce-model-card-tokens">{m.tokens}</div>
              <div className="ce-model-card-words">{m.words}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 3 — CONTEXT POISONING
   ═══════════════════════════════════ */
function ContextPoisoningViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timerRef = useRef(null)

  const badItems = [
    { icon: <CrossIcon size={14} />, text: 'Contradictory instructions' },
    { icon: <CrossIcon size={14} />, text: 'Outdated information mixed with current' },
    { icon: <CrossIcon size={14} />, text: 'Irrelevant documents diluting focus' },
    { icon: <CrossIcon size={14} />, text: 'Ambiguous pronouns ("it", "they", "this")' },
  ]

  const goodItems = [
    { icon: <CheckIcon size={14} />, text: 'Clear single source of truth' },
    { icon: <CheckIcon size={14} />, text: 'Relevant documents only' },
    { icon: <CheckIcon size={14} />, text: 'Explicit references ("the Q3 report states...")' },
    { icon: <CheckIcon size={14} />, text: 'Consistent terminology throughout' },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < badItems.length) {
        timerRef.current = setTimeout(showNext, 400)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">Good context vs poisoned context:</div>

      <div className="ce-poison-split">
        <div className="ce-poison-panel ce-poison-bad">
          <div className="ce-poison-panel-title"><SkullIcon size={16} /> Poisoned Context</div>
          {badItems.map((item, i) => (
            <div key={i} className={`ce-poison-item ${i < visibleCards ? 'ce-poison-item-visible' : ''}`}>
              <span className="ce-poison-icon">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="ce-poison-panel ce-poison-good">
          <div className="ce-poison-panel-title"><SparklesIcon size={16} /> Clean Context</div>
          {goodItems.map((item, i) => (
            <div key={i} className={`ce-poison-item ${i < visibleCards ? 'ce-poison-item-visible' : ''}`}>
              <span className="ce-poison-icon">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {visibleCards >= badItems.length && (
        <div className="ce-poison-mistakes how-pop-in">
          <div className="ce-poison-mistakes-title">Common context mistakes:</div>
          <ul>
            <li>Pasting entire documents when only 1 section is relevant</li>
            <li>Including old email threads with conflicting information</li>
            <li>Mixing different topics in one conversation</li>
            <li>Not updating context when facts change</li>
          </ul>
          <div className="ce-poison-rule">Rule: Every piece of context should earn its place.</div>
        </div>
      )}

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}>Play demo</button>
      )}
      {visibleCards >= badItems.length && (
        <button className="pe-replay-btn" onClick={startAnimation}>Replay animation</button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 4 — RAG
   ═══════════════════════════════════ */
function RAGViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const timerRef = useRef(null)

  const pipelineSteps = [
    { num: '1', label: 'User asks question', icon: <QuestionIcon size={18} color="#0071e3" />, color: '#0071e3' },
    { num: '2', label: 'Question → embedding (vector)', icon: <HashIcon size={18} color="#8b5cf6" />, color: '#8b5cf6' },
    { num: '3', label: 'Vector DB searched', icon: <SearchIcon size={18} color="#ff9500" />, color: '#ff9500' },
    { num: '4', label: 'Top chunks retrieved', icon: <FileIcon size={18} color="#34c759" />, color: '#34c759' },
    { num: '5', label: 'Chunks added to context', icon: <PackageIcon size={18} color="#00c7be" />, color: '#00c7be' },
    { num: '6', label: 'AI answers with context', icon: <RobotIcon size={18} color="#af52de" />, color: '#af52de' },
  ]

  useEffect(() => {
    if (!active || animStep > 0) return
    let step = 0
    timerRef.current = setInterval(() => {
      step++
      setAnimStep(step)
      if (step >= pipelineSteps.length) clearInterval(timerRef.current)
    }, 500)
    return () => clearInterval(timerRef.current)
  }, [active])

  function replay() {
    clearInterval(timerRef.current)
    setAnimStep(0)
    let step = 0
    timerRef.current = setInterval(() => {
      step++
      setAnimStep(step)
      if (step >= pipelineSteps.length) clearInterval(timerRef.current)
    }, 500)
  }

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">How RAG works — from question to answer:</div>

      <div className="ce-rag-pipeline">
        {pipelineSteps.map((step, i) => {
          const connector = i > 0 ? (
            <div key={`c${i}`} className={`ce-rag-connector ${animStep > i - 1 ? 'ce-rag-connector-active' : ''}`}>
              <svg width="24" height="12" viewBox="0 0 24 12">
                <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : null
          return [
            connector,
            <div key={i} className={`ce-rag-step ${animStep > i ? 'ce-rag-step-active' : ''}`} style={{ '--step-color': step.color }}>
              <span className="ce-rag-step-icon">{step.icon}</span>
              <span className="ce-rag-step-num">{step.num}</span>
              <span className="ce-rag-step-label">{step.label}</span>
            </div>,
          ]
        })}
      </div>

      {animStep >= pipelineSteps.length && (
        <div className="ce-rag-summary how-pop-in">
          <strong>This is how:</strong>
          <ul>
            <li>ChatGPT plugins work</li>
            <li>Custom AI assistants know your company docs</li>
            <li>AI can answer questions about your internal knowledge base</li>
          </ul>
          <div className="ce-rag-insight">You don't need to train a new model — just engineer the context better.</div>
        </div>
      )}

      {animStep >= pipelineSteps.length && (
        <div style={{ textAlign: 'center' }}>
          <button className="ce-replay-btn" onClick={replay}>↺ Replay Animation</button>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 5 — CONTEXT STRATEGIES
   ═══════════════════════════════════ */
function StrategiesViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timerRef = useRef(null)

  const strategies = [
    {
      name: 'Sandwich Method',
      icon: <LayersIcon size={18} />,
      formula: '[Instructions] + [Content] + [Instructions again]',
      desc: 'Repeating key instructions before AND after long content keeps AI focused on what matters.',
    },
    {
      name: 'Chunking',
      icon: <ScissorsIcon size={18} />,
      formula: 'Instead of: Paste 50-page document → Do: Split into chunks, retrieve relevant ones only',
      desc: 'Never paste more than you need.',
    },
    {
      name: 'Persona Anchoring',
      icon: <TheaterIcon size={18} />,
      formula: 'Set role in system prompt + reinforce in first message',
      desc: '"You are X. Remember you are X. As X, please..." — keeps AI in character for long conversations.',
    },
    {
      name: 'Context Refresh',
      icon: <RefreshIcon size={18} />,
      formula: 'Every 10 messages: summarize conversation so far → inject summary as new context',
      desc: 'Prevents context drift in long sessions.',
    },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < strategies.length) {
        timerRef.current = setTimeout(showNext, 500)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">Pro strategies used by AI engineers:</div>

      <div className="ce-strategy-cards">
        {strategies.map((s, i) => (
          <div key={i} className={`ce-strategy-card ${i < visibleCards ? 'ce-strategy-card-visible' : ''}`}>
            <div className="ce-strategy-card-header">
              <span className="ce-strategy-card-icon">{s.icon}</span>
              <span className="ce-strategy-card-name">{s.name}</span>
            </div>
            <div className="ce-strategy-card-formula">{s.formula}</div>
            <div className="ce-strategy-card-desc">{s.desc}</div>
          </div>
        ))}
      </div>

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}>Play demo</button>
      )}
      {visibleCards >= strategies.length && (
        <button className="pe-replay-btn" onClick={startAnimation}>Replay animation</button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 6 — USE CASES
   ═══════════════════════════════════ */
function UseCasesViz({ active }) {
  const [expandedCase, setExpandedCase] = useState(null)
  const [selectedCase, setSelectedCase] = useState(null)
  const [checkedItems, setCheckedItems] = useState({})

  const useCases = [
    {
      icon: <MailIcon size={18} />,
      name: 'Email Writing',
      items: [
        'Your writing style sample',
        'Recipient background',
        'Previous email thread',
        'Desired outcome',
        'Tone preferences',
      ],
    },
    {
      icon: <BarChartIcon size={18} />,
      name: 'Data Analysis',
      items: [
        'Data schema',
        'Business definitions',
        'Previous analysis for comparison',
        'Specific metrics that matter',
        'Time period and scope',
      ],
    },
    {
      icon: <BriefcaseIcon size={18} />,
      name: 'Business Decisions',
      items: [
        'Company strategy doc excerpt',
        'Constraints (budget, timeline)',
        'Stakeholder preferences',
        'Previous decisions on similar topics',
        'Risk tolerance',
      ],
    },
    {
      icon: <WrenchIcon size={18} />,
      name: 'Technical Help',
      items: [
        'Error message',
        'Full stack trace',
        'Relevant code section',
        "What you've already tried",
        'Environment details',
      ],
    },
  ]

  function toggleItem(caseIdx, itemIdx) {
    const key = `${caseIdx}-${itemIdx}`
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function buildTemplate() {
    if (selectedCase === null) return ''
    const uc = useCases[selectedCase]
    const selected = uc.items.filter((_, i) => checkedItems[`${selectedCase}-${i}`])
    if (selected.length === 0) return 'Select context elements above to generate a template.'
    let template = `[${uc.name} Context]\n\n`
    selected.forEach((item) => {
      template += `${item}: [Your ${item.toLowerCase()} here]\n\n`
    })
    template += `[Your question here]`
    return template
  }

  return (
    <div className="ce-viz">
      <div className="ce-demo-label">Click a use case to see what context to include:</div>

      <div className="ce-usecase-cards">
        {useCases.map((uc, i) => (
          <div key={i} className="ce-usecase-card-wrapper">
            <button
              className={`ce-usecase-card ${expandedCase === i ? 'ce-usecase-card-expanded' : ''}`}
              onClick={() => { setExpandedCase(expandedCase === i ? null : i); setSelectedCase(i) }}
            >
              <span className="ce-usecase-card-icon">{uc.icon}</span>
              <span className="ce-usecase-card-name">{uc.name}</span>
            </button>
            {expandedCase === i && (
              <div className="ce-usecase-items how-pop-in">
                {uc.items.map((item, j) => (
                  <label key={j} className="ce-usecase-item">
                    <input
                      type="checkbox"
                      checked={!!checkedItems[`${i}-${j}`]}
                      onChange={() => toggleItem(i, j)}
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCase !== null && (
        <div className="ce-template-builder how-pop-in">
          <div className="ce-template-title">Generated Context Template:</div>
          <pre className="ce-template-output">{buildTemplate()}</pre>
        </div>
      )}

      <div className="ce-usecase-rule">
        Golden rule: Include context that changes the answer. Exclude context that doesn't matter for this specific task.
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
function ContextEngineering({ model, temperature, topP, maxTokens, onSwitchTab, onGoHome }) {
  const [stage, setStage] = useState(-1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showFinal, setShowFinal] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [stage])

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setShowFinal(true)
      setStage(STAGES.length)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  const vizComponents = {
    0: <WhatIsContextViz active={stage === 0} />,
    1: <ContextWindowViz active={stage === 1} />,
    2: <ContextPoisoningViz active={stage === 2} />,
    3: <RAGViz active={stage === 3} />,
    4: <StrategiesViz active={stage === 4} />,
    5: <UseCasesViz active={stage === 5} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: What is Context?',
      content: "Context is everything the AI can see when generating its response. This includes:\n\n- Your system prompt (instructions)\n- The conversation history\n- Any documents you've pasted in\n- Examples you've provided\n\nThe context window is the AI's entire working memory — it can only use what's inside it. Nothing more, nothing less.\n\nThis is why copying and pasting relevant information into your prompt dramatically improves results.",
    },
    1: {
      title: 'Stage 2: The Context Window',
      content: "Think of the context window as a whiteboard — the AI can only see what's written on it right now.\n\nDifferent models have different sized whiteboards:\n- GPT-3.5: 16,000 tokens (~12,000 words)\n- GPT-4o: 128,000 tokens (~96,000 words)\n- Claude 3: 200,000 tokens (~150,000 words)\n- Gemini 1.5: 1,000,000 tokens (~750,000 words)\n\nWhen the whiteboard fills up, old content falls off the edge. This is why very long conversations sometimes make AI 'forget' things you said earlier.",
    },
    2: {
      title: 'Stage 3: Context Poisoning',
      content: "Bad context is worse than no context. If you fill the context window with contradictory, irrelevant, or outdated information, the AI gets confused and produces worse results than if you'd asked simply.\n\nCommon context mistakes:\n- Pasting entire documents when only 1 section is relevant\n- Including old email threads with conflicting information\n- Mixing different topics in one conversation\n- Not updating context when facts change\n\nRule: Every piece of context should earn its place.",
    },
    3: {
      title: 'Stage 4: RAG — Teaching AI Your Documents',
      content: "RAG solves the biggest enterprise AI problem: how do you make AI know about YOUR specific documents, policies, and data without retraining it?\n\nAnswer: Store your docs in a vector database, retrieve relevant chunks at query time, inject them into the context window.\n\nThis is how:\n- ChatGPT plugins work\n- Custom AI assistants know your company docs\n- AI can answer questions about your internal knowledge base\n\nYou don't need to train a new model — just engineer the context better.",
    },
    4: {
      title: 'Stage 5: Pro Context Strategies',
      content: "These are the techniques used by AI engineers building production systems. Apply them to immediately improve your AI results.\n\nThe Sandwich Method ensures instructions aren't forgotten in long contexts. Chunking prevents wasted tokens. Persona Anchoring keeps AI consistent. Context Refresh prevents drift.\n\nMaster these four strategies and you'll handle any context challenge.",
    },
    5: {
      title: 'Stage 6: Context by Use Case',
      content: "Different tasks need different context. The art is knowing what to include and what to leave out.\n\nGolden rule: Include context that changes the answer. Exclude context that doesn't matter for this specific task.\n\nFor email writing — include tone and style. For data analysis — include schema and definitions. For business decisions — include constraints and past precedents. For technical help — include error messages and what you've tried.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="context-engineering" size={48} style={{ color: '#34C759' }} />}
        title="Context Engineering"
        description="Prompt Engineering is about HOW you ask. Context Engineering is about WHAT you include. Learn how to craft the perfect context window to get consistently great AI results."
        buttonText="Start Learning"
        onStart={() => setStage(0)}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms ce-root quiz-fade-in">
        <Quiz
          questions={contextEngineeringQuiz}
          tabName="Context Engineering"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="context-engineering"
        />
      </div>
    )
  }

  return (
    <div className="how-llms ce-root">
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Context Engineering</strong> — While prompt engineering teaches you how to ask, context engineering teaches you what to include. Master this and your AI results will transform overnight.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper ce-stepper">
              <div className="how-stepper-inner">
                {STAGES.map((s, i) => {
                  const isCompleted = stage > i
                  const isCurrent = stage === i
                  const isActive = stage >= i
                  const isClickable = i <= maxStageReached && !isCurrent
                  return (
                    <div key={s.key} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
                      <div
                        className={`how-step ${isActive ? 'how-step-active' : ''} ${isCurrent ? 'how-step-current' : ''} ${isCompleted ? 'how-step-completed' : ''} ${isClickable ? 'how-step-clickable' : ''}`}
                        onClick={isClickable ? () => goToStage(i) : undefined}
                      >
                        <div className="how-step-num">
                          {isCompleted ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            i + 1
                          )}
                        </div>
                        <div className="how-step-label">
                          {s.label}
                          <Tooltip text={STAGE_TOOLTIPS[s.key]} />
                        </div>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className={`how-step-arrow ${stage > i ? 'how-arrow-active' : ''}`}>
                          <svg width="24" height="12" viewBox="0 0 24 12">
                            <path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </div>
              )
            })}
              </div>
            </div>
          </div>

          <div className="how-content">
            {stage >= 0 && stage < STAGES.length && (
              <div className="how-stage how-fade-in" key={stage}>
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{explanations[stage].title}</strong>
                  </div>
                  {explanations[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <ToolChips tools={CE_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>← Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'Show me the window →',
                        'What can go wrong? →',
                        'How does RAG work? →',
                        'Teach me strategies →',
                        'Real use cases →',
                        'Test my knowledge →',
                      ][stage]}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You're now a Context Engineer!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Context Engineering Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.technique}>
                    <td className="pe-ref-technique">{item.technique}</td>
                    <td>{item.when}</td>
                    <td className="pe-ref-phrase">{item.phrase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="context-engineering" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default ContextEngineering
