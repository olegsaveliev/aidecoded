import { useState, useEffect, useCallback, useRef } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, CrossIcon, LockIcon, FlaskIcon, TipIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import './AILabExplorer.css'

/* ── Room Data ── */

const ROOMS = [
  { id: 1, name: 'Data Vault', concept: 'Data Quality' },
  { id: 2, name: 'Token Factory', concept: 'Tokenization' },
  { id: 3, name: 'Weights Chamber', concept: 'Model Weights' },
  { id: 4, name: 'Attention Observatory', concept: 'Attention' },
  { id: 5, name: 'Prompt Lab', concept: 'Prompt Engineering' },
  { id: 6, name: 'Control Room', concept: 'Putting it all together' },
]

const ADJACENT = {
  1: [2],
  2: [1, 3, 5],
  3: [2, 4],
  4: [3, 5],
  5: [2, 4, 6],
  6: [5],
}

/* Room 1: Data sorting */
const DATA_CARDS = [
  { text: 'Q: What is the capital of France? A: Paris is the capital of France, located in the north-central part of the country.', good: true },
  { text: 'Q: How do computers work? A: They just do stuff with electricity and things.', good: false },
  { text: 'Q: What is photosynthesis? A: The process by which plants convert sunlight, water, and CO2 into glucose and oxygen.', good: true },
  { text: 'Q: What year did WW2 end? A: It ended sometime around the 1900s probably.', good: false },
  { text: 'Q: Explain gravity. A: Gravity is a fundamental force that attracts objects with mass toward each other, proportional to their masses.', good: true },
  { text: 'Q: What is machine learning? A: Machine learning is when computers learn patterns from data to make predictions without explicit programming.', good: true },
  { text: 'Q: How does the internet work? A: Nobody really knows, it is magic and wires.', good: false },
  { text: 'Q: What is DNA? A: DNA is a molecule that carries genetic instructions. Wait, actually DNA is a type of protein. No, it is an acid.', good: false },
]

/* Room 2: Tokenization sentences */
const TOKEN_SENTENCES = [
  { text: 'The weather today is beautiful', tokens: ['The', ' weather', ' today', ' is', ' beautiful'] },
  { text: 'I love programming in Python', tokens: ['I', ' love', ' programming', ' in', ' Python'] },
  { text: 'Artificial intelligence is amazing', tokens: ['Art', 'ificial', ' intelligence', ' is', ' amazing'] },
]

/* Room 3: Weights slider tasks */
const SLIDER_TASKS = [
  {
    instruction: 'Write a one-word answer to: What is 2+2?',
    target: { creativity: [0, 25], precision: [75, 100], verbosity: [0, 25] },
    outputs: {
      correct: '4',
      wrongHigh: 'Four! Oh what a magnificent number, dancing in the realm of mathematics...',
      wrongMid: 'The answer to 2+2 is 4, which is an even number.',
    },
  },
  {
    instruction: 'Write a creative story opening',
    target: { creativity: [70, 100], precision: [0, 60], verbosity: [65, 100] },
    outputs: {
      correct: 'The last star blinked out like a candle in the cosmic wind, and for the first time in ten billion years, the universe held its breath...',
      wrongHigh: 'Once there was a story. It began.',
      wrongMid: 'A person walked into a room. The room was normal.',
    },
  },
  {
    instruction: 'Explain quantum physics simply',
    target: { creativity: [30, 70], precision: [50, 90], verbosity: [40, 75] },
    outputs: {
      correct: 'At the smallest scales, particles behave like both waves and particles. They exist in multiple states at once until observed - like a coin spinning in the air before it lands.',
      wrongHigh: 'QUANTUM PHYSICS: A COSMIC DANCE OF INFINITE POSSIBILITY WHERE REALITY ITSELF SHATTERS...',
      wrongMid: 'Physics.',
    },
  },
]

/* Room 4: Attention connections */
const ATTENTION_PUZZLES = [
  {
    sentence: ['The', 'cat', 'sat', 'on', 'the', 'mat', 'because', 'it', 'was', 'tired'],
    question: 'What does "it" refer to?',
    source: 7,
    target: 1,
    score: 92,
  },
  {
    sentence: ['The', 'bank', 'by', 'the', 'river', 'was', 'steep', 'and', 'muddy'],
    question: 'Which word helps clarify the meaning of "bank"?',
    source: 1,
    target: 4,
    score: 87,
  },
  {
    sentence: ['She', 'gave', 'him', 'the', 'book', 'that', 'she', 'had', 'written'],
    question: 'Who wrote the book?',
    source: 4,
    target: 0,
    score: 95,
  },
]

/* Room 5: Prompt ingredients */
const INGREDIENTS = ['Role', 'Task', 'Format', 'Tone', 'Examples', 'Constraints']

