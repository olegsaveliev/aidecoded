import { useState, useEffect, useRef, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { TipIcon, CheckIcon, CrossIcon, SparklesIcon, LayersIcon, SearchIcon, SlidersIcon, PlayIcon, PauseIcon, RefreshIcon, BarChartIcon, TargetIcon, HashIcon, LinkIcon, CodeIcon, TreeIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { imageGenerationQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './ImageGeneration.css'
import { scrollStageToTop } from './scrollUtils.js'

/* ── Constants ── */

const STAGES = [
  { key: 'the-problem', label: 'Big Picture' },
  { key: 'diffusion-process', label: 'Diffusion' },
  { key: 'text-guidance', label: 'Text Guidance' },
  { key: 'parameters', label: 'Parameters' },
  { key: 'live-visualiser', label: 'Live Demo' },
]

const STAGE_TOOLTIPS = {
  'the-problem': 'The full pipeline from prompt to image',
  'diffusion-process': 'The forward and reverse diffusion process',
  'text-guidance': 'How your words steer image generation',
  'parameters': 'The four controls that change everything',
  'live-visualiser': 'Watch a simulated denoising in real time',
}

const NEXT_LABELS = [
  'Next: Diffusion →',
  'Next: Text Guidance →',
  'Next: Parameters →',
  'Next: Live Demo →',
  'Test my knowledge →',
]

const IG_TOOLS = {
  0: [],
  1: [],
  2: [
    { name: 'OpenAI CLIP', color: '#FF9500', desc: 'Contrastive Language–Image Pre-training model that maps text and images into the same vector space' },
  ],
  3: [],
  4: [
    { name: 'Stable Diffusion', color: '#FF9500', desc: 'Open-source latent diffusion model for image generation' },
    { name: 'SDXL', color: '#FF9500', desc: 'Higher-resolution successor to Stable Diffusion' },
    { name: 'Flux', color: '#FF9500', desc: 'Flow-matching image generation by Black Forest Labs' },
    { name: 'DALL-E 3', color: '#FF9500', desc: "OpenAI's text-to-image model with strong prompt following" },
    { name: 'Midjourney', color: '#FF9500', desc: 'AI image generation known for artistic aesthetic quality' },
    { name: 'ComfyUI', color: '#FF9500', desc: 'Node-based UI for building custom diffusion workflows' },
  ],
}

const SPEED_MS = { slow: 400, normal: 200, fast: 80 }

const TOOLKIT = [
  { concept: 'Forward Diffusion', when: 'Understanding how training data is prepared', phrase: 'Gradually add noise until the image becomes pure static', icon: <SparklesIcon size={20} color="#FF9500" /> },
  { concept: 'Reverse Denoising', when: 'Generating new images from noise', phrase: 'Predict and subtract noise step by step to reveal an image', icon: <RefreshIcon size={20} color="#FF9500" /> },
  { concept: 'CLIP Encoding', when: 'Connecting text prompts to image generation', phrase: 'Maps words and images into the same mathematical space', icon: <LinkIcon size={20} color="#FF9500" /> },
  { concept: 'Cross-Attention', when: 'Understanding how prompts steer each step', phrase: 'Each image region attends to relevant prompt words every step', icon: <TargetIcon size={20} color="#FF9500" /> },
  { concept: 'Classifier-Free Guidance', when: 'Controlling prompt adherence vs creativity', phrase: 'Run with and without prompt, amplify the difference', icon: <SlidersIcon size={20} color="#FF9500" /> },
  { concept: 'Latent Space', when: 'Understanding why generation is fast enough', phrase: 'Compress 8× spatially (48× fewer values), denoise there, decompress after', icon: <LayersIcon size={20} color="#FF9500" /> },
  { concept: 'Seed', when: 'Reproducing or iterating on a generation', phrase: 'Same seed + same prompt = same image every time', icon: <HashIcon size={20} color="#FF9500" /> },
  { concept: 'Denoising Steps', when: 'Balancing speed vs quality', phrase: 'Composition in first 30% of steps, detail in the rest', icon: <BarChartIcon size={20} color="#FF9500" /> },
]

/* ── Visualizations ── */

/* Stage 0: Pipeline Overview */
function PipelineOverview({ active }) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const timersRef = useRef([])
  useEffect(() => {
    if (!active) { setVisibleSteps(0); return }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    for (let i = 1; i <= 5; i++) {
      timersRef.current.push(setTimeout(() => setVisibleSteps(i), i * 350))
    }
    return () => timersRef.current.forEach(clearTimeout)
  }, [active])
  const steps = [
    { label: 'Your Prompt', sub: '"a red apple on a wooden table"', icon: <CodeIcon size={18} color="#FF9500" /> },
    { label: 'Text Encoder', sub: 'Words become numbers (vectors)', icon: <LinkIcon size={18} color="#FF9500" /> },
    { label: 'Denoising Loop', sub: 'Remove noise step by step, guided by your words', icon: <RefreshIcon size={18} color="#FF9500" /> },
    { label: 'VAE Decoder', sub: 'Expand from compressed latent space to full pixels', icon: <LayersIcon size={18} color="#FF9500" /> },
    { label: 'Final Image', sub: '512×512 pixels, sharp and detailed', icon: <SparklesIcon size={18} color="#FF9500" /> },
  ]
  return (
    <div className="ig-pipeline">
      {steps.map((step, i) => (
        <div key={step.label} className="ig-pipeline-step-wrap">
          <div className={`ig-pipeline-step${i < visibleSteps ? ' ig-visible' : ''}`}>
            <div className="ig-pipeline-icon">{step.icon}</div>
            <div className="ig-pipeline-label">{step.label}</div>
            <div className="ig-pipeline-sub">{step.sub}</div>
          </div>
          {i < steps.length - 1 && <div className={`ig-pipeline-arrow${i < visibleSteps ? ' ig-visible' : ''}`}>&rarr;</div>}
        </div>
      ))}
    </div>
  )
}

/* Stage 0: The Problem */
function ComparisonViz({ active }) {
  const [show, setShow] = useState(false)
  useEffect(() => { if (active) { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t) } else { setShow(false) } }, [active])
  return (
    <div className={`ig-comparison${show ? ' ig-visible' : ''}`}>
      <div className="ig-comp-card ig-comp-bad">
        <div className="ig-comp-header">
          <CrossIcon size={16} color="#FF3B30" />
          <span>Direct pixel prediction</span>
        </div>
        <div className="ig-comp-image ig-comp-blurry">
          <div className="ig-blurry-blob" />
        </div>
        <p className="ig-comp-label">Blurry. Averaged. Uncertain.</p>
        <p className="ig-comp-desc">The model tries to go directly from prompt to pixels in one step. Because millions of different images could match the prompt, it averages them all together.</p>
      </div>
      <div className="ig-comp-card ig-comp-good">
        <div className="ig-comp-header">
          <CheckIcon size={16} color="#34C759" />
          <span>Diffusion approach</span>
        </div>
        <div className="ig-comp-image ig-comp-sharp">
          <div className="ig-sharp-scene" />
        </div>
        <p className="ig-comp-label">Sharp. Committed. Real-looking.</p>
        <p className="ig-comp-desc">The model starts from random noise and removes it step by step, committing to one specific image. Each step makes a small, confident decision.</p>
      </div>
    </div>
  )
}

function InsightFlowViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timersRef = useRef([])
  useEffect(() => {
    if (!active) { setVisibleCards(0); return }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    for (let i = 1; i <= 3; i++) {
      timersRef.current.push(setTimeout(() => setVisibleCards(i), i * 400))
    }
    return () => timersRef.current.forEach(clearTimeout)
  }, [active])
  const steps = [
    { title: 'Destroy', desc: 'Take a real image. Add random noise to it repeatedly until it is completely unrecognisable.', icon: <SparklesIcon size={20} color="#FF9500" /> },
    { title: 'Learn to repair', desc: 'Show the model thousands of destroyed images. Train it to predict what was destroyed — to remove the noise.', icon: <SearchIcon size={20} color="#FF9500" /> },
    { title: 'Run in reverse', desc: 'At generation time: start with pure noise. Run the repair model repeatedly. Watch an image emerge.', icon: <PlayIcon size={20} color="#FF9500" /> },
  ]
  return (
    <div className="ig-insight-flow">
      {steps.map((step, i) => (
        <div key={step.title} className={`ig-insight-card${i < visibleCards ? ' ig-visible' : ''}`}>
          <div className="ig-insight-icon">{step.icon}</div>
          <div className="ig-insight-title">{step.title}</div>
          <p className="ig-insight-desc">{step.desc}</p>
          {i < 2 && <div className="ig-insight-arrow">&rarr;</div>}
        </div>
      ))}
    </div>
  )
}

