import { useState, useEffect, useRef, useCallback } from 'react'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { TipIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import './DrawAndDeceive.css'

/* ══════════════════════════════════════════
   CONSTANTS
   ══════════════════════════════════════════ */

const GRID_SIZE = 32
const RENDER_SIZE = 256
const MAX_UNDO_STEPS = 10

const COLORS = [
  { hex: '#111827', name: 'Black' },
  { hex: '#374151', name: 'Dark gray' },
  { hex: '#9CA3AF', name: 'Gray' },
  { hex: '#E5E7EB', name: 'Light gray' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#FDE047', name: 'Yellow' },
  { hex: '#22C55E', name: 'Green' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#FFFFFF', name: 'White' },
]

const ROUND_TARGETS = ['cat', 'house', 'sun', 'car', 'tree']

const ROUNDS = [
  {
    id: 1,
    title: 'Warm Up: Make It See',
    subtitle: 'Draw the target so GPT-4o can identify it.',
    timed: false,
    type: 'draw',
    lessonTitle: 'Image Classification',
    lesson: 'GPT-4o does not "see" your drawing the way you do. It detects statistical patterns: colour distributions, edge orientations, texture regions. Your 32×32 pixel art triggered those patterns strongly enough to return a classification.',
  },
  {
    id: 2,
    title: 'The Decoy',
    subtitle: 'Modify your Round 1 drawing so the AI misclassifies it.',
    timed: false,
    type: 'deceive',
    lessonTitle: 'Adversarial Vulnerability',
    lesson: 'You changed a few pixels and the AI flipped its answer. This is NOT because the AI is dumb. It is because CNNs learn shortcuts — they find the easiest patterns that work on training data, not the most robust ones. Those shortcuts can be exploited.',
  },
  {
    id: 3,
    title: 'Speed Round: Draw Fast',
    subtitle: 'New target. 30 seconds. Does speed matter?',
    timed: true,
    type: 'draw',
    lessonTitle: 'Speed vs Quality',
    lesson: 'The AI classified your rushed drawing just as fast as a careful one. CNNs process all pixels simultaneously in one forward pass — they do not get tired or slower with messy inputs.',
  },
  {
    id: 4,
    title: 'The Adversarial Round',
    subtitle: 'Draw a cat that makes the AI say "dog".',
    timed: false,
    type: 'adversarial',
    lessonTitle: 'Adversarial Examples (Real)',
    lesson: 'What you just created exists in the real world. Researchers have shown stop signs with a few stickers that self-driving cars misread. Medical scans altered by imperceptible noise that AI misdiagnoses. This is one of the active research areas in AI safety.',
  },
  {
    id: 5,
    title: 'Boss Round: Fool the Confident AI',
    subtitle: 'Make the AI very confident about the wrong thing.',
    timed: false,
    type: 'overconfidence',
    lessonTitle: 'Overconfidence',
    lesson: 'The most dangerous AI behaviour is being very wrong very confidently. A model that says "60% cat" when it is wrong is manageable. A model that says "99% cat" when it is wrong can cause real harm. Calibration — making confidence match accuracy — is an active research problem.',
  },
]

const CONCEPTS = [
  { name: 'Image Classification', definition: 'The task of assigning a label to an image based on detected patterns. CNNs learn to recognize edges, textures, and shapes during training.' },
  { name: 'Confidence Scores', definition: 'A model\'s estimated probability that its prediction is correct. High confidence does not guarantee correctness — calibration is an active research area.' },
  { name: 'Adversarial Examples', definition: 'Inputs deliberately crafted to fool a model while appearing normal to humans. Small pixel changes can cause dramatic misclassification.' },
  { name: 'Pattern Matching', definition: 'Neural networks learn statistical shortcuts in training data. They detect patterns, not objects — which is why they can be fooled by inputs that match the wrong pattern.' },
  { name: 'Overconfidence', definition: 'When a model assigns very high probability to an incorrect prediction. This is one of the most dangerous failure modes in production AI systems.' },
]

function createEmptyGrid() {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => '#FFFFFF')
  )
}

function cloneGrid(grid) {
  return grid.map(row => [...row])
}

/* ══════════════════════════════════════════
   STAR DISPLAY
   ══════════════════════════════════════════ */

function StarDisplay({ count, total, animate }) {
  return (
    <div className="dd-stars">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`dd-star ${i < count ? 'dd-star-earned' : ''}`}
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
   CONCEPT PILL
   ══════════════════════════════════════════ */

function ConceptPill({ concept, index, expanded, onToggle }) {
  return (
    <div>
      <button
        className="dd-concept-pill"
        style={{ animationDelay: `${index * 0.12}s` }}
        onClick={onToggle}
      >
        {concept.name}
      </button>
      {expanded && (
        <div className="dd-concept-detail">{concept.definition}</div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════
   CANVAS RENDERER — grid to base64
   ══════════════════════════════════════════ */

function gridToBase64(pixels) {
  const canvas = document.createElement('canvas')
  canvas.width = RENDER_SIZE
  canvas.height = RENDER_SIZE
  const ctx = canvas.getContext('2d')
  const cellSize = RENDER_SIZE / GRID_SIZE

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.fillStyle = pixels[r][c]
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
    }
  }

  return canvas.toDataURL('image/png').replace('data:image/png;base64,', '')
}

function gridToDataUrl(pixels) {
  const canvas = document.createElement('canvas')
  canvas.width = RENDER_SIZE
  canvas.height = RENDER_SIZE
  const ctx = canvas.getContext('2d')
  const cellSize = RENDER_SIZE / GRID_SIZE

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      ctx.fillStyle = pixels[r][c]
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
    }
  }

  return canvas.toDataURL('image/png')
}

/* ══════════════════════════════════════════
   FLOOD FILL
   ══════════════════════════════════════════ */

function floodFill(grid, startRow, startCol, fillColor) {
  const target = grid[startRow][startCol]
  if (target === fillColor) return grid
  const newGrid = cloneGrid(grid)
  const stack = [[startRow, startCol]]

  while (stack.length > 0) {
    const [r, c] = stack.pop()
    if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) continue
    if (newGrid[r][c] !== target) continue
    newGrid[r][c] = fillColor
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1])
  }

  return newGrid
}

