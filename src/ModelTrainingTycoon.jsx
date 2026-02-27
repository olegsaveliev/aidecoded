import { useState, useCallback, useRef, useEffect } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, WarningIcon, TipIcon, LockIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import './ModelTrainingTycoon.css'

/* ══════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════ */

const TOTAL_BUDGET = 50000
const TOTAL_WEEKS = 6
const BENCHMARK_SCORE = 82
const TARGET_SCORE = 75

const PHASE_IDS = [
  'data-collection',
  'data-cleaning',
  'architecture',
  'training',
  'evaluation',
  'fine-tuning',
]

const PHASES = [
  {
    id: 'data-collection',
    title: 'Gather Your Training Data',
    week: 1,
    maxAllocation: 20000,
    context:
      'Your model is only as good as what it learns from. Data collection means sourcing training examples \u2014 web scrapes, licensed datasets, human-generated samples, or all three. More budget means more data AND better sources.',
    getConsequence(amount) {
      if (amount < 3000)
        return {
          text: 'Tiny dataset. ~10,000 samples. Model will memorise, not generalise. Data quality: Very Poor',
          level: 'danger',
          badge: { text: 'Risk: High underfitting', type: 'risk' },
        }
      if (amount < 8000)
        return {
          text: 'Small dataset. ~50,000 samples. Workable but shallow coverage. Data quality: Poor',
          level: 'warning',
          badge: null,
        }
      if (amount < 14000)
        return {
          text: 'Solid dataset. ~200,000 samples. Good coverage of common patterns. Data quality: Good',
          level: 'good',
          badge: null,
        }
      return {
        text: 'Large dataset. ~1M+ samples. Excellent diversity and coverage. Data quality: Excellent',
        level: 'good',
        badge: { text: 'Strong foundation', type: 'success' },
      }
    },
  },
  {
    id: 'data-cleaning',
    title: 'Clean Your Data',
    week: 2,
    maxAllocation: 15000,
    context: null, // dynamically built from Phase 1 result
    getConsequence(amount) {
      if (amount < 2000)
        return {
          text: 'Minimal cleaning. ~30% of data has errors or duplicates. Your model will learn from noise. Noise level: Critical',
          level: 'danger',
          badge: { text: 'Risk: Garbage in, garbage out', type: 'risk' },
        }
      if (amount < 5000)
        return {
          text: 'Basic deduplication. ~15% error rate. Major issues caught, subtle ones remain. Noise level: High',
          level: 'warning',
          badge: null,
        }
      if (amount < 10000)
        return {
          text: 'Thorough cleaning. ~5% error rate. Most issues resolved. Solid training set. Noise level: Low',
          level: 'good',
          badge: null,
        }
      return {
        text: 'Gold standard cleaning + human review. <1% error rate. Premium training data. Noise level: Minimal',
        level: 'good',
        badge: { text: 'Clean data multiplies everything', type: 'success' },
      }
    },
  },
  {
    id: 'architecture',
    title: 'Choose Your Model Size',
    week: 3,
    maxAllocation: 18000,
    context:
      'Architecture determines your model\u2019s capacity to learn. Bigger models can learn more complex patterns \u2014 but cost more to train, more to run, and are slower to iterate. Small models with great data often beat large models with poor data.',
    getConsequence(amount) {
      if (amount < 4000)
        return {
          text: 'Fast to train. Cheap to run. Can punch above its weight with great data. Compute cost: Low',
          level: 'good',
          badge: null,
          tier: 'small',
        }
      if (amount < 11000)
        return {
          text: 'The sweet spot for most tasks. Balanced capability and cost. Compute cost: Medium',
          level: 'good',
          badge: null,
          tier: 'medium',
        }
      return {
        text: 'Maximum capacity. Expensive to train. Slow to iterate. Needs excellent data to justify the cost. Compute cost: High',
        level: 'warning',
        badge: null,
        tier: 'large',
      }
    },
  },
  {
    id: 'training',
    title: 'Run the Training',
    week: 4,
    maxAllocation: null, // dynamic: remaining budget
    context:
      'Training is where the model actually learns. More compute = more training steps = better convergence. But there are diminishing returns: doubling compute gives you less than double the improvement. And running out of budget here means a half-trained model.',
    getConsequence: null, // dynamic
  },
  {
    id: 'evaluation',
    title: 'Measure What You Built',
    week: 5,
    maxAllocation: null, // dynamic
    context:
      'You cannot improve what you cannot measure. Evaluation budget determines: how many test cases, whether you hire human raters, whether you run ablations to understand failures. Cheap eval = surprises in production.',
    getConsequence(amount) {
      if (amount < 1000)
        return {
          text: 'Automated metrics only. BLEU score, accuracy. You will miss edge cases and failure modes. Eval coverage: Minimal',
          level: 'danger',
          badge: null,
        }
      if (amount < 3000)
        return {
          text: 'Standard test suite + some human review. Known failure modes caught. Eval coverage: Adequate',
          level: 'warning',
          badge: null,
        }
      return {
        text: 'Rigorous eval: adversarial cases, human raters, regression suite, ablations. You will know exactly what your model can and cannot do. Eval coverage: Thorough',
        level: 'good',
        badge: null,
      }
    },
  },
  {
    id: 'fine-tuning',
    title: 'Specialise for Your Task',
    week: 6,
    maxAllocation: null, // dynamic
    context:
      'Final week. Fine-tuning adapts your pre-trained model to your specific task using a smaller, curated dataset. It is far cheaper than training from scratch and often produces large gains \u2014 but only if the base model is already decent.',
    getConsequence(amount) {
      if (amount === 0)
        return {
          text: 'No fine-tuning. Deploy the base model. Fine-tuning gain: None',
          level: 'warning',
          badge: null,
        }
      if (amount < 500)
        return {
          text: 'You have almost no budget left. Fine-tuning will be minimal. Fine-tuning gain: Negligible',
          level: 'warning',
          badge: null,
        }
      if (amount < 2000)
        return {
          text: 'Light fine-tuning. Small targeted dataset. Some task-specific improvement. Fine-tuning gain: Modest',
          level: 'warning',
          badge: null,
        }
      if (amount < 5000)
        return {
          text: 'Solid fine-tuning run. Good task alignment. Meaningful improvement on benchmarks. Fine-tuning gain: Good',
          level: 'good',
          badge: null,
        }
      return {
        text: 'Extended fine-tuning + RLHF. Maximum task alignment. Fine-tuning gain: Excellent',
        level: 'good',
        badge: { text: 'Maximum task alignment', type: 'success' },
      }
    },
  },
]

