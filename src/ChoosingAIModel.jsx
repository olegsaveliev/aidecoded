import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { choosingAIModelQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './ChoosingAIModel.css'

/* ───── Tools per stage ───── */
const CAM_TOOLS = {
  0: [
    { name: 'OpenAI', color: '#34C759', desc: 'GPT-5, GPT-5.2, GPT-4.1 model family' },
    { name: 'Anthropic', color: '#34C759', desc: 'Claude Opus, Sonnet, Haiku model family' },
    { name: 'Google DeepMind', color: '#34C759', desc: 'Gemini 3 Pro, Gemini Flash models' },
    { name: 'xAI', color: '#34C759', desc: 'Grok 4.1 with real-time X integration' },
    { name: 'Meta AI', color: '#34C759', desc: 'Llama 4 open-source model family' },
    { name: 'DeepSeek', color: '#34C759', desc: 'Cost-efficient frontier-class models' },
    { name: 'Mistral AI', color: '#34C759', desc: 'European open-source AI models' },
    { name: 'Alibaba Qwen', color: '#34C759', desc: 'Qwen3 open-source model family' },
    { name: 'Artificial Analysis', color: '#34C759', desc: 'Independent model benchmarks and pricing' },
  ],
  1: [
    { name: 'Artificial Analysis', color: '#34C759', desc: 'Independent model benchmarks and pricing' },
    { name: 'LMArena', color: '#34C759', desc: 'Human preference model rankings' },
    { name: 'MMLU', color: '#34C759', desc: 'Massive Multitask Language Understanding benchmark' },
    { name: 'GPQA Diamond', color: '#34C759', desc: 'Graduate-level science benchmark' },
    { name: 'SWE-bench', color: '#34C759', desc: 'Real-world software engineering tasks' },
    { name: 'ARC-AGI-2', color: '#34C759', desc: 'Abstract reasoning benchmark' },
    { name: 'Vellum LLM Leaderboard', color: '#34C759', desc: 'Aggregated LLM performance rankings' },
  ],
  2: [
    { name: 'LMArena', color: '#34C759', desc: 'Human preference model rankings' },
    { name: 'Artificial Analysis', color: '#34C759', desc: 'Independent model benchmarks and pricing' },
    { name: 'Vellum leaderboard', color: '#34C759', desc: 'Aggregated LLM performance rankings' },
    { name: 'HELM', color: '#34C759', desc: 'Holistic Evaluation of Language Models' },
    { name: 'BIG-bench', color: '#34C759', desc: 'Beyond the Imitation Game benchmark' },
    { name: 'EleutherAI', color: '#34C759', desc: 'Open AI research and evaluation tools' },
    { name: 'Braintrust', color: '#34C759', desc: 'AI eval and observability platform' },
    { name: 'Promptfoo', color: '#34C759', desc: 'Open-source LLM evaluation framework' },
    { name: 'OpenCompass', color: '#34C759', desc: 'Comprehensive LLM evaluation platform' },
  ],
  3: [
    { name: 'LangChain model routing', color: '#34C759', desc: 'Framework for LLM application routing' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Data framework for LLM applications' },
    { name: 'LiteLLM', color: '#34C759', desc: 'Unified API for 100+ LLM providers' },
    { name: 'RouteLLM', color: '#34C759', desc: 'Cost-efficient LLM routing framework' },
    { name: 'OpenRouter', color: '#34C759', desc: 'Unified API gateway for AI models' },
    { name: 'AWS Bedrock', color: '#34C759', desc: 'Amazon managed AI model service' },
    { name: 'Azure OpenAI', color: '#34C759', desc: 'Microsoft hosted OpenAI models' },
    { name: 'Vertex AI', color: '#34C759', desc: 'Google Cloud AI model platform' },
  ],
  4: [
    { name: 'LiteLLM', color: '#34C759', desc: 'Unified API for 100+ LLM providers' },
    { name: 'RouteLLM', color: '#34C759', desc: 'Cost-efficient LLM routing framework' },
    { name: 'OpenRouter', color: '#34C759', desc: 'Unified API gateway for AI models' },
    { name: 'LangChain routing', color: '#34C759', desc: 'Framework for LLM application routing' },
    { name: 'Martian', color: '#34C759', desc: 'AI model routing and optimization' },
    { name: 'Neutrino', color: '#34C759', desc: 'Smart model routing platform' },
    { name: 'NotDiamond', color: '#34C759', desc: 'Automated model selection service' },
    { name: 'AWS Bedrock routing', color: '#34C759', desc: 'Amazon cross-model routing' },
  ],
  5: [
    { name: 'OpenAI', color: '#34C759', desc: 'GPT-5, GPT-5.2, GPT-4.1 model family' },
    { name: 'Anthropic', color: '#34C759', desc: 'Claude Opus, Sonnet, Haiku model family' },
    { name: 'Google AI', color: '#34C759', desc: 'Gemini 3 Pro, Gemini Flash models' },
    { name: 'xAI', color: '#34C759', desc: 'Grok 4.1 with real-time X integration' },
    { name: 'DeepSeek', color: '#34C759', desc: 'Cost-efficient frontier-class models' },
    { name: 'Meta AI', color: '#34C759', desc: 'Llama 4 open-source model family' },
    { name: 'Mistral AI', color: '#34C759', desc: 'European open-source AI models' },
    { name: 'Hugging Face', color: '#34C759', desc: 'Open-source model hub and inference' },
    { name: 'Together AI', color: '#34C759', desc: 'Fast inference for open models' },
    { name: 'Fireworks AI', color: '#34C759', desc: 'High-performance model serving' },
  ],
  6: [
    { name: 'LangChain model routing', color: '#34C759', desc: 'Framework for LLM application routing' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Data framework for LLM applications' },
    { name: 'LiteLLM', color: '#34C759', desc: 'Unified API for 100+ LLM providers' },
    { name: 'RouteLLM', color: '#34C759', desc: 'Cost-efficient LLM routing framework' },
    { name: 'Braintrust', color: '#34C759', desc: 'AI eval and observability platform' },
    { name: 'Promptfoo', color: '#34C759', desc: 'Open-source LLM evaluation framework' },
  ],
}

/* ───── Stages ───── */
const STAGES = [
  { key: 'wrong-question', label: 'Wrong Question' },
  { key: 'dimensions', label: '7 Dimensions' },
  { key: 'benchmarks', label: 'Benchmarks' },
  { key: 'task-matching', label: 'Task Match' },
  { key: 'triangle', label: 'The Triangle' },
  { key: 'snapshot', label: 'Snapshot 2026' },
  { key: 'framework', label: 'Your Framework' },
]

const STAGE_TOOLTIPS = {
  'wrong-question': "Why 'which AI is best?' is the wrong question",
  'dimensions': 'The 7 dimensions that actually matter',
  'benchmarks': 'How to read benchmarks without being fooled',
  'task-matching': 'Matching tasks to models — the decision framework',
  'triangle': 'The cost-quality-speed triangle',
  'snapshot': 'Model snapshot — early 2026',
  'framework': 'Build your own selection framework',
}

/* ───── Stage 1 Viz: Tier Pyramid ───── */
const TIER_DATA = [
  {
    tier: 'Frontier',
    models: ['GPT-5.2', 'Claude Opus 4.5', 'Gemini 3 Pro'],
    label: 'Maximum capability. Maximum cost.',
    color: '#5856D6',
    tooltips: {
      'GPT-5.2': 'OpenAI — Adaptive reasoning, professional knowledge work',
      'Claude Opus 4.5': 'Anthropic — Best agentic coding, enterprise safety',
      'Gemini 3 Pro': 'Google — Reasoning benchmark leader, native multimodal',
    },
  },
  {
    tier: 'Mid-Tier',
    models: ['GPT-5', 'Claude Sonnet 4.5', 'Grok 4.1', 'Gemini 2.5 Pro', 'Mistral Large 3'],
    label: 'Strong capability. Reasonable cost.',
    color: '#FF9500',
    tooltips: {
      'GPT-5': 'OpenAI — Strong general-purpose, developer default',
      'Claude Sonnet 4.5': 'Anthropic — Best daily-driver for coding',
      'Grok 4.1': 'xAI — Real-time info, 2M context, LMArena leader',
      'Gemini 2.5 Pro': 'Google — Strong reasoning at mid-tier pricing',
      'Mistral Large 3': 'Mistral — EU provider, Apache 2.0 open-source',
    },
  },
  {
    tier: 'Efficient + Open',
    models: ['DeepSeek V3.2', 'Gemini Flash', 'Llama 4', 'Claude Haiku', 'Qwen3'],
    label: 'High volume. Low cost. Self-hostable.',
    color: '#34C759',
    tooltips: {
      'DeepSeek V3.2': 'DeepSeek — $0.27/M input, MIT license, self-hostable',
      'Gemini Flash': 'Google — 191 tokens/sec, $0.15/M input',
      'Llama 4': 'Meta — 10M context, Apache 2.0, free self-hosted',
      'Claude Haiku': 'Anthropic — Fast + cheap with Claude safety',
      'Qwen3': 'Alibaba — Strong multilingual open-source',
    },
  },
]

function TierPyramidViz({ active }) {
  const [visibleTiers, setVisibleTiers] = useState([])
  const [activeTooltip, setActiveTooltip] = useState(null)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) {
      clearTimers()
      setVisibleTiers([])
      setActiveTooltip(null)
      return
    }
    clearTimers()
    // Build from bottom (index 2) up to top (index 0)
    const order = [2, 1, 0]
    order.forEach((tierIdx, i) => {
      timersRef.current.push(setTimeout(() => {
        setVisibleTiers(prev => [...prev, tierIdx])
      }, 300 * (i + 1)))
    })
    return clearTimers
  }, [active])

  return (
    <div className="cam-viz cam-pyramid-container">
      <div className="cam-pyramid">
        {TIER_DATA.map((tier, idx) => {
          const isVisible = visibleTiers.includes(idx)
          const widthPercent = idx === 0 ? 55 : idx === 1 ? 78 : 100
          return (
            <div
              key={tier.tier}
              className={`cam-tier-layer cam-tier-${idx}${isVisible ? ' cam-tier-visible' : ''}`}
              style={{ '--tier-color': tier.color, '--tier-width': `${widthPercent}%` }}
            >
              <div className="cam-tier-header">
                <span className="cam-tier-name" style={{ color: tier.color }}>{tier.tier}</span>
              </div>
              <div className="cam-tier-models">
                {tier.models.map(model => (
                  <button
                    key={model}
                    className={`cam-tier-model-btn${activeTooltip === model ? ' cam-tier-model-active' : ''}`}
                    onClick={() => setActiveTooltip(activeTooltip === model ? null : model)}
                  >
                    {model}
                    {activeTooltip === model && tier.tooltips[model] && (
                      <span className="cam-tier-tooltip">{tier.tooltips[model]}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="cam-tier-label">{tier.label}</div>
            </div>
          )
        })}
      </div>
      <p className="cam-pyramid-caption">The right tier depends on your task. Not on which tier sounds most impressive.</p>
      <div className="cam-stat-card">
        <strong>Cost range across tiers: up to 100x difference.</strong><br />
        DeepSeek V3.2: $0.27/M input tokens.
        GPT-5.2 Pro: $21/M input tokens.
        Same task. Same quality possible. Right model for the right job.
      </div>
    </div>
  )
}

/* ───── Stage 2 Viz: Radar Chart ───── */
const DIMENSION_LABELS = ['Capability', 'Context', 'Speed', 'Cost', 'Multimodal', 'Privacy', 'Specialization']

const MODEL_PROFILES = {
  'Claude Sonnet 4.5': { color: '#5856D6', scores: [8, 6, 7, 7, 7, 7, 9] },
  'Gemini 2.5 Flash': { color: '#FF9500', scores: [6, 7, 10, 9, 8, 5, 6] },
  'DeepSeek V3.2': { color: '#34C759', scores: [7, 5, 6, 10, 2, 9, 7] },
}

const PRESET_COMPARISONS = {
  'Coding Task': {
    models: ['Claude Sonnet 4.5', 'GPT-5', 'Gemini Flash'],
    profiles: {
      'Claude Sonnet 4.5': { color: '#5856D6', scores: [9, 6, 7, 7, 7, 7, 10] },
      'GPT-5': { color: '#0071E3', scores: [8, 7, 7, 7, 7, 6, 8] },
      'Gemini Flash': { color: '#FF9500', scores: [6, 7, 10, 9, 8, 5, 6] },
    },
    highlight: [0, 6],
    note: 'Notice how Claude leads on Specialization (coding) while Gemini Flash dominates Speed.',
  },
  'Long Document': {
    models: ['Llama 4 Scout', 'Gemini 3 Pro', 'GPT-5'],
    profiles: {
      'Llama 4 Scout': { color: '#34C759', scores: [6, 10, 8, 10, 5, 10, 5] },
      'Gemini 3 Pro': { color: '#FF9500', scores: [10, 9, 6, 7, 9, 5, 8] },
      'GPT-5': { color: '#0071E3', scores: [8, 7, 7, 7, 7, 6, 7] },
    },
    highlight: [1, 5],
    note: 'Llama 4 Scout leads on Context (10M tokens) and Privacy (self-hostable).',
  },
  'Budget Startup': {
    models: ['DeepSeek V3.2', 'Gemini Flash', 'Mistral Small'],
    profiles: {
      'DeepSeek V3.2': { color: '#34C759', scores: [7, 5, 6, 10, 2, 9, 7] },
      'Gemini Flash': { color: '#FF9500', scores: [6, 7, 10, 9, 8, 5, 6] },
      'Mistral Small': { color: '#5856D6', scores: [5, 5, 8, 9, 3, 8, 5] },
    },
    highlight: [3, 2],
    note: 'At tight budgets, Cost and Speed dominate. Capability matters less for high-volume tasks.',
  },
}

function RadarChartViz({ active }) {
  const [selectedDimension, setSelectedDimension] = useState(null)
  const [preset, setPreset] = useState(null)
  const svgSize = 340
  const center = svgSize / 2
  const radius = 100

  const currentProfiles = preset ? PRESET_COMPARISONS[preset].profiles : MODEL_PROFILES
  const highlightAxes = preset ? PRESET_COMPARISONS[preset].highlight : []
  const note = preset ? PRESET_COMPARISONS[preset].note : null

  function getPoint(axisIdx, value) {
    const angle = (Math.PI * 2 * axisIdx) / 7 - Math.PI / 2
    const r = (value / 10) * radius
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) }
  }

  function getPolygonPoints(scores) {
    return scores.map((val, i) => {
      const pt = getPoint(i, val)
      return `${pt.x},${pt.y}`
    }).join(' ')
  }

  useEffect(() => {
    if (!active) {
      setSelectedDimension(null)
      setPreset(null)
    }
  }, [active])

  return (
    <div className="cam-viz cam-radar-container">
      <div className="cam-radar-presets">
        {['Coding Task', 'Long Document', 'Budget Startup'].map(p => (
          <button
            key={p}
            className={`cam-radar-preset-btn${preset === p ? ' cam-radar-preset-active' : ''}`}
            onClick={() => setPreset(preset === p ? null : p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="cam-radar-chart-wrap">
        <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="cam-radar-svg">
          {/* Grid circles */}
          {[2, 4, 6, 8, 10].map(v => (
            <circle key={v} cx={center} cy={center} r={(v / 10) * radius} className="cam-radar-grid" />
          ))}
          {/* Axes */}
          {DIMENSION_LABELS.map((_, i) => {
            const pt = getPoint(i, 10)
            const isHighlighted = highlightAxes.includes(i)
            return (
              <line
                key={i}
                x1={center} y1={center} x2={pt.x} y2={pt.y}
                className={`cam-radar-axis${isHighlighted ? ' cam-radar-axis-highlight' : ''}`}
              />
            )
          })}
          {/* Model polygons */}
          {Object.entries(currentProfiles).map(([name, profile]) => (
            <polygon
              key={name}
              points={getPolygonPoints(profile.scores)}
              fill={profile.color}
              fillOpacity={0.08}
              stroke={profile.color}
              strokeWidth="1.5"
            />
          ))}
          {/* Axis labels */}
          {DIMENSION_LABELS.map((label, i) => {
            const pt = getPoint(i, 12.5)
            const isHighlighted = highlightAxes.includes(i)
            return (
              <text
                key={label}
                x={pt.x} y={pt.y}
                className={`cam-radar-label${isHighlighted ? ' cam-radar-label-highlight' : ''}${selectedDimension === i ? ' cam-radar-label-selected' : ''}`}
                textAnchor="middle"
                dominantBaseline="middle"
                onClick={() => setSelectedDimension(selectedDimension === i ? null : i)}
                style={{ cursor: 'pointer' }}
                aria-label={`Select ${label} dimension`}
              >
                {label}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="cam-radar-legend">
        {Object.entries(currentProfiles).map(([name, profile]) => (
          <span key={name} className="cam-radar-legend-item">
            <span className="cam-radar-legend-dot" style={{ background: profile.color }} />
            {name}
          </span>
        ))}
      </div>

      {note && <p className="cam-radar-note">{note}</p>}

      <div className="cam-dimension-pills">
        {DIMENSION_LABELS.map((label, i) => (
          <button
            key={label}
            className={`cam-dimension-pill${selectedDimension === i ? ' cam-dimension-pill-active' : ''}`}
            onClick={() => setSelectedDimension(selectedDimension === i ? null : i)}
          >
            {label}
          </button>
        ))}
      </div>
      {selectedDimension !== null && (
        <div className="cam-dimension-detail cam-fade-in">
          <strong>{DIMENSION_LABELS[selectedDimension]}</strong>
          <p>{getDimensionDescription(selectedDimension)}</p>
        </div>
      )}
    </div>
  )
}

function getDimensionDescription(idx) {
  const descs = [
    'Raw quality of reasoning, writing, and understanding. Measured by benchmarks like MMLU, GPQA, and human preference votes. Matters most for complex, high-stakes tasks.',
    'How much text the model can see at once. Ranges from 128K (DeepSeek) to 10M tokens (Llama 4 Scout). Critical for long documents, large codebases, multi-document analysis.',
    'Time to first token and tokens per second. Gemini Flash leads at 191 t/s. Critical for real-time UX and user-facing applications.',
    'Price per million input and output tokens. Ranges from $0.03 (Gemma 3n) to $168 (GPT-5.2 Pro output). Dominates decisions at high volume.',
    'Can the model process images, audio, or video? Gemini 3 Pro leads with text + image + audio + video. DeepSeek V3.2 is text-only.',
    'Where does data go? Closed APIs process data on provider servers. Open-source models can run entirely on your infrastructure for full data control.',
    'Has the model been tuned for specific tasks? Claude leads coding (SWE-bench 80.9%), Grok leads real-time info, DeepSeek leads math (IMO 2025 gold).',
  ]
  return descs[idx]
}

/* ───── Stage 3 Viz: Benchmark Explorer ───── */
const BENCHMARK_DATA = {
  'LMArena Elo': {
    models: [
      { name: 'Gemini 3 Pro', score: 1501 },
      { name: 'Grok 4.1', score: 1483 },
      { name: 'Claude Opus 4.5', score: 1460 },
      { name: 'GPT-5.2', score: 1450 },
      { name: 'DeepSeek V3.2', score: 1410 },
    ],
    maxScore: 1550,
  },
  'SWE-bench': {
    models: [
      { name: 'Claude Opus 4.5', score: 80.9 },
      { name: 'Gemini 3 Flash', score: 78 },
      { name: 'GPT-5.2', score: 75 },
      { name: 'DeepSeek V3.2', score: 70 },
      { name: 'Grok 4.1', score: 65 },
    ],
    maxScore: 100,
  },
  'GPQA Diamond': {
    models: [
      { name: 'Gemini 3 Pro', score: 91.9 },
      { name: 'Claude Opus 4.5', score: 85 },
      { name: 'GPT-5.2', score: 83 },
      { name: 'DeepSeek V3.2', score: 80 },
      { name: 'Grok 4.1', score: 78 },
    ],
    maxScore: 100,
  },
  'MMMLU Multilingual': {
    models: [
      { name: 'Gemini 3 Pro', score: 91.8 },
      { name: 'Claude Opus 4.5', score: 90.8 },
      { name: 'GPT-5.2', score: 89 },
      { name: 'Grok 4.1', score: 87 },
      { name: 'DeepSeek V3.2', score: 85 },
    ],
    maxScore: 100,
  },
}

const MODEL_COLORS = {
  'Gemini 3 Pro': '#FF9500',
  'Gemini 3 Flash': '#FF9500',
  'Grok 4.1': '#0071E3',
  'Claude Opus 4.5': '#5856D6',
  'GPT-5.2': '#8E8E93',
  'DeepSeek V3.2': '#34C759',
}

const BENCHMARK_DESCRIPTIONS = {
  'LMArena Elo': 'Human preference votes. Real people compare two model responses side-by-side and pick the better one. Elo ratings (like chess) rank models by how often humans prefer them.',
  'SWE-bench': 'Real-world software engineering tasks. Models must fix actual GitHub issues from open-source projects. Measures practical coding ability, not toy problems.',
  'GPQA Diamond': 'Graduate-level science questions written by domain experts. Tests deep reasoning in physics, chemistry, and biology. Questions are hard enough that non-experts score near random.',
  'MMMLU Multilingual': 'Massive Multitask Language Understanding across 14+ languages. Tests knowledge and reasoning beyond English. Reveals how models perform for non-English users.',
}

function BenchmarkExplorerViz({ active }) {
  const [activeBenchmark, setActiveBenchmark] = useState('LMArena Elo')
  const benchmarks = Object.keys(BENCHMARK_DATA)

  useEffect(() => {
    if (!active) setActiveBenchmark('LMArena Elo')
  }, [active])

  const data = BENCHMARK_DATA[activeBenchmark]

  return (
    <div className="cam-viz cam-benchmark-container">
      <div className="cam-benchmark-tabs">
        {benchmarks.map(b => (
          <button
            key={b}
            className={`cam-benchmark-tab${activeBenchmark === b ? ' cam-benchmark-tab-active' : ''}`}
            onClick={() => setActiveBenchmark(b)}
          >
            {b}
          </button>
        ))}
      </div>

      <div className="cam-benchmark-desc cam-fade-in" key={activeBenchmark}>
        {BENCHMARK_DESCRIPTIONS[activeBenchmark]}
      </div>

      <div className="cam-benchmark-chart">
        {data.models.map((m, i) => {
          const pct = (m.score / data.maxScore) * 100
          return (
            <div key={`${activeBenchmark}-${m.name}`} className="cam-benchmark-row cam-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="cam-benchmark-model-name">{m.name}</span>
              <div className="cam-benchmark-bar-track">
                <div
                  className="cam-benchmark-bar-fill"
                  style={{
                    width: `${pct}%`,
                    background: MODEL_COLORS[m.name] || '#8E8E93',
                  }}
                />
              </div>
              <span className="cam-benchmark-score">{m.score}{activeBenchmark !== 'LMArena Elo' ? '%' : ''}</span>
            </div>
          )
        })}
      </div>

      <p className="cam-benchmark-insight">
        Notice: no single model wins all four. The &ldquo;best model&rdquo; changes with every benchmark. This is why your eval suite matters more than any public leaderboard.
      </p>

      <div className="cam-eval-callout">
        <strong>Build your eval in 3 steps:</strong>
        <ol>
          <li>Collect 20 real queries from your use case.</li>
          <li>Write expected answers or rubric.</li>
          <li>Score each model. Deploy the winner.</li>
        </ol>
        <p>This takes 2 hours. It is more valuable than any benchmark comparison.</p>
      </div>
    </div>
  )
}

/* ───── Stage 4 Viz: Task Matcher ───── */
const TASK_TYPES = [
  { id: 'reasoning', label: 'Complex Reasoning', icon: 'brain' },
  { id: 'coding', label: 'Coding', icon: 'code' },
  { id: 'long-docs', label: 'Long Documents', icon: 'doc' },
  { id: 'realtime', label: 'Real-time Info', icon: 'live' },
  { id: 'high-volume', label: 'High Volume', icon: 'volume' },
  { id: 'multimodal', label: 'Multimodal', icon: 'image' },
  { id: 'private', label: 'Private Deploy', icon: 'lock' },
  { id: 'safety', label: 'Enterprise Safety', icon: 'shield' },
]

const TASK_RECOMMENDATIONS = {
  reasoning: {
    primary: { model: 'Gemini 3 Pro (Deep Think)', reason: 'Reasoning benchmark leader (GPQA 91.9%). Best value at frontier quality.' },
    alternative: { model: 'GPT-5.2', reason: 'Edges on professional knowledge work. Stronger ecosystem integration.' },
  },
  coding: {
    primary: { model: 'Claude Sonnet 4.5', reason: 'SWE-bench leader ecosystem. Best coding agent behavior at reasonable cost ($3/M).' },
    alternative: { model: 'Claude Opus 4.5', reason: 'Maximum quality for complex code. 30+ hour autonomous agent runs.' },
  },
  'long-docs': {
    primary: { model: 'Llama 4 Scout', reason: '10M token context. Free self-hosted. Handles entire codebases and book-length contracts.' },
    alternative: { model: 'Gemini 3 Pro', reason: '1M context with stronger reasoning. Better analysis quality.' },
  },
  realtime: {
    primary: { model: 'Grok 4.1', reason: 'Native X and web integration. 2M context. Built for current-day awareness.' },
    alternative: { model: 'Perplexity Sonar', reason: 'Search-optimized with fast citations. Better for research queries.' },
  },
  'high-volume': {
    primary: { model: 'DeepSeek V3.2 or Gemini Flash', reason: '$0.15-0.27/M input. Only models with economics that work at millions of daily requests.' },
    alternative: { model: 'Self-hosted Llama 4 Scout', reason: 'Eliminates API cost entirely at extreme volume.' },
  },
  multimodal: {
    primary: { model: 'Gemini 3 Pro', reason: 'Text + image + audio + video. Most complete multimodal support.' },
    alternative: { model: 'GPT-5.2', reason: 'Text + image + audio. Stronger on image reasoning.' },
  },
  private: {
    primary: { model: 'Llama 4 Scout (self-hosted)', reason: 'Apache 2.0. No data leaves your infrastructure. Full control.' },
    alternative: { model: 'Mistral Large 3', reason: 'EU-based provider. GDPR native. Apache 2.0 license.' },
  },
  safety: {
    primary: { model: 'Claude family', reason: 'Constitutional AI safety training. Lowest hallucination rates. Audit-friendly agent behavior.' },
    alternative: { model: 'GPT-5 with Azure', reason: 'Enterprise compliance via Microsoft Azure. Content filtering built-in.' },
  },
}

function getMatcherRecommendation(task, budget, volume, constraints) {
  if (!task) return null
  const hasPrivacy = constraints.includes('Data must stay private')
  const hasRealtime = constraints.includes('Need real-time info')
  const hasLongContext = constraints.includes('Context > 200K tokens')
  const hasMultimodal = constraints.includes('Image/video input')
  const hasSpeed = constraints.includes('Speed < 500ms')
  const isCheap = budget === '$50/mo' || budget === '$500/mo'
  const isHighVolume = volume === '10K-1M' || volume === '1M+'

  // Hard constraints override task-based picks
  if (hasPrivacy) {
    return {
      primary: { model: 'Llama 4 Scout (self-hosted)', reason: 'Privacy constraint requires self-hosting. Apache 2.0, 10M context. No data leaves your infrastructure.' },
      alternative: { model: 'Mistral Large 3', reason: 'EU-based alternative. GDPR native. Apache 2.0 license.' },
      note: 'Privacy constraint overrides task preference — only open-source self-hosted models qualify.',
    }
  }
  if (hasSpeed && isHighVolume) {
    return {
      primary: { model: 'Gemini 2.5 Flash', reason: '191 tokens/sec at $0.15/M. The only model fast and cheap enough for high-volume real-time.' },
      alternative: { model: 'Claude Haiku 4.5', reason: 'Faster than mid-tier models with Claude safety properties. $1/M input.' },
      note: 'Speed + volume constraints push toward the fastest budget models.',
    }
  }
  if (hasLongContext) {
    if (isCheap) {
      return {
        primary: { model: 'Llama 4 Scout', reason: '10M token context. Free when self-hosted. Only model with massive context at zero API cost.' },
        alternative: { model: 'Gemini 2.5 Flash', reason: '1M context at $0.15/M. Much cheaper than Gemini 3 Pro for long docs.' },
        note: 'Budget constraint + long context narrows options to open-source or Flash tier.',
      }
    }
    return {
      primary: { model: 'Gemini 3 Pro', reason: '1M token context with frontier reasoning. Best quality for long document analysis.' },
      alternative: { model: 'Llama 4 Scout', reason: '10M context, free self-hosted. Choose if context length matters more than reasoning.' },
      note: 'Long context constraint prioritizes models with 1M+ token windows.',
    }
  }

  // Budget + volume override task-based picks
  if (isCheap && isHighVolume) {
    return {
      primary: { model: 'DeepSeek V3.2', reason: '$0.27/M input. Near-frontier quality at 10-30x less cost. MIT license if you want to self-host later.' },
      alternative: { model: 'Gemini 2.5 Flash', reason: '$0.15/M with 191 t/s. Even cheaper but trades some quality.' },
      note: 'Tight budget + high volume eliminates all mid-tier and frontier models.',
    }
  }
  if (isHighVolume) {
    return {
      primary: { model: 'DeepSeek V3.2 or Gemini Flash', reason: '$0.15-0.27/M input. Only models with economics that work at millions of daily requests.' },
      alternative: { model: 'Self-hosted Llama 4 Scout', reason: 'Eliminates API cost entirely. Worth it above ~500K queries/day.' },
      note: 'At this volume, cost per query dominates all other factors.',
    }
  }
  if (isCheap) {
    const base = TASK_RECOMMENDATIONS[task]
    return {
      primary: { model: 'DeepSeek V3.2', reason: 'Best capability per dollar at $0.27/M. Strong on coding and math. Fits tight budgets.' },
      alternative: { model: 'Gemini 2.5 Flash', reason: '$0.15/M with fast speed. Slightly less capable but even cheaper.' },
      note: `Budget constraint shifts away from the default ${task} pick. Upgrade to mid-tier when budget allows.`,
    }
  }

  // Constraint-influenced task recommendations
  if (hasRealtime) {
    return {
      primary: { model: 'Grok 4.1', reason: 'Native X and web integration. 2M context. Built for current-day awareness and live data.' },
      alternative: { model: 'Perplexity Sonar', reason: 'Search-optimized with fast citations. Better for structured research queries.' },
      note: 'Real-time constraint overrides task default — only models with live data access qualify.',
    }
  }
  if (hasMultimodal) {
    return {
      primary: { model: 'Gemini 3 Pro', reason: 'Text + image + audio + video. Most complete multimodal support across all modalities.' },
      alternative: { model: 'GPT-5.2', reason: 'Text + image + audio. Stronger on image reasoning and professional work.' },
      note: 'Multimodal constraint limits options — DeepSeek and text-only models excluded.',
    }
  }
  if (hasSpeed) {
    const base = TASK_RECOMMENDATIONS[task]
    return {
      primary: { model: 'Gemini 2.5 Flash', reason: '191 tokens/sec at $0.15/M. Fastest inference for real-time user-facing applications.' },
      alternative: { model: 'Claude Haiku 4.5', reason: 'Fast with Claude safety properties. Better for customer-facing apps.' },
      note: 'Speed constraint favors Flash/Haiku tier over frontier models.',
    }
  }

  // Pure task-based (no overriding constraints or budget pressure)
  const base = TASK_RECOMMENDATIONS[task]
  return { ...base, note: null }
}

function TaskMatcherViz({ active }) {
  const [selectedTask, setSelectedTask] = useState(null)
  const [budget, setBudget] = useState(null)
  const [volume, setVolume] = useState(null)
  const [constraints, setConstraints] = useState([])

  const BUDGETS = ['$50/mo', '$500/mo', '$2,000/mo', '$10,000+/mo']
  const VOLUMES = ['< 100/day', '100-10K', '10K-1M', '1M+']
  const HARD_CONSTRAINTS = [
    'Data must stay private',
    'Need real-time info',
    'Context > 200K tokens',
    'Image/video input',
    'Speed < 500ms',
  ]

  useEffect(() => {
    if (!active) {
      setSelectedTask(null)
      setBudget(null)
      setVolume(null)
      setConstraints([])
    }
  }, [active])

  const rec = getMatcherRecommendation(selectedTask, budget, volume, constraints)

  function toggleConstraint(c) {
    setConstraints(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  return (
    <div className="cam-viz cam-matcher-container">
      <p className="cam-matcher-prompt">What are you building?</p>

      <div className="cam-matcher-tasks">
        {TASK_TYPES.map(t => (
          <button
            key={t.id}
            className={`cam-matcher-task-btn${selectedTask === t.id ? ' cam-matcher-task-active' : ''}`}
            onClick={() => setSelectedTask(selectedTask === t.id ? null : t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {selectedTask && (
        <div className="cam-matcher-options cam-fade-in">
          <div className="cam-matcher-option-group">
            <span className="cam-matcher-option-label">Monthly AI spend:</span>
            <div className="cam-matcher-pills">
              {BUDGETS.map(b => (
                <button key={b} className={`cam-matcher-pill${budget === b ? ' cam-matcher-pill-active' : ''}`} onClick={() => setBudget(budget === b ? null : b)}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="cam-matcher-option-group">
            <span className="cam-matcher-option-label">Requests per day:</span>
            <div className="cam-matcher-pills">
              {VOLUMES.map(v => (
                <button key={v} className={`cam-matcher-pill${volume === v ? ' cam-matcher-pill-active' : ''}`} onClick={() => setVolume(volume === v ? null : v)}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="cam-matcher-option-group">
            <span className="cam-matcher-option-label">Hard constraints:</span>
            <div className="cam-matcher-pills">
              {HARD_CONSTRAINTS.map(c => (
                <button key={c} className={`cam-matcher-pill${constraints.includes(c) ? ' cam-matcher-pill-active' : ''}`} onClick={() => toggleConstraint(c)}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {rec && (
        <div className="cam-matcher-result cam-fade-in" key={`${selectedTask}-${budget}-${volume}-${constraints.join(',')}`}>
          <div className="cam-matcher-rec-primary">
            <div className="cam-matcher-rec-header">
              <CheckIcon size={16} />
              <strong>Primary recommendation</strong>
            </div>
            <div className="cam-matcher-rec-model">{rec.primary.model}</div>
            <p className="cam-matcher-rec-reason">{rec.primary.reason}</p>
          </div>
          <div className="cam-matcher-rec-alt">
            <div className="cam-matcher-rec-header">
              <span className="cam-matcher-alt-label">Alternative</span>
            </div>
            <div className="cam-matcher-rec-model">{rec.alternative.model}</div>
            <p className="cam-matcher-rec-reason">{rec.alternative.reason}</p>
          </div>
          {rec.note && (
            <div className="cam-matcher-rec-note">
              <TipIcon size={14} color="#eab308" />
              <span>{rec.note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ───── Stage 5 Viz: Triangle ───── */
const ARCHETYPES = {
  'Rocket': { pos: [0.50, 0.18], labelPos: 'below', models: 'Claude Opus 4.5, GPT-5.2', desc: 'Maximum capability. High cost. For tasks where quality is everything.' },
  'Workhorse': { pos: [0.35, 0.50], labelPos: 'below', models: 'Claude Sonnet, GPT-5, Gemini Pro', desc: 'Mid-tier capability. Mid-tier cost. The safe default for most apps.' },
  'Conveyor Belt': { pos: [0.65, 0.76], labelPos: 'below', models: 'DeepSeek V3.2, Gemini Flash, Haiku', desc: 'Good enough capability. Minimum cost. Maximum speed.' },
}

function TriangleViz({ active }) {
  const [activeArchetype, setActiveArchetype] = useState(null)
  const [queriesPerDay, setQueriesPerDay] = useState(10000)

  useEffect(() => {
    if (!active) {
      setActiveArchetype(null)
      setQueriesPerDay(10000)
    }
  }, [active])

  // Cost calculator
  const flagshipCostPerQuery = 0.021 // ~$21/M tokens, avg 1K tokens per query
  const hybridCostPerQuery = 0.0035  // ~$3.5/M weighted average
  const flagshipDaily = (queriesPerDay * flagshipCostPerQuery).toFixed(0)
  const hybridDaily = (queriesPerDay * hybridCostPerQuery).toFixed(0)
  const annualSaving = ((queriesPerDay * flagshipCostPerQuery - queriesPerDay * hybridCostPerQuery) * 365).toFixed(0)

  const archData = activeArchetype ? ARCHETYPES[activeArchetype] : null

  return (
    <div className="cam-viz cam-triangle-container">
      <div className="cam-triangle-svg-wrap">
        <svg viewBox="0 0 360 300" className="cam-triangle-svg">
          {/* Triangle */}
          <polygon points="180,35 30,260 330,260" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          {/* Corner labels */}
          <text x="180" y="20" textAnchor="middle" className="cam-triangle-corner-text" fill="var(--text-secondary)">Good</text>
          <text x="22" y="282" textAnchor="start" className="cam-triangle-corner-text" fill="var(--text-secondary)">Fast</text>
          <text x="338" y="282" textAnchor="end" className="cam-triangle-corner-text" fill="var(--text-secondary)">Cheap</text>
          {/* Archetype zones */}
          {Object.entries(ARCHETYPES).map(([name, arch]) => {
            const cx = 30 + arch.pos[0] * 300
            const cy = 35 + arch.pos[1] * 225
            const isActive = activeArchetype === name
            const labelDy = arch.labelPos === 'above' ? -20 : 26
            return (
              <g key={name} style={{ cursor: 'pointer' }} onClick={() => setActiveArchetype(isActive ? null : name)}>
                <circle
                  cx={cx} cy={cy} r={isActive ? 14 : 10}
                  fill={isActive ? '#34C759' : 'var(--bg-surface)'}
                  stroke={isActive ? '#34C759' : 'var(--border)'}
                  strokeWidth="1.5"
                  style={{ transition: 'all 0.15s ease' }}
                />
                <text
                  x={cx} y={cy + labelDy}
                  textAnchor="middle"
                  className="cam-triangle-archetype-label"
                  fill={isActive ? '#34C759' : 'var(--text-secondary)'}
                >
                  {name}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="cam-archetype-presets">
        {Object.keys(ARCHETYPES).map(name => (
          <button
            key={name}
            className={`cam-archetype-btn${activeArchetype === name ? ' cam-archetype-btn-active' : ''}`}
            onClick={() => setActiveArchetype(activeArchetype === name ? null : name)}
          >
            {name}
          </button>
        ))}
      </div>

      {archData && (
        <div className="cam-archetype-detail cam-fade-in">
          <div className="cam-archetype-models">{archData.models}</div>
          <p>{archData.desc}</p>
        </div>
      )}

      <div className="cam-cost-calculator">
        <div className="cam-cost-header">
          <strong>Hybrid routing cost calculator</strong>
          <p className="cam-cost-explainer">Instead of sending every query to an expensive flagship model, hybrid routing classifies each request by complexity and routes simple queries to fast, cheap models while reserving frontier models for hard tasks. This typically saves 70&ndash;90% on API costs with minimal quality loss.</p>
        </div>
        <div className="cam-cost-slider-row">
          <label className="cam-cost-label">Queries per day: <strong>{queriesPerDay.toLocaleString()}</strong></label>
          <input
            type="range"
            min="1000"
            max="1000000"
            step="1000"
            value={queriesPerDay}
            onChange={e => setQueriesPerDay(Number(e.target.value))}
            className="cam-cost-slider"
            aria-valuetext={`${queriesPerDay.toLocaleString()} queries per day`}
          />
        </div>
        <div className="cam-cost-comparison">
          <div className="cam-cost-row">
            <span>All-flagship:</span>
            <span className="cam-cost-amount cam-cost-high">${Number(flagshipDaily).toLocaleString()}/day</span>
          </div>
          <div className="cam-cost-row">
            <span>Hybrid routing:</span>
            <span className="cam-cost-amount cam-cost-low">${Number(hybridDaily).toLocaleString()}/day</span>
          </div>
          <div className="cam-cost-row cam-cost-saving">
            <span>Annual saving:</span>
            <span className="cam-cost-amount cam-cost-green">${Number(annualSaving).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───── Stage 6 Viz: Model Table ───── */
const MODEL_TABLE_DATA = [
  { provider: 'OpenAI', model: 'GPT-5.2', context: '400K', inputCost: 21, bestFor: 'Professional knowledge work, complex reasoning', openSource: false, multimodal: true, tier: 'frontier',
    strengths: ['Adaptive reasoning adjusts depth by task', '50% fewer tokens than competitors at similar quality', 'Largest developer ecosystem'],
    weaknesses: ['Premium pricing, especially Pro variant', 'Closed source with limited customization'] },
  { provider: 'OpenAI', model: 'GPT-5', context: '400K', inputCost: 1.25, bestFor: 'Developer default, general-purpose', openSource: false, multimodal: true, tier: 'mid',
    strengths: ['Strong general capability at reasonable cost', 'Deep ecosystem integration', 'Good balance of speed and quality'],
    weaknesses: ['Not the leader in any single benchmark', 'Closed source'] },
  { provider: 'Anthropic', model: 'Claude Opus 4.5', context: '200K', inputCost: 15, bestFor: 'Agentic coding, enterprise safety', openSource: false, multimodal: true, tier: 'frontier',
    strengths: ['SWE-bench leader (80.9%)', '30+ hour autonomous agent runs', 'Constitutional AI safety training'],
    weaknesses: ['Expensive ($15/M input)', 'Slower inference than alternatives'] },
  { provider: 'Anthropic', model: 'Claude Sonnet 4.5', context: '200K', inputCost: 3, bestFor: 'Daily-driver for coding, B2B', openSource: false, multimodal: true, tier: 'mid',
    strengths: ['Best coding assistant at mid-tier pricing', 'Strong safety and compliance', 'Fast enough for real-time use'],
    weaknesses: ['200K context smaller than some competitors', 'Closed source'] },
  { provider: 'Google', model: 'Gemini 3 Pro', context: '1M', inputCost: 2.5, bestFor: 'Reasoning, science, multimodal', openSource: false, multimodal: true, tier: 'frontier',
    strengths: ['Reasoning benchmark leader (GPQA 91.9%)', 'Native text + image + audio + video', 'Best value flagship model'],
    weaknesses: ['Less proven in production agents', 'Google ecosystem dependency'] },
  { provider: 'Google', model: 'Gemini 2.5 Flash', context: '1M', inputCost: 0.15, bestFor: 'High-volume real-time apps', openSource: false, multimodal: true, tier: 'budget',
    strengths: ['191 tokens/sec throughput', '$0.15/M input is near-cheapest', '1M context at budget pricing'],
    weaknesses: ['Not suited for complex reasoning', 'Quality trade-offs at this speed'] },
  { provider: 'xAI', model: 'Grok 4.1', context: '2M', inputCost: 3, bestFor: 'Real-time info, trend analysis', openSource: false, multimodal: true, tier: 'mid',
    strengths: ['Native X/web integration', 'LMArena #1 in EQ and conversation', '2M context in mid-tier'],
    weaknesses: ['Less proven for code and agents', 'X ecosystem dependency'] },
  { provider: 'DeepSeek', model: 'DeepSeek V3.2', context: '128K', inputCost: 0.27, bestFor: 'Cost-sensitive production, math', openSource: true, multimodal: false, tier: 'budget',
    strengths: ['10-30x cheaper than Western frontiers', 'MIT license enables free self-hosting', 'IMO 2025 gold in mathematics'],
    weaknesses: ['No multimodal support', 'China-based provider (data sovereignty concerns)'] },
  { provider: 'Meta', model: 'Llama 4 Scout', context: '10M', inputCost: 0, bestFor: 'Private deployment, massive context', openSource: true, multimodal: true, tier: 'budget',
    strengths: ['10M token context window (largest)', 'Apache 2.0 fully open-source', 'No API costs when self-hosted'],
    weaknesses: ['Requires infrastructure to self-host', 'Less cutting-edge than closed frontiers'] },
  { provider: 'Mistral', model: 'Mistral Large 3', context: '128K', inputCost: 2, bestFor: 'EU data sovereignty, multilingual', openSource: true, multimodal: false, tier: 'mid',
    strengths: ['Apache 2.0 with European provider', 'GDPR native compliance', 'Strong multilingual performance'],
    weaknesses: ['Not frontier-class capability', 'Smaller ecosystem than OpenAI/Google'] },
]

const TABLE_FILTERS = ['All', 'Frontier', 'Mid-tier', 'Budget', 'Open Source', 'Multimodal', 'Coding', 'Long Context']

function ModelTableViz({ active }) {
  const [filter, setFilter] = useState('All')
  const [expandedRow, setExpandedRow] = useState(null)
  const [sortBy, setSortBy] = useState(null)

  useEffect(() => {
    if (!active) {
      setFilter('All')
      setExpandedRow(null)
      setSortBy(null)
    }
  }, [active])

  let filtered = MODEL_TABLE_DATA
  if (filter === 'Frontier') filtered = filtered.filter(m => m.tier === 'frontier')
  else if (filter === 'Mid-tier') filtered = filtered.filter(m => m.tier === 'mid')
  else if (filter === 'Budget') filtered = filtered.filter(m => m.tier === 'budget')
  else if (filter === 'Open Source') filtered = filtered.filter(m => m.openSource)
  else if (filter === 'Multimodal') filtered = filtered.filter(m => m.multimodal)
  else if (filter === 'Coding') filtered = filtered.filter(m => ['Claude Opus 4.5', 'Claude Sonnet 4.5', 'GPT-5.2', 'DeepSeek V3.2'].includes(m.model))
  else if (filter === 'Long Context') filtered = filtered.filter(m => parseInt(m.context) >= 1000 || m.context.includes('M'))

  if (sortBy === 'cost') filtered = [...filtered].sort((a, b) => a.inputCost - b.inputCost)
  else if (sortBy === 'context') filtered = [...filtered].sort((a, b) => {
    const parseCtx = c => c.includes('M') ? parseFloat(c) * 1000 : parseFloat(c)
    return parseCtx(b.context) - parseCtx(a.context)
  })
  else if (sortBy === 'provider') filtered = [...filtered].sort((a, b) => a.provider.localeCompare(b.provider))

  function getPricePill(cost) {
    if (cost === 0) return 'cam-price-free'
    if (cost < 1) return 'cam-price-green'
    if (cost <= 5) return 'cam-price-amber'
    return 'cam-price-red'
  }

  return (
    <div className="cam-viz cam-table-container">
      <div className="cam-snapshot-notice">
        <WarningIcon size={16} color="#FF9500" />
        <span>This stage reflects the model landscape as of early 2026. AI models update every few months. The framework in stages 1&ndash;5 and 7 is timeless. This stage will go stale &mdash; treat it as a snapshot, not a permanent truth.</span>
      </div>

      <div className="cam-table-filters">
        {TABLE_FILTERS.map(f => (
          <button
            key={f}
            className={`cam-table-filter${filter === f ? ' cam-table-filter-active' : ''}`}
            onClick={() => { setFilter(f); setExpandedRow(null) }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="cam-table-sort-row">
        <span className="cam-table-sort-label">Sort by:</span>
        {['cost', 'context', 'provider'].map(s => (
          <button
            key={s}
            className={`cam-table-sort-btn${sortBy === s ? ' cam-table-sort-active' : ''}`}
            onClick={() => setSortBy(sortBy === s ? null : s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="cam-table">
        <div className="cam-table-header">
          <span className="cam-th cam-th-provider">Provider</span>
          <span className="cam-th cam-th-model">Model</span>
          <span className="cam-th cam-th-context">Context</span>
          <span className="cam-th cam-th-cost">$/M Input</span>
          <span className="cam-th cam-th-best">Best For</span>
          <span className="cam-th cam-th-flags">OS</span>
          <span className="cam-th cam-th-flags">MM</span>
        </div>
        {filtered.map(m => (
          <div key={m.model}>
            <div
              className={`cam-table-row${expandedRow === m.model ? ' cam-table-row-expanded' : ''}`}
              onClick={() => setExpandedRow(expandedRow === m.model ? null : m.model)}
            >
              <span className="cam-td cam-td-provider">{m.provider}</span>
              <span className="cam-td cam-td-model"><strong>{m.model}</strong></span>
              <span className="cam-td cam-td-context">{m.context}</span>
              <span className="cam-td cam-td-cost">
                <span className={`cam-price-pill ${getPricePill(m.inputCost)}`}>
                  {m.inputCost === 0 ? 'Free' : `$${m.inputCost}`}
                </span>
              </span>
              <span className="cam-td cam-td-best">{m.bestFor}</span>
              <span className="cam-td cam-td-flags">{m.openSource ? <CheckIcon size={14} /> : <CrossIcon size={14} />}</span>
              <span className="cam-td cam-td-flags">{m.multimodal ? <CheckIcon size={14} /> : <CrossIcon size={14} />}</span>
            </div>
            {expandedRow === m.model && (
              <div className="cam-table-expand cam-fade-in">
                <div className="cam-expand-section">
                  <div className="cam-expand-title"><CheckIcon size={14} /> Strengths</div>
                  <ul>{m.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
                <div className="cam-expand-section">
                  <div className="cam-expand-title"><CrossIcon size={14} /> Weaknesses</div>
                  <ul>{m.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="cam-snapshot-date">Snapshot date: Early 2026. This comparison changes as models update. Always verify current pricing at provider docs.</p>
    </div>
  )
}

/* ───── Stage 7 Viz: Framework Builder ───── */
const FRAMEWORK_PRESETS = [
  'Customer support chatbot',
  'Code review assistant',
  'Document analysis tool',
  'Research assistant',
  'Content moderation',
  'Data extraction pipeline',
]

const FRAMEWORK_CONSTRAINTS = [
  'Data privacy required',
  'Context > 200K tokens',
  'Speed < 500ms',
  'Image/video input',
  'EU data residency',
  'Budget < $1/M tokens',
]

const FRAMEWORK_BUDGETS = ['$50', '$200', '$500', '$2,000', '$10,000+']

const CONCEPT_PILLS = [
  { name: 'Model Routing', desc: 'Automatically sending each query to the cheapest model that can handle it well. The key cost optimization strategy for production AI.' },
  { name: 'Eval-Driven Selection', desc: 'Choosing models based on your own test suite instead of public benchmarks. The only reliable way to know what works for your task.' },
  { name: 'Context Window', desc: 'How much text a model can reason over at once. Ranges from 128K to 10M tokens. Critical for document-heavy applications.' },
  { name: 'Total Cost of Ownership', desc: 'API costs + infrastructure + engineering time + monitoring. Self-hosting is free per-query but costly to maintain.' },
  { name: 'Benchmark Literacy', desc: 'Understanding that benchmarks measure specific skills, not overall quality. No model wins every benchmark.' },
]

function FrameworkBuilderViz({ active }) {
  const [useCase, setUseCase] = useState('')
  const [selectedConstraints, setSelectedConstraints] = useState([])
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [generated, setGenerated] = useState(false)
  const [revealedConcepts, setRevealedConcepts] = useState(0)
  const [expandedConcept, setExpandedConcept] = useState(null)

  useEffect(() => {
    if (!active) {
      setUseCase('')
      setSelectedConstraints([])
      setSelectedBudget(null)
      setGenerated(false)
      setRevealedConcepts(0)
      setExpandedConcept(null)
    }
  }, [active])

  function toggleConstraint(c) {
    setSelectedConstraints(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  function generateFramework() {
    setGenerated(true)
  }

  function getRecommendation() {
    const hasPrivacy = selectedConstraints.includes('Data privacy required')
    const hasEU = selectedConstraints.includes('EU data residency')
    const hasLongContext = selectedConstraints.includes('Context > 200K tokens')
    const hasSpeed = selectedConstraints.includes('Speed < 500ms')
    const hasMultimodal = selectedConstraints.includes('Image/video input')
    const hasBudget = selectedConstraints.includes('Budget < $1/M tokens')
    const isCheap = ['$50', '$200'].includes(selectedBudget)

    if (hasPrivacy || hasEU) {
      return {
        primary: 'Llama 4 Scout (self-hosted)',
        reason: 'No data leaves your infrastructure. Full control over deployment.',
        alt: hasEU ? 'Mistral Large 3 (EU hosting)' : 'DeepSeek V3.2 (MIT license)',
        altReason: hasEU ? 'European provider with GDPR native compliance.' : 'MIT license, self-hostable at very low cost.',
        routing: 'Self-hosted routing with vLLM or TGI for multiple model sizes.',
        reeval: 'When new open-source models release (quarterly) or infrastructure costs change.',
      }
    }
    if (hasLongContext) {
      return {
        primary: 'Llama 4 Scout',
        reason: '10M token context window handles any document length.',
        alt: 'Gemini 3 Pro',
        altReason: '1M context with stronger reasoning quality.',
        routing: 'Route short queries to Gemini Flash, long documents to Scout or Gemini Pro.',
        reeval: 'When context windows expand further or pricing drops.',
      }
    }
    if (hasSpeed) {
      return {
        primary: 'Gemini 2.5 Flash',
        reason: '191 tokens/sec. $0.15/M input. Built for real-time.',
        alt: 'Claude Haiku 4.5',
        altReason: 'Fast with Claude safety properties for customer-facing apps.',
        routing: 'Flash for simple queries, Sonnet for complex ones needing more quality.',
        reeval: 'When new speed-optimized models launch or pricing drops.',
      }
    }
    if (hasBudget || isCheap) {
      return {
        primary: 'DeepSeek V3.2',
        reason: '$0.27/M input. Near-frontier quality on coding and math.',
        alt: 'Gemini 2.5 Flash',
        altReason: '$0.15/M input with slightly lower quality but faster speed.',
        routing: '90% to DeepSeek/Flash, 10% to Claude Sonnet for hard queries.',
        reeval: 'As volume grows, evaluate self-hosting Llama to eliminate API costs.',
      }
    }
    if (hasMultimodal) {
      return {
        primary: 'Gemini 3 Pro',
        reason: 'Most complete multimodal: text + image + audio + video.',
        alt: 'GPT-5.2',
        altReason: 'Strong image reasoning. Text + image + audio support.',
        routing: 'Gemini for multimodal queries, cheaper text model for text-only.',
        reeval: 'When new multimodal capabilities launch across providers.',
      }
    }
    // Default
    return {
      primary: 'Claude Sonnet 4.5',
      reason: 'Best balance of quality, speed, safety, and cost. Strong coding and reasoning.',
      alt: 'GPT-5',
      altReason: 'Largest ecosystem. Similar quality. Different trade-offs.',
      routing: 'Sonnet/GPT-5 for medium tasks, Haiku/Flash for simple ones, Opus for complex.',
      reeval: 'Quarterly check on new models, pricing, and your eval suite results.',
    }
  }

  const rec = generated ? getRecommendation() : null

  return (
    <div className="cam-viz cam-framework-container">
      <div className="cam-framework-inputs">
        <div className="cam-framework-input-group">
          <label className="cam-framework-label">What are you building?</label>
          <div className="cam-framework-presets-row">
            {FRAMEWORK_PRESETS.map(p => (
              <button
                key={p}
                className={`cam-framework-preset${useCase === p ? ' cam-framework-preset-active' : ''}`}
                onClick={() => setUseCase(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="cam-framework-input-group">
          <label className="cam-framework-label">Hard constraints:</label>
          <div className="cam-framework-pills">
            {FRAMEWORK_CONSTRAINTS.map(c => (
              <button
                key={c}
                className={`cam-framework-pill${selectedConstraints.includes(c) ? ' cam-framework-pill-active' : ''}`}
                onClick={() => toggleConstraint(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="cam-framework-input-group">
          <label className="cam-framework-label">Monthly budget:</label>
          <div className="cam-framework-pills">
            {FRAMEWORK_BUDGETS.map(b => (
              <button
                key={b}
                className={`cam-framework-pill${selectedBudget === b ? ' cam-framework-pill-active' : ''}`}
                onClick={() => setSelectedBudget(selectedBudget === b ? null : b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <button className="cam-generate-btn" onClick={generateFramework} disabled={!useCase}>
          Generate Framework
        </button>
        {!useCase && <p className="cam-generate-hint">Select a use case above to generate your framework</p>}
      </div>

      {rec && (
        <div className="cam-framework-output cam-fade-in">
          <div className="cam-framework-card cam-framework-primary">
            <div className="cam-framework-card-header">
              <CheckIcon size={16} />
              <strong>Primary recommendation</strong>
            </div>
            <div className="cam-framework-model">{rec.primary}</div>
            <p>{rec.reason}</p>
          </div>

          <div className="cam-framework-card cam-framework-alt">
            <div className="cam-framework-card-header">Alternative</div>
            <div className="cam-framework-model">{rec.alt}</div>
            <p>{rec.altReason}</p>
          </div>

          <div className="cam-framework-card cam-framework-routing">
            <div className="cam-framework-card-header">Routing strategy</div>
            <p>{rec.routing}</p>
          </div>

          <div className="cam-framework-card cam-framework-reeval">
            <div className="cam-framework-card-header">When to re-evaluate</div>
            <p>{rec.reeval}</p>
          </div>
        </div>
      )}

      <div className="cam-concepts-section">
        <div className="cam-concepts-pills">
          {CONCEPT_PILLS.slice(0, Math.max(revealedConcepts, 1)).map((c, i) => (
            <button
              key={c.name}
              className={`cam-concept-pill${expandedConcept === i ? ' cam-concept-pill-active' : ''}`}
              onClick={() => {
                setExpandedConcept(expandedConcept === i ? null : i)
                if (revealedConcepts <= i + 1) setRevealedConcepts(i + 2)
              }}
            >
              {c.name}
            </button>
          ))}
          {revealedConcepts < CONCEPT_PILLS.length && (
            <button
              className="cam-concept-reveal-btn"
              onClick={() => setRevealedConcepts(prev => Math.min(prev + 1, CONCEPT_PILLS.length))}
            >
              Show next
            </button>
          )}
        </div>
        {expandedConcept !== null && CONCEPT_PILLS[expandedConcept] && (
          <div className="cam-concept-detail cam-fade-in">
            <strong>{CONCEPT_PILLS[expandedConcept].name}</strong>
            <p>{CONCEPT_PILLS[expandedConcept].desc}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════ */

function ChoosingAIModel({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('choosing-ai-model', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  /* Track max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  /* Scroll to top on stage change */
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  /* Navigation */
  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('choosing-ai-model')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.cam-root')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 250)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  /* Progressive learn tips */
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('dimensions') && !learnTip) {
      setLearnTip({ id: 'dimensions', text: 'Try switching between the preset comparison tabs — notice which dimensions change most between Coding Task and Long Document presets' })
    } else if (stage === 3 && !dismissedTips.has('task-matching') && !learnTip) {
      setLearnTip({ id: 'task-matching', text: 'Try selecting High Volume + Budget under $200/month — the recommendation shifts dramatically from the default' })
    } else if (stage === 5 && !dismissedTips.has('snapshot') && !learnTip) {
      setLearnTip({ id: 'snapshot', text: 'Click any model row to expand its full strength and weakness breakdown' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips(prev => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  /* Cleanup */
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  /* Viz components map */
  const vizComponents = {
    0: <TierPyramidViz active={stage === 0} />,
    1: <RadarChartViz active={stage === 1} />,
    2: <BenchmarkExplorerViz active={stage === 2} />,
    3: <TaskMatcherViz active={stage === 3} />,
    4: <TriangleViz active={stage === 4} />,
    5: <ModelTableViz active={stage === 5} />,
    6: <FrameworkBuilderViz active={stage === 6} />,
  }

  /* Explanations */
  const explanations = {
    0: {
      title: 'Stage 1: Stop Asking Which AI Is Best',
      content: "Everyone asks the same question: \"Which AI model is best?\"\n\nIt is the wrong question. \"Best\" has no meaning without context. Best for what? Best at what cost? Best at what speed? Best with what data?\n\nThe model that writes the best legal briefs is not the best model for classifying 10 million customer emails per day. The model that reasons best about complex philosophy is not the best model for a startup with $200/month to spend.\n\nThe question that actually works: \"Which model is the right fit for this specific task, at this budget, with these constraints?\" That question has a clear answer. The other one does not.\n\nThere are now three tiers of AI models:\n\nFrontier models (the flagships): GPT-5.2, Claude Opus 4.5, Gemini 3 Pro. Maximum capability. Maximum cost. For tasks where quality is everything and cost is secondary.\n\nMid-tier models (the workhorses): GPT-5, Claude Sonnet 4.5, Grok 4.1, Gemini 2.5 Pro, Mistral Large 3. Strong capability. Reasonable cost. For most production applications.\n\nEfficient models (the budget tier): DeepSeek V3.2, Gemini 2.5 Flash, Claude Haiku 4.5, Llama 4 Scout. Good capability. Low cost. High speed. For high-volume, cost-sensitive work.\n\nThe tiers are not about quality rankings. They are about trade-offs. A tier-3 model for the right task beats a tier-1 model for the wrong task every time.",
      tip: 'The fastest-growing skill in AI engineering in 2026 is model routing: automatically sending each query to the cheapest model that can handle it well. This tutorial teaches you to think the same way.',
    },
    1: {
      title: 'Stage 2: What Actually Separates Models',
      content: "Before comparing models, you need a vocabulary for what you are comparing. Seven dimensions determine whether a model fits your use case.\n\nDimension 1 — Capability: Raw quality of reasoning, writing, and understanding. Measured by benchmarks. Matters when: complex tasks, high-stakes outputs.\n\nDimension 2 — Context Window: How much text the model can see at once. Llama 4 Scout: 10M tokens. Claude Sonnet 4.5: 200K tokens. GPT-5: 400K tokens. Matters when: long documents, large codebases.\n\nDimension 3 — Speed (Latency): Time to first token. Tokens per second. Gemini 2.5 Flash: ~191 tokens/sec. Claude Opus 4.5: ~78 tokens/sec. Matters when: real-time UX, user-facing apps.\n\nDimension 4 — Cost: Price per million input and output tokens. Range: $0.03 (Gemma 3n) to $168 (GPT-5.2 Pro output). Matters when: high volume, tight margins.\n\nDimension 5 — Multimodal: Can the model see images, audio, video? Gemini 3 Pro: text + image + audio + video. DeepSeek V3.2: text only.\n\nDimension 6 — Privacy and Hosting: Where does the data go? Closed API: data processed by provider. Open-source self-hosted: data never leaves your infrastructure.\n\nDimension 7 — Specialization: Has the model been trained for specific tasks? Coding: Claude Sonnet 4.5 (SWE-bench 80.9%). Math/science: DeepSeek V3.2 (IMO 2025 gold). Real-time: Grok 4.1 (X integration).",
      tip: 'Most people compare models on Dimension 1 (capability) and ignore the other six. Then they are surprised when the \"best\" model fails in production because it was too slow, too expensive, or could not handle their document length.',
    },
    2: {
      title: 'Stage 3: Why Benchmark Rankings Mislead You',
      content: "Every model claims to be the best. They use benchmarks as evidence. Most of the time, both are true — and both are useless to you.\n\nProblem 1 — Benchmarks measure the past: Benchmarks like MMLU test knowledge from training data. A model trained more recently on more data scores higher. That does not mean it is smarter. It may have seen the test answers. This is called benchmark contamination.\n\nProblem 2 — Benchmarks do not measure your task: GPQA Diamond measures graduate-level science. Your chatbot answers customer service questions. A model with 91.9% GPQA may score worse on your actual use case than a model with 78% GPQA.\n\nProblem 3 — Providers cherry-pick: Every provider chooses the benchmarks where their model wins. OpenAI emphasizes coding. Google emphasizes science and multimodal. Anthropic emphasizes safety and agent tasks.\n\nProblem 4 — Leaderboards disagree: On the same date, different leaderboards show different #1 models. LMArena: Gemini 3 Pro. SWE-bench: Claude Opus 4.5. ARC-AGI-2: Gemini 3 Pro. They are all correct. None is \"the\" ranking.\n\nThe only benchmark that matters: your own eval suite on your own task. Build 20\u201350 representative examples from your actual use case. Run all candidate models. Measure what you actually care about. Deploy the winner. Not the benchmark winner.",
      warning: 'Benchmark marketing is the most widespread misleading practice in AI. When a provider says \"best in class\" on a benchmark, ask: best at what? Compared to which models? On what date? And does that benchmark reflect my use case?',
    },
    3: {
      title: 'Stage 4: The Decision Framework',
      content: "Now you have the vocabulary. Here is the framework for applying it to real decisions.\n\nThe four questions:\n\nQuestion 1: What is the task type? Different task families favor different models.\n\nQuestion 2: How much does quality matter vs cost? High stakes + low volume = spend on quality. Low stakes + high volume = optimize cost.\n\nQuestion 3: What are the hard constraints? Data privacy? Speed requirement? Context length? Multimodal input?\n\nQuestion 4: What is the failure mode? If the model is wrong, what happens? Critical failure (medical, legal, financial): use the best model. Eval heavily. Annoying failure (content draft, summaries): use a cheaper model. Iterate.\n\nComplex reasoning: GPT-5.2 or Gemini 3 Pro (Deep Think mode). Coding: Claude Sonnet 4.5 or Opus 4.5 (SWE-bench leader). Long documents: Llama 4 Scout (10M context) or Gemini 3 Pro. Real-time info: Grok 4.1 (live X/web integration). High volume: DeepSeek V3.2 ($0.27/M) or Gemini Flash ($0.15/M). Multimodal: Gemini 3 Pro (text + image + audio + video). Private deployment: Llama 4 Scout or Mistral Large 3 (open-source). Enterprise safety: Claude family (Constitutional AI, lowest hallucination rates).",
      tip: 'The most cost-efficient production pattern in 2026: route 80\u201390% of requests to a cheap fast model (DeepSeek, Gemini Flash, Haiku). Route the hard 10\u201320% to a frontier model. This can reduce costs by 70\u201380% with minimal quality loss.',
    },
    4: {
      title: 'Stage 5: You Can Only Pick Two',
      content: "There is a fundamental trade-off in AI model selection that mirrors the classic project management triangle: fast + cheap + good — pick two.\n\nFast + Cheap = not the most capable. Gemini 2.5 Flash: 191 tokens/sec, $0.15/M. Incredible speed and cost. Trades off on the hardest reasoning tasks.\n\nFast + Good = not cheap. GPT-5.2 Instant mode: fast adaptive reasoning. $21/M input. Premium pricing for the speed.\n\nGood + Cheap = not fast. DeepSeek V3.2: frontier-class math and coding. $0.27/M input. But slower inference and occasional latency spikes.\n\nThe Workhorse: Mid-tier capability. Mid-tier cost. Mid speed. Claude Sonnet 4.5, GPT-5, Gemini 2.5 Pro. The safe default when no extreme is needed.\n\nThe Rocket: Maximum capability. High cost. Acceptable speed. GPT-5.2 Pro, Claude Opus 4.5, Gemini 3 Pro. Use rarely. Budget carefully.\n\nThe Conveyor Belt: Good enough capability. Minimum cost. Maximum speed. DeepSeek V3.2, Gemini Flash, Haiku 4.5. Use for 80% of requests if budget matters.\n\nThe hybrid strategy: do not choose one model for everything. Route by task complexity. Simple (50%): Gemini Flash or Haiku. Medium (40%): Claude Sonnet or GPT-5. Complex (10%): Claude Opus or GPT-5.2. Result: 70\u201380% cost savings vs all-flagship.",
      tip: 'The routing pattern is not just about cost. It is also about latency. Your P99 latency improves dramatically when 80% of queries go to a fast cheap model instead of waiting in queue behind complex reasoning tasks.',
    },
    5: {
      title: 'Stage 6: The Models — Early 2026 Snapshot',
      content: "With the framework in place, here is the current landscape. Each model's strongest use case is highlighted. Not \"best overall\" — best for what it was built for.\n\nOpenAI: GPT-5.2 (400K context, $1.25\u201321/M) — Professional knowledge work, adaptive reasoning. GPT-5/4.1 — The pragmatic developer default.\n\nAnthropic: Claude Opus 4.5 (200K context, $15/M) — SWE-bench leader 80.9%, 30+ hour autonomous agent runs, Constitutional AI safety. Claude Sonnet 4.5 ($3/M) — Best daily-driver for coding. Claude Haiku 4.5 ($1/M) — Fast + cheap with Claude safety.\n\nGoogle: Gemini 3 Pro (1M context, ~$2.50/M) — GPQA 91.9%, best value flagship, native multimodal. Gemini 2.5 Flash ($0.15/M, 191 t/s) — Speed champion.\n\nxAI: Grok 4.1 (2M context, ~$3/M) — Real-time X/web integration, LMArena #1 in EQ.\n\nDeepSeek: V3.2 (128K context, $0.27/M) — 10\u201330x cheaper than Western frontiers, MIT license, IMO 2025 gold.\n\nMeta: Llama 4 Scout (10M context, free self-hosted) — Largest context window, Apache 2.0 open-source.\n\nMistral: Large 3 (128K context, ~$2/M) — EU data sovereignty, Apache 2.0, strong multilingual.",
    },
    6: {
      title: 'Stage 7: Your Personal Model Selection Framework',
      content: "You now have everything you need. Here is the decision process you can apply to any new model choice, including models that do not exist yet.\n\nStep 1 — Define the task family: What type of task is this? Reasoning, coding, long document, real-time, high-volume, multimodal, private, or safety-critical.\n\nStep 2 — Identify hard constraints: What is non-negotiable? Data privacy? Context > 200K? Speed < 500ms? Multimodal input? EU residency?\n\nStep 3 — Set your budget: < $0.50/M: DeepSeek, Gemini Flash, Haiku. $0.50\u2013$5/M: Claude Sonnet, GPT-5, Gemini Pro. $5+/M: Claude Opus, GPT-5.2 Pro — justify the cost.\n\nStep 4 — Eval before committing: Build 20 test cases from your real data. Run top 2\u20133 candidates. Measure what matters to you.\n\nStep 5 — Route by complexity: Send easy queries to cheap fast models. Send hard ones to powerful expensive models. 70\u201380% cost saving.\n\nCheck quarterly: Has a new model entered your tier? Have prices dropped? Has a benchmark revealed a weakness? Has your use case evolved? Your selection is never permanent. The right model today may not be right in 6 months.",
      tip: 'The best AI teams do not choose a model once. They maintain a living model comparison doc, re-run evals quarterly, and have a migration plan ready. The cost of switching models is low. The cost of staying on the wrong model at scale is high.',
    },
  }

  const nextLabels = [
    'Next: The 7 Dimensions \u2192',
    'Next: Reading Benchmarks \u2192',
    'Next: Task Matching \u2192',
    'Next: The Triangle \u2192',
    'Next: Model Snapshot \u2192',
    'Next: Your Framework \u2192',
    'See Your Results \u2192',
  ]

  /* ───── Entry Screen ───── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="choosing-ai-model" size={48} style={{ color: '#34C759' }} />}
        title="Choosing the Right AI Model"
        subtitle="Stop Guessing. Start Matching."
        description={<>GPT-5. Claude Opus. Gemini 3. DeepSeek. Llama 4. Mistral. Grok. The options are overwhelming and the benchmarks contradict each other. This tutorial gives you the framework to choose the right model for any task &mdash; and explains exactly why each model exists.<br /><br /><span style={{ fontSize: 13, opacity: 0.7 }}>Note: Model names, pricing, and benchmarks reflect early 2026. The decision framework itself is timeless.</span></>}
        buttonText="Start Choosing"
        onStart={() => { setStage(0); markModuleStarted('choosing-ai-model') }}
      />
    )
  }

  /* ───── Quiz ───── */
  if (showQuiz) {
    return (
      <div className="how-llms cam-root quiz-fade-in">
        <Quiz
          questions={choosingAIModelQuiz}
          tabName="Choosing the Right AI Model"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="choosing-ai-model"
        />
      </div>
    )
  }

  /* ───── Main render ───── */
  return (
    <div className={`how-llms cam-root${fading ? ' how-fading' : ''}`}>
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>&larr; Start over</button>
      )}

      {/* Welcome banner */}
      {showWelcome && stage === 0 && !showFinal && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Choosing the Right AI Model</strong> &mdash; This tutorial teaches a decision framework that works for any model, including ones that do not exist yet. Stage 6 gives a current snapshot of the major models as of early 2026 &mdash; labeled clearly so you know it will evolve. The framework in every other stage is timeless.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>7 stages</strong> from the wrong question to your personal framework</li>
              <li>Use <strong>interactive tools</strong> to compare models across 7 dimensions</li>
              <li>Build your own <strong>selection framework</strong> for any task</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper */}
      {stage >= 0 && !showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper cam-stepper">
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
                        <Tooltip text={STAGE_TOOLTIPS[s.key]} />
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

      {/* Stage content */}
      <div className="how-content">
        {stage >= 0 && stage < STAGES.length && (
          <div className="how-stage how-fade-in" key={stage}>
            {/* Info card */}
            <div className="how-info-card how-info-card-edu">
              <div className="how-info-card-header">
                <strong>{explanations[stage].title}</strong>
              </div>
              {explanations[stage].content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {explanations[stage].tip && (
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  {explanations[stage].tip}
                </div>
              )}
              {explanations[stage].warning && (
                <div className="cam-warning-box">
                  <WarningIcon size={16} color="#FF9500" />
                  {explanations[stage].warning}
                </div>
              )}
              <ToolChips tools={CAM_TOOLS[stage]} />
            </div>

            {/* Visualization */}
            {vizComponents[stage]}

            {/* Learn tip */}
            {learnTip && (
              <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
                <span className="learn-tip-text">{learnTip.text}</span>
                <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="how-nav-row">
              <div className="how-nav-buttons">
                {stage > 0 && (
                  <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
                )}
                <button className="how-gotit-btn" onClick={nextStage}>
                  {nextLabels[stage]}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now have a framework for choosing the right AI model for any task.</div>

          <div className="cam-final-recap">
            <div className="cam-final-recap-title">Your model selection journey:</div>
            <div className="cam-final-recap-items">
              {STAGES.map((s, i) => (
                <div key={i} className="cam-final-recap-item">
                  <CheckIcon size={14} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="choosing-ai-model" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default ChoosingAIModel
