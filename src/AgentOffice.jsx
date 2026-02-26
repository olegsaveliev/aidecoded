import { useState, useEffect, useRef, useCallback } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { TipIcon, CheckIcon, CrossIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import './AgentOffice.css'

/* ══════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════ */

const COLS = 20
const ROWS = 14
const TILE_DESKTOP = 32
const TILE_TABLET = 24
const TILE_MOBILE = 20

/* ── Tile types ── */
const T_FLOOR = 0
const T_WALL = 1
const T_DESK_A = 2 // Haiku
const T_DESK_B = 3 // Sonnet
const T_DESK_C = 4 // Opus
const T_DESK_D = 5 // Scout
const T_SERVER = 6
const T_WHITEBOARD = 7
const T_COFFEE = 8
const T_INBOX = 9
const T_MEETING = 10
const T_PLANT = 11

/* ── Office map ── */
function buildOfficeMap() {
  const m = Array.from({ length: ROWS }, () => Array(COLS).fill(T_FLOOR))
  // Walls — top edge
  for (let c = 0; c < COLS; c++) m[0][c] = T_WALL
  // Desks
  m[3][2] = T_DESK_A; m[3][3] = T_DESK_A
  m[3][8] = T_DESK_B; m[3][9] = T_DESK_B
  m[3][14] = T_DESK_C; m[3][15] = T_DESK_C
  m[9][2] = T_DESK_D; m[9][3] = T_DESK_D
  // Server rack
  m[2][18] = T_SERVER; m[2][19] = T_SERVER
  m[3][18] = T_SERVER; m[3][19] = T_SERVER
  m[4][18] = T_SERVER; m[4][19] = T_SERVER
  // Whiteboard
  m[2][10] = T_WHITEBOARD; m[2][11] = T_WHITEBOARD; m[2][12] = T_WHITEBOARD
  // Coffee
  m[9][17] = T_COFFEE
  // Inbox tray
  m[11][5] = T_INBOX; m[11][6] = T_INBOX; m[11][7] = T_INBOX
  // Meeting area
  for (let r = 9; r <= 12; r++) for (let c = 9; c <= 13; c++) m[r][c] = T_MEETING
  // Plant
  m[12][1] = T_PLANT
  return m
}

const OFFICE_MAP = buildOfficeMap()

/* ── Agent definitions ── */
const AGENTS = [
  {
    id: 'haiku',
    name: 'Haiku',
    title: 'The Sprinter',
    color: '#FDE047',
    deskCol: 2, deskRow: 4,
    walkSpeed: 2,
    delayMin: 600, delayMax: 900,
    strength: 'Quick tasks, summaries, simple Q&A',
    weakness: 'Complex reasoning (too brief)',
    personality: 'You are Haiku, a fast AI assistant. IMPORTANT: Keep ALL responses under 3 sentences. Be extremely concise. No preamble, no "I will...", no "Great question!". Start answering immediately.',
    sprite: { cap: '#FDE047', jacket: '#3B82F6', face: '#FBBF24', legs: '#374151' },
  },
  {
    id: 'sonnet',
    name: 'Sonnet',
    title: 'The Workhorse',
    color: '#34C759',
    deskCol: 8, deskRow: 4,
    walkSpeed: 1.5,
    delayMin: 1200, delayMax: 1800,
    strength: 'Almost everything &mdash; the reliable default',
    weakness: 'None obvious',
    personality: 'You are Sonnet, a balanced AI assistant. Provide clear, well-structured responses. Use brief headers for multi-part answers. Be thorough but concise. 3-8 sentences typical.',
    sprite: { hair: '#374151', hoodie: '#34C759', face: '#FBBF24', legs: '#1F2937' },
  },
  {
    id: 'opus',
    name: 'Opus',
    title: 'The Architect',
    color: '#5856D6',
    deskCol: 14, deskRow: 4,
    walkSpeed: 1,
    delayMin: 2500, delayMax: 3500,
    strength: 'Complex reasoning, architecture, analysis',
    weakness: 'Overkill for simple tasks (slow + verbose)',
    personality: 'You are Opus, a thorough analytical AI. Think carefully and thoroughly before responding. Consider edge cases, trade-offs, and implications. Provide comprehensive analysis. Structure complex answers with headers and detail.',
    sprite: { robe: '#5856D6', beard: '#9CA3AF', face: '#FBBF24', glasses: '#FFFFFF' },
  },
  {
    id: 'scout',
    name: 'Scout',
    title: 'The Researcher',
    color: '#FF9500',
    deskCol: 2, deskRow: 10,
    walkSpeed: 1.5,
    delayMin: 1800, delayMax: 2400,
    strength: 'Research, information gathering, synthesis',
    weakness: 'Code tasks (defers to specialist)',
    personality: 'You are Scout, a research-focused AI assistant. You excel at gathering and synthesizing information. Always structure findings clearly with: Key findings (bullet points), Sources considered (even if simulated), Confidence level. If asked to write code or do technical implementation, respond: "Research complete, but implementation requires a different specialist agent. Here is what I found:" followed by your findings.',
    sprite: { cap: '#EF4444', jacket: '#6B7280', face: '#FBBF24', legs: '#374151' },
  },
]

const TOOLS = [
  { id: 'read', name: 'Read Files', icon: 'magnifier', desc: 'File Reader (can access file system)' },
  { id: 'write', name: 'Write Files', icon: 'pencil', desc: 'File Writer (can write and save files)' },
  { id: 'bash', name: 'Run Commands', icon: 'lightning', desc: 'Command Runner (can execute bash)' },
  { id: 'web', name: 'Web Search', icon: 'globe', desc: 'Web Search (can search the internet)' },
]

/* ── Level data ── */
const LEVELS = [
  {
    id: 1,
    title: 'The First Task',
    concept: 'What is an agent?',
    difficulty: 1,
    client: 'TechFlow Inc.',
    category: 'Writing',
    task: 'Summarize our product "DataSync" in 2 sentences for a non-technical audience.',
    multiAgent: false,
    requiredTools: [],
    criteria: 'Must be exactly 2 sentences. Must be understandable by a non-technical person. Must mention what DataSync does. Vague or generic output = fail.',
    minInstructionWords: 5,
    hint: {
      agent: 'Haiku or Sonnet',
      tools: 'None needed — this is a writing task',
      instructions: 'Summarize DataSync in exactly 2 clear sentences for a non-technical audience. Focus on the benefit, not the technology.',
    },
    learnTitle: 'What is an agent?',
    learnText: 'An AI agent is not just a chatbot that answers questions. It is an AI given a task, tools to act with, and a loop: plan what to do, use a tool, observe the result, decide next step. Your agent just completed its first agentic loop: received task, planned response, produced output, done.',
    conceptPill: 'Agentic Loop',
  },
  {
    id: 2,
    title: 'Tools Matter',
    concept: 'Tools define capability',
    difficulty: 1,
    client: 'BuildRight Corp.',
    category: 'Research',
    task: 'Read our codebase README and tell us if it mentions the installation instructions.',
    requiredTools: ['read'],
    multiAgent: false,
    criteria: 'Must demonstrate that the agent actually read a file. Must give a specific answer about installation instructions (yes/no with details). Generic answers without file content = fail.',
    minInstructionWords: 5,
    hint: {
      agent: 'Any agent works',
      tools: 'Enable "Read Files" — the task requires reading a file',
      instructions: 'Read the README file and check whether it contains installation instructions. Report what you find.',
    },
    learnTitle: 'Tools = Capabilities',
    learnText: 'An AI agent can only do what its tools allow. Without a file-reading tool, no amount of intelligence helps — the agent literally cannot access the data. This is why every agentic system design starts with: what does this agent need to be able to DO? Tools define the boundary of the possible.',
    conceptPill: 'Tools',
  },
  {
    id: 3,
    title: 'Instructions Are Everything',
    concept: 'Prompt quality determines output quality',
    difficulty: 2,
    client: 'Nova Ventures',
    category: 'Writing',
    task: 'Write a subject line for our product launch email. Product: "FlowBoard" — a project management tool for remote teams.',
    multiAgent: false,
    requiredTools: [],
    criteria: 'Judge STRICTLY based on instruction quality. If user instructions are fewer than 15 words or say just "write the subject line" = 1 star max. Must specify at least 2 of: audience, tone, format, length constraint. 3 stars only if instructions mention all of: target audience, tone, format, and constraints.',
    minInstructionWords: 3,
    templates: [
      { quality: 'bad', label: 'Vague', text: 'write the subject line' },
      { quality: 'ok', label: 'Better', text: 'Write a compelling email subject line for FlowBoard\'s launch' },
      { quality: 'good', label: 'Clear', text: 'Write 3 alternative subject line options for FlowBoard\'s launch email. Target audience: remote team managers aged 30-45 who are frustrated with scattered tools. Tone: confident, benefit-focused. Max 60 characters each. No clickbait.' },
    ],
    hint: {
      agent: 'Sonnet (balanced writer)',
      tools: 'None needed',
      instructions: 'Use the "Clear" template above — it specifies audience, tone, format, and constraints. That is the difference between 1 star and 3.',
    },
    learnTitle: 'Instructions Are Your Interface',
    learnText: 'The quality of an agent\'s output is almost entirely determined by the quality of its instructions. Vague in, vague out. Specific context + clear constraints + explicit format = reliable output. This is why "prompt engineering" is a real skill. The agent is not magic — it does exactly what you specify, no more and no less.',
    conceptPill: 'Instructions',
  },
  {
    id: 4,
    title: 'The Right Agent',
    concept: 'Match agent to task',
    difficulty: 3,
    client: 'MediCore Systems',
    category: 'Analysis',
    task: 'Analyze the architectural trade-offs between a microservices approach vs. monolith for a hospital records system handling 10M patients. Consider: security, scalability, maintenance, and regulatory compliance.',
    multiAgent: false,
    bestAgent: 'opus',
    requiredTools: ['read', 'web'],
    criteria: 'Must cover ALL 4 areas: security, scalability, maintenance, regulatory compliance. Must compare both approaches (microservices vs monolith). Must include a recommendation. Shallow or generic analysis = 1 star. Missing any of the 4 areas = max 2 stars.',
    minInstructionWords: 10,
    hint: {
      agent: 'Opus — this task needs deep analysis, not speed',
      tools: 'Enable Read Files + Web Search — the agent needs to research and read existing docs',
      instructions: 'Analyze microservices vs monolith for a hospital records system (10M patients). Cover security, scalability, maintenance, and regulatory compliance. Structure with clear sections and a final recommendation.',
    },
    learnTitle: 'Agent Capability Matching',
    learnText: 'Not every agent is right for every task. Haiku is fast and great for simple tasks — but shallow on complex analysis. Opus is thorough but slow and overkill for a two-sentence summary. Matching task complexity to agent capability is a core skill in multi-agent system design. In real systems this is called "routing."',
    conceptPill: 'Agent Routing',
  },
  {
    id: 5,
    title: 'Two Agents, One Goal',
    concept: 'Multi-agent handoff',
    difficulty: 3,
    client: 'GrowthLab',
    category: 'Research + Writing',
    task: 'Research the top 3 competitor products in the project management space, then write a competitive analysis report with recommendations.',
    multiAgent: true,
    slots: 2,
    slotLabels: ['Research', 'Write Report'],
    requiredToolsBySlot: [['web'], ['write']],
    criteria: 'Slot 1 must name at least 3 specific competitor products with concrete details. Slot 2 must reference findings from Slot 1 and include clear recommendations. Generic lists without specifics = 1 star. Each slot judged independently.',
    minInstructionWords: 5,
    hint: {
      agent: 'Slot 1: Scout (researcher). Slot 2: Sonnet (writer)',
      tools: 'Slot 1: Web Search. Slot 2: Write Files',
      instructions: 'Slot 1: "Research top 3 competitors to FlowBoard: Asana, Monday.com, Notion. Key features, pricing, weaknesses." Slot 2: "Using the research, write a competitive analysis with Overview, Comparison, Recommendations."',
    },
    learnTitle: 'Multi-Agent Pipelines',
    learnText: 'Complex tasks often decompose into specialist subtasks. A research agent is optimised for gathering information. A writing agent is optimised for synthesis. Running them sequentially — where each agent\'s output becomes the next agent\'s input — is called a pipeline. This is how most production agentic systems work: not one agent doing everything, but specialist agents handing off to each other.',
    conceptPill: 'Pipeline',
  },
  {
    id: 6,
    title: 'BOSS: The Full Office',
    concept: 'Parallel agents + sub-agents',
    difficulty: 5,
    client: 'Apex Corporation',
    category: 'Multi-stream',
    task: 'Launch a complete product microsite. Simultaneously need: (1) Product copy written, (2) Competitive research done, (3) Technical implementation plan. All due at the same time.',
    multiAgent: true,
    slots: 3,
    slotLabels: ['Product Copy', 'Research', 'Technical Plan'],
    urgent: true,
    requiredToolsBySlot: [['write'], ['web'], ['read']],
    criteria: 'Each slot must produce output specific to its role (copy, research, technical). Copy must have marketing language. Research must name competitors. Technical must mention technologies/architecture. Generic text that could fit any slot = 1 star. Each slot judged independently.',
    minInstructionWords: 5,
    hint: {
      agent: 'Slot 1: Sonnet (copy). Slot 2: Scout (research). Slot 3: Opus (technical)',
      tools: 'Slot 1: Write Files. Slot 2: Web Search. Slot 3: Read Files',
      instructions: 'Match each specialist to their strength. Give each slot specific, detailed instructions about what to produce. All three run in parallel.',
    },
    learnTitle: 'Parallel Agents + Sub-Agents',
    learnText: 'The most powerful pattern in agentic AI: run independent work streams simultaneously. Three agents working in parallel finish 3x faster than one agent working sequentially. Sub-agents take it further — an agent can spawn child agents for focused subtasks, collect their results, and synthesise. This is the architecture behind the most powerful AI systems in production today.',
    conceptPill: 'Parallel',
  },
]

const CONCEPTS_LEARNED = [
  'Agentic Loop', 'Tools', 'Instructions',
  'Agent Routing', 'Pipeline', 'Parallel',
  'Sub-agents', 'Orchestration',
]

/* ══════════════════════════════════════════
   STAR DISPLAY
   ══════════════════════════════════════════ */

function StarDisplay({ count, total = 3, animate }) {
  return (
    <div className="ao-stars">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`ao-star ${i < count ? 'ao-star-earned' : ''}`}
          style={animate && i < count ? { animationDelay: `${i * 0.15}s` } : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════
   PIXEL OFFICE CANVAS
   ══════════════════════════════════════════ */

function PixelOfficeCanvas({ agentStates, agentPositions, taskName, tileSize }) {
  const canvasRef = useRef(null)
  const frameRef = useRef(null)
  const walkFrameRef = useRef(0)
  const workFrameRef = useRef(0)
  const tickRef = useRef(0)
  const sizeSetRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const ts = tileSize
    const w = COLS * ts
    const h = ROWS * ts

    // Set canvas size only when dimensions change (avoids reset flicker)
    const sizeKey = `${w}x${h}x${dpr}`
    if (sizeSetRef.current !== sizeKey) {
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      sizeSetRef.current = sizeKey
    }

    const ctx = canvas.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.imageSmoothingEnabled = false // crisp pixel art
    ctx.clearRect(0, 0, w, h)

    tickRef.current++
    if (tickRef.current % 9 === 0) walkFrameRef.current = (walkFrameRef.current + 1) % 4
    if (tickRef.current % 24 === 0) workFrameRef.current = (workFrameRef.current + 1) % 2

    // 1. Floor — warm wood
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const checker = (r + c) % 2 === 0
        ctx.fillStyle = checker ? '#F5F0E8' : '#EDE8DC'
        ctx.fillRect(c * ts, r * ts, ts, ts)
        // Subtle grain line
        ctx.fillStyle = checker ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.02)'
        ctx.fillRect(c * ts, r * ts + Math.floor(ts * 0.45), ts, 1)
      }
    }
    // Grid lines on top of all floor tiles
    ctx.strokeStyle = 'rgba(0,0,0,0.05)'
    ctx.lineWidth = 0.5
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath(); ctx.moveTo(0, r * ts); ctx.lineTo(w, r * ts); ctx.stroke()
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath(); ctx.moveTo(c * ts, 0); ctx.lineTo(c * ts, h); ctx.stroke()
    }

    // 2. Walls — brick pattern
    for (let c = 0; c < COLS; c++) {
      ctx.fillStyle = '#374151'
      ctx.fillRect(c * ts, 0, ts, ts)
      // Brick lines
      ctx.fillStyle = '#4B5563'
      ctx.fillRect(c * ts, 0, ts, 1.5) // top highlight
      ctx.fillRect(c * ts, Math.floor(ts * 0.5), ts, 0.5) // mortar line
      // Vertical mortar every other tile
      if (c % 2 === 0) {
        ctx.fillRect(c * ts + Math.floor(ts * 0.5), 0, 0.5, Math.floor(ts * 0.5))
      } else {
        ctx.fillRect(c * ts + Math.floor(ts * 0.5), Math.floor(ts * 0.5), 0.5, Math.floor(ts * 0.5))
      }
      // Bottom shadow line
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(c * ts, ts - 1, ts, 1)
    }

    // 3. Furniture
    drawDesks(ctx, ts)
    drawServer(ctx, ts, tickRef.current)
    drawWhiteboard(ctx, ts, taskName)
    drawCoffee(ctx, ts, tickRef.current)
    drawInbox(ctx, ts)
    drawMeetingArea(ctx, ts)
    drawPlant(ctx, ts)

    // 4. Agent sprites (with shadows)
    AGENTS.forEach(agent => {
      const pos = agentPositions[agent.id]
      if (!pos) return
      const state = agentStates[agent.id] || 'idle'
      const x = pos.col * ts
      const y = pos.row * ts
      drawAgent(ctx, x, y, ts, agent, state, walkFrameRef.current, workFrameRef.current)
    })

    frameRef.current = requestAnimationFrame(draw)
  }, [agentStates, agentPositions, taskName, tileSize])

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className="ao-canvas"
    />
  )
}