const ARCH_TIERS = [
  { id: 'small', label: 'Small', params: '125M', range: [0, 4000] },
  { id: 'medium', label: 'Medium', params: '1B', range: [4000, 11000] },
  { id: 'large', label: 'Large', params: '7B', range: [11000, 18000] },
]

/* ══════════════════════════════════════
   RANDOM EVENTS
   ══════════════════════════════════════ */

const EVENT_POOL = [
  {
    id: 'gpu-outage',
    title: 'Your GPU Provider Has an Outage',
    body: 'Your cloud provider just announced a 72-hour maintenance window. Three days of training time lost. You can pay to migrate to a backup provider, or wait it out and ship later.',
    optionA: {
      label: 'Pay $2,000 to migrate providers',
      cost: 2000,
      apply(stats) {
        return { ...stats, log: 'Migrated to backup GPU cluster. Expensive but no delay.' }
      },
    },
    optionB: {
      label: 'Wait out the outage',
      cost: 0,
      apply(stats) {
        return {
          ...stats,
          trainingDepth: stats.trainingDepth * 0.85,
          log: 'Waited out the outage. Lost 3 days of training time.',
        }
      },
    },
  },
  {
    id: 'labelling-error',
    title: 'Systematic Labelling Errors Found',
    body: 'Your data labeller made consistent errors on 20% of your training examples. Categories were swapped. You can pay to relabel those samples, or train on the corrupted data and hope the model learns around it.',
    optionA: {
      label: 'Pay $3,000 to relabel bad data',
      cost: 3000,
      apply(stats) {
        return { ...stats, log: 'Relabelled 20% of training data. Dataset integrity restored.' }
      },
    },
    optionB: {
      label: 'Continue with corrupted data',
      cost: 0,
      apply(stats) {
        return {
          ...stats,
          finalDataQuality: stats.finalDataQuality * 0.75,
          log: 'Training on corrupted data. Model will have systematic blind spots.',
        }
      },
    },
  },
  {
    id: 'competitor-drop',
    title: 'A Competitor Just Released 84/100',
    body: null, // dynamic — includes projected score
    optionA: {
      label: 'Push harder \u2014 invest $2,500 more in training',
      cost: 2500,
      apply(stats) {
        return {
          ...stats,
          trainingDepth: stats.trainingDepth * 1.2,
          log: 'Extended training run. Chasing the competitor benchmark.',
        }
      },
    },
    optionB: {
      label: 'Pivot \u2014 specialise for a niche',
      cost: 0,
      apply(stats) {
        return {
          ...stats,
          finetuneBonus: 1.5,
          log: 'Pivoting to niche specialisation. We will own our corner of the market.',
        }
      },
    },
  },
  {
    id: 'data-licensing',
    title: 'Premium Dataset Available',
    body: 'A research lab is selling access to a high-quality curated dataset at a discount. Adding it would significantly improve your data quality \u2014 but it is expensive and Phase 2 is behind you.',
    optionA: {
      label: 'Buy the dataset for $4,000',
      cost: 4000,
      apply(stats) {
        return {
          ...stats,
          finalDataQuality: Math.min(100, stats.finalDataQuality + 20),
          log: 'Acquired premium dataset. Training data significantly improved.',
        }
      },
    },
    optionB: {
      label: 'Pass \u2014 too late to integrate cleanly',
      cost: 0,
      apply(stats) {
        return { ...stats, log: 'Passed on the dataset offer. Staying the course.' }
      },
    },
  },
  {
    id: 'engineer-joins',
    title: 'Rockstar ML Engineer Wants In',
    body: 'A senior ML engineer reached out. They can work one sprint (1 week) for equity. They will improve your most underfunded phase by 30%.',
    optionA: {
      label: 'Bring them on',
      cost: 0,
      apply(stats) {
        // find weakest stat and boost it
        const entries = [
          ['finalDataQuality', stats.finalDataQuality],
          ['modelCapacity', stats.modelCapacity],
          ['trainingDepth', stats.trainingDepth],
          ['evalRigor', stats.evalRigor],
        ]
        const validEntries = entries.filter(([, v]) => v > 0)
        if (validEntries.length === 0) {
          return { ...stats, finalDataQuality: Math.min(100, stats.finalDataQuality * 1.3), log: 'New engineer joined. Improved data quality significantly.' }
        }
        validEntries.sort((a, b) => a[1] - b[1])
        const [weakest] = validEntries[0]
        const names = { finalDataQuality: 'data quality', modelCapacity: 'model capacity', trainingDepth: 'training depth', evalRigor: 'evaluation rigor' }
        return {
          ...stats,
          [weakest]: Math.min(100, stats[weakest] * 1.3),
          log: `New engineer joined. Improved ${names[weakest]} significantly.`,
        }
      },
    },
    optionB: {
      label: 'Pass \u2014 too much overhead right now',
      cost: 0,
      apply(stats) {
        return { ...stats, log: 'Declined the offer. Staying lean.' }
      },
    },
  },
  {
    id: 'overfitting',
    title: 'Your Model Is Memorising, Not Learning',
    body: 'Evaluation shows your training loss is near zero but validation loss is climbing. Classic overfitting. You can spend time on regularisation fixes, or ship and acknowledge the limitation.',
    optionA: {
      label: 'Fix it \u2014 spend $2,000 on regularisation',
      cost: 2000,
      apply(stats) {
        return {
          ...stats,
          finalDataQuality: Math.min(100, stats.finalDataQuality * 1.15),
          log: 'Applied dropout and L2 regularisation. Overfitting resolved.',
        }
      },
    },
    optionB: {
      label: 'Ship it \u2014 note the limitation',
      cost: 0,
      apply(stats) {
        return {
          ...stats,
          evalRigor: stats.evalRigor * 0.8,
          log: 'Shipped with known overfitting. Added caveat to model card.',
        }
      },
    },
  },
]

/* EVENT TIMING: after phase 2, after phase 4, after phase 5 */
const EVENT_AFTER_PHASE = [2, 4, 5]

/* ══════════════════════════════════════
   LESSON TEMPLATES
   ══════════════════════════════════════ */

