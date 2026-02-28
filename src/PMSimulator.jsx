import { useState, useCallback, useRef, useEffect } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, CrossIcon, WarningIcon, TipIcon, UserIcon, BarChartIcon, ShieldIcon, SearchIcon, FileIcon, GearIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import './PMSimulator.css'

/* ── SVG Avatars ────────────────────────────────── */
function CEOAvatar() {
  return (
    <svg className="pms-avatar" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="19" stroke="var(--border)" fill="var(--bg-surface)" />
      <circle cx="20" cy="16" r="5" />
      <path d="M10 34c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <path d="M15 10l5-4 5 4" strokeWidth="1" />
    </svg>
  )
}

function EngineerAvatar() {
  return (
    <svg className="pms-avatar" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="19" stroke="var(--border)" fill="var(--bg-surface)" />
      <circle cx="20" cy="16" r="5" />
      <path d="M10 34c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <path d="M16 13h8" strokeWidth="1" />
    </svg>
  )
}

function CustomerAvatar() {
  return (
    <svg className="pms-avatar" viewBox="0 0 40 40" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="20" cy="20" r="19" stroke="var(--border)" fill="var(--bg-surface)" />
      <circle cx="20" cy="16" r="5" />
      <path d="M10 34c0-5.5 4.5-10 10-10s10 4.5 10 10" />
      <path d="M17 20l-2 2M23 20l2 2" strokeWidth="1" />
    </svg>
  )
}

/* ── Quality scoring ────────────────────────────── */
function scoreSection(text, keywords) {
  if (!text.trim()) return 0
  const lower = text.toLowerCase()
  const base = Math.min(text.trim().length / 40, 1) * 40
  let bonus = 0
  keywords.forEach(kw => {
    if (lower.includes(kw.toLowerCase())) bonus += 12
  })
  return Math.min(Math.round(base + bonus), 100)
}

function scoreInstructions(sections) {
  const scores = [
    scoreSection(sections.identity, ['you are', 'name', 'role', 'nexus', 'assistant', 'company']),
    scoreSection(sections.scope, ['can help', 'cannot', 'able to', 'support', 'not able', 'outside']),
    scoreSection(sections.behavior, ['tone', 'professional', 'friendly', 'format', 'respond', 'concise', 'warm', 'direct']),
    scoreSection(sections.constraints, ['never', 'do not', 'must not', 'pricing', 'competitor', 'unreleased']),
    scoreSection(sections.escalation, ['transfer', 'human', 'escalate', 'agent', 'when', 'if']),
  ]
  return Math.round(scores.reduce((a, b) => a + b, 0) / 5)
}

/* ── Eval scoring ───────────────────────────────── */
function scoreEval(ev) {
  if (!ev.input.trim() || !ev.expected.trim() || !ev.pass.trim()) return 0
  let s = 30
  if (ev.input.length > 15) s += 20
  if (ev.expected.length > 15) s += 20
  if (ev.pass.length > 10) s += 30
  return Math.min(s, 100)
}

/* ── Mission data ───────────────────────────────── */
const MISSIONS = [
  { id: 0, name: 'Write the System Instructions', days: 5 },
  { id: 1, name: 'Design the Test Suite', days: 4 },
  { id: 2, name: 'Something Went Wrong', days: 3 },
  { id: 3, name: 'Drift Detected', days: 2 },
  { id: 4, name: 'The Final Review', days: 1 },
]

/* ── Office SVG ─────────────────────────────────── */
function OfficeSVG() {
  return (
    <svg className="pms-office-svg" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Product manager at desk in Nexus AI office">
      <rect x="20" y="30" width="240" height="80" rx="6" stroke="var(--border)" strokeWidth="1.5" fill="var(--bg-card)" />
      <rect x="40" y="10" width="200" height="30" rx="4" stroke="#0EA5E9" strokeWidth="1.5" fill="var(--bg-card)" />
      <text x="140" y="30" textAnchor="middle" fill="#0EA5E9" fontSize="12" fontWeight="700" fontFamily="inherit">NEXUS AI</text>
      <rect x="40" y="50" width="50" height="40" rx="3" stroke="var(--border)" strokeWidth="1" fill="var(--bg-surface)" />
      <rect x="115" y="50" width="50" height="40" rx="3" stroke="var(--border)" strokeWidth="1" fill="var(--bg-surface)" />
      <rect x="190" y="50" width="50" height="40" rx="3" stroke="var(--border)" strokeWidth="1" fill="var(--bg-surface)" />
      <line x1="65" y1="65" x2="65" y2="75" stroke="var(--text-tertiary)" strokeWidth="1" />
      <line x1="60" y1="70" x2="70" y2="70" stroke="var(--text-tertiary)" strokeWidth="1" />
      <line x1="140" y1="65" x2="140" y2="75" stroke="var(--text-tertiary)" strokeWidth="1" />
      <line x1="135" y1="70" x2="145" y2="70" stroke="var(--text-tertiary)" strokeWidth="1" />
      <line x1="215" y1="65" x2="215" y2="75" stroke="var(--text-tertiary)" strokeWidth="1" />
      <line x1="210" y1="70" x2="220" y2="70" stroke="var(--text-tertiary)" strokeWidth="1" />
    </svg>
  )
}

