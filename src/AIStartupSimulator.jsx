import { useState, useCallback, useRef, useEffect } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, WarningIcon, TipIcon, RocketIcon, TrendingUpIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import './AIStartupSimulator.css'

const INITIAL_RUNWAY = 2000000

/* ══════════════════════════════════════
   DECISION DATA
   ══════════════════════════════════════ */

const DECISIONS = [
  {
    month: 1,
    headline: 'Day 1. Empty office. Full runway.',
    narrative: 'Your investors gave you $2M to build an AI assistant for small businesses. The first question every AI startup faces: do you build your own model or use someone else\'s?',
    title: 'Build vs Buy the AI Model',
    stakes: 'This shapes your entire technical architecture, your burn rate, and what you can actually ship.',
    options: [
      {
        id: 'build',
        name: 'Build Your Own',
        description: 'Train a custom model from scratch. Full control. Differentiated IP. But you might run out of money before you finish.',
        chips: [
          { label: '-$800K', type: 'cost-high' },
          { label: '8 months', type: 'speed-slow' },
          { label: '+40 quality', type: 'quality-good' },
          { label: 'Very High risk', type: 'risk-high' },
        ],
      },
      {
        id: 'api',
        name: 'Use GPT-4 API',
        description: 'Build on top of OpenAI\'s API. Fast to market. Proven quality. But API costs scale with usage and you depend on a third party.',
        chips: [
          { label: '-$80K setup', type: 'cost-low' },
          { label: '6 weeks', type: 'speed-fast' },
          { label: '+25 quality', type: 'quality-ok' },
          { label: 'Low risk', type: 'risk-low' },
        ],
      },
      {
        id: 'opensource',
        name: 'Open Source Model',
        description: 'Self-host Llama or Mistral. No per-call costs. Full control. But you own the infrastructure headaches.',
        chips: [
          { label: '-$200K infra', type: 'cost-mid' },
          { label: '3 months', type: 'speed-mid' },
          { label: '+30 quality', type: 'quality-good' },
          { label: 'Medium risk', type: 'risk-mid' },
        ],
      },
    ],
    lesson: 'Build vs Buy is the first AI architecture decision every startup faces. Most successful AI startups today start with Buy (APIs) and only Build when they have enough data, users, and runway to justify it.',
  },
  {
    month: 2,
    headline: 'You have a product. Now you need it to be good.',
    narrative: 'Your AI assistant works — sort of. It gives generic answers that any chatbot would give. Your first beta users say "it\'s fine but not special." Your AI is only as good as what it knows. Time to decide your data strategy.',
    title: 'What data do you train or ground on?',
    stakes: 'Data quality determines product quality. Forever. Get this wrong and no amount of engineering fixes it.',
    options: [
      {
        id: 'broad',
        name: 'Broad Web Data',
        description: 'Ground on everything — Wikipedia, web, docs. Fast and cheap. But your AI gives the same answers as Google. No differentiation.',
        chips: [
          { label: '-$30K', type: 'cost-low' },
          { label: '2 weeks', type: 'speed-fast' },
          { label: '+15 quality', type: 'quality-low' },
          { label: 'Low risk', type: 'risk-low' },
        ],
      },
      {
        id: 'focused',
        name: 'Domain-Specific Data',
        description: 'Collect real small business data — accounting, customer emails, inventory, invoices. Real signal from real businesses.',
        chips: [
          { label: '-$120K', type: 'cost-mid' },
          { label: '6 weeks', type: 'speed-mid' },
          { label: '+35 quality', type: 'quality-good' },
          { label: 'Medium risk', type: 'risk-mid' },
        ],
      },
      {
        id: 'synthetic',
        name: 'Synthetic + Real Mix',
        description: 'Generate synthetic business scenarios then validate with real data. Modern approach. Efficient and high quality.',
        chips: [
          { label: '-$60K', type: 'cost-low' },
          { label: '4 weeks', type: 'speed-fast' },
          { label: '+28 quality', type: 'quality-good' },
          { label: 'Medium-Low risk', type: 'risk-low' },
        ],
      },
    ],
    lesson: 'Data strategy is often more important than model strategy. A mediocre model with great domain data beats a great model with generic data. The best AI teams obsess over data quality, not just model quality.',
  },
  {
    month: 3,
    headline: 'Your AI is good. But it still makes things up.',
    narrative: 'A beta user asks your AI about their specific inventory. It confidently gives wrong numbers. Another asks about their specific contracts — it hallucinates details. You have a hallucination problem. You need to decide how to ground your AI in real, up-to-date business information.',
    title: 'RAG vs Fine-tuning vs Both',
    stakes: 'This is the core technical decision in every AI product. Get it right and your AI becomes genuinely useful. Get it wrong and it stays a fancy chatbot.',
    options: [
      {
        id: 'rag',
        name: 'RAG (Retrieval Augmented Generation)',
        description: 'AI retrieves relevant context before answering. Always up-to-date. Traceable answers. The right choice for most AI products.',
        chips: [
          { label: '-$90K', type: 'cost-mid' },
          { label: '6 weeks', type: 'speed-mid' },
          { label: '+30 quality', type: 'quality-good' },
          { label: 'Low-Medium risk', type: 'risk-low' },
        ],
      },
      {
        id: 'finetune',
        name: 'Fine-tuning Only',
        description: 'Fine-tune the model on business-specific examples. Model learns patterns deeply. But expensive to update when data changes.',
        chips: [
          { label: '-$150K', type: 'cost-high' },
          { label: '3 months', type: 'speed-slow' },
          { label: '+25 quality', type: 'quality-ok' },
          { label: 'High risk', type: 'risk-high' },
        ],
      },
      {
        id: 'both',
        name: 'RAG + Fine-tuning',
        description: 'The gold standard. Fine-tune for HOW it responds, RAG for WHAT it knows. But costs runway and time.',
        chips: [
          { label: '-$220K', type: 'cost-high' },
          { label: '4 months', type: 'speed-slow' },
          { label: '+45 quality', type: 'quality-great' },
          { label: 'Medium risk', type: 'risk-mid' },
        ],
      },
    ],
    lesson: 'RAG vs fine-tuning is the most misunderstood decision in AI product development. RAG is for WHAT the AI knows (live, specific data). Fine-tuning is for HOW it behaves (tone, format, reasoning style). Most products need RAG. Fewer need fine-tuning. Almost none need to skip RAG.',
  },
  {
    month: 4,
    headline: 'You have 500 users. Your infrastructure is breaking.',
    narrative: 'Great problem to have — except it\'s not great right now. Your API costs are $40K/month and climbing. Response times are slow. Two enterprise prospects want SLAs you can\'t currently guarantee. You need to decide how to scale.',
    title: 'How do you scale the infrastructure?',
    stakes: 'Wrong choice here burns runway fast. Right choice unlocks enterprise revenue.',
    options: [
      {
        id: 'cloud',
        name: 'Stay Full Cloud',
        description: 'Keep using third-party APIs, optimize usage. Simplest path. Optimize prompts to reduce token usage.',
        chips: [
          { label: '-$40K/mo', type: 'cost-mid' },
          { label: 'Immediate', type: 'speed-fast' },
          { label: 'No change', type: 'quality-neutral' },
          { label: 'Vendor risk', type: 'risk-mid' },
        ],
      },
      {
        id: 'hybrid',
        name: 'Hybrid: API + Cache',
        description: 'Use APIs for complex queries, cache common ones. Smart optimization. The pragmatic engineer\'s choice.',
        chips: [
          { label: '-$18K/mo', type: 'cost-low' },
          { label: '6 weeks', type: 'speed-mid' },
          { label: '+5 quality', type: 'quality-ok' },
          { label: 'Low risk', type: 'risk-low' },
        ],
      },
      {
        id: 'selfhost',
        name: 'Move to Self-Hosted',
        description: 'Migrate to your own GPU infrastructure. Full control. No per-call costs at scale. But $400K upfront.',
        chips: [
          { label: '-$400K upfront', type: 'cost-high' },
          { label: '3 months', type: 'speed-slow' },
          { label: '+10 quality', type: 'quality-ok' },
          { label: 'Medium-High risk', type: 'risk-high' },
        ],
      },
    ],
    lesson: 'The build vs buy question never fully goes away. At small scale: always buy. At medium scale: optimize. At large scale: hybrid or own. Most startups optimize too early and build too late.',
  },
  {
    month: 5,
    headline: 'A user screenshots your AI giving dangerous advice.',
    narrative: 'It goes viral. Your AI told a small business owner to skip tax filings "for cash flow." It was wrong. It was confident. Now it\'s on Twitter. Your investors are calling. You have 48 hours to respond.',
    title: 'How do you address AI reliability?',
    stakes: 'This is existential. One more incident like this and you lose enterprise contracts, possibly the company.',
    options: [
      {
        id: 'guardrails',
        name: 'Add Guardrails',
        description: 'Implement output filtering and safety layers. Topic restrictions, confidence thresholds. Fast to implement. Does not fix root cause.',
        chips: [
          { label: '-$60K', type: 'cost-mid' },
          { label: '3 weeks', type: 'speed-fast' },
          { label: '+15 quality', type: 'quality-ok' },
          { label: 'Reduces risk', type: 'risk-low' },
        ],
      },
      {
        id: 'evals',
        name: 'Comprehensive Evals System',
        description: 'Build a test suite that catches failures before they reach users. Define what good looks like. Test it constantly.',
        chips: [
          { label: '-$100K', type: 'cost-mid' },
          { label: '6 weeks', type: 'speed-mid' },
          { label: '+25 quality', type: 'quality-good' },
          { label: 'Low long-term', type: 'risk-low' },
        ],
      },
      {
        id: 'human',
        name: 'Human-in-the-Loop',
        description: 'Route financial and legal queries to human review. Pragmatic safety net. Adds ongoing operational cost.',
        chips: [
          { label: '-$30K/mo ops', type: 'cost-mid' },
          { label: '2 weeks', type: 'speed-fast' },
          { label: '+20 quality', type: 'quality-good' },
          { label: 'Very Low', type: 'risk-low' },
        ],
      },
    ],
    lesson: 'AI reliability is not a feature you add at the end. Evals, guardrails, and human oversight need to be designed in from the start. The companies that win in AI are the ones that make reliability a first-class engineering priority — not an afterthought after an incident.',
  },
  {
    month: 6,
    headline: 'Six months in. Time to decide your future.',
    narrative: 'You have a product. You have users. You have battle scars. One final decision shapes your trajectory: how do you go to market with what you\'ve built?',
    title: 'How do you launch NexaAI to the world?',
    stakes: 'This is it. Everything comes down to whether your technical decisions translate into real business value.',
    options: [
      {
        id: 'saas',
        name: 'Self-Serve SaaS',
        description: 'Launch publicly, let businesses sign up themselves. Traditional SaaS play. Scale through volume.',
        chips: [
          { label: '-$80K marketing', type: 'cost-mid' },
          { label: '1 month', type: 'speed-fast' },
          { label: 'Needs quality', type: 'quality-neutral' },
          { label: 'Medium risk', type: 'risk-mid' },
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise Direct Sales',
        description: 'Target 10 large enterprise clients directly. Higher ACV. Longer sales cycle. Requires quality above 70.',
        chips: [
          { label: '-$120K sales', type: 'cost-mid' },
          { label: '3 months', type: 'speed-slow' },
          { label: 'Needs quality >70', type: 'quality-neutral' },
          { label: 'Low if quality high', type: 'risk-low' },
        ],
      },
      {
        id: 'platform',
        name: 'API Platform',
        description: 'Launch as a developer API — let others build on you. Platform play. Great if your core AI is genuinely good.',
        chips: [
          { label: '-$50K dev mktg', type: 'cost-low' },
          { label: '6 weeks', type: 'speed-mid' },
          { label: 'Needs quality >65', type: 'quality-neutral' },
          { label: 'Low-Medium', type: 'risk-mid' },
        ],
      },
    ],
    lesson: 'Your go-to-market strategy must match your product quality. Enterprise needs reliability. Self-serve needs polish. Platform needs API excellence. The best architecture in the world means nothing if you choose the wrong go-to-market for your current product state.',
  },
]

/* ── Consequence data ── */

function getConsequences(month, choiceId, prevState) {
  const c = {
    1: {
      build: {
        effects: [
          { icon: 'warning', text: 'Burn rate: $80K/month', detail: 'Training begins. Timeline: 8 months.' },
          { icon: 'warning', text: 'Investors expect a demo in 3 months', detail: 'But your model won\'t be ready for 8 months.' },
        ],
        delta: { runway: -800000, quality: 40, users: 0, techDebt: 0 },
        modelStrategy: 'build',
      },
      api: {
        effects: [
          { icon: 'check', text: 'First prototype running in 3 weeks', detail: 'Integrated fast. Team morale: high.' },
          { icon: 'check', text: 'Burn rate: $15K/month in API costs', detail: 'Moving fast feels great.' },
        ],
        delta: { runway: -80000, quality: 25, users: 0, techDebt: 0 },
        modelStrategy: 'buy',
      },
      opensource: {
        effects: [
          { icon: 'check', text: 'Infrastructure work done after 3 months', detail: 'No vendor lock-in. Team learned a lot.' },
          { icon: 'warning', text: 'Already 3 months behind competitors', detail: 'But you own everything.' },
        ],
        delta: { runway: -200000, quality: 30, users: 0, techDebt: 0 },
        modelStrategy: 'build',
      },
    },
    2: {
      broad: {
        effects: [
          { icon: 'warning', text: 'Beta users say "this is just ChatGPT for business"', detail: 'Churn rate: 60% in week 1.' },
          { icon: 'warning', text: 'No differentiation', detail: 'You need to stand out.' },
        ],
        delta: { runway: -30000, quality: 15, users: -5, techDebt: 5 },
        dataStrategy: 'broad',
      },
      focused: {
        effects: [
          { icon: 'check', text: 'AI starts understanding small business context', detail: 'Beta users notice: "It actually gets our problems."' },
          { icon: 'check', text: 'Early retention looks promising', detail: 'Users rate it 4.3/5 in beta.' },
        ],
        delta: { runway: -120000, quality: 35, users: 10, techDebt: 0 },
        dataStrategy: 'focused',
      },
      synthetic: {
        effects: [
          { icon: 'check', text: 'Solid improvement in domain understanding', detail: 'Not as deep as pure real data but much faster.' },
          { icon: 'check', text: 'Users rate it 4.1/5 in beta', detail: 'Efficient and high quality approach.' },
        ],
        delta: { runway: -60000, quality: 28, users: 7, techDebt: 0 },
        dataStrategy: 'synthetic',
      },
    },
    3: {
      rag: {
        effects: [
          { icon: 'check', text: 'Hallucinations drop 80%', detail: 'Users can ask about their actual data and get correct answers.' },
          { icon: 'warning', text: 'Retrieval occasionally misses edge cases', detail: 'But quality is dramatically better.' },
        ],
        delta: { runway: -90000, quality: 30, users: 15, techDebt: 10 },
        retrievalStrategy: 'rag',
      },
      finetune: {
        effects: [
          { icon: 'warning', text: 'Model behavior improved but still hallucinates', detail: 'Users frustrated by wrong numbers.' },
          { icon: 'warning', text: '"It knows how to talk but not what to say"', detail: 'Fine-tuning alone is not enough for specific data.' },
        ],
        delta: { runway: -150000, quality: 25, users: 5, techDebt: 25 },
        retrievalStrategy: 'finetune',
      },
      both: {
        effects: [
          { icon: 'check', text: 'Exceptional quality', detail: 'AI genuinely knows the context AND reasons correctly.' },
          { icon: 'warning', text: 'Spent 4 months and $220K', detail: 'But the product is genuinely differentiated.' },
        ],
        delta: { runway: -220000, quality: 45, users: 25, techDebt: 0 },
        retrievalStrategy: 'both',
      },
    },
    4: {
      cloud: {
        effects: [
          { icon: 'warning', text: 'Costs keep climbing: $55K/month by month 5', detail: 'Enterprise prospects balk at SLA limitations.' },
          { icon: 'check', text: 'One enterprise prospect signs anyway', detail: 'But one goes to a competitor.' },
        ],
        delta: { runway: -40000, quality: 0, users: 30, techDebt: 10 },
        scalingStrategy: 'cloud',
      },
      hybrid: {
        effects: [
          { icon: 'check', text: 'Cost drop: 55%. Response time: 40% faster', detail: 'Engineering spend: 3 weeks.' },
          { icon: 'check', text: 'Enterprise prospects impressed', detail: 'Performance improvement wins them over.' },
        ],
        delta: { runway: -18000, quality: 5, users: 50, techDebt: 0 },
        scalingStrategy: 'hybrid',
      },
      selfhost: {
        effects: [
          { icon: 'warning', text: '3 months of infrastructure pain', detail: 'Major engineering investment.' },
          { icon: 'check', text: 'Enterprise-grade infra. Two large contracts signed', detail: 'Revenue starts next month.' },
        ],
        delta: { runway: -400000, quality: 10, users: 80, techDebt: 5 },
        scalingStrategy: 'own',
      },
    },
    5: {
      guardrails: {
        effects: [
          { icon: 'check', text: 'Guardrails catch most issues', detail: 'Fast to implement.' },
          { icon: 'warning', text: 'Root cause not addressed', detail: 'One more slip possible in month 6.' },
        ],
        delta: { runway: -60000, quality: 15, users: 10, techDebt: -10 },
        reliabilityStrategy: 'guardrails',
      },
      evals: {
        effects: [
          { icon: 'check', text: 'Evals surface 12 failure modes you didn\'t know existed', detail: 'Fixed before users found them.' },
          { icon: 'check', text: 'Enterprise prospects see testing culture as a feature', detail: 'Confidence in your product soars.' },
        ],
        delta: { runway: -100000, quality: 25, users: 30, techDebt: -15 },
        reliabilityStrategy: 'evals',
      },
      human: {
        effects: [
          { icon: 'check', text: 'Zero incidents since implementation', detail: 'Operational cost manageable.' },
          { icon: 'check', text: 'Enterprise customers love it', detail: '"Finally an AI company that knows its limits."' },
        ],
        delta: { runway: -30000, quality: 20, users: 40, techDebt: -5 },
        reliabilityStrategy: 'human',
      },
    },
    6: {
      saas: {
        effects: [],
        delta: { runway: -80000, quality: 0, users: 0, techDebt: 0 },
        launchStrategy: 'saas',
      },
      enterprise: {
        effects: [],
        delta: { runway: -120000, quality: 0, users: 0, techDebt: 0 },
        launchStrategy: 'enterprise',
      },
      platform: {
        effects: [],
        delta: { runway: -50000, quality: 0, users: 0, techDebt: 0 },
        launchStrategy: 'platform',
      },
    },
  }
  return c[month]?.[choiceId] || { effects: [], delta: {}, }
}

/* ── Scoring engine ── */

function calculateOutcome(state) {
  const { quality, users, techDebt, runway, retrievalStrategy, dataStrategy } = state
  let score = 0
  score += quality * 0.4
  score += Math.min(users / 10, 20)
  score -= techDebt * 0.3
  score += (runway > 500000 ? 20 : runway > 200000 ? 10 : 0)
  if (retrievalStrategy === 'rag' || retrievalStrategy === 'both') score += 15
  if (dataStrategy === 'focused' || dataStrategy === 'synthetic') score += 10
  if (techDebt > 40) score -= 20
  return Math.max(0, Math.min(100, Math.round(score)))
}

function calculateFinalUsers(state) {
  const { quality, users, launchStrategy } = state
  if (launchStrategy === 'enterprise') {
    return quality > 70 ? users + 120 : users + 30
  }
  if (launchStrategy === 'saas') {
    return quality > 75 ? users + 200 : quality > 50 ? users + 80 : users + 20
  }
  if (launchStrategy === 'platform') {
    return quality > 65 ? users + 150 : users + 40
  }
  return users
}

function getOutcomeTitle(score) {
  if (score >= 80) return 'Series A Bound'
  if (score >= 60) return 'Profitable and Growing'
  if (score >= 40) return 'Alive but Struggling'
  if (score >= 20) return 'Pivoting Required'
  return 'Runway Exhausted'
}

function getOutcomeSubtitle(score) {
  if (score >= 80) return 'Your technical decisions paid off. Investors are knocking. NexaAI is the real deal.'
  if (score >= 60) return 'Solid foundation. Revenue growing. Not a rocket ship yet, but a real business.'
  if (score >= 40) return 'Some wins, some churn. The product works but needs improvement. Series A is a stretch.'
  if (score >= 20) return 'High churn. Word is spreading — not in a good way. Time to rethink the approach.'
  return 'The money ran out before the product found its footing. A hard lesson in startup physics.'
}

function getArchitectureGrade(state) {
  let right = 0
  if (state.modelStrategy === 'buy') right++
  if (state.dataStrategy === 'focused' || state.dataStrategy === 'synthetic') right++
  if (state.retrievalStrategy === 'rag' || state.retrievalStrategy === 'both') right++
  if (state.reliabilityStrategy === 'evals') right++
  if (right >= 4) return 'A'
  if (right >= 3) return 'B'
  if (right >= 2) return 'C'
  return 'D'
}

/* ── SVG Office Illustrations ── */

function OfficeScene({ month, quality }) {
  if (month === 1) {
    return (
      <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
        <rect x="40" y="60" width="60" height="6" rx="2" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <rect x="55" y="40" width="30" height="20" rx="2" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <rect x="59" y="44" width="22" height="12" rx="1" fill="var(--bg-surface)" className="ass-screen-glow" />
        <circle cx="70" cy="30" r="6" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <line x1="70" y1="36" x2="70" y2="44" stroke="var(--text-tertiary)" strokeWidth="1.5" />
      </svg>
    )
  }
  if (month === 2) {
    return (
      <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
        {[40, 90, 140].map((x, i) => (
          <g key={i}>
            <rect x={x} y="70" width="30" height="4" rx="1" stroke="var(--text-tertiary)" strokeWidth="1" />
            <rect x={x + 5} y="55" width="20" height="14" rx="1.5" stroke="var(--text-tertiary)" strokeWidth="1" />
            <rect x={x + 8} y="58" width="14" height="8" rx="1" fill="var(--bg-surface)" className="ass-screen-glow" />
            <circle cx={x + 15} cy="44" r="5" stroke="var(--text-tertiary)" strokeWidth="1" />
          </g>
        ))}
      </svg>
    )
  }
  if (month === 3) {
    return (
      <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
        <rect x="60" y="30" width="80" height="50" rx="3" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <rect x="66" y="36" width="68" height="38" rx="2" fill="var(--bg-surface)" className="ass-screen-glow" />
        <text x="100" y="58" textAnchor="middle" fill="#34C759" fontSize="12" fontWeight="700" fontFamily="inherit">500 users</text>
        <line x1="90" y1="80" x2="110" y2="80" stroke="var(--text-tertiary)" strokeWidth="1.5" />
      </svg>
    )
  }
  if (month === 4) {
    return (
      <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
        <rect x="50" y="30" width="100" height="50" rx="3" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <polyline points="60,70 80,60 100,65 120,50 140,45" stroke="#FF3B30" strokeWidth="2" fill="none" className="ass-cost-line" />
        <circle cx="150" cy="55" r="5" stroke="var(--text-tertiary)" strokeWidth="1" />
        <rect x="155" y="65" width="8" height="4" rx="1" fill="var(--text-tertiary)" opacity="0.4" />
        <rect x="155" y="72" width="8" height="4" rx="1" fill="var(--text-tertiary)" opacity="0.4" />
      </svg>
    )
  }
  if (month === 5) {
    const inCrisis = quality < 50
    return (
      <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
        <circle cx="100" cy="45" r="8" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        <line x1="100" y1="53" x2="100" y2="68" stroke="var(--text-tertiary)" strokeWidth="1.5" />
        {inCrisis ? (
          <>
            <rect x="120" y="30" width="24" height="18" rx="3" stroke="#FF3B30" strokeWidth="1.5" />
            <circle cx="140" cy="33" r="4" fill="#FF3B30" className="ass-alert-pulse" />
            <text x="132" y="43" textAnchor="middle" fill="#FF3B30" fontSize="8" fontWeight="700" fontFamily="inherit">!</text>
          </>
        ) : (
          <>
            <polyline points="120,55 130,48 140,50 150,42" stroke="#34C759" strokeWidth="2" fill="none" />
            <circle cx="80" cy="50" r="5" stroke="var(--text-tertiary)" strokeWidth="1" />
            <circle cx="120" cy="60" r="5" stroke="var(--text-tertiary)" strokeWidth="1" />
          </>
        )}
      </svg>
    )
  }
  /* Month 6 */
  return (
    <svg className="ass-office-svg" viewBox="0 0 200 120" fill="none">
      <g className="ass-rocket-launch">
        <path d="M100 75 L96 88 L100 84 L104 88 Z" fill="#F59E0B" />
        <path d="M100 45 C100 45 92 55 92 68 C92 72 96 75 100 75 C104 75 108 72 108 68 C108 55 100 45 100 45Z" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <line x1="92" y1="64" x2="86" y2="68" stroke="#F59E0B" strokeWidth="1" />
        <line x1="108" y1="64" x2="114" y2="68" stroke="#F59E0B" strokeWidth="1" />
      </g>
      <circle cx="60" cy="35" r="1.5" fill="var(--text-tertiary)" className="ass-star" />
      <circle cx="140" cy="30" r="1" fill="var(--text-tertiary)" className="ass-star" style={{ animationDelay: '0.3s' }} />
      <circle cx="80" cy="25" r="1.5" fill="var(--text-tertiary)" className="ass-star" style={{ animationDelay: '0.6s' }} />
      <circle cx="120" cy="20" r="1" fill="var(--text-tertiary)" className="ass-star" style={{ animationDelay: '0.9s' }} />
    </svg>
  )
}

/* ── Tech Debt Visual ── */

function TechDebtIndicator({ debt }) {
  const blocks = debt <= 10 ? 1 : debt <= 25 ? 2 : debt <= 40 ? 3 : 4
  const color = debt <= 10 ? '#34C759' : debt <= 25 ? '#FF9500' : '#FF3B30'
  return (
    <div className={`ass-techdebt ${debt > 40 ? 'ass-techdebt-wobble' : ''}`} title={`Tech debt: ${debt}. High debt slows you down and causes unexpected failures.`} aria-label={`Tech debt level: ${debt} out of 50`}>
      <span className="ass-techdebt-label">Debt</span>
      <div className="ass-techdebt-blocks">
        {Array.from({ length: blocks }, (_, i) => (
          <div key={i} className="ass-techdebt-block" style={{ background: color }} />
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

function AIStartupSimulator({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const gameRef = useRef(null)
  const timersRef = useRef([])

  /* ── Game state ── */
  const [started, setStarted] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(0)
  const [gameState, setGameState] = useState({
    month: 1,
    runway: INITIAL_RUNWAY,
    quality: 0,
    users: 0,
    teamSize: 3,
    techDebt: 0,
    modelStrategy: null,
    dataStrategy: null,
    retrievalStrategy: null,
    scalingStrategy: null,
    reliabilityStrategy: null,
    launchStrategy: null,
    decisions: [],
  })

  const [selectedOption, setSelectedOption] = useState(null)
  const [showConsequences, setShowConsequences] = useState(false)
  const [visibleConsequences, setVisibleConsequences] = useState(0)
  const [showLesson, setShowLesson] = useState(false)
  const [showComplete, setShowComplete] = useState(false)
  const [prevConsequenceText, setPrevConsequenceText] = useState(null)

  /* ── Best score tracking ── */
  const [bestScore, setBestScore] = useState(() => {
    try { return Number(localStorage.getItem('ai-startup-best-score')) || 0 } catch { return 0 }
  })
  const [hasPlayed, setHasPlayed] = useState(() => {
    try { return localStorage.getItem('ai-startup-best-score') !== null } catch { return false }
  })

  /* ── Cleanup timers ── */
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  /* ── Scroll to top on month change ── */
  useEffect(() => {
    if (!started || showComplete) return
    window.scrollTo(0, 0)
  }, [currentMonth, started, showComplete])

  /* ── Helpers ── */
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

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  /* ── Start game ── */
  const handleStart = useCallback(() => {
    setStarted(true)
    markModuleStarted('ai-startup-simulator')
  }, [markModuleStarted])

  /* ── Choose an option ── */
  function handleChoose(optionId) {
    clearTimers()
    if (selectedOption) return
    setSelectedOption(optionId)

    const decision = DECISIONS[currentMonth]
    const consequence = getConsequences(decision.month, optionId, gameState)

    /* Update game state */
    setGameState(prev => {
      const d = consequence.delta || {}
      const updated = {
        ...prev,
        runway: Math.max(0, prev.runway + (d.runway || 0)),
        quality: Math.min(100, Math.max(0, prev.quality + (d.quality || 0))),
        users: Math.max(0, prev.users + (d.users || 0)),
        techDebt: Math.max(0, Math.min(50, prev.techDebt + (d.techDebt || 0))),
        decisions: [...prev.decisions, { month: decision.month, choice: optionId }],
      }
      if (consequence.modelStrategy) updated.modelStrategy = consequence.modelStrategy
      if (consequence.dataStrategy) updated.dataStrategy = consequence.dataStrategy
      if (consequence.retrievalStrategy) updated.retrievalStrategy = consequence.retrievalStrategy
      if (consequence.scalingStrategy) updated.scalingStrategy = consequence.scalingStrategy
      if (consequence.reliabilityStrategy) updated.reliabilityStrategy = consequence.reliabilityStrategy
      if (consequence.launchStrategy) updated.launchStrategy = consequence.launchStrategy
      return updated
    })

    /* Show consequences with staggered animation */
    const effects = consequence.effects || []
    setShowConsequences(true)
    setVisibleConsequences(0)

    effects.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => {
        setVisibleConsequences(i + 1)
      }, 400 * (i + 1)))
    })

    /* Show lesson after consequences */
    timersRef.current.push(setTimeout(() => {
      setShowLesson(true)
    }, 400 * (effects.length + 1)))
  }

  /* ── Continue to next month ── */
  function handleContinue() {
    clearTimers()
    const nextMonth = currentMonth + 1

    if (nextMonth >= DECISIONS.length) {
      /* Game complete */
      const finalState = { ...gameState }
      finalState.users = calculateFinalUsers(finalState)
      setGameState(finalState)
      markModuleComplete('ai-startup-simulator')
      setShowComplete(true)

      const score = calculateOutcome(finalState)
      if (score > bestScore) {
        setBestScore(score)
        try { localStorage.setItem('ai-startup-best-score', String(score)) } catch {}
      }
      setHasPlayed(true)
      scrollToTop()
    } else {
      /* Store consequence text for next month's "last decision" section */
      const decision = DECISIONS[currentMonth]
      const consequence = getConsequences(decision.month, selectedOption, gameState)
      const effects = consequence.effects || []
      if (effects.length > 0) {
        setPrevConsequenceText(effects.map(e => e.text).join(' '))
      }

      setCurrentMonth(nextMonth)
      setSelectedOption(null)
      setShowConsequences(false)
      setVisibleConsequences(0)
      setShowLesson(false)
      scrollToTop()
    }
  }

  /* ── Reset game ── */
  const handleReset = useCallback(() => {
    clearTimers()
    setCurrentMonth(0)
    setGameState({
      month: 1,
      runway: INITIAL_RUNWAY,
      quality: 0,
      users: 0,
      teamSize: 3,
      techDebt: 0,
      modelStrategy: null,
      dataStrategy: null,
      retrievalStrategy: null,
      scalingStrategy: null,
      reliabilityStrategy: null,
      launchStrategy: null,
      decisions: [],
    })
    setSelectedOption(null)
    setShowConsequences(false)
    setVisibleConsequences(0)
    setShowLesson(false)
    setShowComplete(false)
    setPrevConsequenceText(null)
    scrollToTop()
  }, [])

  /* ── Format money ── */
  function fmtMoney(n) {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `$${Math.round(n / 1000)}K`
    return `$${n}`
  }

  /* ── Runway bar color ── */
  function runwayColor(runway) {
    const pct = runway / INITIAL_RUNWAY
    if (pct > 0.5) return '#34C759'
    if (pct > 0.25) return '#FF9500'
    return '#FF3B30'
  }

  function qualityColor(q) {
    if (q > 90) return '#0071E3'
    if (q > 70) return '#34C759'
    if (q > 40) return '#FF9500'
    return '#FF3B30'
  }

  /* ══════════════════════════════════════
     ENTRY SCREEN
     ══════════════════════════════════════ */

  if (!started) {
    return (
      <div className="ass-entry-wrap">
        <EntryScreen
          icon={<ModuleIcon module="ai-startup-simulator" size={64} style={{ color: '#F59E0B' }} />}
          title="AI Startup Simulator"
          subtitle="You just got $2M in seed funding."
          description="Your investors want results in 6 months. Every decision you make &mdash; build or buy, RAG or fine-tune, which data to collect &mdash; has real consequences on your runway, your product quality, and your users. Ship something great. Or run out of money trying."
          buttonText="Start Building"
          onStart={handleStart}
        />
        <div className="ass-entry-pills">
          <span className="ass-entry-pill ass-pill-green">Runway: $2M</span>
          <span className="ass-entry-pill ass-pill-green">Team: 3</span>
          <span className="ass-entry-pill ass-pill-neutral">Quality: &mdash;</span>
          <span className="ass-entry-pill ass-pill-green">Users: 0</span>
          <span className="ass-entry-pill ass-pill-green">Month: 1</span>
        </div>
        <div className="ass-entry-meta">8 decisions &bull; Real consequences</div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     COMPLETION SCREEN
     ══════════════════════════════════════ */

  if (showComplete) {
    const score = calculateOutcome(gameState)
    const title = getOutcomeTitle(score)
    const subtitle = getOutcomeSubtitle(score)
    const grade = getArchitectureGrade(gameState)

    const strategyLabels = {
      build: 'Build Your Own', buy: 'GPT-4 API', opensource: 'Open Source',
      broad: 'Broad Web Data', focused: 'Domain-Specific', synthetic: 'Synthetic + Real',
      rag: 'RAG', finetune: 'Fine-tuning Only', both: 'RAG + Fine-tuning',
      cloud: 'Full Cloud', hybrid: 'Hybrid Cache', own: 'Self-Hosted',
      guardrails: 'Guardrails', evals: 'Eval System', human: 'Human-in-the-Loop',
      saas: 'Self-Serve SaaS', enterprise: 'Enterprise Sales', platform: 'API Platform',
    }

    const learnings = [
      'Build vs buy tradeoffs',
      'Data strategy determines quality ceiling',
      'RAG vs fine-tuning use cases',
      'Infrastructure scaling decisions',
      'AI reliability engineering',
      'How early decisions constrain later ones',
    ]

    return (
      <div className="ass-game" ref={gameRef}>
        <div className="ass-complete">
          <div className="ass-complete-badge">{title}</div>
          <h1 className="ass-complete-title">{title}</h1>
          <p className="ass-complete-subtitle">{subtitle}</p>

          {/* Score */}
          <div className="ass-outcome-score">
            <div className="ass-outcome-ring" style={{ '--score-color': score >= 60 ? '#34C759' : score >= 40 ? '#FF9500' : '#FF3B30' }}>
              <span className="ass-outcome-number">{score}</span>
              <span className="ass-outcome-label">/ 100</span>
            </div>
          </div>

          {hasPlayed && bestScore > 0 && (
            <div className="ass-best-score">Previous best: {bestScore}</div>
          )}

          {/* Metrics summary */}
          <div className="ass-score-card">
            <div className="ass-score-row">
              <span className="ass-score-label">Final runway</span>
              <span className="ass-score-value">{fmtMoney(gameState.runway)}</span>
            </div>
            <div className="ass-score-row">
              <span className="ass-score-label">Quality score</span>
              <span className="ass-score-value">{gameState.quality} / 100</span>
            </div>
            <div className="ass-score-row">
              <span className="ass-score-label">Total users</span>
              <span className="ass-score-value">{gameState.users}</span>
            </div>
            <div className="ass-score-row">
              <span className="ass-score-label">Tech debt</span>
              <span className="ass-score-value">{gameState.techDebt} / 50</span>
            </div>
            <div className="ass-score-row">
              <span className="ass-score-label">Architecture grade</span>
              <span className="ass-score-value ass-grade" data-grade={grade}>{grade}</span>
            </div>
          </div>

          {/* What you built */}
          <div className="ass-architecture">
            <h3 className="ass-section-heading">What you built</h3>
            <div className="ass-arch-grid">
              {[
                { label: 'Model', value: strategyLabels[gameState.modelStrategy] || 'None' },
                { label: 'Data', value: strategyLabels[gameState.dataStrategy] || 'None' },
                { label: 'Retrieval', value: strategyLabels[gameState.retrievalStrategy] || 'None' },
                { label: 'Scale', value: strategyLabels[gameState.scalingStrategy] || 'None' },
                { label: 'Reliability', value: strategyLabels[gameState.reliabilityStrategy] || 'None' },
                { label: 'Launch', value: strategyLabels[gameState.launchStrategy] || 'None' },
              ].map(item => (
                <div key={item.label} className="ass-arch-item">
                  <span className="ass-arch-label">{item.label}</span>
                  <span className="ass-arch-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Journey timeline */}
          <div className="ass-journey">
            <h3 className="ass-section-heading">Your 6-month journey</h3>
            {gameState.decisions.map((d, i) => {
              const dec = DECISIONS[i]
              const opt = dec.options.find(o => o.id === d.choice)
              return (
                <div key={i} className="ass-journey-item">
                  <div className="ass-journey-month">Month {d.month}</div>
                  <div className="ass-journey-choice">{opt?.name || d.choice}</div>
                </div>
              )
            })}
          </div>

          {/* Optimal path hint */}
          <div className="ass-optimal">
            <TipIcon size={16} color="#eab308" />
            <div>
              <strong>Highest-scoring path:</strong> API model + domain data + RAG + hybrid scale + evals. Most successful AI startups start fast, iterate on data, and invest in reliability early.
            </div>
          </div>

          {/* What you learned */}
          <div className="ass-learnings">
            <h3 className="ass-section-heading">What you learned</h3>
            {learnings.map((l, i) => (
              <div key={i} className="ass-learning">
                <CheckIcon size={16} color="#34C759" />
                <span>{l}</span>
              </div>
            ))}
          </div>

          <div className="ass-complete-actions">
            <button className="ass-replay-btn" onClick={handleReset}>Run Another Startup</button>
            <button className="ass-home-btn" onClick={onGoHome}>Back to Home</button>
          </div>

          <SuggestedModules currentModuleId="ai-startup-simulator" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════
     GAME SCREEN
     ══════════════════════════════════════ */

  const decision = DECISIONS[currentMonth]
  const consequence = selectedOption ? getConsequences(decision.month, selectedOption, gameState) : null
  const effects = consequence?.effects || []
  const runwayPct = Math.max(0, (gameState.runway / INITIAL_RUNWAY) * 100)
  const qualityPct = Math.max(0, gameState.quality)

  return (
    <div className="ass-game" ref={gameRef}>
      {/* ── Dashboard ── */}
      <div className="ass-dashboard">
        <div className="ass-dash-item ass-dash-company">
          <span className="ass-dash-label">NexaAI</span>
          <span className="ass-dash-month">Month {currentMonth + 1} / 6</span>
        </div>
        <div className="ass-dash-item">
          <span className="ass-dash-label">Runway</span>
          <div className="ass-dash-bar">
            <div
              className={`ass-dash-fill ${runwayPct < 25 ? 'ass-runway-pulse' : ''}`}
              style={{ width: `${runwayPct}%`, background: runwayColor(gameState.runway) }}
            />
          </div>
          <span className="ass-dash-value">{fmtMoney(gameState.runway)}</span>
          {runwayPct < 15 && <span className="ass-dash-critical">CRITICAL</span>}
        </div>
        <div className="ass-dash-item">
          <span className="ass-dash-label">Quality</span>
          <div className="ass-dash-bar">
            <div className="ass-dash-fill" style={{ width: `${qualityPct}%`, background: qualityColor(gameState.quality) }} />
          </div>
          <span className="ass-dash-value">{gameState.quality}/100</span>
        </div>
        <div className="ass-dash-item">
          <span className="ass-dash-label">Users</span>
          <span className="ass-dash-value ass-dash-users">{gameState.users}</span>
        </div>
        <TechDebtIndicator debt={gameState.techDebt} />
      </div>

      {/* ── Main game area ── */}
      <div className="ass-main">
        {/* Situation Room (left) */}
        <div className="ass-situation">
          <OfficeScene month={currentMonth + 1} quality={gameState.quality} />
          <h2 className="ass-situation-headline">{decision.headline}</h2>
          <p className="ass-situation-narrative">{decision.narrative}</p>
          {prevConsequenceText && currentMonth > 0 && (
            <div className="ass-prev-consequence">
              <WarningIcon size={14} color="#FF9500" />
              <span>Last month: {prevConsequenceText}</span>
            </div>
          )}
        </div>

        {/* Decision Panel (right) */}
        <div className="ass-decision">
          <h3 className="ass-decision-title">{decision.title}</h3>
          <p className="ass-decision-stakes">{decision.stakes}</p>

          <div className="ass-options">
            {decision.options.map(opt => {
              const isSelected = selectedOption === opt.id
              const isDimmed = selectedOption && !isSelected
              const isOptimal = hasPlayed && !selectedOption && (
                (currentMonth === 0 && opt.id === 'api') ||
                (currentMonth === 1 && opt.id === 'focused') ||
                (currentMonth === 2 && opt.id === 'rag') ||
                (currentMonth === 3 && opt.id === 'hybrid') ||
                (currentMonth === 4 && opt.id === 'evals') ||
                (currentMonth === 5 && opt.id === 'enterprise')
              )
              return (
                <div
                  key={opt.id}
                  className={`ass-option ${isSelected ? 'ass-option-selected' : ''} ${isDimmed ? 'ass-option-dimmed' : ''}`}
                  role={!selectedOption ? 'button' : undefined}
                  tabIndex={!selectedOption ? 0 : undefined}
                  onClick={!selectedOption ? () => handleChoose(opt.id) : undefined}
                  onKeyDown={!selectedOption ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleChoose(opt.id) } } : undefined}
                >
                  {isSelected && (
                    <div className="ass-option-check">
                      <CheckIcon size={14} color="#34C759" />
                    </div>
                  )}
                  {isOptimal && (
                    <div className="ass-option-star" title="Best path (hint from previous play)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" stroke="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-5.6 4.3 2.4-7.4L2.6 9.4h7.6L12 2z" /></svg>
                    </div>
                  )}
                  <h4 className="ass-option-name">{opt.name}</h4>
                  <p className="ass-option-desc">{opt.description}</p>
                  <div className="ass-option-chips">
                    {opt.chips.map((chip, i) => (
                      <span key={i} className={`ass-chip ass-chip-${chip.type}`}>{chip.label}</span>
                    ))}
                  </div>
                  {!selectedOption && (
                    <span className="ass-choose-label">Choose This &rarr;</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Consequence Feed ── */}
      {showConsequences && effects.length > 0 && (
        <div className="ass-consequences">
          {effects.map((eff, i) => (
            i < visibleConsequences && (
              <div key={i} className="ass-consequence-card ass-consequence-slide">
                <div className="ass-consequence-icon">
                  {eff.icon === 'check' ? <CheckIcon size={16} color="#34C759" /> : <WarningIcon size={16} color="#FF9500" />}
                </div>
                <div className="ass-consequence-body">
                  <strong>{eff.text}</strong>
                  <span>{eff.detail}</span>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {/* ── Lesson Card ── */}
      {showLesson && (
        <div className="ass-lesson ass-consequence-slide">
          <TipIcon size={16} color="#eab308" />
          <p>{decision.lesson}</p>
        </div>
      )}

      {/* ── Continue Button ── */}
      {showLesson && (
        <div className="ass-continue-wrap">
          <button className="ass-continue-btn" onClick={handleContinue}>
            {currentMonth < DECISIONS.length - 1 ? `Continue to Month ${currentMonth + 2}` : 'See Results'} &rarr;
          </button>
        </div>
      )}
    </div>
  )
}

export default AIStartupSimulator