/* ── Drawing helpers ── */

function px(ts, frac) { return Math.round(ts * frac) } // snap to whole pixels

function drawDesks(ctx, ts) {
  const desks = [
    { col: 2, row: 3, color: '#FDE047' },
    { col: 8, row: 3, color: '#34C759' },
    { col: 14, row: 3, color: '#5856D6' },
    { col: 2, row: 9, color: '#FF9500' },
  ]
  desks.forEach(({ col, row, color }) => {
    const dx = col * ts
    const dy = row * ts
    const dw = ts * 2
    const p = (f) => px(ts, f)

    // Shadow under desk
    ctx.fillStyle = 'rgba(0,0,0,0.06)'
    ctx.fillRect(dx + 2, dy + p(0.85), dw - 4, p(0.15))

    // Legs
    ctx.fillStyle = '#78350F'
    ctx.fillRect(dx + p(0.15), dy + p(0.7), p(0.12), p(0.28))
    ctx.fillRect(dx + dw - p(0.27), dy + p(0.7), p(0.12), p(0.28))

    // Desk surface
    ctx.fillStyle = '#A0522D'
    ctx.fillRect(dx + 1, dy + p(0.35), dw - 2, p(0.4))
    // Surface highlight
    ctx.fillStyle = '#B8763A'
    ctx.fillRect(dx + 1, dy + p(0.35), dw - 2, p(0.08))
    // Surface edge shadow
    ctx.fillStyle = '#7C3A12'
    ctx.fillRect(dx + 1, dy + p(0.72), dw - 2, p(0.03))

    // Monitor stand
    ctx.fillStyle = '#6B7280'
    ctx.fillRect(dx + p(0.75), dy + p(0.2), p(0.12), p(0.18))

    // Monitor
    ctx.fillStyle = '#1F2937'
    ctx.fillRect(dx + p(0.4), dy + p(0.02), p(0.85), p(0.35))
    // Screen bezel inner
    ctx.fillStyle = '#111827'
    ctx.fillRect(dx + p(0.45), dy + p(0.05), p(0.75), p(0.28))
    // Screen color
    ctx.fillStyle = color
    ctx.globalAlpha = 0.8
    ctx.fillRect(dx + p(0.48), dy + p(0.07), p(0.69), p(0.23))
    ctx.globalAlpha = 1
    // Screen text lines
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(dx + p(0.55), dy + p(0.11) + i * p(0.07), p(0.5) - i * p(0.1), p(0.02))
    }

    // Keyboard
    ctx.fillStyle = '#D1D5DB'
    ctx.fillRect(dx + p(1.0), dy + p(0.42), p(0.55), p(0.15))
    ctx.fillStyle = '#E5E7EB'
    ctx.fillRect(dx + p(1.02), dy + p(0.43), p(0.51), p(0.13))
  })
}

