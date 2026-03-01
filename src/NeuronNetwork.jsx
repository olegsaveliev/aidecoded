import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useRelease } from './ReleaseContext'

/* ── Data ── */

const GROUP_COLORS = {
  tools: '#0071E3',
  foundations: '#AF52DE',
  skills: '#34C759',
  advanced: '#FF9500',
  play: '#F59E0B',
  professional: '#0EA5E9',
  security: '#EF4444',
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
  { id: 'generative-ai', label: 'Generative AI', group: 'foundations', desc: 'How AI creates images, music, video and code' },
  { id: 'precision-recall', label: 'Precision/Recall', group: 'foundations', desc: 'Why accuracy lies and what to measure instead' },
  { id: 'computer-vision', label: 'Computer Vision', group: 'foundations', desc: 'How machines learn to see' },
  { id: 'rag', label: 'RAG', group: 'advanced', desc: 'How AI learns from YOUR documents' },
  { id: 'agentic-ai', label: 'Agentic AI', group: 'advanced', desc: 'AI that plans, acts and learns autonomously' },
  { id: 'rag-under-the-hood', label: 'Why RAG Fails', group: 'advanced', desc: 'Fix every layer of your RAG pipeline' },
  { id: 'ai-in-production', label: 'AI in Prod', group: 'advanced', desc: 'Monitor quality, latency, cost and drift' },
  { id: 'agent-teams', label: 'Agent Teams', group: 'advanced', desc: 'Multiple agents coordinating in parallel' },
  { id: 'custom-agents', label: 'Custom Agents', group: 'advanced', desc: 'Define specialist AI assistants in Markdown' },
  { id: 'prompt-engineering', label: 'Prompt Eng.', group: 'skills', desc: 'Write better prompts for better results' },
  { id: 'context-engineering', label: 'Context Eng.', group: 'skills', desc: 'Give AI the right context every time' },
  { id: 'ai-safety', label: 'AI Safety', group: 'skills', desc: 'Why AI hallucinates and how to stop it' },
  { id: 'ai-fluency', label: 'AI Fluency', group: 'skills', desc: 'Habits that separate AI power users' },
  { id: 'choosing-ai-model', label: 'Choosing Model', group: 'skills', desc: 'Match any task to the right AI model' },
  { id: 'ollama', label: 'Run AI Locally', group: 'skills', desc: 'Run open-source AI models locally' },
  { id: 'claude-code', label: 'Claude Code', group: 'skills', desc: 'AI pair programmer in your terminal' },
  { id: 'claude-skills', label: 'Claude Skills', group: 'skills', desc: 'Teach Claude permanent expertise' },
  { id: 'spec-driven-dev', label: 'Spec-Driven Dev', group: 'skills', desc: 'Write specs before AI writes code' },
  { id: 'ai-coding-tools', label: 'AI Coding Tools', group: 'skills', desc: 'Cursor, Copilot, Windsurf and more' },
  { id: 'prompt-heist', label: 'Prompt Heist', group: 'play', desc: 'Outsmart AI security with the perfect prompt' },
  { id: 'ai-lab-explorer', label: 'Lab Explorer', group: 'play', desc: 'Explore an AI research lab room by room' },
  { id: 'ai-city-builder', label: 'City Builder', group: 'play', desc: 'Solve AI mysteries, build your city' },
  { id: 'token-budget', label: 'Token Budget', group: 'play', desc: 'Rewrite prompts to fit strict token budgets' },
  { id: 'ai-ethics-tribunal', label: 'Ethics Tribunal', group: 'play', desc: 'Navigate ethical dilemmas in AI systems' },
  { id: 'pm-simulator', label: 'PM Simulator', group: 'play', desc: 'Ship an AI feature as the PM' },
  { id: 'ai-startup-simulator', label: 'Startup Sim', group: 'play', desc: 'Build an AI startup from zero to launch' },
  { id: 'alignment-game', label: 'Alignment Game', group: 'play', desc: 'Stop AI from gaming your goals' },
  { id: 'label-master', label: 'Label Master', group: 'play', desc: 'Draw bounding boxes for training data' },
  { id: 'draw-and-deceive', label: 'Draw & Deceive', group: 'play', desc: 'Draw pixel art and fool GPT-4o vision' },
  { id: 'agent-office', label: 'Agent Office', group: 'play', desc: 'Run a pixel art AI startup with agents' },
  { id: 'model-training-tycoon', label: 'Training Tycoon', group: 'play', desc: 'Allocate $50K across model training phases' },
  { id: 'system-design-interview', label: 'System Design', group: 'play', desc: 'Design AI systems under pressure' },
  { id: 'prompt-injection-lab', label: 'Injection Lab', group: 'play', desc: 'Attack or defend AI in a prompt lab' },
  { id: 'skill-builder-challenge', label: 'Skill Builder', group: 'play', desc: 'Build skills through interactive challenges' },
  { id: 'ai-native-pm', label: 'AI-Native PM', group: 'professional', desc: 'What AI engineers need from PMs' },
  { id: 'ai-pm-workflows', label: 'PM Workflows', group: 'professional', desc: 'Prompts and rhythms for AI-native PMs' },
  { id: 'prompt-injection', label: 'Prompt Injection', group: 'security', desc: 'The #1 AI security risk' },
]

