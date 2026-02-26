import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import './NeuralNetworkCanvas.css'

const GROUP_COLORS = {
  tools: '#0071E3',
  foundations: '#AF52DE',
  skills: '#34C759',
  advanced: '#FF9500',
  play: '#F59E0B',
  professional: '#0EA5E9',
}

const NODES = [
  { id: 'playground', label: 'Playground', group: 'tools', desc: 'Chat with AI and tune parameters in real time' },
  { id: 'tokenizer', label: 'Tokenizer', group: 'tools', desc: 'See how AI reads your text as tokens' },
  { id: 'generation', label: 'Generation', group: 'tools', desc: 'Watch AI predict the next word live' },
  { id: 'how-llms-work', label: 'How LLMs Work', group: 'foundations', desc: 'An interactive journey inside AI' },
  { id: 'deep-learning', label: 'Deep Learning', group: 'foundations', desc: 'Neural networks powering every AI breakthrough' },
  { id: 'machine-learning', label: 'Machine Learning', group: 'foundations', desc: 'How machines learn from data' },
  { id: 'neural-networks', label: 'Neural Networks', group: 'foundations', desc: 'Watch a neural network learn in real time' },
  { id: 'model-training', label: 'Model Training', group: 'foundations', desc: 'How AI models are built from scratch' },
  { id: 'fine-tuning', label: 'Fine-Tuning', group: 'foundations', desc: 'Turn a general AI into a domain expert' },
  { id: 'rag', label: 'RAG', group: 'advanced', desc: 'How AI learns from YOUR documents' },
  { id: 'agentic-ai', label: 'Agentic AI', group: 'advanced', desc: 'AI that plans, acts and learns autonomously' },
  { id: 'prompt-heist', label: 'Prompt Heist', group: 'play', desc: 'Outsmart AI security with the perfect prompt' },
  { id: 'generative-ai', label: 'Generative AI', group: 'foundations', desc: 'How AI creates images, music, video and code' },
  { id: 'prompt-engineering', label: 'Prompt Eng.', group: 'skills', desc: 'Write better prompts for better results' },
  { id: 'context-engineering', label: 'Context Eng.', group: 'skills', desc: 'Give AI the right context every time' },
  { id: 'ai-lab-explorer', label: 'Lab Explorer', group: 'play', desc: 'Explore an AI research lab room by room' },
  { id: 'ai-city-builder', label: 'City Builder', group: 'play', desc: 'Solve AI mysteries, build your city' },
  { id: 'token-budget', label: 'Token Budget', group: 'play', desc: 'Rewrite prompts to fit strict token budgets' },
  { id: 'ai-ethics-tribunal', label: 'Ethics Tribunal', group: 'play', desc: 'Navigate ethical dilemmas in AI systems' },
  { id: 'pm-simulator', label: 'PM Simulator', group: 'play', desc: 'Ship an AI feature as the PM — or watch it fail' },
  { id: 'ai-native-pm', label: 'AI-Native PM', group: 'professional', desc: 'What AI engineers actually need from PMs' },
  { id: 'ai-safety', label: 'AI Safety', group: 'skills', desc: 'Why AI hallucinates and how to stop it' },
  { id: 'ai-fluency', label: 'AI Fluency', group: 'skills', desc: 'The habits that separate AI power users from passive ones' },
  { id: 'ai-startup-simulator', label: 'Startup Sim', group: 'play', desc: 'Build an AI startup from zero to launch' },
  { id: 'precision-recall', label: 'Precision/Recall', group: 'foundations', desc: 'Why accuracy lies and what to measure instead' },
  { id: 'rag-under-the-hood', label: 'Why RAG Fails', group: 'advanced', desc: 'Fix every layer of your RAG pipeline' },
  { id: 'ai-in-production', label: 'AI in Prod', group: 'advanced', desc: 'Monitor quality, latency, cost and drift in production AI' },
  { id: 'alignment-game', label: 'Alignment Game', group: 'play', desc: 'Write constraints to stop AI from gaming your goals' },
  { id: 'choosing-ai-model', label: 'Choosing Model', group: 'skills', desc: 'Match any task to the right AI model' },
  { id: 'ollama', label: 'Run AI Locally', group: 'skills', desc: 'Run open-source AI models on your own hardware' },
  { id: 'computer-vision', label: 'Computer Vision', group: 'foundations', desc: 'How machines learn to see — from pixels to vision transformers' },
  { id: 'label-master', label: 'Label Master', group: 'play', desc: 'Draw bounding boxes and learn how training data is annotated' },
  { id: 'draw-and-deceive', label: 'Draw & Deceive', group: 'play', desc: 'Draw pixel art and try to fool GPT-4o vision' },
  { id: 'agent-office', label: 'Agent Office', group: 'play', desc: 'Run a pixel art AI startup with four AI agents' },
  { id: 'claude-code', label: 'Claude Code', group: 'skills', desc: 'AI pair programmer that lives in your terminal' },
]