function drawServer(ctx, ts, tick) {
  const sx = 18 * ts
  const sy = 2 * ts
  const sw = ts * 2 - 2
  const sh = ts * 3 - 2

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.fillRect(sx + 3, sy + 3, sw, sh)

  // Frame
  ctx.fillStyle = '#1F2937'
  ctx.fillRect(sx + 1, sy + 1, sw, sh)

  // Rack units
  for (let i = 0; i < 5; i++) {
    const uy = sy + 3 + i * Math.floor(sh / 5)
    const uh = Math.floor(sh / 5) - 3
    ctx.fillStyle = '#111827'
    ctx.fillRect(sx + 4, uy, sw - 6, uh)
    // Ventilation holes
    ctx.fillStyle = '#374151'
    for (let j = 0; j < 3; j++) {
      ctx.fillRect(sx + sw - 12, uy + 2 + j * Math.floor(uh / 4), 6, 1)
    }
  }

  // LEDs (alternating based on tick)
  const phase = Math.floor(tick / 30) % 4
  const ledPositions = [
    { x: sx + 6, y: sy + 6 },
    { x: sx + 12, y: sy + 6 },
    { x: sx + 6, y: sy + 6 + Math.floor(sh / 5) },
    { x: sx + 12, y: sy + 6 + Math.floor(sh / 5) },
    { x: sx + 6, y: sy + 6 + Math.floor(sh / 5) * 2 },
  ]
  ledPositions.forEach((led, i) => {
    const on = (i + phase) % 3 !== 0
    ctx.fillStyle = on ? (i % 2 === 0 ? '#F59E0B' : '#34C759') : '#374151'
    ctx.fillRect(led.x, led.y, 3, 3)
    // LED glow
    if (on) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(245,158,11,0.2)' : 'rgba(52,199,89,0.2)'
      ctx.fillRect(led.x - 1, led.y - 1, 5, 5)
    }
  })

  // Front panel line
  ctx.fillStyle = '#374151'
  ctx.fillRect(sx + 1, sy + 1, sw, 1.5)
}