const PROMPT_TASKS = [
  {
    instruction: 'Get AI to write a formal email',
    correct: new Set(['Role', 'Task', 'Tone']),
    goodOutput: 'Subject: Quarterly Review Meeting\n\nDear Mr. Thompson,\n\nI am writing to confirm our quarterly review meeting scheduled for...',
    badOutput: 'hey so like we need to meet up about stuff lol',
  },
  {
    instruction: 'Get AI to return JSON data',
    correct: new Set(['Task', 'Format', 'Constraints']),
    goodOutput: '{"name": "Alice", "age": 30, "role": "Engineer"}',
    badOutput: 'The person is Alice who is 30 years old and works as an engineer and...',
  },
  {
    instruction: 'Get AI to explain like I\'m 5',
    correct: new Set(['Role', 'Task', 'Tone', 'Examples']),
    goodOutput: 'Imagine your brain is like a super-duper big box of crayons. AI is like teaching the crayons to draw pictures all by themselves!',
    badOutput: 'Artificial intelligence utilizes neural network architectures with backpropagation...',
  },
]

/* Room 6: Control room problems */
const CONTROL_PROBLEMS = [
  {
    type: 'Data',
    description: 'The training data has contradictions. Which example should be removed?',
    options: [
      'Q: Is the sky blue? A: Yes, the sky appears blue due to Rayleigh scattering.',
      'Q: Is the sky blue? A: No, the sky is actually green most of the time.',
      'Q: What color is grass? A: Grass is typically green due to chlorophyll.',
    ],
    correct: 1,
  },
  {
    type: 'Tokens',
    description: 'The input is too long and hitting the token limit. Which version uses fewer tokens?',
    options: [
      'Please provide a comprehensive and detailed analysis of the current economic situation.',
      'Summarize the economy.',
      'I would like to request that you analyze and describe the economic factors.',
    ],
    correct: 1,
  },
  {
    type: 'Settings',
    description: 'The output is too random and creative for a factual task. What should you adjust?',
    options: [
      'Increase temperature to maximum',
      'Lower temperature to near zero',
      'Increase max tokens',
    ],
    correct: 1,
  },
  {
    type: 'Prompt',
    description: 'The AI is ignoring the requested JSON format. What\'s missing from the prompt?',
    options: [
      'Add more examples of good responses',
      'Specify the exact format: "Respond ONLY in JSON with keys: name, age, role"',
      'Make the prompt longer with more context',
    ],
    correct: 1,
  },
]

const LESSONS = [
  'AI learns entirely from its training data. Garbage in, garbage out \u2014 data quality determines everything about your model\'s behavior.',
  'AI doesn\'t read words \u2014 it reads tokens. One word can be 1\u20133 tokens. Rare words split into more pieces than common ones.',
  'Model parameters control behavior. Temperature, top-p and other settings are just sliders \u2014 they shift the balance between creativity and precision.',
  'Attention lets AI understand which words relate to each other across a sentence. This is what makes transformers so powerful at understanding context.',
  'Great prompts are built from clear ingredients. Role + Task + Format + Constraints = predictable, high quality AI output every time.',
  'Every AI problem traces back to fundamentals: data quality, tokenization, parameters, or prompt design. You now know how to think about all of them.',
]

/* ── Main Component ── */