/* Stage 1: Diffusion Process */
function NoiseStrip({ active }) {
  const canvasRefs = useRef([])
  const noiseDataRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const W = 80, H = 80

  const generateScene = useCallback((ctx, w, h) => {
    // Simple scene: sky gradient + mountains + ground
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#87CEEB')
    grad.addColorStop(0.45, '#B0D4F1')
    grad.addColorStop(0.5, '#6B8E5A')
    grad.addColorStop(1, '#3D6B35')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    // Mountain
    ctx.beginPath()
    ctx.moveTo(w * 0.1, h * 0.55)
    ctx.lineTo(w * 0.35, h * 0.25)
    ctx.lineTo(w * 0.6, h * 0.55)
    ctx.fillStyle = '#5A7D4A'
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(w * 0.4, h * 0.55)
    ctx.lineTo(w * 0.7, h * 0.18)
    ctx.lineTo(w * 0.95, h * 0.55)
    ctx.fillStyle = '#4A6E3A'
    ctx.fill()
    // Sun
    ctx.beginPath()
    ctx.arc(w * 0.8, h * 0.2, w * 0.08, 0, Math.PI * 2)
    ctx.fillStyle = '#FFD700'
    ctx.fill()
  }, [])

  useEffect(() => {
    if (!active) return
    // Generate base noise once
    if (!noiseDataRef.current) {
      noiseDataRef.current = new Uint8Array(W * H * 4)
      for (let i = 0; i < noiseDataRef.current.length; i += 4) {
        const v = Math.random() * 255
        noiseDataRef.current[i] = v
        noiseDataRef.current[i + 1] = v
        noiseDataRef.current[i + 2] = v
        noiseDataRef.current[i + 3] = 255
      }
    }

    const levels = [1, 0.8, 0.6, 0.4, 0.2, 0]
    canvasRefs.current.forEach((canvas, idx) => {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      // Draw target scene
      generateScene(ctx, W, H)
      const sceneData = ctx.getImageData(0, 0, W, H)
      const noise = noiseDataRef.current
      const noiseLevel = levels[idx]
      for (let i = 0; i < sceneData.data.length; i += 4) {
        sceneData.data[i] = Math.round(sceneData.data[i] * (1 - noiseLevel) + noise[i] * noiseLevel)
        sceneData.data[i + 1] = Math.round(sceneData.data[i + 1] * (1 - noiseLevel) + noise[i + 1] * noiseLevel)
        sceneData.data[i + 2] = Math.round(sceneData.data[i + 2] * (1 - noiseLevel) + noise[i + 2] * noiseLevel)
      }
      ctx.putImageData(sceneData, 0, 0)
    })
  }, [active, generateScene])

  const descriptions = [
    'Pure noise. No structure at all.',
    'Faint colour regions beginning to emerge.',
    'Rough composition visible — sky above, ground below.',
    'Subject recognisable, edges soft.',
    'Detail filling in. Textures sharpening.',
    'Final image. All noise removed.',
  ]
  const stepLabels = ['Step 50', 'Step 40', 'Step 30', 'Step 20', 'Step 10', 'Step 0']

  return (
    <div className="ig-noise-strip-wrapper">
      <div className="ig-noise-strip">
        {[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className={`ig-strip-item${selected === i ? ' ig-strip-active' : ''}`} role="button" tabIndex={0} aria-label={stepLabels[i]} onClick={() => setSelected(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(i) } }}>
            <canvas ref={el => canvasRefs.current[i] = el} width={W} height={H} className="ig-strip-canvas" />
            <span className="ig-strip-label">{stepLabels[i]}</span>
          </div>
        ))}
      </div>
      {selected !== null && (
        <div className="ig-strip-detail">
          <strong>{stepLabels[selected]}</strong>: {descriptions[selected]}
        </div>
      )}
    </div>
  )
}