const CONNECTIONS = [
  ['playground', 'how-llms-work'], ['playground', 'deep-learning'],
  ['tokenizer', 'how-llms-work'], ['tokenizer', 'deep-learning'], ['tokenizer', 'machine-learning'],
  ['generation', 'deep-learning'], ['generation', 'machine-learning'],
  ['how-llms-work', 'model-training'], ['how-llms-work', 'rag'],
  ['deep-learning', 'model-training'], ['deep-learning', 'fine-tuning'],
  ['machine-learning', 'neural-networks'], ['machine-learning', 'fine-tuning'], ['machine-learning', 'rag'],
  ['neural-networks', 'deep-learning'], ['neural-networks', 'model-training'],
  ['neural-networks', 'precision-recall'], ['neural-networks', 'computer-vision'],
  ['deep-learning', 'computer-vision'], ['machine-learning', 'computer-vision'],
  ['computer-vision', 'generative-ai'], ['machine-learning', 'agentic-ai'], ['machine-learning', 'prompt-heist'],
  ['model-training', 'prompt-engineering'], ['model-training', 'context-engineering'],
  ['fine-tuning', 'context-engineering'], ['fine-tuning', 'ai-lab-explorer'],
  ['rag', 'context-engineering'], ['rag', 'ai-lab-explorer'], ['rag', 'agentic-ai'],
  ['agentic-ai', 'context-engineering'], ['agentic-ai', 'ai-lab-explorer'],
  ['prompt-heist', 'ai-city-builder'], ['prompt-heist', 'ai-lab-explorer'], ['prompt-heist', 'token-budget'],
  ['tokenizer', 'token-budget'], ['ai-city-builder', 'ai-ethics-tribunal'],
  ['machine-learning', 'ai-ethics-tribunal'], ['ai-ethics-tribunal', 'pm-simulator'],
  ['ai-native-pm', 'pm-simulator'],
  ['how-llms-work', 'generative-ai'], ['model-training', 'generative-ai'], ['deep-learning', 'generative-ai'],
  ['generative-ai', 'rag'],
  ['prompt-engineering', 'ai-native-pm'], ['context-engineering', 'ai-native-pm'],
  ['agentic-ai', 'ai-native-pm'], ['fine-tuning', 'ai-native-pm'],
  ['prompt-engineering', 'ai-safety'], ['context-engineering', 'ai-safety'],
  ['rag', 'ai-safety'], ['agentic-ai', 'ai-safety'],
  ['prompt-engineering', 'ai-fluency'], ['context-engineering', 'ai-fluency'],
  ['ai-safety', 'ai-fluency'], ['agentic-ai', 'ai-fluency'],
  ['pm-simulator', 'ai-startup-simulator'], ['rag', 'ai-startup-simulator'], ['fine-tuning', 'ai-startup-simulator'],
  ['machine-learning', 'precision-recall'], ['deep-learning', 'precision-recall'], ['model-training', 'precision-recall'],
  ['precision-recall', 'ai-safety'],
  ['rag', 'rag-under-the-hood'], ['agentic-ai', 'rag-under-the-hood'],
  ['context-engineering', 'rag-under-the-hood'], ['fine-tuning', 'rag-under-the-hood'],
  ['rag-under-the-hood', 'ai-in-production'], ['agentic-ai', 'ai-in-production'],
  ['ai-safety', 'ai-in-production'], ['precision-recall', 'ai-in-production'],
  ['ai-ethics-tribunal', 'alignment-game'], ['ai-safety', 'alignment-game'], ['prompt-heist', 'alignment-game'],
  ['prompt-engineering', 'choosing-ai-model'], ['ai-fluency', 'choosing-ai-model'],
  ['ai-in-production', 'choosing-ai-model'], ['rag-under-the-hood', 'choosing-ai-model'],
  ['choosing-ai-model', 'ollama'], ['rag-under-the-hood', 'ollama'],
  ['fine-tuning', 'ollama'], ['prompt-engineering', 'ollama'],
  ['computer-vision', 'label-master'], ['precision-recall', 'label-master'],
  ['computer-vision', 'draw-and-deceive'], ['alignment-game', 'draw-and-deceive'], ['ai-ethics-tribunal', 'draw-and-deceive'],
  ['agentic-ai', 'agent-office'], ['claude-code', 'agent-office'],
  ['draw-and-deceive', 'agent-office'], ['alignment-game', 'agent-office'],
  ['ollama', 'claude-code'], ['agentic-ai', 'claude-code'],
  ['prompt-engineering', 'claude-code'], ['fine-tuning', 'claude-code'],
  ['agentic-ai', 'agent-teams'], ['claude-code', 'agent-teams'],
  ['agent-office', 'agent-teams'], ['ai-in-production', 'agent-teams'],
  ['agent-teams', 'custom-agents'], ['claude-code', 'custom-agents'],
  ['agentic-ai', 'custom-agents'], ['agent-office', 'custom-agents'],
  ['model-training', 'model-training-tycoon'], ['ai-startup-simulator', 'model-training-tycoon'],
  ['fine-tuning', 'model-training-tycoon'], ['deep-learning', 'model-training-tycoon'],
  ['claude-code', 'claude-skills'], ['custom-agents', 'claude-skills'],
  ['spec-driven-dev', 'claude-skills'], ['prompt-engineering', 'claude-skills'],
  ['claude-code', 'spec-driven-dev'], ['agentic-ai', 'spec-driven-dev'],
  ['prompt-engineering', 'spec-driven-dev'], ['context-engineering', 'spec-driven-dev'],
  ['claude-code', 'ai-coding-tools'], ['spec-driven-dev', 'ai-coding-tools'],
  ['agentic-ai', 'ai-coding-tools'], ['prompt-engineering', 'ai-coding-tools'],
  ['ai-native-pm', 'ai-pm-workflows'], ['spec-driven-dev', 'ai-pm-workflows'],
  ['prompt-engineering', 'ai-pm-workflows'], ['agentic-ai', 'ai-pm-workflows'],
  ['ai-in-production', 'system-design-interview'], ['agentic-ai', 'system-design-interview'],
  ['rag-under-the-hood', 'system-design-interview'], ['model-training-tycoon', 'system-design-interview'],
  ['ai-in-production', 'prompt-injection'], ['agentic-ai', 'prompt-injection'], ['ai-safety', 'prompt-injection'],
  ['prompt-injection', 'prompt-injection-lab'], ['system-design-interview', 'prompt-injection-lab'],
  ['agentic-ai', 'prompt-injection-lab'],
  ['prompt-engineering', 'skill-builder-challenge'], ['ai-fluency', 'skill-builder-challenge'], ['prompt-heist', 'skill-builder-challenge'],
]