const WEAKNESS_LESSONS = {
  finalDataQuality:
    'The #1 rule of ML: data quality drives everything. A small model on clean data outperforms a large model on noisy data. Every time. No exceptions.',
  modelCapacity:
    'Your data was excellent but your model was too small to learn from it. Architecture must be sized to match your data, not your ambitions. More parameters \u2260 better model.',
  trainingDepth:
    'You ran out of budget for training. An undertrained model leaves capability on the table \u2014 it has not seen the data enough times to learn the patterns. Training compute is not optional.',
  evalRigor:
    'You shipped a model you did not fully understand. Low eval scores cap your potential because you cannot improve what you cannot measure. Invest in evaluation before you invest in training.',
  finetuneGain:
    'Fine-tuning converts a general model into a specialist. Skipping it left task-specific performance on the table. Next run: reserve $3,000\u20145,000 for this phase.',
}

const GENERAL_LESSONS = [
  'Data quality accounts for 40% of your model\u2019s performance. It is the single most important investment you can make.',
  'Evaluation is insurance. A model you understand is worth more than a model that surprises you in production.',
  'Scaling laws are real: doubling compute does not double performance. Diminishing returns kick in fast.',
  'The best ML teams spend more time on data than on architecture. The model learns what you feed it.',
  'Fine-tuning is leverage \u2014 it converts generic capability into task-specific performance at a fraction of the training cost.',
]

/* ══════════════════════════════════════
   STRATEGY BADGES
   ══════════════════════════════════════ */

function detectStrategies(allocations, stats) {
  const badges = []
  if (stats.finalDataQuality > 70) badges.push('Big Data Strategy')
  if (allocations.architecture < 5000) badges.push('Small Model Champ')
  if (stats.evalRigor > 70) badges.push('Eval First')
  if (
    stats.finalDataQuality > 45 &&
    stats.modelCapacity > 45 &&
    stats.trainingDepth > 45 &&
    stats.evalRigor > 45 &&
    stats.finetuneGain > 45
  )
    badges.push('Well-Rounded')
  return badges
}

/* ══════════════════════════════════════
   SCORE CALCULATION HELPERS
   ══════════════════════════════════════ */

function getMinTrainingCost(archAllocation) {
  if (archAllocation >= 11000) return 14000
  if (archAllocation >= 4000) return 7000
  return 3000
}

function getArchTier(amount) {
  if (amount >= 11000) return 'large'
  if (amount >= 4000) return 'medium'
  return 'small'
}

function getTrainingConsequence(amount, minCost) {
  if (amount < minCost)
    return {
      text: 'Undertrained. Model will not converge properly. Leaves capability on the table.',
      level: 'danger',
      badge: null,
      zone: 'under',
    }
  if (amount < minCost * 1.5)
    return {
      text: 'Solid training run. Good convergence. Model learns the patterns in your data.',
      level: 'good',
      badge: null,
      zone: 'adequate',
    }
  return {
    text: 'Extended training. Diminishing returns kick in but some additional gains. Reserve budget for evaluation.',
    level: 'good',
    badge: null,
    zone: 'extended',
  }
}

function computeFinalScore(stats) {
  const raw =
    stats.finalDataQuality * 0.4 +
    stats.modelCapacity * 0.25 +
    stats.trainingDepth * 0.2 +
    stats.finetuneGain * 0.1 +
    stats.evalRigor * 0.05

  const evalMultiplier = 0.5 + stats.evalRigor / 200
  return Math.round(Math.min(100, raw * evalMultiplier))
}

function getScoreColor(score) {
  if (score >= BENCHMARK_SCORE) return '#34C759'
  if (score >= TARGET_SCORE) return '#F59E0B'
  if (score >= 50) return '#FF9500'
  return '#FF3B30'
}

function getScoreLabel(score) {
  if (score >= BENCHMARK_SCORE) return 'Beat the competitor!'
  if (score >= TARGET_SCORE) return 'Shipped successfully'
  if (score >= 50) return 'Below target'
  return 'Failed to ship'
}

function getStars(score) {
  if (score >= BENCHMARK_SCORE) return 3
  if (score >= TARGET_SCORE) return 2
  if (score >= 50) return 1
  return 0
}

function getWeakest(stats) {
  const entries = [
    ['finalDataQuality', stats.finalDataQuality],
    ['modelCapacity', stats.modelCapacity],
    ['trainingDepth', stats.trainingDepth],
    ['evalRigor', stats.evalRigor],
    ['finetuneGain', stats.finetuneGain],
  ]
  entries.sort((a, b) => a[1] - b[1])
  return entries[0][0]
}

function getStrongest(stats) {
  const entries = [
    ['finalDataQuality', stats.finalDataQuality],
    ['modelCapacity', stats.modelCapacity],
    ['trainingDepth', stats.trainingDepth],
    ['evalRigor', stats.evalRigor],
    ['finetuneGain', stats.finetuneGain],
  ]
  entries.sort((a, b) => b[1] - a[1])
  return entries[0][0]
}

const STAT_NAMES = {
  finalDataQuality: 'Data Quality',
  modelCapacity: 'Model Capacity',
  trainingDepth: 'Training Depth',
  evalRigor: 'Eval Rigor',
  finetuneGain: 'Fine-tune Gain',
}

const STAT_WEIGHTS = {
  finalDataQuality: '40%',
  modelCapacity: '25%',
  trainingDepth: '20%',
  evalRigor: '5%',
  finetuneGain: '10%',
}

function buildNarrative(stats) {
  const weakest = getWeakest(stats)
  const strongest = getStrongest(stats)
  const wName = STAT_NAMES[weakest]
  const sName = STAT_NAMES[strongest]
  const wVal = Math.round(stats[weakest])
  const sVal = Math.round(stats[strongest])
  return `Your ${sName.toLowerCase()} was excellent (${sVal}/100) but ${wName.toLowerCase()} suffered (${wVal}/100). ${sName} drives ${STAT_WEIGHTS[strongest]} of your score \u2014 you invested well there. Next time: balance ${wName.toLowerCase()} with your other investments.`
}

/* ══════════════════════════════════════
   SELECT 3 RANDOM EVENTS
   ══════════════════════════════════════ */

