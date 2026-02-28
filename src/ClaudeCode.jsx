import { useState, useEffect, useRef, useCallback } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import Tooltip from './Tooltip.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { claudeCodeQuiz } from './quizData.js'
import {
  CheckIcon, TipIcon, TerminalIcon,
  CodeIcon, SearchIcon, ShieldIcon, CpuIcon,
  BookIcon, ToolsIcon, LayersIcon, LinkIcon,
  KeyIcon, CrossIcon, RocketIcon,
  FileIcon, ZapIcon, GearIcon
} from './ContentIcons.jsx'
import './ClaudeCode.css'

/* ── constants ─────────────────────────────────────── */

const ACCENT = '#34C759'

const STAGES = [
  { key: 'what', label: 'What It Is' },
  { key: 'install', label: 'Installation' },
  { key: 'models', label: 'Models' },
  { key: 'claudemd', label: 'CLAUDE.md' },
  { key: 'skills', label: 'Skills' },
  { key: 'mcp', label: 'MCP' },
  { key: 'stack', label: 'Full Stack' },
  { key: 'workflows', label: 'Workflows' },
]

const STAGE_TOOLTIPS = {
  what: 'What Claude Code actually is',
  install: 'Installation and your first session',
  models: 'Choosing the right model',
  claudemd: 'CLAUDE.md — persistent memory',
  skills: 'Skills and slash commands',
  mcp: 'MCP — connecting to everything',
  stack: 'Subagents, hooks and the full stack',
  workflows: 'Real developer workflows',
}

const NEXT_LABELS = [
  'Installation →',
  'Models →',
  'CLAUDE.md →',
  'Skills →',
  'MCP →',
  'Full Stack →',
  'Workflows →',
  'Test my knowledge →',
]

const TOOLKIT = [
  { concept: 'Claude Code', when: 'Agentic coding in terminal', phrase: 'AI that edits, runs, and commits code for you', icon: <TerminalIcon size={24} color="#34C759" /> },
  { concept: 'Installation', when: 'Getting started', phrase: 'npm install -g @anthropic-ai/claude-code', icon: <RocketIcon size={24} color="#34C759" /> },
  { concept: 'Model Selection', when: 'Balancing speed and quality', phrase: 'Opus for hard tasks, Sonnet for fast ones', icon: <CpuIcon size={24} color="#34C759" /> },
  { concept: 'CLAUDE.md', when: 'Project context', phrase: 'Persistent instructions for every session', icon: <FileIcon size={24} color="#34C759" /> },
  { concept: 'Skills', when: 'Reusable workflows', phrase: 'Slash commands that auto-load context', icon: <ZapIcon size={24} color="#34C759" /> },
  { concept: 'MCP', when: 'Connecting to tools', phrase: 'Model Context Protocol for external services', icon: <LinkIcon size={24} color="#34C759" /> },
  { concept: 'Full Stack', when: 'Scaling with subagents and hooks', phrase: 'Parallel workers and deterministic guardrails', icon: <LayersIcon size={24} color="#34C759" /> },
  { concept: 'Workflows', when: 'Real developer patterns', phrase: 'Explore, plan, code, test, commit', icon: <GearIcon size={24} color="#34C759" /> },
]

const TOOLS_0 = [
  { name: 'Claude Code CLI', color: ACCENT, desc: 'Terminal-based agentic coding tool' },
  { name: 'VS Code', color: '#0071E3', desc: 'IDE integration for Claude Code' },
  { name: 'JetBrains', color: '#FF9500', desc: 'IntelliJ/WebStorm integration' },
  { name: 'GitHub', color: '#6e6e73', desc: 'Tag @claude on any PR' },
  { name: 'npm', color: '#FF3B30', desc: 'Package manager for installation' },
]

const TOOLS_1 = [
  { name: 'claude CLI', color: ACCENT, desc: 'The main Claude Code binary' },
]

const TOOLS_2 = []

const TOOLS_3 = []

const TOOLS_4 = []

const TOOLS_5 = [
  { name: 'GitHub MCP', color: '#6e6e73', desc: 'Read/write issues, PRs, and code' },
  { name: 'Playwright MCP', color: '#0071E3', desc: 'Browser automation and testing' },
  { name: 'Context7', color: '#FF9500', desc: 'Live library documentation' },
  { name: 'Sentry MCP', color: '#FF3B30', desc: 'View live production errors' },
  { name: 'Postgres MCP', color: '#5856D6', desc: 'Query databases via natural language' },
]

const TOOLS_6 = []

const TOOLS_7 = []

const ALL_TOOLS = [TOOLS_0, TOOLS_1, TOOLS_2, TOOLS_3, TOOLS_4, TOOLS_5, TOOLS_6, TOOLS_7]

/* ── terminal component ────────────────────────────── */

function Terminal({ lines, title = 'claude-code', typingSpeed = 30 }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [typingIdx, setTypingIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setVisibleLines([])
    setTypingIdx(0)
    setCharIdx(0)
    return clearTimers
  }, [lines])

  useEffect(() => {
    if (!lines || typingIdx >= lines.length) return

    const line = lines[typingIdx]
    const isCommand = line.type === 'command'
    const text = line.text || ''

    if (isCommand && charIdx < text.length) {
      const t = setTimeout(() => setCharIdx(c => c + 1), typingSpeed)
      timersRef.current.push(t)
      return () => clearTimeout(t)
    }

    const delay = isCommand ? 80 : 0
    const t = setTimeout(() => {
      setVisibleLines(prev => [...prev, { ...line, displayText: text }])
      setTypingIdx(i => i + 1)
      setCharIdx(0)
    }, delay)
    timersRef.current.push(t)
    return () => clearTimeout(t)
  }, [lines, typingIdx, charIdx, typingSpeed])

  const currentLine = lines && typingIdx < lines.length ? lines[typingIdx] : null
  const isTypingCommand = currentLine && currentLine.type === 'command'

  return (
    <div className="cc-terminal">
      <div className="cc-terminal-chrome">
        <span className="cc-terminal-dot cc-dot-red" />
        <span className="cc-terminal-dot cc-dot-amber" />
        <span className="cc-terminal-dot cc-dot-green" />
        <span className="cc-terminal-title">{title}</span>
      </div>
      <div className="cc-terminal-body">
        {visibleLines.map((line, i) => (
          <TerminalLine key={i} line={line} />
        ))}
        {isTypingCommand && (
          <div className="cc-terminal-line">
            <span className="cc-kw-command">$ </span>
            <span className="cc-kw-command">{currentLine.text.slice(0, charIdx)}</span>
            <span className="cc-cursor">|</span>
          </div>
        )}
      </div>
    </div>
  )
}

