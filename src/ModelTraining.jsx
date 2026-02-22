import { useState, useEffect, useRef, useMemo } from 'react'
import { encode, decode } from 'gpt-tokenizer'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { FileCabinetIcon, CrossIcon, CpuIcon, ChatIcon, UserIcon, GraduationIcon, RefreshIcon, GlobeIcon, BookIcon, CodeIcon, FileIcon, MemoIcon } from './ContentIcons.jsx'
import ToolChips from './ToolChips.jsx'
import Quiz from './Quiz.jsx'
import { modelTrainingQuiz } from './quizData.js'

const STAGES = [
  { key: 'collection', label: 'Data Collection' },
  { key: 'cleaning', label: 'Data Cleaning' },
  { key: 'tokenization', label: 'Tokenization' },
  { key: 'pretraining', label: 'Pre-Training' },
  { key: 'sft', label: 'Fine-Tuning' },
  { key: 'rlhf', label: 'RLHF' },
]

const STAGE_TOOLTIPS = {
  collection: 'Before any training can begin, massive amounts of text are gathered from the internet, books, code and more. Modern LLMs train on 10\u201315 TRILLION tokens.',
  cleaning: 'Raw internet data is messy \u2014 full of spam, duplicates and toxic content. Only 40\u201360% of collected data survives the cleaning process. Quality over quantity.',
  tokenization: 'All cleaned text gets converted into tokens \u2014 numbers the model can process mathematically. The entire dataset becomes one giant sequence of token IDs.',
  pretraining: 'The model learns by predicting the next token billions of times across the whole dataset. This takes months on thousands of GPUs and costs millions of dollars.',
  sft: 'The pre-trained model is powerful but doesn\'t know how to have conversations. Fine-tuning on human examples teaches it to be helpful and follow instructions.',
  rlhf: 'Human raters compare AI responses and pick the better one. The model learns to generate responses humans prefer \u2014 making it more helpful and less harmful.',
}

const TOKEN_PASTELS = [
  { bgVar: '--token-pastels-1-bg', borderVar: '--token-pastels-1-border' },
  { bgVar: '--token-pastels-2-bg', borderVar: '--token-pastels-2-border' },
  { bgVar: '--token-pastels-3-bg', borderVar: '--token-pastels-3-border' },
  { bgVar: '--token-pastels-4-bg', borderVar: '--token-pastels-4-border' },
  { bgVar: '--token-pastels-5-bg', borderVar: '--token-pastels-5-border' },
]

const DATA_SOURCES = [
  { label: 'Web Pages', sub: 'Common Crawl', color: '#0071e3', icon: <GlobeIcon size={18} color="#0071e3" /> },
  { label: 'Books', sub: 'Project Gutenberg', color: '#5856d6', icon: <BookIcon size={18} color="#5856d6" /> },
  { label: 'Code', sub: 'GitHub', color: '#34c759', icon: <CodeIcon size={18} color="#34c759" /> },
  { label: 'Wikipedia', sub: 'Encyclopedia', color: '#ff9500', icon: <FileIcon size={18} color="#ff9500" /> },
  { label: 'Forums', sub: 'Reddit', color: '#ff3b30', icon: <ChatIcon size={18} color="#ff3b30" /> },
  { label: 'Papers', sub: 'ArXiv', color: '#af52de', icon: <MemoIcon size={18} color="#af52de" /> },
]

const FILTER_STAGES = [
  { label: 'Duplicates removed', pct: 20 },
  { label: 'Toxic content filtered', pct: 10 },
  { label: 'Low quality text rejected', pct: 15 },
  { label: 'Personal data scrubbed', pct: 10 },
]