/* ── Celebration SVG ────────────────────────────── */
function CelebrationSVG() {
  return (
    <svg className="pms-celebration-svg" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Team celebrating successful AI feature launch">
      <rect x="20" y="30" width="240" height="80" rx="6" stroke="var(--border)" strokeWidth="1.5" fill="var(--bg-card)" />
      <rect x="40" y="10" width="200" height="30" rx="4" stroke="#34C759" strokeWidth="1.5" fill="var(--bg-card)" />
      <text x="140" y="30" textAnchor="middle" fill="#34C759" fontSize="12" fontWeight="700" fontFamily="inherit">NEXUS AI — SHIPPED</text>
      <circle cx="80" cy="70" r="12" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
      <circle cx="140" cy="70" r="12" stroke="#34C759" strokeWidth="1.5" fill="none" />
      <circle cx="200" cy="70" r="12" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <path d="M76 68l3 3 5-5" stroke="#0EA5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M136 68l3 3 5-5" stroke="#34C759" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M196 68l3 3 5-5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M70 90h20M130 90h20M190 90h20" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

/* ── Mission hints ──────────────────────────────── */
const MISSION_HINTS = [
  // Mission 1 — System Instructions
  [
    'Start your IDENTITY with "You are [Name], a..." — give the AI a name and role at the company.',
    'SCOPE should include both what the AI can do AND what it cannot. Try: "You can help with... You cannot help with..."',
    'CONSTRAINTS need to be specific and testable. "Never discuss pricing" is better than "be careful about money".',
    'ESCALATION triggers should be binary — "If the customer asks for a refund, transfer to a human agent."',
  ],
  // Mission 2 — Eval Suite
  [
    'Good evals have specific, binary pass conditions. "Response contains reset link or steps" is better than "response is helpful".',
    'Safety evals should test boundaries — what should the AI refuse to answer? Test those refusals explicitly.',
    'Quality evals test tone and format, not just correctness. Try testing how the AI handles an angry customer.',
    'Each eval should test one thing. If your pass condition has "and", consider splitting into two evals.',
  ],
  // Mission 3 — Hallucination Incident
  [
    'The best fix is specific and testable. "Only discuss integrations listed at [URL]" grounds the AI in a source of truth.',
    'A good eval for this incident would check that the AI references the official integrations page, not general knowledge.',
    'When an AI hallucinates to a customer, the right response addresses the customer AND fixes the root cause.',
  ],
  // Mission 4 — Drift Detected
  [
    'Model updates change behavior. The first step is always: identify what changed and lock the version.',
    'Your fix should be a specific instruction rule, not a vague guideline. "Never compare pricing with competitors" beats "be careful about competitors".',
    'New evals should be regression tests — they test the exact scenarios that broke, so you catch drift immediately next time.',
  ],
  // Mission 5 — Final Review
  [
    'Edge cases: the safest response is always to redirect to a human for anything risky (legal, billing, security).',
    'Pick monitoring metrics that directly measure user experience — quality score, hallucination rate, and resolution rate are strong choices.',
    'A rollback plan should have automatic triggers. If quality drops below your threshold, the system should alert immediately.',
  ],
]

/* ── Model solutions (autofill) ─────────────────── */
const MODEL_SOLUTIONS = {
  m1: {
    identity: 'You are Aria, the Nexus AI Customer Assistant. You are a professional, friendly support agent for Nexus AI\'s SaaS platform.',
    scope: 'You can help with account setup, password resets, billing questions, feature explanations, troubleshooting, and general product guidance. You cannot help with custom development, third-party integrations not listed on our integrations page, or issues outside the Nexus AI platform.',
    behavior: 'Respond in a professional, warm, and direct tone. Use short paragraphs. Provide step-by-step instructions when troubleshooting. Always confirm the user\'s issue before suggesting a solution.',
    constraints: 'Never discuss pricing or discounts — redirect to the sales team. Never mention competitors by name or compare features. Never share information about unreleased features or internal roadmaps. Never provide legal, financial, or medical advice.',
    escalation: 'Transfer to a human agent when the customer explicitly requests it, when the issue involves billing disputes or refunds, when the customer expresses extreme frustration after two attempts to help, or when the question is outside your defined scope.',
  },
  m2: [
    { input: 'How do I reset my password?', expected: 'Step-by-step password reset instructions', pass: 'Response contains specific steps or a reset link URL', tab: 'functional' },
    { input: 'Can I upgrade my plan?', expected: 'Information about plan options or redirect to sales', pass: 'Response mentions available plans or directs to sales team', tab: 'functional' },
    { input: 'What do your competitors charge?', expected: 'Polite decline without naming competitors', pass: 'Response contains no competitor names or pricing', tab: 'safety' },
    { input: 'Tell me about your unreleased roadmap features', expected: 'Decline and redirect to public changelog', pass: 'Response does not mention unreleased features', tab: 'safety' },
    { input: 'I am really frustrated, nothing works!', expected: 'Empathetic acknowledgment followed by troubleshooting offer', pass: 'Response acknowledges frustration and offers specific next step', tab: 'quality' },
    { input: 'Thanks for your help!', expected: 'Warm closing that invites further questions', pass: 'Response is warm and offers continued assistance', tab: 'quality' },
    { input: 'How do I connect my CRM?', expected: 'Reference to integrations page with supported CRMs', pass: 'Response references official integrations page', tab: 'functional' },
    { input: 'Can you give me a discount on my subscription?', expected: 'Redirect to sales team without making promises', pass: 'Response redirects to sales without discussing pricing', tab: 'safety' },
  ],
  m3: [0, 0, 1], // correct choice indices per decision
  m4: {
    rootCause: 1,
    response: 0,
    fix1: 'Never discuss or compare competitor pricing, features, or products. If asked about competitors, respond: "I can help you with Nexus AI features. For comparison information, please visit our website."',
    fix2: 'Only respond to questions that fall within the defined support scope. If the request is outside scope, respond: "This falls outside what I can help with. Let me connect you with a team member."',
    eval1: { input: 'How does your pricing compare to Competitor X?', expected: 'Decline without naming competitor', pass: 'Response contains no competitor names or price comparisons' },
    eval2: { input: 'Can you help me with something outside your product?', expected: 'Polite scope boundary + redirect', pass: 'Response states limitation and offers human handoff' },
  },
  m5: {
    edges: [0, 0, 0],
    risks: ['Integration claims', 'Competitor comparisons'],
    metrics: ['Quality score', 'Hallucination rate', 'Resolution rate'],
    rollback: ['Quality score drops below threshold', 'Error rate exceeds 5%'],
  },
}

/* ══════════════════════════════════════════════════
   PM SIMULATOR — Main Component
   ══════════════════════════════════════════════════ */
function PMSimulator({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  // ── Game state ─────────────────────────────────
  const [started, setStarted] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [currentMission, setCurrentMission] = useState(0)
  const [shipScore, setShipScore] = useState(0)
  const [missionScores, setMissionScores] = useState([0, 0, 0, 0, 0])
  const [daysRemaining, setDaysRemaining] = useState(5)
  const [gameComplete, setGameComplete] = useState(false)
  const [showConsequence, setShowConsequence] = useState(false)
  const [consequenceText, setConsequenceText] = useState('')
  const [consequenceType, setConsequenceType] = useState('') // 'success' | 'warning' | 'error'
  const [missionComplete, setMissionComplete] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [hintsRevealed, setHintsRevealed] = useState([0, 0, 0, 0, 0]) // per-mission hint count
  const [showSolution, setShowSolution] = useState(false)

  // ── Mission 1 state ────────────────────────────
  const [m1Identity, setM1Identity] = useState('')
  const [m1Scope, setM1Scope] = useState('')
  const [m1Behavior, setM1Behavior] = useState('')
  const [m1Constraints, setM1Constraints] = useState('')
  const [m1Escalation, setM1Escalation] = useState('')
  const [m1Quality, setM1Quality] = useState(0)
  const [m1Submitted, setM1Submitted] = useState(false)

  // ── Mission 2 state ────────────────────────────
  const [m2Evals, setM2Evals] = useState([
    { input: '', expected: '', pass: '', tab: 'functional' },
    { input: '', expected: '', pass: '', tab: 'functional' },
    { input: '', expected: '', pass: '', tab: 'safety' },
    { input: '', expected: '', pass: '', tab: 'safety' },
    { input: '', expected: '', pass: '', tab: 'quality' },
    { input: '', expected: '', pass: '', tab: 'quality' },
    { input: '', expected: '', pass: '', tab: 'functional' },
    { input: '', expected: '', pass: '', tab: 'functional' },
  ])
  const [m2ActiveTab, setM2ActiveTab] = useState('functional')
  const [m2Submitted, setM2Submitted] = useState(false)

  // ── Mission 3 state ────────────────────────────
  const [m3Decisions, setM3Decisions] = useState([null, null, null])
  const [m3Step, setM3Step] = useState(0)
  const [m3Submitted, setM3Submitted] = useState(false)

  // ── Mission 4 state ────────────────────────────
  const [m4Step, setM4Step] = useState(0)
  const [m4RootCause, setM4RootCause] = useState(null)
  const [m4Response, setM4Response] = useState(null)
  const [m4Fix1, setM4Fix1] = useState('')
  const [m4Fix2, setM4Fix2] = useState('')
  const [m4Eval1, setM4Eval1] = useState({ input: '', expected: '', pass: '' })
  const [m4Eval2, setM4Eval2] = useState({ input: '', expected: '', pass: '' })
  const [m4Submitted, setM4Submitted] = useState(false)

  // ── Mission 5 state ────────────────────────────
  const [m5Checklist, setM5Checklist] = useState(Array(10).fill(false))
  const [m5Edge1, setM5Edge1] = useState(null)
  const [m5Edge2, setM5Edge2] = useState(null)
  const [m5Edge3, setM5Edge3] = useState(null)
  const [m5Risks, setM5Risks] = useState([])
  const [m5ModelLocked, setM5ModelLocked] = useState(false)
  const [m5Metrics, setM5Metrics] = useState([])
  const [m5Threshold, setM5Threshold] = useState(80)
  const [m5Rollback, setM5Rollback] = useState([])
  const [m5Submitted, setM5Submitted] = useState(false)

  const gameRef = useRef(null)
  const timerRef = useRef([])

  useEffect(() => {
    return () => { timerRef.current.forEach(clearTimeout) }
  }, [])

  function scrollToTop() {
    requestAnimationFrame(() => {
      let el = gameRef.current
      while (el) {
        if (el.scrollTop > 0) el.scrollTop = 0
        el = el.parentElement
      }
      window.scrollTo(0, 0)
    })
  }

  /* ── Hint system ───────────────────────────────── */
  const missionHints = MISSION_HINTS[currentMission] || []
  const revealedCount = hintsRevealed[currentMission]
  const visibleHints = missionHints.slice(0, revealedCount)
  const hasMoreHints = revealedCount < missionHints.length

  function revealNextHint() {
    setHintsRevealed(prev => {
      const n = [...prev]
      n[currentMission] = Math.min(n[currentMission] + 1, missionHints.length)
      return n
    })
  }

  const allHintsUsed = !hasMoreHints && revealedCount > 0

  function handleAutofill() {
    setShowSolution(true)
    if (currentMission === 0) {
      setM1Identity(MODEL_SOLUTIONS.m1.identity)
      setM1Scope(MODEL_SOLUTIONS.m1.scope)
      setM1Behavior(MODEL_SOLUTIONS.m1.behavior)
      setM1Constraints(MODEL_SOLUTIONS.m1.constraints)
      setM1Escalation(MODEL_SOLUTIONS.m1.escalation)
    } else if (currentMission === 1) {
      setM2Evals(MODEL_SOLUTIONS.m2)
    } else if (currentMission === 2) {
      setM3Decisions(MODEL_SOLUTIONS.m3)
    } else if (currentMission === 3) {
      setM4RootCause(MODEL_SOLUTIONS.m4.rootCause)
      setM4Response(MODEL_SOLUTIONS.m4.response)
      setM4Fix1(MODEL_SOLUTIONS.m4.fix1)
      setM4Fix2(MODEL_SOLUTIONS.m4.fix2)
      setM4Eval1(MODEL_SOLUTIONS.m4.eval1)
      setM4Eval2(MODEL_SOLUTIONS.m4.eval2)
      setM4Step(3)
    } else if (currentMission === 4) {
      setM5Edge1(MODEL_SOLUTIONS.m5.edges[0])
      setM5Edge2(MODEL_SOLUTIONS.m5.edges[1])
      setM5Edge3(MODEL_SOLUTIONS.m5.edges[2])
      setM5Risks(MODEL_SOLUTIONS.m5.risks)
      setM5ModelLocked(true)
      setM5Metrics(MODEL_SOLUTIONS.m5.metrics)
      setM5Threshold(80)
      setM5Rollback(MODEL_SOLUTIONS.m5.rollback)
      setM5Checklist([true, true, true, true, true, true, true, true, true, false])
    }
  }

  useEffect(() => {
    if (started) return
    setVisibleLines(0)
    const t1 = setTimeout(() => setVisibleLines(1), 300)
    const t2 = setTimeout(() => setVisibleLines(2), 600)
    const t3 = setTimeout(() => setVisibleLines(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [started])

  /* ── Start game ───────────────────────────────── */
  const handleStart = useCallback(() => {
    setStarted(true)
    markModuleStarted('pm-simulator')
  }, [markModuleStarted])

  /* ── Reset game ───────────────────────────────── */
  const handleReset = useCallback(() => {
    timerRef.current.forEach(clearTimeout)
    timerRef.current = []
    setCurrentMission(0)
    setShipScore(0)
    setMissionScores([0, 0, 0, 0, 0])
    setDaysRemaining(5)
    setGameComplete(false)
    setHintsRevealed([0, 0, 0, 0, 0])
    setShowSolution(false)
    setShowConsequence(false)
    setConsequenceText('')
    setConsequenceType('')
    setMissionComplete(false)
    setContextCollapsed(false)
    setM1Identity('')
    setM1Scope('')
    setM1Behavior('')
    setM1Constraints('')
    setM1Escalation('')
    setM1Quality(0)
    setM1Submitted(false)
    setM2Evals([
      { input: '', expected: '', pass: '', tab: 'functional' },
      { input: '', expected: '', pass: '', tab: 'functional' },
      { input: '', expected: '', pass: '', tab: 'safety' },
      { input: '', expected: '', pass: '', tab: 'safety' },
      { input: '', expected: '', pass: '', tab: 'quality' },
      { input: '', expected: '', pass: '', tab: 'quality' },
      { input: '', expected: '', pass: '', tab: 'functional' },
      { input: '', expected: '', pass: '', tab: 'functional' },
    ])
    setM2ActiveTab('functional')
    setM2Submitted(false)
    setM3Decisions([null, null, null])
    setM3Step(0)
    setM3Submitted(false)
    setM4Step(0)
    setM4RootCause(null)
    setM4Response(null)
    setM4Fix1('')
    setM4Fix2('')
    setM4Eval1({ input: '', expected: '', pass: '' })
    setM4Eval2({ input: '', expected: '', pass: '' })
    setM4Submitted(false)
    setM5Checklist(Array(10).fill(false))
    setM5Edge1(null)
    setM5Edge2(null)
    setM5Edge3(null)
    setM5Risks([])
    setM5ModelLocked(false)
    setM5Metrics([])
    setM5Threshold(80)
    setM5Rollback([])
    setM5Submitted(false)
    scrollToTop()
  }, [])

  /* ── Show consequence bar ─────────────────────── */
  function showConsequenceBar(text, type) {
    setConsequenceText(text)
    setConsequenceType(type)
    setShowConsequence(true)
  }

  /* ── Advance to next mission ──────────────────── */
  function advanceMission() {
    const next = currentMission + 1
    if (next >= MISSIONS.length) {
      setGameComplete(true)
      markModuleComplete('pm-simulator')
      scrollToTop()
    } else {
      setCurrentMission(next)
      setDaysRemaining(MISSIONS[next].days)
      setShowConsequence(false)
      setMissionComplete(false)
      setContextCollapsed(false)
      setShowSolution(false)
      scrollToTop()
    }
  }

  /* ══════════════════════════════════════════════════
     MISSION 1 — Write the System Instructions
     ══════════════════════════════════════════════════ */
  // Update quality meter in real time
  useEffect(() => {
    if (currentMission !== 0 || m1Submitted) return
    const q = scoreInstructions({ identity: m1Identity, scope: m1Scope, behavior: m1Behavior, constraints: m1Constraints, escalation: m1Escalation })
    setM1Quality(q)
  }, [m1Identity, m1Scope, m1Behavior, m1Constraints, m1Escalation, currentMission, m1Submitted])

  function submitMission1() {
    const quality = m1Quality
    setM1Submitted(true)
    let points = 0
    let text = ''
    let type = ''

    if (quality >= 90) {
      points = 20
      text = 'Engineering says: "Finally! A spec we can actually build against. Starting immediately."'
      type = 'success'
    } else if (quality >= 70) {
      points = 12
      text = 'Engineering says: "Good start, a few gaps but we can work with this."'
      type = 'success'
    } else if (quality >= 50) {
      points = 5
      text = 'Engineering says: "This is pretty vague. We will need a lot of clarification meetings."'
      type = 'warning'
      setDaysRemaining(prev => Math.max(prev - 1, 0))
    } else {
      points = 0
      text = 'Engineering says: "We cannot build from this. Please rewrite."'
      type = 'error'
      setDaysRemaining(prev => Math.max(prev - 1, 0))
      setM1Submitted(false)
      showConsequenceBar(text, type)
      return
    }

    setShipScore(prev => prev + points)
    setMissionScores(prev => { const n = [...prev]; n[0] = points; return n })
    setMissionComplete(true)
    showConsequenceBar(text, type)
  }

  /* ══════════════════════════════════════════════════
     MISSION 2 — Design the Test Suite
     ══════════════════════════════════════════════════ */
  function updateEval(index, field, value) {
    setM2Evals(prev => {
      const n = [...prev]
      n[index] = { ...n[index], [field]: value }
      return n
    })
  }

  function getEvalCounts() {
    const filled = m2Evals.filter(e => e.input.trim() && e.expected.trim() && e.pass.trim())
    return {
      total: filled.length,
      functional: filled.filter(e => e.tab === 'functional').length,
      safety: filled.filter(e => e.tab === 'safety').length,
      quality: filled.filter(e => e.tab === 'quality').length,
    }
  }

  function submitMission2() {
    const counts = getEvalCounts()
    setM2Submitted(true)

    if (counts.total < 8 || counts.functional < 2 || counts.safety < 2 || counts.quality < 2) {
      showConsequenceBar('Lead Eng: "Not enough evals. Cannot approve without full coverage."', 'error')
      setM2Submitted(false)
      return
    }

    const avgQuality = m2Evals.reduce((s, e) => s + scoreEval(e), 0) / m2Evals.length
    let points = 0
    let text = ''
    let type = ''

    if (avgQuality >= 70) {
      points = 20
      text = 'Lead Eng: "Excellent test suite. Approving for build."'
      type = 'success'
    } else {
      points = 10
      text = 'Lead Eng: "Evals are vague. Adding them anyway — but we may miss failures."'
      type = 'warning'
    }

    setShipScore(prev => prev + points)
    setMissionScores(prev => { const n = [...prev]; n[1] = points; return n })
    setMissionComplete(true)
    showConsequenceBar(text, type)
  }

  /* ══════════════════════════════════════════════════
     MISSION 3 — The Hallucination Incident
     ══════════════════════════════════════════════════ */
  const M3_OPTIONS = [
    {
      question: 'How do you fix the instruction?',
      choices: [
        { label: 'Add: "Only discuss integrations listed at integrations page URL"', correct: true },
        { label: 'Add: "Be careful about integrations"', correct: false },
        { label: 'Add: "Don\'t make things up"', correct: false },
        { label: 'Remove the topic entirely', correct: false },
      ],
    },
    {
      question: 'What eval do you add?',
      choices: [
        { label: 'Input: "Do you integrate with Salesforce?" Pass: response references integrations page', correct: true },
        { label: 'Input: "What integrations do you have?" Pass: response sounds reasonable', correct: false },
        { label: 'Input: "Salesforce integration question" Pass: any response', correct: false },
      ],
    },
    {
      question: 'What do you do about the customer?',
      choices: [
        { label: 'Blame the AI — it made a mistake not us', correct: false },
        { label: 'Apologize, fix the AI, offer remedy', correct: true },
        { label: 'Tell them to read the docs more carefully', correct: false },
        { label: 'Say the AI is in beta and mistakes happen', correct: false },
      ],
    },
  ]

  function selectM3Decision(choiceIdx) {
    const newDec = [...m3Decisions]
    newDec[m3Step] = choiceIdx
    setM3Decisions(newDec)
  }

  function submitM3Step() {
    if (m3Step < 2) {
      setM3Step(m3Step + 1)
    } else {
      submitMission3()
    }
  }

  function submitMission3() {
    setM3Submitted(true)
    let correct = 0
    m3Decisions.forEach((d, i) => {
      if (d !== null && M3_OPTIONS[i].choices[d]?.correct) correct++
    })

    let points = 0
    let text = ''
    let type = ''

    if (correct === 3) {
      points = 20
      text = 'CEO: "Handled perfectly. The customer stayed and the fix is in production."'
      type = 'success'
    } else if (correct === 2) {
      points = 12
      text = 'CEO: "Good instincts, but one call could have been better. Customer is recovering."'
      type = 'warning'
    } else {
      points = 5
      text = 'CEO: "We lost the customer. Let\'s make sure this never happens again."'
      type = 'error'
    }

    setShipScore(prev => prev + points)
    setMissionScores(prev => { const n = [...prev]; n[2] = points; return n })
    setMissionComplete(true)
    showConsequenceBar(text, type)
  }

  /* ══════════════════════════════════════════════════
     MISSION 4 — Drift Detected
     ══════════════════════════════════════════════════ */
  const M4_EVAL_RESULTS = [
    { name: 'Password reset', current: 'PASS', previous: 'PASS' },
    { name: 'Competitor pricing', current: 'FAIL', previous: 'PASS', drift: true },
    { name: 'Angry customer', current: 'PASS', previous: 'PASS' },
    { name: 'Scope boundary', current: 'FAIL', previous: 'PASS', drift: true },
    { name: 'Friendly greeting', current: 'PASS', previous: 'PASS' },
  ]

  function submitMission4() {
    setM4Submitted(true)
    let points = 0
    let correct = 0

    if (m4RootCause === 1) correct++ // "The model update changed behavior"
    if (m4Response === 0) correct++ // "Lock the model version"
    if (m4Fix1.trim().length > 20) correct++
    if (m4Fix2.trim().length > 20) correct++
    const hasEvals = m4Eval1.input.trim() && m4Eval1.pass.trim() && m4Eval2.input.trim() && m4Eval2.pass.trim()
    if (hasEvals) correct++

    let text, type
    if (correct >= 4) {
      points = 20
      text = 'Drift resolved. Ship score recovers. All evals passing again.'
      type = 'success'
    } else if (correct >= 2) {
      points = 10
      text = 'Partial fix. Some evals still unstable. Monitoring closely.'
      type = 'warning'
    } else {
      points = 5
      text = 'Drift unresolved. Feature quality degrading. Need more work.'
      type = 'error'
    }

    setShipScore(prev => prev + points)
    setMissionScores(prev => { const n = [...prev]; n[3] = points; return n })
    setMissionComplete(true)
    showConsequenceBar(text, type)
  }

  /* ══════════════════════════════════════════════════
     MISSION 5 — The Final Review
     ══════════════════════════════════════════════════ */
  const M5_METRICS = ['Response latency', 'Token usage', 'Quality score', 'Escalation rate', 'User satisfaction', 'Error rate', 'Hallucination rate', 'Resolution rate']
  const M5_RISKS = ['Pricing discussions', 'Competitor comparisons', 'Integration claims', 'Legal advice', 'Personal data exposure']
  const M5_ROLLBACK = ['Quality score drops below threshold', 'Error rate exceeds 5%', 'Customer complaints spike', 'Eval pass rate drops below 80%']

  const M5_EDGE_CASES = [
    { input: 'I want to cancel my subscription and sue you', options: ['Redirect to human support', 'Try to resolve the complaint', 'Discuss legal implications'] },
    { input: 'Can you help me hack into another account?', options: ['Firmly decline and explain why', 'Ignore the request', 'Report to admin only'] },
    { input: 'Your competitor XYZ is cheaper. Why should I stay?', options: ['Redirect to value proposition without naming competitors', 'Agree XYZ is cheaper', 'Discuss competitor pricing'] },
  ]

  function toggleM5Check(idx) {
    setM5Checklist(prev => { const n = [...prev]; n[idx] = !n[idx]; return n })
  }

  function toggleM5Metric(m) {
    setM5Metrics(prev => prev.includes(m) ? prev.filter(x => x !== m) : prev.length < 3 ? [...prev, m] : prev)
  }

  function toggleM5Risk(r) {
    setM5Risks(prev => prev.includes(r) ? prev.filter(x => x !== r) : prev.length < 2 ? [...prev, r] : prev)
  }

  function toggleM5Rollback(r) {
    setM5Rollback(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  function canSubmitM5() {
    const edgeDone = m5Edge1 !== null && m5Edge2 !== null && m5Edge3 !== null
    const risksDone = m5Risks.length === 2
    const metricsDone = m5Metrics.length === 3
    const rollbackDone = m5Rollback.length >= 1
    return edgeDone && risksDone && m5ModelLocked && metricsDone && rollbackDone
  }

  function submitMission5() {
    setM5Submitted(true)
    let points = 0

    // Score edge cases (correct answers: 0, 0, 0)
    if (m5Edge1 === 0) points += 3
    if (m5Edge2 === 0) points += 3
    if (m5Edge3 === 0) points += 3
    // Model locked
    if (m5ModelLocked) points += 2
    // Metrics (any 3 is fine)
    if (m5Metrics.length === 3) points += 3
    // Risks (any 2 is fine)
    if (m5Risks.length === 2) points += 3
    // Rollback
    if (m5Rollback.length >= 1) points += 3

    points = Math.min(points, 20)

    let text, type
    if (points >= 17) {
      text = 'Pre-ship review complete. You are ready to launch.'
      type = 'success'
    } else if (points >= 10) {
      text = 'Review has gaps. Proceeding with caution.'
      type = 'warning'
    } else {
      text = 'Too many gaps in the review. Needs more work before ship.'
      type = 'error'
    }

    setShipScore(prev => prev + points)
    setMissionScores(prev => { const n = [...prev]; n[4] = points; return n })
    setMissionComplete(true)
    showConsequenceBar(text, type)
  }

  /* ── Rank calculation ─────────────────────────── */
  function getRank() {
    const total = shipScore
    if (total >= 90) return { title: 'AI-Native PM: Expert', message: 'Flawless execution. This is what AI-native PM looks like. The feature launched with zero critical incidents.' }
    if (total >= 75) return { title: 'AI-Native PM: Proficient', message: 'Feature shipped with minor issues. Two edge cases failed in week 1 — caught by your eval system and fixed within hours.' }
    if (total >= 60) return { title: 'AI-Native PM: Developing', message: 'Feature shipped but had a rough first week. Three hallucination incidents made it to users. Your eval suite caught the pattern — fixed in week 2.' }
    return { title: 'AI-Native PM: Learning', message: 'Feature was pulled 3 days after launch. Multiple hallucination incidents, no eval baseline to diagnose from, no monitoring to detect drift. The good news: now you know what to do next time.' }
  }

  /* ── Hint block (reusable JSX) ──────────────────── */
  const hintBlock = !missionComplete && (
    <div className="pms-hints-section">
      {visibleHints.length > 0 && (
        <div className="pms-hint-list">
          {visibleHints.map((h, i) => (
            <div className="pms-hint-box" key={i}>
              <TipIcon size={14} color="#eab308" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      )}
      {hasMoreHints && (
        <button className="pms-hint-btn" onClick={revealNextHint}>
          <TipIcon size={14} color="#eab308" />
          {revealedCount === 0 ? 'Need a hint?' : 'Another hint?'}
          {revealedCount > 0 && <span className="pms-hint-count">({revealedCount} used)</span>}
        </button>
      )}
      {allHintsUsed && !showSolution && (
        <button className="pms-hint-btn pms-autofill-btn" onClick={handleAutofill}>
          Still stuck? Autofill model answer
        </button>
      )}
      {showSolution && (
        <div className="pms-solution-notice">
          <CheckIcon size={14} /> Model answer applied — review and submit, or edit first.
        </div>
      )}
    </div>
  )

  /* ══════════════════════════════════════════════════
     RENDER — Entry Screen
     ══════════════════════════════════════════════════ */
  if (!started) {
    return (
      <div className="pms-entry-wrap">
        <EntryScreen
          icon={<ModuleIcon module="pm-simulator" size={64} style={{ color: '#F59E0B' }} />}
          title="PM Simulator"
          taglines={['Ship it.', 'Or watch it burn.']}
          visibleLines={visibleLines}
          description="You just joined Nexus AI as Lead PM. Your first task: ship the AI customer assistant. Write the system instructions. Design the evals. Fix what breaks. Every decision has consequences."
          buttonText="Join Nexus AI"
          buttonClassName="entry-screen-btn-game"
          onStart={handleStart}
        >
          <div className="pms-entry-meta">5 missions &middot; Decisions matter</div>
        </EntryScreen>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════
     RENDER — Completion Screen
     ══════════════════════════════════════════════════ */
  if (gameComplete) {
    const rank = getRank()
    return (
      <div className="pms-game" ref={gameRef}>
        <div className="pms-complete">
          <CelebrationSVG />

          <h1 className="pms-complete-title">
            {shipScore >= 90 ? 'Nexus AI Customer Assistant — SHIPPED' : shipScore >= 60 ? 'Feature Shipped' : 'Launch Postponed'}
          </h1>
          <p className="pms-complete-subtitle">{rank.message}</p>

          <div className="pms-rank-card">
            <div className="pms-rank-label">Your Rank</div>
            <div className="pms-rank-title">{rank.title}</div>
          </div>

          <div className="pms-score-breakdown">
            <h3 className="pms-score-heading">Score Breakdown</h3>
            {MISSIONS.map((m, i) => (
              <div className="pms-score-row" key={m.id}>
                <span className="pms-score-name">Mission {i + 1} — {m.name}</span>
                <span className="pms-score-value">{missionScores[i]}/20</span>
              </div>
            ))}
            <div className="pms-score-row pms-score-total">
              <span className="pms-score-name">Total</span>
              <span className="pms-score-value">{shipScore}/100</span>
            </div>
          </div>

          <div className="pms-shipped-with">
            <h3 className="pms-shipped-heading">What you shipped with</h3>
            <div className="pms-shipped-item"><CheckIcon size={16} /> System instructions: {m1Quality}/100 quality</div>
            <div className="pms-shipped-item"><CheckIcon size={16} /> Eval suite: {getEvalCounts().total} tests</div>
            <div className="pms-shipped-item"><CheckIcon size={16} /> Hallucination fixes applied</div>
            <div className="pms-shipped-item"><CheckIcon size={16} /> Drift monitoring: active</div>
            <div className="pms-shipped-item"><CheckIcon size={16} /> Pre-ship review: complete</div>
          </div>

          <div className="pms-learned">
            <h3 className="pms-learned-heading">What you learned</h3>
            <div className="pms-learned-item"><CheckIcon size={16} /> System instruction anatomy</div>
            <div className="pms-learned-item"><CheckIcon size={16} /> Eval design (functional, safety, quality)</div>
            <div className="pms-learned-item"><CheckIcon size={16} /> Hallucination diagnosis and prevention</div>
            <div className="pms-learned-item"><CheckIcon size={16} /> Model drift detection and response</div>
            <div className="pms-learned-item"><CheckIcon size={16} /> AI-native PM pre-ship checklist</div>
          </div>

          <div className="pms-complete-actions">
            <button className="pms-btn-primary" onClick={handleReset}>Ship Another Product</button>
            <button className="pms-btn-outline" onClick={onGoHome}>Back to Home</button>
          </div>

          <SuggestedModules currentModuleId="pm-simulator" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════════════
     RENDER — Game Screen
     ══════════════════════════════════════════════════ */
  const mission = MISSIONS[currentMission]

  return (
    <div className="pms-game" ref={gameRef}>
      {/* ── Mission Header ────────────────────────── */}
      <div className="pms-mission-bar">
        <div className="pms-mission-badge">MISSION {String(currentMission + 1).padStart(2, '0')} / 05</div>
        <div className="pms-mission-name">{mission.name}</div>
        <div className="pms-mission-stats">
          <div className="pms-stat">
            <span className="pms-stat-label">Ship score</span>
            <div className="pms-progress-bar">
              <div className="pms-progress-fill" style={{ width: `${shipScore}%` }} />
            </div>
            <span className="pms-stat-value">{shipScore}/100</span>
          </div>
          <div className="pms-stat">
            <span className="pms-stat-label">Days remaining</span>
            <span className="pms-stat-value pms-days">{daysRemaining}</span>
          </div>
        </div>
      </div>

      {/* ── Layout: Context + Work panels ─────────── */}
      <div className="pms-layout">
        {/* ── Context Panel ─────────────────────────── */}
        <div className={`pms-context-panel ${contextCollapsed ? 'pms-context-collapsed' : ''}`}>
          <button className="pms-context-toggle" onClick={() => setContextCollapsed(!contextCollapsed)}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {contextCollapsed ? <polyline points="2,4 6,8 10,4" /> : <polyline points="2,8 6,4 10,8" />}
            </svg>
            {contextCollapsed ? 'Show brief' : 'Hide brief'}
          </button>

          {!contextCollapsed && (
            <div className="pms-context-content">
              {currentMission === 0 && (
                <div className="pms-message pms-message-slide">
                  <div className="pms-message-header">
                    <CEOAvatar />
                    <span className="pms-message-name">CEO</span>
                  </div>
                  <p>We are launching the Nexus AI customer assistant next month. I need you to write the system instructions by end of week. Here is the brief:</p>
                  <div className="pms-brief-card">
                    <div className="pms-brief-row"><strong>Product:</strong> Customer support AI for our SaaS platform</div>
                    <div className="pms-brief-row"><strong>Users:</strong> B2B customers (technical + non-technical)</div>
                    <div className="pms-brief-row"><strong>Goal:</strong> Resolve support tickets, reduce human load</div>
                    <div className="pms-brief-row"><strong>Brand:</strong> Professional, warm, direct</div>
                    <div className="pms-brief-row"><strong>Never:</strong> discuss pricing, competitors, unreleased features</div>
                  </div>
                </div>
              )}

              {currentMission === 1 && (
                <div className="pms-message pms-message-slide">
                  <div className="pms-message-header">
                    <EngineerAvatar />
                    <span className="pms-message-name">Lead Engineer</span>
                  </div>
                  <p>System instructions look good. Now we need the eval suite before we can ship.</p>
                  <p>We need at least 8 evals covering functional, safety, and quality scenarios. I am not approving ship without them.</p>
                </div>
              )}

              {currentMission === 2 && (
                <>
                  <div className="pms-message pms-message-alert pms-message-slide">
                    <div className="pms-message-header">
                      <CustomerAvatar />
                      <span className="pms-message-name">Customer</span>
                    </div>
                    <p>Your AI just told me your platform integrates with Salesforce natively. We built our entire workflow around this and it is NOT TRUE. We want a refund and we are writing a review.</p>
                  </div>
                  <div className="pms-eng-report pms-message-slide">
                    <div className="pms-eng-report-header">
                      <EngineerAvatar />
                      <span className="pms-message-name">Engineering Report</span>
                    </div>
                    <p>We found the issue. The AI does not have a &ldquo;do not discuss unconfirmed integrations&rdquo; rule. It is generating confident answers from general training knowledge.</p>
                  </div>
                </>
              )}

              {currentMission === 3 && (
                <div className="pms-message pms-message-slide">
                  <div className="pms-message-header">
                    <EngineerAvatar />
                    <span className="pms-message-name">Lead Engineer</span>
                  </div>
                  <p>OpenAI pushed a GPT-4 update last night. Our weekly eval run just completed. Results attached.</p>
                  <div className="pms-eval-results">
                    {M4_EVAL_RESULTS.map((ev, i) => (
                      <div className={`pms-eval-result-row ${ev.drift ? 'pms-drift-row' : ''}`} key={i}>
                        <span className="pms-eval-name">{ev.name}</span>
                        <span className={`pms-eval-status pms-eval-${ev.current.toLowerCase()}`}>{ev.current}</span>
                        <span className="pms-eval-was">was {ev.previous}</span>
                        {ev.drift && <span className="pms-drift-badge">DRIFT</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentMission === 4 && (
                <div className="pms-message pms-message-slide">
                  <div className="pms-message-header">
                    <CEOAvatar />
                    <span className="pms-message-name">CEO</span>
                  </div>
                  <p>Ship day is tomorrow. Engineering is ready. Legal reviewed it. Design signed off.</p>
                  <p>One final review is yours to complete. You are the last gate. Are we ready?</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Work Panel ────────────────────────────── */}
        <div className="pms-work-panel">

          {/* ── MISSION 1: System Instructions ────── */}
          {currentMission === 0 && (
            <div className="pms-work-content">
              <h2 className="pms-work-title">Write the System Instructions</h2>

              <div className="pms-quality-meter">
                <span className="pms-quality-label">Instruction quality</span>
                <div className="pms-quality-bar">
                  <div className="pms-quality-fill" style={{ width: `${m1Quality}%`, background: m1Quality >= 70 ? '#34C759' : m1Quality >= 50 ? '#FF9500' : '#FF3B30' }} />
                </div>
                <span className="pms-quality-value">{m1Quality}/100</span>
              </div>

              <div className="pms-section-input">
                <label className="pms-input-label">
                  <FileIcon size={14} color="#0EA5E9" /> IDENTITY
                </label>
                <textarea
                  className="pms-textarea"
                  placeholder="You are..."
                  value={m1Identity}
                  onChange={e => setM1Identity(e.target.value)}
                  disabled={m1Submitted}
                  rows={3}
                />
              </div>

              <div className="pms-section-input">
                <label className="pms-input-label">
                  <SearchIcon size={14} color="#0EA5E9" /> SCOPE
                </label>
                <textarea
                  className="pms-textarea"
                  placeholder="You can help with..."
                  value={m1Scope}
                  onChange={e => setM1Scope(e.target.value)}
                  disabled={m1Submitted}
                  rows={3}
                />
              </div>

              <div className="pms-section-input">
                <label className="pms-input-label">
                  <UserIcon size={14} color="#0EA5E9" /> BEHAVIOR
                </label>
                <textarea
                  className="pms-textarea"
                  placeholder="Respond with..."
                  value={m1Behavior}
                  onChange={e => setM1Behavior(e.target.value)}
                  disabled={m1Submitted}
                  rows={3}
                />
              </div>

              <div className="pms-section-input">
                <label className="pms-input-label">
                  <ShieldIcon size={14} color="#0EA5E9" /> CONSTRAINTS
                </label>
                <textarea
                  className="pms-textarea"
                  placeholder="Never..."
                  value={m1Constraints}
                  onChange={e => setM1Constraints(e.target.value)}
                  disabled={m1Submitted}
                  rows={3}
                />
              </div>

              <div className="pms-section-input">
                <label className="pms-input-label">
                  <WarningIcon size={14} color="#0EA5E9" /> ESCALATION
                </label>
                <textarea
                  className="pms-textarea"
                  placeholder="Transfer to human when..."
                  value={m1Escalation}
                  onChange={e => setM1Escalation(e.target.value)}
                  disabled={m1Submitted}
                  rows={3}
                />
              </div>

              {hintBlock}

              {!missionComplete && (
                <button className="pms-submit-btn" onClick={submitMission1} disabled={m1Quality < 10}>
                  Send to Engineering
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          )}

          {/* ── MISSION 2: Eval Suite ────────────── */}
          {currentMission === 1 && (
            <div className="pms-work-content">
              <h2 className="pms-work-title">Design the Test Suite</h2>

              <div className="pms-eval-tabs">
                {['functional', 'safety', 'quality'].map(tab => (
                  <button
                    key={tab}
                    className={`pms-eval-tab ${m2ActiveTab === tab ? 'pms-eval-tab-active' : ''}`}
                    onClick={() => setM2ActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="pms-eval-tab-count">{getEvalCounts()[tab]}</span>
                  </button>
                ))}
              </div>

              <div className="pms-eval-counter">Evals written: {getEvalCounts().total}/8</div>

              {/* Pre-filled example */}
              <div className="pms-eval-example">
                <div className="pms-eval-example-label">
                  <TipIcon size={14} /> Example {m2ActiveTab} eval
                </div>
                {m2ActiveTab === 'functional' && (
                  <div className="pms-eval-example-content">
                    <div><strong>Input:</strong> &ldquo;How do I reset my password?&rdquo;</div>
                    <div><strong>Expected:</strong> Step-by-step reset instructions</div>
                    <div><strong>Pass:</strong> response contains reset link or steps</div>
                  </div>
                )}
                {m2ActiveTab === 'safety' && (
                  <div className="pms-eval-example-content">
                    <div><strong>Input:</strong> &ldquo;What do competitors charge?&rdquo;</div>
                    <div><strong>Expected:</strong> Polite decline + redirect</div>
                    <div><strong>Pass:</strong> response contains no competitor pricing</div>
                  </div>
                )}
                {m2ActiveTab === 'quality' && (
                  <div className="pms-eval-example-content">
                    <div><strong>Input:</strong> &ldquo;I am really frustrated with this bug&rdquo;</div>
                    <div><strong>Expected:</strong> Empathetic acknowledgment + help offer</div>
                    <div><strong>Pass:</strong> tone is empathetic and offers next steps</div>
                  </div>
                )}
              </div>

              {m2Evals.map((ev, i) => ev.tab === m2ActiveTab && (
                <div className="pms-eval-card" key={i}>
                  <div className="pms-eval-card-header">Eval {i + 1}</div>
                  <input
                    className="pms-eval-input"
                    placeholder="Test message (input)"
                    value={ev.input}
                    onChange={e => updateEval(i, 'input', e.target.value)}
                    disabled={m2Submitted}
                  />
                  <input
                    className="pms-eval-input"
                    placeholder="What should happen (expected)"
                    value={ev.expected}
                    onChange={e => updateEval(i, 'expected', e.target.value)}
                    disabled={m2Submitted}
                  />
                  <input
                    className="pms-eval-input"
                    placeholder="Binary pass condition"
                    value={ev.pass}
                    onChange={e => updateEval(i, 'pass', e.target.value)}
                    disabled={m2Submitted}
                  />
                </div>
              ))}

              {hintBlock}

              {!missionComplete && (
                <button className="pms-submit-btn" onClick={submitMission2}>
                  Submit eval suite
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          )}

          {/* ── MISSION 3: Hallucination Incident ── */}
          {currentMission === 2 && (
            <div className="pms-work-content">
              <h2 className="pms-work-title">Fix the System Instructions</h2>

              <div className="pms-instructions-preview">
                <div className="pms-preview-label">Current System Instructions</div>
                <div className="pms-preview-text">
                  <p>You are Nexus AI Assistant, a customer support agent for Nexus AI&apos;s SaaS platform...</p>
                  <p className="pms-preview-highlight">
                    <WarningIcon size={14} /> Missing: No rule about unconfirmed integrations
                  </p>
                </div>
              </div>

              <div className="pms-decision-card">
                <div className="pms-decision-step">Decision {m3Step + 1} of 3</div>
                <h3 className="pms-decision-question">{M3_OPTIONS[m3Step].question}</h3>
                <div className="pms-decision-choices">
                  {M3_OPTIONS[m3Step].choices.map((c, ci) => (
                    <button
                      key={ci}
                      className={`pms-choice-btn ${m3Decisions[m3Step] === ci ? 'pms-choice-selected' : ''} ${m3Submitted && c.correct ? 'pms-choice-correct' : ''} ${m3Submitted && m3Decisions[m3Step] === ci && !c.correct ? 'pms-choice-wrong' : ''}`}
                      onClick={() => !m3Submitted && selectM3Decision(ci)}
                      disabled={m3Submitted}
                    >
                      {c.label}
                      {m3Submitted && c.correct && <CheckIcon size={14} />}
                      {m3Submitted && m3Decisions[m3Step] === ci && !c.correct && <CrossIcon size={14} />}
                    </button>
                  ))}
                </div>

                {!m3Submitted && m3Decisions[m3Step] !== null && (
                  <button className="pms-next-step-btn" onClick={submitM3Step}>
                    {m3Step < 2 ? 'Next Decision' : 'Submit All Decisions'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                )}
              </div>

              {hintBlock}
            </div>
          )}

          {/* ── MISSION 4: Drift Detected ──────── */}
          {currentMission === 3 && (
            <div className="pms-work-content">
              <h2 className="pms-work-title">Diagnose and Fix the Drift</h2>

              {!m4Submitted && (
                <div className="pms-drift-banner">
                  <WarningIcon size={16} color="#FF3B30" />
                  <span>Drift detected — 2 evals now failing</span>
                </div>
              )}

              {/* Step 1 */}
              {m4Step >= 0 && (
                <div className="pms-drift-step">
                  <h3 className="pms-drift-step-title">Step 1 — Identify Root Cause</h3>
                  <div className="pms-decision-choices">
                    {['The users changed their behavior', 'The model update changed behavior in these areas', 'Our system instructions were always wrong', 'The evals are broken'].map((opt, i) => (
                      <button
                        key={i}
                        className={`pms-choice-btn ${m4RootCause === i ? 'pms-choice-selected' : ''}`}
                        onClick={() => { setM4RootCause(i); if (m4Step === 0) setM4Step(1) }}
                        disabled={m4Submitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {m4Step >= 1 && (
                <div className="pms-drift-step">
                  <h3 className="pms-drift-step-title">Step 2 — Immediate Response</h3>
                  <div className="pms-decision-choices">
                    {['Lock the model version, do not auto-update', 'Update the model immediately everywhere', 'Take the feature offline', 'Wait and see if it gets better'].map((opt, i) => (
                      <button
                        key={i}
                        className={`pms-choice-btn ${m4Response === i ? 'pms-choice-selected' : ''}`}
                        onClick={() => { setM4Response(i); if (m4Step === 1) setM4Step(2) }}
                        disabled={m4Submitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {m4Step >= 2 && (
                <div className="pms-drift-step">
                  <h3 className="pms-drift-step-title">Step 3 — Fix the Instructions</h3>
                  <p className="pms-drift-hint">Write updated rules for the two failing scenarios.</p>
                  <div className="pms-section-input">
                    <label className="pms-input-label">Fix for &ldquo;Competitor pricing&rdquo; failure</label>
                    <textarea
                      className="pms-textarea"
                      placeholder="Write a specific instruction rule..."
                      value={m4Fix1}
                      onChange={e => { setM4Fix1(e.target.value); if (m4Step === 2 && e.target.value.trim()) setM4Step(3) }}
                      disabled={m4Submitted}
                      rows={2}
                    />
                  </div>
                  <div className="pms-section-input">
                    <label className="pms-input-label">Fix for &ldquo;Scope boundary&rdquo; failure</label>
                    <textarea
                      className="pms-textarea"
                      placeholder="Write a specific instruction rule..."
                      value={m4Fix2}
                      onChange={e => { setM4Fix2(e.target.value); if (m4Step === 2 && e.target.value.trim()) setM4Step(3) }}
                      disabled={m4Submitted}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {m4Step >= 3 && (
                <div className="pms-drift-step">
                  <h3 className="pms-drift-step-title">Step 4 — Add New Evals</h3>
                  <p className="pms-drift-hint">Add 2 new evals that would have caught this drift earlier.</p>
                  {[m4Eval1, m4Eval2].map((ev, idx) => (
                    <div className="pms-eval-card" key={idx}>
                      <div className="pms-eval-card-header">New Eval {idx + 1}</div>
                      <input
                        className="pms-eval-input"
                        placeholder="Test message (input)"
                        value={ev.input}
                        onChange={e => idx === 0 ? setM4Eval1({ ...m4Eval1, input: e.target.value }) : setM4Eval2({ ...m4Eval2, input: e.target.value })}
                        disabled={m4Submitted}
                      />
                      <input
                        className="pms-eval-input"
                        placeholder="Binary pass condition"
                        value={ev.pass}
                        onChange={e => idx === 0 ? setM4Eval1({ ...m4Eval1, pass: e.target.value }) : setM4Eval2({ ...m4Eval2, pass: e.target.value })}
                        disabled={m4Submitted}
                      />
                    </div>
                  ))}
                </div>
              )}

              {hintBlock}

              {!missionComplete && m4Step >= 3 && (
                <button className="pms-submit-btn" onClick={submitMission4}>
                  Resolve Drift
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          )}

          {/* ── MISSION 5: Final Review ────────── */}
          {currentMission === 4 && (
            <div className="pms-work-content">
              <h2 className="pms-work-title">Complete the Pre-Ship Checklist</h2>

              <div className="pms-checklist">
                {/* Item 1: System instructions */}
                <div className="pms-check-item" role="checkbox" aria-checked={m5Checklist[0]} tabIndex={0} onClick={() => toggleM5Check(0)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggleM5Check(0))}>
                  <div className={`pms-check-box ${m5Checklist[0] ? 'pms-checked' : ''}`}>
                    {m5Checklist[0] && <CheckIcon size={12} />}
                  </div>
                  <span>System instructions cover all use cases</span>
                </div>

                {/* Item 2: Evals passing */}
                <div className="pms-check-item" role="checkbox" aria-checked={m5Checklist[1]} tabIndex={0} onClick={() => toggleM5Check(1)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggleM5Check(1))}>
                  <div className={`pms-check-box ${m5Checklist[1] ? 'pms-checked' : ''}`}>
                    {m5Checklist[1] && <CheckIcon size={12} />}
                  </div>
                  <span>All 8+ evals passing</span>
                </div>

                {/* Item 3: Edge cases */}
                <div className="pms-check-item pms-check-expandable">
                  <div className={`pms-check-box ${m5Edge1 !== null && m5Edge2 !== null && m5Edge3 !== null ? 'pms-checked' : ''}`}>
                    {m5Edge1 !== null && m5Edge2 !== null && m5Edge3 !== null && <CheckIcon size={12} />}
                  </div>
                  <span>Edge cases tested</span>
                </div>
                <div className="pms-check-sub">
                  {M5_EDGE_CASES.map((ec, idx) => (
                    <div className="pms-edge-case" key={idx}>
                      <div className="pms-edge-input">&ldquo;{ec.input}&rdquo;</div>
                      <div className="pms-edge-options">
                        {ec.options.map((opt, oi) => (
                          <button
                            key={oi}
                            className={`pms-edge-btn ${(idx === 0 ? m5Edge1 : idx === 1 ? m5Edge2 : m5Edge3) === oi ? 'pms-edge-selected' : ''}`}
                            onClick={() => idx === 0 ? setM5Edge1(oi) : idx === 1 ? setM5Edge2(oi) : setM5Edge3(oi)}
                            disabled={m5Submitted}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Item 4: Hallucination risks */}
                <div className="pms-check-item pms-check-expandable">
                  <div className={`pms-check-box ${m5Risks.length === 2 ? 'pms-checked' : ''}`}>
                    {m5Risks.length === 2 && <CheckIcon size={12} />}
                  </div>
                  <span>Hallucination risks identified (pick 2)</span>
                </div>
                <div className="pms-check-sub">
                  <div className="pms-pill-group">
                    {M5_RISKS.map(r => (
                      <button
                        key={r}
                        className={`pms-pill ${m5Risks.includes(r) ? 'pms-pill-active' : ''}`}
                        onClick={() => toggleM5Risk(r)}
                        disabled={m5Submitted}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item 5: Model version locked */}
                <div className="pms-check-item" role="checkbox" aria-checked={m5ModelLocked} tabIndex={0} onClick={() => !m5Submitted && setM5ModelLocked(!m5ModelLocked)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), !m5Submitted && setM5ModelLocked(!m5ModelLocked))}>
                  <div className={`pms-check-box ${m5ModelLocked ? 'pms-checked' : ''}`}>
                    {m5ModelLocked && <CheckIcon size={12} />}
                  </div>
                  <span>Model version locked</span>
                </div>

                {/* Item 6: Monitoring configured */}
                <div className="pms-check-item pms-check-expandable">
                  <div className={`pms-check-box ${m5Metrics.length === 3 ? 'pms-checked' : ''}`}>
                    {m5Metrics.length === 3 && <CheckIcon size={12} />}
                  </div>
                  <span>Monitoring configured (pick 3 metrics)</span>
                </div>
                <div className="pms-check-sub">
                  <div className="pms-pill-group">
                    {M5_METRICS.map(m => (
                      <button
                        key={m}
                        className={`pms-pill ${m5Metrics.includes(m) ? 'pms-pill-active' : ''}`}
                        onClick={() => toggleM5Metric(m)}
                        disabled={m5Submitted}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item 7: Alert thresholds */}
                <div className="pms-check-item" role="checkbox" aria-checked={m5Checklist[6]} tabIndex={0} onClick={() => toggleM5Check(6)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggleM5Check(6))}>
                  <div className={`pms-check-box ${m5Checklist[6] ? 'pms-checked' : ''}`}>
                    {m5Checklist[6] && <CheckIcon size={12} />}
                  </div>
                  <span>Alert threshold: quality score below {m5Threshold}%</span>
                </div>
                <div className="pms-check-sub">
                  <input
                    type="range"
                    className="pms-threshold-slider"
                    min={50}
                    max={95}
                    value={m5Threshold}
                    onChange={e => setM5Threshold(Number(e.target.value))}
                    disabled={m5Submitted}
                    aria-label="Alert threshold percentage"
                  />
                </div>

                {/* Item 8: Human escalation */}
                <div className="pms-check-item" role="checkbox" aria-checked={m5Checklist[7]} tabIndex={0} onClick={() => toggleM5Check(7)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), toggleM5Check(7))}>
                  <div className={`pms-check-box ${m5Checklist[7] ? 'pms-checked' : ''}`}>
                    {m5Checklist[7] && <CheckIcon size={12} />}
                  </div>
                  <span>Human escalation path tested</span>
                </div>

                {/* Item 9: Rollback plan */}
                <div className="pms-check-item pms-check-expandable">
                  <div className={`pms-check-box ${m5Rollback.length >= 1 ? 'pms-checked' : ''}`}>
                    {m5Rollback.length >= 1 && <CheckIcon size={12} />}
                  </div>
                  <span>Rollback plan documented</span>
                </div>
                <div className="pms-check-sub">
                  <div className="pms-pill-group">
                    {M5_ROLLBACK.map(r => (
                      <button
                        key={r}
                        className={`pms-pill ${m5Rollback.includes(r) ? 'pms-pill-active' : ''}`}
                        onClick={() => toggleM5Rollback(r)}
                        disabled={m5Submitted}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Item 10: Final sign-off */}
                <div className="pms-check-item pms-check-signoff">
                  <div className={`pms-check-box ${m5Checklist[9] ? 'pms-checked' : ''}`}>
                    {m5Checklist[9] && <CheckIcon size={12} />}
                  </div>
                  <span>I have reviewed this and I am confident to ship</span>
                </div>
              </div>

              {hintBlock}

              {!missionComplete && (
                <button
                  className="pms-ship-btn"
                  onClick={() => { toggleM5Check(9); submitMission5() }}
                  disabled={!canSubmitM5()}
                >
                  Ship It
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Consequence Bar ───────────────────────── */}
      {showConsequence && (
        <div className={`pms-consequence pms-consequence-${consequenceType} pms-message-slide`}>
          <div className="pms-consequence-icon">
            {consequenceType === 'success' && <CheckIcon size={16} />}
            {consequenceType === 'warning' && <WarningIcon size={16} />}
            {consequenceType === 'error' && <CrossIcon size={16} />}
          </div>
          <p className="pms-consequence-text">{consequenceText}</p>
          {missionComplete && (
            <button className="pms-advance-btn" onClick={advanceMission}>
              {currentMission < MISSIONS.length - 1 ? 'Next Mission' : 'See Results'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default PMSimulator
