import { useState, useEffect, useRef, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, CodeIcon, TerminalIcon, LayersIcon, CpuIcon, CompassIcon, GearIcon, LinkIcon, ShieldIcon, WrenchIcon, SearchIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { aiCodingToolsQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AICodingTools.css'
import { scrollStageToTop } from './scrollUtils.js'

/* ───── Constants ───── */
const ACCENT = '#34C759'

const STAGES = [
  { key: 'categories', label: 'Categories', tooltip: 'Three categories that define the market' },
  { key: 'tools', label: 'The Tools', tooltip: 'Eight tools you need to know' },
  { key: 'finder', label: 'Find Yours', tooltip: 'Find your tool with a quick quiz' },
  { key: 'concepts', label: 'Shared DNA', tooltip: 'What all tools share' },
]

const TOOLKIT = [
  { concept: 'Three Categories', when: 'Orienting yourself in the market', phrase: 'AI-Native IDEs, Extensions, Terminal Agents', icon: <LayersIcon size={24} color="#34C759" /> },
  { concept: 'Tool Profiles', when: 'Comparing specific tools', phrase: 'Standout feature, honest trade-offs', icon: <CpuIcon size={24} color="#34C759" /> },
  { concept: 'Workflow Match', when: 'Choosing your first tool', phrase: 'Where you work determines the category', icon: <CompassIcon size={24} color="#34C759" /> },
  { concept: 'Context Window', when: 'Getting better results from any tool', phrase: 'Big task, fresh session', icon: <SearchIcon size={24} color="#34C759" /> },
  { concept: 'MCP', when: 'Connecting tools to external services', phrase: 'Universal connector across all tools', icon: <LinkIcon size={24} color="#34C759" /> },
  { concept: 'Conventions File', when: 'Starting every session with context', phrase: 'CLAUDE.md, .cursorrules, .windsurfrules', icon: <GearIcon size={24} color="#34C759" /> },
  { concept: 'Agentic Loop', when: 'Understanding why tools succeed or fail', phrase: 'Plan, act, observe, repeat', icon: <TerminalIcon size={24} color="#34C759" /> },
  { concept: 'Review Gates', when: 'Working efficiently with AI', phrase: 'Review plans, not every line', icon: <ShieldIcon size={24} color="#34C759" /> },
]

/* ───── Tool data ───── */
const TOOLS_PER_STAGE = {
  0: [
    { name: 'Cursor', color: '#34C759', desc: 'AI-native IDE, VS Code fork with deep codebase indexing' },
    { name: 'Windsurf', color: '#34C759', desc: 'AI-native IDE by Codeium with real-time action tracking' },
    { name: 'Kiro', color: '#34C759', desc: 'AI-native IDE by Amazon with spec-driven development' },
    { name: 'GitHub Copilot', color: '#34C759', desc: 'AI extension for VS Code, JetBrains, Neovim and more' },
    { name: 'Cline', color: '#34C759', desc: 'Open-source VS Code extension with BYOK model support' },
    { name: 'Claude Code', color: '#34C759', desc: 'Terminal agent by Anthropic with CLAUDE.md memory' },
    { name: 'Continue.dev', color: '#34C759', desc: 'Self-hostable, air-gappable, local model support' },
    { name: 'VS Code', color: '#34C759', desc: 'Microsoft code editor with built-in Copilot and extension ecosystem' },
  ],
  1: [
    { name: 'GitHub Copilot', color: '#34C759', desc: '20M users, works in VS Code, JetBrains, Neovim' },
    { name: 'Cursor', color: '#34C759', desc: '$500M ARR, VS Code fork with Composer agent mode' },
    { name: 'Windsurf', color: '#34C759', desc: 'Cascade agent with real-time action tracking' },
    { name: 'Kiro', color: '#34C759', desc: 'Spec-driven development with EARS notation' },
    { name: 'Cline', color: '#34C759', desc: '5M+ installs, BYOK, real-time cost display' },
    { name: 'Claude Code', color: '#34C759', desc: 'Terminal agent with CLAUDE.md, skills, hooks, MCP' },
    { name: 'Continue.dev', color: '#34C759', desc: 'Self-hostable, air-gappable, local model support' },
    { name: 'VS Code', color: '#34C759', desc: 'Free editor with built-in Copilot and agent mode' },
  ],
  2: [
    { name: 'Cursor', color: '#34C759', desc: 'AI-native IDE with Composer agent mode' },
    { name: 'GitHub Copilot', color: '#34C759', desc: 'Most widely used AI coding extension' },
    { name: 'Claude Code', color: '#34C759', desc: 'Terminal agent by Anthropic' },
    { name: 'Cline', color: '#34C759', desc: 'Open-source VS Code extension with BYOK' },
    { name: 'Windsurf', color: '#34C759', desc: 'AI-native IDE with Cascade agent' },
  ],
  3: [
    { name: 'Cursor', color: '#34C759', desc: 'Uses .cursorrules conventions file' },
    { name: 'Claude Code', color: '#34C759', desc: 'Uses CLAUDE.md conventions file, MCP, skills' },
    { name: 'Windsurf', color: '#34C759', desc: 'Uses .windsurfrules conventions file' },
    { name: 'Cline', color: '#34C759', desc: 'Uses .clinerules, supports MCP' },
    { name: 'GitHub Copilot', color: '#34C759', desc: 'Uses copilot-instructions.md' },
    { name: 'Continue.dev', color: '#34C759', desc: 'Uses .continuerules, self-hostable' },
  ],
}

/* ───── Tool profile data ───── */
const TOOL_PROFILES = [
  {
    name: 'GitHub Copilot',
    category: 'AI Extension',
    catClass: 'ext',
    price: 'Free | $10/mo | $19/mo',
    hasFree: true,
    intro: 'THE VETERAN. 20M users. $2B ARR. Works in VS Code, JetBrains, Neovim, Vim, Emacs, and Visual Studio.',
    different: 'The only tool where AI is the company\u2019s core business AND deeply integrated with GitHub. It knows your pull requests, your issues, your code review history. Copilot Pro+ now runs Claude and Codex agents natively in VS Code.',
    bestFor: [
      'Developers in the GitHub ecosystem',
      'Teams that need wide IDE support',
      'Anyone starting out ($10/mo is hard to beat)',
      'Enterprise (90% of Fortune 100 uses it)',
    ],
    good: 'Cheapest all-inclusive option. Works everywhere. GitHub integration.',
    notGood: 'Less powerful context understanding than Cursor for large complex codebases. Some features lag behind AI-native IDE competitors.',
    standout: '/install-github-app command sets up automatic PR review. Claude reviews every PR you open. Catches logic errors humans often miss.',
  },
  {
    name: 'Cursor',
    category: 'AI-Native IDE',
    catClass: 'ide',
    price: 'Free (limited) | $20/mo | $60/mo',
    hasFree: true,
    intro: 'THE POWER TOOL. $500M+ ARR. Half the Fortune 500 uses it. VS Code fork with AI rebuilt into the core.',
    different: 'Cursor indexes your entire codebase. When you describe a change, it understands all the files it touches, all the imports, all the dependencies. Composer (the agent mode) can edit dozens of files in one go while keeping changes coherent. Now supports up to 8 parallel subagents.',
    bestFor: [
      'Complex multi-file refactors',
      'Large codebases where context matters',
      'Teams willing to pay for the best editor-integrated AI experience',
      'Developers who live in VS Code and want to stay there',
    ],
    good: 'Best-in-class codebase understanding. Familiar VS Code UI. Fastest for complex work.',
    notGood: 'Most expensive of the IDEs. Proprietary fork — workflows may not transfer to vanilla VS Code. Credits burn fast with heavy agent use.',
    standout: 'Background agents work while you keep coding. Assign a task, keep working, come back to results.',
  },
  {
    name: 'Windsurf',
    category: 'AI-Native IDE',
    catClass: 'ide',
    price: 'Free tier | $15/mo',
    hasFree: true,
    intro: 'THE CHALLENGER. Built by Codeium. Cursor\u2019s closest competitor at a lower price.',
    different: 'Cascade is Windsurf\u2019s agent — it tracks what you are doing in real time. Rename a variable, Cascade notices and updates it everywhere. The IDE watches your actions, not just your prompts. Memories persist context across sessions.',
    bestFor: [
      'Developers who want Cursor-level quality at a lower price point',
      'Those who value real-time awareness (Cascade\u2019s tracking is genuinely useful)',
      'Budget-conscious teams',
    ],
    good: 'Best value in AI-native IDEs. Real-time action tracking. Generous free tier.',
    notGood: 'Smaller ecosystem than Cursor. Less polish in some edge cases. Fewer community resources.',
    standout: 'Supercomplete predicts your next moves by analyzing what is before AND after your cursor. Smarter than standard one-direction autocomplete.',
  },
  {
    name: 'Kiro',
    category: 'AI-Native IDE',
    catClass: 'ide',
    price: 'Free (50 credits/mo) | $20/mo',
    hasFree: true,
    intro: 'THE STRUCTURED ONE. Built by Amazon. The only major IDE built around spec-driven development by default.',
    different: 'Instead of prompting then building, Kiro adds a planning layer: prompt, then spec (requirements.md + design.md + tasks.md), then review, then build. Also has Hooks: event-driven automations that fire when you save files (update tests, check security, refresh docs).',
    bestFor: [
      'Teams building production systems, not just prototypes',
      'Developers frustrated by vibe coding\u2019s lack of structure',
      'AWS-heavy shops (though works with any stack)',
      'Anyone learning spec-driven workflows',
    ],
    good: 'Unique spec-driven workflow. Hooks are genuinely useful automation. Free tier is workable.',
    notGood: 'Newest of the group — rougher edges, smaller community. Credit-based pricing is less predictable. Still building its ecosystem.',
    standout: 'EARS notation (Easy Approach to Requirements Syntax) turns your natural language into formal acceptance criteria automatically. The only tool that makes requirements rigorous by default.',
  },
  {
    name: 'Cline',
    category: 'AI Extension',
    catClass: 'ext',
    price: 'Free (open source) + your API cost',
    hasFree: true,
    intro: 'THE OPEN-SOURCE POWERHOUSE. 5M+ VS Code installs. BYOK (bring your own API key). Zero subscription.',
    different: 'Cline is a VS Code extension that connects directly to any AI model via your own API key. No middleman, no markup, no lock-in. It is fully transparent about token usage and cost in real time. The agentic capabilities match commercial tools: reads files, runs terminal commands, browses URLs, edits across the whole project. Added native subagents in early 2026.',
    bestFor: [
      'Developers who want full control over models and costs',
      'Open-source advocates',
      'Teams that want to use Claude, GPT-5, or any model without a middleman',
      'Privacy-conscious developers (your code goes directly to the model, not through an intermediate company)',
    ],
    good: 'Free. Full model choice. Transparent. More flexible than any commercial tool.',
    notGood: 'You manage your own API keys and costs. Weaker models feel agentic in name only. Less polish than Cursor. Setup takes more effort.',
    standout: 'Real-time cost display as you work. See exactly how many tokens each task used and exactly what it cost. No surprises on your API bill.',
  },
  {
    name: 'Claude Code',
    category: 'Terminal Agent',
    catClass: 'terminal',
    price: 'Claude Pro $20/mo | Max $100/mo | API',
    hasFree: false,
    intro: 'THE ANTHROPIC TERMINAL AGENT. This app has a full tutorial on Claude Code — this is a brief profile for comparison.',
    different: 'Lives entirely in the terminal. Not a plugin, not an IDE — a standalone agent. You give it a task, it reads your codebase, plans, edits files, runs tests, commits. The most autonomous category. Agent Teams (experimental) allow multiple Claude Code sessions to coordinate in parallel.',
    bestFor: [
      'Developers comfortable in the terminal',
      'Delegating whole features, not just getting suggestions',
      'Teams using CLAUDE.md for shared memory',
      'Complex agentic workflows with custom agents, skills, hooks, and MCP',
    ],
    good: 'Most powerful agentic capabilities. CLAUDE.md memory system is unmatched. Skills, hooks, custom agents.',
    notGood: 'Terminal-only (no visual IDE). Steeper learning curve. Not for quick inline suggestions.',
    standout: 'CLAUDE.md memory file makes every session context-aware. Write your conventions once. Every session starts knowing your stack, patterns, and standards.',
    linkTab: 'claude-code',
  },
  {
    name: 'Continue.dev',
    category: 'AI Extension',
    catClass: 'ext',
    price: 'Free (open source) + your API cost',
    hasFree: true,
    intro: 'THE PRIVATE ENTERPRISE CHOICE. Open-source. Self-hostable. Air-gappable. The only mainstream tool where your code never leaves your infrastructure.',
    different: 'Continue.dev is designed for teams where code cannot leave the building: financial services, defence, healthcare, legal. Supports local models (Ollama) alongside cloud APIs. Fully configurable. Runs in VS Code and JetBrains.',
    bestFor: [
      'Enterprise teams with strict data residency requirements',
      'Developers who want to use local models (via Ollama) for offline work',
      'Teams that need self-hosted control',
      'Security-conscious organisations',
    ],
    good: 'Maximum privacy. Self-hosted. Works with local models. Free.',
    notGood: 'More setup than commercial tools. Context understanding depends entirely on which model you connect. Smaller community than Cline.',
    standout: 'Runs entirely on-premises with Ollama + local models. Write code with AI that never touches the internet.',
  },
  {
    name: 'VS Code',
    category: 'AI-Native IDE',
    catClass: 'ide',
    price: 'Free',
    hasFree: true,
    intro: 'THE DEFAULT. The world\u2019s most popular code editor. Now ships with Copilot built in and an agent mode that runs Claude, GPT, and Gemini natively.',
    different: 'VS Code is no longer just an editor with extensions bolted on. Copilot is built into the core. Agent mode lets you run multi-file tasks with tool use, terminal access, and MCP support — all inside VS Code. It is the baseline every other tool is measured against.',
    bestFor: [
      'Developers who already use VS Code and want AI without switching',
      'Teams that need a free, stable, well-supported option',
      'Anyone who wants Copilot + Claude + Gemini in one place',
      'Beginners who want the safest default',
    ],
    good: 'Free. Massive ecosystem. Built-in Copilot. Agent mode with multi-model support.',
    notGood: 'Agent mode is newer and less polished than Cursor\u2019s Composer. Codebase indexing less deep than AI-native IDEs. Extensions can conflict.',
    standout: 'Agent mode with MCP support lets VS Code connect to any external tool — databases, APIs, browsers — without leaving the editor. Free.',
  },
]

/* ───── Finder Quiz data ───── */
const FINDER_QUESTIONS = [
  {
    question: 'Where do you spend most of your time?',
    options: [
      'In my editor, mostly one file at a time',
      'In my editor, refactoring across many files',
      'In the terminal',
      'Mix of all three',
    ],
  },
  {
    question: 'How do you feel about switching editors?',
    options: [
      'I am happy to switch for a better tool',
      'I would rather not — I like my setup',
      'I use the terminal, so it does not matter',
    ],
  },
  {
    question: 'What matters most to you right now?',
    options: [
      'Getting started quickly, low friction',
      'Maximum AI capability, I will pay for it',
      'Full control — my models, my costs',
      'Privacy — my code stays local',
    ],
  },
  {
    question: 'How much are you willing to pay monthly?',
    options: [
      '$0 — free or pay-per-token only',
      '$10–15 — reasonable subscription',
      '$20+ — I want the best, cost is secondary',
    ],
  },
]

/* scoring weights for finder quiz */
function computeFinderResult(answers) {
  const scores = {
    'GitHub Copilot': 0,
    'Cursor': 0,
    'Windsurf': 0,
    'Kiro': 0,
    'Cline': 0,
    'Claude Code': 0,
    'Continue.dev': 0,
    'VS Code': 0,
  }

  // Q1 — Where do you spend most of your time?
  if (answers[0] === 0) { scores['GitHub Copilot'] += 2; scores['Cline'] += 1; scores['VS Code'] += 2 }
  if (answers[0] === 1) { scores['Cursor'] += 3; scores['Windsurf'] += 2; scores['Kiro'] += 1; scores['VS Code'] += 1 }
  if (answers[0] === 2) { scores['Claude Code'] += 3; scores['Cline'] += 1 }
  if (answers[0] === 3) { scores['GitHub Copilot'] += 1; scores['Cursor'] += 1; scores['Cline'] += 1; scores['VS Code'] += 1 }

  // Q2 — Switching editors?
  if (answers[1] === 0) { scores['Cursor'] += 2; scores['Windsurf'] += 2; scores['Kiro'] += 1 }
  if (answers[1] === 1) { scores['GitHub Copilot'] += 2; scores['Cline'] += 2; scores['Continue.dev'] += 1; scores['VS Code'] += 3 }
  if (answers[1] === 2) { scores['Claude Code'] += 2 }

  // Q3 — What matters most?
  if (answers[2] === 0) { scores['GitHub Copilot'] += 2; scores['Windsurf'] += 1; scores['VS Code'] += 2 }
  if (answers[2] === 1) { scores['Cursor'] += 3; scores['Claude Code'] += 1 }
  if (answers[2] === 2) { scores['Cline'] += 3; scores['Continue.dev'] += 1 }
  if (answers[2] === 3) { scores['Continue.dev'] += 3; scores['Cline'] += 1 }

  // Q4 — Budget?
  if (answers[3] === 0) { scores['Cline'] += 3; scores['Continue.dev'] += 2; scores['Claude Code'] += 1; scores['VS Code'] += 3 }
  if (answers[3] === 1) { scores['GitHub Copilot'] += 3; scores['Windsurf'] += 2; scores['VS Code'] += 1 }
  if (answers[3] === 2) { scores['Cursor'] += 3; scores['Claude Code'] += 2; scores['Kiro'] += 1 }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  return { primary: sorted[0][0], secondary: sorted[1][0] }
}

function getFinderExplanation(answers, tool) {
  const parts = []
  if (tool === 'GitHub Copilot') parts.push('Your answers point toward a tool that works everywhere with low friction.')
  else if (tool === 'Cursor') parts.push('Your workflow involves complex multi-file work and you value maximum AI capability.')
  else if (tool === 'Windsurf') parts.push('You want strong AI-native IDE features at a more accessible price point.')
  else if (tool === 'Kiro') parts.push('Structure matters to you — Kiro\u2019s spec-driven workflow matches that priority.')
  else if (tool === 'Cline') parts.push('Full control over models and costs is your priority. Cline gives you that with zero lock-in.')
  else if (tool === 'Claude Code') parts.push('You are comfortable in the terminal and want to delegate entire tasks, not just get suggestions.')
  else if (tool === 'Continue.dev') parts.push('Privacy and self-hosting are non-negotiable for your workflow.')
  else if (tool === 'VS Code') parts.push('You want a free, familiar editor with built-in AI. VS Code with Copilot and agent mode gives you that without switching tools.')

  if (answers[0] === 2) parts.push('Your terminal-first workflow means you want an agent, not an IDE extension.')
  if (answers[2] === 3) parts.push('Your privacy requirement narrows the field to self-hostable, open-source options.')
  if (answers[3] === 0) parts.push('At $0/mo, only BYOK and open-source tools qualify.')

  return parts.join(' ')
}

const FREE_TOOLS = new Set(['GitHub Copilot', 'Cursor', 'Windsurf', 'Kiro', 'Cline', 'Continue.dev', 'VS Code'])

function getToolCategory(name) {
  const profile = TOOL_PROFILES.find(t => t.name === name)
  return profile ? profile.catClass : 'ext'
}

/* ───── Ladder data ───── */
const LADDER_STEPS = [
  { label: 'Beginner', detail: 'Using autocomplete suggestions inline. Accepting or rejecting line by line. One file at a time.' },
  { label: 'Intermediate', detail: 'Using chat to explain, refactor, generate tests. Multi-file awareness. Writing conventions files.' },
  { label: 'Advanced', detail: 'Agentic task delegation. Custom agents or subagents. MCP integrations. Spec-driven or structured workflows. Reviewing plans, not every line.' },
  { label: 'Expert', detail: 'Building custom workflows, hooks, skills. Mixing tools strategically. Treating AI as a colleague with specific strengths to route tasks to.' },
]

/* ───── SVG icons for category cards ───── */
function IDEIcon({ color }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <path d="M8 7l4 4-4 4" />
      <circle cx="18" cy="5" r="1.5" fill={color} stroke="none" />
    </svg>
  )
}

function ExtensionIcon({ color }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M4 7V4a2 2 0 0 1 2-2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5" />
      <rect x="1" y="12" width="6" height="6" rx="1" />
      <path d="M4 12v-2M4 18v2" />
    </svg>
  )
}