const TOOLS_BY_STAGE = {
  collection: [
    { name: 'Common Crawl', color: '#0071e3', desc: 'Largest public web crawl, 250TB+' },
    { name: 'GitHub', color: '#1c1c1e', desc: 'Code training data' },
    { name: 'Wikipedia', color: '#636366', desc: 'High quality factual text' },
    { name: 'ArXiv', color: '#ff3b30', desc: 'Scientific papers' },
  ],
  cleaning: [
    { name: 'RefinedWeb', color: '#0071e3', desc: 'Massive cleaned web dataset' },
    { name: 'Dolma', color: '#34c759', desc: 'Open source cleaned dataset by AI2' },
    { name: 'FineWeb', color: '#ff9500', desc: "HuggingFace's cleaned CommonCrawl" },
    { name: 'fastText', color: '#5856d6', desc: 'Language detection and filtering' },
    { name: 'MinHash', color: '#636366', desc: 'Duplicate detection algorithm' },
  ],
  tokenization: [
    { name: 'tiktoken', color: '#1c1c1e', desc: 'Fast BPE tokenizer by OpenAI' },
    { name: 'SentencePiece', color: '#0071e3', desc: 'Used in LLaMA, Gemini (by Google)' },
    { name: 'HuggingFace Tokenizers', color: '#ff9500', desc: 'Open source tokenizer library' },
  ],
  pretraining: [
    { name: 'PyTorch', color: '#ee4c2c', desc: 'Most popular ML training framework' },
    { name: 'JAX', color: '#0071e3', desc: 'Used for Gemini training (by Google)' },
    { name: 'NVIDIA H100', color: '#76b900', desc: 'Most powerful training GPU, $30k each' },
    { name: 'DeepSpeed', color: '#0078d4', desc: 'Distributed training (by Microsoft)' },
    { name: 'Megatron-LM', color: '#76b900', desc: 'Large model parallelism (by NVIDIA)' },
    { name: 'Weights & Biases', color: '#ffbe00', desc: 'Training monitoring' },
  ],
  sft: [
    { name: 'HuggingFace Transformers', color: '#ff9500', desc: 'Most popular fine-tuning library' },
    { name: 'LoRA', color: '#5856d6', desc: 'Efficient fine-tuning, low-rank adaptation' },
    { name: 'Axolotl', color: '#34c759', desc: 'Popular open source fine-tuning tool' },
    { name: 'OpenAI Fine-tuning API', color: '#1c1c1e', desc: 'Fine-tune GPT-3.5 via API' },
    { name: 'LLaMA Factory', color: '#0071e3', desc: 'Fine-tune open source models easily' },
  ],
  rlhf: [
    { name: 'PPO Algorithm', color: '#0071e3', desc: 'Proximal Policy Optimization, core RL algo' },
    { name: 'TRL', color: '#ff9500', desc: 'Transformer Reinforcement Learning (HuggingFace)' },
    { name: 'Reward Model', color: '#5856d6', desc: 'Separate model that scores responses' },
    { name: 'Scale AI', color: '#1c1c1e', desc: 'Human labeling at scale' },
    { name: 'Constitutional AI', color: '#af52de', desc: 'AI feedback instead of human (Anthropic)' },
  ],
}

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. AI is transforming how we work and live."

function useAnimatedCounter(target, duration, active) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) { setValue(0); return }
    let start = null
    let animId
    function step(ts) {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) animId = requestAnimationFrame(step)
    }
    animId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animId)
  }, [target, duration, active])
  return value
}