function drawWhiteboard(ctx, ts, taskName) {
  const wx = 10 * ts
  const wy = 1 * ts + Math.floor(ts * 0.3) // push into wall area a bit
  const ww = ts * 3
  const wh = ts * 1.2

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.fillRect(wx + 4, wy + 4, ww, wh)

  // Board
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(wx + 2, wy, ww - 4, wh)

  // Frame
  ctx.strokeStyle = '#9CA3AF'
  ctx.lineWidth = 1.5
  ctx.strokeRect(wx + 2, wy, ww - 4, wh)

  // Marker tray
  ctx.fillStyle = '#D1D5DB'
  ctx.fillRect(wx + Math.floor(ww * 0.2), wy + wh - 2, Math.floor(ww * 0.6), 4)

  // Marker dots
  ctx.fillStyle = '#EF4444'
  ctx.fillRect(wx + Math.floor(ww * 0.3), wy + wh, 4, 3)
  ctx.fillStyle = '#3B82F6'
  ctx.fillRect(wx + Math.floor(ww * 0.45), wy + wh, 4, 3)
  ctx.fillStyle = '#111827'
  ctx.fillRect(wx + Math.floor(ww * 0.6), wy + wh, 4, 3)

  // Content
  if (taskName) {
    ctx.fillStyle = '#374151'
    ctx.font = `bold ${Math.max(9, Math.floor(ts * 0.32))}px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.fillText(taskName.slice(0, 18), wx + ww / 2, wy + wh * 0.45, ww - 16)
    // Decorative bullet points
    ctx.fillStyle = '#9CA3AF'
    ctx.font = `${Math.max(7, Math.floor(ts * 0.22))}px -apple-system, sans-serif`
    ctx.fillText('- - - - -', wx + ww / 2, wy + wh * 0.72)
    ctx.textAlign = 'start'
  }
}

function drawCoffee(ctx, ts, tick) {
  const cx = 17 * ts
  const cy = 9 * ts

  // Counter surface
  ctx.fillStyle = '#78350F'
  ctx.fillRect(cx + px(ts, 0.05), cy + px(ts, 0.55), px(ts, 0.9), px(ts, 0.4))
  ctx.fillStyle = '#92400E'
  ctx.fillRect(cx + px(ts, 0.05), cy + px(ts, 0.55), px(ts, 0.9), px(ts, 0.08))

  // Machine body
  ctx.fillStyle = '#DC2626'
  ctx.fillRect(cx + px(ts, 0.15), cy + px(ts, 0.15), px(ts, 0.7), px(ts, 0.45))
  // Machine highlight
  ctx.fillStyle = '#EF4444'
  ctx.fillRect(cx + px(ts, 0.15), cy + px(ts, 0.15), px(ts, 0.7), px(ts, 0.08))
  // Nozzle
  ctx.fillStyle = '#991B1B'
  ctx.fillRect(cx + px(ts, 0.35), cy + px(ts, 0.52), px(ts, 0.3), px(ts, 0.08))

  // Cup
  ctx.fillStyle = '#F5F5F4'
  ctx.fillRect(cx + px(ts, 0.38), cy + px(ts, 0.6), px(ts, 0.24), px(ts, 0.22))
  // Coffee inside
  ctx.fillStyle = '#92400E'
  ctx.fillRect(cx + px(ts, 0.4), cy + px(ts, 0.62), px(ts, 0.2), px(ts, 0.1))

  // Steam particles
  const phase = (tick * 0.05) % (Math.PI * 2)
  ctx.fillStyle = 'rgba(200,200,200,0.4)'
  for (let i = 0; i < 3; i++) {
    const sx = cx + px(ts, 0.45) + Math.sin(phase + i * 2) * px(ts, 0.08)
    const sy = cy + px(ts, 0.08) - i * px(ts, 0.08)
    const r = 1.5 - i * 0.3
    ctx.beginPath()
    ctx.arc(sx, sy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawInbox(ctx, ts) {
  const ix = 5 * ts
  const iy = 11 * ts

  // Tray shadow
  ctx.fillStyle = 'rgba(0,0,0,0.04)'
  ctx.fillRect(ix + 4, iy + px(ts, 0.5), ts * 3 - 4, px(ts, 0.45))

  // Tray body
  ctx.fillStyle = '#D1D5DB'
  ctx.fillRect(ix + 2, iy + px(ts, 0.35), ts * 3 - 4, px(ts, 0.55))
  // Tray front lip
  ctx.fillStyle = '#9CA3AF'
  ctx.fillRect(ix + 2, iy + px(ts, 0.35), ts * 3 - 4, px(ts, 0.06))
  // Tray inner
  ctx.fillStyle = '#E5E7EB'
  ctx.fillRect(ix + 5, iy + px(ts, 0.42), ts * 3 - 10, px(ts, 0.4))

  // Paper stack
  ctx.fillStyle = '#FFFFFF'
  for (let p = 0; p < 3; p++) {
    ctx.fillRect(ix + 8 + p * 2, iy + px(ts, 0.45) + p * 2, ts * 2 - 8, px(ts, 0.08))
  }
}

function drawMeetingArea(ctx, ts) {
  const cx = 11 * ts + px(ts, 0.5)
  const cy = 10 * ts + px(ts, 0.5)
  const radius = px(ts, 1.1)

  // Table shadow
  ctx.fillStyle = 'rgba(0,0,0,0.06)'
  ctx.beginPath()
  ctx.arc(cx + 2, cy + 2, radius, 0, Math.PI * 2)
  ctx.fill()

  // Table surface
  ctx.fillStyle = '#92400E'
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fill()

  // Table edge highlight
  ctx.strokeStyle = '#B8763A'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Table center detail
  ctx.fillStyle = '#A0522D'
  ctx.beginPath()
  ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2)
  ctx.fill()

  // Chairs (rounded)
  const chairOffsets = [
    { dx: -1.6, dy: -1.6 }, { dx: 1.6, dy: -1.6 },
    { dx: -1.6, dy: 1.6 },  { dx: 1.6, dy: 1.6 },
  ]
  chairOffsets.forEach(({ dx, dy }) => {
    const chairX = cx + dx * px(ts, 0.7)
    const chairY = cy + dy * px(ts, 0.7)
    // Chair shadow
    ctx.fillStyle = 'rgba(0,0,0,0.05)'
    ctx.fillRect(chairX - 3, chairY - 2, 8, 8)
    // Chair seat
    ctx.fillStyle = '#78350F'
    ctx.fillRect(chairX - 4, chairY - 4, 8, 8)
    // Chair back
    ctx.fillStyle = '#5B2C0E'
    if (dy < 0) ctx.fillRect(chairX - 4, chairY - 6, 8, 3)
    else ctx.fillRect(chairX - 4, chairY + 3, 8, 3)
  })
}

function drawPlant(ctx, ts) {
  const px_ = 1 * ts
  const py_ = 12 * ts

  // Pot shadow
  ctx.fillStyle = 'rgba(0,0,0,0.05)'
  ctx.beginPath()
  ctx.ellipse(px_ + px(ts, 0.5), py_ + px(ts, 0.92), px(ts, 0.25), px(ts, 0.06), 0, 0, Math.PI * 2)
  ctx.fill()

  // Pot
  ctx.fillStyle = '#92400E'
  ctx.fillRect(px_ + px(ts, 0.25), py_ + px(ts, 0.6), px(ts, 0.5), px(ts, 0.3))
  // Pot rim
  ctx.fillStyle = '#B8763A'
  ctx.fillRect(px_ + px(ts, 0.22), py_ + px(ts, 0.58), px(ts, 0.56), px(ts, 0.06))

  // Stem
  ctx.fillStyle = '#15803D'
  ctx.fillRect(px_ + px(ts, 0.47), py_ + px(ts, 0.3), px(ts, 0.06), px(ts, 0.32))

  // Leaves
  ctx.fillStyle = '#22C55E'
  ctx.beginPath()
  ctx.ellipse(px_ + px(ts, 0.32), py_ + px(ts, 0.35), px(ts, 0.16), px(ts, 0.1), -0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(px_ + px(ts, 0.68), py_ + px(ts, 0.3), px(ts, 0.16), px(ts, 0.1), 0.5, 0, Math.PI * 2)
  ctx.fill()
  // Smaller top leaf
  ctx.fillStyle = '#4ADE80'
  ctx.beginPath()
  ctx.ellipse(px_ + px(ts, 0.5), py_ + px(ts, 0.2), px(ts, 0.1), px(ts, 0.12), 0, 0, Math.PI * 2)
  ctx.fill()
}

/* ── Agent sprite drawing (larger, sharper) ── */

function drawAgent(ctx, x, y, ts, agent, state, walkFrame, workFrame) {
  const s = ts * 0.8 // 80% of tile — much bigger and more readable
  const cx = x + ts * 0.5
  const baseY = y + ts * 0.9 // anchor at feet
  const bob = state === 'idle' ? Math.sin(Date.now() / 600) * 1.2 : 0

  // Walk leg offsets
  let legL = 0, legR = 0
  if (state === 'walking') {
    legL = (walkFrame === 1) ? 2 : 0
    legR = (walkFrame === 3) ? 2 : 0
  }

  // Work head tilt
  const tilt = state === 'working' ? (workFrame === 0 ? -1 : 1) : 0

  // Foot shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath()
  ctx.ellipse(cx, baseY + 1, s * 0.3, s * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()

  const sp = agent.sprite

  // Shared dimensions
  const headW = Math.round(s * 0.55)
  const headH = Math.round(s * 0.3)
  const bodyW = Math.round(s * 0.5)
  const bodyH = Math.round(s * 0.35)
  const legW = Math.round(s * 0.16)
  const legH = Math.round(s * 0.2)
  const eyeSize = Math.max(2, Math.round(s * 0.06))

  // Positions from bottom up
  const legY = baseY - legH + bob
  const bodyY = legY - bodyH
  const headY = bodyY - headH
  const hatY = headY - Math.round(s * 0.15)

  if (agent.id === 'haiku') {
    // Legs
    ctx.fillStyle = sp.legs
    ctx.fillRect(cx - s * 0.16, legY + legL, legW, legH)
    ctx.fillRect(cx + s * 0.02, legY + legR, legW, legH)
    // Body / jacket
    ctx.fillStyle = sp.jacket
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH)
    // Jacket zipper line
    ctx.fillStyle = '#2563EB'
    ctx.fillRect(cx - 0.5, bodyY + 2, 1, bodyH - 3)
    // Head
    ctx.fillStyle = sp.face
    ctx.fillRect(cx - headW / 2 + tilt, headY, headW, headH)
    // Eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(cx - s * 0.12 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    ctx.fillRect(cx + s * 0.06 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    // Mouth
    ctx.fillStyle = '#B45309'
    ctx.fillRect(cx - s * 0.04 + tilt, headY + headH * 0.7, s * 0.08, 1)
    // Cap
    ctx.fillStyle = sp.cap
    ctx.fillRect(cx - headW / 2 - 1, hatY, headW + 2, Math.round(s * 0.18))
    // Cap brim
    ctx.fillStyle = '#EAB308'
    ctx.fillRect(cx - headW / 2 - 3, hatY + Math.round(s * 0.14), headW + 6, Math.round(s * 0.04))
  } else if (agent.id === 'sonnet') {
    // Legs
    ctx.fillStyle = sp.legs
    ctx.fillRect(cx - s * 0.16, legY + legL, legW, legH)
    ctx.fillRect(cx + s * 0.02, legY + legR, legW, legH)
    // Body / hoodie
    ctx.fillStyle = sp.hoodie
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH)
    // Hoodie pocket
    ctx.fillStyle = '#2D9F4E'
    ctx.fillRect(cx - s * 0.1, bodyY + bodyH * 0.55, s * 0.2, bodyH * 0.2)
    // Head
    ctx.fillStyle = sp.face
    ctx.fillRect(cx - headW / 2 + tilt, headY, headW, headH)
    // Eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(cx - s * 0.12 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    ctx.fillRect(cx + s * 0.06 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    // Smile
    ctx.fillStyle = '#B45309'
    ctx.fillRect(cx - s * 0.05 + tilt, headY + headH * 0.7, s * 0.1, 1)
    // Hair
    ctx.fillStyle = sp.hair
    ctx.fillRect(cx - headW / 2 + tilt, headY - 2, headW, Math.round(headH * 0.35))
    // Hair sides
    ctx.fillRect(cx - headW / 2 - 1 + tilt, headY, 2, headH * 0.5)
    ctx.fillRect(cx + headW / 2 - 1 + tilt, headY, 2, headH * 0.5)
  } else if (agent.id === 'opus') {
    // Robe (full body, covers legs)
    ctx.fillStyle = sp.robe
    ctx.fillRect(cx - bodyW / 2 - 2, bodyY - 2, bodyW + 4, bodyH + legH + 2)
    // Robe highlight
    ctx.fillStyle = '#6D6BD8'
    ctx.fillRect(cx - bodyW / 2 - 2, bodyY - 2, bodyW + 4, 2)
    // Robe bottom hem
    ctx.fillStyle = '#4338CA'
    ctx.fillRect(cx - bodyW / 2 - 2, baseY - 3 + bob, bodyW + 4, 3)
    // Head
    ctx.fillStyle = sp.face
    ctx.fillRect(cx - headW / 2 + tilt, headY, headW, headH)
    // Glasses
    ctx.strokeStyle = sp.glasses
    ctx.lineWidth = 1
    const glY = headY + headH * 0.3
    const glSize = Math.round(s * 0.12)
    ctx.strokeRect(cx - s * 0.15 + tilt, glY, glSize, glSize)
    ctx.strokeRect(cx + s * 0.03 + tilt, glY, glSize, glSize)
    // Glasses bridge
    ctx.beginPath()
    ctx.moveTo(cx - s * 0.03 + tilt, glY + glSize / 2)
    ctx.lineTo(cx + s * 0.03 + tilt, glY + glSize / 2)
    ctx.stroke()
    // Eyes behind glasses
    ctx.fillStyle = '#000'
    ctx.fillRect(cx - s * 0.1 + tilt, glY + glSize * 0.3, eyeSize, eyeSize)
    ctx.fillRect(cx + s * 0.06 + tilt, glY + glSize * 0.3, eyeSize, eyeSize)
    // Beard
    ctx.fillStyle = sp.beard
    ctx.fillRect(cx - s * 0.15 + tilt, headY + headH - 1, s * 0.3, Math.round(headH * 0.35))
    // Beard point
    ctx.fillRect(cx - s * 0.06 + tilt, headY + headH + Math.round(headH * 0.3), s * 0.12, 2)
  } else if (agent.id === 'scout') {
    // Legs
    ctx.fillStyle = sp.legs
    ctx.fillRect(cx - s * 0.16, legY + legL, legW, legH)
    ctx.fillRect(cx + s * 0.02, legY + legR, legW, legH)
    // Body / jacket
    ctx.fillStyle = sp.jacket
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, bodyH)
    // Jacket collar
    ctx.fillStyle = '#4B5563'
    ctx.fillRect(cx - bodyW / 2, bodyY, bodyW, Math.round(bodyH * 0.15))
    // Notebook
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(cx + bodyW / 2 - 1, bodyY + bodyH * 0.2, Math.round(s * 0.14), Math.round(s * 0.2))
    ctx.fillStyle = '#D1D5DB'
    ctx.fillRect(cx + bodyW / 2, bodyY + bodyH * 0.25, Math.round(s * 0.1), 1)
    ctx.fillRect(cx + bodyW / 2, bodyY + bodyH * 0.35, Math.round(s * 0.1), 1)
    // Head
    ctx.fillStyle = sp.face
    ctx.fillRect(cx - headW / 2 + tilt, headY, headW, headH)
    // Eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(cx - s * 0.12 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    ctx.fillRect(cx + s * 0.06 + tilt, headY + headH * 0.35, eyeSize, eyeSize)
    // Cap
    ctx.fillStyle = sp.cap
    ctx.fillRect(cx - headW / 2 - 1, hatY, headW + 2, Math.round(s * 0.16))
    // Cap brim
    ctx.fillStyle = '#DC2626'
    ctx.fillRect(cx - headW / 2 - 3, hatY + Math.round(s * 0.12), headW + 6, Math.round(s * 0.04))
  }

  // Name label under sprite
  ctx.fillStyle = agent.color
  ctx.font = `bold ${Math.max(8, Math.round(ts * 0.28))}px -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(agent.name, cx, baseY + Math.round(ts * 0.15))
  ctx.textAlign = 'start'

  // Speech bubble above head
  const bubbleY = hatY - Math.round(s * 0.15) + bob
  if (state === 'working') {
    drawBubble(ctx, cx, bubbleY, ts, '...', '#F59E0B')
  } else if (state === 'done') {
    drawBubble(ctx, cx, bubbleY, ts, 'Done!', '#34C759')
  } else if (state === 'stuck') {
    drawBubble(ctx, cx, bubbleY, ts, '?!', '#FF3B30')
  }
}

function drawBubble(ctx, cx, y, ts, text, accentColor) {
  const fontSize = Math.max(9, Math.round(ts * 0.3))
  ctx.font = `bold ${fontSize}px -apple-system, sans-serif`
  const textW = ctx.measureText(text).width
  const padX = 8
  const padY = 4
  const w = textW + padX * 2
  const h = fontSize + padY * 2
  const bx = Math.round(cx - w / 2)
  const by = Math.round(y - h - 6)

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.08)'
  ctx.beginPath()
  ctx.roundRect(bx + 1, by + 1, w, h, 5)
  ctx.fill()

  // Background
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(bx, by, w, h, 5)
  ctx.fill()

  // Border
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(bx, by, w, h, 5)
  ctx.stroke()

  // Triangle pointer
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(cx - 4, by + h)
  ctx.lineTo(cx + 4, by + h)
  ctx.lineTo(cx, by + h + 5)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = accentColor
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - 4, by + h - 0.5)
  ctx.lineTo(cx, by + h + 5)
  ctx.lineTo(cx + 4, by + h - 0.5)
  ctx.stroke()
  // White fill to cover border line between bubble and pointer
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(cx - 3, by + h - 1, 6, 2)

  // Text
  ctx.fillStyle = accentColor
  ctx.font = `bold ${fontSize}px -apple-system, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, cx, by + h / 2)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}

/* ══════════════════════════════════════════
   CLARITY METER
   ══════════════════════════════════════════ */

function getClarity(text) {
  if (!text) return { percent: 0, label: 'Empty', color: '#9CA3AF' }
  const words = text.trim().split(/\s+/).length
  if (words < 10) return { percent: Math.min(30, words * 3), label: 'Too vague', color: '#FF3B30' }
  if (words < 30) return { percent: 30 + (words - 10) * 1.5, label: 'Getting there', color: '#FF9500' }
  return { percent: Math.min(100, 60 + (words - 30) * 1.3), label: 'Clear', color: '#34C759' }
}

/* ══════════════════════════════════════════
   API HELPERS
   ══════════════════════════════════════════ */

const AGENT_FORMAT_RULES = 'RESPONSE RULES: Keep your response under 80 words. Be direct and concise. Respond in plain text only — no markdown headers, bold, italic, code blocks, or bullet symbols. Use short paragraphs separated by line breaks.'

function buildToolsPrompt(enabledTools) {
  if (enabledTools.length === 0) {
    return 'TOOLS: You have NO tools. You can only reason with knowledge you already have.\nCRITICAL: If the task requires accessing files, running code, or searching the web, you MUST respond with exactly: "Missing tool: [tool name]. Cannot complete task." Do NOT attempt to fake or guess the answer.\n\n' + AGENT_FORMAT_RULES
  }

  const toolNames = enabledTools.map(t => TOOLS.find(tool => tool.id === t)?.desc).join(', ')
  return `TOOLS: You have been granted these tools: ${toolNames}\nIMPORTANT: You are in a simulation. When you have a tool, ACT AS IF you used it successfully. For example, if you have File Reader and the task says "read the README", simulate that you read it and provide a realistic, helpful answer as if you found the information. Do NOT say you cannot access files — you have the tool. Produce a complete, high-quality response using your tools.\n\n${AGENT_FORMAT_RULES}`
}

async function callAgent(agent, task, instructions, enabledTools) {
  const toolsPrompt = buildToolsPrompt(enabledTools)

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${agent.personality}\n\n${toolsPrompt}`,
      },
      {
        role: 'user',
        content: `TASK: ${task}\n\nINSTRUCTIONS FROM YOUR MANAGER:\n${instructions}\n\nComplete this task now.`,
      },
    ],
    max_tokens: 150,
    stream: false,
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('API call failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'No response generated.'
}