function TerminalLine({ line }) {
  if (line.type === 'command') {
    return (
      <div className="cc-terminal-line">
        <span className="cc-kw-command">$ {line.displayText}</span>
      </div>
    )
  }
  if (line.type === 'success') {
    return <div className="cc-terminal-line cc-kw-success">{line.displayText}</div>
  }
  if (line.type === 'error') {
    return <div className="cc-terminal-line cc-kw-error">{line.displayText}</div>
  }
  if (line.type === 'bullet') {
    return <div className="cc-terminal-line"><span className="cc-kw-bullet">{'●'} </span>{line.displayText}</div>
  }
  if (line.type === 'slash') {
    return <div className="cc-terminal-line cc-kw-slash">{line.displayText}</div>
  }
  if (line.type === 'amber') {
    return <div className="cc-terminal-line cc-kw-amber">{line.displayText}</div>
  }
  if (line.type === 'string') {
    return <div className="cc-terminal-line cc-kw-string">{line.displayText}</div>
  }
  if (line.type === 'blank') {
    return <div className="cc-terminal-line">&nbsp;</div>
  }
  return <div className="cc-terminal-line">{line.displayText}</div>
}

/* ── terminal content per stage ────────────────────── */

const TERMINAL_LINES = {
  0: [
    { type: 'command', text: 'claude "explain what this function does"' },
    { type: 'blank' },
    { type: 'bullet', text: 'Reading src/auth/middleware.js...' },
    { type: 'bullet', text: 'Reading src/models/User.js...' },
    { type: 'blank' },
    { type: 'output', text: 'This middleware validates JWT tokens on' },
    { type: 'output', text: 'protected routes. It:' },
    { type: 'output', text: '1. Extracts Bearer token from headers' },
    { type: 'output', text: '2. Verifies signature using JWT_SECRET' },
    { type: 'output', text: '3. Attaches decoded user to req.user' },
    { type: 'output', text: '4. Returns 401 if token is invalid' },
    { type: 'blank' },
    { type: 'output', text: 'The User model import on line 3 is unused' },
    { type: 'output', text: 'and could be removed.' },
  ],
  1: [
    { type: 'command', text: 'curl -fsSL https://claude.ai/install/code | sh' },
    { type: 'output', text: 'Downloading Claude Code...' },
    { type: 'output', text: 'Installing to /usr/local/bin/claude...' },
    { type: 'success', text: '✓ Claude Code installed (v2.1.37)' },
    { type: 'blank' },
    { type: 'command', text: 'cd my-awesome-project && claude' },
    { type: 'success', text: '✓ Authenticated as user@example.com' },
    { type: 'success', text: '✓ Using claude-sonnet-4-6' },
    { type: 'blank' },
    { type: 'output', text: 'Type a message or /help for commands.' },
    { type: 'slash', text: '> /init' },
    { type: 'bullet', text: 'Analyzing project structure...' },
    { type: 'bullet', text: 'Reading package.json...' },
    { type: 'success', text: '✓ Created CLAUDE.md' },
    { type: 'blank' },
    { type: 'slash', text: '> /doctor' },
    { type: 'output', text: 'Running diagnostics...' },
    { type: 'success', text: '✓ Installation: OK (v2.1.37)' },
    { type: 'success', text: '✓ Authentication: OK' },
    { type: 'success', text: '✓ Model access: OK (Sonnet 4.6)' },
    { type: 'success', text: '✓ Git: OK (main branch)' },
    { type: 'success', text: '✓ All checks passed.' },
  ],
  2: [
    { type: 'slash', text: '> /model' },
    { type: 'output', text: 'Select a model:' },
    { type: 'amber', text: '  1. claude-haiku-4-5   (fast, $)' },
    { type: 'string', text: '  2. claude-sonnet-4-6  (default, $$)' },
    { type: 'slash', text: '  3. claude-opus-4-6    (flagship, $$$)' },
    { type: 'blank' },
    { type: 'command', text: 'claude "explain the auth middleware"' },
    { type: 'output', text: '(Sonnet 4.6 — 2.1s)' },
    { type: 'output', text: 'This middleware validates JWT tokens...' },
    { type: 'output', text: '[complete implementation analysis]' },
  ],
  3: [
    { type: 'slash', text: '> /init' },
    { type: 'bullet', text: 'Analyzing project structure...' },
    { type: 'bullet', text: 'Detecting build system...' },
    { type: 'success', text: '✓ Created CLAUDE.md' },
    { type: 'blank' },
    { type: 'amber', text: '## Commands' },
    { type: 'output', text: '- Build: npm run build' },
    { type: 'output', text: '- Test: npm test' },
    { type: 'output', text: '- Dev: npm run dev (port 3000)' },
    { type: 'blank' },
    { type: 'amber', text: '## Do NOT' },
    { type: 'output', text: '- Do not use class components' },
    { type: 'output', text: '- Do not modify dist/' },
    { type: 'blank' },
    { type: 'command', text: '# always use 2-space indentation' },
    { type: 'success', text: '✓ Added to CLAUDE.md' },
  ],
  4: [
    { type: 'slash', text: '> /skills' },
    { type: 'output', text: 'Available skills:' },
    { type: 'string', text: '  code-review    (auto-load)' },
    { type: 'string', text: '  test-generator (manual)' },
    { type: 'string', text: '  doc-writer     (auto-load)' },
    { type: 'blank' },
    { type: 'command', text: 'claude "review the auth module"' },
    { type: 'bullet', text: 'Loading skill: code-review...' },
    { type: 'bullet', text: 'Reading src/auth/...' },
    { type: 'blank' },
    { type: 'amber', text: '## Security [WARN]' },
    { type: 'output', text: 'JWT secret read without validation.' },
    { type: 'amber', text: '## Performance [PASS]' },
    { type: 'amber', text: '## Style [PASS]' },
    { type: 'amber', text: '## Test Coverage [FAIL]' },
    { type: 'output', text: 'refreshToken: 0% coverage.' },
  ],
  5: [
    { type: 'command', text: 'claude mcp add playwright npx @playwright/mcp@latest' },
    { type: 'success', text: '✓ Added MCP server: playwright' },
    { type: 'output', text: '  Tools discovered: 12' },
    { type: 'blank' },
    { type: 'command', text: 'claude "check if login button is visible on localhost:3000"' },
    { type: 'bullet', text: 'Using mcp__playwright__navigate...' },
    { type: 'bullet', text: 'Navigating to localhost:3000...' },
    { type: 'bullet', text: 'Using mcp__playwright__get_page_content...' },
    { type: 'blank' },
    { type: 'success', text: '✓ Login button found: "Sign In"' },
    { type: 'output', text: '  Located at: #login-btn' },
    { type: 'output', text: '  Visible: true' },
  ],
  6: [
    { type: 'command', text: 'claude "implement user avatar upload"' },
    { type: 'bullet', text: 'Reading CLAUDE.md... (conventions loaded)' },
    { type: 'bullet', text: 'Skill: file-upload auto-loaded' },
    { type: 'bullet', text: 'MCP: Postgres queried for User schema' },
    { type: 'bullet', text: 'Sub-agent: security-auditor spawned' },
    { type: 'blank' },
    { type: 'output', text: 'Editing 4 files:' },
    { type: 'string', text: '  src/routes/upload.js (new)' },
    { type: 'string', text: '  src/models/User.js (modified)' },
    { type: 'string', text: '  src/middleware/multer.js (new)' },
    { type: 'string', text: '  tests/upload.test.js (new)' },
    { type: 'blank' },
    { type: 'success', text: '✓ Hook: linter passed' },
    { type: 'success', text: '✓ Hook: 12 tests passing' },
    { type: 'output', text: 'Commit? (Y/n)' },
  ],
  7: [
    { type: 'command', text: 'claude "run tests and fix whatever fails"' },
    { type: 'bullet', text: 'Running npm test...' },
    { type: 'output', text: '47 passing, 2 failing' },
    { type: 'blank' },
    { type: 'error', text: 'FAIL src/auth/auth.test.js' },
    { type: 'error', text: '  ✗ should refresh expired tokens' },
    { type: 'error', text: '  ✗ should handle concurrent refresh' },
    { type: 'blank' },
    { type: 'bullet', text: 'Reading src/auth/refresh.js...' },
    { type: 'output', text: 'Found: race condition in token refresh' },
    { type: 'bullet', text: 'Fixing with mutex lock pattern...' },
    { type: 'bullet', text: 'Running npm test...' },
    { type: 'success', text: '✓ 49 tests passing, 0 failing' },
    { type: 'blank' },
    { type: 'output', text: 'Fixed: Added mutex to prevent concurrent' },
    { type: 'output', text: 'refresh requests creating duplicate tokens.' },
    { type: 'output', text: 'Commit? (Y/n)' },
  ],
}