function LatentSpaceDiagram({ active }) {
  const [show, setShow] = useState(false)
  useEffect(() => { if (active) { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t) } else { setShow(false) } }, [active])
  return (
    <div className={`ig-latent-diagram${show ? ' ig-visible' : ''}`}>
      <div className="ig-latent-panel">
        <div className="ig-latent-grid ig-latent-large" />
        <span className="ig-latent-size">512&times;512&times;3</span>
        <span className="ig-latent-values">786,432 values</span>
        <span className="ig-latent-label">Full image (pixel space)</span>
      </div>
      <div className="ig-latent-arrow">
        <span className="ig-latent-arrow-label">VAE Encoder</span>
        <span className="ig-latent-arrow-icon">&rarr;</span>
        <span className="ig-latent-arrow-sublabel">Compress 8&times;</span>
      </div>
      <div className="ig-latent-panel ig-latent-panel-center">
        <div className="ig-latent-grid ig-latent-small" />
        <span className="ig-latent-size">64&times;64&times;4</span>
        <span className="ig-latent-values">16,384 values</span>
        <span className="ig-latent-label">Latent space</span>
        <span className="ig-latent-note">Denoising happens here</span>
      </div>
      <div className="ig-latent-arrow">
        <span className="ig-latent-arrow-label">VAE Decoder</span>
        <span className="ig-latent-arrow-icon">&rarr;</span>
        <span className="ig-latent-arrow-sublabel">Expand back</span>
      </div>
      <div className="ig-latent-panel">
        <div className="ig-latent-grid ig-latent-large" />
        <span className="ig-latent-size">512&times;512&times;3</span>
        <span className="ig-latent-values">786,432 values</span>
        <span className="ig-latent-label">Full image again</span>
      </div>
    </div>
  )
}

