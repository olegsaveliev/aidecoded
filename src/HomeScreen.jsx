import { useState, useEffect, useRef, useMemo } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import { CrossIcon, CheckIcon, StarIcon, LockIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import { useRelease } from './ReleaseContext'
import { NAV_GROUPS } from './NavDropdown.jsx'
import './HomeScreen.css'

const FILTER_COLORS = {
  All: '#1D1D1F',
  Interactive: '#0071E3',
  Visual: '#AF52DE',
  Journey: '#FF9500',
  Practical: '#34C759',
  Technical: '#5856D6',
  Game: '#F59E0B',
  Professional: '#0EA5E9',
  Security: '#EF4444',
}

const FILTERS = Object.keys(FILTER_COLORS)

const TAG_BORDER_COLORS = {
  Interactive: 'rgba(0, 113, 227, 0.5)',
  Visual: 'rgba(175, 82, 222, 0.5)',
  Journey: 'rgba(255, 149, 0, 0.5)',
  Practical: 'rgba(52, 199, 89, 0.5)',
  Technical: 'rgba(88, 86, 214, 0.5)',
  Game: 'rgba(245, 158, 11, 0.5)',
  Professional: 'rgba(14, 165, 233, 0.5)',
  Security: 'rgba(239, 68, 68, 0.5)',
}

const CARDS = [
  {
    id: 'playground',
    title: 'Playground',
    description: 'Chat directly with AI and experiment with parameters in real time',
    tag: 'Interactive',

    group: 'Tools',
  },
  {
    id: 'tokenizer',
    title: 'Tokenizer',
    description: 'See exactly how AI reads your text — broken into tokens in real time',
    tag: 'Visual',

    group: 'Tools',
  },
  {
    id: 'generation',
    title: 'Token Generation',
    description: 'Watch AI predict the next word live — Manual or Simulate',
    tag: 'Interactive',

    group: 'Tools',
  },
  {
    id: 'how-llms-work',
    title: 'How LLMs Work',
    description: 'An interactive 5-stage journey from your prompt to the AI response',
    tag: 'Journey',

    group: 'Foundations',
  },
  {
    id: 'model-training',
    title: 'Model Training',
    description: 'Discover how AI models like ChatGPT are built from scratch — data to deployment',
    tag: 'Journey',

    group: 'Foundations',
  },
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Learn how to write better prompts and get dramatically better results from any AI',
    tag: 'Practical',

    group: 'Skills',
  },
  {
    id: 'context-engineering',
    title: 'Context Engineering',
    description: 'Learn how to give AI the right context to get dramatically better results every time',
    tag: 'Practical',

    group: 'Skills',
  },
  {
    id: 'rag',
    title: 'RAG',
    description: 'How AI learns from YOUR documents — Retrieval Augmented Generation explained',
    tag: 'Journey',

    group: 'Advanced',
  },
  {
    id: 'agentic-ai',
    title: 'Agentic AI',
    description: 'AI that plans, acts and learns on its own. Understand the systems that are changing what AI can actually do in the world.',
    tag: 'Technical',

    group: 'Advanced',
  },
  {
    id: 'rag-under-the-hood',
    title: 'Why RAG Fails',
    description: 'Your RAG works in the demo and breaks in production. Learn exactly why — chunking, metadata, retrieval, filtering — and how to fix each layer.',
    tag: 'Technical',

    group: 'Advanced',
  },
  {
    id: 'ai-in-production',
    title: 'AI in Production',
    description: 'Shipping an AI feature is the beginning, not the end. Learn how to monitor quality, measure latency, track cost, detect drift and know when your AI is silently failing.',
    tag: 'Technical',

    group: 'Advanced',
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    description: 'How machines actually learn from data — the foundation of all modern AI',
    tag: 'Technical',

    group: 'Foundations',
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks',
    description: 'Watch a neural network learn in real time. Animated weights, live loss curves, and hands-on backpropagation — from a single neuron to a trained network, step by step.',
    tag: 'Technical',

    group: 'Foundations',
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    description: 'Discover the neural networks powering every AI breakthrough — from image recognition to ChatGPT',
    tag: 'Technical',

    group: 'Foundations',
  },
  {
    id: 'computer-vision',
    title: 'Computer Vision',
    description: 'How does AI see a cat and know it\'s a cat? Drag real convolution filters over pixel grids, watch feature maps emerge, and build intuition for how CNNs, ResNets, and modern vision transformers actually work.',
    tag: 'Technical',

    group: 'Foundations',
  },
  {
    id: 'fine-tuning',
    title: 'Fine-Tuning',
    description: 'Turn a general-purpose AI into a domain expert trained on your specific data and style',
    tag: 'Technical',

    group: 'Foundations',
  },
  {
    id: 'generative-ai',
    title: 'Generative AI',
    description: 'From noise to masterpiece — discover how AI creates images, music, video, code and text that never existed before.',
    tag: 'Journey',

    group: 'Foundations',
  },
  {
    id: 'ai-city-builder',
    title: 'AI City Builder',
    description: 'Solve AI mysteries. Diagnose failures. Build your city with every case you crack.',
    tag: 'Game',

    group: 'Play',
    isGame: true,
    difficulty: 'Beginner Friendly',
  },
  {
    id: 'ai-lab-explorer',
    title: 'AI Lab Explorer',
    description: 'Walk through an AI research lab. Unlock each room by completing hands-on challenges.',
    tag: 'Game',

    group: 'Play',
    isGame: true,
    difficulty: 'Interactive',
  },
  {
    id: 'prompt-heist',
    title: 'Prompt Heist',
    description: 'Craft the perfect prompt to outsmart AI security systems and pull off 5 legendary heists.',
    tag: 'Game',

    group: 'Play',
    isGame: true,
    difficulty: 'Intermediate',
  },
  {
    id: 'token-budget',
    title: 'Token Budget',
    description: 'Rewrite prompts to fit strict token limits without losing quality. Real API cost thinking through play.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Intermediate',
  },
  {
    id: 'ai-ethics-tribunal',
    title: 'AI Ethics Tribunal',
    description: 'Preside over real-world AI dilemmas. Weigh the arguments. Deliver your verdict. No easy answers.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Thought-Provoking',
  },
  {
    id: 'pm-simulator',
    title: 'PM Simulator',
    description: 'You are the PM. Write system instructions, design evals, fix hallucinations. Ship the AI feature — or watch it fail.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Professional',
  },
  {
    id: 'ai-startup-simulator',
    title: 'AI Startup Simulator',
    description: 'You just got funded. Every decision shapes your product — build vs buy, RAG vs fine-tune, which data to collect. Make the right calls or watch your startup fail.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Strategic',
  },
  {
    id: 'alignment-game',
    title: 'The Alignment Game',
    description: 'Give an AI a goal. Watch it achieve the goal perfectly and completely miss the point. Can you write constraints tight enough to stop it? Goodhart\'s Law has never been this fun.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Thought-Provoking',
  },
  {
    id: 'label-master',
    title: 'Label Master',
    description: 'Draw bounding boxes around objects as fast as you can. Scored on IoU accuracy. Escalates from single objects to crowded scenes to pixel segmentation. Teaches how object detection really works \u2014 and why labelling AI training data is so hard.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Hands-On',
  },
  {
    id: 'draw-and-deceive',
    title: 'Draw & Deceive',
    description: 'Draw on a pixel grid. GPT-4o tries to classify what you drew. Try to make it say the right thing \u2014 then try to fool it. Teaches how AI vision works and why it sometimes fails spectacularly.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Creative',
  },
  {
    id: 'agent-office',
    title: 'Agent Office',
    description: 'Run a pixel art AI startup. Assign agents to tasks, give them tools and instructions, watch them work in real time. Learn why tools, memory, and clear instructions determine everything about whether an AI agent succeeds or fails.',
    tag: 'Game',
    group: 'Play',
    isGame: true,
    difficulty: 'Strategic',
  },
  {
    id: 'model-training-tycoon',
    group: 'Play',
    tag: 'Game',
    title: 'Model Training Tycoon',
    description: 'You have $50,000 and 6 weeks. Train the best AI model you can. Allocate budget across data, architecture, training, and fine-tuning. Survive GPU outages, bad labels, and rival model drops. Learn why garbage data beats a giant model every time.',
    icon: 'model-training-tycoon',
    isGame: true,
    difficulty: 'Strategic',
  },
  {
    id: 'system-design-interview',
    group: 'Play',
    tag: 'Game',
    title: 'System Design Interview',
    description: 'You are in the interview room. Design a real AI system across 7 architecture decisions. Two interviewers push back on every choice. Then your design faces three live incidents. Three scenarios, all replayable. Learn trade-offs by living them.',
    isGame: true,
    difficulty: 'Strategic',
  },
  {
    id: 'prompt-injection',
    group: 'Security',
    tag: 'Security',
    title: 'Prompt Injection Explained',
    description: 'The number one AI security risk according to OWASP 2025. Learn how attackers hijack AI systems using nothing but carefully crafted text — then try the attacks yourself in a live simulation. No coding required.',
    icon: 'prompt-injection',
    accent: '#EF4444',
  },
  {
    id: 'ai-native-pm',
    title: 'AI-Native PM',
    description: 'The deliverables AI engineers actually need from PMs — system instructions, evals, and structured logic. Not PRDs. Not user stories.',
    tag: 'Professional',
    group: 'Professional',
  },
  {
    id: 'ai-safety',
    title: 'AI Safety & Hallucinations',
    description: 'Why AI confidently makes things up — and the practical techniques that stop it. Essential knowledge for anyone building with AI.',
    tag: 'Practical',
    group: 'Skills',
  },
  {
    id: 'ai-fluency',
    title: 'AI Fluency',
    description: 'Most people use 20% of what AI can do. Learn the collaboration skills that separate power users from passive ones — backed by real research.',
    tag: 'Practical',
    group: 'Skills',
  },
  {
    id: 'precision-recall',
    title: 'Precision & Recall',
    description: 'Why accuracy is a lie and what to measure instead. Master TP, TN, FP, FN, precision, recall and F1 through interactive real-world scenarios.',
    tag: 'Technical',
    group: 'Foundations',
  },
  {
    id: 'choosing-ai-model',
    title: 'Choosing the Right AI Model',
    description: 'GPT-5, Claude, Gemini, DeepSeek, Llama — the choice is paralyzing. Learn the framework that cuts through the noise and matches any task to the right model, every time.',
    tag: 'Practical',
    group: 'Skills',
  },
  {
    id: 'ollama',
    title: 'Run AI Locally',
    description: 'No API costs. No data leaving your machine. No rate limits. Learn how Ollama lets you run Llama, Gemma, Mistral and more on your own hardware — and build your own custom AI assistant in minutes.',
    tag: 'Practical',
    group: 'Skills',
  },
  {
    id: 'claude-code',
    title: 'Claude Code',
    description: 'Your AI pair programmer that lives in the terminal. Learn how Claude Code reads your codebase, executes real commands, remembers your conventions via CLAUDE.md, and connects to any tool via MCP.',
    tag: 'Practical',
    group: 'Skills',
  },
  {
    id: 'spec-driven-dev',
    group: 'Skills',
    tag: 'Practical',
    title: 'Spec-Driven Development',
    description: 'Stop vibe coding. Start speccing. Write what you want before AI writes how to build it. Learn the three-document pattern that turns chaotic AI sessions into structured, reviewable, reproducible builds.',
    icon: 'spec-driven-dev',
    accent: '#34C759',
  },
  {
    id: 'ai-coding-tools',
    group: 'Skills',
    tag: 'Practical',
    title: 'AI Coding Tools',
    description: 'Cursor, Copilot, Windsurf, Kiro, Cline — learn the 8 tools every developer needs to know, how they differ, and find the right one for your workflow.',
    icon: 'ai-coding-tools',
    accent: '#34C759',
  },
  {
    id: 'agent-teams',
    title: 'Agent Teams',
    description: 'Subagents are function calls. Agent Teams are organisations. Learn how Claude Code\'s experimental multi-agent feature works: lead agents, teammates, shared task lists, and direct messaging between agents working in parallel.',
    tag: 'Technical',
    group: 'Advanced',
  },
  {
    id: 'custom-agents',
    group: 'Advanced',
    tag: 'Technical',
    title: 'Custom Agents',
    description: 'Define specialist AI assistants for your own workflow. A security auditor, a test writer, a doc generator — each with its own system prompt, tools, model, and memory. Claude delegates to them automatically. One Markdown file. Infinite leverage.',
    icon: 'custom-agents',
    accent: '#5856D6',
  },
  {
    id: 'ai-pm-workflows',
    group: 'Professional',
    tag: 'Professional',
    title: 'AI-Native PM Workflows',
    description: 'The prompts, templates and weekly rhythms that separate AI-native PMs from everyone else. Copy-ready prompts for discovery, planning and stakeholder communication.',
  },
]