function AILabExplorer({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [started, setStarted] = useState(false)
  const [currentRoom, setCurrentRoom] = useState(1)
  const [unlockedRooms, setUnlockedRooms] = useState(new Set([1]))
  const [completedRooms, setCompletedRooms] = useState(new Set())
  const [retries, setRetries] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [keyboardHintVisible, setKeyboardHintVisible] = useState(true)
  const [isWalking, setIsWalking] = useState(false)
  const [shakingRoom, setShakingRoom] = useState(null)
  const containerRef = useRef(null)

  // Room-specific state
  const [roomState, setRoomState] = useState({})

  const initRoomState = useCallback((roomId) => {
    switch (roomId) {
      case 1:
        return { cardIndex: 0, correct: 0, selectedCard: null, feedback: null, sorted: [] }
      case 2:
        return { sentenceIndex: 0, slices: new Set(), completed: 0, checked: false, showHint: false }
      case 3:
        return { taskIndex: 0, creativity: 50, precision: 50, verbosity: 50 }
      case 4:
        return { puzzleIndex: 0, selectedWord: null, feedback: null }
      case 5:
        return { taskIndex: 0, selected: new Set(), feedback: null, wrongAttempts: 0 }
      case 6:
        return { solved: new Set(), feedback: {} }
      default:
        return {}
    }
  }, [])

  // Initialize room state when entering a new room
  useEffect(() => {
    if (!roomState[currentRoom]) {
      setRoomState((prev) => ({ ...prev, [currentRoom]: initRoomState(currentRoom) }))
    }
  }, [currentRoom, roomState, initRoomState])

  // Keyboard movement
  useEffect(() => {
    if (!started || gameComplete) return
    function handleKeyDown(e) {
      const moves = {
        ArrowRight: 'right', ArrowLeft: 'left',
        ArrowUp: 'up', ArrowDown: 'down',
        d: 'right', a: 'left', w: 'up', s: 'down',
      }
      const direction = moves[e.key]
      if (direction) {
        e.preventDefault()
        setKeyboardHintVisible(false)
        moveByDirection(direction)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // Grid positions for directional movement
  const GRID_POS = { 1: [0, 0], 2: [1, 0], 3: [2, 0], 6: [0, 1], 5: [1, 1], 4: [2, 1] }

  function moveByDirection(dir) {
    const [cx, cy] = GRID_POS[currentRoom]
    let tx = cx, ty = cy
    if (dir === 'right') tx += 1
    if (dir === 'left') tx -= 1
    if (dir === 'up') ty -= 1
    if (dir === 'down') ty += 1

    const targetRoom = Object.entries(GRID_POS).find(
      ([, [x, y]]) => x === tx && y === ty
    )
    if (!targetRoom) return
    const targetId = parseInt(targetRoom[0])
    if (!ADJACENT[currentRoom].includes(targetId)) return
    moveToRoom(targetId)
  }

  function moveToRoom(targetId) {
    if (targetId === currentRoom) return
    if (!unlockedRooms.has(targetId)) {
      setShakingRoom(targetId)
      setTimeout(() => setShakingRoom(null), 300)
      return
    }
    setIsWalking(true)
    setTimeout(() => {
      setCurrentRoom(targetId)
      setIsWalking(false)
    }, 400)
  }

  function completeRoom(roomId) {
    markModuleComplete('ai-lab-explorer')
    setCompletedRooms((prev) => {
      const next = new Set(prev)
      next.add(roomId)
      return next
    })
    // Unlock only the next sequential room
    if (roomId < 6) {
      setUnlockedRooms((prev) => {
        const next = new Set(prev)
        next.add(roomId + 1)
        return next
      })
    }
    // Check if all rooms completed
    const newCompleted = new Set(completedRooms)
    newCompleted.add(roomId)
    if (newCompleted.size === 6) {
      setTimeout(() => {
        setGameComplete(true)
        requestAnimationFrame(() => {
          let el = document.querySelector('.ale-container')
          while (el) {
            if (el.scrollTop > 0) el.scrollTop = 0
            el = el.parentElement
          }
          window.scrollTo(0, 0)
        })
      }, 1200)
    }
  }

  function reset() {
    setStarted(false)
    setCurrentRoom(1)
    setUnlockedRooms(new Set([1]))
    setCompletedRooms(new Set())
    setRetries(0)
    setGameComplete(false)
    setKeyboardHintVisible(true)
    setRoomState({})
    setIsWalking(false)
  }

  /* ── Entry Screen ── */

  if (!started) {
    return (
      <div className="ale-container">
        <EntryScreen
          icon={<ModuleIcon module="ai-lab-explorer" size={64} style={{ color: '#F59E0B' }} />}
          title="AI Lab Explorer"
          subtitle="Explore. Interact. Understand AI."
          description="Walk through a 6-room AI research lab. Each room hides a hands-on challenge. Complete it to unlock the next room and learn how AI really works."
          buttonText="Enter the Lab"
          onStart={() => { setStarted(true); markModuleStarted('ai-lab-explorer') }}
        />
        <div className="ale-entry-preview">
          <div className="ale-entry-room ale-entry-room-open">Room 1</div>
          {[2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="ale-entry-room ale-entry-room-locked">Room {n}</div>
          ))}
        </div>
        <div className="ale-entry-meta" style={{ textAlign: 'center', marginTop: 12 }}>
          6 rooms &middot; Keyboard + Touch friendly
        </div>
      </div>
    )
  }

  /* ── Completion Screen ── */

  if (gameComplete) {
    const rank = retries <= 1 ? 'Lead Researcher' : retries <= 3 ? 'Senior Researcher' : retries <= 5 ? 'Junior Researcher' : 'Lab Assistant'
    return (
      <div className="ale-container">
        <div className="ale-complete">
          <div className="ale-complete-map">
            <LabMap
              currentRoom={null}
              unlockedRooms={new Set([1, 2, 3, 4, 5, 6])}
              completedRooms={new Set([1, 2, 3, 4, 5, 6])}
              onRoomClick={() => {}}
              shakingRoom={null}
              isWalking={false}
              celebrate
            />
          </div>
          <h2 className="ale-complete-title">Lab Complete!</h2>
          <p className="ale-complete-subtitle">You explored all 6 rooms</p>

          <div className="ale-complete-summary">
            {ROOMS.map((room) => (
              <div key={room.id} className="ale-complete-row">
                <CheckIcon size={16} color="#34C759" />
                <span>{room.concept} &mdash; Room {room.id}</span>
              </div>
            ))}
          </div>

          <div className="ale-rank">
            <FlaskIcon size={18} color="#F59E0B" />
            {rank}
          </div>

          <div className="ale-final-actions">
            <button className="ale-btn-primary" onClick={reset}>Explore Again</button>
            <button className="ale-btn-secondary" onClick={onGoHome}>Back to Home</button>
          </div>

          <SuggestedModules currentModuleId="ai-lab-explorer" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ── Game Screen ── */

  const rs = roomState[currentRoom] || initRoomState(currentRoom)
  const isRoomDone = completedRooms.has(currentRoom)

  function updateRS(updates) {
    setRoomState((prev) => ({
      ...prev,
      [currentRoom]: { ...prev[currentRoom], ...updates },
    }))
  }

  return (
    <div className="ale-container" ref={containerRef}>
      <div className="ale-layout">
        <div className="ale-map-section">
          <LabMap
            currentRoom={currentRoom}
            unlockedRooms={unlockedRooms}
            completedRooms={completedRooms}
            onRoomClick={moveToRoom}
            shakingRoom={shakingRoom}
            isWalking={isWalking}
          />
          <div className={`ale-keyboard-hint${!keyboardHintVisible ? ' ale-keyboard-hint-hidden' : ''}`}>
            WASD or Arrow Keys to move
          </div>
        </div>

        <div className="ale-challenge-section">
          {isRoomDone ? (
            <RoomDone room={ROOMS[currentRoom - 1]} lesson={LESSONS[currentRoom - 1]} />
          ) : (
            <RoomChallenge
              roomId={currentRoom}
              rs={rs}
              updateRS={updateRS}
              onComplete={() => completeRoom(currentRoom)}
              onRetry={() => setRetries((r) => r + 1)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Lab Map Component ── */

function LabMap({ currentRoom, unlockedRooms, completedRooms, onRoomClick, shakingRoom, isWalking, celebrate }) {
  // Room layout: top row [1,2,3], bottom row [6,5,4]
  const topRow = [1, 2, 3]
  const bottomRow = [6, 5, 4]

  function roomClass(id) {
    const classes = ['ale-room-box']
    if (completedRooms.has(id)) classes.push('ale-room-box-completed')
    else if (id === currentRoom) classes.push('ale-room-box-current')
    else if (unlockedRooms.has(id)) classes.push('ale-room-box-unlocked')
    else classes.push('ale-room-box-locked')
    if (shakingRoom === id) classes.push('ale-room-shake')
    if (celebrate && completedRooms.has(id)) classes.push('ale-character-celebrate')
    return classes.join(' ')
  }

  function renderRoom(id) {
    const room = ROOMS[id - 1]
    const isLocked = !unlockedRooms.has(id) && !completedRooms.has(id)
    return (
      <div
        key={id}
        className={roomClass(id)}
        onClick={() => onRoomClick(id)}
        style={id === currentRoom ? { animation: 'doorUnlock 0.3s ease-out' } : undefined}
      >
        {completedRooms.has(id) && (
          <span className="ale-room-check"><CheckIcon size={14} color="#34C759" /></span>
        )}
        {isLocked ? (
          <span className="ale-room-lock"><LockIcon size={16} color="var(--text-tertiary)" /></span>
        ) : (
          <>
            <span className="ale-room-number">Room {id}</span>
            <span className="ale-room-name">{room.name}</span>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="ale-map">
      <div className="ale-map-title">Lab Map</div>
      <div className="ale-map-grid">
        {topRow.map(renderRoom)}
        {bottomRow.map(renderRoom)}
      </div>
    </div>
  )
}

/* ── Room Done ── */

function RoomDone({ room, lesson }) {
  return (
    <div className="ale-challenge" style={{ animation: 'fadeSlideUp 0.3s ease-out' }}>
      <div className="ale-room-complete">
        <CheckIcon size={20} color="#34C759" />
        <span className="ale-room-complete-text">Room {room.id} Complete!</span>
      </div>
      <div className="ale-lesson">
        <div className="ale-lesson-text">{lesson}</div>
      </div>
      <div className="ale-next-hint">Move to an adjacent room to continue</div>
    </div>
  )
}

/* ── Room Challenge Router ── */

const ROOM_HINTS = [
  'Look for answers that are vague, contradictory, or factually wrong — those are bad training data.',
  'Common words are often one token, but rare or long words get split into pieces. Watch for the dashed blue guides that appear after a few seconds.',
  'Slide each dial until it lands inside the highlighted green zone. All three must be green to proceed.',
  'Read the question, then click the two words that are most connected. Hint: look for pronouns and what they refer to.',
  'Not every ingredient is needed. Think about what this specific task requires — fewer is often better.',
  'Read each problem carefully. The most direct, specific fix is usually the right answer.',
]

function RoomChallenge({ roomId, rs, updateRS, onComplete, onRetry }) {
  const [showHelp, setShowHelp] = useState(false)
  const room = ROOMS[roomId - 1]
  const intro = [
    'Raw data arrives at the lab. Sort it into the right bins before training can begin.',
    'Words arrive on the conveyor belt. Slice them into tokens the AI can understand.',
    'These dials control how the AI thinks. Adjust them to get the right response.',
    'Words float in space. Draw the connections the AI makes to understand context.',
    'Combine prompt ingredients to get the perfect AI response for each task.',
    'The final challenge. Use everything you learned to diagnose and fix a broken AI system.',
  ]

  return (
    <div className="ale-challenge">
      <div className="ale-challenge-header">
        <span className="ale-room-badge">Room {roomId}</span>
        <h3 className="ale-challenge-title">{room.name}</h3>
        <button className="ale-help-btn" onClick={() => setShowHelp(!showHelp)} aria-label="Show hint">
          <TipIcon size={16} color={showHelp ? '#eab308' : 'var(--text-tertiary)'} />
          {showHelp ? 'Hide Hint' : 'Hint'}
        </button>
      </div>
      <p className="ale-challenge-intro">{intro[roomId - 1]}</p>

      {showHelp && (
        <div className="ale-help-box">
          <TipIcon size={14} color="#eab308" />
          {ROOM_HINTS[roomId - 1]}
        </div>
      )}

      {roomId === 1 && <Room1Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} onRetry={onRetry} />}
      {roomId === 2 && <Room2Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} />}
      {roomId === 3 && <Room3Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} />}
      {roomId === 4 && <Room4Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} onRetry={onRetry} />}
      {roomId === 5 && <Room5Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} onRetry={onRetry} />}
      {roomId === 6 && <Room6Challenge rs={rs} updateRS={updateRS} onComplete={onComplete} onRetry={onRetry} />}
    </div>
  )
}

/* ── Room 1: Data Vault ── */

function Room1Challenge({ rs, updateRS, onComplete, onRetry }) {
  const { cardIndex, correct, selectedCard, feedback, sorted } = rs
  const allDone = sorted.length >= DATA_CARDS.length

  function handleSort(isGood) {
    if (selectedCard !== null || allDone) return
    const card = DATA_CARDS[cardIndex]
    const isCorrect = card.good === isGood
    if (!isCorrect) {
      onRetry()
      updateRS({ feedback: 'wrong' })
      setTimeout(() => updateRS({ feedback: null }), 600)
      return
    }
    updateRS({
      feedback: 'correct',
      correct: correct + 1,
      sorted: [...sorted, cardIndex],
    })
    setTimeout(() => {
      const nextIndex = cardIndex + 1
      if (nextIndex >= DATA_CARDS.length) {
        if (correct + 1 >= 6) onComplete()
        else updateRS({ cardIndex: nextIndex, feedback: null })
      } else {
        updateRS({ cardIndex: nextIndex, feedback: null })
      }
    }, 500)
  }

  if (allDone && correct >= 6) return null

  const card = DATA_CARDS[cardIndex]
  if (!card) return null

  return (
    <div>
      <div className="ale-score-bar">
        <span>{correct}/{DATA_CARDS.length} correct</span>
        <div className="ale-score-fill">
          <div className="ale-score-fill-bar" style={{ width: `${(correct / 6) * 100}%` }} />
        </div>
        <span>Need 6</span>
      </div>

      <div className={`ale-data-card${feedback === 'correct' ? ' ale-data-card-correct' : ''}${feedback === 'wrong' ? ' ale-data-card-wrong' : ''}`}>
        {card.text}
      </div>

      <div className="ale-sort-buttons">
        <button className="ale-sort-btn ale-sort-btn-good" onClick={() => handleSort(true)} disabled={feedback !== null}>
          <CheckIcon size={16} color="#fff" /> Good Data
        </button>
        <button className="ale-sort-btn ale-sort-btn-bad" onClick={() => handleSort(false)} disabled={feedback !== null}>
          <CrossIcon size={16} color="#fff" /> Bad Data
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 12, textAlign: 'center' }}>
        Card {cardIndex + 1} of {DATA_CARDS.length}
      </div>
    </div>
  )
}

/* ── Room 2: Token Factory ── */

function Room2Challenge({ rs, updateRS, onComplete }) {
  const { sentenceIndex, slices, completed, checked, showHint } = rs
  const sentence = TOKEN_SENTENCES[sentenceIndex]
  const timerRef = useRef(null)

  // Show hint after 5 seconds
  useEffect(() => {
    if (checked || showHint) return
    timerRef.current = setTimeout(() => updateRS({ showHint: true }), 5000)
    return () => clearTimeout(timerRef.current)
  }, [sentenceIndex, checked, showHint, updateRS])

  if (!sentence) return null

  // Determine correct slice positions (cumulative character positions)
  const correctSlices = new Set()
  let pos = 0
  for (let i = 0; i < sentence.tokens.length - 1; i++) {
    pos += sentence.tokens[i].length
    correctSlices.add(pos)
  }

  const chars = sentence.text.split('')

  function handleSlice(charIndex) {
    if (checked) return
    const slicePos = charIndex + 1
    if (slicePos >= sentence.text.length) return
    const newSlices = new Set(slices)
    if (newSlices.has(slicePos)) {
      newSlices.delete(slicePos)
    } else {
      newSlices.add(slicePos)
    }
    updateRS({ slices: newSlices })
  }

  function checkAnswer() {
    // Check if slices match correct positions
    const isCorrect = correctSlices.size === slices.size &&
      [...correctSlices].every((s) => slices.has(s))

    if (isCorrect) {
      updateRS({ checked: true })
      const nextCompleted = completed + 1
      setTimeout(() => {
        if (nextCompleted >= TOKEN_SENTENCES.length) {
          onComplete()
        } else {
          updateRS({
            sentenceIndex: sentenceIndex + 1,
            slices: new Set(),
            completed: nextCompleted,
            checked: false,
            showHint: false,
          })
        }
      }, 800)
    } else {
      updateRS({ slices: new Set() })
    }
  }

  // Build token display from current slices
  const currentTokens = []
  let tokenStart = 0
  const sortedSlices = [...slices].sort((a, b) => a - b)
  for (const s of sortedSlices) {
    currentTokens.push(sentence.text.slice(tokenStart, s))
    tokenStart = s
  }
  currentTokens.push(sentence.text.slice(tokenStart))

  return (
    <div>
      <div className="ale-score-bar">
        <span>{completed}/{TOKEN_SENTENCES.length} tokenized</span>
        <div className="ale-score-fill">
          <div className="ale-score-fill-bar" style={{ width: `${(completed / TOKEN_SENTENCES.length) * 100}%` }} />
        </div>
      </div>

      <div className="ale-conveyor">
        <div className="ale-token-count">Tokens: {currentTokens.filter((t) => t).length}</div>
        <div className="ale-sentence">
          {chars.map((char, i) => (
            <span key={i} className="ale-char" onClick={() => handleSlice(i)}>
              <span className={`ale-char-letter${showHint && correctSlices.has(i + 1) ? ' ale-word-node-highlight' : ''}`}
                style={showHint && correctSlices.has(i + 1) ? { borderRight: '2px dashed rgba(0,113,227,0.3)' } : undefined}
              >
                {char}
              </span>
              {slices.has(i + 1) && <span className="ale-slice-marker" />}
            </span>
          ))}
        </div>
        {currentTokens.filter((t) => t).length > 1 && (
          <div className="ale-token-chips">
            {currentTokens.filter((t) => t).map((token, i) => (
              <span key={i} className="ale-token-chip">{token}</span>
            ))}
          </div>
        )}
        <div className="ale-token-hint">Click between characters to place a slice</div>
      </div>

      <div className="ale-token-actions">
        <button className="ale-check-btn" onClick={checkAnswer} disabled={slices.size === 0}>
          Check Tokens
        </button>
        <button className="ale-reset-btn" onClick={() => updateRS({ slices: new Set() })}>
          Reset
        </button>
      </div>
    </div>
  )
}

/* ── Room 3: Weights Chamber ── */

function Room3Slider({ label, value, target, onChange }) {
  const inTarget = value >= target[0] && value <= target[1]
  const mid = (target[0] + target[1]) / 2
  const hint = !inTarget ? (value < mid ? 'Higher' : 'Lower') : null

  return (
    <div className="ale-slider-row">
      <div className="ale-slider-label">
        <span className="ale-slider-name">
          {label}
          {inTarget && <CheckIcon size={14} color="#34C759" style={{ marginLeft: 6 }} />}
        </span>
        <span className="ale-slider-value" style={inTarget ? { color: '#34C759' } : undefined}>{value}</span>
      </div>
      <div className="ale-slider-track-wrap">
        <div
          className="ale-slider-target-zone"
          style={{ left: `${target[0]}%`, width: `${target[1] - target[0]}%` }}
        />
        <input type="range" min="0" max="100" value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
      </div>
      {hint && <div className="ale-slider-hint">{hint}</div>}
    </div>
  )
}

function Room3Challenge({ rs, updateRS, onComplete }) {
  const { taskIndex, creativity, precision, verbosity } = rs
  const task = SLIDER_TASKS[taskIndex]
  if (!task) return null

  function inRange(val, range) {
    return val >= range[0] && val <= range[1]
  }

  const isCorrect = inRange(creativity, task.target.creativity) &&
    inRange(precision, task.target.precision) &&
    inRange(verbosity, task.target.verbosity)

  function getOutput() {
    if (isCorrect) return task.outputs.correct
    const totalOff = Math.abs(creativity - (task.target.creativity[0] + task.target.creativity[1]) / 2) +
      Math.abs(precision - (task.target.precision[0] + task.target.precision[1]) / 2) +
      Math.abs(verbosity - (task.target.verbosity[0] + task.target.verbosity[1]) / 2)
    return totalOff > 80 ? task.outputs.wrongHigh : task.outputs.wrongMid
  }

  function handleNext() {
    if (taskIndex + 1 >= SLIDER_TASKS.length) {
      onComplete()
    } else {
      updateRS({ taskIndex: taskIndex + 1, creativity: 50, precision: 50, verbosity: 50 })
    }
  }

  return (
    <div>
      <div className="ale-score-bar">
        <span>{isCorrect ? taskIndex + 1 : taskIndex}/{SLIDER_TASKS.length} tasks</span>
        <div className="ale-score-fill">
          <div className="ale-score-fill-bar" style={{ width: `${((isCorrect ? taskIndex + 1 : taskIndex) / SLIDER_TASKS.length) * 100}%` }} />
        </div>
      </div>

      <div className="ale-task-card">
        <div className="ale-task-label">Task {taskIndex + 1}</div>
        <div className="ale-task-text">{task.instruction}</div>
      </div>

      <div className="ale-slider-group">
        <Room3Slider label="Creativity" value={creativity} target={task.target.creativity} onChange={(v) => updateRS({ creativity: v })} />
        <Room3Slider label="Precision" value={precision} target={task.target.precision} onChange={(v) => updateRS({ precision: v })} />
        <Room3Slider label="Verbosity" value={verbosity} target={task.target.verbosity} onChange={(v) => updateRS({ verbosity: v })} />
      </div>

      <div className={`ale-output-panel${isCorrect ? ' ale-output-panel-correct' : ''}`}>
        <div className="ale-output-label">AI Output</div>
        <div className="ale-output-text">{getOutput()}</div>
      </div>

      {isCorrect && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button className="ale-check-btn" onClick={handleNext}>
            {taskIndex + 1 >= SLIDER_TASKS.length ? 'Complete Room' : 'Next Task'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Room 4: Attention Observatory ── */

function Room4Challenge({ rs, updateRS, onComplete, onRetry }) {
  const { puzzleIndex, selectedWord, feedback } = rs
  const puzzle = ATTENTION_PUZZLES[puzzleIndex]
  const [showHint, setShowHint] = useState(false)
  const hintTimer = useRef(null)

  // Show hint after 5 seconds of inactivity
  useEffect(() => {
    setShowHint(false)
    hintTimer.current = setTimeout(() => setShowHint(true), 5000)
    return () => clearTimeout(hintTimer.current)
  }, [puzzleIndex])

  if (!puzzle) return null

  function handleWordClick(wordIndex) {
    if (feedback === 'correct') return
    clearTimeout(hintTimer.current)

    if (selectedWord === null) {
      updateRS({ selectedWord: wordIndex })
    } else {
      // Check if the connection is correct
      const pair = [selectedWord, wordIndex].sort((a, b) => a - b)
      const correctPair = [puzzle.source, puzzle.target].sort((a, b) => a - b)
      const isCorrect = pair[0] === correctPair[0] && pair[1] === correctPair[1]

      if (isCorrect) {
        updateRS({ feedback: 'correct', selectedWord: null })
        setTimeout(() => {
          if (puzzleIndex + 1 >= ATTENTION_PUZZLES.length) {
            onComplete()
          } else {
            updateRS({ puzzleIndex: puzzleIndex + 1, selectedWord: null, feedback: null })
          }
        }, 1200)
      } else {
        onRetry()
        updateRS({ feedback: 'wrong', selectedWord: null })
        setTimeout(() => updateRS({ feedback: null }), 600)
      }
    }
  }

  return (
    <div>
      <div className="ale-score-bar">
        <span>{puzzleIndex}/{ATTENTION_PUZZLES.length} connections</span>
        <div className="ale-score-fill">
          <div className="ale-score-fill-bar" style={{ width: `${(puzzleIndex / ATTENTION_PUZZLES.length) * 100}%` }} />
        </div>
      </div>

      <div className="ale-attention-question">{puzzle.question}</div>

      <div className="ale-words-container">
        {puzzle.sentence.map((word, i) => {
          let cls = 'ale-word-node'
          if (selectedWord === i) cls += ' ale-word-node-selected'
          if (feedback === 'correct' && (i === puzzle.source || i === puzzle.target)) cls += ' ale-word-node-correct'
          if (feedback === 'wrong') cls += ' ale-word-node-wrong'
          if (showHint && (i === puzzle.source || i === puzzle.target)) cls += ' ale-word-node-hint'
          return (
            <button key={i} className={cls} onClick={() => handleWordClick(i)}>
              {word}
            </button>
          )
        })}
      </div>

      {feedback === 'correct' && (
        <div className="ale-attention-score">
          <CheckIcon size={16} color="#34C759" />
          Attention weight: {puzzle.score}%
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
        {selectedWord !== null
          ? 'Now tap the word it connects to'
          : 'Tap the first word, then the word it relates to'}
      </div>
    </div>
  )
}

/* ── Room 5: Prompt Lab ── */

function Room5Challenge({ rs, updateRS, onComplete, onRetry }) {
  const { taskIndex, selected, feedback, wrongAttempts } = rs
  const task = PROMPT_TASKS[taskIndex]
  if (!task) return null

  function toggleIngredient(name) {
    if (feedback === 'correct') return
    const next = new Set(selected)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    updateRS({ selected: next, feedback: null })
  }

  function checkCombo() {
    const isCorrect = task.correct.size === selected.size &&
      [...task.correct].every((s) => selected.has(s))
    if (isCorrect) {
      updateRS({ feedback: 'correct' })
    } else {
      onRetry()
      const attempts = (wrongAttempts || 0) + 1
      updateRS({ feedback: 'wrong', wrongAttempts: attempts })
      setTimeout(() => updateRS({ feedback: null, wrongAttempts: attempts }), 1200)
    }
  }

  function handleNext() {
    if (taskIndex + 1 >= PROMPT_TASKS.length) {
      onComplete()
    } else {
      updateRS({ taskIndex: taskIndex + 1, selected: new Set(), feedback: null, wrongAttempts: 0 })
    }
  }

  // Determine hint based on wrong attempts
  const hintText = wrongAttempts >= 2
    ? `This task needs exactly ${task.correct.size} ingredients`
    : wrongAttempts >= 1
    ? (selected.size < task.correct.size ? 'Try adding more ingredients' : selected.size > task.correct.size ? 'Try using fewer ingredients' : 'Some ingredients are wrong — try swapping')
    : null

  const previewOutput = feedback === 'correct' ? task.goodOutput
    : selected.size > 0 ? task.badOutput
    : 'Select ingredients and check your combination...'

  return (
    <div>
      <div className="ale-score-bar">
        <span>{feedback === 'correct' ? taskIndex + 1 : taskIndex}/{PROMPT_TASKS.length} tasks</span>
        <div className="ale-score-fill">
          <div className="ale-score-fill-bar" style={{ width: `${((feedback === 'correct' ? taskIndex + 1 : taskIndex) / PROMPT_TASKS.length) * 100}%` }} />
        </div>
      </div>

      <div className="ale-task-card">
        <div className="ale-task-label">Task {taskIndex + 1}</div>
        <div className="ale-task-text">{task.instruction}</div>
      </div>

      <div className={`ale-ingredients${feedback === 'wrong' ? ' ale-ingredients-shake' : ''}`}>
        {INGREDIENTS.map((name) => {
          let cls = 'ale-ingredient'
          if (selected.has(name)) cls += ' ale-ingredient-selected'
          if (feedback === 'correct' && task.correct.has(name)) cls += ' ale-ingredient-correct'
          if (feedback === 'wrong' && selected.has(name)) cls += ' ale-ingredient-wrong'
          return (
            <button key={name} className={cls} onClick={() => toggleIngredient(name)}>
              {name}
            </button>
          )
        })}
      </div>

      {feedback === 'wrong' && (
        <div className="ale-wrong-feedback">
          <CrossIcon size={14} color="#FF3B30" />
          Not quite — try a different combination
        </div>
      )}

      {hintText && feedback !== 'wrong' && feedback !== 'correct' && (
        <div className="ale-combo-hint">
          <TipIcon size={14} color="#eab308" />
          {hintText}
        </div>
      )}

      <div className="ale-prompt-preview">
        <div className="ale-prompt-preview-label">Output Preview</div>
        <div className="ale-prompt-preview-text">{previewOutput}</div>
      </div>

      {feedback !== 'correct' && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button className="ale-check-btn" onClick={checkCombo} disabled={selected.size === 0 || feedback === 'wrong'}>
            Check Combination
          </button>
        </div>
      )}

      {feedback === 'correct' && (
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <div className="ale-attention-score" style={{ marginTop: 0, marginBottom: 12 }}>
            <CheckIcon size={16} color="#34C759" />
            Perfect combination!
          </div>
          <button className="ale-check-btn" onClick={handleNext}>
            {taskIndex + 1 >= PROMPT_TASKS.length ? 'Complete Room' : 'Next Task'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Room 6: Control Room ── */

function Room6Challenge({ rs, updateRS, onComplete, onRetry }) {
  const { solved, feedback } = rs

  function handleOption(problemIndex, optionIndex) {
    if (solved.has(problemIndex)) return
    const problem = CONTROL_PROBLEMS[problemIndex]
    if (optionIndex === problem.correct) {
      const next = new Set(solved)
      next.add(problemIndex)
      updateRS({ solved: next, feedback: { ...feedback, [problemIndex]: 'correct' } })
      if (next.size === CONTROL_PROBLEMS.length) {
        setTimeout(() => onComplete(), 800)
      }
    } else {
      onRetry()
      updateRS({ feedback: { ...feedback, [problemIndex]: 'wrong' } })
      setTimeout(() => {
        updateRS({ feedback: { ...feedback, [problemIndex]: null } })
      }, 600)
    }
  }

  return (
    <div>
      <div className="ale-progress-bar">
        <div className="ale-progress-label">
          <span>System Diagnostics</span>
          <span>{solved.size}/{CONTROL_PROBLEMS.length} fixed</span>
        </div>
        <div className="ale-progress-track">
          <div className="ale-progress-fill" style={{ width: `${(solved.size / CONTROL_PROBLEMS.length) * 100}%` }} />
        </div>
      </div>

      <div className="ale-diagnosis">
        {CONTROL_PROBLEMS.map((problem, pi) => (
          <div key={pi} className={`ale-problem-card${solved.has(pi) ? ' ale-problem-card-solved' : ''}`}>
            <div className="ale-problem-label">
              {solved.has(pi) ? <CheckIcon size={12} color="#34C759" /> : null}
              {' '}Problem {pi + 1}: {problem.type}
            </div>
            <div className="ale-problem-text">{problem.description}</div>
            {!solved.has(pi) && (
              <div className="ale-problem-options">
                {problem.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`ale-problem-option${feedback[pi] === 'wrong' ? ' ale-problem-option-wrong' : ''}`}
                    onClick={() => handleOption(pi, oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            {solved.has(pi) && (
              <div style={{ fontSize: 13, color: '#34C759', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckIcon size={14} color="#34C759" /> Fixed!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default AILabExplorer