/* ── Layout ── */

const NODE_R = 7
const SETTLE_TIME = 2.0
const CONNECT_FADE = 1.0

function computeLayout(w, h, nodes) {
  const cx = w / 2
  const cy = h / 2
  const maxR = Math.min(w * 0.46, h * 0.43)
  const stretch = w > h ? 1.2 : 0.9 // wider on landscape

  // Exclusion zone around the title — no nodes here
  // Wider on landscape mobile where vertical space is tight
  const landscape = w > h
  const exHalfW = Math.max(180, w * (landscape ? 0.22 : 0.18))
  const exHalfH = Math.max(120, h * (landscape ? 0.18 : 0.14))

  const ringDef = [
    { groups: ['tools'], rFactor: 0.28 },
    { groups: ['foundations'], rFactor: 0.50 },
    { groups: ['skills', 'advanced', 'professional', 'security'], rFactor: 0.75 },
    { groups: ['play'], rFactor: 0.96 },
  ]

  const positions = new Array(nodes.length)
  let angleOffset = -Math.PI / 5

  ringDef.forEach(({ groups, rFactor }) => {
    const indices = []
    nodes.forEach((n, i) => { if (groups.includes(n.group)) indices.push(i) })
    const r = maxR * rFactor
    const step = (Math.PI * 2) / indices.length

    indices.forEach((nodeIdx, i) => {
      const angle = angleOffset + i * step - Math.PI / 2
      let px = cx + r * stretch * Math.cos(angle)
      let py = cy + r * Math.sin(angle)

      // Push out of exclusion zone if overlapping
      const dx = px - cx
      const dy = py - cy
      const normX = Math.abs(dx) / exHalfW
      const normY = Math.abs(dy) / exHalfH
      if (normX < 1 && normY < 1) {
        // Inside exclusion — push radially outward until clear
        const dist = Math.sqrt(dx * dx + dy * dy)
        const dirX = dist > 0 ? dx / dist : Math.cos(angle)
        const dirY = dist > 0 ? dy / dist : Math.sin(angle)
        // Find the minimum scale to exit the box
        const scaleX = Math.abs(dirX) > 0.001 ? exHalfW / Math.abs(dirX) : Infinity
        const scaleY = Math.abs(dirY) > 0.001 ? exHalfH / Math.abs(dirY) : Infinity
        const pushDist = Math.min(scaleX, scaleY) + 20 // 20px margin
        px = cx + dirX * pushDist
        py = cy + dirY * pushDist
      }

      positions[nodeIdx] = { x: px, y: py, phase: Math.random() * Math.PI * 2 }
    })
    angleOffset += 0.35
  })

  // Repulsion pass — push overlapping nodes apart
  const minDist = NODE_R * 5.5 // minimum center-to-center distance
  for (let iter = 0; iter < 20; iter++) {
    for (let i = 0; i < positions.length; i++) {
      if (!positions[i]) continue
      for (let j = i + 1; j < positions.length; j++) {
        if (!positions[j]) continue
        const dx = positions[j].x - positions[i].x
        const dy = positions[j].y - positions[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist && dist > 0) {
          const overlap = (minDist - dist) / 2
          const nx = dx / dist
          const ny = dy / dist
          positions[i].x -= nx * overlap
          positions[i].y -= ny * overlap
          positions[j].x += nx * overlap
          positions[j].y += ny * overlap
        }
      }
    }
  }

  return positions
}