const GROUP_NAMES = ['Tools', 'Foundations', 'Security', 'Skills', 'Advanced', 'Play', 'Professional']

const TOTAL_MODULES = NAV_GROUPS.reduce((sum, g) => sum + g.items.length, 0)

function HomeScreen({ onSelectTab, homeFilter, onClearFilter }) {
  const { user, isModuleLocked, isModuleStarted, isModuleComplete, getQuizResult, completedCount } = useAuth()
  const { hiddenModules } = useRelease()
  const [filter, setFilter] = useState('All')
  const [activeGroup, setActiveGroup] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const cardsRef = useRef(null)

  // Apply group pre-filter from breadcrumb navigation
  useEffect(() => {
    if (homeFilter && GROUP_NAMES.includes(homeFilter)) {
      setActiveGroup(homeFilter)
      setFilter('All')
    } else {
      setActiveGroup(null)
    }
  }, [homeFilter])

  function handleFilterClick(f) {
    setFilter(f)
    setActiveGroup(null)
    onClearFilter?.()
  }

  const visibleCards = useMemo(() => CARDS.filter(card => !hiddenModules.has(card.id)), [hiddenModules])
  const visibleTotal = TOTAL_MODULES - hiddenModules.size

  const filteredCards = visibleCards.filter((card) => {
    const matchesGroup = !activeGroup || card.group === activeGroup
    const matchesFilter = filter === 'All' || card.tag === filter
    if (!searchQuery.trim()) return matchesGroup && matchesFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      card.title.toLowerCase().includes(q) ||
      card.description.toLowerCase().includes(q) ||
      card.tag.toLowerCase().includes(q)
    return matchesGroup && matchesFilter && matchesSearch
  })

  const userName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="home-screen">
      <h2 className="home-welcome">What would you like to explore today?</h2>

      {user && (
        <div className="home-progress-summary">
          <div className="home-progress-welcome">Welcome back, {userName}</div>
          <div className="home-progress-bar-wrap">
            <span className="home-progress-text">Progress: {completedCount} / {visibleTotal} modules</span>
            <div className="home-progress-bar">
              <div className="home-progress-fill" style={{ width: `${(completedCount / visibleTotal) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="home-search-wrap">
        <svg className="home-search-icon" viewBox="0 0 20 20" fill="none" width="18" height="18">
          <circle cx="8.5" cy="8.5" r="5.75" stroke="currentColor" strokeWidth="1.8" />
          <line x1="13" y1="13" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          className="home-search-input"
          type="text"
          placeholder="Search tutorials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            className="home-search-clear"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <CrossIcon size={12} color="#8E8E93" />
          </button>
        )}
      </div>

      <div className="home-filters">
        {activeGroup && (
          <button
            className="home-filter-btn home-filter-active home-filter-group"
            onClick={() => { setActiveGroup(null); onClearFilter?.() }}
          >
            {activeGroup}
            <CrossIcon size={10} color="#fff" />
          </button>
        )}
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`home-filter-btn${filter === f && !activeGroup ? ' home-filter-active' : ''}`}
            style={
              filter === f && !activeGroup
                ? { background: FILTER_COLORS[f], color: '#fff' }
                : undefined
            }
            onClick={() => handleFilterClick(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredCards.length === 0 ? (
        <div className="home-no-results">
          <span className="home-no-results-icon"><ModuleIcon module="rag" size={24} /></span>
          <span className="home-no-results-text">
            No modules found for &lsquo;{searchQuery}&rsquo;
          </span>
        </div>
      ) : (
        <div className="home-grid" ref={cardsRef}>
          {filteredCards.map((card, i) => {
            const locked = isModuleLocked(card.id)
            const completed = isModuleComplete(card.id)
            const started = isModuleStarted(card.id)
            const quizResult = getQuizResult(card.id)

            return (
              <button
                key={card.id}
                className={`home-card${card.isGame ? ' home-card-game' : ''}${locked ? ' home-card-locked' : ''}`}
                style={{
                  borderLeftColor: TAG_BORDER_COLORS[card.tag],
                  animationDelay: `${i * 0.08}s`,
                  ...(card.isGame ? { border: '1.5px solid #F59E0B', borderLeft: '1.5px solid #F59E0B' } : {}),
                }}
                onClick={() => onSelectTab(card.id)}
              >
                {locked && (
                  <span className="home-card-lock-icon">
                    <LockIcon size={16} color="var(--text-tertiary, #86868b)" />
                  </span>
                )}
                <span className="home-card-top">
                  <span className="home-card-group">{card.group}</span>
                  {card.isGame ? (
                    <span className="home-card-game-badge">GAME</span>
                  ) : (
                    <span className={`home-card-tag home-tag-${card.tag.toLowerCase()}`}>{card.tag}</span>
                  )}
                </span>
                <span className="home-card-title"><ModuleIcon module={card.id} size={20} style={{ color: FILTER_COLORS[card.tag] }} />{card.title}</span>
                <span className="home-card-desc">{card.description}</span>
                {card.difficulty && (
                  <span className="home-card-difficulty">{card.difficulty}</span>
                )}
                {!locked && (started || completed || quizResult) && (
                  <span className="home-card-badges">
                    {started && !completed && (
                      <span className="home-card-badge" title="In Progress">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </span>
                    )}
                    {completed && (
                      <span className="home-card-badge" title="Done">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="3" />
                          <polyline points="9 12 11.5 14.5 16 9.5" />
                        </svg>
                      </span>
                    )}
                    {quizResult && (
                      <span className="home-card-badge" title="Quiz completed">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="0.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </span>
                    )}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HomeScreen