function pickEvents() {
  const shuffled = [...EVENT_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

function ModelTrainingTycoon({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const gameRef = useRef(null)
  const timersRef = useRef([])
  const logEndRef = useRef(null)

  /* ── Entry state (persisted) ── */
  const [showEntry, setShowEntry] = usePersistedState('mtt-entry', true)

  /* ── Game state (all resets on new game) ── */
  const [phase, setPhase] = useState(0)
  const [allocations, setAllocations] = useState({
    'data-collection': 0,
    'data-cleaning': 0,
    architecture: 0,
    training: 0,
    evaluation: 0,
    'fine-tuning': 0,
  })
  const [sliderValue, setSliderValue] = useState(0)
  const [budgetSpent, setBudgetSpent] = useState(0)
  const [gameLog, setGameLog] = useState([])

  /* Hidden stats */
  const [hiddenStats, setHiddenStats] = useState({
    dataQuality: 0,
    finalDataQuality: 0,
    modelCapacity: 0,
    trainingDepth: 0,
    evalRigor: 0,
    finetuneGain: 0,
    finetuneBonus: 1,
  })

  /* Events */
  const [selectedEvents] = useState(() => pickEvents())
  const [eventIndex, setEventIndex] = useState(0)
  const [eventPending, setEventPending] = useState(null)

  /* Game flow state */
  const [showResult, setShowResult] = useState(false)
  const [finalScore, setFinalScore] = useState(null)
  const [scoreAnimated, setScoreAnimated] = useState(0)
  const [starsVisible, setStarsVisible] = useState(0)
  const [revealedRows, setRevealedRows] = useState(0)
  const [entryAnimStep, setEntryAnimStep] = useState(0)
  const [phaseFading, setPhaseFading] = useState(false)

  /* Best score */
  const [bestScore, setBestScore] = useState(() => {
    try {
      return Number(localStorage.getItem('mtt-best-score')) || 0
    } catch {
      return 0
    }
  })

  /* Play count (for strategy guide after 3 plays) */
  const [playCount, setPlayCount] = useState(() => {
    try {
      return Number(localStorage.getItem('mtt-play-count')) || 0
    } catch {
      return 0
    }
  })
  const [showGuide, setShowGuide] = useState(false)

  /* Guard: prevent double-confirming the same phase (e.g. fast double-click) */
  const confirmedPhaseRef = useRef(-1)

  /* ── Cleanup ── */
  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout)
  }, [])

  /* ── Entry tagline stagger animation ── */
  useEffect(() => {
    if (!showEntry) return
    const t1 = setTimeout(() => setEntryAnimStep(1), 300)
    const t2 = setTimeout(() => setEntryAnimStep(2), 600)
    const t3 = setTimeout(() => setEntryAnimStep(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [showEntry])

  /* ── Auto-scroll log ── */
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [gameLog.length])

  /* ── Scroll on phase change ── */
  useEffect(() => {
    if (showEntry || showResult) return
    window.scrollTo(0, 0)
  }, [phase, showEntry, showResult])

  /* ── Helpers ── */
  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

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

  function addLog(text, type = 'normal') {
    setGameLog((prev) => [...prev, { text, type, week: Math.min(phase + 1, 6) }])
  }

  const budgetRemaining = TOTAL_BUDGET - budgetSpent

  /* ── Compute projected score for dashboard ── */
  function getProjectedScore() {
    const raw =
      hiddenStats.finalDataQuality * 0.4 +
      hiddenStats.modelCapacity * 0.25 +
      hiddenStats.trainingDepth * 0.2 +
      hiddenStats.finetuneGain * 0.1 +
      hiddenStats.evalRigor * 0.05
    const mult = 0.5 + hiddenStats.evalRigor / 200
    return Math.round(Math.min(100, raw * mult))
  }

  /* ── Get max allocation for current phase ── */
  function getMaxAllocation() {
    const p = PHASES[phase]
    if (p.maxAllocation !== null) return Math.min(p.maxAllocation, budgetRemaining)
    return budgetRemaining
  }

  /* ── Phase-specific data samples ── */
  function getSampleCount(amount) {
    if (amount < 3000) return '~10,000'
    if (amount < 8000) return '~50,000'
    if (amount < 14000) return '~200,000'
    return '~1M+'
  }

  /* ── START GAME ── */
  const handleStart = useCallback(() => {
    setShowEntry(false)
    markModuleStarted('model-training-tycoon')
  }, [markModuleStarted, setShowEntry])

  /* ── CONFIRM PHASE ALLOCATION ── */
  function handleConfirmPhase() {
    if (confirmedPhaseRef.current >= phase) return // already confirmed this phase
    confirmedPhaseRef.current = phase
    clearTimers()
    const phaseId = PHASE_IDS[phase]
    const amount = sliderValue

    // Fade out, then apply all state changes together
    setPhaseFading(true)
    timersRef.current.push(
      setTimeout(() => {
        setPhaseFading(false)

        // Record allocation
        setAllocations((prev) => ({ ...prev, [phaseId]: amount }))
        setBudgetSpent((prev) => prev + amount)
        setSliderValue(0)

        // Compute hidden stat effects
        setHiddenStats((prev) => {
          const next = { ...prev }

          switch (phase) {
            case 0: {
              next.dataQuality = Math.min(100, amount / 200)
              next.finalDataQuality = next.dataQuality
              break
            }
            case 1: {
              const cleanMult = (amount / 15000) * 0.6 + 0.4
              next.finalDataQuality = next.dataQuality * cleanMult
              const phase1Amount = allocations['data-collection']
              if (phase1Amount < 5000 && amount < 3000) {
                next.finalDataQuality = Math.min(next.finalDataQuality, 20)
              }
              break
            }
            case 2: {
              const dq = next.finalDataQuality
              let capacityMult = 1
              if (dq >= 60) capacityMult = 1
              else if (dq >= 30) capacityMult = 0.6
              else capacityMult = 0.3
              next.modelCapacity = Math.min(100, (amount / 18000) * 100 * capacityMult)
              break
            }
            case 3: {
              const minCost = getMinTrainingCost(allocations.architecture)
              if (amount < minCost) {
                next.trainingDepth = (amount / minCost) * 50
              } else {
                next.trainingDepth = Math.min(100, 50 + ((amount / minCost - 1) * 25))
              }
              break
            }
            case 4: {
              next.evalRigor = Math.min(100, amount / 50)
              break
            }
            case 5: {
              const rawGain = Math.min(100, amount / 80)
              const intermediateScore =
                next.finalDataQuality * 0.4 +
                next.modelCapacity * 0.25 +
                next.trainingDepth * 0.2
              if (intermediateScore > 50) {
                next.finetuneGain = rawGain * (next.finetuneBonus || 1)
              } else {
                next.finetuneGain = rawGain * 0.3
              }
              break
            }
          }

          return next
        })

        // Add log entry
        const weekLabel = `Week ${phase + 1}`
        switch (phase) {
          case 0:
            addLog(`${weekLabel}: Allocated $${amount.toLocaleString()} to data collection. Sourcing ${getSampleCount(amount)} training samples...`)
            break
          case 1: {
            const samples = getSampleCount(allocations['data-collection'])
            addLog(`${weekLabel}: Invested $${amount.toLocaleString()} in data cleaning. Final dataset: ${samples} clean samples ready.`)
            if (allocations['data-collection'] < 5000 && amount < 3000) {
              addLog('Warning: Insufficient data cleaned. Systematic labelling errors detected. Model training will be severely impacted.', 'error')
            }
            break
          }
          case 2: {
            const tier = getArchTier(amount)
            const paramStr = tier === 'small' ? '125M' : tier === 'medium' ? '1B' : '7B'
            addLog(`${weekLabel}: Committed to ${tier} model architecture. ${paramStr} parameters. Beginning training setup...`)
            break
          }
          case 3:
            addLog(`${weekLabel}: Training run complete. $${amount.toLocaleString()} in compute spent.`)
            break
          case 4:
            addLog(`${weekLabel}: Evaluation complete. $${amount.toLocaleString()} invested in measuring model quality.`)
            break
          case 5:
            addLog(`${weekLabel}: Fine-tuning complete. $${amount.toLocaleString()} invested in task specialisation.`)
            break
        }

        // Check for events (after phases 2, 4, 5 → indices 1, 3, 4)
        const phaseJustCompleted = phase + 1
        const eventSlot = EVENT_AFTER_PHASE.indexOf(phaseJustCompleted)

        if (eventSlot !== -1 && eventIndex < 3) {
          const event = selectedEvents[eventSlot]
          if (event) {
            timersRef.current.push(
              setTimeout(() => {
                setEventPending(event)
              }, 300)
            )
            return
          }
        }

        // Advance to next phase or results
        if (phase < 5) {
          setPhase((p) => p + 1)
        } else {
          finishGame()
        }
      }, 250)
    )
  }

  /* ── HANDLE EVENT CHOICE ── */
  function handleEventChoice(isOptionA) {
    clearTimers()
    if (!eventPending) return

    const option = isOptionA ? eventPending.optionA : eventPending.optionB

    // Apply cost
    if (option.cost > 0) {
      setBudgetSpent((prev) => prev + option.cost)
    }

    // Compute new stats and extract log message (no side effects in updater)
    const result = option.apply(hiddenStats)
    const { log: logMsg, ...statsOnly } = result
    setHiddenStats(statsOnly)
    if (logMsg) {
      addLog(logMsg, 'event')
    }

    setEventIndex((prev) => prev + 1)
    setEventPending(null)

    // Advance to next phase or results (immediate — no delay)
    if (phase < 5) {
      setPhase((p) => p + 1)
    } else {
      finishGame()
    }
  }

  /* ── FINISH GAME ── */
  function finishGame() {
    const score = computeFinalScore(hiddenStats)
    const stars = getStars(score)

    setFinalScore(score)

    // Update best score
    if (score > bestScore) {
      setBestScore(score)
      try {
        localStorage.setItem('mtt-best-score', String(score))
      } catch {}
    }

    // Increment play count
    const newPlayCount = playCount + 1
    setPlayCount(newPlayCount)
    try {
      localStorage.setItem('mtt-play-count', String(newPlayCount))
    } catch {}

    markModuleComplete('model-training-tycoon')

    // Animate score
    const duration = 1500
    const start = Date.now()
    function tick() {
      const elapsed = Date.now() - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setScoreAnimated(Math.round(score * eased))
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)

    // Animate stars
    for (let i = 0; i < stars; i++) {
      timersRef.current.push(
        setTimeout(() => setStarsVisible(i + 1), 1800 + i * 400)
      )
    }

    // Reveal stat rows
    for (let i = 0; i < 5; i++) {
      timersRef.current.push(
        setTimeout(() => setRevealedRows(i + 1), 2200 + i * 150)
      )
    }

    setShowResult(true)
    scrollToTop()
  }

  /* ── START OVER ── */
  function handleStartOver() {
    clearTimers()
    confirmedPhaseRef.current = -1
    setPhase(0)
    setAllocations({
      'data-collection': 0,
      'data-cleaning': 0,
      architecture: 0,
      training: 0,
      evaluation: 0,
      'fine-tuning': 0,
    })
    setSliderValue(0)
    setBudgetSpent(0)
    setGameLog([])
    setHiddenStats({
      dataQuality: 0,
      finalDataQuality: 0,
      modelCapacity: 0,
      trainingDepth: 0,
      evalRigor: 0,
      finetuneGain: 0,
      finetuneBonus: 1,
    })
    setEventIndex(0)
    setEventPending(null)
    setPhaseFading(false)
    setShowResult(false)
    setFinalScore(null)
    setScoreAnimated(0)
    setStarsVisible(0)
    setRevealedRows(0)
    setShowGuide(false)
    scrollToTop()
  }

  /* ═══════════════════════════════════
     RENDER: ENTRY SCREEN
     ═══════════════════════════════════ */

  if (showEntry) {
    return (
      <div className="mtt-entry" ref={gameRef}>
        <div className="mtt-entry-inner">
          <ModuleIcon module="model-training-tycoon" size={72} style={{ color: '#F59E0B' }} />
          <h1 className="mtt-entry-title">Model Training Tycoon</h1>

          <div className="mtt-entry-taglines">
            <p className={`mtt-entry-tagline${entryAnimStep >= 1 ? ' mtt-tagline-visible' : ''}`}>
              You have $50,000 and 6 weeks.
            </p>
            <p className={`mtt-entry-tagline${entryAnimStep >= 2 ? ' mtt-tagline-visible' : ''}`}>
              Train the best AI model on the market.
            </p>
            <p className={`mtt-entry-tagline${entryAnimStep >= 3 ? ' mtt-tagline-visible' : ''}`}>
              Every dollar decision has consequences.
            </p>
          </div>

          <div className="mtt-entry-briefing">
            You are the ML lead at a scrappy startup.
            Allocate your compute budget across six
            phases of model training. Watch the tradeoffs
            play out in real time. Survive random events.
            Ship before your competitors do. Your final
            model will be benchmarked &mdash; accuracy,
            efficiency, and time to ship all count.
          </div>

          <div className="mtt-entry-stats">
            <span className="mtt-entry-stat">$50,000 Budget</span>
            <span className="mtt-entry-stat">6 Weeks</span>
            <span className="mtt-entry-stat">Replayable</span>
          </div>

          <button className="mtt-entry-btn" onClick={handleStart}>
            Start Building
          </button>
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════
     RENDER: RESULTS SCREEN
     ═══════════════════════════════════ */

  if (showResult && finalScore !== null) {
    const stars = getStars(finalScore)
    const weakest = getWeakest(hiddenStats)
    const strategies = detectStrategies(allocations, hiddenStats)
    const narrative = buildNarrative(hiddenStats)

    const statOrder = [
      'finalDataQuality',
      'modelCapacity',
      'trainingDepth',
      'finetuneGain',
      'evalRigor',
    ]

    // Pick 3 lessons
    const lessonCards = [
      WEAKNESS_LESSONS[weakest],
      gameLog.some((l) => l.type === 'event')
        ? 'Random events are part of every ML project. GPU outages, bad labels, competitor drops \u2014 the best teams build resilience into their budget, not just their architecture.'
        : 'You avoided event penalties this run. But in production, surprises always happen. Reserve 10\u201315% of budget as contingency.',
      GENERAL_LESSONS[Math.floor(Math.random() * GENERAL_LESSONS.length)],
    ]

    return (
      <div className="mtt-results" ref={gameRef}>
        <div className="mtt-final-score" style={{ color: getScoreColor(finalScore) }}>
          {scoreAnimated}
        </div>
        <div className="mtt-final-label" style={{ color: getScoreColor(finalScore) }}>
          {getScoreLabel(finalScore)}
        </div>

        {/* Stars */}
        <div className="mtt-stars">
          {[0, 1, 2].map((i) => (
            <svg
              key={i}
              className={`mtt-star${i < starsVisible ? ' mtt-star-earned' : ''}`}
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={i < starsVisible ? '#F59E0B' : 'none'}
              stroke={i < starsVisible ? '#F59E0B' : 'var(--border)'}
              strokeWidth="1.5"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
        </div>

        {/* Benchmark comparison */}
        <div className="mtt-benchmarks">
          <div className="mtt-benchmark-row">
            <span className="mtt-benchmark-label">Your model</span>
            <div className="mtt-benchmark-track">
              <div
                className="mtt-benchmark-fill mtt-benchmark-yours"
                style={{ width: `${finalScore}%` }}
              />
            </div>
            <span className="mtt-benchmark-value">{finalScore}/100</span>
          </div>
          <div className="mtt-benchmark-row">
            <span className="mtt-benchmark-label">Competitor</span>
            <div className="mtt-benchmark-track">
              <div
                className="mtt-benchmark-fill mtt-benchmark-competitor"
                style={{ width: `${BENCHMARK_SCORE}%` }}
              />
            </div>
            <span className="mtt-benchmark-value">{BENCHMARK_SCORE}/100</span>
          </div>
          <div className="mtt-benchmark-row">
            <span className="mtt-benchmark-label">Ship target</span>
            <div className="mtt-benchmark-track">
              <div
                className="mtt-benchmark-fill mtt-benchmark-target"
                style={{ width: `${TARGET_SCORE}%` }}
              />
            </div>
            <span className="mtt-benchmark-value">{TARGET_SCORE}/100</span>
          </div>
        </div>

        {/* What drove your score */}
        <div className="mtt-reveal-section">
          <h3 className="mtt-reveal-title">What Drove Your Score</h3>
          {statOrder.map((key, i) => (
            <div
              key={key}
              className={`mtt-reveal-row${i < revealedRows ? ' mtt-reveal-row-visible' : ''}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <span className="mtt-reveal-name">{STAT_NAMES[key]}</span>
              <div className="mtt-reveal-bar-track">
                <div
                  className="mtt-reveal-bar-fill"
                  style={{ width: i < revealedRows ? `${Math.round(hiddenStats[key])}%` : '0%' }}
                />
              </div>
              <span className="mtt-reveal-value">
                {i < revealedRows ? `${Math.round(hiddenStats[key])}/100` : '???'}
              </span>
              <span className="mtt-reveal-weight">{STAT_WEIGHTS[key]}</span>
            </div>
          ))}
        </div>

        {/* Narrative */}
        <div className="mtt-narrative">
          <p>{narrative}</p>
        </div>

        {/* Lessons */}
        <div className="mtt-lessons">
          <h3 className="mtt-lessons-title">Lessons Learned</h3>
          {lessonCards.map((lesson, i) => (
            <div key={i} className="mtt-lesson-card">
              <TipIcon size={16} color="#eab308" />
              <p>{lesson}</p>
            </div>
          ))}
        </div>

        {/* Strategy guide — shows after 3 completed games */}
        {playCount >= 3 && (
          <div className="mtt-guide">
            <button
              className="mtt-guide-toggle"
              onClick={() => setShowGuide(g => !g)}
              aria-expanded={showGuide}
            >
              <TipIcon size={16} color="#eab308" />
              <span>Need a hint?</span>
              <svg
                className={`mtt-guide-chevron${showGuide ? ' mtt-guide-chevron-open' : ''}`}
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {showGuide && (
              <div className="mtt-guide-body">
                <p className="mtt-guide-intro">
                  Optimal strategy for a Small model ($50k budget):
                </p>
                <table className="mtt-guide-table">
                  <thead>
                    <tr><th>Phase</th><th>Budget</th><th>Why</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Data Collection</td><td>$20,000</td><td>40% of your score — max it out</td></tr>
                    <tr><td>Data Cleaning</td><td>$6,000</td><td>Gets quality above the 60 threshold</td></tr>
                    <tr><td>Architecture</td><td>$3,500</td><td>Small model = cheap training minimum</td></tr>
                    <tr><td>Training</td><td>$9,500</td><td>Maxes training depth for small model</td></tr>
                    <tr><td>Evaluation</td><td>$5,000</td><td>Eval multiplier goes from 0.5x to 1.0x</td></tr>
                    <tr><td>Fine-tuning</td><td>$6,000</td><td>Remaining budget for fine-tune bonus</td></tr>
                  </tbody>
                </table>
                <p className="mtt-guide-events-title">Event choices:</p>
                <ul className="mtt-guide-events">
                  <li><strong>Engineer joins</strong> &mdash; Always accept (free 30% boost)</li>
                  <li><strong>Premium dataset</strong> &mdash; Buy it (+20 data quality)</li>
                  <li><strong>Competitor drops</strong> &mdash; Pivot to niche (free 1.5x fine-tuning)</li>
                  <li><strong>GPU outage</strong> &mdash; Pay $2k to migrate</li>
                  <li><strong>Labelling errors</strong> &mdash; Pay $3k to relabel</li>
                  <li><strong>Overfitting</strong> &mdash; Pay $2k to fix</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Best score + strategies */}
        <div className="mtt-replay-meta">
          <span>Your score: {finalScore}/100</span>
          <span className="mtt-replay-sep">&bull;</span>
          <span>Best score: {Math.max(bestScore, finalScore)}/100</span>
        </div>
        {strategies.length > 0 && (
          <div className="mtt-strategies">
            {strategies.map((s) => (
              <span key={s} className="mtt-strategy-badge">{s}</span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="mtt-result-actions">
          <button className="mtt-result-btn mtt-result-btn-primary" onClick={handleStartOver}>
            Play Again
          </button>
          <button className="mtt-result-btn mtt-result-btn-outline" onClick={onGoHome}>
            Back to Home
          </button>
        </div>

        <SuggestedModules currentModuleId="model-training-tycoon" onSwitchTab={onSwitchTab} />
      </div>
    )
  }

  /* ═══════════════════════════════════
     RENDER: EVENT SCREEN
     ═══════════════════════════════════ */

  if (eventPending) {
    const evBody =
      eventPending.id === 'competitor-drop'
        ? `Rival AI Labs dropped a model scoring 84 on your exact benchmark. Your current trajectory puts you at ~${getProjectedScore()}. You can try to improve quickly, or reframe your model for a different market.`
        : eventPending.body

    return (
      <div className="mtt-game" ref={gameRef}>
        <div className="mtt-layout">
          <div className="mtt-left">
            <div className="mtt-event-card">
              <h2 className="mtt-event-title">
                <WarningIcon size={20} color="#F59E0B" />
                {eventPending.title}
              </h2>
              <p className="mtt-event-body">{evBody}</p>
              <div className="mtt-event-options">
                <button
                  className="mtt-option-btn"
                  onClick={() => handleEventChoice(true)}
                >
                  <span className="mtt-option-label">{eventPending.optionA.label}</span>
                  {eventPending.optionA.cost > 0 && (
                    <span className="mtt-option-cost">&minus;${eventPending.optionA.cost.toLocaleString()}</span>
                  )}
                </button>
                <button
                  className="mtt-option-btn"
                  onClick={() => handleEventChoice(false)}
                >
                  <span className="mtt-option-label">{eventPending.optionB.label}</span>
                  {eventPending.optionB.cost > 0 && (
                    <span className="mtt-option-cost">&minus;${eventPending.optionB.cost.toLocaleString()}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Game log */}
            <div className="mtt-log">
              {gameLog.map((entry, i) => (
                <div key={i} className={`mtt-log-entry mtt-log-${entry.type}`}>
                  <span className="mtt-log-week">[Week {entry.week}]</span> {entry.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Dashboard */}
          {renderDashboard()}
        </div>
      </div>
    )
  }

  /* ═══════════════════════════════════
     RENDER: PHASE ALLOCATION
     ═══════════════════════════════════ */

  const currentPhase = PHASES[phase]
  const maxAlloc = getMaxAllocation()

  // Dynamic context for Phase 2
  let phaseContext = currentPhase.context
  if (phase === 1) {
    const samples = getSampleCount(allocations['data-collection'])
    phaseContext = `You collected ${samples} samples. Raw data is messy: duplicate entries, mislabelled examples, encoding errors, outliers. Cleaning budget determines how much of this gets fixed. Skipping this is where most ML projects die.`
  }

  // Training phase: show budget + min
  let trainingExtra = null
  if (phase === 3) {
    const minCost = getMinTrainingCost(allocations.architecture)
    const tier = getArchTier(allocations.architecture)
    trainingExtra = {
      minCost,
      tier,
    }
  }

  // Fine-tuning: budget warning
  let ftWarning = null
  if (phase === 5 && budgetRemaining < 500) {
    ftWarning =
      'You have almost no budget left. Fine-tuning will be minimal. Consider: is it worth deploying what you have, or should you iterate on data next time?'
  }

  // Get consequence preview
  let consequence = null
  if (phase === 3) {
    const minCost = getMinTrainingCost(allocations.architecture)
    consequence = getTrainingConsequence(sliderValue, minCost)
  } else if (currentPhase.getConsequence) {
    consequence = currentPhase.getConsequence(sliderValue)
  }

  // Architecture warning: large model + bad data
  const showArchWarning =
    phase === 2 &&
    sliderValue >= 11000 &&
    hiddenStats.finalDataQuality < 40

  // Eval insight
  const showEvalInsight = phase === 4

  return (
    <div className="mtt-game" ref={gameRef}>
      <div className="mtt-layout">
        <div className={`mtt-left${phaseFading ? ' mtt-phase-fading' : ''}`}>
          <div className="mtt-phase-card">
            <div className="mtt-phase-header">
              <span className="mtt-phase-week">Week {currentPhase.week}</span>
              <span className="mtt-phase-number">Phase {phase + 1} of 6</span>
            </div>
            <h2 className="mtt-phase-title">
              Phase {phase + 1}: {currentPhase.title}
            </h2>
            <p className="mtt-phase-context">{phaseContext}</p>

            {/* Training extra info */}
            {trainingExtra && (
              <div className="mtt-training-info">
                You have <strong>${budgetRemaining.toLocaleString()}</strong> left.
                Training needs at minimum <strong>${trainingExtra.minCost.toLocaleString()}</strong> for
                your {trainingExtra.tier} architecture.
              </div>
            )}

            {/* Fine-tuning budget warning */}
            {ftWarning && (
              <div className="mtt-ft-warning">
                <WarningIcon size={16} color="#FF9500" />
                {ftWarning}
              </div>
            )}

            {/* Architecture tiers */}
            {phase === 2 && (
              <div className="mtt-arch-tiers">
                {ARCH_TIERS.map((tier) => {
                  const active =
                    sliderValue >= tier.range[0] &&
                    (tier.id === 'large'
                      ? sliderValue >= tier.range[0]
                      : sliderValue < tier.range[1])
                  return (
                    <div
                      key={tier.id}
                      className={`mtt-arch-tier${active ? ' mtt-arch-tier-active' : ''}`}
                    >
                      <div className="mtt-arch-params">{tier.params}</div>
                      <div className="mtt-arch-label">{tier.label} Model</div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Slider */}
            <div className="mtt-slider-wrap">
              <label className="mtt-slider-label">
                {currentPhase.title} budget:{' '}
                <strong>${sliderValue.toLocaleString()}</strong>
              </label>
              <input
                type="range"
                className="mtt-slider"
                min={0}
                max={maxAlloc}
                step={500}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                style={{ '--pct': `${maxAlloc > 0 ? (sliderValue / maxAlloc) * 100 : 0}%` }}
              />
              <div className="mtt-slider-range">
                <span>$0</span>
                <span>${maxAlloc.toLocaleString()}</span>
              </div>

              {/* Training zone markers */}
              {phase === 3 && trainingExtra && maxAlloc > 0 && (
                <div className="mtt-training-zones">
                  <div
                    className="mtt-zone mtt-zone-under"
                    style={{ width: `${Math.min(100, (trainingExtra.minCost / maxAlloc) * 100)}%` }}
                  >
                    Underpowered
                  </div>
                  <div
                    className="mtt-zone mtt-zone-adequate"
                    style={{
                      width: `${Math.min(100, ((trainingExtra.minCost * 0.5) / maxAlloc) * 100)}%`,
                    }}
                  >
                    Adequate
                  </div>
                  <div className="mtt-zone mtt-zone-extended">
                    Well-resourced
                  </div>
                </div>
              )}
            </div>

            {/* Consequence preview */}
            {consequence && (
              <div className={`mtt-consequence mtt-consequence-${consequence.level}`}>
                <p>{consequence.text}</p>
                {consequence.badge && (
                  <span className={`mtt-badge mtt-badge-${consequence.badge.type}`}>
                    {consequence.badge.type === 'risk' ? (
                      <WarningIcon size={12} color="#FF3B30" />
                    ) : (
                      <CheckIcon size={12} color="#34C759" />
                    )}
                    {consequence.badge.text}
                  </span>
                )}
              </div>
            )}

            {/* Architecture warning */}
            {showArchWarning && (
              <div className="mtt-warning-card">
                <WarningIcon size={16} color="#FF3B30" />
                <p>
                  Your data quality is {Math.round(hiddenStats.finalDataQuality)}/100.
                  A large model will memorise your noisy data with high confidence. This is worse than
                  a small model. Consider: small model + invest remaining budget in evaluation.
                </p>
              </div>
            )}

            {/* Eval insight */}
            {showEvalInsight && (
              <div className="mtt-eval-insight">
                <TipIcon size={16} color="#eab308" />
                Every point you invest in evaluation is insurance. A model you understand is worth
                more than a model that surprises you.
              </div>
            )}

            {/* Confirm */}
            <button className="mtt-confirm" onClick={handleConfirmPhase}>
              Confirm &amp; Continue
            </button>
          </div>

          {/* Game log */}
          {gameLog.length > 0 && (
            <div className="mtt-log">
              {gameLog.map((entry, i) => (
                <div key={i} className={`mtt-log-entry mtt-log-${entry.type}`}>
                  <span className="mtt-log-week">[Week {entry.week}]</span> {entry.text}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>

        {/* Dashboard */}
        {renderDashboard()}
      </div>
    </div>
  )

  /* ═══════════════════════════════════
     DASHBOARD PANEL
     ═══════════════════════════════════ */

  function renderDashboard() {
    const budgetPct = (budgetRemaining / TOTAL_BUDGET) * 100
    const showProjected = phase >= 3
    const projected = showProjected ? getProjectedScore() : null

    const statKeys = [
      { key: 'finalDataQuality', label: 'Data Quality', unlocksAfter: 1 },
      { key: 'modelCapacity', label: 'Model Capacity', unlocksAfter: 2 },
      { key: 'trainingDepth', label: 'Training Depth', unlocksAfter: 3 },
      { key: 'evalRigor', label: 'Eval Rigor', unlocksAfter: 4 },
      { key: 'finetuneGain', label: 'Fine-tune Gain', unlocksAfter: 5 },
    ]

    return (
      <div className="mtt-dashboard">
        {/* Budget */}
        <div className="mtt-budget-display">
          <span className={`mtt-budget-amount${budgetRemaining < 5000 ? ' mtt-budget-low' : ''}`}>
            ${budgetRemaining.toLocaleString()} remaining
          </span>
          <div className="mtt-budget-bar">
            <div
              className="mtt-budget-fill"
              style={{
                width: `${budgetPct}%`,
                background:
                  budgetPct > 50
                    ? '#F59E0B'
                    : budgetPct > 20
                      ? '#FF9500'
                      : '#FF3B30',
              }}
            />
          </div>
        </div>

        {/* Week tracker */}
        <div className="mtt-weeks-section">
          <span className="mtt-weeks-label">Week {Math.min(phase + 1, 6)} of 6</span>
          <div className="mtt-weeks">
            {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
              <div
                key={i}
                className={`mtt-week-dot${
                  i < phase ? ' mtt-week-done' : i === phase ? ' mtt-week-current' : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Allocation summary */}
        <div className="mtt-alloc-summary">
          <span className="mtt-section-label">Allocations</span>
          {PHASES.map((p, i) => {
            const alloc = allocations[PHASE_IDS[i]]
            const pct = TOTAL_BUDGET > 0 ? (alloc / TOTAL_BUDGET) * 100 : 0
            return (
              <div key={p.id} className="mtt-alloc-row">
                <span className="mtt-alloc-name">{p.title}</span>
                <span className="mtt-alloc-amount">
                  {alloc > 0 ? `$${alloc.toLocaleString()}` : '\u2014'}
                </span>
                <div className="mtt-alloc-bar">
                  <div className="mtt-alloc-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Hidden stats */}
        <div className="mtt-hidden-stats">
          <span className="mtt-section-label">Model Stats</span>
          {statKeys.map(({ key, label, unlocksAfter }) => {
            const unlocked = phase >= unlocksAfter
            const val = Math.round(hiddenStats[key])
            return (
              <div key={key} className="mtt-stat-row">
                <span className={`mtt-stat-label${!unlocked ? ' mtt-stat-locked' : ''}`}>
                  {unlocked ? label : '???'}
                  {!unlocked && <LockIcon size={10} color="var(--text-tertiary)" />}
                </span>
                <div className="mtt-stat-bar">
                  <div
                    className="mtt-stat-fill"
                    style={{ width: unlocked ? `${val}%` : '0%' }}
                  />
                </div>
                <span className="mtt-stat-value">
                  {unlocked ? `${val}%` : '\u2014'}
                </span>
              </div>
            )
          })}
        </div>

        {/* Projected score */}
        {showProjected && (
          <div className="mtt-projected">
            <span className="mtt-section-label">Projected Score</span>
            <span
              className="mtt-projected-score"
              style={{ color: getScoreColor(projected) }}
            >
              ~{projected}/100
            </span>
          </div>
        )}

        {/* Competitor badge */}
        <div className="mtt-competitor">
          <span className="mtt-section-label">Competitor</span>
          <span
            className={`mtt-competitor-score${
              showProjected && projected < BENCHMARK_SCORE ? ' mtt-competitor-ahead' : ''
            }`}
          >
            {BENCHMARK_SCORE}/100
          </span>
        </div>
      </div>
    )
  }
}

export default ModelTrainingTycoon