const CONNECTIONS = [
  // Layer 1 → Layer 2
  ['playground', 'how-llms-work'],
  ['playground', 'deep-learning'],
  ['tokenizer', 'how-llms-work'],
  ['tokenizer', 'deep-learning'],
  ['tokenizer', 'machine-learning'],
  ['generation', 'deep-learning'],
  ['generation', 'machine-learning'],
  // Layer 2 → Layer 3
  ['how-llms-work', 'model-training'],
  ['how-llms-work', 'rag'],
  ['deep-learning', 'model-training'],
  ['deep-learning', 'fine-tuning'],
  ['machine-learning', 'neural-networks'],
  ['machine-learning', 'fine-tuning'],
  ['machine-learning', 'rag'],
  ['neural-networks', 'deep-learning'],
  ['neural-networks', 'model-training'],
  ['neural-networks', 'precision-recall'],
  ['neural-networks', 'computer-vision'],
  ['deep-learning', 'computer-vision'],
  ['machine-learning', 'computer-vision'],
  ['computer-vision', 'generative-ai'],
  ['machine-learning', 'agentic-ai'],
  ['machine-learning', 'prompt-heist'],
  // Layer 3 → Layer 4
  ['model-training', 'prompt-engineering'],
  ['model-training', 'context-engineering'],
  ['fine-tuning', 'context-engineering'],
  ['fine-tuning', 'ai-lab-explorer'],
  ['rag', 'context-engineering'],
  ['rag', 'ai-lab-explorer'],
  ['rag', 'agentic-ai'],
  ['agentic-ai', 'context-engineering'],
  ['agentic-ai', 'ai-lab-explorer'],
  ['prompt-heist', 'ai-city-builder'],
  ['prompt-heist', 'ai-lab-explorer'],
  ['prompt-heist', 'token-budget'],
  ['tokenizer', 'token-budget'],
  ['ai-city-builder', 'ai-ethics-tribunal'],
  ['machine-learning', 'ai-ethics-tribunal'],
  ['ai-ethics-tribunal', 'pm-simulator'],
  ['ai-native-pm', 'pm-simulator'],
  ['how-llms-work', 'generative-ai'],
  ['model-training', 'generative-ai'],
  ['deep-learning', 'generative-ai'],
  ['generative-ai', 'rag'],
  ['prompt-engineering', 'ai-native-pm'],
  ['context-engineering', 'ai-native-pm'],
  ['agentic-ai', 'ai-native-pm'],
  ['fine-tuning', 'ai-native-pm'],
  ['prompt-engineering', 'ai-safety'],
  ['context-engineering', 'ai-safety'],
  ['rag', 'ai-safety'],
  ['agentic-ai', 'ai-safety'],
  ['prompt-engineering', 'ai-fluency'],
  ['context-engineering', 'ai-fluency'],
  ['ai-safety', 'ai-fluency'],
  ['agentic-ai', 'ai-fluency'],
  ['pm-simulator', 'ai-startup-simulator'],
  ['rag', 'ai-startup-simulator'],
  ['fine-tuning', 'ai-startup-simulator'],
  ['machine-learning', 'precision-recall'],
  ['deep-learning', 'precision-recall'],
  ['model-training', 'precision-recall'],
  ['precision-recall', 'ai-safety'],
  ['rag', 'rag-under-the-hood'],
  ['agentic-ai', 'rag-under-the-hood'],
  ['context-engineering', 'rag-under-the-hood'],
  ['fine-tuning', 'rag-under-the-hood'],
  ['rag-under-the-hood', 'ai-in-production'],
  ['agentic-ai', 'ai-in-production'],
  ['ai-safety', 'ai-in-production'],
  ['precision-recall', 'ai-in-production'],
  ['ai-ethics-tribunal', 'alignment-game'],
  ['ai-safety', 'alignment-game'],
  ['prompt-heist', 'alignment-game'],
  ['prompt-engineering', 'choosing-ai-model'],
  ['ai-fluency', 'choosing-ai-model'],
  ['ai-in-production', 'choosing-ai-model'],
  ['rag-under-the-hood', 'choosing-ai-model'],
  ['choosing-ai-model', 'ollama'],
  ['rag-under-the-hood', 'ollama'],
  ['fine-tuning', 'ollama'],
  ['prompt-engineering', 'ollama'],
  ['computer-vision', 'label-master'],
  ['precision-recall', 'label-master'],
  ['computer-vision', 'draw-and-deceive'],
  ['alignment-game', 'draw-and-deceive'],
  ['ai-ethics-tribunal', 'draw-and-deceive'],
  ['agentic-ai', 'agent-office'],
  ['claude-code', 'agent-office'],
  ['draw-and-deceive', 'agent-office'],
  ['alignment-game', 'agent-office'],
  ['ollama', 'claude-code'],
  ['agentic-ai', 'claude-code'],
  ['prompt-engineering', 'claude-code'],
  ['fine-tuning', 'claude-code'],
]

const NODE_APPEAR_DUR = 500
const CONN_DRAW_DUR = 500

/* ── Layout helpers ── */

const REF_W = 960
const REF_H = 600
const NODE_RADIUS = 24

const PARTICLE_BG_COUNT = 35

/* ── Drag constants ── */

const NODE_PADDING = 24

/* ── Neuron-shaped initial layout ── */
/* Dendrites (left) → Soma (center-left cluster) → Axon (middle line) → Terminals (right) */

const NEURON_LAYOUT = {
  // Dendrites — branching inputs (left side)
  'playground':        { px: 0.08, py: 0.10 },
  'how-llms-work':     { px: 0.16, py: 0.05 },
  'tokenizer':         { px: 0.05, py: 0.35 },
  'generation':        { px: 0.08, py: 0.58 },
  'deep-learning':     { px: 0.16, py: 0.22 },
  // Soma — cell body (dense cluster)
  'machine-learning':  { px: 0.28, py: 0.30 },
  'model-training':    { px: 0.34, py: 0.24 },
  'fine-tuning':       { px: 0.26, py: 0.48 },
  'rag':               { px: 0.36, py: 0.40 },
  'agentic-ai':        { px: 0.30, py: 0.58 },
  'generative-ai':     { px: 0.38, py: 0.52 },
  // Axon — signal path (horizontal line)
  'prompt-heist':        { px: 0.48, py: 0.44 },
  'prompt-engineering':  { px: 0.56, py: 0.46 },
  'context-engineering': { px: 0.64, py: 0.44 },
  'ai-safety':           { px: 0.72, py: 0.46 },
  'ai-fluency':          { px: 0.78, py: 0.54 },
  // Terminals — branching outputs (right side)
  'ai-lab-explorer':     { px: 0.82, py: 0.18 },
  'ai-city-builder':     { px: 0.86, py: 0.34 },
  'token-budget':        { px: 0.92, py: 0.46 },
  'ai-ethics-tribunal':  { px: 0.86, py: 0.60 },
  'pm-simulator':        { px: 0.82, py: 0.76 },
  'ai-native-pm':        { px: 0.92, py: 0.68 },
  'ai-startup-simulator': { px: 0.90, py: 0.84 },
  'neural-networks':       { px: 0.20, py: 0.63 },
  'precision-recall':      { px: 0.22, py: 0.38 },
  'rag-under-the-hood':    { px: 0.75, py: 0.33 },
  'ai-in-production':      { px: 0.85, py: 0.46 },
  'alignment-game':        { px: 0.68, py: 0.80 },
  'choosing-ai-model':     { px: 0.31, py: 0.80 },
  'ollama':                { px: 0.23, py: 0.93 },
  'computer-vision':       { px: 0.10, py: 0.80 },
  'label-master':          { px: 0.90, py: 0.87 },
  'draw-and-deceive':      { px: 0.82, py: 0.90 },
  'agent-office':          { px: 0.78, py: 0.97 },
  'claude-code':           { px: 0.27, py: 1.00 },
}

/* Animation order follows signal flow: dendrites → soma → axon → terminals */
const NEURON_ANIM_ORDER = [
  // Dendrites
  'playground', 'how-llms-work', 'tokenizer', 'deep-learning', 'generation',
  // Soma
  'machine-learning', 'neural-networks', 'computer-vision', 'model-training', 'rag', 'fine-tuning', 'generative-ai', 'agentic-ai', 'precision-recall', 'rag-under-the-hood', 'ai-in-production',
  // Axon
  'prompt-heist', 'prompt-engineering', 'context-engineering', 'ai-safety', 'ai-fluency', 'choosing-ai-model', 'ollama', 'claude-code',
  // Terminals
  'ai-lab-explorer', 'ai-city-builder', 'token-budget', 'ai-ethics-tribunal', 'pm-simulator', 'ai-startup-simulator', 'alignment-game', 'ai-native-pm', 'label-master', 'draw-and-deceive', 'agent-office',
]

/* ── Force-directed layout to prevent node overlap ── */

function computeLayout(nodes, refW, refH, nodeR, attraction) {
  const repulsionDist = nodeR * 2 + 44
  const padX = nodeR + 24
  const padTop = Math.round(refH * 0.07)
  const padBottom = Math.round(refH * 0.08)

  const pos = nodes.map(n => ({
    id: n.id,
    x: n.px * refW,
    y: n.py * refH,
    origX: n.px * refW,
    origY: n.py * refH,
  }))

  for (let iter = 0; iter < 400; iter++) {
    let totalDelta = 0

    for (let i = 0; i < pos.length; i++) {
      for (let j = i + 1; j < pos.length; j++) {
        const dx = pos[j].x - pos[i].x
        const dy = pos[j].y - pos[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < repulsionDist && dist > 0.01) {
          const overlap = (repulsionDist - dist) / dist
          const fx = dx * overlap * 0.25
          const fy = dy * overlap * 0.25
          pos[i].x -= fx
          pos[i].y -= fy
          pos[j].x += fx
          pos[j].y += fy
          totalDelta += Math.abs(fx) + Math.abs(fy)
        }
      }
    }

    for (let i = 0; i < pos.length; i++) {
      pos[i].x += (pos[i].origX - pos[i].x) * attraction
      pos[i].y += (pos[i].origY - pos[i].y) * attraction
    }

    for (const p of pos) {
      p.x = Math.max(padX, Math.min(refW - padX, p.x))
      p.y = Math.max(padTop, Math.min(refH - padBottom, p.y))
    }

    if (totalDelta < 0.5) break
  }

  const result = {}
  for (const p of pos) {
    result[p.id] = { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 }
  }
  return result
}

/* ── Generate timing from an ordered node list ── */

function generateTiming(nodeDelays) {
  const connDelays = CONNECTIONS.map(([src, tgt]) =>
    Math.max(nodeDelays[src], nodeDelays[tgt]) + NODE_APPEAR_DUR
  )
  const dotDelays = connDelays.map(d => d + CONN_DRAW_DUR)
  const totalAnimTime = Math.max(...dotDelays) + 500
  return { connDelays, dotDelays, totalAnimTime }
}

/* ── Initial neuron layout ── */

function generateNeuronLayout() {
  for (const node of NODES) {
    const nPos = NEURON_LAYOUT[node.id]
    node.px = nPos.px
    node.py = nPos.py
  }
  const positions = computeLayout(NODES, REF_W, REF_H, NODE_RADIUS, 0.06)

  const nodeDelays = {}
  NEURON_ANIM_ORDER.forEach((id, i) => { nodeDelays[id] = i * 100 })

  return { positions, nodeDelays, ...generateTiming(nodeDelays) }
}

/* ── Random layout for replay ── */

function generateRandom() {
  for (const node of NODES) {
    node.px = 0.08 + Math.random() * 0.84
    node.py = 0.08 + Math.random() * 0.84
  }
  const positions = computeLayout(NODES, REF_W, REF_H, NODE_RADIUS, 0.02)

  const ids = NODES.map(n => n.id).sort(() => Math.random() - 0.5)
  const nodeDelays = {}
  ids.forEach((id, i) => { nodeDelays[id] = i * 120 })

  return { positions, nodeDelays, ...generateTiming(nodeDelays) }
}

const initialLayout = generateNeuronLayout()

function NeuralNetworkCanvas({ onSelectTab }) {
  const { isModuleLocked } = useAuth()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: REF_W, height: REF_H })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [clickedNode, setClickedNode] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [tooltip, setTooltip] = useState(null)

  // Layout + timing state
  const [layoutState, setLayoutState] = useState(initialLayout)
  const { positions: originalPositions, nodeDelays, connDelays, dotDelays, totalAnimTime } = layoutState

  // Drag state
  const [draggable, setDraggable] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [nodePositions, setNodePositions] = useState(initialLayout.positions)
  const [positionsModified, setPositionsModified] = useState(false)
  const [motionKey, setMotionKey] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [hintFading, setHintFading] = useState(false)

  const hasDragged = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const nodePositionsRef = useRef(nodePositions)
  nodePositionsRef.current = nodePositions

  // Measure container (for background canvas only)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function measure() {
      const rect = container.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Redraw key — bumped when theme changes to force canvas re-init
  const [canvasRedrawKey, setCanvasRedrawKey] = useState(0)

  // Listen for theme attribute changes and trigger canvas redraw
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCanvasRedrawKey(k => k + 1)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  // Background particles on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = dimensions
    if (width === 0) return

    const dpr = window.devicePixelRatio || 1

    // Set actual canvas pixel size accounting for DPR
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Canvas CSS size stays fixed
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    // Scale context so all drawing uses CSS pixels
    ctx.scale(dpr, dpr)

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    const fillColor = isDark ? 'rgba(168, 162, 158, 0.10)' : 'rgba(0, 113, 227, 0.08)'

    const particles = []
    for (let i = 0; i < PARTICLE_BG_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 1,
      })
    }

    let animId
    function loop() {
      // Reset transform before clearing to ensure full canvas is cleared
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = fillColor
        ctx.fill()
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [dimensions, canvasRedrawKey])

  // Enable dragging after entrance animation completes
  useEffect(() => {
    setDraggable(false)
    const timer = setTimeout(() => setDraggable(true), totalAnimTime)
    return () => clearTimeout(timer)
  }, [animKey, totalAnimTime])

  // Hint: show after animation, fade out after 3s
  useEffect(() => {
    setShowHint(false)
    setHintFading(false)
    const show = setTimeout(() => setShowHint(true), totalAnimTime)
    const fade = setTimeout(() => setHintFading(true), totalAnimTime + 3000)
    const hide = setTimeout(() => setShowHint(false), totalAnimTime + 3500)
    return () => { clearTimeout(show); clearTimeout(fade); clearTimeout(hide) }
  }, [animKey, totalAnimTime])

  // Convert screen coordinates to SVG viewBox coordinates
  const screenToSVG = useCallback((clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const rect = svg.getBoundingClientRect()
    const scale = Math.min(rect.width / REF_W, rect.height / REF_H)
    const offsetX = (rect.width - REF_W * scale) / 2
    const offsetY = (rect.height - REF_H * scale) / 2
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    }
  }, [])

  const connectedTo = useMemo(() => {
    if (!hoveredNode) return new Set()
    const set = new Set()
    for (const [a, b] of CONNECTIONS) {
      if (a === hoveredNode) set.add(b)
      if (b === hoveredNode) set.add(a)
    }
    return set
  }, [hoveredNode])

  const handleNodeClick = useCallback(
    (nodeId) => {
      setClickedNode(nodeId)
      setTimeout(() => {
        onSelectTab(nodeId)
        setClickedNode(null)
      }, 600)
    },
    [onSelectTab]
  )

  const handleNodeClickRef = useRef(handleNodeClick)
  handleNodeClickRef.current = handleNodeClick

  // Window event listeners during drag
  useEffect(() => {
    if (!draggingId) return

    const currentDragId = draggingId

    const onMouseMove = (e) => {
      hasDragged.current = true
      const svgPos = screenToSVG(e.clientX, e.clientY)
      setNodePositions(prev => ({
        ...prev,
        [currentDragId]: {
          x: Math.max(NODE_PADDING, Math.min(REF_W - NODE_PADDING, svgPos.x - dragOffset.current.x)),
          y: Math.max(NODE_PADDING, Math.min(REF_H - NODE_PADDING, svgPos.y - dragOffset.current.y)),
        },
      }))
    }

    const onMouseUp = () => {
      if (hasDragged.current) {
        setPositionsModified(true)
        setMotionKey(k => k + 1)
      } else {
        handleNodeClickRef.current(currentDragId)
      }
      setDraggingId(null)
    }

    const onTouchMove = (e) => {
      e.preventDefault()
      hasDragged.current = true
      const touch = e.touches[0]
      const svgPos = screenToSVG(touch.clientX, touch.clientY)
      setNodePositions(prev => ({
        ...prev,
        [currentDragId]: {
          x: Math.max(NODE_PADDING, Math.min(REF_W - NODE_PADDING, svgPos.x - dragOffset.current.x)),
          y: Math.max(NODE_PADDING, Math.min(REF_H - NODE_PADDING, svgPos.y - dragOffset.current.y)),
        },
      }))
    }

    const onTouchEnd = () => {
      if (hasDragged.current) {
        setPositionsModified(true)
        setMotionKey(k => k + 1)
      } else {
        handleNodeClickRef.current(currentDragId)
      }
      setDraggingId(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [draggingId, screenToSVG])

  const onNodeMouseDown = useCallback((e, nodeId) => {
    if (!draggable) return
    e.preventDefault()
    const svgPos = screenToSVG(e.clientX, e.clientY)
    hasDragged.current = false
    dragOffset.current = {
      x: svgPos.x - nodePositionsRef.current[nodeId].x,
      y: svgPos.y - nodePositionsRef.current[nodeId].y,
    }
    setDraggingId(nodeId)
    setHoveredNode(null)
    setTooltip(null)
    setShowHint(false)
  }, [draggable, screenToSVG])

  const onNodeTouchStart = useCallback((e, nodeId) => {
    if (!draggable) return
    const touch = e.touches[0]
    const svgPos = screenToSVG(touch.clientX, touch.clientY)
    hasDragged.current = false
    dragOffset.current = {
      x: svgPos.x - nodePositionsRef.current[nodeId].x,
      y: svgPos.y - nodePositionsRef.current[nodeId].y,
    }
    setDraggingId(nodeId)
    setHoveredNode(null)
    setTooltip(null)
    setShowHint(false)
  }, [draggable, screenToSVG])

  const handleReplay = useCallback(() => {
    const next = generateRandom()
    setLayoutState(next)
    setNodePositions(next.positions)
    setAnimKey((k) => k + 1)
    setDraggable(false)
    setPositionsModified(false)
    setMotionKey((k) => k + 1)
  }, [])

  const handleReset = useCallback(() => {
    const start = {}
    for (const node of NODES) {
      start[node.id] = { x: nodePositions[node.id].x, y: nodePositions[node.id].y }
    }
    setDraggable(false)
    const startTime = performance.now()
    const target = originalPositions

    function animate() {
      const t = Math.min((performance.now() - startTime) / 500, 1)
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const newPos = {}
      for (const node of NODES) {
        newPos[node.id] = {
          x: start[node.id].x + (target[node.id].x - start[node.id].x) * ease,
          y: start[node.id].y + (target[node.id].y - start[node.id].y) * ease,
        }
      }
      setNodePositions(newPos)
      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        setPositionsModified(false)
        setMotionKey((k) => k + 1)
        setDraggable(true)
      }
    }
    requestAnimationFrame(animate)
  }, [nodePositions, originalPositions])

  const { width, height } = dimensions // for background canvas
  const nodeRadius = NODE_RADIUS

  return (
    <div className="nn-canvas-container" ref={containerRef}>
      {/* Background particle canvas */}
      <canvas ref={canvasRef} className="nn-bg-canvas" />

      <svg
        ref={svgRef}
        key={animKey}
        className="nn-canvas-svg"
        viewBox={`0 0 ${REF_W} ${REF_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ cursor: draggingId ? 'grabbing' : undefined }}
      >
        <defs>
          {Object.entries(GROUP_COLORS).map(([group, color]) => (
            <filter key={group} id={`glow-${group}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feFlood floodColor={color} floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Connection lines with animated dots */}
        {CONNECTIONS.map(([sourceId, targetId], i) => {
          const source = nodePositions[sourceId]
          const target = nodePositions[targetId]
          if (!source || !target) return null

          const sourceNode = NODES.find((n) => n.id === sourceId)
          const color = GROUP_COLORS[sourceNode.group]
          const isHighlighted = hoveredNode === sourceId || hoveredNode === targetId
          const hoverOpacity = isHighlighted ? 0.8 : 0.3

          const dx = target.x - source.x
          const midX = source.x + dx * 0.5
          const path = `M ${source.x} ${source.y} C ${midX} ${source.y}, ${midX} ${target.y}, ${target.x} ${target.y}`

          const connDelay = connDelays[i]
          const dotDelay = dotDelays[i]

          return (
            <g key={`conn-${i}`}>
              {/* Line draws in via stroke-dashoffset */}
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={hoverOpacity}
                pathLength="1"
                className="nn-connection-line nn-conn-draw"
                style={{ animationDelay: `${connDelay}ms` }}
              />
              {/* Dots fade in after line is drawn */}
              <g
                key={`dots-${i}-${motionKey}`}
                className="nn-dots-appear"
                style={{ animationDelay: `${dotDelay}ms` }}
              >
                {[0, 1, 2].map((dotIndex) => (
                  <circle
                    key={`dot-${i}-${dotIndex}`}
                    r="3"
                    fill={color}
                    opacity={isHighlighted ? 0.9 : 0.5}
                    className="nn-traveling-dot"
                  >
                    <animateMotion
                      dur={`${3 + dotIndex * 0.5}s`}
                      repeatCount="indefinite"
                      begin={`${dotIndex * 1}s`}
                      path={path}
                    />
                  </circle>
                ))}
              </g>
            </g>
          )
        })}

        {/* Nodes — outer: translate, middle: entrance anim, inner: hover/click */}
        {NODES.map((node) => {
          const pos = nodePositions[node.id]
          if (!pos) return null
          const color = GROUP_COLORS[node.group]
          const locked = isModuleLocked(node.id)
          const isDragging = draggingId === node.id
          const isHovered = hoveredNode === node.id && !isDragging
          const isConnected = connectedTo.has(node.id) && !isDragging
          const isClicked = clickedNode === node.id
          const enterDelay = nodeDelays[node.id]

          const nodeCursor = draggable
            ? (isDragging ? 'grabbing' : 'grab')
            : 'pointer'

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => {
                if (draggingId) return
                setHoveredNode(node.id)
                const svg = svgRef.current
                if (svg) {
                  const svgRect = svg.getBoundingClientRect()
                  // Account for preserveAspectRatio="xMidYMid meet" letterboxing
                  const scale = Math.min(svgRect.width / REF_W, svgRect.height / REF_H)
                  const offsetX = (svgRect.width - REF_W * scale) / 2
                  const offsetY = (svgRect.height - REF_H * scale) / 2
                  let tx = svgRect.left + offsetX + pos.x * scale
                  let ty = svgRect.top + offsetY + pos.y * scale + nodeRadius * scale + 8
                  // Clamp tooltip within viewport
                  const tooltipW = 200 // max-width from CSS
                  const tooltipH = 48  // approximate height
                  const pad = 8
                  tx = Math.max(tooltipW / 2 + pad, Math.min(window.innerWidth - tooltipW / 2 - pad, tx))
                  // If tooltip would go below viewport, show it above the node
                  if (ty + tooltipH > window.innerHeight - pad) {
                    ty = svgRect.top + offsetY + pos.y * scale - nodeRadius * scale - tooltipH - 8
                  }
                  setTooltip({ text: node.desc, x: tx, y: ty })
                }
              }}
              onMouseLeave={() => {
                if (draggingId) return
                setHoveredNode(null)
                setTooltip(null)
              }}
              onMouseDown={(e) => onNodeMouseDown(e, node.id)}
              onTouchStart={(e) => onNodeTouchStart(e, node.id)}
              onClick={() => {
                if (draggable) return
                handleNodeClick(node.id)
              }}
              style={{ cursor: nodeCursor }}
            >
              {/* Entrance animation wrapper */}
              <g
                className="nn-node-appear"
                style={{ animationDelay: `${enterDelay}ms` }}
              >
                {/* Interaction wrapper */}
                <g className={`nn-node-inner ${isDragging ? 'nn-node-dragging' : (isHovered ? 'nn-node-hovered' : '')} ${isConnected ? 'nn-node-connected' : ''} ${isClicked ? 'nn-node-clicked' : ''}`} >
                  {/* Click ripple effect */}
                  {isClicked && (
                    <circle
                      r={nodeRadius}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      className="nn-node-ripple"
                    >
                      <animate attributeName="r" from={String(nodeRadius)} to="48" dur="0.6s" fill="freeze" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="0.6s" fill="freeze" />
                    </circle>
                  )}

                  {/* Glow on click */}
                  {isClicked && (
                    <circle
                      r={nodeRadius + 8}
                      fill="none"
                      stroke={color}
                      strokeWidth="3"
                      className="nn-node-glow"
                      filter={`url(#glow-${node.group})`}
                    />
                  )}

                  {/* Group color ring */}
                  <circle
                    r={nodeRadius + 3}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered || isDragging ? 3 : 2}
                    opacity={isHovered || isConnected || isDragging ? 1 : 0.6}
                    className="nn-node-ring"
                  />

                  {/* Node background */}
                  <circle
                    r={nodeRadius + 2}
                    className={`nn-node-bg ${isHovered ? 'nn-node-bg-hover' : ''} ${isDragging ? 'nn-node-bg-dragging' : ''}`}
                  />

                  {/* Module icon */}
                  <foreignObject x="-10" y="-10" width="20" height="20">
                    <ModuleIcon module={node.id} size={20} className={isHovered ? 'module-icon-active' : ''} style={{ color }} />
                  </foreignObject>

                  {/* Label below node */}
                  <text
                    y={nodeRadius + 14}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="700"
                    className="nn-node-label"
                  >
                    {node.label}
                  </text>

                  {/* Lock badge for unauthenticated users */}
                  {locked && (
                    <g transform={`translate(${nodeRadius - 2}, ${-nodeRadius + 2})`}>
                      <circle r="7" fill="var(--bg-primary, #fff)" stroke="var(--border, #d2d2d7)" strokeWidth="1" />
                      <svg x="-4.5" y="-4.5" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary, #86868b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </g>
                  )}

                </g>
              </g>
            </g>
          )
        })}
      </svg>

      {/* Bottom buttons */}
      <div className="nn-bottom-buttons">
        <button className="nn-replay-btn" onClick={handleReplay}>
          Replay
        </button>
        {positionsModified && (
          <button className="nn-replay-btn nn-reset-btn" onClick={handleReset}>
            Reset Layout
          </button>
        )}
      </div>

      {/* Drag hint */}
      {showHint && (
        <div className={`nn-drag-hint ${hintFading ? 'nn-drag-hint-out' : ''}`}>
          Drag the nodes to explore
        </div>
      )}


      {/* Portal tooltip */}
      {tooltip && createPortal(
        <div
          className="nn-portal-tooltip"
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateX(-50%)',
          }}
        >
          {tooltip.text}
        </div>,
        document.body
      )}
    </div>
  )
}

export default NeuralNetworkCanvas