async function callAgentWithContext(agent, task, instructions, enabledTools, previousOutput) {
  const toolsPrompt = buildToolsPrompt(enabledTools)

  const body = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `${agent.personality}\n\n${toolsPrompt}`,
      },
      {
        role: 'user',
        content: `Previous agent findings:\n${previousOutput}\n\nNow complete your task:\nTASK: ${task}\nINSTRUCTIONS FROM YOUR MANAGER:\n${instructions}\n\nComplete this task now.`,
      },
    ],
    max_tokens: 150,
    stream: false,
  }

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('API call failed')
  const data = await res.json()
  return data.choices?.[0]?.message?.content || 'No response generated.'
}

async function evaluateOutput(task, agentOutput, userInstructions, criteria) {
  try {
    const instrWords = userInstructions.trim().split(/\s+/).filter(Boolean).length
    const body = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You evaluate AI agent task output for a game. Respond ONLY with valid JSON: {"stars": 0-3, "reason": "max 12 words"}',
        },
        {
          role: 'user',
          content: `TASK: ${task}\n\nUSER INSTRUCTIONS: "${userInstructions}" (${instrWords} words)\n\nAGENT OUTPUT: ${agentOutput}\n\nCRITERIA: ${criteria || 'Output must directly address the task with specific, concrete content.'}\n\nSCORING:\n- 0 stars: Output does not address the task at all, or is completely wrong\n- 1 star: Output partially addresses the task but misses key requirements from the criteria\n- 2 stars: Output addresses the task and meets most criteria, but could be more specific\n- 3 stars: Output fully meets all criteria with concrete, specific content\n\nLAZY INSTRUCTION PENALTY: If the user instructions are generic filler that do not mention anything specific to the task (e.g. "do it", "complete the task", "just write something good"), cap at 1 star. But if instructions mention specific details about the task (audience, format, constraints, topics), judge normally based on output quality.`,
        },
      ],
      max_tokens: 80,
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) throw new Error('Eval failed')
    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    const json = JSON.parse(text)
    return {
      success: json.stars >= 1,
      stars: Math.max(0, Math.min(3, json.stars || 0)),
      reason: json.reason || 'Evaluated',
    }
  } catch {
    return { success: false, stars: 0, reason: 'Evaluation failed — try again' }
  }
}

/* ══════════════════════════════════════════
   TOOL ICONS (inline SVG paths)
   ══════════════════════════════════════════ */

function ToolIconSvg({ icon, size = 14, color = 'currentColor' }) {
  const paths = {
    magnifier: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    pencil: <><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></>,
    lightning: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths[icon]}
    </svg>
  )
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