/* ── Component ── */

function drawLock(ctx, x, y, size) {
  const s = size
  // Shackle (arc)
  ctx.beginPath()
  ctx.arc(x, y - s * 0.25, s * 0.35, Math.PI, 0)
  ctx.lineWidth = s * 0.15
  ctx.stroke()
  // Body (rounded rect)
  const bw = s * 0.8
  const bh = s * 0.55
  const bx = x - bw / 2
  const by = y
  const br = s * 0.1
  ctx.beginPath()
  ctx.moveTo(bx + br, by)
  ctx.lineTo(bx + bw - br, by)
  ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
  ctx.lineTo(bx + bw, by + bh - br)
  ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
  ctx.lineTo(bx + br, by + bh)
  ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
  ctx.lineTo(bx, by + br)
  ctx.quadraticCurveTo(bx, by, bx + br, by)
  ctx.closePath()
  ctx.fill()
}

function NeuronNetwork({ fire, onSelectTab }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)
  const hoveredRef = useRef(null)
  const rectRef = useRef(null)
  const isModuleLockedRef = useRef(null)
  const { isModuleLocked } = useAuth()
  isModuleLockedRef.current = isModuleLocked
  const { hiddenModules } = useRelease()

  useEffect(() => {
    if (!fire) return
    const canvas = canvasRef.current
    if (!canvas) return

    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = window.devicePixelRatio || 1
    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = w + 'px'
    canvas.style.height = h + 'px'
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    rectRef.current = canvas.getBoundingClientRect()

    // Filter hidden modules
    let visibleNodes = NODES.filter(n => !hiddenModules.has(n.id))

    // Landscape mobile — limit to 10 random nodes
    if (h < 500 && visibleNodes.length > 10) {
      const shuffled = visibleNodes.slice().sort(() => Math.random() - 0.5)
      visibleNodes = shuffled.slice(0, 10)
    }

    const visibleIds = new Set(visibleNodes.map(n => n.id))
    const visibleConns = CONNECTIONS
      .filter(([a, b]) => visibleIds.has(a) && visibleIds.has(b))
    const visibleNodeMap = {}
    visibleNodes.forEach((n, i) => { visibleNodeMap[n.id] = i })
    const visibleConnPairs = visibleConns
      .map(([a, b]) => [visibleNodeMap[a], visibleNodeMap[b]])
      .filter(([a, b]) => a != null && b != null)

    const layout = computeLayout(w, h, visibleNodes)
    const cx = w / 2
    const cy = h / 2
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Module particles — one per node
    const particles = visibleNodes.map((node, i) => {
      const target = layout[i]
      if (!target) return null
      const angle = Math.atan2(target.y - cy, target.x - cx) + (Math.random() - 0.5) * 1.0
      const speed = 500 + Math.random() * 400
      return {
        x: reduceMotion ? target.x : cx + (Math.random() - 0.5) * 30,
        y: reduceMotion ? target.y : cy + (Math.random() - 0.5) * 15,
        vx: reduceMotion ? 0 : Math.cos(angle) * speed,
        vy: reduceMotion ? 0 : Math.sin(angle) * speed,
        tx: target.x, ty: target.y,
        phase: target.phase,
        color: GROUP_COLORS[node.group],
        label: node.label,
        desc: node.desc,
        id: node.id,
        locked: isModuleLockedRef.current(node.id),
      }
    }).filter(Boolean)

    // Decorative sparks — burst and fade (skip if reduced motion)
    const sparks = reduceMotion ? [] : Array.from({ length: 30 }, () => {
      const a = Math.random() * Math.PI * 2
      const s = 200 + Math.random() * 600
      const colors = Object.values(GROUP_COLORS)
      return {
        x: cx, y: cy,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        size: 1.5 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0 + Math.random() * 0.8, age: 0,
      }
    })

    // Traveling dots — one per connection, random phase offset
    const travelers = visibleConnPairs.map(([ai, bi]) => ({
      ai, bi,
      phase: Math.random(), // 0-1, stagger start positions
      speed: 0.15 + Math.random() * 0.1, // full trip in ~5-7s
    }))

    const startTime = reduceMotion
      ? performance.now() - (SETTLE_TIME + CONNECT_FADE + 1) * 1000
      : performance.now()
    let lastTime = performance.now()
    stateRef.current = { particles, sparks, travelers, w, h, cx, cy, startTime, reduceMotion }

    // Cache label color; update on theme change via MutationObserver
    const readLabelColor = () => getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6e6e73'
    let labelColor = readLabelColor()
    const themeObserver = new MutationObserver(() => { labelColor = readLabelColor() })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    function draw(now) {
      const state = stateRef.current
      if (!state) return
      const elapsed = (now - state.startTime) / 1000
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      ctx.clearRect(0, 0, state.w, state.h)

      // Spring physics — frame-rate independent (only during burst)
      const settled = elapsed > SETTLE_TIME
      if (!settled) {
        const springT = Math.min(1, Math.max(0, (elapsed - 0.15) / 1.5))
        const spring = springT * springT * 15
        const damp = Math.pow(0.91, dt * 60)

        for (const p of state.particles) {
          p.vx += (p.tx - p.x) * spring * dt
          p.vy += (p.ty - p.y) * spring * dt
          p.vx *= damp
          p.vy *= damp
          p.x += p.vx * dt
          p.y += p.vy * dt
        }
      }
      const sparkDamp = Math.pow(0.98, dt * 60)

      // Sparks
      for (const s of state.sparks) {
        s.age += dt
        s.vx *= sparkDamp
        s.vy *= sparkDamp
        s.x += s.vx * dt
        s.y += s.vy * dt
      }

      const connectAlpha = Math.min(1, Math.max(0, (elapsed - SETTLE_TIME) / CONNECT_FADE)) * 0.2
      const labelAlpha = Math.min(1, Math.max(0, (elapsed - SETTLE_TIME - 0.2) / 0.6))
      const hovered = hoveredRef.current

      // Connections + traveling dots
      if (connectAlpha > 0) {
        const dotAlpha = Math.min(1, Math.max(0, (elapsed - SETTLE_TIME - CONNECT_FADE) / 0.5))

        ctx.lineWidth = 0.5
        for (const [ai, bi] of visibleConnPairs) {
          const a = state.particles[ai]
          const b = state.particles[bi]
          if (!a || !b) continue
          const highlighted = hovered === a.id || hovered === b.id
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.strokeStyle = a.color
          ctx.globalAlpha = highlighted ? connectAlpha * 3 : connectAlpha
          ctx.stroke()
        }

        // Traveling dots along connections
        if (dotAlpha > 0) {
          for (const t of state.travelers) {
            const a = state.particles[t.ai]
            const b = state.particles[t.bi]
            if (!a || !b) continue
            // Progress along the path (0→1 loop)
            const prog = ((elapsed * t.speed + t.phase) % 1)
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dotX = a.x + dx * prog
            const dotY = a.y + dy * prog
            const highlighted = hovered === a.id || hovered === b.id

            ctx.beginPath()
            ctx.arc(dotX, dotY, highlighted ? 2.5 : 1.8, 0, Math.PI * 2)
            ctx.fillStyle = a.color
            ctx.globalAlpha = dotAlpha * (highlighted ? 0.9 : 0.45)
            ctx.fill()
          }
        }
      }

      // Sparks
      for (const s of state.sparks) {
        if (s.age >= s.life) continue
        const prog = s.age / s.life
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size * (1 - prog * 0.5), 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.globalAlpha = (1 - prog) * 0.6
        ctx.fill()
      }

      // Nodes
      for (const p of state.particles) {
        const isHov = hovered === p.id
        let drawX = p.x
        let drawY = p.y

        // Idle float (skip if reduced motion)
        if (settled && !state.reduceMotion) {
          drawX = p.tx + Math.sin(now * 0.0007 + p.phase) * 2
          drawY = p.ty + Math.cos(now * 0.0009 + p.phase) * 1.5
          p.x = drawX
          p.y = drawY
        } else if (settled) {
          drawX = p.tx
          drawY = p.ty
        }

        const r = settled ? NODE_R : Math.max(3, NODE_R * Math.min(1, elapsed / SETTLE_TIME))

        // Transition from filled to stroked: 0 = fully filled, 1 = fully stroked
        const hollowT = Math.min(1, Math.max(0, (elapsed - SETTLE_TIME) / 0.8))

        // Glow — unlocked nodes pulse gently
        const pulse = (!p.locked && settled) ? 0.5 + 0.5 * Math.sin(now * 0.003 + p.phase) : 0
        const glowR = r * 3 + pulse * r * 1.5
        const glowAlpha = isHov ? 0.18 : (0.06 + pulse * 0.06)
        ctx.beginPath()
        ctx.arc(drawX, drawY, glowR, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = glowAlpha
        ctx.fill()

        // Circle — filled during burst, transitions to stroke-only
        if (hollowT < 1) {
          ctx.beginPath()
          ctx.arc(drawX, drawY, r, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = (1 - hollowT) * (isHov ? 1 : 0.75)
          ctx.fill()
        }
        ctx.beginPath()
        ctx.arc(drawX, drawY, r, 0, Math.PI * 2)
        ctx.strokeStyle = p.color
        ctx.lineWidth = 1.5
        ctx.globalAlpha = isHov ? 1 : 0.75
        ctx.stroke()

        // Hover ring
        if (isHov) {
          ctx.beginPath()
          ctx.arc(drawX, drawY, r + 3, 0, Math.PI * 2)
          ctx.strokeStyle = p.color
          ctx.globalAlpha = 0.5
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Lock icon inside locked nodes
        if (p.locked && settled && labelAlpha > 0) {
          const lockSize = r * 0.7
          ctx.globalAlpha = labelAlpha * (isHov ? 1 : 0.7)
          ctx.fillStyle = p.color
          ctx.strokeStyle = p.color
          drawLock(ctx, drawX, drawY - lockSize * 0.15, lockSize)
        }

        // Label (smaller on landscape mobile)
        if (state.w > 500 && labelAlpha > 0) {
          const compact = state.h < 500
          const fontSize = isHov ? (compact ? 9 : 11) : (compact ? 7 : 9)
          ctx.globalAlpha = labelAlpha * (isHov ? 1 : (compact ? 0.4 : 0.55))
          ctx.fillStyle = isHov ? p.color : labelColor
          ctx.font = `500 ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText(p.label, drawX, drawY + r + (compact ? 10 : 13))
        }
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    // Resize handler — recompute layout and retarget particles
    const handleResize = () => {
      const s = stateRef.current
      if (!s) return
      const nw = window.innerWidth
      const nh = window.innerHeight
      const ndpr = window.devicePixelRatio || 1
      canvas.width = nw * ndpr
      canvas.height = nh * ndpr
      canvas.style.width = nw + 'px'
      canvas.style.height = nh + 'px'
      ctx.setTransform(ndpr, 0, 0, ndpr, 0, 0)
      rectRef.current = canvas.getBoundingClientRect()

      s.w = nw
      s.h = nh
      s.cx = nw / 2
      s.cy = nh / 2

      const newLayout = computeLayout(nw, nh, visibleNodes)
      for (let i = 0; i < s.particles.length; i++) {
        const target = newLayout[i]
        if (target) {
          s.particles[i].tx = target.x
          s.particles[i].ty = target.y
        }
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', handleResize)
      themeObserver.disconnect()
    }
  }, [fire, hiddenModules])

  // Mouse interaction (only after settled)
  const handleMouseMove = useCallback((e) => {
    const state = stateRef.current
    if (!state) return
    const elapsed = (performance.now() - state.startTime) / 1000
    if (elapsed < SETTLE_TIME) return

    const rect = rectRef.current
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    let found = null
    for (const p of state.particles) {
      const dx = p.x - mx, dy = p.y - my
      if (dx * dx + dy * dy < 400) { found = p; break }
    }

    hoveredRef.current = found ? found.id : null
    canvasRef.current.style.cursor = found ? 'pointer' : 'default'
  }, [])

  const handleClick = useCallback(() => {
    if (hoveredRef.current && onSelectTab) onSelectTab(hoveredRef.current)
  }, [onSelectTab])

  const handleLeave = useCallback(() => {
    hoveredRef.current = null
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const state = stateRef.current
    if (!state) return
    const elapsed = (performance.now() - state.startTime) / 1000
    if (elapsed < SETTLE_TIME) return

    const touch = e.changedTouches[0]
    if (!touch) return
    const rect = rectRef.current
    if (!rect) return
    const mx = touch.clientX - rect.left
    const my = touch.clientY - rect.top

    for (const p of state.particles) {
      const dx = p.x - mx, dy = p.y - my
      if (dx * dx + dy * dy < 400) {
        if (onSelectTab) onSelectTab(p.id)
        break
      }
    }
  }, [onSelectTab])

  return (
    <canvas
      ref={canvasRef}
      className="landing-network-canvas"
      role="img"
      aria-label="Interactive map of AI learning modules"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      onMouseLeave={handleLeave}
      onTouchEnd={handleTouchEnd}
    />
  )
}

export default NeuronNetwork