/* ══════════════════════════════════════════
   BRESENHAM LINE — smooth painting
   ══════════════════════════════════════════ */

function bresenhamLine(r0, c0, r1, c1) {
  const points = []
  let dr = Math.abs(r1 - r0)
  let dc = Math.abs(c1 - c0)
  let sr = r0 < r1 ? 1 : -1
  let sc = c0 < c1 ? 1 : -1
  let err = dr - dc
  let r = r0, c = c0

  while (true) {
    points.push([r, c])
    if (r === r1 && c === c1) break
    const e2 = 2 * err
    if (e2 > -dc) { err -= dc; r += sr }
    if (e2 < dr) { err += dr; c += sc }
  }

  return points
}

/* ══════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════ */

function DrawAndDeceive({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  /* Entry state */
  const [showEntry, setShowEntry] = usePersistedState('draw-and-deceive-entry', true)

  /* Game state */
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState('draw')
  const [currentTarget, setCurrentTarget] = useState(ROUND_TARGETS[0])
  const [aiResponse, setAiResponse] = useState(null)
  const [roundScores, setRoundScores] = useState([])
  const [savedRound1Drawing, setSavedRound1Drawing] = useState(null)

  const [timerActive, setTimerActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [showComplete, setShowComplete] = useState(false)
  const [roundDrawings, setRoundDrawings] = useState([])
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [showLesson, setShowLesson] = useState(false)

  /* Drawing state — canvas-based, no per-pixel React elements */
  const [activeColor, setActiveColor] = useState('#111827')
  const [tool, setTool] = useState('draw')
  const [brushSize, setBrushSize] = useState(1)
  const [showGrid, setShowGrid] = useState(true)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [canvasVersion, setCanvasVersion] = useState(0)

  /* Timer screen reader announcements */
  const [timerAnnouncement, setTimerAnnouncement] = useState('')

  /* Entry tagline stagger */
  const [entryTaglineStep, setEntryTaglineStep] = useState(0)

  /* Completion concept pill */
  const [expandedConcept, setExpandedConcept] = useState(null)
  const [expandedReplay, setExpandedReplay] = useState(null)

  /* Refs — pixel data + undo live in refs to avoid re-renders during drawing */
  const gameRef = useRef(null)
  const taglineTimerRef = useRef(null)
  const timerRef = useRef(null)
  const canvasRef = useRef(null)
  const pixelsRef = useRef(createEmptyGrid())
  const undoStackRef = useRef([])
  const isDrawingRef = useRef(false)
  const lastCellRef = useRef(null)
  const drawingSnapshotRef = useRef(null)
  const submittingRef = useRef(false)
  const handleSubmitRef = useRef(null)
  const showGridRef = useRef(true)
  const activeColorRef = useRef('#111827')
  const toolRef = useRef('draw')
  const brushSizeRef = useRef(1)

  /* Stable refs for auth callbacks (prevents useCallback identity churn) */
  const markModuleStartedRef = useRef(markModuleStarted)
  const markModuleCompleteRef = useRef(markModuleComplete)
  useEffect(() => { markModuleStartedRef.current = markModuleStarted }, [markModuleStarted])
  useEffect(() => { markModuleCompleteRef.current = markModuleComplete }, [markModuleComplete])

  const totalStars = roundScores.reduce((sum, s) => sum + s, 0)
  const currentRound = ROUNDS[round]

  /* ── Keep refs in sync with state (for event handlers that read refs) ── */
  useEffect(() => { showGridRef.current = showGrid }, [showGrid])
  useEffect(() => { activeColorRef.current = activeColor }, [activeColor])
  useEffect(() => { toolRef.current = tool }, [tool])
  useEffect(() => { brushSizeRef.current = brushSize }, [brushSize])

  /* ── Canvas rendering — draws pixel grid onto <canvas> ── */

  function renderCanvas() {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    const grid = pixelsRef.current
    const w = cvs.width
    const cellSize = w / GRID_SIZE

    /* White background — canvas is transparent by default, dark mode page would bleed through */
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, w, w)

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        ctx.fillStyle = grid[r][c]
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }

    if (showGridRef.current) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.lineWidth = 1
      for (let i = 1; i < GRID_SIZE; i++) {
        const pos = i * cellSize
        ctx.beginPath()
        ctx.moveTo(pos, 0)
        ctx.lineTo(pos, w)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(0, pos)
        ctx.lineTo(w, pos)
        ctx.stroke()
      }
    }
  }

  /* Callback ref — sets canvas ref */
  const setCanvasRef = useCallback((node) => {
    canvasRef.current = node
  }, [])

  /* Render canvas when it mounts or grid toggle/version/phase changes */
  useEffect(() => {
    renderCanvas()
  }, [showGrid, canvasVersion, phase, started])

  /* ── Entry tagline stagger ── */
  useEffect(() => {
    if (!showEntry) return
    const timers = []
    for (let i = 1; i <= 3; i++) {
      timers.push(setTimeout(() => setEntryTaglineStep(i), i * 300))
    }
    taglineTimerRef.current = timers
    return () => timers.forEach(clearTimeout)
  }, [showEntry])

  /* ── Timer for Round 3 ── */
  useEffect(() => {
    if (!timerActive) return
    if (timeRemaining <= 0) {
      setTimerActive(false)
      setTimerAnnouncement('Time is up! Submitting drawing.')
      handleSubmitRef.current?.()
      return
    }
    if (timeRemaining === 10) setTimerAnnouncement('10 seconds remaining')
    else if (timeRemaining === 5) setTimerAnnouncement('5 seconds remaining')
    timerRef.current = setTimeout(() => {
      setTimeRemaining(prev => prev - 1)
    }, 1000)
    return () => clearTimeout(timerRef.current)
  }, [timerActive, timeRemaining])

  /* ── Scroll to top on round change ── */
  useEffect(() => {
    scrollToTop()
  }, [round])

  /* ── Escape key closes replay modal ── */
  useEffect(() => {
    if (expandedReplay === null) return
    function onKey(e) {
      if (e.key === 'Escape') setExpandedReplay(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expandedReplay])

  /* ── Start game ── */
  const handleStart = useCallback(() => {
    setStarted(true)
    setCurrentTarget(ROUND_TARGETS[0])
    markModuleStartedRef.current('draw-and-deceive')
    if (ROUNDS[0].timed) {
      setTimerActive(true)
      setTimeRemaining(30)
    }
  }, [])

  /* ── Auto-start when entry dismissed but started hasn't been set (page refresh) ── */
  useEffect(() => {
    if (!showEntry && !started) {
      handleStart()
    }
  }, [showEntry, started, handleStart])

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (taglineTimerRef.current) taglineTimerRef.current.forEach(clearTimeout)
      clearTimeout(timerRef.current)
    }
  }, [])

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

  /* ── Reset ── */
  const handleReset = useCallback(() => {
    clearTimeout(timerRef.current)
    if (taglineTimerRef.current) taglineTimerRef.current.forEach(clearTimeout)
    pixelsRef.current = createEmptyGrid()
    undoStackRef.current = []
    isDrawingRef.current = false
    lastCellRef.current = null
    drawingSnapshotRef.current = null
    submittingRef.current = false
    setStarted(false)
    setRound(0)
    setPhase('draw')
    setCurrentTarget(ROUND_TARGETS[0])
    setAiResponse(null)
    setRoundScores([])
    setSavedRound1Drawing(null)
    setTimerActive(false)
    setTimeRemaining(30)
    setShowComplete(false)
    setRoundDrawings([])
    setError(null)
    setRetryCount(0)
    setShowLesson(false)
    setActiveColor('#111827')
    activeColorRef.current = '#111827'
    setTool('draw')
    toolRef.current = 'draw'
    setBrushSize(1)
    brushSizeRef.current = 1
    setShowGrid(true)
    showGridRef.current = true
    setShowClearConfirm(false)
    setShowHint(false)
    setExpandedConcept(null)
    setExpandedReplay(null)
    setTimerAnnouncement('')
    setCanvasVersion(v => v + 1)
    scrollToTop()
  }, [])

  /* ── Drawing logic — operates on refs, no React re-renders during strokes ── */

  function paintCells(grid, row, col) {
    const currentTool = toolRef.current
    const color = currentTool === 'erase' ? '#FFFFFF' : activeColorRef.current
    const size = brushSizeRef.current
    const half = Math.floor(size / 2)

    for (let dr = -half; dr < size - half; dr++) {
      for (let dc = -half; dc < size - half; dc++) {
        const nr = row + dr
        const nc = col + dc
        if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
          grid[nr][nc] = color
        }
      }
    }
  }

  function getCellFromEvent(e, cvs) {
    if (!cvs) return null
    const rect = cvs.getBoundingClientRect()
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top
    const cellW = rect.width / GRID_SIZE
    const cellH = rect.height / GRID_SIZE
    const col = Math.floor(x / cellW)
    const row = Math.floor(y / cellH)
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return null
    return { row, col }
  }

  function handlePointerDown(e) {
    if (phase !== 'draw') return
    if (e.touches && e.touches.length > 1) return
    setError(null)
    const cvs = canvasRef.current
    const cell = getCellFromEvent(e, cvs)
    if (!cell) return

    if (toolRef.current === 'fill') {
      const stack = undoStackRef.current
      stack.push(cloneGrid(pixelsRef.current))
      if (stack.length > MAX_UNDO_STEPS) stack.splice(0, stack.length - MAX_UNDO_STEPS)
      pixelsRef.current = floodFill(pixelsRef.current, cell.row, cell.col, activeColorRef.current)
      renderCanvas()
      setCanvasVersion(v => v + 1)
      return
    }

    drawingSnapshotRef.current = cloneGrid(pixelsRef.current)
    isDrawingRef.current = true
    lastCellRef.current = cell
    paintCells(pixelsRef.current, cell.row, cell.col)
    renderCanvas()
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current || phase !== 'draw') return
    if (e.touches && e.touches.length > 1) return
    const cvs = canvasRef.current
    const cell = getCellFromEvent(e, cvs)
    if (!cell) return
    const prev = lastCellRef.current
    if (prev) {
      const line = bresenhamLine(prev.row, prev.col, cell.row, cell.col)
      for (const [r, c] of line) {
        paintCells(pixelsRef.current, r, c)
      }
    } else {
      paintCells(pixelsRef.current, cell.row, cell.col)
    }
    lastCellRef.current = cell
    renderCanvas()
  }

  function handlePointerUp() {
    if (isDrawingRef.current && drawingSnapshotRef.current) {
      const stack = undoStackRef.current
      stack.push(drawingSnapshotRef.current)
      if (stack.length > MAX_UNDO_STEPS) stack.splice(0, stack.length - MAX_UNDO_STEPS)
      drawingSnapshotRef.current = null
      setCanvasVersion(v => v + 1)
    }
    isDrawingRef.current = false
    lastCellRef.current = null
  }

  function undo() {
    const stack = undoStackRef.current
    if (stack.length === 0) return
    pixelsRef.current = stack.pop()
    renderCanvas()
    setCanvasVersion(v => v + 1)
  }

  function handleClear() {
    setShowClearConfirm(true)
  }

  function confirmClear() {
    const stack = undoStackRef.current
    stack.push(cloneGrid(pixelsRef.current))
    if (stack.length > MAX_UNDO_STEPS) stack.splice(0, stack.length - MAX_UNDO_STEPS)
    pixelsRef.current = createEmptyGrid()
    renderCanvas()
    setShowClearConfirm(false)
    setCanvasVersion(v => v + 1)
  }

  /* ── Submit drawing for classification ── */

  async function classifyDrawing(pixelGrid, signal) {
    const base64 = gridToBase64(pixelGrid)

    const body = {
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'system',
          content: `You are a computer vision classifier analyzing pixel art drawings. The user has drawn a 32x32 pixel art image. Respond ONLY with valid JSON in this exact format:
{"label": "the main thing you see", "confidence": 87, "top5": [{"label": "cat", "confidence": 87}, {"label": "rabbit", "confidence": 8}, {"label": "fox", "confidence": 3}, {"label": "dog", "confidence": 1}, {"label": "squirrel", "confidence": 1}], "explanation": "One sentence explaining what visual features you detected."}
Confidence values must sum to 100. Be honest about uncertainty — pixel art can be ambiguous. Never refuse to classify.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${base64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: 'What do you see in this pixel art drawing?',
            },
          ],
        },
      ],
    }

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!res.ok) {
      if (res.status === 429) throw new Error('Rate limit reached. Wait a moment and try again.')
      if (res.status === 401 || res.status === 403) throw new Error('API authentication failed.')
      if (res.status >= 500) throw new Error('Server error. Try again.')
      throw new Error('Classification failed. Try again.')
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content || ''

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI returned an unexpected response. Try again.')

    return JSON.parse(jsonMatch[0])
  }

  async function handleSubmit() {
    if (phase !== 'draw' || submittingRef.current) return
    submittingRef.current = true
    setPhase('classifying')
    setError(null)
    clearTimeout(timerRef.current)
    setTimerActive(false)

    const currentPixels = pixelsRef.current
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    if (round === 0) {
      setSavedRound1Drawing(cloneGrid(currentPixels))
    }

    try {
      const result = await classifyDrawing(currentPixels, controller.signal)
      setAiResponse(result)
      setPhase('result')
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Try again.')
        setPhase('draw')
      } else if (retryCount < 1) {
        setRetryCount(prev => prev + 1)
        try {
          const result = await classifyDrawing(currentPixels, controller.signal)
          setAiResponse(result)
          setPhase('result')
        } catch (retryErr) {
          setError(retryErr.message || 'AI couldn\'t read the drawing. Try again.')
          setPhase('draw')
        }
      } else {
        setError(err.message || 'AI couldn\'t read the drawing. Try again.')
        setPhase('draw')
      }
    } finally {
      clearTimeout(timeout)
      submittingRef.current = false
    }
  }
  handleSubmitRef.current = handleSubmit

  /* ── Scoring ── */

  function matchesTarget(label, target) {
    if (label.includes(target) || target.includes(label)) return true
    /* Handle plurals: "cats" matches "cat", "houses" matches "house" */
    if (label.endsWith('s') && label.slice(0, -1).includes(target)) return true
    if (target.endsWith('s') && label.includes(target.slice(0, -1))) return true
    return false
  }

  function scoreRound(aiResult) {
    const label = (aiResult.label || '').toLowerCase()
    const target = currentTarget.toLowerCase()
    const topConf = aiResult.confidence || 0

    switch (currentRound.type) {
      case 'draw': {
        if (matchesTarget(label, target)) {
          return retryCount === 0 ? 3 : 2
        }
        const inTop5 = (aiResult.top5 || []).some(p => matchesTarget(p.label.toLowerCase(), target))
        return inTop5 ? 1 : 0
      }
      case 'deceive': {
        const r0 = ROUND_TARGETS[0]
        if (!matchesTarget(label, r0)) {
          if (topConf >= 50) return 3
          if (topConf >= 20) return 2
          return 1
        }
        return 0
      }
      case 'adversarial': {
        const aiSaidDog = matchesTarget(label, 'dog') || (aiResult.top5 || []).some(p => matchesTarget(p.label.toLowerCase(), 'dog'))
        if (aiSaidDog && topConf >= 50) return 3
        if (aiSaidDog) return 2
        if (!matchesTarget(label, 'cat')) return 1
        return 0
      }
      case 'overconfidence': {
        if (!matchesTarget(label, target) && topConf >= 80) return 3
        if (!matchesTarget(label, target) && topConf >= 50) return 2
        if (!matchesTarget(label, target)) return 1
        return 0
      }
      default:
        return 0
    }
  }

  function handleShowScore() {
    if (!aiResponse) return
    const score = scoreRound(aiResponse)
    setRoundScores(prev => [...prev, score])
    setRoundDrawings(prev => [...prev, {
      dataUrl: gridToDataUrl(pixelsRef.current),
      label: aiResponse.label,
      stars: score,
    }])
    setShowLesson(true)
  }

  function handleNextRound() {
    const nextRound = round + 1
    if (nextRound >= ROUNDS.length) {
      markModuleCompleteRef.current('draw-and-deceive')
      setShowComplete(true)
      scrollToTop()
      return
    }

    setRound(nextRound)
    setPhase('draw')
    setAiResponse(null)
    setError(null)
    setRetryCount(0)
    setShowLesson(false)
    setShowHint(false)
    undoStackRef.current = []
    setShowClearConfirm(false)

    if (nextRound === 1 && savedRound1Drawing) {
      pixelsRef.current = cloneGrid(savedRound1Drawing)
    } else {
      pixelsRef.current = createEmptyGrid()
    }
    setCanvasVersion(v => v + 1)

    const nextTarget = ROUND_TARGETS[nextRound] || ROUND_TARGETS[0]
    setCurrentTarget(nextTarget)

    if (ROUNDS[nextRound].timed) {
      setTimerActive(true)
      setTimeRemaining(30)
    }

    scrollToTop()
  }

  function handleRetry() {
    setPhase('draw')
    setAiResponse(null)
    setError(null)
    setShowLesson(false)

    if (currentRound.timed) {
      setTimerActive(true)
      setTimeRemaining(30)
    }
  }

  /* ── Rank calculation ── */

  function getRank() {
    if (totalStars >= 13) return { title: 'Vision Hacker', message: 'You understand how AI sees AND how to break it. That is a rare combination.' }
    if (totalStars >= 9) return { title: 'Pattern Spotter', message: 'Strong instincts. You fooled the AI more than once. You get why CV is both powerful and fragile.' }
    if (totalStars >= 5) return { title: 'Pixel Apprentice', message: 'You made the AI work hard. Every failed attempt taught you something about how patterns are detected.' }
    return { title: 'Welcome to Adversarial ML', message: 'The hardest thing about this game is also the hardest thing about AI vision: bridging human intent and pattern matching. Keep going.' }
  }

  /* ══════════════════════════════════════════
     ENTRY SCREEN
     ══════════════════════════════════════════ */

  if (showEntry) {
    return (
      <div className="dd-entry" ref={gameRef}>
        <div className="dd-entry-inner">
          <ModuleIcon module="draw-and-deceive" size={72} style={{ color: '#F59E0B' }} />

          <h1 className="dd-entry-title">Draw &amp; Deceive</h1>

          <div className="dd-entry-taglines">
            <p className={`dd-tagline ${entryTaglineStep >= 1 ? 'dd-tagline-visible' : ''}`}>You draw it.</p>
            <p className={`dd-tagline ${entryTaglineStep >= 2 ? 'dd-tagline-visible' : ''}`}>GPT-4o names it.</p>
            <p className={`dd-tagline ${entryTaglineStep >= 3 ? 'dd-tagline-visible' : ''}`}>Then you try to fool it.</p>
          </div>

          <div className="dd-entry-divider" />

          <div className="dd-mission-card">
            <p className="dd-mission-text">
              You have 32&times;32 pixels and a color palette.
              Your goal changes every round. Round 1:
              make the AI see what you drew. Rounds 2&ndash;5:
              trick it into seeing something completely different.
            </p>
            <p className="dd-mission-text dd-mission-bold">
              The AI uses real GPT-4o vision. The confusion is real.
            </p>
          </div>

          <div className="dd-stats-row">
            <span className="dd-stat-pill">5 Rounds</span>
            <span className="dd-stat-pill">Real AI Vision</span>
            <span className="dd-stat-pill">Gets Harder</span>
          </div>

          <button className="dd-start-btn" onClick={() => {
            if (taglineTimerRef.current) taglineTimerRef.current.forEach(clearTimeout)
            setShowEntry(false)
            handleStart()
          }}>
            Start Drawing
          </button>
          <p className="dd-start-hint">No drawing skills required</p>
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════
     COMPLETION SCREEN
     ══════════════════════════════════════════ */

  if (showComplete) {
    const rank = getRank()

    return (
      <div className="dd-game" ref={gameRef}>
        <div className="dd-complete">
          <h1 className="dd-complete-title">{rank.title}</h1>
          <p className="dd-complete-subtitle">{rank.message}</p>

          <div className="dd-complete-stars">
            <span className="dd-complete-star-count">{totalStars}</span>
            <span className="dd-complete-star-total"> / 15</span>
            <div className="dd-complete-star-row">
              <StarDisplay count={totalStars} total={15} animate />
            </div>
          </div>

          <div className="dd-concepts">
            <h3 className="dd-concepts-title">What you discovered</h3>
            <div className="dd-concepts-grid">
              {CONCEPTS.map((c, i) => (
                <ConceptPill
                  key={c.name}
                  concept={c}
                  index={i}
                  expanded={expandedConcept === i}
                  onToggle={() => setExpandedConcept(expandedConcept === i ? null : i)}
                />
              ))}
            </div>
          </div>

          {roundDrawings.length > 0 && (
            <div className="dd-replay-strip">
              {roundDrawings.map((rd, i) => (
                <div key={i} className="dd-replay-thumb" onClick={() => setExpandedReplay(i)}>
                  <img src={rd.dataUrl} alt={`Round ${i + 1}`} className="dd-replay-canvas" />
                  <span className="dd-replay-label">{rd.label}</span>
                  <div className="dd-replay-stars-mini">
                    <StarDisplay count={rd.stars} total={3} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {expandedReplay !== null && roundDrawings[expandedReplay] && (
            <div className="dd-replay-expanded" onClick={() => setExpandedReplay(null)}>
              <div className="dd-replay-expanded-inner" onClick={e => e.stopPropagation()}>
                <h3>Round {expandedReplay + 1}: {ROUNDS[expandedReplay].title}</h3>
                <img
                  src={roundDrawings[expandedReplay].dataUrl}
                  alt={`Round ${expandedReplay + 1}`}
                  className="dd-replay-expanded-canvas"
                />
                <p>AI saw: <strong>{roundDrawings[expandedReplay].label}</strong></p>
                <StarDisplay count={roundDrawings[expandedReplay].stars} total={3} />
                <button className="dd-replay-expanded-close" onClick={() => setExpandedReplay(null)}>Close</button>
              </div>
            </div>
          )}

          <div className="dd-why-card">
            <p className="dd-why-text">
              The gap between human vision and AI pattern
              matching is not a bug to be fixed &mdash; it is
              a fundamental property of how CNNs learn.
              Understanding it is the first step to building
              safer, more robust vision systems.
            </p>
          </div>

          <div className="dd-complete-actions">
            <button className="dd-btn-primary" onClick={handleReset}>Play Again</button>
            <button className="dd-btn-outline" onClick={onGoHome}>Back to Home</button>
          </div>

          <SuggestedModules currentModuleId="draw-and-deceive" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ══════════════════════════════════════════
     GAME SCREEN
     ══════════════════════════════════════════ */

  if (!started) return <div className="dd-game" ref={gameRef} />

  const isBlankCanvas = pixelsRef.current.every(row => row.every(c => c === '#FFFFFF'))

  return (
    <div className="dd-game" ref={gameRef}>
      {/* Header bar */}
      <div className="dd-header">
        <span className="dd-header-title">Draw &amp; Deceive</span>
        <div className="dd-header-right">
          <span className="dd-round-pill">Round {round + 1}/5</span>
          <span className="dd-round-pill">Stars: {totalStars}/15</span>
        </div>
      </div>

      {/* Round header */}
      <div className="dd-round-header">
        <h2 className="dd-round-title">{currentRound.title}</h2>
        <p className="dd-round-subtitle">{currentRound.subtitle}</p>

        {currentRound.type !== 'overconfidence' && currentRound.type !== 'adversarial' && (
          <div className="dd-target-card">
            <span className="dd-target-label">Target:</span>
            <span className="dd-target-word">{currentTarget}</span>
          </div>
        )}

        {currentRound.type === 'adversarial' && (
          <div className="dd-target-card">
            <span className="dd-target-label">Goal:</span>
            <span className="dd-target-word" style={{ fontSize: 14, letterSpacing: 0 }}>
              Draw a cat that AI calls "dog"
            </span>
          </div>
        )}

        {currentRound.type === 'overconfidence' && (
          <div className="dd-target-card">
            <span className="dd-target-label">Goal:</span>
            <span className="dd-target-word" style={{ fontSize: 14, letterSpacing: 0 }}>
              Fool the AI with high confidence
            </span>
          </div>
        )}
      </div>

      {/* Timer for Round 3 */}
      {currentRound.timed && phase === 'draw' && (
        <div className="dd-timer">
          <div className="dd-timer-bar">
            <div
              className={`dd-timer-fill ${timeRemaining <= 10 ? 'dd-timer-warning' : ''}`}
              style={{ width: `${(timeRemaining / 30) * 100}%` }}
            />
          </div>
          <span className="dd-timer-text" role="timer" aria-live="polite" aria-atomic="true">{timeRemaining}s</span>
          <span className="sr-only" aria-live="assertive" aria-atomic="true">{timerAnnouncement}</span>
        </div>
      )}

      {/* Canvas area */}
      <div className="dd-canvas-area">
        <div className="dd-canvas-wrap">
          <canvas
            ref={setCanvasRef}
            className={`dd-canvas${tool === 'erase' ? ' dd-cursor-erase' : tool === 'fill' ? ' dd-cursor-fill' : ''}`}
            width={512}
            height={512}
            role="img"
            aria-label={`32 by 32 pixel drawing canvas. Current target: ${currentTarget}`}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => { if (phase === 'draw') e.preventDefault(); handlePointerDown(e) }}
            onTouchMove={(e) => { if (isDrawingRef.current) e.preventDefault(); handlePointerMove(e) }}
            onTouchEnd={(e) => { if (isDrawingRef.current) e.preventDefault(); handlePointerUp(e) }}
          />

          {/* Classifying overlay */}
          {phase === 'classifying' && (
            <div className="dd-classifying">
              <div className="dd-scan-line" />
              <span className="dd-classifying-text">GPT-4o is looking at your drawing</span>
              <div className="dd-classifying-dots">
                <span /><span /><span />
              </div>
            </div>
          )}

          {/* Clear confirm */}
          {showClearConfirm && phase === 'draw' && (
            <div className="dd-confirm-overlay">
              <div className="dd-confirm-box">
                <p>Clear canvas?</p>
                <div className="dd-confirm-btns">
                  <button className="dd-confirm-yes" onClick={confirmClear}>Yes</button>
                  <button onClick={() => setShowClearConfirm(false)}>No</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tools */}
        {phase === 'draw' && (
          <div className="dd-tools">
            <div className="dd-tool-row">
              <span className="dd-tool-label">Color</span>
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  className={`dd-color-swatch ${activeColor === c.hex ? 'dd-swatch-active' : ''} ${c.hex === '#FFFFFF' ? 'dd-swatch-white' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={`${c.name}${activeColor === c.hex ? ' (selected)' : ''}`}
                  onClick={() => { setActiveColor(c.hex); setTool('draw') }}
                />
              ))}
            </div>

            <div className="dd-tool-row">
              <span className="dd-tool-label">Tool</span>
              <button className={`dd-tool-btn ${tool === 'draw' ? 'dd-tool-active' : ''}`} onClick={() => setTool('draw')}>Draw</button>
              <button className={`dd-tool-btn ${tool === 'erase' ? 'dd-tool-active' : ''}`} onClick={() => setTool('erase')}>Erase</button>
              <button className={`dd-tool-btn ${tool === 'fill' ? 'dd-tool-active' : ''}`} onClick={() => setTool('fill')}>Fill</button>
              <button className="dd-tool-btn" onClick={handleClear}>Clear</button>
              <button className="dd-undo-btn" onClick={undo} disabled={undoStackRef.current.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                Undo
              </button>
            </div>

            <div className="dd-tool-row">
              <span className="dd-tool-label">Brush</span>
              <button className={`dd-tool-btn dd-brush-btn ${brushSize === 1 ? 'dd-tool-active' : ''}`} onClick={() => setBrushSize(1)}>1px</button>
              <button className={`dd-tool-btn dd-brush-btn ${brushSize === 2 ? 'dd-tool-active' : ''}`} onClick={() => setBrushSize(2)}>2px</button>
              <button className={`dd-tool-btn dd-brush-btn ${brushSize === 4 ? 'dd-tool-active' : ''}`} onClick={() => setBrushSize(4)}>4px</button>

              <button
                className={`dd-tool-btn dd-grid-toggle ${showGrid ? 'dd-tool-active' : ''}`}
                onClick={() => setShowGrid(prev => !prev)}
              >
                Grid
              </button>
            </div>

            {/* Hint for Round 4 */}
            {currentRound.type === 'adversarial' && (
              <div>
                <button className="dd-hint-btn" onClick={() => setShowHint(!showHint)}>
                  <TipIcon size={14} color="#eab308" />
                  {showHint ? 'Hide hint' : 'Need a hint?'}
                </button>
                {showHint && (
                  <div className="dd-hint-text">
                    Try adding subtle noise or changing a few key pixels in the eyes or ears area.
                    CNNs often rely on small details like ear shape to distinguish cats from dogs.
                    Slightly rounding the ears and adding a snout shape can shift the classification.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="dd-error">
            <p className="dd-error-text">{error}</p>
            <button className="dd-retry-btn" onClick={() => { setError(null); setRetryCount(0) }}>
              Try Again
            </button>
          </div>
        )}

        {/* Submit button */}
        {phase === 'draw' && !error && (
          <button
            className="dd-submit-btn"
            onClick={handleSubmit}
            disabled={isBlankCanvas}
          >
            Submit Drawing &rarr;
          </button>
        )}

        {/* Result panel */}
        {phase === 'result' && aiResponse && !showLesson && (
          <div className="dd-result">
            <div className={`dd-result-card ${
              currentRound.type === 'draw' && (aiResponse.label || '').toLowerCase().includes(currentTarget) ? 'dd-result-success' :
              currentRound.type === 'deceive' || currentRound.type === 'adversarial' ? 'dd-result-adversarial' :
              'dd-result-fail'
            }`}>
              <div className="dd-result-top">
                <h3 className="dd-result-label">{aiResponse.label}</h3>
                <p className="dd-result-conf-text">{aiResponse.confidence}% confident</p>
              </div>

              <div className="dd-result-bar-main">
                <div className="dd-result-bar-main-fill" style={{ width: `${aiResponse.confidence}%` }} />
              </div>

              <div className="dd-predictions">
                {(aiResponse.top5 || []).map((pred, i) => (
                  <div key={i} className="dd-pred-row">
                    <span className="dd-pred-label">{pred.label}</span>
                    <div className="dd-conf-bar">
                      <div
                        className={`dd-conf-fill ${i === 0 ? 'dd-conf-top' : ''}`}
                        style={{ width: `${pred.confidence}%`, transitionDelay: `${i * 0.1}s` }}
                      />
                    </div>
                    <span className="dd-pred-pct">{pred.confidence}%</span>
                  </div>
                ))}
              </div>

              <div className="dd-explanation">
                <strong>What I detected: </strong>
                {aiResponse.explanation}
              </div>

              {/* Round 4 split view */}
              {currentRound.type === 'adversarial' && (
                <div className="dd-split-view">
                  <div className="dd-split-panel">
                    <div className="dd-split-panel-label">Humans see</div>
                    <div className="dd-split-panel-value">Cat</div>
                  </div>
                  <span className="dd-split-arrow">&ne;</span>
                  <div className="dd-split-panel">
                    <div className="dd-split-panel-label">AI sees</div>
                    <div className="dd-split-panel-value">{aiResponse.label}</div>
                  </div>
                </div>
              )}
            </div>

            <button className="dd-btn-primary" onClick={handleShowScore} style={{ width: '100%' }}>
              See Score &rarr;
            </button>

            {currentRound.type === 'draw' && !(aiResponse.label || '').toLowerCase().includes(currentTarget) && (
              <button className="dd-retry-btn" onClick={handleRetry}>
                Retry Drawing
              </button>
            )}
          </div>
        )}

        {/* Score + Lesson */}
        {showLesson && aiResponse && (
          <div className="dd-result" style={{ maxWidth: 512, margin: '0 auto' }}>
            <StarDisplay count={roundScores[roundScores.length - 1] || 0} total={3} animate />
            <p className="dd-score-text">
              {roundScores[roundScores.length - 1] === 3 ? 'Perfect!' :
               roundScores[roundScores.length - 1] === 2 ? 'Great work!' :
               roundScores[roundScores.length - 1] === 1 ? 'Close!' : 'Keep trying!'}
            </p>

            <div className="dd-lesson-card">
              <div className="dd-lesson-header">
                <TipIcon size={16} color="#eab308" />
                <span className="dd-lesson-title">{currentRound.lessonTitle}</span>
              </div>
              <p className="dd-lesson-text">{currentRound.lesson}</p>
            </div>

            <div className="dd-round-actions">
              {round < ROUNDS.length - 1 ? (
                <button className="dd-btn-primary" onClick={handleNextRound}>
                  Next Round &rarr;
                </button>
              ) : (
                <button className="dd-btn-primary" onClick={handleNextRound}>
                  See Results &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DrawAndDeceive