function AgentOffice({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  /* ── Entry state ── */
  const [showEntry, setShowEntry] = usePersistedState('agent-office-entry', true)
  const [entryLineIndex, setEntryLineIndex] = useState(0)

  /* ── Game state ── */
  const [gamePhase, setGamePhase] = useState('select') // select | assign | working | result | complete
  const [currentLevel, setCurrentLevel] = useState(1)
  const [levelScores, setLevelScores] = useState({})
  const [totalStars, setTotalStars] = useState(0)
  const [levelAttempts, setLevelAttempts] = useState({})

  /* ── Assignment state ── */
  const [selectedAgents, setSelectedAgents] = useState({})
  const [enabledTools, setEnabledTools] = useState({})
  const [instructions, setInstructions] = useState({})

  /* ── Working state ── */
  const [agentStates, setAgentStates] = useState(() => {
    const s = {}
    AGENTS.forEach(a => { s[a.id] = 'idle' })
    return s
  })
  const [agentPositions, setAgentPositions] = useState(() => {
    const p = {}
    AGENTS.forEach(a => { p[a.id] = { col: a.deskCol, row: a.deskRow } })
    return p
  })

  /* ── Output state ── */
  const [outputs, setOutputs] = useState({})
  const [displayedText, setDisplayedText] = useState({})
  const [slotStars, setSlotStars] = useState({})
  const [slotReasons, setSlotReasons] = useState({})
  const [showLearnCard, setShowLearnCard] = useState(false)
  const [activeOutputTab, setActiveOutputTab] = useState(0)
  const [apiLoading, setApiLoading] = useState({})
  const [failureMsg, setFailureMsg] = useState(null)

  /* ── Tile size ── */
  const [tileSize, setTileSize] = useState(TILE_DESKTOP)
  const rootRef = useRef(null)
  const timersRef = useRef([])

  useEffect(() => {
    function updateSize() {
      const w = window.innerWidth
      if (w < 480) setTileSize(TILE_MOBILE)
      else if (w < 768) setTileSize(TILE_TABLET)
      else setTileSize(TILE_DESKTOP)
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  /* ── Entry screen stagger ── */
  useEffect(() => {
    if (!showEntry) return
    const timers = [0, 1, 2, 3].map((i) =>
      setTimeout(() => setEntryLineIndex(i + 1), 300 * (i + 1))
    )
    return () => timers.forEach(clearTimeout)
  }, [showEntry])

  /* ── Word-by-word reveal ── */
  useEffect(() => {
    const timers = []
    Object.entries(outputs).forEach(([slot, text]) => {
      if (!text || displayedText[slot] === text) return
      const words = text.split(' ')
      words.forEach((_, i) => {
        timers.push(setTimeout(() => {
          setDisplayedText(prev => ({
            ...prev,
            [slot]: words.slice(0, i + 1).join(' '),
          }))
        }, 30 * (i + 1)))
      })
    })
    return () => timers.forEach(clearTimeout)
  }, [outputs]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ── */
  const level = LEVELS[currentLevel - 1]

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function resetAssignment() {
    setSelectedAgents({})
    setEnabledTools({})
    setInstructions({})
    setOutputs({})
    setDisplayedText({})
    setSlotStars({})
    setSlotReasons({})
    setShowLearnCard(false)
    setActiveOutputTab(0)
    setApiLoading({})
    setFailureMsg(null)
    setAgentStates(() => {
      const s = {}
      AGENTS.forEach(a => { s[a.id] = 'idle' })
      return s
    })
    setAgentPositions(() => {
      const p = {}
      AGENTS.forEach(a => { p[a.id] = { col: a.deskCol, row: a.deskRow } })
      return p
    })
  }

  function handleStartOver() {
    clearTimers()
    resetAssignment()
    setGamePhase('select')
    setCurrentLevel(1)
    setLevelScores({})
    setTotalStars(0)
    setLevelAttempts({})
    setShowEntry(true)
  }

  /* ── Entry dismiss ── */
  function handleOpenOffice() {
    setShowEntry(false)
    markModuleStarted('agent-office')
    setGamePhase('select')
  }

  /* ── Level start ── */
  function handleStartLevel(lvl) {
    setCurrentLevel(lvl)
    resetAssignment()
    setGamePhase('assign')
  }

  /* ── Agent selection ── */
  function handleSelectAgent(slot, agentId) {
    setSelectedAgents(prev => ({ ...prev, [slot]: agentId }))
  }

  function handleToggleTool(slot, toolId) {
    setFailureMsg(null)
    setEnabledTools(prev => {
      const current = new Set(prev[slot] || [])
      if (current.has(toolId)) current.delete(toolId)
      else current.add(toolId)
      return { ...prev, [slot]: [...current] }
    })
  }

  function handleInstructionChange(slot, text) {
    setFailureMsg(null)
    setInstructions(prev => ({ ...prev, [slot]: text }))
  }

  /* ── Deploy ── */
  async function handleDeploy() {
    if (!level) return
    setFailureMsg(null)

    // Check minimum instruction length
    const minWords = level.minInstructionWords || 3
    if (level.multiAgent) {
      const slotCount = level.slots || 2
      for (let i = 0; i < slotCount; i++) {
        const wordCount = (instructions[i] || '').trim().split(/\s+/).filter(Boolean).length
        if (wordCount < minWords) {
          setFailureMsg(`Slot ${i + 1} instructions too short (${wordCount} words). Write at least ${minWords} words — real agents need real instructions.`)
          return
        }
      }
    } else {
      const wordCount = (instructions[0] || '').trim().split(/\s+/).filter(Boolean).length
      if (wordCount < minWords) {
        setFailureMsg(`Instructions too short (${wordCount} words). Write at least ${minWords} words — the agent needs to know what to do.`)
        return
      }
    }

    // Check required tools
    if (level.multiAgent && level.requiredToolsBySlot) {
      const slotCount = level.slots || 2
      for (let i = 0; i < slotCount; i++) {
        const required = level.requiredToolsBySlot[i] || []
        const enabled = enabledTools[i] || []
        const missing = required.filter(t => !enabled.includes(t))
        if (missing.length > 0) {
          const missingNames = missing.map(t => TOOLS.find(tool => tool.id === t)?.name || t).join(', ')
          setFailureMsg(`Slot ${i + 1} ("${level.slotLabels[i]}") is missing required tools: ${missingNames}. Think about what this agent needs to do its job.`)
          return
        }
      }
    } else if (!level.multiAgent && level.requiredTools && level.requiredTools.length > 0) {
      const enabled = enabledTools[0] || []
      const missing = level.requiredTools.filter(t => !enabled.includes(t))
      if (missing.length > 0) {
        const missingNames = missing.map(t => TOOLS.find(tool => tool.id === t)?.name || t).join(', ')
        setFailureMsg(`Your agent is missing required tools: ${missingNames}. Read the task — what does the agent need to be able to do?`)
        return
      }
    }

    setLevelAttempts(prev => ({ ...prev, [currentLevel]: (prev[currentLevel] || 0) + 1 }))

    if (level.multiAgent) {
      await handleDeployMultiAgent()
    } else {
      await handleDeploySingleAgent()
    }
  }

  async function handleDeploySingleAgent() {
    const agentId = selectedAgents[0]
    const agent = AGENTS.find(a => a.id === agentId)
    if (!agent) return

    const tools = enabledTools[0] || []
    const inst = instructions[0] || ''

    setGamePhase('working')

    // Animate: agent walks to whiteboard then back to desk
    setAgentStates(prev => ({ ...prev, [agentId]: 'walking' }))
    setAgentPositions(prev => ({ ...prev, [agentId]: { col: 11, row: 3 } }))

    const delay = agent.delayMin + Math.random() * (agent.delayMax - agent.delayMin)

    timersRef.current.push(setTimeout(async () => {
      // Walk back to desk
      setAgentPositions(prev => ({ ...prev, [agentId]: { col: agent.deskCol, row: agent.deskRow } }))
      setAgentStates(prev => ({ ...prev, [agentId]: 'working' }))
      setApiLoading(prev => ({ ...prev, 0: true }))

      try {
        const response = await callAgent(agent, level.task, inst, tools)
        setOutputs(prev => ({ ...prev, 0: response }))

        // Check if agent reported missing tools
        if (response.toLowerCase().includes('missing tool')) {
          setAgentStates(prev => ({ ...prev, [agentId]: 'stuck' }))
          setApiLoading(prev => ({ ...prev, 0: false }))
          setSlotStars(prev => ({ ...prev, 0: 0 }))
          setSlotReasons(prev => ({ ...prev, 0: 'Missing required tool' }))
          setFailureMsg(`Your agent couldn't complete the task. ${response.split('.')[0]}. Try again?`)
          setGamePhase('result')
          return
        }

        // Evaluate
        const evaluation = await evaluateOutput(level.task, response, inst, level.criteria)
        setAgentStates(prev => ({ ...prev, [agentId]: evaluation.stars > 0 ? 'done' : 'stuck' }))
        setApiLoading(prev => ({ ...prev, 0: false }))
        setSlotStars(prev => ({ ...prev, 0: evaluation.stars }))
        setSlotReasons(prev => ({ ...prev, 0: evaluation.reason }))
        if (evaluation.stars === 0) {
          setFailureMsg(`0 stars — your instructions were too vague. Be more specific about what the agent should do.`)
        }
        setGamePhase('result')

        timersRef.current.push(setTimeout(() => setShowLearnCard(true), 600))
      } catch {
        setAgentStates(prev => ({ ...prev, [agentId]: 'stuck' }))
        setApiLoading(prev => ({ ...prev, 0: false }))
        setOutputs(prev => ({ ...prev, 0: 'Error: Could not reach the AI. Please try again.' }))
        setSlotStars(prev => ({ ...prev, 0: 0 }))
        setGamePhase('result')
      }
    }, delay))
  }

  async function handleDeployMultiAgent() {
    const slotCount = level.slots || 2
    setGamePhase('working')

    if (slotCount === 2) {
      // Sequential pipeline
      const agent1Id = selectedAgents[0]
      const agent2Id = selectedAgents[1]
      const agent1 = AGENTS.find(a => a.id === agent1Id)
      const agent2 = AGENTS.find(a => a.id === agent2Id)
      if (!agent1 || !agent2) return

      // Agent 1 works
      setAgentStates(prev => ({ ...prev, [agent1Id]: 'walking' }))
      setAgentPositions(prev => ({ ...prev, [agent1Id]: { col: 11, row: 10 } })) // meeting table

      const delay1 = agent1.delayMin + Math.random() * (agent1.delayMax - agent1.delayMin)

      timersRef.current.push(setTimeout(async () => {
        setAgentStates(prev => ({ ...prev, [agent1Id]: 'working' }))
        setApiLoading(prev => ({ ...prev, 0: true }))

        try {
          const response1 = await callAgent(agent1, level.task, instructions[0] || '', enabledTools[0] || [])
          setOutputs(prev => ({ ...prev, 0: response1 }))
          setApiLoading(prev => ({ ...prev, 0: false }))

          const eval1 = await evaluateOutput(level.task.split(',')[0] || level.task, response1, instructions[0] || '', level.criteria)
          setSlotStars(prev => ({ ...prev, 0: eval1.stars }))
          setSlotReasons(prev => ({ ...prev, 0: eval1.reason }))
          setAgentStates(prev => ({ ...prev, [agent1Id]: eval1.stars > 0 ? 'done' : 'stuck' }))
          setAgentPositions(prev => ({ ...prev, [agent1Id]: { col: agent1.deskCol, row: agent1.deskRow } }))

          // Agent 2 picks up
          const delay2 = agent2.delayMin + Math.random() * (agent2.delayMax - agent2.delayMin)
          setAgentStates(prev => ({ ...prev, [agent2Id]: 'walking' }))
          setAgentPositions(prev => ({ ...prev, [agent2Id]: { col: 11, row: 10 } }))

          timersRef.current.push(setTimeout(async () => {
            setAgentStates(prev => ({ ...prev, [agent2Id]: 'working' }))
            setApiLoading(prev => ({ ...prev, 1: true }))

            try {
              const response2 = await callAgentWithContext(agent2, level.task, instructions[1] || '', enabledTools[1] || [], response1)
              setOutputs(prev => ({ ...prev, 1: response2 }))
              setApiLoading(prev => ({ ...prev, 1: false }))

              const eval2 = await evaluateOutput(level.task, response2, instructions[1] || '', level.criteria)
              setSlotStars(prev => ({ ...prev, 1: eval2.stars }))
              setSlotReasons(prev => ({ ...prev, 1: eval2.reason }))
              setAgentStates(prev => ({ ...prev, [agent2Id]: eval2.stars > 0 ? 'done' : 'stuck' }))
              setAgentPositions(prev => ({ ...prev, [agent2Id]: { col: agent2.deskCol, row: agent2.deskRow } }))
              setGamePhase('result')
              timersRef.current.push(setTimeout(() => setShowLearnCard(true), 600))
            } catch {
              setAgentStates(prev => ({ ...prev, [agent2Id]: 'stuck' }))
              setApiLoading(prev => ({ ...prev, 1: false }))
              setGamePhase('result')
            }
          }, delay2))
        } catch {
          setAgentStates(prev => ({ ...prev, [agent1Id]: 'stuck' }))
          setApiLoading(prev => ({ ...prev, 0: false }))
          setGamePhase('result')
        }
      }, delay1))
    } else {
      // Parallel (Level 6)
      const promises = [0, 1, 2].map(async (slot) => {
        const agentId = selectedAgents[slot]
        const agent = AGENTS.find(a => a.id === agentId)
        if (!agent) return

        setAgentStates(prev => ({ ...prev, [agentId]: 'working' }))
        setApiLoading(prev => ({ ...prev, [slot]: true }))

        const delay = agent.delayMin + Math.random() * (agent.delayMax - agent.delayMin)
        await new Promise(r => setTimeout(r, delay))

        try {
          const response = await callAgent(agent, level.task, instructions[slot] || '', enabledTools[slot] || [])
          setOutputs(prev => ({ ...prev, [slot]: response }))
          setApiLoading(prev => ({ ...prev, [slot]: false }))

          const evaluation = await evaluateOutput(level.task, response, instructions[slot] || '', level.criteria)
          setSlotStars(prev => ({ ...prev, [slot]: evaluation.stars }))
          setSlotReasons(prev => ({ ...prev, [slot]: evaluation.reason }))
          setAgentStates(prev => ({ ...prev, [agentId]: evaluation.stars > 0 ? 'done' : 'stuck' }))
        } catch {
          setAgentStates(prev => ({ ...prev, [agentId]: 'stuck' }))
          setApiLoading(prev => ({ ...prev, [slot]: false }))
          setSlotStars(prev => ({ ...prev, [slot]: 0 }))
        }
      })

      await Promise.all(promises)
      setGamePhase('result')
      timersRef.current.push(setTimeout(() => setShowLearnCard(true), 600))
    }
  }

  /* ── Level complete ── */
  function handleLevelComplete() {
    const slotCount = level.multiAgent ? (level.slots || 2) : 1
    let stars = 0
    for (let i = 0; i < slotCount; i++) {
      stars += slotStars[i] || 0
    }
    // For multi-agent, average the stars (max 3 per level)
    if (slotCount > 1) {
      stars = Math.round(stars / slotCount)
    }
    stars = Math.max(0, Math.min(3, stars))

    const newScores = { ...levelScores, [currentLevel]: stars }
    setLevelScores(newScores)
    const newTotal = Object.values(newScores).reduce((s, v) => s + v, 0)
    setTotalStars(newTotal)

    if (currentLevel < 6) {
      setCurrentLevel(currentLevel + 1)
      resetAssignment()
      setGamePhase('assign')
    } else {
      // Game complete
      markModuleComplete('agent-office')
      setGamePhase('complete')
    }
  }

  function handleRetry() {
    resetAssignment()
    setGamePhase('assign')
  }

  /* ── Check deploy readiness ── */
  function canDeploy() {
    if (!level) return false
    if (level.multiAgent) {
      const slotCount = level.slots || 2
      for (let i = 0; i < slotCount; i++) {
        if (!selectedAgents[i]) return false
        if (!instructions[i]?.trim()) return false
      }
      return true
    }
    return !!selectedAgents[0] && !!instructions[0]?.trim()
  }

  /* ── Get title based on score ── */
  function getCompletionTitle() {
    if (totalStars >= 17) return { title: 'Agent Architect', desc: 'You understand agents better than most professional engineers. Deploy them.' }
    if (totalStars >= 13) return { title: 'Senior Orchestrator', desc: 'Strong instincts. You know when to use which agent and why coordination matters.' }
    if (totalStars >= 9) return { title: 'Junior Developer', desc: 'You grasped the fundamentals. Each failure taught you something real about agents.' }
    return { title: 'Intern Day 1', desc: 'You discovered that agents are not magic. They need the right tools, the right model, and the right instructions. That is the job.' }
  }

  /* ══════════════════════════════════════════
     RENDER — ENTRY SCREEN
     ══════════════════════════════════════════ */

  if (showEntry) {
    return (
      <div className="ao-entry" ref={rootRef}>
        <div className="ao-entry-icon">
          <ModuleIcon module="agent-office" size={72} style={{ color: '#F59E0B' }} />
        </div>

        <h1 className="ao-entry-title">Agent Office</h1>

        <div className="ao-entry-taglines">
          <p className={`ao-entry-tagline ${entryLineIndex >= 1 ? 'ao-tagline-visible' : ''}`}>Your AI startup. Your agents.</p>
          <p className={`ao-entry-tagline ${entryLineIndex >= 2 ? 'ao-tagline-visible' : ''}`}>Assign them. Equip them. Watch them work.</p>
          <p className={`ao-entry-tagline ${entryLineIndex >= 3 ? 'ao-tagline-visible' : ''}`}>Learn what makes agents succeed &mdash; and fail.</p>
        </div>

        <div className="ao-briefing-card">
          <p>
            You run a pixel art AI startup. Clients send tasks. You have four AI agents &mdash; Haiku, Sonnet,
            Opus, and Scout &mdash; each with different strengths. Your job: assign the right agent, give them
            the right tools, write clear instructions, and deploy them. Watch what happens. Learn from
            every success and every failure.
          </p>
        </div>

        <div className="ao-entry-stats">
          <span className="ao-stat-pill">6 Levels</span>
          <span className="ao-stat-pill">Real AI</span>
          <span className="ao-stat-pill">Pixel Office</span>
        </div>

        <button className="ao-open-btn" onClick={handleOpenOffice}>
          Open the Office
        </button>
      </div>
    )
  }

  /* ══════════════════════════════════════════
     RENDER — LEVEL SELECT
     ══════════════════════════════════════════ */

  if (gamePhase === 'select') {
    const highestUnlocked = Math.max(1, ...Object.keys(levelScores).map(Number)) + (Object.keys(levelScores).length > 0 ? 1 : 0)

    return (
      <div className="ao-root" ref={rootRef}>
        <div className="ao-header-bar">
          <h2 className="ao-page-title">Agent Office</h2>
          <div className="ao-total-stars">
            <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            <span>{totalStars}/18</span>
          </div>
        </div>

        <div className="ao-level-grid">
          {LEVELS.map((lvl) => {
            const unlocked = lvl.id <= Math.min(highestUnlocked, 6)
            const completed = levelScores[lvl.id] !== undefined
            const isCurrent = lvl.id === Math.min(highestUnlocked, 6) && !completed

            return (
              <div
                key={lvl.id}
                className={`ao-level-card ${completed ? 'ao-level-done' : ''} ${isCurrent ? 'ao-level-current' : ''} ${!unlocked ? 'ao-level-locked' : ''}`}
                onClick={unlocked ? () => handleStartLevel(lvl.id) : undefined}
              >
                <div className="ao-level-num">Level {lvl.id}</div>
                <div className="ao-level-title">{lvl.title}</div>
                <div className="ao-level-concept">{lvl.concept}</div>
                <div className="ao-level-difficulty">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={`ao-diff-dot ${i < lvl.difficulty ? 'ao-diff-active' : ''}`} />
                  ))}
                </div>
                {completed && <StarDisplay count={levelScores[lvl.id]} total={3} />}
                {!unlocked && (
                  <div className="ao-lock-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>
                )}
                {isCurrent && <button className="ao-play-level-btn">Play</button>}
              </div>
            )
          })}
        </div>

        <div className="ao-bottom-actions">
          <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
        </div>
        <SuggestedModules currentModuleId="agent-office" onSwitchTab={onSwitchTab} />
      </div>
    )
  }

  /* ══════════════════════════════════════════
     RENDER — GAME COMPLETE
     ══════════════════════════════════════════ */

  if (gamePhase === 'complete') {
    const { title, desc } = getCompletionTitle()

    return (
      <div className="ao-root ao-completion" ref={rootRef}>
        <div className="ao-completion-icon">
          <ModuleIcon module="agent-office" size={64} style={{ color: '#F59E0B' }} />
        </div>

        <h2 className="ao-completion-title">{title}</h2>
        <p className="ao-completion-desc">{desc}</p>

        <div className="ao-completion-score">
          <StarDisplay count={totalStars} total={18} animate />
          <div className="ao-completion-score-text">{totalStars}/18 Stars</div>
        </div>

        <div className="ao-concepts-row">
          {CONCEPTS_LEARNED.map((c, i) => (
            <span key={c} className="ao-concept-pill ao-fade-in" style={{ animationDelay: `${i * 0.12}s` }}>{c}</span>
          ))}
        </div>

        <div className="how-final-actions">
          <button className="quiz-launch-btn" style={{ background: '#F59E0B', color: '#000' }} onClick={handleStartOver}>Play Again</button>
          <button className="how-secondary-btn" onClick={onGoHome}>Back to Home</button>
        </div>
        <SuggestedModules currentModuleId="agent-office" onSwitchTab={onSwitchTab} />
      </div>
    )
  }

  /* ══════════════════════════════════════════
     RENDER — ASSIGN / WORKING / RESULT
     ══════════════════════════════════════════ */

  const slotCount = level.multiAgent ? (level.slots || 2) : 1

  return (
    <div className="ao-root" ref={rootRef}>
      {/* Header */}
      <div className="ao-header-bar">
        <button className="ao-back-btn" onClick={() => { clearTimers(); resetAssignment(); setGamePhase('select') }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Levels
        </button>
        <div className="ao-level-badge">Level {currentLevel}</div>
        <div className="ao-total-stars">
          <svg viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1.5" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span>{totalStars}/18</span>
        </div>
      </div>

      {/* Inbox card */}
      <div className={`ao-inbox-card ${level.urgent ? 'ao-inbox-urgent' : ''}`}>
        <div className="ao-inbox-client">{level.urgent ? '\u26A1 URGENT CLIENT' : 'CLIENT'}: {level.client}</div>
        <div className="ao-inbox-task">TASK: {level.task}</div>
        <div className="ao-inbox-meta">
          <span className="ao-inbox-cat">{level.category}</span>
          <span className="ao-inbox-diff">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i}>{i < level.difficulty ? '\u2605' : '\u2606'}</span>
            ))}
          </span>
        </div>
      </div>

      <div className="ao-game-layout">
        {/* Left: Office canvas */}
        <div className="ao-canvas-wrap">
          <PixelOfficeCanvas
            agentStates={agentStates}
            agentPositions={agentPositions}
            taskName={level.title}
            tileSize={tileSize}
          />
        </div>

        {/* Right: Controls + Output */}
        <div className="ao-controls">
          {gamePhase === 'assign' && (
            <>
              {/* Agent selection */}
              {level.multiAgent ? (
                <div className="ao-pipeline-section">
                  <div className="ao-section-label">Pipeline</div>
                  {Array.from({ length: slotCount }, (_, slot) => (
                    <div key={slot} className="ao-pipeline-slot-wrap">
                      {slot > 0 && <div className="ao-pipeline-arrow">&darr;</div>}
                      <div className="ao-pipeline-slot-label">{level.slotLabels?.[slot] || `Step ${slot + 1}`}</div>
                      <div className="ao-agent-grid">
                        {AGENTS.map(agent => (
                          <button
                            key={agent.id}
                            className={`ao-agent-card ${selectedAgents[slot] === agent.id ? 'ao-agent-selected' : ''}`}
                            style={selectedAgents[slot] === agent.id ? { borderColor: agent.color, borderLeftWidth: '3px', borderLeftColor: agent.color } : undefined}
                            onClick={() => handleSelectAgent(slot, agent.id)}
                          >
                            <div className="ao-agent-portrait" style={{ background: agent.color + '22' }}>
                              <div className="ao-agent-initial" style={{ color: agent.color }}>{agent.name[0]}</div>
                            </div>
                            <div className="ao-agent-info">
                              <div className="ao-agent-name">{agent.name}</div>
                              <div className="ao-agent-title">{agent.title}</div>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Tools for this slot */}
                      <div className="ao-tools-row">
                        {TOOLS.map(tool => (
                          <button
                            key={tool.id}
                            className={`ao-tool-toggle ${(enabledTools[slot] || []).includes(tool.id) ? 'ao-tool-on' : ''}`}
                            onClick={() => handleToggleTool(slot, tool.id)}
                          >
                            <ToolIconSvg icon={tool.icon} size={14} />
                            <span>{tool.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Instructions for this slot */}
                      <textarea
                        className="ao-instructions"
                        placeholder="Write instructions for this agent..."
                        value={instructions[slot] || ''}
                        onChange={(e) => handleInstructionChange(slot, e.target.value)}
                      />
                      {(() => {
                        const c = getClarity(instructions[slot] || '')
                        return (
                          <div className="ao-clarity-wrap">
                            <div className="ao-clarity">
                              <div className="ao-clarity-fill" style={{ width: `${c.percent}%`, background: c.color }} />
                            </div>
                            <span className="ao-clarity-label" style={{ color: c.color }}>{c.label}</span>
                          </div>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="ao-section-label">Assign Agent</div>

                  {/* Agent recommendation hint for Level 4 */}
                  {level.bestAgent && (
                    <div className="ao-hint-card">
                      <TipIcon size={16} color="#eab308" />
                      <span>Match the agent to the task complexity. Not every agent is right for every task.</span>
                    </div>
                  )}

                  <div className="ao-agent-grid">
                    {AGENTS.map(agent => (
                      <button
                        key={agent.id}
                        className={`ao-agent-card ${selectedAgents[0] === agent.id ? 'ao-agent-selected' : ''}`}
                        style={selectedAgents[0] === agent.id ? { borderColor: agent.color, borderLeftWidth: '3px', borderLeftColor: agent.color } : undefined}
                        onClick={() => handleSelectAgent(0, agent.id)}
                      >
                        <div className="ao-agent-portrait" style={{ background: agent.color + '22' }}>
                          <div className="ao-agent-initial" style={{ color: agent.color }}>{agent.name[0]}</div>
                        </div>
                        <div className="ao-agent-info">
                          <div className="ao-agent-name">{agent.name}</div>
                          <div className="ao-agent-title">{agent.title}</div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Level 3 templates */}
                  {level.templates && (
                    <div className="ao-templates">
                      <div className="ao-section-label">Example Instructions</div>
                      {level.templates.map(t => (
                        <button
                          key={t.quality}
                          className={`ao-template-btn ao-template-${t.quality}`}
                          onClick={() => handleInstructionChange(0, t.text)}
                        >
                          <span className="ao-template-label">{t.label}</span>
                          <span className="ao-template-preview">{t.text.slice(0, 50)}...</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="ao-section-label">Tools</div>
                  <div className="ao-tools-row">
                    {TOOLS.map(tool => (
                      <button
                        key={tool.id}
                        className={`ao-tool-toggle ${(enabledTools[0] || []).includes(tool.id) ? 'ao-tool-on' : ''}`}
                        onClick={() => handleToggleTool(0, tool.id)}
                      >
                        <ToolIconSvg icon={tool.icon} size={14} />
                        <span>{tool.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="ao-section-label">Instructions</div>
                  <textarea
                    className="ao-instructions"
                    placeholder="Tell your agent exactly what to do and how to do it."
                    value={instructions[0] || ''}
                    onChange={(e) => handleInstructionChange(0, e.target.value)}
                  />
                  {(() => {
                    const c = getClarity(instructions[0] || '')
                    return (
                      <div className="ao-clarity-wrap">
                        <div className="ao-clarity">
                          <div className="ao-clarity-fill" style={{ width: `${c.percent}%`, background: c.color }} />
                        </div>
                        <span className="ao-clarity-label" style={{ color: c.color }}>{c.label}</span>
                      </div>
                    )
                  })()}
                </>
              )}

              {/* Hint after 3 failed attempts */}
              {(levelAttempts[currentLevel] || 0) >= 3 && level.hint && (
                <div className="ao-attempt-hint ao-fade-in">
                  <div className="ao-attempt-hint-header">
                    <TipIcon size={16} color="#eab308" />
                    <span>Hint &mdash; struggling? Here is what works:</span>
                  </div>
                  <div className="ao-attempt-hint-body">
                    <div className="ao-attempt-hint-row"><strong>Agent:</strong> {level.hint.agent}</div>
                    <div className="ao-attempt-hint-row"><strong>Tools:</strong> {level.hint.tools}</div>
                    <div className="ao-attempt-hint-row"><strong>Instructions:</strong> {level.hint.instructions}</div>
                  </div>
                </div>
              )}

              {failureMsg && gamePhase === 'assign' && (
                <div className="ao-deploy-error">
                  <CrossIcon size={14} color="#FF3B30" />
                  <span>{failureMsg}</span>
                </div>
              )}

              <button
                className="ao-deploy-btn"
                disabled={!canDeploy()}
                onClick={handleDeploy}
              >
                Deploy
              </button>
            </>
          )}

          {/* Working / Result output */}
          {(gamePhase === 'working' || gamePhase === 'result') && (
            <div className="ao-output-section">
              {/* Tabs for multi-agent */}
              {slotCount > 1 && (
                <div className="ao-output-tabs">
                  {Array.from({ length: slotCount }, (_, i) => {
                    const agentId = selectedAgents[i]
                    const agent = AGENTS.find(a => a.id === agentId)
                    return (
                      <button
                        key={i}
                        className={`ao-output-tab ${activeOutputTab === i ? 'ao-output-tab-active' : ''}`}
                        onClick={() => setActiveOutputTab(i)}
                        style={activeOutputTab === i && agent ? { borderBottomColor: agent.color } : undefined}
                      >
                        {agent?.name || `Slot ${i + 1}`}
                        {apiLoading[i] && <span className="ao-spinner" />}
                        {slotStars[i] !== undefined && !apiLoading[i] && (
                          <span className="ao-tab-stars">{'\u2605'.repeat(slotStars[i])}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="ao-output-panel">
                {(() => {
                  const slot = slotCount > 1 ? activeOutputTab : 0
                  const agentId = selectedAgents[slot]
                  const agent = AGENTS.find(a => a.id === agentId)
                  const loading = apiLoading[slot]
                  const text = displayedText[slot]
                  const stars = slotStars[slot]

                  return (
                    <>
                      <div className="ao-output-header">
                        {agent && (
                          <span className="ao-output-agent-badge" style={{ background: agent.color + '22', color: agent.color }}>
                            {agent.name}
                          </span>
                        )}
                        {loading && <span className="ao-output-working"><span className="ao-spinner" /> Working...</span>}
                      </div>

                      {text && <div className="ao-output-text">{text}</div>}

                      {/* Tool badges */}
                      {(enabledTools[slot] || []).length > 0 && (
                        <div className="ao-tool-badges">
                          {(enabledTools[slot] || []).map(tid => {
                            const t = TOOLS.find(tool => tool.id === tid)
                            return t ? <span key={tid} className="ao-tool-badge"><ToolIconSvg icon={t.icon} size={12} color="#F59E0B" /> {t.name}</span> : null
                          })}
                        </div>
                      )}

                      {stars !== undefined && !loading && (
                        <div className="ao-result-row">
                          <StarDisplay count={stars} total={3} animate />
                          {slotReasons[slot] && <span className="ao-result-reason">{slotReasons[slot]}</span>}
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Failure message */}
              {failureMsg && (
                <div className="ao-failure-banner">
                  <CrossIcon size={16} color="#FF3B30" />
                  <span>{failureMsg}</span>
                  <button className="ao-retry-btn" onClick={handleRetry}>Retry</button>
                </div>
              )}

              {/* Learn card */}
              {showLearnCard && gamePhase === 'result' && (
                <div className="ao-learn-card">
                  <div className="ao-learn-title">{level.learnTitle}</div>
                  <div className="ao-learn-text">{level.learnText}</div>
                </div>
              )}

              {/* Actions */}
              {gamePhase === 'result' && !failureMsg && (
                <div className="ao-result-actions">
                  <button className="ao-deploy-btn" onClick={handleLevelComplete}>
                    {currentLevel < 6 ? 'Next Level \u2192' : 'See Results'}
                  </button>
                  <button className="ao-retry-link" onClick={handleRetry}>
                    Retry this level
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AgentOffice