function TerminalAgentIcon({ color }) {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="6 9 9 12 6 15" />
      <line x1="12" y1="15" x2="18" y2="15" />
    </svg>
  )
}

/* ───── Shared concepts data ───── */
const SHARED_CONCEPTS = [
  {
    label: 'Context Window',
    body: 'The amount of information the AI can hold at once. Managing it well is the single highest-leverage skill.',
    example: 'Cursor context · Cline context window · Claude Code 200K tokens · Copilot per-file',
  },
  {
    label: 'Model Context Protocol',
    body: 'The open standard that lets AI tools connect to external services. Set up once, works across all major tools.',
    example: 'Works across: Cursor · Windsurf · Cline · Claude Code · Kiro · Continue.dev',
  },
  {
    label: 'Conventions File',
    body: 'Write your stack, conventions, and preferences once. Every AI session starts knowing them.',
    example: 'CLAUDE.md · .cursorrules · .windsurfrules · .clinerules · steering files',
  },
  {
    label: 'Agentic Loop',
    body: 'Every modern AI coding tool operates on the same loop. Understanding it helps you write better prompts for any tool.',
    example: 'Plan → Act → Observe → Repeat',
  },
  {
    label: 'Review Gates',
    body: 'Define the task clearly, let the agent work, review the complete output. Correct the plan, not individual lines.',
    example: 'Review plans and complete outputs, not individual suggestions.',
  },
]