/* ── stage 0: what claude code is ──────────────────── */

function WhatIsViz({ active }) {
  const [showCards, setShowCards] = useState(false)
  const timersRef = useRef([])

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (!active) { setShowCards(false); return }
    timersRef.current.push(setTimeout(() => setShowCards(true), 600))
    return () => timersRef.current.forEach(clearTimeout)
  }, [active])

  const capabilities = [
    { icon: <SearchIcon size={16} color={ACCENT} />, label: 'Reads codebase' },
    { icon: <CodeIcon size={16} color={ACCENT} />, label: 'Edits files' },
    { icon: <TerminalIcon size={16} color={ACCENT} />, label: 'Runs commands' },
    { icon: <LinkIcon size={16} color={ACCENT} />, label: 'Git workflows' },
    { icon: <BookIcon size={16} color={ACCENT} />, label: 'Remembers conventions' },
    { icon: <ToolsIcon size={16} color={ACCENT} />, label: 'Connects to tools' },
  ]

  return (
    <div className="cc-viz cc-whatis-viz">
      <div className="cc-paradigm-row">
        <div className="cc-paradigm-card cc-paradigm-old">
          <div className="cc-paradigm-header">Old Way: Copy-Paste</div>
          <div className="cc-paradigm-flow">
            <div className="cc-flow-step">Your Editor</div>
            <div className="cc-flow-arrow">&darr; copy code</div>
            <div className="cc-flow-step">Chat Window</div>
            <div className="cc-flow-arrow">&darr; paste answer</div>
            <div className="cc-flow-step">Your Editor</div>
            <div className="cc-flow-arrow">&darr; repeat...</div>
          </div>
          <div className="cc-paradigm-badge cc-badge-old">~200 context switches/day</div>
        </div>
        <div className="cc-paradigm-card cc-paradigm-new">
          <div className="cc-paradigm-header">Claude Code: Agentic</div>
          <div className="cc-paradigm-flow">
            <div className="cc-flow-step">Your Terminal</div>
            <div className="cc-flow-arrow">&darr; describe task</div>
            <div className="cc-flow-step cc-flow-step-agent">
              reads files &bull; edits code &bull; runs tests &bull; commits
            </div>
            <div className="cc-flow-arrow">&darr; done</div>
          </div>
          <div className="cc-paradigm-badge cc-badge-new">You steer. Claude acts.</div>
        </div>
      </div>

      <div className={`cc-capabilities-grid ${showCards ? 'cc-fade-in' : ''}`}>
        {capabilities.map((cap, i) => (
          <div key={i} className="cc-capability-card">
            {cap.icon}
            <span>{cap.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── stage 1: installation ─────────────────────────── */

function InstallViz({ active }) {
  const [platform, setPlatform] = useState('macos')
  const [tryInput, setTryInput] = useState('')
  const [tryOutput, setTryOutput] = useState(null)

  const essentialCmds = [
    { cmd: '/init', what: 'Generate CLAUDE.md from project', when: 'Once per project' },
    { cmd: '/doctor', what: 'Run 8 health checks', when: 'When things break' },
    { cmd: '/help', what: 'Show all commands', when: 'Discovering features' },
    { cmd: '/clear', what: 'Reset conversation', when: 'Context too long' },
    { cmd: '/compact', what: 'Summarise context', when: 'Saving tokens' },
    { cmd: '/model', what: 'Switch AI model', when: 'Need different tier' },
    { cmd: '/memory', what: 'Edit CLAUDE.md', when: 'Updating conventions' },
    { cmd: '/cost', what: 'Show token usage', when: 'Tracking spend' },
  ]

  function handleTryCommand() {
    const cmd = tryInput.trim().toLowerCase()
    if (cmd === '/help') {
      setTryOutput('Available commands: /init, /doctor, /help, /clear, /compact, /model, /memory, /cost, /config, /permissions, /skills, /context, /resume, /add-dir')
    } else if (cmd === '/doctor') {
      setTryOutput('✓ Installation: OK\n✓ Authentication: OK\n✓ Model access: OK (Sonnet 4.6)\n✓ Git: OK\n✓ All checks passed.')
    } else if (cmd === '/init') {
      setTryOutput('● Analyzing project structure...\n● Reading package.json...\n✓ Created CLAUDE.md')
    } else if (cmd.startsWith('/')) {
      setTryOutput(`Command: ${cmd}\nExecuted successfully.`)
    } else {
      setTryOutput('Type a slash command like /help, /doctor, or /init')
    }
  }

  return (
    <div className="cc-viz cc-install-viz">
      <div className="cc-platform-tabs">
        <button className={`cc-platform-tab ${platform === 'macos' ? 'cc-platform-active' : ''}`} onClick={() => setPlatform('macos')}>macOS / Linux</button>
        <button className={`cc-platform-tab ${platform === 'windows' ? 'cc-platform-active' : ''}`} onClick={() => setPlatform('windows')}>Windows</button>
      </div>

      <div className="cc-install-command">
        {platform === 'macos' ? (
          <code>curl -fsSL https://claude.ai/install/code | sh</code>
        ) : (
          <code>Download installer from claude.ai/code</code>
        )}
      </div>

      <div className="cc-essential-table">
        <div className="cc-table-header">
          <span>Command</span><span>What it does</span><span>When to use</span>
        </div>
        {essentialCmds.map((row, i) => (
          <div key={i} className="cc-table-row">
            <span className="cc-cmd-label">{row.cmd}</span>
            <span>{row.what}</span>
            <span className="cc-when-label">{row.when}</span>
          </div>
        ))}
      </div>

      <div className="cc-try-section">
        <div className="cc-try-label">Try a slash command:</div>
        <div className="cc-try-input-row">
          <input
            className="cc-try-input"
            value={tryInput}
            onChange={e => setTryInput(e.target.value)}
            placeholder="/help"
            onKeyDown={e => e.key === 'Enter' && handleTryCommand()}
          />
          <button className="cc-try-btn" onClick={handleTryCommand}>Run</button>
        </div>
        {tryOutput && (
          <div className="cc-try-output">
            {tryOutput.split('\n').map((line, i) => <div key={i}>{line}</div>)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── stage 2: models ───────────────────────────────── */

function ModelsViz({ active }) {
  const [selected, setSelected] = useState('sonnet')

  const models = {
    haiku: {
      name: 'HAIKU 4.5', badge: null, color: '#F59E0B',
      speed: 5, cost: '$', pills: ['Quick', 'Explore', 'Search'],
      response: '(0.4s) Validates JWT tokens on protected routes. Returns 401 if invalid.',
    },
    sonnet: {
      name: 'SONNET 4.6', badge: 'DEFAULT', color: ACCENT,
      speed: 4, cost: '$$', pills: ['Features', 'Bugs', 'Tests'],
      response: '(2.1s) This middleware validates JWT tokens on protected routes. It extracts the Bearer token from headers, verifies the signature using JWT_SECRET, attaches the decoded user to req.user, and returns 401 if the token is invalid or expired.',
    },
    opus: {
      name: 'OPUS 4.6', badge: 'FLAGSHIP', color: '#5856D6',
      speed: 2, cost: '$$$', pills: ['Architecture', 'Hard bugs', 'Security'],
      response: '(6.8s) This middleware validates JWT tokens but has a subtle issue: the token expiry check uses Date.now() which can drift across server instances. Consider using a monotonic clock or adding a grace period. Also, the User model import on line 3 is unused. The error response leaks the specific failure reason which could aid attackers.',
    },
  }

  return (
    <div className="cc-viz cc-models-viz">
      <div className="cc-model-cards">
        {Object.entries(models).map(([key, m]) => (
          <div
            key={key}
            className={`cc-model-card ${selected === key ? 'cc-model-selected' : ''}`}
            style={{ borderTopColor: m.color }}
            onClick={() => setSelected(key)}
          >
            <div className="cc-model-header">
              <span className="cc-model-name" style={{ color: m.color }}>{m.name}</span>
              {m.badge && <span className="cc-model-badge" style={{ background: m.color }}>{m.badge}</span>}
            </div>
            <div className="cc-speed-row">
              <span className="cc-speed-label">Speed</span>
              <div className="cc-speed-meter">
                {[1,2,3,4,5].map(n => (
                  <span key={n} className={`cc-speed-bar ${n <= m.speed ? 'cc-speed-filled' : ''}`} style={n <= m.speed ? { background: m.color } : {}} />
                ))}
              </div>
            </div>
            <div className="cc-cost-row">
              <span className="cc-cost-label">Cost: {m.cost}</span>
            </div>
            <div className="cc-pill-row">
              {m.pills.map(p => <span key={p} className="cc-pill">{p}</span>)}
            </div>
          </div>
        ))}
      </div>

      <div className="cc-model-demo">
        <div className="cc-model-demo-label">Query: &ldquo;explain the auth middleware&rdquo;</div>
        <div className="cc-model-demo-response">
          <span className="cc-model-demo-tag" style={{ color: models[selected].color }}>{models[selected].name}</span>
          <p>{models[selected].response}</p>
        </div>
      </div>
    </div>
  )
}

/* ── stage 3: CLAUDE.md ────────────────────────────── */

function ClaudeMdViz({ active }) {
  const [activeSection, setActiveSection] = useState('commands')
  const [showAfter, setShowAfter] = useState(false)

  const sections = {
    commands: '## Commands\n- Build: npm run build\n- Test: npm test\n- Dev: npm run dev (port 3000)\n- Lint: npm run lint:fix',
    architecture: '## Architecture\n- Frontend: React 18 + TypeScript + Vite\n- Backend: Node.js + Express + PostgreSQL\n- Auth: JWT + refresh tokens\n- State: Zustand (not Redux)',
    standards: '## Coding Standards\n- Use named exports, not default exports\n- All components in PascalCase\n- All utils in camelCase\n- No any in TypeScript (use unknown)',
    donot: '## Do NOT\n- Do not use class components\n- Do not import from src/legacy/\n- Do not modify generated files in dist/\n- Do not commit .env files',
  }

  const sectionTabs = [
    { key: 'commands', label: 'Commands' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'standards', label: 'Standards' },
    { key: 'donot', label: 'Do NOT' },
  ]

  return (
    <div className="cc-viz cc-claudemd-viz">
      <div className="cc-md-section-tabs">
        {sectionTabs.map(t => (
          <button key={t.key} className={`cc-md-tab ${activeSection === t.key ? 'cc-md-tab-active' : ''}`} onClick={() => setActiveSection(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="cc-md-editor">
        <div className="cc-md-editor-header">CLAUDE.md</div>
        <pre className="cc-md-content">{sections[activeSection]}</pre>
      </div>

      <div className="cc-md-toggle-row">
        <button className={`cc-md-toggle ${!showAfter ? 'cc-md-toggle-active' : ''}`} onClick={() => setShowAfter(false)}>Without CLAUDE.md</button>
        <button className={`cc-md-toggle ${showAfter ? 'cc-md-toggle-active' : ''}`} onClick={() => setShowAfter(true)}>With CLAUDE.md</button>
      </div>

      <div className={`cc-md-comparison ${showAfter ? 'cc-md-after' : 'cc-md-before'}`}>
        {!showAfter ? (
          <div className="cc-md-result cc-md-result-bad">
            <div className="cc-md-result-header" style={{ borderTopColor: '#FF3B30' }}>Without CLAUDE.md</div>
            <div className="cc-md-result-line"><CrossIcon size={14} /> Using React class component...</div>
            <div className="cc-md-result-line"><CrossIcon size={14} /> Using default export...</div>
            <div className="cc-md-result-line"><CrossIcon size={14} /> Using Redux for state...</div>
            <div className="cc-md-result-verdict">Wrong on every convention</div>
          </div>
        ) : (
          <div className="cc-md-result cc-md-result-good">
            <div className="cc-md-result-header" style={{ borderTopColor: ACCENT }}>With CLAUDE.md</div>
            <div className="cc-md-result-line"><CheckIcon size={14} /> Using functional component (per standards)</div>
            <div className="cc-md-result-line"><CheckIcon size={14} /> Using named export (per standards)</div>
            <div className="cc-md-result-line"><CheckIcon size={14} /> Using Zustand (per architecture)</div>
            <div className="cc-md-result-verdict cc-verdict-good">Correct on every convention</div>
          </div>
        )}
      </div>

      <div className="cc-md-hierarchy">
        <div className="cc-hierarchy-box cc-hierarchy-global">
          <span className="cc-hierarchy-label">~/.claude/CLAUDE.md</span>
          <span className="cc-hierarchy-scope">Global (all projects)</span>
          <div className="cc-hierarchy-box cc-hierarchy-project">
            <span className="cc-hierarchy-label">./CLAUDE.md</span>
            <span className="cc-hierarchy-scope">Project</span>
            <div className="cc-hierarchy-box cc-hierarchy-local">
              <span className="cc-hierarchy-label">./.claude/CLAUDE.md</span>
              <span className="cc-hierarchy-scope">Local (subfolder)</span>
            </div>
          </div>
        </div>
        <div className="cc-hierarchy-note">Inner overrides outer for conflicting rules</div>
      </div>
    </div>
  )
}

/* ── stage 4: skills & slash commands ──────────────── */

function SkillsViz({ active }) {
  const [activeSkill, setActiveSkill] = useState('code-review')

  const skills = {
    'code-review': {
      name: 'code-review',
      invoke: 'auto',
      desc: 'Performs thorough code review checking security, performance, and style.',
      output: '## Security [WARN]\nJWT secret read without validation.\n\n## Performance [PASS]\nNo N+1 queries detected.\n\n## Style [PASS]\nFollows project conventions.\n\n## Test Coverage [FAIL]\nrefreshToken: 0% coverage.',
    },
    'test-generator': {
      name: 'test-generator',
      invoke: 'manual',
      desc: 'Generates comprehensive test suites for modules matching existing test patterns.',
      output: 'Generated 8 test cases for auth module:\n✓ should validate correct tokens\n✓ should reject expired tokens\n✓ should reject malformed tokens\n✓ should handle missing Authorization header\n✓ should refresh expired tokens\n✓ should handle concurrent refresh\n✓ should rate limit refresh attempts\n✓ should log failed auth attempts',
    },
    'doc-writer': {
      name: 'doc-writer',
      invoke: 'auto',
      desc: 'Generates API documentation from code, matching existing docs format.',
      output: '## POST /api/auth/login\nRequest: { email: string, password: string }\nResponse: { token: string, refreshToken: string }\nErrors: 401 Invalid credentials, 429 Rate limited\n\n## POST /api/auth/refresh\nRequest: { refreshToken: string }\nResponse: { token: string }',
    },
  }

  const sk = skills[activeSkill]

  return (
    <div className="cc-viz cc-skills-viz">
      <div className="cc-skill-tabs">
        {Object.keys(skills).map(key => (
          <button key={key} className={`cc-skill-tab ${activeSkill === key ? 'cc-skill-tab-active' : ''}`} onClick={() => setActiveSkill(key)}>
            {key}
          </button>
        ))}
      </div>

      <div className="cc-skill-detail">
        <div className="cc-skill-frontmatter">
          <div className="cc-skill-fm-row"><span className="cc-kw-amber">name:</span> {sk.name}</div>
          <div className="cc-skill-fm-row"><span className="cc-kw-amber">invoke:</span> {sk.invoke}</div>
          <div className="cc-skill-fm-row"><span className="cc-kw-amber">description:</span> {sk.desc}</div>
        </div>
      </div>

      <div className="cc-skill-output">
        <div className="cc-skill-output-header">Output when triggered:</div>
        <pre className="cc-skill-output-content">{sk.output}</pre>
      </div>

      <div className="cc-commands-reference">
        <div className="cc-commands-title">Built-in vs Custom</div>
        <div className="cc-commands-grid">
          <div className="cc-cmd-group">
            <div className="cc-cmd-group-label">Built-in</div>
            {['/help', '/model', '/memory', '/clear', '/compact', '/cost'].map(c => (
              <span key={c} className="cc-cmd-chip">{c}</span>
            ))}
          </div>
          <div className="cc-cmd-group">
            <div className="cc-cmd-group-label">Custom (your .claude/commands/)</div>
            {['/review', '/fix-issue', '/deploy'].map(c => (
              <span key={c} className="cc-cmd-chip cc-cmd-custom">{c}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── stage 5: MCP ──────────────────────────────────── */

function MCPViz({ active }) {
  const [expandedNode, setExpandedNode] = useState(null)

  const mcpServers = [
    { id: 'github', name: 'GitHub', install: 'claude mcp add github npx @modelcontextprotocol/server-github', tasks: ['Review PR #247 and leave comments', 'Create issue for the auth bug', 'Show open PRs from this week'] },
    { id: 'playwright', name: 'Playwright', install: 'claude mcp add playwright npx @playwright/mcp@latest', tasks: ['Navigate to localhost:3000 and verify login', 'Take a screenshot of the homepage', 'Run end-to-end test flow'] },
    { id: 'postgres', name: 'Postgres', install: 'claude mcp add postgres npx @modelcontextprotocol/server-postgres', tasks: ['How many users signed up last week?', 'Show the 10 slowest queries today', 'Check the User table schema'] },
    { id: 'sentry', name: 'Sentry', install: 'claude mcp add sentry npx @sentry/mcp-server', tasks: ['What errors occurred after deploy?', 'Show stack trace for issue #ABC', 'List unresolved errors this week'] },
    { id: 'context7', name: 'Context7', install: 'claude mcp add context7 npx @context7/mcp', tasks: ['Show React 19 useFormState API', 'Get latest Next.js 15 docs', 'Fetch Tailwind v4 migration guide'] },
    { id: 'web-search', name: 'Web Search', install: 'claude mcp add web-search npx @anthropic/web-search-mcp', tasks: ['What changed in Next.js 15 vs 14?', 'Latest security advisories for Express', 'Current Node.js LTS version'] },
  ]

  return (
    <div className="cc-viz cc-mcp-viz">
      <div className="cc-mcp-map">
        <div className="cc-mcp-center">
          <ModuleIcon module="claude-code" size={28} style={{ color: ACCENT }} />
          <span>Claude Code</span>
        </div>
        <div className="cc-mcp-nodes">
          {mcpServers.map(s => (
            <div
              key={s.id}
              className={`cc-mcp-node ${expandedNode === s.id ? 'cc-mcp-node-active' : ''}`}
              onClick={() => setExpandedNode(expandedNode === s.id ? null : s.id)}
            >
              <span className="cc-mcp-node-name">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {expandedNode && (() => {
        const s = mcpServers.find(x => x.id === expandedNode)
        return (
          <div className="cc-mcp-detail">
            <div className="cc-mcp-detail-title">MCP Server: {s.name}</div>
            <div className="cc-mcp-detail-install">
              <code>{s.install}</code>
            </div>
            <div className="cc-mcp-detail-tasks">
              <div className="cc-mcp-detail-label">What it unlocks:</div>
              {s.tasks.map((t, i) => (
                <div key={i} className="cc-mcp-task">&bull; &ldquo;{t}&rdquo;</div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

/* ── stage 6: full stack ───────────────────────────── */

function StackViz({ active }) {
  const [expandedLayer, setExpandedLayer] = useState(null)
  const [animDone, setAnimDone] = useState(false)
  const timersRef = useRef([])

  const layers = [
    { id: 'claudemd', label: 'CLAUDE.md', desc: 'What Claude always knows', icon: <BookIcon size={16} color={ACCENT} />, detail: 'Project-level memory file loaded into every conversation. Stores architecture decisions, coding conventions, and file paths so Claude never asks twice.' },
    { id: 'skills', label: 'Skills', desc: 'What loads automatically', icon: <RocketIcon size={16} color={ACCENT} />, detail: 'Reusable prompt templates in .claude/skills/ that activate automatically or via slash commands. Each skill is a Markdown file with frontmatter and $ARGUMENTS placeholders.' },
    { id: 'commands', label: 'Slash Commands', desc: 'Your shortcuts', icon: <TerminalIcon size={16} color={ACCENT} />, detail: 'Custom commands in .claude/commands/ that you invoke with /command-name. Great for repetitive tasks like /deploy, /lint-fix, or /review-pr.' },
    { id: 'mcp', label: 'MCP Servers', desc: 'External connections', icon: <LayersIcon size={16} color={ACCENT} />, detail: 'Model Context Protocol servers give Claude access to external tools: databases, APIs, GitHub, Jira, Slack. Configure in .claude/settings.json under mcpServers.' },
    { id: 'agents', label: 'Subagents', desc: 'Parallel specialists', icon: <CpuIcon size={16} color={ACCENT} />, detail: 'Claude can spawn child agents to handle subtasks in parallel. Each subagent gets its own context window and tool access, reporting results back to the parent.' },
    { id: 'hooks', label: 'Hooks', desc: 'Automatic guardrails', icon: <ShieldIcon size={16} color={ACCENT} />, detail: 'Shell commands that run automatically before or after tool calls. Use hooks to enforce linting, block dangerous operations, or log every file edit.' },
    { id: 'permissions', label: 'Permissions', desc: 'Hard boundaries', icon: <KeyIcon size={16} color={ACCENT} />, detail: 'Control what Claude can do: allow or deny file edits, shell commands, and MCP tool calls. Set per-project in settings.json or globally in ~/.claude/settings.json.' },
  ]

  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    if (!active) { setAnimDone(false); return }
    timersRef.current.push(setTimeout(() => setAnimDone(true), layers.length * 300 + 200))
    return () => timersRef.current.forEach(clearTimeout)
  }, [active])

  return (
    <div className="cc-viz cc-stack-viz">
      <div className="cc-stack-layers">
        {layers.map((layer, i) => (
          <div
            key={layer.id}
            className={`cc-stack-layer ${expandedLayer === layer.id ? 'cc-stack-layer-expanded' : ''} ${active ? 'cc-stack-layer-visible' : ''}`}
            style={{ transitionDelay: active ? `${i * 300}ms` : '0ms' }}
            onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
          >
            <div className="cc-stack-layer-main">
              {layer.icon}
              <span className="cc-stack-layer-label">{layer.label}</span>
              <span className="cc-stack-layer-desc">{layer.desc}</span>
              <svg className={`cc-stack-chevron ${expandedLayer === layer.id ? 'cc-stack-chevron-open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
            {expandedLayer === layer.id && (
              <div className="cc-stack-layer-detail">{layer.detail}</div>
            )}
          </div>
        ))}
      </div>

      {animDone && (
        <div className="cc-stack-summary">
          <div className="how-info-tip">
            <TipIcon size={16} color="#eab308" />
            Each layer adds capability. Each layer adds control. Together they create a genuinely powerful and genuinely safe development system.
          </div>
        </div>
      )}
    </div>
  )
}

/* ── stage 7: real workflows ───────────────────────── */

function WorkflowsViz({ active }) {
  const [expanded, setExpanded] = useState(null)

  const workflows = [
    { id: 1, name: 'Morning Kickoff', desc: 'Understand a new codebase in 60 seconds', prompt: 'Walk me through this repository. What are the main components?', time: '~60s' },
    { id: 2, name: 'Bug-First Debugging', desc: 'Run tests, let Claude see real errors', prompt: 'Run the test suite and fix whatever fails.', time: '~90s' },
    { id: 3, name: 'Feature Implementation', desc: 'Describe what you want, Claude builds it', prompt: 'Implement email verification. Follow patterns in src/auth/reset.js. Write tests.', time: '~5min' },
    { id: 4, name: 'Code Review Partner', desc: 'Pre-PR security and style check', prompt: 'Review all changed files for security issues and CLAUDE.md violations. Be harsh.', time: '~30s' },
    { id: 5, name: 'The Refactor', desc: 'Step-by-step, file-by-file changes', prompt: 'Migrate from callbacks to async/await in src/utils/. Keep tests passing.', time: '~10min' },
    { id: 6, name: 'Git Whisperer', desc: 'Smart commits, squash, merge conflicts', prompt: 'Squash last 3 commits. Message should explain WHY, not what.', time: '~15s' },
    { id: 7, name: 'Documentation Writer', desc: 'Generate docs from code', prompt: 'Generate API docs for all endpoints in src/routes/. Match docs/api.md format.', time: '~2min' },
    { id: 8, name: 'New Codebase', desc: 'Reverse-engineer conventions', prompt: 'Read the entire codebase and generate a CLAUDE.md documenting architecture and conventions.', time: '~3min' },
  ]

  return (
    <div className="cc-viz cc-workflows-viz">
      <div className="cc-workflow-grid">
        {workflows.map(w => (
          <div
            key={w.id}
            className={`cc-workflow-card ${expanded === w.id ? 'cc-workflow-expanded' : ''}`}
            onClick={() => setExpanded(expanded === w.id ? null : w.id)}
          >
            <div className="cc-workflow-top">
              <span className="cc-workflow-num">{w.id}</span>
              <span className="cc-workflow-name">{w.name}</span>
              <span className="cc-workflow-time">{w.time}</span>
            </div>
            <div className="cc-workflow-desc">{w.desc}</div>
            {expanded === w.id && (
              <div className="cc-workflow-prompt">
                <code>&gt; {w.prompt}</code>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="cc-prompting-tips">
        <div className="cc-prompting-title">Best prompting practices</div>
        <div className="cc-prompting-grid">
          <div className="cc-prompting-pair">
            <div className="cc-prompting-do"><CheckIcon size={14} /> Specific</div>
            <div className="cc-prompting-dont"><CrossIcon size={14} /> Vague</div>
          </div>
          <div className="cc-prompting-pair">
            <div className="cc-prompting-do"><CheckIcon size={14} /> Show (run tests)</div>
            <div className="cc-prompting-dont"><CrossIcon size={14} /> Tell (describe bug)</div>
          </div>
          <div className="cc-prompting-pair">
            <div className="cc-prompting-do"><CheckIcon size={14} /> Constrained</div>
            <div className="cc-prompting-dont"><CrossIcon size={14} /> Open-ended</div>
          </div>
          <div className="cc-prompting-pair">
            <div className="cc-prompting-do"><CheckIcon size={14} /> Sequential goals</div>
            <div className="cc-prompting-dont"><CrossIcon size={14} /> Everything at once</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── explanations ──────────────────────────────────── */

const EXPLANATIONS = [
  {
    title: 'Not a Chatbot. An Agent.',
    body: 'Most AI coding tools are copy-paste tools. You write code in your editor, paste it into a chat window, copy the answer back, and repeat 200 times per day. Claude Code is fundamentally different: it lives where your code lives. It runs in your terminal, reads your entire codebase, edits files directly, runs commands, remembers your conventions, and connects to your databases, APIs, and tools. You describe what you want. Claude Code does it — in your actual project.',
    tip: 'Claude Code is best understood as an agentic system, not a chat interface. It has a loop: receive task, plan, use tools (read/write/bash), observe result, continue until done. You are not asking a question — you are assigning a task.',
  },
  {
    title: 'From Zero to Running',
    body: 'Installing Claude Code takes two minutes. Download the native binary from claude.ai/code (npm install is deprecated as of early 2026 — use the native binary installer). First run opens browser for authentication. Navigate to your project directory and run claude. Use /init to generate a CLAUDE.md file, /doctor to run health checks, and /help to discover all available commands.',
    tip: 'Run /init in every project even if you plan to write CLAUDE.md manually later. The generated file catches build commands, test commands, and project structure automatically. Then edit it to add your conventions.',
  },
  {
    title: 'The Right Model for the Right Task',
    body: 'Claude Code gives you three model tiers. Haiku 4.5 is the scout — very fast, lowest cost, great for quick questions and code exploration. Sonnet 4.6 is the workhorse and default — handles almost everything from features to bugs to tests. Opus 4.6 is the architect — reserved for hard problems like complex debugging, architectural decisions, and security analysis. Switch models mid-session with Alt+P (Option+P on Mac).',
    tip: 'Do not default to Opus for everything. The speed difference alone makes Sonnet significantly more pleasant for iterative coding. Use Opus deliberately: when you have a specific hard problem that Sonnet cannot crack. The quality difference for routine tasks is minimal but the cost difference is 5×.',
  },
  {
    title: 'The Memory That Persists',
    body: 'Every time Claude Code starts a new session, it forgets everything from the last one. CLAUDE.md solves this. It is a Markdown file that Claude Code reads at the start of every session — persistent memory. Three levels: global (~/.claude/CLAUDE.md) for personal preferences, project (./CLAUDE.md) for this project, and local (./.claude/CLAUDE.md) for subfolders. Put build commands, architecture decisions, coding standards, and especially what NOT to do.',
    tip: 'The most valuable lines in CLAUDE.md are the DO NOT lines. Telling Claude Code what NOT to do is often more important than telling it what to do. Write these as soon as you see Claude Code do something wrong once.',
  },
  {
    title: 'Your Custom Toolkit',
    body: 'Slash commands are shortcuts — create a Markdown file in .claude/commands/ and the filename becomes the command. Skills are intelligent shortcuts that auto-load when their description matches the task. A skill lives in .claude/skills/ with a SKILL.md file containing frontmatter (name, description, invoke mode) and instructions. Claude Code reads all skill descriptions at startup and loads the matching skill automatically.',
    tip: 'The description field in skill frontmatter is crucial. Claude Code reads descriptions to decide which skills to auto-load. A vague description like "code helper" means the skill never loads automatically. Be specific.',
  },
  {
    title: 'Connect Claude to Everything',
    body: 'MCP — Model Context Protocol — is an open protocol (like USB-C for AI). With MCP, Claude Code can query databases, create Jira tickets, review GitHub PRs, check Sentry errors, browse web pages, and interact with any API. As of January 2026: 3,000+ MCP servers indexed, 100 million monthly downloads. Add a server with claude mcp add, and Claude discovers its tools automatically.',
    tip: 'Start with 2-3 MCP servers, not 15. Each server\'s tools consume context window space. Add GitHub MCP and Playwright first. Master those. Add more when you have a specific use case.',
  },
  {
    title: 'The Power of Combining It All',
    body: 'Subagents are specialized Claude instances that work in parallel on different tasks. Hooks are deterministic scripts that run automatically at lifecycle events (PreToolUse, PostToolUse, Stop) — not AI, always run. Permissions give granular control over what Claude Code can do. The complete stack: CLAUDE.md (knowledge), Skills (intelligence), Commands (shortcuts), MCP (connections), Subagents (parallelism), Hooks (guardrails), Permissions (boundaries).',
    tip: 'Hooks are underrated. One hook that prevents committing to main has saved entire teams from production incidents. One hook that runs the linter after every edit means you never see a lint error in a PR again. Start with two hooks: branch protection and auto-format.',
  },
  {
    title: 'How Developers Actually Use It',
    body: 'The most powerful workflows: morning kickoff (understand a new codebase in 60 seconds), bug-first debugging (run tests, let Claude see real errors instead of describing them), feature implementation (describe the task, reference patterns to follow), code review partner (pre-PR security check), and the refactor (step-by-step with approval at each file). The key insight: show, don\'t tell. Let Claude Code see actual errors instead of describing them.',
    tip: 'The most powerful habit: end every working session by asking Claude Code to update CLAUDE.md. Over weeks, your CLAUDE.md becomes the best documentation your project has ever had.',
  },
]

const VIZS = [WhatIsViz, InstallViz, ModelsViz, ClaudeMdViz, SkillsViz, MCPViz, StackViz, WorkflowsViz]

/* ── main component ────────────────────────────────── */

export default function ClaudeCode({ onSwitchTab }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('claude-code', -1)
  const [showEntry, setShowEntry] = useState(stage === -1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showQuiz, setShowQuiz] = useState(false)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [fading, setFading] = useState(false)
  const [maxStageReached, setMaxStageReached] = useState(stage)
  const activeStepRef = useRef(null)
  const [learnTipFading, setLearnTipFading] = useState(false)

  /* learn tips */
  const [learnTip, setLearnTip] = useState(null)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)

  /* track max stage */
  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  const dismissLearnTip = useCallback(() => {
    setLearnTipFading(true)
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(prev => {
        if (prev) setDismissedTips(s => new Set(s).add(prev))
        return null
      })
      setLearnTipFading(false)
    }, 300)
  }, [])

  /* learn tip triggers — single effect with else-clear so tips don't persist across stages */
  useEffect(() => {
    if (stage === 3 && !dismissedTips.has('claude-md')) {
      setLearnTip('claude-md')
    } else if (stage === 5 && !dismissedTips.has('mcp')) {
      setLearnTip('mcp')
    } else if (stage === 7 && !dismissedTips.has('workflows')) {
      setLearnTip('workflows')
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips])

  /* scroll to top on stage change */
  useEffect(() => {
    if (stage < 0) return
    if (activeStepRef.current) activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    window.scrollTo(0, 0)
  }, [stage])

  /* entry screen dismiss */
  function handleEntryDismiss() {
    setShowEntry(false)
    setStage(0)
    markModuleStarted('claude-code')
  }

  /* navigation */
  function handleNext() {
    if (stage < STAGES.length - 1) {
      setStage(s => s + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setFading(false)
        markModuleComplete('claude-code')
        window.scrollTo(0, 0)
      }, 250)
    }
  }

  function handleBack() {
    if (stage > 0) setStage(s => s - 1)
  }

  function goToStage(i) {
    if (i <= maxStageReached && i !== stage) setStage(i)
  }

  /* start over */
  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowEntry(true)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  /* ── render ────────────────────────────────────── */

  if (showEntry) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="claude-code" size={48} style={{ color: ACCENT }} />}
        title="Claude Code"
        subtitle="AI That Lives in Your Terminal"
        description={'Claude Code is not a chatbot you copy-paste from. It reads your entire codebase, edits files, runs commands, and remembers your conventions — all from a single terminal window. This tutorial shows you exactly how it works and how to make it genuinely powerful.'}
        buttonText="Open Terminal"
        onStart={handleEntryDismiss}
      />
    )
  }

  if (showQuiz) {
    return (
      <Quiz
        questions={claudeCodeQuiz}
        tabName="Claude Code"
        accentColor={ACCENT}
        onBack={() => setShowQuiz(false)}
        onStartOver={handleStartOver}
        onSwitchTab={onSwitchTab}
        currentModuleId="claude-code"
      />
    )
  }

  const CurrentViz = !showFinal && stage >= 0 && stage < VIZS.length ? VIZS[stage] : null
  const explanation = !showFinal && stage >= 0 && stage < EXPLANATIONS.length ? EXPLANATIONS[stage] : null

  return (
    <div className="how-llms cc-module">
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>
          &larr; Start over
        </button>
      )}

      {/* Welcome banner */}
      {showWelcome && stage === 0 && !showFinal && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Claude Code</strong> &mdash; This module covers Claude Code from installation to advanced workflows. You will learn the layered system underneath the terminal &mdash; models, memory, skills, and MCP &mdash; and see how real developers use it daily.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from basics to real workflows</li>
              <li>Interact with <strong>terminal simulators</strong> at each stage</li>
              <li>Learn the full stack: <strong>CLAUDE.md, skills, MCP, hooks</strong></li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper */}
      {!showFinal && (
        <div className="how-stepper-wrapper how-fade-in">
          <div className="how-stepper cc-stepper-accent">
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stage content */}
      {!showFinal && stage >= 0 && (
        <div className="how-content">
          <div className={`how-stage how-fade-in ${fading ? 'how-fading' : ''}`} key={stage}>
            <div className="how-info-card how-info-card-edu">
              <div className="how-info-card-header">
                <strong>Stage {stage + 1}: {explanation?.title}</strong>
              </div>
              {explanation && <p>{explanation.body}</p>}
              {explanation?.tip && (
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>{explanation.tip}</span>
                </div>
              )}
              <ToolChips tools={ALL_TOOLS[stage]} />
            </div>

            {/* Terminal */}
            <Terminal lines={TERMINAL_LINES[stage]} key={`term-${stage}`} />

            {/* Visualization */}
            {CurrentViz && <CurrentViz active={true} />}

            {/* Learn tip */}
            {learnTip && (
              <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
                <TipIcon size={16} color="#eab308" />
                <span>
                  {learnTip === 'claude-md' && 'Toggle the "Without" vs "With" CLAUDE.md comparison — this is the single most impactful thing you can do when setting up a new project'}
                  {learnTip === 'mcp' && 'Click the GitHub MCP node and read the three example tasks it enables — this is what makes Claude Code feel like a true development partner'}
                  {learnTip === 'workflows' && 'Try the Bug-First Debugging card — running tests directly instead of describing bugs is the biggest mindset shift for new Claude Code users'}
                </span>
                <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="how-nav-buttons">
              {stage > 0 && (
                <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
              )}
              <button className="how-gotit-btn" onClick={handleNext} style={{ background: ACCENT }}>
                {NEXT_LABELS[stage]}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final screen */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now know Claude Code!</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Claude Code Toolkit</div>
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
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>Test Your Knowledge &rarr;</button>
            <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
          </div>
          <SuggestedModules currentModuleId="claude-code" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
