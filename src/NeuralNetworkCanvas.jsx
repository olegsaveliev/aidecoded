import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import './NeuralNetworkCanvas.css'

const GROUP_COLORS = {
  tools: '#0071E3',
  foundations: '#AF52DE',
  skills: '#34C759',
  advanced: '#FF9500',
}

const NODES = [
  // Tools cluster (top-left area)
  { id: 'playground', emoji: '\u{1F4AC}', label: 'Playground', group: 'tools', px: 0.12, py: 0.25, desc: 'Chat with AI and tune parameters in real time' },
  { id: 'tokenizer', emoji: '\u{1F524}', label: 'Tokenizer', group: 'tools', px: 0.08, py: 0.50, desc: 'See how AI reads your text as tokens' },
  { id: 'generation', emoji: '\u26A1', label: 'Generation', group: 'tools', px: 0.18, py: 0.72, desc: 'Watch AI predict the next word live' },
  // Foundations cluster (center)
  { id: 'how-llms-work', emoji: '\u{1F9E0}', label: 'How LLMs Work', group: 'foundations', px: 0.38, py: 0.20, desc: 'An interactive journey inside AI' },
  { id: 'machine-learning', emoji: '\u{1F916}', label: 'Machine Learning', group: 'foundations', px: 0.32, py: 0.62, desc: 'How machines learn from data' },
  // Advanced cluster (center-right)
  { id: 'model-training', emoji: '\u{1F3D7}\uFE0F', label: 'Model Training', group: 'foundations', px: 0.58, py: 0.30, desc: 'How AI models are built from scratch' },
  { id: 'rag', emoji: '\u{1F50D}', label: 'RAG', group: 'advanced', px: 0.62, py: 0.65, desc: 'How AI learns from YOUR documents' },
  // Skills cluster (right side)
  { id: 'prompt-engineering', emoji: '\u270D\uFE0F', label: 'Prompt Eng.', group: 'skills', px: 0.82, py: 0.22, desc: 'Write better prompts for better results' },
  { id: 'context-engineering', emoji: '\u{1F9E9}', label: 'Context Eng.', group: 'skills', px: 0.85, py: 0.60, desc: 'Give AI the right context every time' },
]

const CONNECTIONS = [
  ['playground', 'how-llms-work'],
  ['playground', 'prompt-engineering'],
  ['tokenizer', 'how-llms-work'],
  ['tokenizer', 'machine-learning'],
  ['generation', 'how-llms-work'],
  ['machine-learning', 'model-training'],
  ['machine-learning', 'rag'],
  ['how-llms-work', 'model-training'],
  ['how-llms-work', 'rag'],
  ['how-llms-work', 'context-engineering'],
  ['model-training', 'prompt-engineering'],
  ['rag', 'context-engineering'],
  ['prompt-engineering', 'context-engineering'],
]

/* ── Animation timing (ms) ── */

const NODE_DELAYS = {
  'playground': 0,
  'tokenizer': 200,
  'generation': 400,
  'how-llms-work': 700,
  'machine-learning': 900,
  'model-training': 1200,
  'rag': 1400,
  'prompt-engineering': 1700,
  'context-engineering': 1900,
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

function NeuralNetworkCanvas({ onSelectTab }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 960, height: 480 })
  const [hoveredNode, setHoveredNode] = useState(null)
  const [clickedNode, setClickedNode] = useState(null)
  const [animKey, setAnimKey] = useState(0)
  const [tooltip, setTooltip] = useState(null)

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

  const nodePositions = useMemo(() => {
    const map = {}
    for (const node of NODES) {
      map[node.id] = { x: node.px * REF_W, y: node.py * REF_H }
    }
    return map
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

  const handleReplay = useCallback(() => {
    setAnimKey((k) => k + 1)
  }, [])

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
          const isHovered = hoveredNode === node.id
          const isConnected = connectedTo.has(node.id)
          const isClicked = clickedNode === node.id
          const enterDelay = NODE_DELAYS[node.id]

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              onMouseEnter={() => {
                setHoveredNode(node.id)
                const svg = svgRef.current
                if (svg) {
                  const svgRect = svg.getBoundingClientRect()
                  const scaleX = svgRect.width / REF_W
                  const scaleY = svgRect.height / REF_H
                  setTooltip({
                    text: node.desc,
                    x: svgRect.left + pos.x * scaleX,
                    y: svgRect.top + pos.y * scaleY + nodeRadius * scaleY + 8,
                  })
                }
              }}
              onMouseLeave={() => {
                setHoveredNode(null)
                setTooltip(null)
              }}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Entrance animation wrapper */}
              <g
                className="nn-node-appear"
                style={{ animationDelay: `${enterDelay}ms` }}
              >
                {/* Interaction wrapper */}
                <g className={`nn-node-inner ${isHovered ? 'nn-node-hovered' : ''} ${isConnected ? 'nn-node-connected' : ''} ${isClicked ? 'nn-node-clicked' : ''}`}>
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
                    strokeWidth={isHovered ? 3 : 2}
                    opacity={isHovered || isConnected ? 1 : 0.6}
                    className="nn-node-ring"
                  />

                  {/* Node background */}
                  <circle
                    r={nodeRadius}
                    className={`nn-node-bg ${isHovered ? 'nn-node-bg-hover' : ''}`}
                  />

                  {/* Emoji */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="24"
                    className="nn-node-emoji"
                  >
                    {node.emoji}
                  </text>

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

                </g>
              </g>
            </g>
          )
        })}
      </svg>

      {/* Replay button */}
      <button className="nn-replay-btn" onClick={handleReplay}>
        {'\u25B6'} Replay
      </button>

      {/* Mobile fallback grid */}
      <div className="nn-mobile-grid">
        {NODES.map((node) => (
          <button
            key={node.id}
            className="nn-mobile-card"
            onClick={() => onSelectTab(node.id)}
          >
            <span
              className="nn-mobile-card-dot"
              style={{ background: GROUP_COLORS[node.group] }}
            />
            <span className="nn-mobile-card-label">{node.label}</span>
          </button>
        ))}
      </div>

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