/* ─────────────────────────────────────────
   COMPONENT
   ───────────────────────────────────────── */
export default function AICodingTools({ onSwitchTab }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ai-coding-tools', -1)
  const [showEntry, setShowEntry] = useState(stage === -1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [fading, setFading] = useState(false)
  const [maxStageReached, setMaxStageReached] = useState(stage)
  const activeStepRef = useRef(null)
  const [learnTipFading, setLearnTipFading] = useState(false)

  /* learn tips */
  const [learnTip, setLearnTip] = useState(null)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)

  /* Stage 1 — open tool card */
  const [openTool, setOpenTool] = useState(null)

  /* Stage 2 — finder quiz */
  const [finderAnswers, setFinderAnswers] = useState([null, null, null, null])
  const [finderStep, setFinderStep] = useState(0)
  const [finderResult, setFinderResult] = useState(null)
  const [quizFading, setQuizFading] = useState(false)

  /* Stage 3 — fluency ladder */
  const [activeLadderStep, setActiveLadderStep] = useState(null)

  /* ── Learn tip dismiss ── */
  const dismissLearnTip = useCallback(() => {
    setLearnTipFading(true)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(prev => {
        if (prev) setDismissedTips(s => new Set(s).add(prev))
        return null
      })
      setLearnTipFading(false)
    }, 300)
  }, [])

  /* learn tip triggers */
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('tools')) {
      setLearnTip('tools')
    } else if (stage === 2 && !dismissedTips.has('finder')) {
      setLearnTip('finder')
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  useEffect(() => {
    if (stage < 0) return
    const cancel = scrollStageToTop('.act-module', activeStepRef)
    return cancel
  }, [stage])

  /* update max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  /* ── Navigation ── */
  function handleStart() {
    setShowEntry(false)
    setStage(0)
    setShowWelcome(true)
    markModuleStarted('ai-coding-tools')
  }

  function handleNext() {
    if (stage < STAGES.length - 1) {
      setStage(s => s + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setFading(false)
        markModuleComplete('ai-coding-tools')
        requestAnimationFrame(() => {
          let el = document.querySelector('.act-module')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 250)
    }
  }

  function handleBack() {
    if (stage > 0) setStage(s => s - 1)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowEntry(true)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
    setOpenTool(null)
    setFinderAnswers([null, null, null, null])
    setFinderStep(0)
    setFinderResult(null)
    setActiveLadderStep(null)
  }

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  /* Finder quiz answer */
  function handleFinderAnswer(answerIdx) {
    const newAnswers = [...finderAnswers]
    newAnswers[finderStep] = answerIdx
    setFinderAnswers(newAnswers)

    setQuizFading(true)
    setTimeout(() => {
      if (finderStep < FINDER_QUESTIONS.length - 1) {
        setFinderStep(finderStep + 1)
      } else {
        setFinderResult(computeFinderResult(newAnswers))
      }
      setQuizFading(false)
    }, 250)
  }

  function handleRetakeQuiz() {
    setFinderAnswers([null, null, null, null])
    setFinderStep(0)
    setFinderResult(null)
  }

  const NEXT_LABELS = [
    'Eight tools you need to know →',
    'Find your tool →',
    'What all tools share →',
    'Test my knowledge →',
  ]

  /* ── Quiz ── */
  if (showQuiz) {
    return (
      <Quiz
        questions={aiCodingToolsQuiz}
        tabName="AI Coding Tools"
        accentColor={ACCENT}
        onBack={() => setShowQuiz(false)}
        onStartOver={handleStartOver}
        onSwitchTab={onSwitchTab}
        currentModuleId="ai-coding-tools"
      />
    )
  }

  /* ── Entry Screen ── */
  if (showEntry) {
    return (
      <EntryScreen
        icon={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ModuleIcon module="ai-coding-tools" size={48} style={{ color: ACCENT }} />
          </div>
        }
        title="AI Coding Tools"
        subtitle="The Market, the Players, Your Pick"
        description={<>By 2026, 85% of developers use AI coding tools. The problem is no longer finding one &mdash; it is knowing which one fits your workflow. This tour maps the landscape: three categories, eight tools, one framework for choosing, and the concepts that transfer across all of them.</>}
        buttonText="Explore the Market"
        onStart={handleStart}
      />
    )
  }

  /* ── Main Render ── */
  return (
    <div className="how-llms act-module">
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>
          &larr; Start over
        </button>
      )}

      {/* Welcome banner */}
      {showWelcome && stage === 0 && !showFinal && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to AI Coding Tools</strong> &mdash; Four stages. First the big picture: three categories that organise the whole market. Then eight tool profiles, one per card. Then a four-question quiz that recommends your starting point. Finally the shared concepts that make you fluent across all of them.
            <ol className="module-welcome-steps">
              <li>Three <strong>categories</strong> that define the whole market</li>
              <li>Eight <strong>tool profiles</strong> with honest trade-offs</li>
              <li>A quick <strong>quiz</strong> that recommends your starting point</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper */}
      {stage >= 0 && !showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper act-stepper">
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div className="how-step-label">
                        {s.label}
                        <Tooltip text={s.tooltip} />
                      </div>
                    </div>
                    {i < STAGES.length - 1 && (
                      <div className={`how-step-arrow ${stage > i ? 'how-arrow-active' : ''}`}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stage Content */}
      {!showFinal && stage >= 0 && (
        <div className="how-content">
          <div className={`how-stage how-fade-in${fading ? ' how-fading' : ''}`} key={stage}>

            {/* ═══════════════════════════════════════
                STAGE 0 — The Three Categories
               ═══════════════════════════════════════ */}
            {stage === 0 && (
              <div className="how-info-card how-info-card-edu">
                <strong>How the Market Is Organised</strong>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 16px' }}>
                  <b>The direction of travel:</b> In 2024, these categories were distinct. In 2026, they are blurring. Cursor now has background agents. VS Code now runs Claude Code and Codex side by side. Cline added terminal-level agentic power. The convergence is real &mdash; but the mental model still holds for choosing your primary tool.
                </p>

                <p>Every AI coding tool fits into one of three categories. Understanding the categories is more useful than memorising individual products &mdash; tools come and go, but the categories are stable.</p>

                <div className="act-category-cards">
                  {/* AI-Native IDEs */}
                  <div className="act-category-card" style={{ borderTop: '3px solid #5856D6' }}>
                    <IDEIcon color="#5856D6" />
                    <div className="act-category-label">AI-Native IDEs</div>
                    <div className="act-category-tagline">Replace your editor</div>
                    <div className="act-category-desc">
                      A full code editor rebuilt from the ground up with AI at the centre. The IDE indexes your entire codebase — AI understands every file, function, and dependency. VS Code blurs the line — not AI-native by origin, but with built-in Copilot and agent mode it now competes on features.
                    </div>
                    <div className="act-category-tools">
                      {['VS Code', 'Cursor', 'Windsurf', 'Kiro'].map(t => (
                        <span key={t} className="act-category-tool-pill act-category-tool-pill--ide">{t}</span>
                      ))}
                    </div>
                    <div className="act-category-tradeoffs">
                      Trade-offs: Best-in-class context &bull; You switch editors &bull; $15–$40/mo
                    </div>
                    <div className="act-category-bestif">Best if: You want max AI power</div>
                  </div>

                  {/* AI Extensions */}
                  <div className="act-category-card" style={{ borderTop: '3px solid #FF9500' }}>
                    <ExtensionIcon color="#FF9500" />
                    <div className="act-category-label">AI Extensions</div>
                    <div className="act-category-tagline">Add AI to your editor</div>
                    <div className="act-category-desc">
                      A plugin that adds AI to your existing editor. You keep VS Code, JetBrains, Neovim — whatever you use — and add AI on top.
                    </div>
                    <div className="act-category-tools">
                      {['Copilot', 'Cline', 'Continue.dev'].map(t => (
                        <span key={t} className="act-category-tool-pill act-category-tool-pill--ext">{t}</span>
                      ))}
                    </div>
                    <div className="act-category-tradeoffs">
                      Trade-offs: Zero disruption &bull; Wide IDE support &bull; Free to $10/mo
                    </div>
                    <div className="act-category-bestif">Best if: You love your current setup</div>
                  </div>

                  {/* Terminal Agents */}
                  <div className="act-category-card" style={{ borderTop: '3px solid #34C759' }}>
                    <TerminalAgentIcon color="#34C759" />
                    <div className="act-category-label">Terminal Agents</div>
                    <div className="act-category-tagline">AI in the command line</div>
                    <div className="act-category-desc">
                      AI that lives in your terminal, not your editor. You give it a task. It reads files, runs commands, edits code, runs tests — autonomously. Aider is another popular option in this space.
                    </div>
                    <div className="act-category-tools">
                      {['Claude Code', 'Codex CLI'].map(t => (
                        <span key={t} className="act-category-tool-pill act-category-tool-pill--terminal">{t}</span>
                      ))}
                    </div>
                    <div className="act-category-tradeoffs">
                      Trade-offs: Most autonomous &bull; No IDE UI &bull; Subscription or pay-per-token
                    </div>
                    <div className="act-category-bestif">Best if: You want to delegate full tasks</div>
                  </div>
                </div>

                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  Most experienced developers use tools from MORE than one category. Common combination in 2026: Copilot for everyday inline suggestions + Claude Code for complex multi-file tasks. Different tools for different jobs, not brand loyalty.
                </div>

                <ToolChips tools={TOOLS_PER_STAGE[0]} />
              </div>
            )}

            {/* ═══════════════════════════════════════
                STAGE 1 — Seven Tool Profiles
               ═══════════════════════════════════════ */}
            {stage === 1 && (
              <div className="how-info-card how-info-card-edu">
                <strong>The Tools Worth Knowing</strong>

                <p>Eight tools dominate conversation in 2026. Each profile covers: what it is, who it is for, what makes it different, and honest trade-offs. No winner &mdash; just a map.</p>

                <div className="act-tool-cards">
                  {TOOL_PROFILES.map(tool => (
                    <div key={tool.name} className={`act-tool-card${openTool === tool.name ? ' act-tool-card--open' : ''}`}>
                      <div className="act-tool-header" onClick={() => setOpenTool(openTool === tool.name ? null : tool.name)}>
                        <span className="act-tool-name">{tool.name}</span>
                        <span className={`act-cat-pill act-cat-pill--${tool.catClass}`}>{tool.category}</span>
                        <span className="act-tool-price">{tool.price}</span>
                        <svg className="act-tool-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                      <div className="act-tool-body">
                        <div className="act-tool-intro">{tool.intro}</div>

                        <div className="act-tool-section-title">What Makes It Different</div>
                        <div className="act-tool-description">{tool.different}</div>

                        <div className="act-tool-section-title">Best For</div>
                        <div className="act-tool-bestfor">
                          {tool.bestFor.map((item, i) => (
                            <div key={i} className="act-tool-bestfor-item">
                              <span className="act-tool-bestfor-bullet" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div className="act-tool-section-title">Honest Trade-offs</div>
                        <div className="act-tool-tradeoffs">
                          <div className="act-tradeoff-row">
                            <CheckIcon size={14} color="#34C759" className="act-tradeoff-icon" />
                            <span><b>Good:</b> {tool.good}</span>
                          </div>
                          <div className="act-tradeoff-row">
                            <WarningIcon size={14} color="#FF9500" className="act-tradeoff-icon" />
                            <span><b>Not as good:</b> {tool.notGood}</span>
                          </div>
                        </div>

                        <div className="act-tool-section-title">Standout Feature</div>
                        <div className="act-tool-standout">{tool.standout}</div>

                        {tool.linkTab && (
                          <button className="act-tool-link" onClick={() => onSwitchTab(tool.linkTab)}>
                            &rarr; See the Claude Code tutorial for the full deep dive
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="act-stats-row">
                  <span className="act-stat-badge">GitHub Copilot: 20M users</span>
                  <span className="act-stat-badge">Cursor: $500M ARR</span>
                  <span className="act-stat-badge">Cline: 5M+ installs</span>
                  <span className="act-stat-badge">85% of devs use AI tools</span>
                </div>

                <div className="how-info-tip" style={{ marginTop: 16 }}>
                  <TipIcon size={16} color="#eab308" />
                  The tool that wins is the one you actually use every day. More developers spend time debating tools than using them. Pick one from the category that fits your workflow. Use it for a real project. Switch if it does not work for you. That cycle beats any comparison article.
                </div>

                <ToolChips tools={TOOLS_PER_STAGE[1]} />
              </div>
            )}

            {/* ═══════════════════════════════════════
                STAGE 2 — Finder Quiz
               ═══════════════════════════════════════ */}
            {stage === 2 && (
              <div className="how-info-card how-info-card-edu">
                <strong>What&rsquo;s Your Coding Style?</strong>

                <p>Four questions. Thirty seconds. A personalised recommendation with an honest explanation of why.</p>

                <div className="act-quiz">
                  {/* Previous locked answers */}
                  {finderStep > 0 && !finderResult && (
                    <div className="act-locked-answers">
                      {finderAnswers.slice(0, finderStep).map((ans, qi) => (
                        ans !== null && (
                          <span key={qi} className="act-locked-answer">
                            Q{qi + 1}: {FINDER_QUESTIONS[qi].options[ans]}
                          </span>
                        )
                      ))}
                    </div>
                  )}

                  {!finderResult && (
                    <div className={`act-quiz-body${quizFading ? ' act-quiz-fading' : ''}`}>
                      <div className="act-quiz-progress">Question {finderStep + 1} of {FINDER_QUESTIONS.length}</div>
                      <div className="act-quiz-question">{FINDER_QUESTIONS[finderStep].question}</div>
                      <div className="act-answers">
                        {FINDER_QUESTIONS[finderStep].options.map((opt, idx) => (
                          <button
                            key={idx}
                            className={`act-answer${finderAnswers[finderStep] === idx ? ' act-answer--selected' : ''}`}
                            onClick={() => handleFinderAnswer(idx)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {finderResult && (
                    <div className="act-result act-quiz-appear">
                      <div className="act-result-label">Your recommended starting point:</div>
                      <div className="act-result-tool">{finderResult.primary}</div>
                      <span className={`act-cat-pill act-cat-pill--${getToolCategory(finderResult.primary)}`} style={{ marginBottom: 8 }}>
                        {TOOL_PROFILES.find(t => t.name === finderResult.primary)?.category}
                      </span>

                      {FREE_TOOLS.has(finderResult.primary) && (
                        <span className="act-result-free">Try it free</span>
                      )}

                      <div className="act-result-why-title">Why this fits you:</div>
                      <div className="act-result-why">{getFinderExplanation(finderAnswers, finderResult.primary)}</div>

                      <div className="act-result-also">
                        Also worth trying: <span className="act-result-also-name">{finderResult.secondary}</span>
                      </div>

                      <div className="act-result-note">
                        Remember: the best tool is the one you actually ship with. Try your recommendation for one real project before deciding.
                      </div>

                      <button className="act-retake-btn" onClick={handleRetakeQuiz}>Retake quiz</button>
                    </div>
                  )}
                </div>

                <div className="how-info-tip" style={{ marginTop: 20 }}>
                  <TipIcon size={16} color="#eab308" />
                  This quiz gives you a starting point, not a final answer. The developers who get the most out of AI tools are the ones who keep re-evaluating as the tools evolve. The market shifts every few months. What fits you today may not be the best fit in six months.
                </div>

                <ToolChips tools={TOOLS_PER_STAGE[2]} />
              </div>
            )}

            {/* ═══════════════════════════════════════
                STAGE 3 — Shared Concepts
               ═══════════════════════════════════════ */}
            {stage === 3 && (
              <div className="how-info-card how-info-card-edu">
                <strong>The Concepts That Transfer</strong>

                <p>Switch tools and the UI changes. The underlying concepts do not. Learn these once and you are fluent across the whole market.</p>

                <div className="act-concepts-grid">
                  {SHARED_CONCEPTS.map(concept => (
                    <div key={concept.label} className="act-concept-card">
                      <div className="act-concept-label">{concept.label}</div>
                      <div className="act-concept-body">{concept.body}</div>
                      <div className="act-concept-example">{concept.example}</div>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 600, margin: '24px 0 8px' }}>The Tool Fluency Ladder</h4>

                <div className="act-ladder">
                  {LADDER_STEPS.map((step, idx) => (
                    <div key={step.label} className="act-ladder-step" onClick={() => setActiveLadderStep(activeLadderStep === idx ? null : idx)}>
                      <div className={`act-ladder-circle${activeLadderStep === idx ? ' act-ladder-circle--active' : ''}`}>
                        {idx + 1}
                      </div>
                      <span className="act-ladder-label">{step.label}</span>
                      {activeLadderStep === idx && (
                        <div className="act-ladder-detail">{step.detail}</div>
                      )}
                    </div>
                  ))}
                </div>

                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 12, textAlign: 'center' }}>
                  You can navigate the AI coding tools market. Pick one. Start today.
                </p>

                <ToolChips tools={TOOLS_PER_STAGE[3]} />
              </div>
            )}

            {/* Learn tip */}
            {learnTip && (
              <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
                <TipIcon size={16} color="#eab308" />
                <span>
                  {learnTip === 'tools' && 'Click each tool card to expand it — the "Standout Feature" row at the bottom of each card is the fastest way to understand what genuinely differentiates each tool from the others. Tools often look similar on paper until you see what they do that nobody else does.'}
                  {learnTip === 'finder' && 'Answer all four questions honestly — especially question 3. The "full control" vs "maximum capability" vs "privacy" split does the most work in distinguishing Cline, Cursor, and Continue.dev. Most people think they want maximum capability when they actually want low friction.'}
                </span>
                <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="how-nav-buttons">
              {stage > 0 && (
                <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              )}
              <button className="how-gotit-btn" onClick={handleNext} style={{ background: ACCENT }}>
                {NEXT_LABELS[stage]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          FINAL SCREEN
         ═══════════════════════════════════════ */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now know the AI coding tools landscape!</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your AI Coding Tools Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
                </tr>
              </thead>
              <tbody>
                {TOOLKIT.map((item) => (
                  <tr key={item.concept}>
                    <td className="pe-ref-technique">{item.concept}</td>
                    <td>{item.when}</td>
                    <td className="pe-ref-phrase">{item.phrase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
            <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
          </div>
          <SuggestedModules currentModuleId="ai-coding-tools" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