/* Stage 2: Text Guidance */
function CrossAttentionViz({ active }) {
  const [activeCell, setActiveCell] = useState(null)
  const promptWords = ['a golden retriever', 'playing', 'in the snow', 'with mountains', 'in the background']
  // Map grid regions to prompt word indices (4x4 grid)
  const attentionMap = {
    0: [3, 4], 1: [3, 4], 2: [3, 4], 3: [3, 4],   // top row: mountains, background
    4: [3, 4], 5: [0, 1], 6: [0, 1], 7: [3, 4],     // mid-top: dog center, mountains sides
    8: [2], 9: [0, 1], 10: [0, 1], 11: [2],           // mid-bottom: dog center, snow sides
    12: [2], 13: [2], 14: [2], 15: [2],               // bottom row: snow
  }
  const highlightedWords = activeCell !== null ? (attentionMap[activeCell] || []) : []

  return (
    <div className={`ig-attn-viz${active ? ' ig-visible' : ''}`}>
      <div className="ig-attn-image-panel">
        <div className="ig-attn-scene">
          <div className="ig-attn-sky" />
          <div className="ig-attn-mountains" />
          <div className="ig-attn-dog" />
          <div className="ig-attn-ground" />
        </div>
        <div className="ig-attn-grid-overlay">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className={`ig-attn-cell${activeCell === i ? ' ig-attn-cell-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-label={`Image region ${i + 1}`}
              onMouseEnter={() => setActiveCell(i)}
              onMouseLeave={() => setActiveCell(null)}
              onClick={() => setActiveCell(activeCell === i ? null : i)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveCell(activeCell === i ? null : i) } }}
            />
          ))}
        </div>
      </div>
      <div className="ig-attn-prompt-panel">
        <div className="ig-attn-prompt-label">Prompt words</div>
        <div className="ig-attn-chips">
          {promptWords.map((word, i) => (
            <span key={word} className={`ig-attn-chip${highlightedWords.includes(i) ? ' ig-attn-chip-active' : ''}`}>
              {word}
            </span>
          ))}
        </div>
        <p className="ig-attn-hint">
          {activeCell !== null
            ? 'Highlighted words have the strongest attention in this region.'
            : 'Hover or tap a grid cell to see which prompt words guide that region.'}
        </p>
      </div>
    </div>
  )
}

function GuidanceScaleViz({ active }) {
  const [cfg, setCfg] = useState(7)
  const getLabel = (v) => {
    if (v <= 3) return 'Too low — image ignores prompt'
    if (v <= 7) return 'Balanced — creative and prompt-adherent'
    if (v <= 12) return 'Strong prompt adherence (recommended range)'
    return 'Over-guided — oversaturated, cartoonish'
  }
  const getZone = (v) => {
    if (v <= 3) return 'low'
    if (v <= 7) return 'balanced'
    if (v <= 12) return 'strong'
    return 'over'
  }
  return (
    <div className={`ig-guidance-viz${active ? ' ig-visible' : ''}`}>
      <div className="ig-guidance-slider-row">
        <span className="ig-guidance-value">CFG: {cfg}</span>
        <input type="range" min={1} max={20} value={cfg} onChange={e => setCfg(Number(e.target.value))} className="ig-guidance-slider" aria-label="Guidance scale (CFG)" />
      </div>
      <div className="ig-guidance-labels">
        <span>1 Creative</span>
        <span>7 Balanced</span>
        <span>20 Literal</span>
      </div>
      <div className={`ig-guidance-result ig-guidance-${getZone(cfg)}`}>
        {getLabel(cfg)}
      </div>
    </div>
  )
}

/* Stage 3: Parameters */
const PARAMETERS = [
  {
    name: 'Seed',
    icon: <HashIcon size={20} color="#FF9500" />,
    what: 'The starting point for the random noise.',
    detail: 'A number that initialises the random noise pattern before denoising begins. Same seed + same prompt = same image. Different seed + same prompt = different image.',
    why: 'When you find an image you like, the seed lets you reproduce it exactly. Make small prompt changes while keeping the seed to evolve a composition.',
  },
  {
    name: 'Steps',
    icon: <BarChartIcon size={20} color="#FF9500" />,
    what: 'The number of denoising iterations.',
    detail: 'More steps = more refined, but slower. Early steps (1–15) establish composition. Middle steps (15–35) add structure. Late steps (35+) refine texture. Most models plateau after ~50.',
    why: '15–20 for fast previews. 25–35 for good quality. 50+ rarely worth the wait.',
  },
  {
    name: 'Guidance Scale (CFG)',
    icon: <SlidersIcon size={20} color="#FF9500" />,
    what: 'How strongly the model follows your prompt.',
    detail: 'Low (1–4): creative but may drift. Medium (5–8): balanced. High (10+): literal but over-saturated. Most models default to 7–7.5.',
    why: 'SDXL often works better at 4–6. Flux is designed for low CFG (1–3.5). DALL-E 3 manages this internally.',
  },
  {
    name: 'Sampler',
    icon: <TreeIcon size={20} color="#FF9500" />,
    what: 'The algorithm for navigating the denoising process.',
    detail: 'Different samplers take different paths through noise space. DPM++ 2M Karras: best all-around. Euler a: fast, good for illustration. DDIM: deterministic. LCM: ultra fast (4–8 steps).',
    why: 'DPM++ 2M Karras is the right default for most users. Only experiment when you want a specific quality or speed trade-off.',
  },
]

const DECISION_TABLE = [
  { goal: 'Fast preview', seed: 'any', steps: '15', cfg: '7', sampler: 'Euler a' },
  { goal: 'Good quality', seed: 'any', steps: '30', cfg: '7', sampler: 'DPM++ 2M Karras' },
  { goal: 'Reproduce a result', seed: 'fixed', steps: '30', cfg: '7', sampler: 'DPM++ 2M Karras' },
  { goal: 'More creative', seed: 'any', steps: '30', cfg: '4', sampler: 'Euler a' },
  { goal: 'Max prompt adherence', seed: 'any', steps: '50', cfg: '12', sampler: 'DPM++ 2M Karras' },
  { goal: 'Ultra fast (LCM)', seed: 'any', steps: '6', cfg: '1.5', sampler: 'LCM' },
]

/* Stage 4: Live Denoising Visualiser */
function DenoisingVisualiser({ active }) {
  const canvasRef = useRef(null)
  const noiseRef = useRef(null)
  const [step, setStep] = useState(0)
  const totalSteps = 30
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const timerRef = useRef(null)
  const W = 256, H = 256

  // Generate noise data once
  useEffect(() => {
    if (noiseRef.current) return
    noiseRef.current = new Uint8Array(W * H * 4)
    for (let i = 0; i < noiseRef.current.length; i += 4) {
      noiseRef.current[i] = Math.random() * 255
      noiseRef.current[i + 1] = Math.random() * 255
      noiseRef.current[i + 2] = Math.random() * 255
      noiseRef.current[i + 3] = 255
    }
  }, [])

  const drawScene = useCallback((ctx, w, h) => {
    // Coffee shop scene with warm colours
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#2C1810')
    grad.addColorStop(0.3, '#4A2820')
    grad.addColorStop(0.6, '#6B3E30')
    grad.addColorStop(1, '#3D2418')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    // Window glow
    ctx.fillStyle = '#FFD89050'
    ctx.fillRect(w * 0.1, h * 0.05, w * 0.35, h * 0.4)
    ctx.fillStyle = '#FFD89050'
    ctx.fillRect(w * 0.55, h * 0.05, w * 0.35, h * 0.4)
    // Table
    ctx.fillStyle = '#5C3A28'
    ctx.fillRect(w * 0.15, h * 0.6, w * 0.7, h * 0.08)
    // Cup
    ctx.beginPath()
    ctx.ellipse(w * 0.5, h * 0.58, w * 0.06, h * 0.04, 0, 0, Math.PI * 2)
    ctx.fillStyle = '#8B6F47'
    ctx.fill()
    ctx.fillStyle = '#D4A574'
    ctx.fillRect(w * 0.44, h * 0.5, w * 0.12, h * 0.08)
    // Warm light spots
    ctx.beginPath()
    ctx.arc(w * 0.28, h * 0.25, w * 0.06, 0, Math.PI * 2)
    ctx.fillStyle = '#FFE4B520'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(w * 0.72, h * 0.25, w * 0.06, 0, Math.PI * 2)
    ctx.fillStyle = '#FFE4B520'
    ctx.fill()
  }, [])

  // Render current step
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !noiseRef.current) return
    const ctx = canvas.getContext('2d')
    // Draw target scene to get pixel data
    drawScene(ctx, W, H)
    const sceneData = ctx.getImageData(0, 0, W, H)
    const noise = noiseRef.current
    const progress = step / totalSteps // 0 = pure noise, 1 = clean
    for (let i = 0; i < sceneData.data.length; i += 4) {
      sceneData.data[i] = Math.round(sceneData.data[i] * progress + noise[i] * (1 - progress))
      sceneData.data[i + 1] = Math.round(sceneData.data[i + 1] * progress + noise[i + 1] * (1 - progress))
      sceneData.data[i + 2] = Math.round(sceneData.data[i + 2] * progress + noise[i + 2] * (1 - progress))
    }
    ctx.putImageData(sceneData, 0, 0)
  }, [step, totalSteps, drawScene])

  // Auto-play
  useEffect(() => {
    if (!playing || !active) return
    if (step >= totalSteps) { setPlaying(false); return }
    timerRef.current = setTimeout(() => {
      setStep(s => Math.min(s + 1, totalSteps))
    }, SPEED_MS[speed])
    return () => clearTimeout(timerRef.current)
  }, [playing, step, totalSteps, speed, active])

  const handlePlay = () => {
    if (step >= totalSteps) setStep(0)
    setPlaying(true)
  }
  const handlePause = () => setPlaying(false)
  const handleStepBack = () => { setPlaying(false); setStep(s => Math.max(s - 1, 0)) }
  const handleStepForward = () => { setPlaying(false); setStep(s => Math.min(s + 1, totalSteps)) }
  const handleReset = () => { setPlaying(false); setStep(0) }

  const getStepDesc = () => {
    const pct = step / totalSteps
    if (pct === 0) return 'Pure noise. The starting point for generation.'
    if (pct < 0.2) return 'Large-scale structure emerging. Composition being established.'
    if (pct < 0.4) return 'Rough shapes committed. Subject becoming recognisable.'
    if (pct < 0.7) return 'Detail and texture filling in. Edges sharpening.'
    if (pct < 1) return 'Final refinement. Fine texture and colour correction.'
    return 'Generation complete. All noise removed.'
  }

  const blurAmount = Math.max(0, (1 - step / totalSteps) * 6)

  return (
    <div className="ig-visualiser">
      <div className="ig-vis-main">
        <div className="ig-vis-canvas-wrap">
          <canvas ref={canvasRef} width={W} height={H} className="ig-vis-canvas" style={{ filter: `blur(${blurAmount}px)` }} />
        </div>
        <div className="ig-vis-info">
          <div className="ig-vis-step-counter">Step {step} of {totalSteps}</div>
          <div className="ig-vis-progress">
            <div className="ig-vis-progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <div className="ig-vis-noise-level">Noise level: {Math.round((1 - step / totalSteps) * 100)}%</div>
          <p className="ig-vis-desc">{getStepDesc()}</p>
        </div>
      </div>
      <div className="ig-vis-controls">
        <button className="ig-vis-btn" onClick={handleReset} aria-label="Reset">
          <RefreshIcon size={16} color="currentColor" />
        </button>
        <button className="ig-vis-btn" onClick={handleStepBack} aria-label="Step back">&larr;</button>
        {playing
          ? <button className="ig-vis-btn ig-vis-btn-primary" onClick={handlePause} aria-label="Pause"><PauseIcon size={16} color="currentColor" /></button>
          : <button className="ig-vis-btn ig-vis-btn-primary" onClick={handlePlay} aria-label="Play">
              <PlayIcon size={16} color="currentColor" />
            </button>
        }
        <button className="ig-vis-btn" onClick={handleStepForward} aria-label="Step forward">&rarr;</button>
      </div>
      <div className="ig-vis-speed">
        {['slow', 'normal', 'fast'].map(s => (
          <button key={s} className={`ig-speed-btn${speed === s ? ' ig-speed-active' : ''}`} onClick={() => setSpeed(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

/* Stage 4: Summary cards */
const SUMMARY_POINTS = [
  'Each step removed a small, targeted amount of noise — not a random amount. The model predicted exactly which noise to subtract.',
  'Your text prompt guided every single step via cross-attention, even at the noisiest early stages when the image looked like static.',
  'The full composition was decided in the first 30% of steps. The last 70% was adding detail and texture to a structure that was already chosen.',
  'The model never "thought about" the image. It solved the same maths problem (predict noise to subtract) dozens of times, guided by your words.',
]

/* Stage 4: Model comparison table */
const MODELS = [
  { name: 'DALL-E 3', maker: 'OpenAI', arch: 'Diffusion', strength: 'Prompt following, safety', open: 'No' },
  { name: 'Stable Diffusion', maker: 'Stability AI', arch: 'Latent Diffusion', strength: 'Community, customisable', open: 'Yes' },
  { name: 'SDXL', maker: 'Stability AI', arch: 'Latent Diffusion', strength: 'Higher resolution', open: 'Yes' },
  { name: 'Flux', maker: 'Black Forest Labs', arch: 'Flow matching', strength: 'Photorealism, text accuracy', open: 'Partially' },
  { name: 'Midjourney', maker: 'Midjourney', arch: 'Proprietary', strength: 'Artistic quality', open: 'No' },
  { name: 'Imagen 3', maker: 'Google', arch: 'Diffusion', strength: 'Photorealism, coherence', open: 'No' },
]

/* ══════════════════════════════
   Main Component
   ══════════════════════════════ */

export default function ImageGeneration({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('image-generation', -1)
  const [maxStageReached, setMaxStageReached] = useState(stage)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)

  /* Learn tips */
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)

  const activeStepRef = useRef(null)

  /* Scroll on stage change */
  useEffect(() => {
    const cancel = scrollStageToTop('.ig-root', activeStepRef)
    return cancel
  }, [stage])

  /* Track max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  /* Learn tips */
  useEffect(() => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    const TIPS = {
      0: { id: 'ig-problem', text: 'Notice: the problem framing changed everything. Repair, not creation.' },
      1: { id: 'ig-diffusion', text: 'The model never sees the forward process. Only the reverse is learned.' },
      2: { id: 'ig-attention', text: 'That attention map updates at every denoising step — once per step across all 50 steps.' },
      4: { id: 'ig-visualiser', text: 'Try changing the speed and stepping through manually to see each denoising step.' },
    }

    const tip = TIPS[stage]
    if (tip && !dismissedTips.has(tip.id)) {
      setLearnTip(tip)
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips(prev => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  /* Navigation */
  function handleEntryDismiss() {
    markModuleStarted('image-generation')
    setStage(0)
    setShowWelcome(true)
  }

  function handleBack() {
    if (stage > 0) setStage(stage - 1)
  }

  function handleNext() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      // Transition to final screen
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        setFading(false)
        markModuleComplete('image-generation')
      }, 250)
    }
  }

  function handleStepClick(i) {
    if (i <= maxStageReached) setStage(i)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    reset()
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  /* Entry screen */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="image-generation" size={48} style={{ color: '#FF9500' }} />}
        title="Image Generation"
        subtitle="From random noise to stunning visuals"
        description="Every AI image starts as pure static &mdash; random noise with no structure at all. Then, step by step, a model guided by your words reshapes that noise into something real. This tutorial shows you exactly how that happens: the science, the process, and a live simulation you can control."
        buttonText="Start the Journey"
        onStart={handleEntryDismiss}
      />
    )
  }

  /* Quiz */
  if (showQuiz) {
    return (
      <Quiz
        questions={imageGenerationQuiz}
        tabName="Image Generation"
        onBack={() => setShowQuiz(false)}
        onStartOver={handleStartOver}
        onSwitchTab={onSwitchTab}
        currentModuleId="image-generation"
      />
    )
  }

  const learnTipEl = learnTip ? (
    <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
      <span className="learn-tip-text">{learnTip.text}</span>
      <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
    </div>
  ) : null

  return (
    <div className="how-llms ig-root">
      {/* Start over (top-right) */}
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>&larr; Start over</button>
      )}

      {/* Stepper */}
      {stage >= 0 && !showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper ig-stepper">
            <div className="how-stepper-inner">
              {STAGES.map((s, i) => {
                const isCompleted = stage > i
                const isCurrent = stage === i
                const isActive = stage >= i
                const isClickable = i <= maxStageReached && !isCurrent
                return (
                  <div key={s.key} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
                    <div
                      className={`how-step${isActive ? ' how-step-active' : ''}${isCurrent ? ' how-step-current' : ''}${isCompleted ? ' how-step-completed' : ''}${isClickable ? ' how-step-clickable' : ''}`}
                      onClick={isClickable ? () => handleStepClick(i) : undefined}
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
                      <div className={`how-step-arrow${stage > i ? ' how-arrow-active' : ''}`}>
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
      )}

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Image Generation</strong> &mdash; follow the complete journey from random noise to a finished image.
            <ol className="module-welcome-steps">
              <li>Understand why generating images is <strong>fundamentally different</strong> from generating text</li>
              <li>Watch the <strong>diffusion process</strong> add and remove noise step by step</li>
              <li>See how your <strong>text prompt steers</strong> every denoising step via cross-attention</li>
              <li>Learn the <strong>four parameters</strong> that control every generation</li>
              <li>Run a <strong>live denoising simulation</strong> and watch an image emerge</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* ── Stage 0: The Big Picture ── */}
      {stage === 0 && !showFinal && (
        <div className={`ig-stage${fading ? ' how-fading' : ''}`}>
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header"><strong>How Image Generation Works &mdash; The Big Picture</strong></div>
            <p>When you type a prompt like &ldquo;a red apple on a wooden table&rdquo; into Stable Diffusion or DALL-E, five things happen in sequence:</p>
            <ol className="ig-numbered-list">
              <li><b>Your prompt</b> is fed into a <b>text encoder</b> (usually CLIP) that converts your words into a list of numbers (a vector) representing their meaning.</li>
              <li>The model starts with <b>pure random noise</b> &mdash; like TV static.</li>
              <li>A <b>denoising loop</b> runs 20&ndash;50 times. At each step, the model predicts what noise to remove, guided by your text vector. The image gets slightly cleaner each time.</li>
              <li>All of this happens in a compressed <b>latent space</b> (48&times; smaller than the full image) for speed. A <b>VAE Decoder</b> expands the result back to full resolution.</li>
              <li>Out comes your <b>final image</b> &mdash; 512&times;512 pixels, sharp and detailed.</li>
            </ol>
            <p>That is the entire pipeline. The rest of this module dives into each step so you truly understand what is happening and why.</p>
            <ToolChips tools={IG_TOOLS[0]} />
          </div>

          {learnTipEl}

          <h3 className="ig-section-heading">The Full Pipeline</h3>
          <p className="ig-section-hint">From your words to a finished image &mdash; five stages in sequence.</p>
          <PipelineOverview active={stage === 0} />

          <h3 className="ig-section-heading">Why Is This Hard?</h3>
          <p className="ig-section-hint">Images are fundamentally different from text. Here is why the naive approach fails.</p>
          <div className="ig-why-hard-card">
            <ul className="ig-bullet-list">
              <li>A 512&times;512 image has <b>786,432</b> pixel values to determine simultaneously</li>
              <li>Every pixel affects every other pixel &mdash; there is no natural left-to-right order</li>
              <li>Training a model to go directly from prompt to pixels produces <b>blurry, averaged</b> results because millions of valid images could match the same prompt</li>
            </ul>
            <p className="ig-why-hard-breakthrough">The breakthrough: instead of creating images from nothing, train a model to <b>repair</b> images that have been deliberately destroyed with noise. This is called <b>diffusion</b>.</p>
            <div className="how-info-tip">
              <TipIcon size={16} color="#eab308" />
              A model that learns to remove noise implicitly learns the structure of images &mdash; what makes a face look like a face, a sky look like a sky. Denoising forces deep visual understanding.
            </div>
          </div>

          <h3 className="ig-section-heading">Direct Prediction vs Diffusion</h3>
          <p className="ig-section-hint">Same prompt: &ldquo;a red apple on a wooden table&rdquo;</p>
          <ComparisonViz active={stage === 0} />

          <h3 className="ig-section-heading">The Insight That Changed Everything</h3>
          <p className="ig-section-hint">Three steps that unlocked image generation.</p>
          <InsightFlowViz active={stage === 0} />

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              <button className="how-gotit-btn" onClick={handleNext}>{NEXT_LABELS[0]}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 1: Diffusion Process ── */}
      {stage === 1 && !showFinal && (
        <div className={`ig-stage${fading ? ' how-fading' : ''}`}>
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header"><strong>How Diffusion Actually Works</strong></div>
            <p>Diffusion models have two distinct phases. Training uses the <b>forward process</b> (add noise). Generating uses the <b>reverse process</b> (remove noise). They are opposites.</p>
            <p>At each denoising step, the model answers one question: &ldquo;Given this noisy image at noise level t, what noise should I subtract to make it slightly cleaner?&rdquo;</p>
            <p>The model is not painting. It is <b>subtracting noise</b> &mdash; but doing so in a direction shaped by your words. This happens 20&ndash;50 times per image.</p>
            <div className="how-info-tip">
              <TipIcon size={16} color="#eab308" />
              The number of denoising steps is a parameter you control. Fewer steps (15&ndash;20) = faster but rougher. More steps (50+) = slower but more refined. Most models hit diminishing returns after 30 steps.
            </div>
            <ToolChips tools={IG_TOOLS[1]} />
          </div>

          {learnTipEl}

          <h3 className="ig-section-heading">The Denoising Process</h3>
          <p className="ig-section-hint">Click any step to see what the model sees at that point.</p>
          <NoiseStrip active={stage === 1} />

          <h3 className="ig-section-heading">The Latent Space Trick</h3>
          <p className="ig-section-hint">Working directly with full-resolution images (512&times;512&times;3 = 786,432 values) would be incredibly slow. To solve this, diffusion models use a <b>VAE</b> (Variational Autoencoder) &mdash; a small neural network trained to compress and decompress images. The <b>VAE Encoder</b> squeezes a full image down to a compact grid of numbers called the "latent" representation (64&times;64&times;4 = 16,384 values) &mdash; about 48&times; fewer numbers. Think of it like a JPEG compressor, but learned by a neural network to preserve exactly the details that matter for image generation. All the expensive denoising steps happen in this tiny latent space, making the process fast and memory-efficient. Once denoising is done, the <b>VAE Decoder</b> expands the result back to full pixel resolution. This encoder-decoder pair is trained separately and stays frozen during image generation &mdash; it is just the compression layer. This is why models like Stable Diffusion are called <b>latent</b> diffusion models.</p>
          <LatentSpaceDiagram active={stage === 1} />

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              <button className="how-gotit-btn" onClick={handleNext}>{NEXT_LABELS[1]}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 2: Text Guidance ── */}
      {stage === 2 && !showFinal && (
        <div className={`ig-stage${fading ? ' how-fading' : ''}`}>
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header"><strong>How Your Words Shape the Image</strong></div>
            <p>You type words. The model produces pixels. The bridge is a <b>text encoder</b> &mdash; most commonly CLIP (Contrastive Language&ndash;Image Pre-training).</p>
            <p>CLIP was trained on hundreds of millions of image-caption pairs. It maps images and text descriptions into the same mathematical space. Similar meanings get similar numbers, whether from text or images.</p>
            <p>At every denoising step, <b>cross-attention</b> compares the noisy image against your text embedding: &ldquo;Which parts of my prompt are relevant to each region of the image right now?&rdquo;</p>
            <div className="how-info-tip">
              <TipIcon size={16} color="#eab308" />
              Negative prompts are often more powerful than positive ones for fixing specific problems. Add &ldquo;blurry, soft focus&rdquo; to the negative prompt and it often works immediately.
            </div>
            <ToolChips tools={IG_TOOLS[2]} />
          </div>

          {learnTipEl}

          <h3 className="ig-section-heading">Cross-Attention in Action</h3>
          <p className="ig-section-hint">Hover or tap a region to see which prompt words guide that area.</p>
          <CrossAttentionViz active={stage === 2} />

          <h3 className="ig-section-heading">Classifier-Free Guidance (CFG)</h3>
          <p className="ig-section-hint">At every denoising step, the model actually runs <b>twice</b>: once with your prompt and once with no prompt at all. The &ldquo;no-prompt&rdquo; pass predicts what a generic image would look like. The &ldquo;with-prompt&rdquo; pass predicts what your specific image should look like. The model then subtracts the generic prediction from the prompted one and <b>amplifies the difference</b> by a factor you control (the CFG scale). A CFG of 1 means &ldquo;ignore the prompt entirely.&rdquo; A CFG of 7&ndash;8 is the sweet spot for most models &mdash; the image follows your prompt closely while still looking natural. Push it to 15+ and the image becomes oversaturated and distorted because the model over-commits to prompt features. This is the single most important parameter for balancing creativity vs prompt adherence.</p>
          <GuidanceScaleViz active={stage === 2} />

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              <button className="how-gotit-btn" onClick={handleNext}>{NEXT_LABELS[2]}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 3: Parameters ── */}
      {stage === 3 && !showFinal && (
        <div className={`ig-stage${fading ? ' how-fading' : ''}`}>
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header"><strong>The Controls That Change Everything</strong></div>
            <p>Every image generation tool exposes the same four core parameters. Understanding what each one actually does &mdash; not just what the tooltip says &mdash; makes the difference between guessing and control.</p>
            <div className="how-info-tip">
              <TipIcon size={16} color="#eab308" />
              When something goes wrong, change one parameter at a time. Change seed first &mdash; bad results are often just bad luck with the starting noise. If the prompt is being ignored, raise CFG. If it looks over-saturated, lower CFG.
            </div>
            <ToolChips tools={IG_TOOLS[3]} />
          </div>

          {learnTipEl}

          <h3 className="ig-section-heading">Four Parameters, Infinite Variation</h3>
          <div className="ig-param-grid">
            {PARAMETERS.map(p => (
              <div key={p.name} className="ig-param-card">
                <div className="ig-param-header">
                  <div className="ig-param-icon">{p.icon}</div>
                  <div className="ig-param-name">{p.name}</div>
                </div>
                <p className="ig-param-what"><strong>What it is:</strong> {p.what}</p>
                <p className="ig-param-detail">{p.detail}</p>
                <p className="ig-param-why"><strong>When to change:</strong> {p.why}</p>
              </div>
            ))}
          </div>

          <h3 className="ig-section-heading">Quick Reference</h3>
          <p className="ig-section-hint">Common parameter combinations for different goals.</p>
          <div className="ig-table-wrap">
            <table className="ig-decision-table">
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Seed</th>
                  <th>Steps</th>
                  <th>CFG</th>
                  <th>Sampler</th>
                </tr>
              </thead>
              <tbody>
                {DECISION_TABLE.map(row => (
                  <tr key={row.goal}>
                    <td className="ig-dt-goal">{row.goal}</td>
                    <td>{row.seed}</td>
                    <td>{row.steps}</td>
                    <td>{row.cfg}</td>
                    <td>{row.sampler}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              <button className="how-gotit-btn" onClick={handleNext}>{NEXT_LABELS[3]}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage 4: Live Visualiser ── */}
      {stage === 4 && !showFinal && (
        <div className={`ig-stage${fading ? ' how-fading' : ''}`}>
          <div className="how-info-card how-info-card-edu">
            <div className="how-info-card-header"><strong>Watch a Simulated Denoising</strong></div>
            <p>You have seen how diffusion works. Now watch it happen. This visualiser simulates the denoising process &mdash; starting from pure random noise and progressively revealing an image through iterative noise removal, just like a real diffusion model.</p>
            <p>Use the playback controls to step through manually or watch it run automatically. Try different speeds to see how each step contributes.</p>
            <ToolChips tools={IG_TOOLS[4]} />
          </div>

          {learnTipEl}

          <h3 className="ig-section-heading">Denoising Simulation</h3>
          <p className="ig-section-hint">Scene: a cosy coffee shop in autumn, warm lighting.</p>
          <DenoisingVisualiser active={stage === 4} />

          <h3 className="ig-section-heading">What You Just Watched</h3>
          <div className="ig-summary-grid">
            {SUMMARY_POINTS.map((point, i) => (
              <div key={i} className="ig-summary-card">{point}</div>
            ))}
          </div>

          <h3 className="ig-section-heading">The Model Landscape</h3>
          <p className="ig-section-hint">All of these use the same core ideas you just learned.</p>
          <div className="ig-table-wrap">
            <table className="ig-model-table">
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Made by</th>
                  <th>Architecture</th>
                  <th>Strength</th>
                  <th>Open source</th>
                </tr>
              </thead>
              <tbody>
                {MODELS.map(m => (
                  <tr key={m.name}>
                    <td className="ig-dt-goal">{m.name}</td>
                    <td>{m.maker}</td>
                    <td>{m.arch}</td>
                    <td>{m.strength}</td>
                    <td className={`ig-open-${m.open.toLowerCase().replaceAll(' ', '-')}`}>{m.open}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="how-info-tip" style={{ marginTop: 16 }}>
            <TipIcon size={16} color="#eab308" />
            &ldquo;Flow matching&rdquo; (used by Flux) is a newer alternative to diffusion that learns straighter denoising paths. Fewer steps needed for the same quality. It is the direction the field is heading.
          </div>

          <div className="how-nav-row">
            <div className="how-nav-buttons">
              <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              <button className="how-gotit-btn" onClick={handleNext}>{NEXT_LABELS[4]}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Final Screen ── */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You understand image generation.</div>
          <div className="pe-final-grid">
            {TOOLKIT.map(item => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>
          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Image Generation Toolkit</div>
            <table className="pe-reference">
              <thead><tr><th>Concept</th><th>When to use</th><th>Key phrase</th></tr></thead>
              <tbody>
                {TOOLKIT.map(item => (
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
          <SuggestedModules currentModuleId="image-generation" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
