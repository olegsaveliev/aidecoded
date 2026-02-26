import { useState, useEffect, useRef, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, UserIcon, ChatIcon, FileIcon, MailIcon, GearIcon, LayersIcon, SearchIcon, LockIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { agentTeamsQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AgentTeams.css'

const STAGES = [
  { key: 'solo-vs-team', label: 'The Ceiling', tooltip: 'Why one agent isn\'t enough' },
  { key: 'architecture', label: 'Architecture', tooltip: 'The architecture: how teams work' },
  { key: 'first-team', label: 'First Team', tooltip: 'Building your first team' },
  { key: 'patterns', label: 'Patterns', tooltip: 'Three patterns that work' },
  { key: 'rough-edges', label: 'Rough Edges', tooltip: 'Rough edges and when not to use teams' },
]

const TOOLKIT = [
  { concept: 'Team Lead', when: 'Orchestrating work', phrase: 'Delegate, don\'t implement', icon: <UserIcon size={24} color="#5856D6" /> },
  { concept: 'Teammates', when: 'Parallel execution', phrase: 'Own context + role', icon: <ChatIcon size={24} color="#5856D6" /> },
  { concept: 'Task List', when: 'Coordination', phrase: 'File-backed, auto-unblocking', icon: <FileIcon size={24} color="#5856D6" /> },
  { concept: 'Mailbox', when: 'Peer communication', phrase: 'Direct agent messaging', icon: <MailIcon size={24} color="#5856D6" /> },
  { concept: 'Delegate Mode', when: 'Always', phrase: 'Shift+Tab in Claude Code', icon: <GearIcon size={24} color="#5856D6" /> },
  { concept: 'Layer Split', when: 'Stack-wide changes', phrase: 'Frontend + Backend + Tests', icon: <LayersIcon size={24} color="#5856D6" /> },
  { concept: 'QA Swarm', when: 'Pre-PR review', phrase: 'Read-only, safest first team', icon: <SearchIcon size={24} color="#5856D6" /> },
  { concept: 'File Ownership', when: 'Preventing conflicts', phrase: 'One file, one agent', icon: <LockIcon size={24} color="#5856D6" /> },
]

/* ─── Team Visualiser (shared SVG across all stages) ─── */

const LEAD_CX = 260
const LEAD_CY = 70
const T1_CX = 100
const T1_CY = 240
const T2_CX = 260
const T2_CY = 240
const T3_CX = 420
const T3_CY = 240

function lerp(a, b, t) {
  return a + (b - a) * t
}

function MessageParticle({ x1, y1, x2, y2, color, duration = 600, onDone }) {
  const [t, setT] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    startRef.current = performance.now()
    function animate(now) {
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      setT(progress)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        onDone?.()
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const cx = lerp(x1, x2, t)
  const cy = lerp(y1, y2, t)
  const opacity = t < 0.1 ? t / 0.1 : t > 0.9 ? (1 - t) / 0.1 : 1

  return <circle cx={cx} cy={cy} r={5} fill={color} opacity={opacity} />
}

function TaskBoard({ tasks }) {
  const todo = tasks.filter(t => t.status === 'todo')
  const doing = tasks.filter(t => t.status === 'doing')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <foreignObject x={440} y={20} width={175} height={280}>
      <div xmlns="http://www.w3.org/1999/xhtml" className="at-task-board">
        <div className="at-task-board-title">Task Board</div>
        <div className="at-task-board-cols">
          <div className="at-task-board-col">
            <div className="at-task-board-col-header">Todo</div>
            {todo.map(t => (
              <div key={t.id} className={`at-task-card at-task-card-${t.owner}`}>{t.label}</div>
            ))}
          </div>
          <div className="at-task-board-col">
            <div className="at-task-board-col-header">Doing</div>
            {doing.map(t => (
              <div key={t.id} className={`at-task-card at-task-card-doing at-task-card-${t.owner}`}>{t.label}</div>
            ))}
          </div>
          <div className="at-task-board-col">
            <div className="at-task-board-col-header">Done</div>
            {done.map(t => (
              <div key={t.id} className={`at-task-card at-task-card-done at-task-card-${t.owner}`}>{t.label}</div>
            ))}
          </div>
        </div>
      </div>
    </foreignObject>
  )
}

function TeamVisualiser({ teammates = ['Frontend', 'Backend', 'QA'], activeNodes = [], activeConnections = [], tasks = [], messages = [], annotations = [], showLead = true }) {
  const [messageKeys, setMessageKeys] = useState([])
  const [completedMessages, setCompletedMessages] = useState(new Set())

  useEffect(() => {
    setMessageKeys(messages.map((_, i) => `msg-${Date.now()}-${i}`))
    setCompletedMessages(new Set())
  }, [messages])

  const positions = [
    { cx: T1_CX, cy: T1_CY },
    { cx: T2_CX, cy: T2_CY },
    { cx: T3_CX, cy: T3_CY },
  ]

  if (teammates.length === 4) {
    positions.push({ cx: 180, cy: 280 })
  }

  const peerPairs = []
  for (let i = 0; i < teammates.length - 1; i++) {
    peerPairs.push([i, i + 1])
  }

  function handleMessageDone(idx) {
    setCompletedMessages(prev => new Set(prev).add(idx))
  }

  return (
    <div className="at-visualiser">
      <svg viewBox="0 0 620 350" className="at-visualiser-svg">
        {/* Lead -> Teammate connections — offset by radius so lines stop at circle edge */}
        {showLead && teammates.map((_, i) => {
          const connKey = `lead-t${i}`
          const isActive = activeConnections.includes(connKey)
          const dx = positions[i].cx - LEAD_CX
          const dy = positions[i].cy - LEAD_CY
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const leadR = 29
          const tmR = 23
          return (
            <line
              key={connKey}
              x1={LEAD_CX + dx / dist * leadR} y1={LEAD_CY + dy / dist * leadR}
              x2={positions[i].cx - dx / dist * tmR} y2={positions[i].cy - dy / dist * tmR}
              stroke={isActive ? '#5856D6' : 'var(--border)'}
              strokeWidth={isActive ? 2 : 1.5}
              className={isActive ? 'at-connection-active' : ''}
            />
          )
        })}

        {/* Peer connections (dashed) — offset by radius+gap so lines stop outside circle edge */}
        {peerPairs.map(([i, j]) => {
          const connKey = `t${i}-t${j}`
          const isActive = activeConnections.includes(connKey)
          const dx = positions[j].cx - positions[i].cx
          const dy = positions[j].cy - positions[i].cy
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const r = 24
          return (
            <line
              key={connKey}
              x1={positions[i].cx + dx / dist * r} y1={positions[i].cy + dy / dist * r}
              x2={positions[j].cx - dx / dist * r} y2={positions[j].cy - dy / dist * r}
              stroke={isActive ? '#5856D6' : 'var(--border)'}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray="4 3"
              className={isActive ? 'at-connection-active' : ''}
            />
          )
        })}

        {/* Lead node */}
        {showLead && (
          <g>
            <circle
              cx={LEAD_CX} cy={LEAD_CY} r={26}
              fill="#5856D6"
              className={activeNodes.includes('lead') ? 'at-node-lead-active' : 'at-node-lead'}
            />
            <text x={LEAD_CX} y={LEAD_CY + 5} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700}>L</text>
            <text x={LEAD_CX} y={LEAD_CY - 46} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>Orchestrates</text>
            <text x={LEAD_CX} y={LEAD_CY - 33} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>Team Lead</text>
          </g>
        )}

        {/* Teammate nodes */}
        {teammates.map((name, i) => {
          const isActive = activeNodes.includes(`t${i}`)
          return (
            <g key={i}>
              <circle
                cx={positions[i].cx} cy={positions[i].cy} r={20}
                fill={isActive ? 'rgba(88,86,214,0.15)' : 'var(--bg-card)'}
                stroke={isActive ? '#5856D6' : '#5856D6'}
                strokeWidth={2}
                className={isActive ? 'at-node-teammate-active' : 'at-node-teammate'}
              />
              <text x={positions[i].cx} y={positions[i].cy + 4} textAnchor="middle" fill="var(--text-primary)" fontSize={11} fontWeight={600}>T{i + 1}</text>
              <text x={positions[i].cx} y={positions[i].cy + 36} textAnchor="middle" fill="var(--text-secondary)" fontSize={11}>{name}</text>
            </g>
          )
        })}

        {/* Annotations */}
        {annotations.map((a, i) => (
          <g key={i}>
            <line x1={a.fromX} y1={a.fromY} x2={a.toX} y2={a.toY} stroke="var(--text-tertiary)" strokeWidth={1} strokeDasharray="3 2" />
            <foreignObject x={a.labelX} y={a.labelY} width={a.labelW || 140} height={50}>
              <div xmlns="http://www.w3.org/1999/xhtml" className="at-annotation">
                <div className="at-annotation-title">{a.title}</div>
                {a.subtitle && <div className="at-annotation-subtitle">{a.subtitle}</div>}
              </div>
            </foreignObject>
          </g>
        ))}

        {/* Messages in flight */}
        {messages.map((msg, idx) => {
          if (completedMessages.has(idx)) return null
          const key = messageKeys[idx] || `msg-${idx}`
          return (
            <MessageParticle
              key={key}
              x1={msg.x1} y1={msg.y1}
              x2={msg.x2} y2={msg.y2}
              color={msg.color || '#5856D6'}
              duration={msg.duration || 600}
              onDone={() => handleMessageDone(idx)}
            />
          )
        })}

        {/* Task board */}
        {tasks.length > 0 && <TaskBoard tasks={tasks} />}
      </svg>
    </div>
  )
}

/* ─── Stage 1: Solo vs Team ─── */
function SoloVsTeamViz({ active }) {
  const [view, setView] = useState('solo')
  const [soloQueue, setSoloQueue] = useState(0)
  const [teamWorking, setTeamWorking] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setSoloQueue(0)
    setTeamWorking(false)
    if (!active) return

    if (view === 'solo') {
      timersRef.current.push(setTimeout(() => setSoloQueue(1), 600))
      timersRef.current.push(setTimeout(() => setSoloQueue(2), 1200))
      timersRef.current.push(setTimeout(() => setSoloQueue(3), 1800))
    } else {
      timersRef.current.push(setTimeout(() => setTeamWorking(true), 400))
    }

    return clearTimers
  }, [active, view])

  return (
    <div>
      <div className="at-toggle-row">
        <button className={`at-toggle-btn ${view === 'solo' ? 'at-toggle-btn-active' : ''}`} onClick={() => setView('solo')}>Solo</button>
        <button className={`at-toggle-btn ${view === 'team' ? 'at-toggle-btn-active' : ''}`} onClick={() => setView('team')}>Team</button>
      </div>

      <div className="at-view-container">
        <div className={`at-view-panel ${view === 'solo' ? 'at-view-panel-active' : ''}`}>
          <div className="at-solo-viz">
            <div className="at-solo-node">
              <div className="at-solo-node-circle">
                <span>Agent</span>
              </div>
              <div className="at-solo-queue">
                {soloQueue >= 1 && <div className="at-solo-task at-solo-task-1">API</div>}
                {soloQueue >= 2 && <div className="at-solo-task at-solo-task-2">UI</div>}
                {soloQueue >= 3 && <div className="at-solo-task at-solo-task-3">Tests</div>}
              </div>
              <div className="at-solo-badge">{soloQueue} task{soloQueue !== 1 ? 's' : ''} queued...</div>
            </div>
          </div>
        </div>
        <div className={`at-view-panel ${view === 'team' ? 'at-view-panel-active' : ''}`}>
          <TeamVisualiser
            teammates={['Frontend', 'Backend', 'QA']}
            activeNodes={teamWorking ? ['lead', 't0', 't1', 't2'] : ['lead']}
            activeConnections={teamWorking ? ['lead-t0', 'lead-t1', 'lead-t2'] : []}
            tasks={teamWorking ? [
              { id: 'a', label: 'API', status: 'doing', owner: 't1' },
              { id: 'b', label: 'UI', status: 'doing', owner: 't0' },
              { id: 'c', label: 'Tests', status: 'doing', owner: 't2' },
            ] : [
              { id: 'a', label: 'API', status: 'todo', owner: 't1' },
              { id: 'b', label: 'UI', status: 'todo', owner: 't0' },
              { id: 'c', label: 'Tests', status: 'todo', owner: 't2' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}

/* ─── Stage 2: Architecture Demo ─── */
function ArchitectureViz({ active }) {
  const [step, setStep] = useState(-1)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setStep(-1)
    setAutoPlaying(false)
    return clearTimers
  }, [active])

  function playDemo() {
    clearTimers()
    setStep(0)
    setAutoPlaying(true)
    timersRef.current.push(setTimeout(() => setStep(1), 1500))
    timersRef.current.push(setTimeout(() => setStep(2), 3000))
    timersRef.current.push(setTimeout(() => setStep(3), 5000))
    timersRef.current.push(setTimeout(() => setStep(4), 6500))
    timersRef.current.push(setTimeout(() => setStep(5), 8000))
    timersRef.current.push(setTimeout(() => { setStep(-1); setAutoPlaying(false) }, 10000))
  }

  const stepLabels = [
    'Lead assigns tasks...',
    'Tasks distributed...',
    'Teammates working...',
    'Peer message: T1 \u2192 T2',
    'Tasks completing...',
    'Results to Lead...',
  ]

  const tasks = step < 0 ? [] :
    step === 0 ? [
      { id: 'a', label: 'API', status: 'todo', owner: 't1' },
      { id: 'b', label: 'UI', status: 'todo', owner: 't0' },
      { id: 'c', label: 'Tests', status: 'todo', owner: 't2' },
    ] :
    step <= 2 ? [
      { id: 'a', label: 'API', status: 'doing', owner: 't1' },
      { id: 'b', label: 'UI', status: 'doing', owner: 't0' },
      { id: 'c', label: 'Tests', status: 'doing', owner: 't2' },
    ] :
    step === 3 ? [
      { id: 'a', label: 'API', status: 'doing', owner: 't1' },
      { id: 'b', label: 'UI', status: 'doing', owner: 't0' },
      { id: 'c', label: 'Tests', status: 'doing', owner: 't2' },
    ] : [
      { id: 'a', label: 'API', status: 'done', owner: 't1' },
      { id: 'b', label: 'UI', status: 'done', owner: 't0' },
      { id: 'c', label: 'Tests', status: 'done', owner: 't2' },
    ]

  const activeNodes = step < 0 ? [] :
    step === 0 ? ['lead'] :
    step <= 3 ? ['lead', 't0', 't1', 't2'] :
    ['lead', 't0', 't1', 't2']

  const activeConnections = step < 0 ? [] :
    step === 0 ? [] :
    step === 1 ? ['lead-t0', 'lead-t1', 'lead-t2'] :
    step === 3 ? ['lead-t0', 'lead-t1', 'lead-t2', 't0-t1'] :
    ['lead-t0', 'lead-t1', 'lead-t2']

  const messages = step === 3 ? [{ x1: T1_CX, y1: T1_CY, x2: T2_CX, y2: T2_CY, color: '#0071E3' }] :
    step === 5 ? [
      { x1: T1_CX, y1: T1_CY, x2: LEAD_CX, y2: LEAD_CY, color: '#0071E3' },
      { x1: T2_CX, y1: T2_CY, x2: LEAD_CX, y2: LEAD_CY, color: '#34C759' },
      { x1: T3_CX, y1: T3_CY, x2: LEAD_CX, y2: LEAD_CY, color: '#FF9500' },
    ] : []

  const annotations = step < 0 ? [
    { fromX: LEAD_CX + 30, fromY: LEAD_CY + 15, toX: LEAD_CX + 70, toY: LEAD_CY + 15, labelX: LEAD_CX + 72, labelY: LEAD_CY + 2, labelW: 190, title: 'Team Lead', subtitle: 'Delegate mode: coordination only' },
    { fromX: T1_CX, fromY: T1_CY - 26, toX: T1_CX, toY: T1_CY - 50, labelX: T1_CX - 50, labelY: T1_CY - 90, labelW: 160, title: 'Teammates', subtitle: 'Own context window + role' },
    { fromX: T3_CX, fromY: T3_CY - 26, toX: T3_CX, toY: T3_CY - 50, labelX: T3_CX - 10, labelY: T3_CY - 90, labelW: 170, title: 'Shared Task List', subtitle: 'File-backed, auto-unblocking' },
    { fromX: T2_CX, fromY: T2_CY + 26, toX: T2_CX, toY: T2_CY + 50, labelX: T2_CX - 60, labelY: T2_CY + 52, title: 'Mailbox System', subtitle: 'Direct peer messaging' },
  ] : []

  return (
    <div>
      <TeamVisualiser
        teammates={['Frontend', 'Backend', 'QA']}
        activeNodes={activeNodes}
        activeConnections={activeConnections}
        tasks={tasks}
        messages={messages}
        annotations={annotations}
      />
      {step >= 0 && step < stepLabels.length && (
        <div className="at-demo-label how-fade-in">{stepLabels[step]}</div>
      )}
      <button className="at-play-btn" onClick={playDemo} disabled={autoPlaying}>
        {autoPlaying ? 'Playing...' : 'Play Architecture Demo'}
      </button>
    </div>
  )
}

/* ─── Stage 3: Team Builder ─── */
const PATTERN_PRESETS = {
  exploration: { label: 'Parallel Exploration', desc: 'Multiple agents research different angles simultaneously', roles: ['Researcher', 'Architect', 'Devil\'s Advocate'] },
  layers: { label: 'Layer Split', desc: 'Each agent owns one layer of the stack — no file conflicts', roles: ['Frontend', 'Backend', 'Tests'] },
  qa: { label: 'QA Swarm', desc: 'Read-only agents review code in parallel for faster feedback', roles: ['Happy Path', 'Edge Cases', 'Security'] },
}

function TeamBuilderViz({ active }) {
  const [task, setTask] = useState('')
  const [teamSize, setTeamSize] = useState(3)
  const [pattern, setPattern] = useState('layers')
  const [roles, setRoles] = useState([...PATTERN_PRESETS.layers.roles])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!active) {
      setTask('')
      setTeamSize(3)
      setPattern('layers')
      setRoles([...PATTERN_PRESETS.layers.roles])
      setCopied(false)
    }
  }, [active])

  function selectPattern(key) {
    setPattern(key)
    const preset = PATTERN_PRESETS[key]
    setRoles([...preset.roles])
    setTeamSize(preset.roles.length)
  }

  function updateRole(i, value) {
    const next = [...roles]
    next[i] = value
    setRoles(next)
  }

  useEffect(() => {
    if (teamSize > roles.length) {
      setRoles([...roles, ...Array(teamSize - roles.length).fill('Specialist')])
    } else if (teamSize < roles.length) {
      setRoles(roles.slice(0, teamSize))
    }
  }, [teamSize]) // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = `${task || 'Describe your task here...'}\nCreate an agent team with ${teamSize} teammates:\n${roles.map((r, i) => `- ${r}: focus on ${r.toLowerCase()} scope`).join('\n')}\nUse delegate mode. Split work so teammates\ndo not edit the same files.`

  function copyPrompt() {
    navigator.clipboard?.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="at-team-builder">
        <div className="at-builder-step">
          <div className="at-builder-step-num">1</div>
          <div className="at-builder-step-content">
            <div className="at-builder-step-label">What are you building?</div>
            <div className="at-builder-step-hint">Describe the task you want the team to work on</div>
            <textarea
              className="at-builder-textarea"
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="e.g. Refactor auth across API, frontend, and tests"
              rows={2}
            />
          </div>
        </div>

        <div className="at-builder-step">
          <div className="at-builder-step-num">2</div>
          <div className="at-builder-step-content">
            <div className="at-builder-step-label">How many teammates?</div>
            <div className="at-builder-step-hint">More teammates = more parallelism, but harder to coordinate</div>
            <div className="at-size-btns">
              {[2, 3, 4].map(n => (
                <button key={n} className={`at-size-btn ${teamSize === n ? 'at-size-btn-active' : ''}`} onClick={() => setTeamSize(n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="at-builder-step">
          <div className="at-builder-step-num">3</div>
          <div className="at-builder-step-content">
            <div className="at-builder-step-label">Team pattern:</div>
            <div className="at-builder-step-hint">Pick a preset or customize the roles below</div>
            <div className="at-pattern-btns">
              {Object.entries(PATTERN_PRESETS).map(([key, val]) => (
                <button key={key} className={`at-pattern-btn ${pattern === key ? 'at-pattern-btn-active' : ''}`} onClick={() => selectPattern(key)}>
                  {val.label}
                </button>
              ))}
            </div>
            <div className="at-builder-step-hint" style={{ marginTop: 8 }}>{PATTERN_PRESETS[pattern].desc}</div>
            <div className="at-role-inputs">
              {roles.map((r, i) => (
                <input key={i} className="at-role-input" value={r} onChange={e => updateRole(i, e.target.value)} placeholder={`Teammate ${i + 1} role`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="at-prompt-preview">
        <button className="at-copy-btn" onClick={copyPrompt}>
          {copied ? <CheckIcon size={14} color="#34C759" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5856D6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre>{prompt}</pre>
      </div>

      <TeamVisualiser
        teammates={roles.slice(0, teamSize)}
        activeNodes={['lead', ...roles.slice(0, teamSize).map((_, i) => `t${i}`)]}
        activeConnections={roles.slice(0, teamSize).map((_, i) => `lead-t${i}`)}
        tasks={[]}
      />
    </div>
  )
}

/* ─── Stage 4: Pattern Tabs ─── */
function PatternsViz({ active }) {
  const [tab, setTab] = useState('exploration')
  const [animating, setAnimating] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setTab('exploration')
    setAnimating(false)
    return clearTimers
  }, [active])

  function playPattern() {
    setAnimating(true)
    clearTimers()
    timersRef.current.push(setTimeout(() => setAnimating(false), 3000))
  }

  const configs = {
    exploration: {
      teammates: ['Researcher', 'Architect', 'Devil\'s Adv.'],
      activeNodes: animating ? ['lead', 't0', 't1', 't2'] : ['lead'],
      activeConnections: animating ? ['lead-t0', 'lead-t1', 'lead-t2', 't0-t1', 't1-t2'] : [],
      tasks: animating ? [
        { id: 'a', label: 'Research', status: 'doing', owner: 't0' },
        { id: 'b', label: 'Design', status: 'doing', owner: 't1' },
        { id: 'c', label: 'Risks', status: 'doing', owner: 't2' },
      ] : [
        { id: 'a', label: 'Research', status: 'todo', owner: 't0' },
        { id: 'b', label: 'Design', status: 'todo', owner: 't1' },
        { id: 'c', label: 'Risks', status: 'todo', owner: 't2' },
      ],
    },
    layers: {
      teammates: ['Frontend', 'Backend', 'Tests'],
      activeNodes: animating ? ['lead', 't0', 't1', 't2'] : ['lead'],
      activeConnections: animating ? ['lead-t0', 'lead-t1', 'lead-t2', 't0-t1'] : [],
      tasks: animating ? [
        { id: 'a', label: 'UI', status: 'doing', owner: 't0' },
        { id: 'b', label: 'API', status: 'doing', owner: 't1' },
        { id: 'c', label: 'Tests', status: 'todo', owner: 't2' },
      ] : [
        { id: 'a', label: 'UI', status: 'todo', owner: 't0' },
        { id: 'b', label: 'API', status: 'todo', owner: 't1' },
        { id: 'c', label: 'Tests', status: 'todo', owner: 't2' },
      ],
      messages: animating ? [{ x1: T1_CX, y1: T1_CY, x2: T2_CX, y2: T2_CY, color: '#0071E3', duration: 800 }] : [],
    },
    qa: {
      teammates: ['Correctness', 'Edge Cases', 'Security'],
      activeNodes: animating ? ['lead', 't0', 't1', 't2'] : ['lead'],
      activeConnections: animating ? ['lead-t0', 'lead-t1', 'lead-t2'] : [],
      tasks: animating ? [
        { id: 'a', label: 'Correct', status: 'doing', owner: 't0' },
        { id: 'b', label: 'Edges', status: 'doing', owner: 't1' },
        { id: 'c', label: 'Security', status: 'doing', owner: 't2' },
      ] : [
        { id: 'a', label: 'Correct', status: 'todo', owner: 't0' },
        { id: 'b', label: 'Edges', status: 'todo', owner: 't1' },
        { id: 'c', label: 'Security', status: 'todo', owner: 't2' },
      ],
    },
  }

  const cfg = configs[tab]

  return (
    <div>
      <div className="at-pattern-tabs">
        {[
          { key: 'exploration', label: 'Exploration', desc: 'Multiple agents research different angles simultaneously, then the lead synthesises findings' },
          { key: 'layers', label: 'Layer Split', desc: 'Each agent owns one layer of the stack — frontend, backend, tests — so no files conflict' },
          { key: 'qa', label: 'QA Swarm', desc: 'Read-only agents review code in parallel — safe because reviewers don\'t edit files' },
        ].map(t => (
          <button
            key={t.key}
            className={`at-pattern-tab ${tab === t.key ? 'at-pattern-tab-active' : ''}`}
            onClick={() => { setTab(t.key); setAnimating(false); clearTimers() }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="at-pattern-desc">
        {tab === 'exploration' && 'Multiple agents research different angles simultaneously, then the lead synthesises findings'}
        {tab === 'layers' && 'Each agent owns one layer of the stack — frontend, backend, tests — so no files conflict'}
        {tab === 'qa' && 'Read-only agents review code in parallel — safe because reviewers don\'t edit files'}
      </div>

      <TeamVisualiser
        teammates={cfg.teammates}
        activeNodes={cfg.activeNodes}
        activeConnections={cfg.activeConnections}
        tasks={cfg.tasks}
        messages={cfg.messages || []}
      />

      <button className="at-play-btn" onClick={playPattern} disabled={animating}>
        {animating ? 'Animating...' : `Play ${tab === 'exploration' ? 'Exploration' : tab === 'layers' ? 'Layer Split' : 'QA Swarm'} Demo`}
      </button>
    </div>
  )
}

/* ─── Stage 5: Decision Matrix + Rough Edges ─── */
function RoughEdgesViz({ active }) {
  const [hoveredDot, setHoveredDot] = useState(null)

  const dots = [
    { x: 120, y: 200, label: 'Debug a bug', desc: 'Solo agent. Sequential investigation.', region: 'solo' },
    { x: 295, y: 200, label: 'QA review', desc: 'Team for speed. Read-only parallelism.', region: 'team-easy' },
    { x: 120, y: 80, label: 'Sequential pipeline', desc: 'Solo agent. Too interdependent for teams.', region: 'solo' },
    { x: 295, y: 80, label: 'Full-stack feature', desc: 'Team shines here. Independent layers.', region: 'team' },
  ]

  const roughEdges = [
    { title: 'Lead Tries to Implement', problem: 'Lead writes code instead of delegating.', fix: 'Use delegate mode (Shift+Tab). Remind lead of its role.' },
    { title: 'Task Status Lag', problem: 'Teammate finishes but forgets to mark done.', fix: 'Check manually. Ask lead to update status.' },
    { title: 'No Session Resumption', problem: 'After /resume, teammates no longer exist.', fix: 'Spawn fresh teammates and continue.' },
    { title: 'Slow Shutdown', problem: 'Teammates finish current tool call before stopping.', fix: 'Be patient. Tell lead to wait for shutdown.' },
  ]

  return (
    <div>
      <div className="at-matrix">
        <svg viewBox="0 0 400 280" className="at-matrix-svg">
          {/* Grid */}
          <line x1={40} y1={10} x2={40} y2={260} stroke="var(--border)" strokeWidth={1} />
          <line x1={40} y1={260} x2={390} y2={260} stroke="var(--border)" strokeWidth={1} />
          {/* Axis labels */}
          <text x={215} y={278} textAnchor="middle" fill="var(--text-tertiary)" fontSize={11}>Task Independence &rarr;</text>
          <text x={12} y={140} textAnchor="middle" fill="var(--text-tertiary)" fontSize={11} transform="rotate(-90, 12, 140)">Complexity &rarr;</text>
          {/* Quadrant labels */}
          <text x={120} y={248} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>Solo agent</text>
          <text x={295} y={248} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>Team for speed</text>
          <text x={120} y={25} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>Solo: too interdependent</text>
          <text x={295} y={25} textAnchor="middle" fill="var(--text-tertiary)" fontSize={9}>Team shines here</text>
          {/* Grid lines */}
          <line x1={200} y1={10} x2={200} y2={260} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" />
          <line x1={40} y1={140} x2={390} y2={140} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 2" />
          {/* Dots */}
          {dots.map((d, i) => (
            <g key={i}
              onMouseEnter={() => setHoveredDot(i)}
              onMouseLeave={() => setHoveredDot(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={d.x} cy={d.y} r={hoveredDot === i ? 10 : 8}
                fill={d.region.includes('team') ? '#5856D6' : 'var(--text-tertiary)'}
                opacity={0.8}
              />
              <text x={d.x} y={d.y - 14} textAnchor="middle" fill="var(--text-primary)" fontSize={10} fontWeight={500}>{d.label}</text>
            </g>
          ))}
        </svg>
        {hoveredDot !== null && (
          <div className="at-matrix-tooltip">{dots[hoveredDot].desc}</div>
        )}
      </div>

      <div className="at-rough-cards">
        {roughEdges.map(re => (
          <div key={re.title} className="at-rough-card">
            <div className="at-rough-card-title"><WarningIcon size={14} color="#F59E0B" /> {re.title}</div>
            <div className="at-rough-card-problem">{re.problem}</div>
            <div className="at-rough-card-fix"><strong>Fix:</strong> {re.fix}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Stage tool chips ─── */
const STAGE_TOOLS = [
  /* Stage 0: What Are Agent Teams? */
  [
    { name: 'Claude Code', color: '#5856D6', desc: 'Anthropic\'s CLI tool for coding with Claude' },
    { name: 'Agent Teams', color: '#5856D6', desc: 'Multiple Claude Code sessions working in parallel on one task' },
    { name: 'Opus 4.6', color: '#AF52DE', desc: 'Claude\'s most capable model — required for team lead' },
    { name: 'Parallel execution', color: '#34C759', desc: 'Teammates work simultaneously instead of sequentially' },
    { name: 'Context windows', color: '#FF9500', desc: 'Each teammate gets its own full context window' },
  ],
  /* Stage 1: Architecture */
  [
    { name: 'TeamCreate', color: '#5856D6', desc: 'Tool the lead uses to spawn a new teammate session' },
    { name: 'TeammateTool', color: '#5856D6', desc: 'Internal tool teammates use to communicate with the lead' },
    { name: 'TaskCreate', color: '#34C759', desc: 'Creates a task on the shared task list file' },
    { name: 'TaskUpdate', color: '#34C759', desc: 'Marks a task as in-progress, done, or blocked' },
    { name: 'MessageSend', color: '#0071E3', desc: 'Sends a direct message between teammates via mailbox files' },
    { name: 'delegate mode', color: '#FF9500', desc: 'Restricts the lead to coordination only — no code editing' },
    { name: 'Shift+Tab', color: '#FF9500', desc: 'Keyboard shortcut to toggle delegate mode in Claude Code' },
    { name: 'split panes', color: '#8E8E93', desc: 'Terminal panes (tmux/iTerm) to watch teammates work live' },
    { name: 'tmux', color: '#8E8E93', desc: 'Terminal multiplexer — view all agent sessions at once' },
  ],
  /* Stage 2: Setup */
  [
    { name: 'settings.json', color: '#5856D6', desc: 'Claude Code config file where you enable experimental features' },
    { name: 'AGENT_TEAMS flag', color: '#5856D6', desc: 'Environment variable that enables the agent teams feature' },
    { name: 'TeamCreate', color: '#34C759', desc: 'Tool the lead uses to spawn a new teammate session' },
    { name: 'role assignment', color: '#FF9500', desc: 'Give each teammate a specific focus area in the system prompt' },
    { name: 'file ownership', color: '#FF9500', desc: 'Each teammate only edits files in its assigned scope' },
    { name: 'plan mode', color: '#0071E3', desc: 'Lead plans the approach first, then spawns teammates to execute' },
    { name: 'delegate mode', color: '#0071E3', desc: 'Restricts the lead to coordination only — no code editing' },
  ],
  /* Stage 3: Patterns */
  [
    { name: 'parallel exploration', color: '#5856D6', desc: 'Multiple agents research different angles at the same time' },
    { name: 'layer split', color: '#5856D6', desc: 'Divide work by stack layer — frontend, backend, tests' },
    { name: 'QA swarm', color: '#5856D6', desc: 'Read-only agents review code in parallel for fast feedback' },
    { name: 'file ownership', color: '#FF9500', desc: 'Prevent merge conflicts by assigning files to one agent only' },
    { name: 'peer messaging', color: '#0071E3', desc: 'Teammates message each other directly via mailbox files' },
    { name: 'delegate mode', color: '#0071E3', desc: 'Restricts the lead to coordination only — no code editing' },
    { name: 'dependency tasks', color: '#34C759', desc: 'Tasks that block until a prerequisite task is completed' },
    { name: 'synthesis', color: '#34C759', desc: 'Lead collects and merges results from all teammates' },
  ],
  /* Stage 4: Rough Edges */
  [
    { name: 'delegate mode', color: '#5856D6', desc: 'Restricts the lead to coordination only — no code editing' },
    { name: 'task status', color: '#34C759', desc: 'Track what each teammate is doing via the shared task file' },
    { name: '/resume', color: '#FF9500', desc: 'Resume a Claude Code session — teammates do not persist' },
    { name: 'cleanup', color: '#FF9500', desc: 'Teammates may leave temp files — review after shutdown' },
    { name: 'cost awareness', color: '#FF3B30', desc: 'Each teammate uses its own tokens — teams cost more' },
    { name: 'file ownership', color: '#0071E3', desc: 'Prevent merge conflicts by assigning files to one agent only' },
    { name: 'split panes', color: '#8E8E93', desc: 'Terminal panes to monitor all teammate sessions at once' },
  ],
]

/* ─── Stage content ─── */
const STAGE_CONTENT = [
  // Stage 0 - Solo vs Team
  {
    title: 'The Ceiling',
    content: (
      <>
        <div className="at-two-col">
          <div className="at-col-card">
            <div className="at-col-heading">The Solo Agent Problem</div>
            <p>One Claude Code session. One context window. One thing at a time.</p>
            <p>You ask it to refactor authentication across three services. It gets 60% there. Context fills up. Quality degrades. It starts losing track of what it did.</p>
            <div className="at-col-heading at-col-heading-plain">The fundamental bottleneck</div>
            <p>A single agent cannot do independent work in parallel. While it builds the API layer, the frontend waits. While it writes tests, both wait. Everything is sequential.</p>
          </div>
          <div className="at-col-card">
            <div className="at-col-heading">What Agent Teams Adds</div>
            <p>Multiple Claude Code sessions. Each with its own full context window. They can work simultaneously. They can message each other directly. They share a task board. One lead coordinates everything.</p>
            <div className="at-shift-block">
              <div className="at-shift-title">The shift</div>
              <div className="at-shift-rows">
                <div className="at-shift-row"><span className="at-shift-from">Sequential</span><span className="at-shift-arrow">&rarr;</span><span className="at-shift-to">Parallel</span></div>
                <div className="at-shift-row"><span className="at-shift-from">One context</span><span className="at-shift-arrow">&rarr;</span><span className="at-shift-to">Many contexts</span></div>
                <div className="at-shift-row"><span className="at-shift-from">Monologue</span><span className="at-shift-arrow">&rarr;</span><span className="at-shift-to">Collaboration</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="at-example-block">
          <div className="at-example-block-title">Real failure mode</div>
          <p className="at-example-prompt">&ldquo;Refactor auth across api/, frontend/, and tests/ &mdash; keep everything working.&rdquo;</p>
          <div className="at-comparison-rows">
            <div className="at-comparison-row at-comparison-row-bad">
              <span className="at-comparison-label">One agent</span>
              <span>45 min, context pressure, mistakes in 3rd file</span>
            </div>
            <div className="at-comparison-row at-comparison-row-good">
              <span className="at-comparison-label">Three agents</span>
              <span>15 min, each focused, full context on their slice</span>
            </div>
          </div>
        </div>

        <div className="at-callout">
          <div className="at-callout-title">The mental model</div>
          <p>&ldquo;Subagents are function calls. Agent Teams are organisations.&rdquo;</p>
          <p>A function call does work and returns. An organisation has roles, communication, shared goals, and ongoing coordination. That is the difference.</p>
        </div>
      </>
    ),
    tip: 'Agent Teams shine when work streams are genuinely independent. Parallel execution only helps if the tasks do not depend on each other. Before spawning a team, ask: can these tasks happen simultaneously, or does one need the other\'s output first?',
  },
  // Stage 1 - Architecture
  {
    title: 'How Teams Actually Work',
    content: (
      <>
        <p>Five components make up every agent team. Understanding them turns a black box into something you can design deliberately.</p>

        <div className="at-component-card">
          <div className="at-component-num">1</div>
          <div className="at-component-body">
            <strong>The Team Lead</strong>
            <p>Your main Claude Code session. Spawns teammates. Assigns tasks. Synthesises results when work is complete.</p>
            <p><strong>Delegate mode</strong> (the critical setting): By default the lead tries to do work itself instead of delegating. Delegate mode restricts the lead to coordination tools only: assign tasks, send messages, review teammate output, synthesise results. Toggle: <strong>Shift+Tab</strong> in Claude Code. Always use delegate mode for real teams.</p>
          </div>
        </div>

        <div className="at-component-card">
          <div className="at-component-num">2</div>
          <div className="at-component-body">
            <strong>Teammates</strong>
            <p>Independent Claude Code sessions. Each has its own full context window. Each gets a role-specific system prompt. Teammates can message the lead and each other directly &mdash; unlike subagents which can only report up. This peer communication is the key architectural difference.</p>
          </div>
        </div>

        <div className="at-component-card">
          <div className="at-component-num">3</div>
          <div className="at-component-body">
            <strong>Shared Task List</strong>
            <p>File-backed task board stored at <code>~/.claude/tasks/&#123;team-name&#125;/</code>. Tasks have: title, status, owner, dependencies. Status flow: todo &rarr; in_progress &rarr; done. Dependencies auto-unblock: when task A completes, task B automatically becomes available.</p>
          </div>
        </div>

        <div className="at-component-card">
          <div className="at-component-num">4</div>
          <div className="at-component-body">
            <strong>Mailbox System</strong>
            <p>Agents communicate via inbox files. Each agent appends JSON messages. Other agents poll their inbox. Frontend discovers the API returns a different shape than expected. It messages Backend directly. Backend adjusts. No lead involvement needed. This coordination without the lead is what makes teams genuinely powerful.</p>
          </div>
        </div>

        <div className="at-component-card">
          <div className="at-component-num">5</div>
          <div className="at-component-body">
            <strong>Display Modes</strong>
            <p><strong>In-process</strong> (default): Teammates run inside main session. Simple. Single terminal.<br /><strong>Split panes</strong> (recommended for 3+ teammates): Each in own tmux/iTerm2 pane. Watch all working simultaneously.</p>
          </div>
        </div>
      </>
    ),
    tip: 'The shared task list is more than a queue. It is the coordination contract between agents. Well-written tasks with clear dependencies let the team self-organise. Vague tasks with no scope boundaries cause agents to step on each other\'s edits. Invest time in the task list before spawning. Same as writing good tickets for a dev team.',
  },
  // Stage 2 - Building Your First Team
  {
    title: 'Your First Team in 60 Seconds',
    content: (
      <>
        <p>Enable agent teams:</p>
        <div className="at-code-block">
          <code>&#123; &quot;env&quot;: &#123; &quot;CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS&quot;: &quot;1&quot; &#125; &#125;</code>
        </div>
        <p>Or via shell:</p>
        <div className="at-code-block">
          <code>export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1</code>
        </div>

        <p>Now spawn a team with one natural language instruction.</p>

        <div className="at-example-card">
          <strong>Example 1 &mdash; Parallel Exploration</strong>
          <p>&ldquo;I am building a CLI tool that tracks TODO comments. Create an agent team: one on UX, one on architecture, one playing devil&rsquo;s advocate. Use delegate mode.&rdquo;</p>
        </div>

        <div className="at-example-card">
          <strong>Example 2 &mdash; Parallel Implementation</strong>
          <p>&ldquo;Refactor the payment module. Spawn three teammates: one for src/api/payments/, one for db/migrations/, one for tests/payments/. Split by file ownership.&rdquo;</p>
        </div>

        <p className="at-section-heading">What Claude does automatically</p>
        <p>Creates team config, writes initial task list with dependencies, spawns teammate sessions with role prompts, sets up mailboxes, assigns tasks and begins coordination.</p>

        <p className="at-section-heading">Interacting with your team</p>
        <p>Talk to the lead as normal: &ldquo;How is the refactor going?&rdquo; Monitor: &ldquo;Show me the task list status.&rdquo; Nudge: &ldquo;The migration task looks stuck.&rdquo; Always clean up: &ldquo;Clean up the team.&rdquo;</p>
      </>
    ),
    tip: 'Plan first, then team. Use Claude Code\'s plan mode (cheap) to generate a detailed task breakdown before spawning a team (expensive). The plan becomes the task list. Best ratio: spend 20% of time planning, 80% executing with the team.',
  },
  // Stage 3 - Three Patterns
  {
    title: 'Proven Playbooks',
    content: (
      <>
        <p>Not every task benefits from a team. These three patterns consistently work.</p>

        <div className="at-pattern-section" style={{ borderTopColor: '#5856D6' }}>
          <strong>Pattern 1 &mdash; Parallel Exploration</strong>
          <p><strong>When:</strong> You need to explore a problem from multiple angles before deciding. Works because exploration is fully independent.</p>
          <p><strong>Team:</strong> Researcher + Architect + Devil&rsquo;s Advocate. All explore simultaneously. Lead synthesises findings.</p>
          <p><strong>Best for:</strong> Technical decisions (build vs buy), architecture choices, library selection.</p>
        </div>

        <div className="at-pattern-section" style={{ borderTopColor: '#0071E3' }}>
          <strong>Pattern 2 &mdash; Layer Split</strong>
          <p><strong>When:</strong> A feature touches multiple independent layers of the stack. Works because layers have clear file boundaries.</p>
          <p><strong>Team:</strong> Frontend + Backend + Tests. Key rule: define file ownership explicitly. Peer messaging handles API contract changes.</p>
          <p><strong>Best for:</strong> New features, large refactors, stack-wide changes.</p>
        </div>

        <div className="at-pattern-section" style={{ borderTopColor: '#34C759' }}>
          <strong>Pattern 3 &mdash; QA Swarm</strong>
          <p><strong>When:</strong> Code is done, you want thorough review. Works because review is read-only &mdash; no file conflicts.</p>
          <p><strong>Team:</strong> Correctness + Edge Cases + Security + Performance. All review simultaneously. Lead synthesises into single review.</p>
          <p><strong>Best for:</strong> Pre-PR review, security audit, performance review.</p>
        </div>
      </>
    ),
    tip: 'The QA Swarm pattern is the safest starting point if you are new to agent teams. Read-only review means no merge conflicts, no broken builds, nothing to clean up. The output is pure insight. Start here, get comfortable, then graduate to Layer Split for implementation.',
  },
  // Stage 4 - Rough Edges
  {
    title: 'The Honest Truth',
    content: (
      <>
        <p>Agent Teams are experimental. The rough edges are real. Knowing them makes you a better operator.</p>

        <p className="at-section-heading">When teams beat solo</p>
        <ul className="at-list">
          <li>Tasks with clear independent streams</li>
          <li>Work spanning multiple stack layers</li>
          <li>Multi-perspective review or exploration</li>
          <li>Large features where context pressure hurts single-session work</li>
          <li>3+ independent pieces that all need to finish before synthesis</li>
        </ul>

        <p className="at-section-heading">When solo beats teams</p>
        <ul className="at-list">
          <li>Sequential tasks (B needs A&rsquo;s output first)</li>
          <li>Simple tasks one session handles fine</li>
          <li>Tight budget (teams consume more tokens)</li>
          <li>Heavy coordination between streams</li>
          <li>Debugging (one focused agent usually better)</li>
        </ul>

        <p className="at-section-heading">The cost reality</p>
        <p>Three teammates = roughly 3&times; the tokens. The time saving is real (parallel execution). The cost saving is not (more total tokens). Use teams for tasks where time matters more than cost, or where the quality gain from parallel specialist focus justifies it.</p>

        <p className="at-section-heading">The future</p>
        <p>Agent Teams is marked experimental. The limitations are known and being worked on. The underlying architecture &mdash; shared task lists, mailboxes, peer messaging &mdash; is already solid. The developers who get comfortable with team orchestration now will have a serious edge as this matures.</p>
      </>
    ),
    warning: 'Always clean up teams when finished. Run: "Clean up the team and close all teammates." Leftover team configurations can cause the lead to try messaging teammates that no longer exist in future sessions.',
  },
]

const VISUALIZATIONS = [
  SoloVsTeamViz,
  ArchitectureViz,
  TeamBuilderViz,
  PatternsViz,
  RoughEdgesViz,
]

const NEXT_LABELS = [
  'The architecture \u2192',
  'Build your first team \u2192',
  'Patterns that work \u2192',
  'Rough edges \u2192',
  'Test my knowledge \u2192',
]

/* ─── Main Component ─── */
export default function AgentTeams({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('agent-teams', -1)
  const [maxStageReached, setMaxStageReached] = useState(() => Math.max(-1, stage))
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)

  /* learn tips */
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)

  const activeStepRef = useRef(null)

  function dismissLearnTip() {
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 300)
  }

  /* track max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  /* scroll on stage change */
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  /* milestone-based learn tips */
  useEffect(() => {
    if (stage === 2 && !dismissedTips.has('builder')) {
      setLearnTip({ key: 'builder', text: 'Try the Team Builder \u2014 select "Layer Split" then write a task in the textarea and watch the generated prompt update live. This is the exact prompt structure that works in real Claude Code.' })
    } else if (stage === 3 && !dismissedTips.has('qa-swarm')) {
      setLearnTip({ key: 'qa-swarm', text: 'Click the QA Swarm tab and watch the animation \u2014 four agents reviewing the same code simultaneously. This is the safest first team to try in real Claude Code because it is read-only.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  /* cleanup */
  useEffect(() => {
    return () => { if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current) }
  }, [])

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setLearnTip(null)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('agent-teams')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.at-root')
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

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    reset()
    setShowWelcome(true)
  }

  /* ─── Quiz Screen ─── */
  if (showQuiz) {
    return (
      <div className="how-llms at-root quiz-fade-in">
        <Quiz
          questions={agentTeamsQuiz}
          tabName="Agent Teams"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="agent-teams"
        />
      </div>
    )
  }

  /* ─── Entry Screen ─── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="agent-teams" size={48} style={{ color: '#5856D6' }} />}
        title="Agent Teams"
        subtitle="From Solo Agent to AI Organisation"
        description="One Claude Code session hits a ceiling. It can only do one thing at a time. Agent Teams removes that ceiling &mdash; multiple Claude instances coordinate in parallel, message each other directly, and tackle complexity that would defeat any single agent. This is the frontier of agentic AI right now."
        buttonText="Meet the Team"
        onStart={() => { setStage(0); markModuleStarted('agent-teams') }}
      />
    )
  }

  const StageViz = VISUALIZATIONS[stage] || VISUALIZATIONS[0]
  const content = STAGE_CONTENT[stage] || STAGE_CONTENT[0]
  const tools = STAGE_TOOLS[stage] || []

  return (
    <div className={`how-llms at-root ${fading ? 'how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Agent Teams</strong> &mdash; Agent Teams is experimental in Claude Code. This tutorial explains the real architecture &mdash; lead agents, teammate sessions, shared task lists, mailboxes &mdash; using a live animated visualiser you can interact with. Five focused stages. By the end you will know exactly when to use teams, how to set them up, and what to watch out for.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>5 stages</strong> from solo limitations to team orchestration</li>
              <li>Build a team with the <strong>interactive Team Builder</strong></li>
              <li>Learn <strong>3 proven patterns</strong> and when to use each one</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Learn tip */}
      {learnTip && !showFinal && (
        <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <TipIcon size={16} color="#eab308" />
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Stepper + stages */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper at-stepper">
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
                          <Tooltip text={s.tooltip} />
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
            {stage >= 0 && stage < STAGES.length && (
              <div className={`how-stage how-fade-in ${fading ? 'how-fading' : ''}`} key={stage}>
                {/* Info card */}
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{content.title}</strong>
                  </div>
                  <div className="at-info-content">{content.content}</div>

                  {content.tip && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {content.tip}
                    </div>
                  )}

                  {content.warning && (
                    <div className="how-info-tip" style={{ background: 'rgba(255, 149, 0, 0.06)', borderLeftColor: '#FF9500' }}>
                      <WarningIcon size={16} color="#FF9500" />
                      {content.warning}
                    </div>
                  )}

                  {tools.length > 0 && (
                    <ToolChips tools={tools} />
                  )}
                </div>

                {/* Visualization */}
                <StageViz active={true} />

                {/* Navigation */}
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>
                        &larr; Back
                      </button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage} style={{ background: '#5856D6' }}>
                      {NEXT_LABELS[stage]}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You Understand Agent Teams</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Agent Teams Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Concept</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
                </tr>
              </thead>
              <tbody>
                {TOOLKIT.map((item) => (
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
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="agent-teams" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