// Stage 1: Data Collection animation
function DataCollectionViz({ active }) {
  const [activeSources, setActiveSources] = useState([])
  const [particles, setParticles] = useState([])
  const tokenCount = useAnimatedCounter(15, 3000, active)
  const particleIdRef = useRef(0)

  useEffect(() => {
    if (!active) { setActiveSources([]); setParticles([]); return }
    let idx = 0
    const interval = setInterval(() => {
      if (idx < DATA_SOURCES.length) {
        setActiveSources((prev) => [...prev, idx])
        idx++
      } else {
        clearInterval(interval)
      }
    }, 400)
    return () => clearInterval(interval)
  }, [active])

  useEffect(() => {
    if (!active || activeSources.length === 0) return
    const interval = setInterval(() => {
      const srcIdx = activeSources[Math.floor(Math.random() * activeSources.length)]
      const src = DATA_SOURCES[srcIdx]
      particleIdRef.current++
      setParticles((prev) => [
        ...prev.slice(-20),
        { id: particleIdRef.current, srcIdx, color: src.color, born: Date.now() },
      ])
    }, 200)
    return () => clearInterval(interval)
  }, [active, activeSources])

  // Clean up old particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.born < 1500))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-collection-viz">
      <div className="mt-collection-sources">
        {DATA_SOURCES.map((src, i) => (
          <div
            key={i}
            className={`mt-source-card ${activeSources.includes(i) ? 'mt-source-active' : ''}`}
            style={{ '--source-color': src.color }}
          >
            <span className="mt-source-emoji">{src.icon}</span>
            <div className="mt-source-info">
              <div className="mt-source-label">{src.label}</div>
              <div className="mt-source-sub">{src.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-collection-flow">
        <svg className="mt-flow-svg" viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
          {particles.map((p) => {
            const age = (Date.now() - p.born) / 1500
            const row = p.srcIdx
            const startY = 5 + row * 10
            const endY = 30
            const x = 10 + age * 80
            const y = startY + (endY - startY) * age
            const opacity = age < 0.8 ? 1 : 1 - (age - 0.8) / 0.2
            return (
              <circle
                key={p.id}
                cx={x}
                cy={y}
                r={1.5}
                fill={p.color}
                opacity={opacity * 0.8}
              />
            )
          })}
        </svg>
      </div>

      <div className="mt-collection-target">
        <div className="mt-target-box">
          <div className="mt-target-icon"><FileCabinetIcon size={24} /></div>
          <div className="mt-target-label">Training Dataset</div>
        </div>
        <div className="mt-counter">
          <span className="mt-counter-value">{tokenCount}</span>
          <span className="mt-counter-unit"> Trillion tokens collected</span>
        </div>
      </div>
    </div>
  )
}

// Stage 2: Data Cleaning pipeline
function DataCleaningViz({ active }) {
  const [activeFilters, setActiveFilters] = useState([])
  const [pctRemaining, setPctRemaining] = useState(100)

  useEffect(() => {
    if (!active) { setActiveFilters([]); setPctRemaining(100); return }
    let idx = 0
    let remaining = 100
    const interval = setInterval(() => {
      if (idx < FILTER_STAGES.length) {
        remaining -= FILTER_STAGES[idx].pct
        setActiveFilters((prev) => [...prev, idx])
        setPctRemaining(remaining)
        idx++
      } else {
        clearInterval(interval)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="mt-cleaning-viz">
      <div className="mt-cleaning-pipeline">
        <div className="mt-pipeline-input">
          <div className="mt-pipeline-label">Raw Data</div>
          <div className="mt-pipeline-pct">100%</div>
        </div>

        <div className="mt-pipeline-filters">
          {FILTER_STAGES.map((filter, i) => (
            <div
              key={i}
              className={`mt-filter-stage ${activeFilters.includes(i) ? 'mt-filter-active' : ''}`}
            >
              <span className="mt-filter-icon"><CrossIcon size={14} /></span>
              <span className="mt-filter-label">{filter.label}</span>
              <span className="mt-filter-pct">-{filter.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-pipeline-output">
          <div className="mt-pipeline-label">Clean Data</div>
          <div className="mt-pipeline-pct mt-pipeline-pct-good">{pctRemaining}%</div>
        </div>
      </div>

      <div className="mt-cleaning-bar">
        <div className="mt-cleaning-bar-track">
          <div
            className="mt-cleaning-bar-fill-dirty"
            style={{ width: '100%' }}
          />
          <div
            className="mt-cleaning-bar-fill-clean"
            style={{ width: `${pctRemaining}%`, transition: 'width 0.8s ease' }}
          />
        </div>
        <div className="mt-cleaning-bar-labels">
          <span>100% in</span>
          <span className="mt-cleaning-result">{pctRemaining}% high quality out</span>
        </div>
      </div>
    </div>
  )
}

// Stage 3: Tokenization demo
function TokenizationViz({ active }) {
  const allTokens = useMemo(() => {
    try {
      const ids = encode(SAMPLE_TEXT)
      return ids.map((id) => ({ id, text: decode([id]) }))
    } catch {
      return []
    }
  }, [])

  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!active) { setVisibleCount(0); return }
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count <= allTokens.length) {
        setVisibleCount(count)
      } else {
        clearInterval(interval)
      }
    }, 80)
    return () => clearInterval(interval)
  }, [active, allTokens.length])

  return (
    <div className="mt-tokenization-viz">
      <div className="mt-tok-source">
        <div className="mt-tok-source-label">Input Text</div>
        <div className="mt-tok-source-text">{SAMPLE_TEXT}</div>
      </div>
      <div className="mt-tok-arrow">↓</div>
      <div className="how-token-display">
        {allTokens.slice(0, visibleCount).map((tok, i) => {
          const color = TOKEN_PASTELS[i % TOKEN_PASTELS.length]
          const display = tok.text.replace(/ /g, '\u00B7').replace(/\n/g, '\\n')
          return (
            <span
              key={i}
              className="how-token-chip how-pop-in"
              style={{
                background: `var(${color.bgVar})`,
                borderColor: `var(${color.borderVar})`,
                animationDelay: `${i * 0.02}s`,
              }}
            >
              {display || '\u00B7'}
            </span>
          )
        })}
      </div>
      {visibleCount > 0 && (
        <div className="mt-tok-stats">
          <span className="mt-tok-stat">Text → <strong>{allTokens.length} tokens</strong></span>
          <span className="mt-tok-stat-sep">·</span>
          <span className="mt-tok-stat">Vocabulary: <strong>50,257 possible tokens</strong> in GPT's vocabulary</span>
        </div>
      )}
    </div>
  )
}

// Stage 4: Pre-training (loss curve + GPU cluster)
function PreTrainingViz({ active }) {
  const [curveProgress, setCurveProgress] = useState(0)
  const [gpuActive, setGpuActive] = useState([])
  const canvasRef = useRef(null)

  const trainingTime = useAnimatedCounter(3, 3000, active)
  const gpuCount = useAnimatedCounter(1024, 3000, active)
  const cost = useAnimatedCounter(10, 3000, active)
  const params = useAnimatedCounter(70, 3000, active)

  useEffect(() => {
    if (!active) { setCurveProgress(0); setGpuActive([]); return }
    let progress = 0
    const interval = setInterval(() => {
      progress += 0.015
      if (progress > 1) progress = 1
      setCurveProgress(progress)
      if (progress >= 1) clearInterval(interval)
    }, 30)

    // Activate GPUs progressively
    let gpuIdx = 0
    const gpuInterval = setInterval(() => {
      if (gpuIdx < 16) {
        setGpuActive((prev) => [...prev, gpuIdx])
        gpuIdx++
      } else {
        clearInterval(gpuInterval)
      }
    }, 150)

    return () => { clearInterval(interval); clearInterval(gpuInterval) }
  }, [active])

  // Draw loss curve on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'

    ctx.clearRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(168,162,158,0.1)' : 'rgba(0,0,0,0.06)'
    ctx.lineWidth = 1
    for (let i = 1; i < 5; i++) {
      const y = (h / 5) * i
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 10, y); ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = isDark ? '#78716c' : '#6E6E73'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(40, 10); ctx.lineTo(40, h - 25); ctx.lineTo(w - 10, h - 25); ctx.stroke()

    // Labels
    ctx.fillStyle = isDark ? '#a8a29e' : '#6E6E73'
    ctx.font = '11px -apple-system, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText('3.5', 35, 18)
    ctx.fillText('1.0', 35, h - 28)
    ctx.textAlign = 'center'
    ctx.fillText('Training Steps →', w / 2, h - 5)
    ctx.textAlign = 'left'
    ctx.fillText('Loss ↑', 5, 15)

    // Loss curve
    if (curveProgress > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#0071e3'
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      const totalPoints = Math.floor(curveProgress * 200)
      for (let i = 0; i <= totalPoints; i++) {
        const t = i / 200
        const loss = 3.5 * Math.exp(-3 * t) + 1.2 * (1 - Math.exp(-3 * t))
        const x = 40 + t * (w - 50)
        const yRange = h - 45
        const y = 15 + ((3.5 - loss) / 2.5) * yRange
        // Invert: higher loss = higher on chart
        const yFlipped = h - 30 - (loss - 1.0) / 2.5 * yRange
        if (i === 0) ctx.moveTo(x, yFlipped)
        else ctx.lineTo(x, yFlipped)
      }
      ctx.stroke()

      // Current point
      const currentT = curveProgress
      const currentLoss = 3.5 * Math.exp(-3 * currentT) + 1.2 * (1 - Math.exp(-3 * currentT))
      const yRange = h - 45
      const currentX = 40 + currentT * (w - 50)
      const currentY = h - 30 - (currentLoss - 1.0) / 2.5 * yRange
      ctx.beginPath()
      ctx.arc(currentX, currentY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#0071e3'
      ctx.fill()

      // Loss label
      ctx.fillStyle = isDark ? '#e7e5e4' : '#1c1c1e'
      ctx.font = 'bold 12px -apple-system, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Loss: ${currentLoss.toFixed(2)}`, currentX + 10, currentY - 5)
    }
  }, [curveProgress])

  return (
    <div className="mt-pretrain-viz">
      <div className="mt-pretrain-top">
        <div className="mt-loss-curve">
          <canvas ref={canvasRef} width={400} height={200} className="mt-loss-canvas" />
        </div>
        <div className="mt-gpu-cluster">
          <div className="mt-gpu-cluster-label">GPU Cluster</div>
          <div className="mt-gpu-grid">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`mt-gpu-box ${gpuActive.includes(i) ? 'mt-gpu-active' : ''}`}
              >
                <span className="mt-gpu-icon"><CpuIcon size={14} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-pretrain-stats">
        <div className="mt-stat-item">
          <div className="mt-stat-value">{trainingTime} months</div>
          <div className="mt-stat-label">Training time</div>
        </div>
        <div className="mt-stat-item">
          <div className="mt-stat-value">{gpuCount.toLocaleString()} × H100</div>
          <div className="mt-stat-label">GPUs used</div>
        </div>
        <div className="mt-stat-item">
          <div className="mt-stat-value">~${cost}M</div>
          <div className="mt-stat-label">Estimated cost</div>
        </div>
        <div className="mt-stat-item">
          <div className="mt-stat-value">{params}B</div>
          <div className="mt-stat-label">Parameters</div>
        </div>
      </div>
    </div>
  )
}

// Stage 5: SFT comparison
function SFTViz({ active }) {
  const [showAfter, setShowAfter] = useState(false)

  useEffect(() => {
    if (!active) { setShowAfter(false); return }
    const t = setTimeout(() => setShowAfter(true), 1200)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="mt-sft-viz">
      <div className="mt-sft-comparison">
        <div className={`mt-sft-panel mt-sft-before ${active ? 'mt-sft-visible' : ''}`}>
          <div className="mt-sft-panel-label">Before SFT</div>
          <div className="mt-sft-chat">
            <div className="mt-sft-msg mt-sft-user">What is 2+2?</div>
            <div className="mt-sft-msg mt-sft-model-bad">
              2+2 = 4. The answer to 2+2 is 4. 2 plus 2 equals 4. Additionally, two plus two is four. In mathematics, the sum of...
            </div>
          </div>
          <div className="mt-sft-note">Model just keeps completing text endlessly</div>
        </div>

        <div className={`mt-sft-arrow-col ${showAfter ? 'mt-sft-arrow-visible' : ''}`}>
          <div className="mt-sft-transform-arrow">→</div>
          <div className="mt-sft-transform-label">10,000 human examples</div>
        </div>

        <div className={`mt-sft-panel mt-sft-after ${showAfter ? 'mt-sft-visible' : ''}`}>
          <div className="mt-sft-panel-label">After SFT</div>
          <div className="mt-sft-chat">
            <div className="mt-sft-msg mt-sft-user">What is 2+2?</div>
            <div className="mt-sft-msg mt-sft-model-good">2+2 = 4</div>
          </div>
          <div className="mt-sft-note">Clean, helpful, conversational answer</div>
        </div>
      </div>
    </div>
  )
}

// Stage 6: RLHF feedback loop
function RLHFViz({ active }) {
  const [activeStep, setActiveStep] = useState(-1)
  const scoreCounter = useAnimatedCounter(87, 4000, active)

  const steps = [
    { icon: <ChatIcon size={16} />, label: 'Model generates 2 responses' },
    { icon: <UserIcon size={16} />, label: 'Human picks the better one' },
    { icon: <GraduationIcon size={16} />, label: 'Reward model learns preferences' },
    { icon: <RefreshIcon size={16} />, label: 'LLM updated to score higher' },
  ]

  useEffect(() => {
    if (!active) { setActiveStep(-1); return }
    let step = 0
    const interval = setInterval(() => {
      setActiveStep(step % steps.length)
      step++
      if (step > 12) clearInterval(interval)
    }, 1200)
    return () => clearInterval(interval)
  }, [active])

  return (
    <div className="mt-rlhf-viz">
      <div className="mt-rlhf-loop">
        {steps.map((s, i) => (
          <div key={i} className="mt-rlhf-step-wrapper">
            <div className={`mt-rlhf-step ${activeStep === i ? 'mt-rlhf-step-active' : ''}`}>
              <span className="mt-rlhf-step-icon">{s.icon}</span>
              <span className="mt-rlhf-step-label">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mt-rlhf-arrow ${activeStep > i || (activeStep === 0 && i === steps.length - 1) ? 'mt-rlhf-arrow-active' : ''}`}>→</div>
            )}
          </div>
        ))}
        <div className={`mt-rlhf-loop-back ${activeStep === 0 ? 'mt-rlhf-arrow-active' : ''}`}>
          <RefreshIcon size={12} /> Repeat thousands of times
        </div>
      </div>
      <div className="mt-rlhf-score">
        <span className="mt-rlhf-score-label">Response quality score:</span>
        <span className="mt-rlhf-score-start">6.2</span>
        <span className="mt-rlhf-score-arrow">→</span>
        <span className="mt-rlhf-score-end">{(scoreCounter / 10).toFixed(1)}</span>
      </div>
    </div>
  )
}

// Final Summary timeline
function FinalTimeline() {
  const stages = [
    { label: 'Data Collection', duration: 'weeks', width: 12 },
    { label: 'Data Cleaning', duration: 'weeks', width: 12 },
    { label: 'Tokenization', duration: 'days', width: 6 },
    { label: 'Pre-Training', duration: 'months', width: 40 },
    { label: 'Fine-Tuning', duration: 'weeks', width: 15 },
    { label: 'RLHF', duration: 'weeks', width: 15 },
  ]

  return (
    <div className="mt-timeline">
      <div className="mt-timeline-title">Real-World Timeline</div>
      <div className="mt-timeline-bars">
        {stages.map((s, i) => (
          <div key={i} className="mt-timeline-row">
            <div className="mt-timeline-label">{s.label}</div>
            <div className="mt-timeline-bar-track">
              <div
                className="mt-timeline-bar-fill"
                style={{
                  width: `${s.width}%`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            </div>
            <div className="mt-timeline-duration">{s.duration}</div>
          </div>
        ))}
      </div>
      <div className="mt-timeline-total">
        Total: <strong>6–12 months</strong> and <strong>$10–100M+</strong> to build a frontier model
      </div>
    </div>
  )
}

function ModelTraining({ onSwitchTab, onGoHome }) {
  const [stage, setStage] = useState(-1) // -1 = welcome
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
    if (stage < 5) {
      setStage(stage + 1)
    } else {
      setShowFinal(true)
      setStage(6)
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
    0: <DataCollectionViz active={stage === 0} />,
    1: <DataCleaningViz active={stage === 1} />,
    2: <TokenizationViz active={stage === 2} />,
    3: <PreTrainingViz active={stage === 3} />,
    4: <SFTViz active={stage === 4} />,
    5: <RLHFViz active={stage === 5} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: Data Collection',
      content: "Before training can begin, we need massive amounts of text for the model to learn from. Modern LLMs train on 10–15 TRILLION tokens — roughly equivalent to reading every book ever written, 10,000 times.\n\nThe internet is the primary source, but quality matters more than quantity. Researchers carefully select and balance different types of content.",
    },
    1: {
      title: 'Stage 2: Data Cleaning',
      content: "Raw internet data is messy — full of spam, duplicates, toxic content, and low quality text. Researchers spend enormous effort cleaning data because garbage in = garbage out.\n\nTypically only 40–60% of collected data survives cleaning. The quality of this stage is often the biggest factor in how good the final model is.",
    },
    2: {
      title: 'Stage 3: Tokenization',
      content: "All the cleaned text gets converted to tokens — numbers the model can process mathematically. The entire training dataset becomes a massive sequence of token IDs.\n\nTip:You've already seen this in action in the Tokenizer tab!",
    },
    3: {
      title: 'Stage 4: Pre-Training',
      content: "This is the main training phase — the model learns by trying to predict the next token in the training data, billions of times. Every wrong prediction updates the model's weights slightly.\n\nAfter months of training on thousands of GPUs, the model has learned grammar, facts, reasoning patterns, and much more — just from predicting the next word.\n\nTip:At this stage the model can complete text but doesn't yet know how to follow instructions or have a conversation.",
    },
    4: {
      title: 'Stage 5: Supervised Fine-Tuning (SFT)',
      content: "The pre-trained model is powerful but wild — it just completes text, it doesn't know how to be helpful. Fine-tuning teaches it to have conversations and follow instructions.\n\nHuman trainers write thousands of example conversations showing the ideal AI behavior. The model is then trained on these examples to match that style.\n\nTip:This is why ChatGPT answers questions instead of just completing your sentence.",
    },
    5: {
      title: 'Stage 6: RLHF — The Secret Sauce',
      content: "This is what separates ChatGPT from a raw language model. Human raters compare pairs of responses and pick the better one. A 'reward model' learns to predict human preferences.\n\nThen the main model is optimized using reinforcement learning to generate responses the reward model rates highly — essentially learning to be more helpful and less harmful by chasing human approval.\n\nTip:The thumbs up/down buttons in ChatGPT? That's RLHF data collection happening in real time.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="model-training" size={48} style={{ color: '#FF9500' }} />}
        title="How AI Models Are Built"
        description="Follow the complete journey from raw internet data to a working AI assistant, in 6 interactive stages. No PhD required."
        buttonText="Start the Journey"
        onStart={() => setStage(0)}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms mt-root quiz-fade-in">
        <Quiz
          questions={modelTrainingQuiz}
          tabName="Model Training"
          onBack={() => setShowQuiz(false)}
          onGoHome={onGoHome ? () => { reset(); onGoHome() } : undefined}
          onNextModule={onSwitchTab ? () => onSwitchTab('prompt-engineering') : undefined}
          nextModuleName="Prompt Engineering"
        />
      </div>
    )
  }

  return (
    <div className="how-llms mt-root">
      {/* Welcome Banner — shows after entry screen, dismissable */}
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Ever wondered how ChatGPT was actually built?</strong> This is the full story — from raw internet data to a working AI assistant. No PhD required.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper + stage content — only when journey has started (stage >= 0) */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper mt-stepper">
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
            {/* Stage content */}
            {stage >= 0 && stage <= 5 && (
              <div className="how-stage how-fade-in" key={stage}>
                {/* Explanation card */}
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{explanations[stage].title}</strong>
                  </div>
                  {explanations[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}

                  {/* Tokenizer cross-link */}
                  {stage === 2 && onSwitchTab && (
                    <button
                      className="how-secondary-btn"
                      style={{ marginTop: '8px', fontSize: '13px', padding: '8px 18px', width: 'fit-content' }}
                      onClick={() => onSwitchTab('tokenizer')}
                    >
                      → Try the Tokenizer yourself
                    </button>
                  )}

                  {/* Tools section */}
                  <ToolChips tools={TOOLS_BY_STAGE[STAGES[stage].key]} />
                </div>

                {/* Visualization */}
                {vizComponents[stage]}

                {/* Navigation */}
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>← Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'Now let\'s clean it →',
                        'Tokenize the data →',
                        'Start pre-training →',
                        'Fine-tune the model →',
                        'Add human feedback →',
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

      {/* Final summary */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand how AI is built!</div>

          <FinalTimeline />

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            {onSwitchTab && (
              <>
                <button className="how-start-btn" onClick={() => onSwitchTab('playground')}>
                  → See it in action (Playground)
                </button>
                <button className="how-secondary-btn" onClick={() => onSwitchTab('how-llms-work')}>
                  → Watch generation happen
                </button>
              </>
            )}
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelTraining
