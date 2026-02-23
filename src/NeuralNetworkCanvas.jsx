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
}

const NODES = [
  // Layer 1 — Input (Tools): 3 nodes
  { id: 'playground', label: 'Playground', group: 'tools', px: 0.08, py: 0.18, desc: 'Chat with AI and tune parameters in real time' },
  { id: 'tokenizer', label: 'Tokenizer', group: 'tools', px: 0.08, py: 0.48, desc: 'See how AI reads your text as tokens' },
  { id: 'generation', label: 'Generation', group: 'tools', px: 0.08, py: 0.78, desc: 'Watch AI predict the next word live' },
  // Layer 2 — Hidden (Foundations core): 3 nodes
  { id: 'how-llms-work', label: 'How LLMs Work', group: 'foundations', px: 0.30, py: 0.18, desc: 'An interactive journey inside AI' },
  { id: 'deep-learning', label: 'Deep Learning', group: 'foundations', px: 0.30, py: 0.48, desc: 'Neural networks powering every AI breakthrough' },
  { id: 'machine-learning', label: 'Machine Learning', group: 'foundations', px: 0.30, py: 0.78, desc: 'How machines learn from data' },
  // Layer 3 — Hidden (Applied): 4 nodes
  { id: 'model-training', label: 'Model Training', group: 'foundations', px: 0.52, py: 0.12, desc: 'How AI models are built from scratch' },
  { id: 'fine-tuning', label: 'Fine-Tuning', group: 'foundations', px: 0.52, py: 0.38, desc: 'Turn a general AI into a domain expert' },
  { id: 'rag', label: 'RAG', group: 'advanced', px: 0.52, py: 0.64, desc: 'How AI learns from YOUR documents' },
  { id: 'prompt-heist', label: 'Prompt Heist', group: 'play', px: 0.52, py: 0.86, desc: 'Outsmart AI security with the perfect prompt' },
  // Layer 4 — Output (Skills + Play): 4 nodes
  { id: 'prompt-engineering', label: 'Prompt Eng.', group: 'skills', px: 0.78, py: 0.12, desc: 'Write better prompts for better results' },
  { id: 'context-engineering', label: 'Context Eng.', group: 'skills', px: 0.78, py: 0.38, desc: 'Give AI the right context every time' },
  { id: 'ai-lab-explorer', label: 'Lab Explorer', group: 'play', px: 0.78, py: 0.64, desc: 'Explore an AI research lab room by room' },
  { id: 'ai-city-builder', label: 'City Builder', group: 'play', px: 0.78, py: 0.86, desc: 'Solve AI mysteries, build your city' },
  { id: 'token-budget', label: 'Token Budget', group: 'play', px: 0.42, py: 0.92, desc: 'Rewrite prompts to fit strict token budgets' },
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
  ['machine-learning', 'fine-tuning'],
  ['machine-learning', 'rag'],
  ['machine-learning', 'prompt-heist'],
  // Layer 3 → Layer 4
  ['model-training', 'prompt-engineering'],
  ['model-training', 'context-engineering'],
  ['fine-tuning', 'context-engineering'],
  ['fine-tuning', 'ai-lab-explorer'],
  ['rag', 'context-engineering'],
  ['rag', 'ai-lab-explorer'],
  ['prompt-heist', 'ai-city-builder'],
  ['prompt-heist', 'ai-lab-explorer'],
  ['prompt-heist', 'token-budget'],
  ['tokenizer', 'token-budget'],
]

/* ── Animation timing (ms) ── */

const NODE_DELAYS = {
  // Layer 1
  'playground': 0,
  'tokenizer': 150,
  'generation': 300,
  // Layer 2
  'how-llms-work': 600,
  'deep-learning': 750,
  'machine-learning': 900,
  // Layer 3
  'model-training': 1200,
  'fine-tuning': 1350,
  'rag': 1500,
  'prompt-heist': 1650,
  // Layer 4
  'prompt-engineering': 1900,
  'context-engineering': 2050,
  'ai-lab-explorer': 2200,
  'ai-city-builder': 2350,
  'token-budget': 1800,
}

const NODE_APPEAR_DUR = 500
const CONN_DRAW_DUR = 500

const CONN_DELAYS = CONNECTIONS.map(([src, tgt]) =>
  Math.max(NODE_DELAYS[src], NODE_DELAYS[tgt]) + NODE_APPEAR_DUR
)

const DOT_DELAYS = CONN_DELAYS.map((d) => d + CONN_DRAW_DUR)

/* ── Layout helpers ── */

const REF_W = 960
const REF_H = 480

const PARTICLE_BG_COUNT = 35

/* ── Drag constants ── */

const TOTAL_ANIM_TIME = Math.max(...DOT_DELAYS) + 500
const NODE_PADDING = 30

const ORIGINAL_POSITIONS = {}
for (const node of NODES) {
  ORIGINAL_POSITIONS[node.id] = { x: node.px * REF_W, y: node.py * REF_H }
}

function NeuralNetworkCanvas({ onSelectTab }) {
  const { isModuleLocked } = useAuth()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 960, height: 480 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [clickedNode, setClickedNode] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [tooltip, setTooltip] = useState(null)

  // Drag state
  const [draggable, setDraggable] = useState(false)
  const [draggingId, setDraggingId] = useState(null)
  const [nodePositions, setNodePositions] = useState(ORIGINAL_POSITIONS)
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
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const fillColor = isDark ? 'rgba(168, 162, 158, 0.10)' : 'rgba(0, 113, 227, 0.08)'

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
  }, [dimensions])

  // Enable dragging after entrance animation completes
  useEffect(() => {
    setDraggable(false)
    const timer = setTimeout(() => setDraggable(true), TOTAL_ANIM_TIME)
    return () => clearTimeout(timer)
  }, [animKey])

  // Hint: show after animation, fade out after 3s
  useEffect(() => {
    setShowHint(false)
    setHintFading(false)
    const show = setTimeout(() => setShowHint(true), TOTAL_ANIM_TIME)
    const fade = setTimeout(() => setHintFading(true), TOTAL_ANIM_TIME + 3000)
    const hide = setTimeout(() => setShowHint(false), TOTAL_ANIM_TIME + 3500)
    return () => { clearTimeout(show); clearTimeout(fade); clearTimeout(hide) }
  }, [animKey])

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
    setAnimKey((k) => k + 1)
    setDraggable(false)
    setNodePositions(ORIGINAL_POSITIONS)
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

    function animate() {
      const t = Math.min((performance.now() - startTime) / 500, 1)
      // easeInOutQuad
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const newPos = {}
      for (const node of NODES) {
        newPos[node.id] = {
          x: start[node.id].x + (ORIGINAL_POSITIONS[node.id].x - start[node.id].x) * ease,
          y: start[node.id].y + (ORIGINAL_POSITIONS[node.id].y - start[node.id].y) * ease,
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
  }, [nodePositions])

  const { width, height } = dimensions // for background canvas
  const nodeRadius = 32

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

          const connDelay = CONN_DELAYS[i]
          const dotDelay = DOT_DELAYS[i]

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
          const enterDelay = NODE_DELAYS[node.id]

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
                      <animate attributeName="r" from={String(nodeRadius)} to="60" dur="0.6s" fill="freeze" />
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
                  <foreignObject x="-12" y="-12" width="24" height="24">
                    <ModuleIcon module={node.id} size={24} className={isHovered ? 'module-icon-active' : ''} style={{ color }} />
                  </foreignObject>

                  {/* Label below node */}
                  <text
                    y={nodeRadius + 16}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    className="nn-node-label"
                  >
                    {node.label}
                  </text>

                  {/* Lock badge for unauthenticated users */}
                  {locked && (
                    <g transform={`translate(${nodeRadius - 4}, ${-nodeRadius + 4})`}>
                      <circle r="8" fill="var(--bg-primary, #fff)" stroke="var(--border, #d2d2d7)" strokeWidth="1" />
                      <svg x="-5" y="-5" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary, #86868b)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
