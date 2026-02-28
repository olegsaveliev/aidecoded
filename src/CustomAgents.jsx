import { useState, useEffect, useRef, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, WrenchIcon, FileIcon, ShieldIcon, SearchIcon, GearIcon, LockIcon, BookIcon, UserIcon, CodeIcon, LayersIcon, EyeIcon, TerminalIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { customAgentsQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './CustomAgents.css'
import { scrollStageToTop } from './scrollUtils.js'

const STAGES = [
  { key: 'what-are-agents', label: 'What They Are', tooltip: 'What custom agents actually are' },
  { key: 'name-description', label: 'Name & Desc', tooltip: 'The agent file: name and description' },
  { key: 'frontmatter', label: 'Frontmatter', tooltip: 'Tools, model, color, and memory' },
  { key: 'three-agents', label: 'Three Agents', tooltip: 'Three agents you can use today' },
  { key: 'comparison', label: 'Where They Fit', tooltip: 'Agents vs subagents vs teams' },
]

const NEXT_LABELS = [
  'Name and description \u2192',
  'Tools, model, color, and memory \u2192',
  'Three real agents \u2192',
  'Agents vs subagents vs teams \u2192',
  'Test my knowledge \u2192',
]

const TOOLKIT = [
  { concept: 'Agent File', when: 'Starting any custom agent', phrase: '.md with frontmatter + instructions', icon: <FileIcon size={24} color="#5856D6" /> },
  { concept: 'Description', when: 'Controlling auto-routing', phrase: 'Trigger context + example situations', icon: <SearchIcon size={24} color="#5856D6" /> },
  { concept: 'Tools', when: 'Scoping capabilities', phrase: 'Principle of least privilege', icon: <WrenchIcon size={24} color="#5856D6" /> },
  { concept: 'Model', when: 'Cost vs capability trade-off', phrase: 'haiku / sonnet / opus', icon: <GearIcon size={24} color="#5856D6" /> },
  { concept: 'Memory', when: 'Cross-session learning', phrase: 'user / project / local', icon: <BookIcon size={24} color="#5856D6" /> },
  { concept: '/agents', when: 'Creating agents interactively', phrase: 'Claude generates the file', icon: <TerminalIcon size={24} color="#5856D6" /> },
  { concept: 'Scoped Bash', when: 'Restricting shell access', phrase: 'Bash(git diff *)', icon: <LockIcon size={24} color="#5856D6" /> },
  { concept: 'Auto-delegation', when: 'Hands-free routing', phrase: 'Description matches task context', icon: <LayersIcon size={24} color="#5856D6" /> },
]

/* ─── Tool chips per stage ─── */
const STAGE_TOOLS = [
  /* Stage 0: What They Are */
  [],
  /* Stage 1: Name & Description */
  [],
  /* Stage 2: Frontmatter Fields */
  [],
  /* Stage 3: Three Agents */
  [],
  /* Stage 4: Comparison */
  [],
]

/* ─── Example agents for Stage 4 ─── */
const EXAMPLE_AGENTS = [
  {
    tab: 'Security Auditor',
    path: '.claude/agents/security-auditor.md',
    frontmatter: {
      name: 'security-auditor',
      description: 'Security specialist for code review.\nUse when reviewing or implementing:\nauthentication, authorization, API\nendpoints, request handling, database\nqueries, file operations, environment\nvariables, or any code touching\ncredentials or user input. Also invoke\nproactively after adding new routes\nor modifying auth-related code.',
      tools: 'Read, Glob, Grep, Bash(git diff *)',
      model: 'opus',
      color: 'red',
      memory: 'project',
    },
    instructions: `You are a senior security engineer.
Your job is to find vulnerabilities before
they reach production.

## When invoked
1. Run \`git diff HEAD\` to see recent changes
2. Read any modified files in full
3. Focus on the OWASP Top 10:
   - Injection (SQL, command, LDAP)
   - Broken authentication
   - Sensitive data exposure
   - Missing access controls
   - Security misconfiguration
   - XSS and CSRF

## Output format
## Security Review

### Critical [issues that need fixing now]
- [issue]: [file:line] — [what it enables]
  Fix: [specific fix]

### Warnings [should fix before production]
### Info [best practice suggestions]
### Passed [what looks good]

Be specific. Cite exact file names and
line numbers. Explain what each issue
enables an attacker to do. Never say
"this looks fine" without explaining why.`,
    annotations: [
      'Bash(git diff *): scoped, not full Bash',
      'model: opus: complex reasoning needs it',
      'memory: project: builds codebase knowledge',
      'Explicit output format: consistent results',
      'OWASP reference: deep domain expertise',
    ],
  },
  {
    tab: 'Test Writer',
    path: '.claude/agents/test-writer.md',
    frontmatter: {
      name: 'test-writer',
      description: 'Test generation specialist. Use when\nwriting or expanding tests for any\nfunction, class, module, or API endpoint.\nAlso invoke when test coverage is low,\nwhen fixing a bug (write regression test\nfirst), or when asked to "add tests",\n"cover this", or "TDD". Reads CLAUDE.md\nto match project testing conventions.',
      tools: 'Read, Write, Edit, Glob, Grep,\n  Bash(npm test *, npx jest *, pytest *)',
      model: 'sonnet',
      color: 'orange',
      memory: null,
    },
    instructions: `You are a test engineering specialist.
You write tests that catch real bugs,
not tests that game coverage metrics.

## First steps
1. Read CLAUDE.md for testing conventions
2. Find existing test files to match style
3. Read the code under test fully
4. Identify: happy path, edge cases,
   error conditions, boundary values

## Test quality rules
- Each test has ONE assertion of intent
- Test names describe the scenario:
  'returns 401 when token is expired'
  not 'test auth'
- Mock only external dependencies
- Never mock the thing you are testing
- One arrange-act-assert per test

## After writing
Run the test suite: use the appropriate
test command from CLAUDE.md. If tests
fail, fix them before returning.
Report: X new tests, Y passing, Z failing.`,
    annotations: [
      'model: sonnet: writing tasks need balance',
      'No memory: tests are project-specific',
      'Reads CLAUDE.md first: respects conventions',
      'Bash scoped to test commands only',
      'Self-verifying: runs its own tests',
    ],
  },
  {
    tab: 'Doc Generator',
    path: '.claude/agents/doc-generator.md',
    frontmatter: {
      name: 'doc-generator',
      description: 'Documentation specialist. Use when\nwriting or updating: README files, API\ndocs, inline JSDoc/docstrings, architecture\ndocs, or any written documentation.\nAlso invoke when code changes affect\nexisting docs or when asked to "document\nthis", "add JSDoc", "update the README",\nor "explain this in the docs". Matches\nexisting doc style.',
      tools: 'Read, Write, Edit, Glob, Grep',
      model: 'sonnet',
      color: 'yellow',
      memory: 'user',
    },
    instructions: `You are a technical writer who also codes.
You write documentation that developers
actually read.

## Principles
- Lead with what it does, not how it works
- Show a working example before explaining
- Every parameter documented with type + purpose
- Document the 'why', not just the 'what'
- Match the voice and style of existing docs

## Process
1. Read all existing documentation first
2. Find the closest existing doc as a style guide
3. Read the code being documented
4. Write docs that make the code obvious
5. Verify all examples actually work

## Output
Return only the documentation.
No commentary. No 'Here is the doc:'.
Just the document itself, ready to commit.`,
    annotations: [
      'No Bash: docs need no execution',
      'memory: user: style preferences persist',
      'Read-only + Write: specific access',
      '"Return only the documentation": output format discipline',
      'Self-contained: works without knowing specific project',
    ],
  },
]

/* ─── Description tester messages ─── */
const TESTER_MESSAGES = [
  { text: 'Review the new login endpoint', matchTerms: ['authentication', 'auth', 'review', 'login', 'endpoint', 'API', 'security', 'credential'] },
  { text: 'Write tests for the auth service', matchTerms: ['test', 'auth', 'authentication', 'testing', 'coverage'] },
  { text: 'Explain what this function does', matchTerms: ['explain', 'documentation', 'doc'] },
  { text: 'Check if we\'re handling user input safely', matchTerms: ['security', 'user input', 'input', 'safe', 'credential', 'authentication', 'auth', 'vulnerability', 'XSS', 'injection'] },
  { text: 'Update the README', matchTerms: ['readme', 'documentation', 'doc', 'update'] },
]

/* ─── Frontmatter builder tool options ─── */
const AVAILABLE_TOOLS = ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Task']

const TOOL_PRESETS = {
  'Read-only': ['Read', 'Glob', 'Grep'],
  'Full access': ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
  'Researcher': ['Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch'],
  'Doc writer': ['Read', 'Write', 'Glob', 'Grep'],
}

const MODEL_OPTIONS = [
  { id: 'haiku', label: 'Haiku', cost: '$', speed: 5 },
  { id: 'sonnet', label: 'Sonnet', cost: '$$', speed: 4 },
  { id: 'opus', label: 'Opus', cost: '$$$', speed: 2 },
]

const COLOR_OPTIONS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']
const COLOR_HEX = { red: '#FF3B30', blue: '#0071E3', green: '#34C759', yellow: '#FDE047', purple: '#5856D6', orange: '#FF9500', pink: '#FF6B9D', cyan: '#32D7E0' }

const MEMORY_OPTIONS = [
  { id: null, label: 'None' },
  { id: 'user', label: 'user' },
  { id: 'project', label: 'project' },
]

/* ─── Comparison table data ─── */
const COMPARISON_ROWS = [
  {
    label: 'What it is',
    subagents: 'Built-in specialists Anthropic provides: Explore (read-only codebase search), Plan (research before planning), general-purpose (everything else).',
    custom: 'Specialist AI assistants YOU define in Markdown files. Your own conventions, tools, system prompts, and model choices.',
    teams: 'Multiple FULL Claude Code sessions coordinating in parallel via shared task list and direct messaging. Experimental feature.',
  },
  {
    label: 'The analogy',
    subagents: 'Claude\'s own internal reflexes. They just happen automatically.',
    custom: 'Hiring specialist contractors. Each has a defined scope and expertise. You built them. They work for you.',
    teams: 'Running an engineering org. Multiple employees working simultaneously and talking to each other.',
  },
  {
    label: 'Communication',
    subagents: 'Reports only to the main agent. No peer messaging.',
    custom: 'Reports only to the delegating agent. No peer messaging.',
    teams: 'Teammates message each other directly without going through the lead.',
  },
  {
    label: 'How created',
    subagents: 'By Anthropic. Automatic. You do not create these.',
    custom: 'By you. One .md file in .claude/agents/ or ~/.claude/agents/',
    teams: 'By describing a task to the lead. Claude creates the team structure.',
  },
  {
    label: 'When auto-invoked',
    subagents: 'When Claude internally decides it needs to search or plan. You do not trigger these.',
    custom: 'When user task matches agent description. Claude routes automatically. You wrote the routing logic (description).',
    teams: 'You explicitly request a team. Or Claude suggests it for complex tasks. You confirm before it proceeds.',
  },
  {
    label: 'Context window',
    subagents: 'Sub-window of main session.',
    custom: 'Own full independent context window. Clean slate per agent invocation.',
    teams: 'Each teammate: its own full context window. Completely independent.',
  },
  {
    label: 'Stability',
    subagents: 'Stable. Production ready.',
    custom: 'Stable. Production ready.',
    teams: 'Experimental. Known limitations around task lag, session resumption, and slow shutdown.',
  },
  {
    label: 'Best for',
    subagents: 'File search, code exploration, planning research. Background work Claude does while it plans.',
    custom: 'Defined repeatable tasks with domain expertise. Security reviews, test writing, documentation, migrations.',
    teams: 'Complex tasks spanning multiple independent workstreams simultaneously. Parallel exploration. QA swarms.',
  },
]

/* ─── Agent Card Component ─── */
function AgentCard({ frontmatter, instructions, skeleton, annotations, showCopy, filePath }) {
  const [copied, setCopied] = useState(false)
  const copyTimerRef = useRef(null)

  useEffect(() => {
    return () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current) }
  }, [])

  function buildFileContent() {
    let content = '---\n'
    if (frontmatter.name) content += `name: ${frontmatter.name}\n`
    if (frontmatter.description) {
      if (frontmatter.description.includes('\n')) {
        content += `description: |\n  ${frontmatter.description.split('\n').join('\n  ')}\n`
      } else {
        content += `description: ${frontmatter.description}\n`
      }
    }
    if (frontmatter.tools) content += `tools: ${frontmatter.tools}\n`
    if (frontmatter.model) content += `model: ${frontmatter.model}\n`
    if (frontmatter.color) content += `color: ${frontmatter.color}\n`
    if (frontmatter.memory) content += `memory: ${frontmatter.memory}\n`
    content += '---\n\n'
    if (instructions) content += instructions
    return content
  }

  function handleCopy() {
    navigator.clipboard.writeText(buildFileContent())
    setCopied(true)
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  const modelClass = frontmatter.model === 'opus' ? 'ca-model-opus' : frontmatter.model === 'sonnet' ? 'ca-model-sonnet' : frontmatter.model === 'haiku' ? 'ca-model-haiku' : ''

  return (
    <div className="ca-agent-card">
      {filePath && <div className="ca-file-path">{filePath}</div>}
      {showCopy && (
        <button className={`ca-copy-btn ${copied ? 'ca-copy-btn-copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <>
              <CheckIcon size={12} color="#34C759" />
              Copied!
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      )}
      <div className="ca-frontmatter">
        <div className="ca-fm-divider">---</div>
        {skeleton ? (
          <>
            <div className="ca-fm-line"><span className="ca-fm-key">name:</span> <span className="ca-skeleton-val">[your-agent-name]</span></div>
            <div className="ca-fm-line"><span className="ca-fm-key">description:</span> <span className="ca-skeleton-val">[when Claude should use this]</span></div>
            <div className="ca-fm-line"><span className="ca-fm-key">tools:</span> <span className="ca-skeleton-val">[what it can do]</span></div>
            <div className="ca-fm-line"><span className="ca-fm-key">model:</span> <span className="ca-skeleton-val">[which model]</span></div>
          </>
        ) : (
          <>
            {frontmatter.name && (
              <div className="ca-fm-line"><span className="ca-fm-key">name:</span> <span className="ca-fm-val">{frontmatter.name}</span></div>
            )}
            {frontmatter.description && (
              frontmatter.description.includes('\n') ? (
                <div className="ca-fm-block">
                  <span className="ca-fm-key">description:</span> <span className="ca-fm-dash">|</span>
                  {frontmatter.description.split('\n').map((line, i) => (
                    <div key={i} className="ca-fm-indent"><span className="ca-fm-val">{line}</span></div>
                  ))}
                </div>
              ) : (
                <div className="ca-fm-line"><span className="ca-fm-key">description:</span> <span className="ca-fm-val">{frontmatter.description}</span></div>
              )
            )}
            {frontmatter.tools && (
              frontmatter.tools.includes('\n') ? (
                <div className="ca-fm-block">
                  <span className="ca-fm-key">tools:</span> <span className="ca-fm-val">{frontmatter.tools.split('\n')[0]}</span>
                  {frontmatter.tools.split('\n').slice(1).map((line, i) => (
                    <div key={i} className="ca-fm-indent"><span className="ca-fm-val">{line}</span></div>
                  ))}
                </div>
              ) : (
                <div className="ca-fm-line"><span className="ca-fm-key">tools:</span> <span className="ca-fm-val">{frontmatter.tools}</span></div>
              )
            )}
            {frontmatter.model && (
              <div className="ca-fm-line"><span className="ca-fm-key">model:</span> <span className={`ca-fm-val ${modelClass}`}>{frontmatter.model}</span></div>
            )}
            {frontmatter.color && (
              <div className="ca-fm-line">
                <span className="ca-fm-key">color:</span>{' '}
                <span className="ca-fm-val">{frontmatter.color}</span>
                <span className="ca-color-swatch" style={{ background: COLOR_HEX[frontmatter.color] || frontmatter.color }} />
              </div>
            )}
            {frontmatter.memory && (
              <div className="ca-fm-line"><span className="ca-fm-key">memory:</span> <span className="ca-fm-val">{frontmatter.memory}</span></div>
            )}
          </>
        )}
        <div className="ca-fm-divider">---</div>
      </div>
      <div className="ca-instructions">
        {skeleton ? (
          <div className="ca-skeleton-text">[Instructions go here]</div>
        ) : instructions ? (
          instructions.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
            if (line.startsWith('- ')) return <div key={i} className="ca-inst-bullet">{line}</div>
            if (line.match(/^\d+\. /)) return <div key={i} className="ca-inst-numbered">{line}</div>
            if (line.trim() === '') return <div key={i} className="ca-inst-spacer" />
            const rendered = line.replace(/`([^`]+)`/g, '<code>$1</code>')
            return <p key={i} dangerouslySetInnerHTML={{ __html: rendered }} />
          })
        ) : null}
      </div>
      {annotations && annotations.length > 0 && (
        <div className="ca-annotations-inline">
          {annotations.map((a, i) => (
            <div key={i} className="ca-annotation-inline">
              <span className="ca-annotation-arrow">&rarr;</span> {a}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Description Tester Component ─── */
function DescriptionTester({ onNameChange, onDescChange }) {
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  function checkMatch(message) {
    if (!desc || desc.length < 10) return false
    const descLower = desc.toLowerCase()
    return message.matchTerms.some(term => descLower.includes(term.toLowerCase()))
  }

  function handleNameChange(val) {
    setName(val)
    if (onNameChange) onNameChange(val)
  }

  function handleDescChange(val) {
    setDesc(val)
    if (onDescChange) onDescChange(val)
  }

  return (
    <div className="ca-desc-tester">
      <div className="ca-desc-tester-title">Description Tester</div>
      <div className="ca-desc-tester-inputs">
        <div className="ca-desc-input-group">
          <label className="ca-desc-label">Agent Name</label>
          <input
            type="text"
            className="ca-desc-name-input"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="security-auditor"
          />
        </div>
        <div className="ca-desc-input-group">
          <label className="ca-desc-label">Description</label>
          <textarea
            className="ca-desc-input"
            value={desc}
            onChange={e => handleDescChange(e.target.value)}
            placeholder="Security specialist for code review. Use when reviewing authentication, API endpoints, user input handling, or any code touching credentials."
            rows={4}
          />
        </div>
      </div>
      <div className="ca-desc-tester-messages">
        <div className="ca-desc-messages-title">Example user messages:</div>
        {TESTER_MESSAGES.map((msg, i) => {
          const matches = checkMatch(msg)
          return (
            <div key={i} className="ca-msg-row">
              <div className={matches ? 'ca-match-yes' : 'ca-match-no'}>
                {matches ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="16 9 10.5 15 8 12.5" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                )}
              </div>
              <span className="ca-msg-text">{msg.text}</span>
            </div>
          )
        })}
        <div className="ca-desc-tester-hint">
          Better descriptions = more reliable auto-routing. The agent activates on the right tasks automatically.
        </div>
      </div>
    </div>
  )
}

/* ─── Frontmatter Builder Component ─── */
function FrontmatterBuilder({ onChange }) {
  const [selectedTools, setSelectedTools] = useState(['Read', 'Glob', 'Grep'])
  const [selectedModel, setSelectedModel] = useState('sonnet')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedMemory, setSelectedMemory] = useState(null)

  const update = useCallback((tools, model, color, memory) => {
    if (onChange) onChange({ tools, model, color, memory })
  }, [onChange])

  useEffect(() => {
    update(selectedTools.join(', '), selectedModel, selectedColor, selectedMemory)
  }, [selectedTools, selectedModel, selectedColor, selectedMemory, update])

  function toggleTool(tool) {
    setSelectedTools(prev => prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool])
  }

  function applyPreset(presetName) {
    setSelectedTools([...TOOL_PRESETS[presetName]])
  }

  return (
    <div className="ca-fm-builder">
      {/* Tools */}
      <div className="ca-builder-section">
        <div className="ca-builder-section-title">Tools</div>
        <div className="ca-builder-presets">
          {Object.keys(TOOL_PRESETS).map(preset => (
            <button key={preset} className={`ca-preset-btn ${JSON.stringify(selectedTools) === JSON.stringify(TOOL_PRESETS[preset]) ? 'ca-preset-btn-active' : ''}`} onClick={() => applyPreset(preset)}>
              {preset}
            </button>
          ))}
        </div>
        <div className="ca-tool-checks">
          {AVAILABLE_TOOLS.map(tool => (
            <label key={tool} className={`ca-tool-check ${selectedTools.includes(tool) ? 'ca-tool-check-active' : ''}`}>
              <input type="checkbox" checked={selectedTools.includes(tool)} onChange={() => toggleTool(tool)} />
              {tool}
            </label>
          ))}
        </div>
      </div>

      {/* Model */}
      <div className="ca-builder-section">
        <div className="ca-builder-section-title">Model</div>
        <div className="ca-model-buttons">
          {MODEL_OPTIONS.map(m => (
            <button key={m.id} className={`ca-model-btn ca-model-btn-${m.id} ${selectedModel === m.id ? `ca-model-btn-${m.id}-active` : ''}`} onClick={() => setSelectedModel(m.id)}>
              <span className="ca-model-btn-name">{m.label}</span>
              <span className="ca-model-btn-meta">{m.cost} &middot; {'●'.repeat(m.speed)}{'○'.repeat(5 - m.speed)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="ca-builder-section">
        <div className="ca-builder-section-title">Color</div>
        <div className="ca-color-swatches">
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              className={`ca-color-swatch-btn ${selectedColor === c ? 'ca-color-swatch-btn-active' : ''}`}
              style={{ background: COLOR_HEX[c] }}
              onClick={() => setSelectedColor(c)}
              title={c}
              aria-label={`Select ${c} color`}
            />
          ))}
        </div>
      </div>

      {/* Memory */}
      <div className="ca-builder-section">
        <div className="ca-builder-section-title">Memory</div>
        <div className="ca-memory-buttons">
          {MEMORY_OPTIONS.map(m => (
            <button key={m.label} className={`ca-preset-btn ${selectedMemory === m.id ? 'ca-preset-btn-active' : ''}`} onClick={() => setSelectedMemory(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="ca-memory-desc">
          {selectedMemory === 'user' && 'Stores in ~/.claude/memory/ — available across all projects.'}
          {selectedMemory === 'project' && 'Stores in .claude/memory/ — only this project.'}
          {selectedMemory === null && 'No persistent memory — fresh context each invocation.'}
        </div>
      </div>
    </div>
  )
}

/* ─── Stage Content ─── */
const STAGE_CONTENT = [
  /* Stage 0: What Custom Agents Are */
  {
    title: 'Stage 1: Your Specialists on Demand',
    content: (
      <>
        <p>Claude Code has built-in agents. The Explore agent for reading codebases. The Plan agent for designing approaches. These are Anthropic&rsquo;s defaults.</p>
        <p>But every team and every project has specific needs that defaults do not cover. Your security conventions. Your test patterns. Your documentation style. Your review checklist.</p>
        <p><strong>Custom agents are how you encode that expertise once and use it everywhere.</strong></p>

        <div className="ca-section-block">
          <div className="ca-section-heading">What a Custom Agent Is</div>
          <p>A Markdown file with two parts:</p>
          <ol>
            <li><strong>YAML frontmatter</strong> &mdash; configuration</li>
            <li><strong>Instructions body</strong> &mdash; the system prompt</li>
          </ol>
          <p>That is literally it. One file. Drop it in the right folder. Claude Code discovers it automatically.</p>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">How It Works</div>
          <p>When you give Claude Code a task, it reads all available agent descriptions. If your task matches an agent&rsquo;s description, Claude delegates to that agent. The agent runs in its own context window. It does the work. Returns the result. Your main conversation stays clean.</p>
          <p>No manual invocation required. No remembering which agent to call. Claude routes automatically based on the description you wrote.</p>
          <p>You can also invoke directly: <em>&ldquo;Use the security-auditor agent to review the auth module.&rdquo;</em></p>
        </div>

        <div className="ca-two-scopes">
          <div className="ca-scope-card">
            <div className="ca-scope-label">Personal</div>
            <div className="ca-scope-path">~/.claude/agents/</div>
            <p>Available in ALL your projects. Your private toolkit. Never committed to any repo.</p>
          </div>
          <div className="ca-scope-card">
            <div className="ca-scope-label">Project</div>
            <div className="ca-scope-path">.claude/agents/</div>
            <p>Available in THIS project only. Shared with the whole team via git. The team&rsquo;s shared specialist roster.</p>
          </div>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">Creating an Agent</div>
          <p><strong>Method 1 &mdash; /agents command (recommended):</strong> Type /agents in Claude Code. Select: Create new agent. Choose scope (personal or project). Describe what it should do. Claude generates the file. You review and edit before saving.</p>
          <p><strong>Method 2 &mdash; Manual:</strong> Create the file yourself. Any text editor. Save to the right folder. File must end in .md</p>
        </div>
      </>
    ),
    tip: 'The description field is the most important line you will write. Claude reads descriptions to decide when to delegate. Too vague: "helps with code" — never auto-invokes. Too specific: only fires on exact matches. The sweet spot: describe the trigger context plus 2–3 example situations where you want this agent to activate. More on this in Stage 2.',
  },
  /* Stage 1: Name & Description */
  {
    title: 'Stage 2: The Two Lines That Matter Most',
    content: (
      <>
        <p>Every agent starts with two fields that determine everything about when and how it gets used.</p>

        <div className="ca-section-block">
          <div className="ca-section-heading">The Name Field</div>
          <p>Becomes the /slash-command. Must be lowercase, hyphens only. No spaces. No special characters.</p>
          <div className="ca-code-block">
            <code>name: security-auditor</code> &rarr; /security-auditor command available<br />
            <code>name: test-writer</code> &rarr; /test-writer command available<br />
            <code>name: doc-generator</code> &rarr; /doc-generator command available
          </div>
          <p>Choose names that are descriptive of the role, not the task. Short enough to type comfortably. Obvious to teammates reading the file.</p>
          <p><strong>Good:</strong> security-auditor, test-writer, api-doc-gen, db-migration-helper<br />
          <strong>Avoid:</strong> helper, assistant, agent1, my-thing</p>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">The Description Field</div>
          <p>The most important field. This is how Claude decides when to use your agent. Write it carefully.</p>
          <p>Description has two jobs: (1) Tell Claude WHEN to activate this agent. (2) Give Claude enough context to route the right tasks to it.</p>

          <div className="ca-comparison-stack">
            <div className="ca-comparison-row ca-comparison-row-bad">
              <div className="ca-comparison-label">Weak (agent rarely fires):</div>
              <code>Helps with security things.</code>
            </div>
            <div className="ca-comparison-row ca-comparison-row-mid">
              <div className="ca-comparison-label">Better (fires sometimes):</div>
              <code>Reviews code for security issues.</code>
            </div>
            <div className="ca-comparison-row ca-comparison-row-good">
              <div className="ca-comparison-label">Strong (fires reliably):</div>
              <code>Security specialist for code review. Use when: reviewing authentication, API endpoints, data handling, file operations, or any code that touches user input or credentials. Also use proactively after implementing new routes or data access layers.</code>
            </div>
          </div>

          <p>The strong version has three things: (1) What the agent specialises in. (2) Explicit trigger situations. (3) Proactive activation hints.</p>

          <div className="ca-section-block">
            <div className="ca-section-heading">Multi-line Descriptions</div>
            <p>YAML supports multi-line with <code>|</code>:</p>
            <div className="ca-code-block">
              <code>description: |</code><br />
              <code>{'  '}Security code review specialist.</code><br />
              <code>{'  '}Use when reviewing or implementing:</code><br />
              <code>{'  '}- Authentication and authorization</code><br />
              <code>{'  '}- API endpoints and request handling</code><br />
              <code>{'  '}- Database queries and data access</code><br />
              <code>{'  '}- File operations and uploads</code><br />
              <code>{'  '}- Environment variables and secrets</code><br />
              <code>{'  '}Proactively invoke after adding</code><br />
              <code>{'  '}new routes or modifying auth code.</code>
            </div>
            <p>This level of detail produces dramatically more reliable routing.</p>
          </div>
        </div>
      </>
    ),
    tip: 'Test your description by asking yourself: if I read only this description, would I know exactly which tasks go to this agent and which do not? If there is any ambiguity, add one more specific example. The extra 20 words in a description saves hours of manually invoking the agent because auto-routing missed it.',
  },
  /* Stage 2: Frontmatter Fields */
  {
    title: 'Stage 3: Configuring Your Agent',
    content: (
      <>
        <p>Four more frontmatter fields give you precise control over what your agent can do, how smart it is, and how it remembers things across sessions.</p>

        <div className="ca-section-block">
          <div className="ca-section-heading">Tools Field</div>
          <p>Controls what your agent can access. Principle of least privilege: give agents only what they need.</p>
          <div className="ca-tools-container">
            <div className="ca-tools-grid">
              <div className="ca-tool-item"><strong>Read</strong> &mdash; read files (always include this)</div>
              <div className="ca-tool-item"><strong>Write</strong> &mdash; create and overwrite files</div>
              <div className="ca-tool-item"><strong>Edit</strong> &mdash; make targeted edits to files</div>
              <div className="ca-tool-item"><strong>Bash</strong> &mdash; run shell commands</div>
              <div className="ca-tool-item"><strong>Glob</strong> &mdash; find files by pattern</div>
              <div className="ca-tool-item"><strong>Grep</strong> &mdash; search file contents</div>
              <div className="ca-tool-item"><strong>WebSearch</strong> &mdash; search the internet</div>
              <div className="ca-tool-item"><strong>WebFetch</strong> &mdash; fetch a specific URL</div>
              <div className="ca-tool-item"><strong>Task</strong> &mdash; spawn sub-subagents</div>
            </div>
          </div>
          <p><strong>Restricting Bash:</strong> Bash can be scoped to specific commands: <code>Bash(git *)</code> &mdash; only git commands. <code>Bash(npm run *)</code> &mdash; only npm scripts. This prevents an agent from running arbitrary system commands.</p>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">Model Field</div>
          <p>Sets which Claude model this agent uses. Each agent can use a different model. Match model to task complexity.</p>
          <div className="ca-model-comparison">
            <div className="ca-model-card">
              <div className="ca-model-name ca-model-haiku">haiku</div>
              <p>Fastest. Cheapest. 3&times; cost saving. Use for: simple, repetitive tasks. Quick searches. Format conversion.</p>
            </div>
            <div className="ca-model-card">
              <div className="ca-model-name ca-model-sonnet">sonnet</div>
              <p>Balanced. Good for almost everything. Use for: most agents by default. Code review. Writing. Analysis.</p>
            </div>
            <div className="ca-model-card">
              <div className="ca-model-name ca-model-opus">opus</div>
              <p>Slowest. Most capable. Use for: genuinely complex reasoning. Architecture decisions. Hard debugging. Security analysis.</p>
            </div>
          </div>
          <p><strong>Cost strategy:</strong> Use haiku for your high-frequency agents (ones that run on every file save or commit). Use opus only for agents you invoke deliberately on important decisions.</p>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">Color Field</div>
          <p>Visual identifier in the Claude Code TUI. Makes it immediately obvious which agent is running when you have several active.</p>
          <div className="ca-color-container">
            <div className="ca-color-list">
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#FF3B30' }} /> red &mdash; security</span>
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#0071E3' }} /> blue &mdash; research</span>
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#34C759' }} /> green &mdash; implementation</span>
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#FDE047' }} /> yellow &mdash; documentation</span>
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#5856D6' }} /> purple &mdash; architecture</span>
              <span className="ca-color-item"><span className="ca-color-dot" style={{ background: '#FF9500' }} /> orange &mdash; tests</span>
            </div>
          </div>
          <p>Convention only &mdash; Claude Code does not enforce color meanings. But consistent color usage across a team means everyone instantly knows what is running.</p>
        </div>

        <div className="ca-section-block">
          <div className="ca-section-heading">Memory Field</div>
          <p>Gives your agent persistent memory across sessions.</p>
          <div className="ca-memory-cards">
            <div className="ca-memory-card">
              <strong>memory: user</strong>
              <p>Stores in ~/.claude/memory/ &mdash; available across all projects. Best for patterns, preferences, style.</p>
            </div>
            <div className="ca-memory-card">
              <strong>memory: project</strong>
              <p>Stores in .claude/memory/ &mdash; only this project. Best for project-specific patterns.</p>
            </div>
            <div className="ca-memory-card">
              <strong>memory: local</strong>
              <p>Same as project but git-ignored. Private, not shared with team.</p>
            </div>
          </div>
          <p><strong>How it works:</strong> Agent reads MEMORY.md at start of each run. After working, updates MEMORY.md with new patterns discovered. Next run: agent remembers last time.</p>
          <p><strong>Example:</strong> code-reviewer with memory: user &mdash; First review: &ldquo;I notice you prefer named exports. Added to memory.&rdquo; Second review: &ldquo;Checking for named exports as per your preference...&rdquo; Over time: agent knows your entire codebase style without re-explaining.</p>
        </div>
      </>
    ),
    tip: 'The memory field transforms a stateless reviewer into a learning one. A security auditor with memory: project builds up a record of your codebase\'s security patterns, known issues, and past decisions. Each audit starts smarter than the last. Start with memory: user for any agent you plan to use long-term.',
  },
  /* Stage 3: Three Agents */
  {
    title: 'Stage 4: Copy, Paste, Ship',
    content: (
      <>
        <p>The best way to learn agent design is to read great agent files. Here are three complete, production-ready agents. Each teaches something different about the craft.</p>
      </>
    ),
    tip: 'Notice how each agent reads CLAUDE.md or existing files first. This is the most important pattern in agent design: ground the agent in your project\'s actual context before it does anything. An agent that reads your conventions produces output that fits. One that does not produces output you have to rewrite.',
  },
  /* Stage 4: Comparison */
  {
    title: 'Stage 5: Where Custom Agents Fit',
    content: (
      <>
        <p>Claude Code has three distinct ways to work with agents. Knowing which to use and when is the key to building powerful agentic workflows.</p>
        <p>The short version: subagents are Claude&rsquo;s built-in workers. Custom agents are your specialist roster. Agent Teams are a whole parallel org.</p>
      </>
    ),
    tip: null,
  },
]

/* ─── Stage Visualizations ─── */

function Stage0Viz() {
  return (
    <div className="ca-stage-viz">
      <div className="ca-viz-intro">
        <div className="ca-viz-intro-title">This is what an agent file looks like</div>
        <p>Every custom agent is a single Markdown file with two sections. The dark top section is YAML frontmatter &mdash; it tells Claude the agent&rsquo;s name, when to use it, and what tools it gets. The light bottom section is the system prompt &mdash; the instructions that shape how the agent thinks and responds.</p>
      </div>
      <AgentCard
        frontmatter={{ name: null, description: null, tools: null, model: null }}
        instructions={null}
        skeleton={true}
      />
      <div className="ca-card-labels">
        <div className="ca-card-label ca-card-label-top">
          <span className="ca-card-label-arrow">&rarr;</span> Configuration (frontmatter)
        </div>
        <div className="ca-card-label ca-card-label-bottom">
          <span className="ca-card-label-arrow">&rarr;</span> System Prompt (instructions)
        </div>
      </div>
      <div className="ca-viz-intro" style={{ marginTop: '20px' }}>
        <div className="ca-viz-intro-title">Where agent files live</div>
        <p>Drop the file in one of these two folders and Claude Code picks it up automatically. Personal agents follow you across all projects. Project agents are shared with your team via git.</p>
      </div>
      <div className="ca-folder-diagram">
        <div className="ca-folder">
          <div className="ca-folder-name">~/.claude/agents/</div>
          <div className="ca-folder-desc">Personal (all projects)</div>
          <div className="ca-folder-file">my-reviewer.md</div>
        </div>
        <div className="ca-folder">
          <div className="ca-folder-name">.claude/agents/</div>
          <div className="ca-folder-desc">Project (this project)</div>
          <div className="ca-folder-file">security-auditor.md</div>
        </div>
      </div>
    </div>
  )
}

function Stage1Viz({ onNameChange, onDescChange }) {
  const [testerName, setTesterName] = useState('')
  const [testerDesc, setTesterDesc] = useState('')

  const currentFrontmatter = {
    name: testerName || 'security-auditor',
    description: testerDesc || 'Security code review specialist.\nUse when reviewing authentication,\nAPI endpoints, user input handling,\nor any code touching credentials.',
  }

  return (
    <div className="ca-stage-viz ca-stage-viz-split">
      <div className="ca-stage-viz-left">
        <DescriptionTester
          onNameChange={(v) => { setTesterName(v); if (onNameChange) onNameChange(v) }}
          onDescChange={(v) => { setTesterDesc(v); if (onDescChange) onDescChange(v) }}
        />
      </div>
      <div className="ca-stage-viz-right">
        <AgentCard frontmatter={currentFrontmatter} instructions={null} skeleton={false} />
      </div>
    </div>
  )
}

function Stage2Viz() {
  const [builderConfig, setBuilderConfig] = useState({
    tools: 'Read, Glob, Grep',
    model: 'sonnet',
    color: 'blue',
    memory: null,
  })

  const currentFrontmatter = {
    name: 'security-auditor',
    description: 'Security code review specialist.\nUse when reviewing authentication,\nAPI endpoints, user input handling,\nor any code touching credentials.',
    tools: builderConfig.tools,
    model: builderConfig.model,
    color: builderConfig.color,
    memory: builderConfig.memory,
  }

  return (
    <div className="ca-stage-viz ca-stage-viz-split">
      <div className="ca-stage-viz-left">
        <FrontmatterBuilder onChange={setBuilderConfig} />
      </div>
      <div className="ca-stage-viz-right">
        <AgentCard frontmatter={currentFrontmatter} instructions={'[Instructions placeholder]'} skeleton={false} />
      </div>
    </div>
  )
}

function Stage3Viz() {
  const [activeTab, setActiveTab] = useState(0)
  const agent = EXAMPLE_AGENTS[activeTab]

  return (
    <div className="ca-stage-viz">
      <div className="ca-agent-tabs">
        {EXAMPLE_AGENTS.map((a, i) => (
          <button key={i} className={`ca-agent-tab ${activeTab === i ? 'ca-agent-tab-active' : ''}`} onClick={() => setActiveTab(i)} role="tab" aria-selected={activeTab === i}>
            {a.tab}
          </button>
        ))}
      </div>
      <AgentCard
        frontmatter={agent.frontmatter}
        instructions={agent.instructions}
        skeleton={false}
        annotations={agent.annotations}
        showCopy={true}
        filePath={agent.path}
      />
    </div>
  )
}

function Stage4Viz({ onSwitchTab }) {
  return (
    <div className="ca-stage-viz">
      {/* Desktop table */}
      <div className="ca-comparison-table-wrap">
        <table className="ca-comparison-table">
          <thead>
            <tr>
              <th></th>
              <th>Subagents</th>
              <th>Custom Agents</th>
              <th>Agent Teams</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={i}>
                <td className="ca-comparison-label-cell">{row.label}</td>
                <td>{row.subagents}</td>
                <td>{row.custom}</td>
                <td>{row.teams}</td>
              </tr>
            ))}
            <tr>
              <td className="ca-comparison-label-cell">Tutorial</td>
              <td>Part of every Claude Code session. No tutorial needed.</td>
              <td><span className="ca-tutorial-pill">Current tutorial</span></td>
              <td>
                {onSwitchTab ? (
                  <button className="ca-tutorial-pill ca-tutorial-pill-link" onClick={() => onSwitchTab('agent-teams')}>Agent Teams tutorial</button>
                ) : (
                  <span className="ca-tutorial-pill">Agent Teams tutorial</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="ca-comparison-cards-mobile">
        <div className="ca-comparison-card-mobile">
          <div className="ca-comparison-card-title">Subagents</div>
          {COMPARISON_ROWS.map((row, i) => (
            <div key={i} className="ca-comparison-card-row">
              <div className="ca-comparison-card-label">{row.label}</div>
              <div className="ca-comparison-card-value">{row.subagents}</div>
            </div>
          ))}
        </div>
        <div className="ca-comparison-card-mobile ca-comparison-card-mobile-highlight">
          <div className="ca-comparison-card-title">Custom Agents</div>
          {COMPARISON_ROWS.map((row, i) => (
            <div key={i} className="ca-comparison-card-row">
              <div className="ca-comparison-card-label">{row.label}</div>
              <div className="ca-comparison-card-value">{row.custom}</div>
            </div>
          ))}
        </div>
        <div className="ca-comparison-card-mobile">
          <div className="ca-comparison-card-title">Agent Teams</div>
          {COMPARISON_ROWS.map((row, i) => (
            <div key={i} className="ca-comparison-card-row">
              <div className="ca-comparison-card-label">{row.label}</div>
              <div className="ca-comparison-card-value">{row.teams}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision guide */}
      <div className="ca-decision-guide">
        <div className="ca-decision-card ca-decision-card-custom">
          <div className="ca-decision-card-title">Use Custom Agents when:</div>
          <ul>
            <li>You do the same type of task repeatedly (reviewing, testing, documenting)</li>
            <li>You want Claude to route automatically based on task context</li>
            <li>You want different tools/models for different task types</li>
            <li>You want one agent to remember things across sessions (memory field)</li>
            <li>You want to share your workflow with teammates via git</li>
          </ul>
        </div>
        <div className="ca-decision-card ca-decision-card-builtin">
          <div className="ca-decision-card-title">Stick with Built-in Subagents when:</div>
          <ul>
            <li>You need to explore a codebase quickly</li>
            <li>You are in plan mode</li>
            <li>You have not identified a specific repeatable task pattern yet</li>
            <li>The built-in Explore/Plan already covers it</li>
          </ul>
        </div>
        <div className="ca-decision-card ca-decision-card-teams">
          <div className="ca-decision-card-title">Graduate to Agent Teams when:</div>
          <ul>
            <li>Multiple independent workstreams must run simultaneously</li>
            <li>Teammates need to negotiate interfaces and message each other mid-task</li>
            <li>A large feature spans frontend, backend, and tests all at once</li>
            <li>You have read the Agent Teams tutorial and understood the limitations</li>
          </ul>
        </div>
      </div>

    </div>
  )
}

const VISUALIZATIONS = [Stage0Viz, Stage1Viz, Stage2Viz, Stage3Viz, Stage4Viz]

/* ─── Main Component ─── */
export default function CustomAgents({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('custom-agents', -1)
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

  useEffect(() => {
    const cancel = scrollStageToTop('.ca-root', activeStepRef)
    return cancel
  }, [stage])

  /* milestone-based learn tips */
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('desc-tester')) {
      setLearnTip({ key: 'desc-tester', text: 'Try the description tester — type a weak description like "helps with code" then watch all five messages stay gray. Now add "authentication, API endpoints, user input" and watch messages 1 and 4 turn green. This is the exact difference between an agent that auto-routes reliably and one that never fires.' })
    } else if (stage === 3 && !dismissedTips.has('three-agents')) {
      setLearnTip({ key: 'three-agents', text: 'Click each tab and read the annotation callouts beside the agent card. The design decisions — why security-auditor uses opus but test-writer uses sonnet, why doc-generator has no Bash, why both readers check CLAUDE.md first — are more educational than the agents themselves.' })
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
        markModuleComplete('custom-agents')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.ca-root')
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
      <div className="how-llms ca-root quiz-fade-in">
        <Quiz
          questions={customAgentsQuiz}
          tabName="Custom Agents"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="custom-agents"
        />
      </div>
    )
  }

  /* ─── Entry Screen ─── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="custom-agents" size={48} style={{ color: '#5856D6' }} />}
        title="Custom Agents"
        subtitle="Build Your Own Specialist Team"
        description="Claude Code comes with built-in agents. But the real power is defining your own. A security auditor that knows your stack. A code reviewer that enforces your exact conventions. A doc writer that matches your style. Each lives in one Markdown file and Claude delegates to it automatically &mdash; no manual invocation needed."
        buttonText="Meet the Agents"
        onStart={() => { setStage(0); markModuleStarted('custom-agents') }}
      />
    )
  }

  const StageViz = VISUALIZATIONS[stage] || VISUALIZATIONS[0]
  const content = STAGE_CONTENT[stage] || STAGE_CONTENT[0]
  const tools = STAGE_TOOLS[stage] || []

  return (
    <div className={`how-llms ca-root ${fading ? 'how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>

      {/* Welcome banner */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Custom Agents</strong> &mdash; This tutorial covers how to build, configure, and deploy custom subagents in Claude Code. Five focused stages: what agents are, how to write them, the frontmatter fields that control everything, three real-world examples you can copy, and how agents fit into the bigger picture alongside Agent Teams. You will leave with working agent files.
            <ol className="module-welcome-steps">
              <li>Learn what custom agents are and <strong>how auto-delegation works</strong></li>
              <li>Write agent descriptions with the <strong>interactive tester</strong></li>
              <li>Copy <strong>3 production-ready agents</strong> you can use today</li>
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
            <div className="how-stepper ca-stepper">
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
                  <div className="ca-info-content">{content.content}</div>

                  {content.tip && (
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {content.tip}
                    </div>
                  )}

                  {tools.length > 0 && (
                    <ToolChips tools={tools} />
                  )}
                </div>

                {/* Visualization */}
                {stage === 4 ? (
                  <StageViz onSwitchTab={onSwitchTab} />
                ) : (
                  <StageViz />
                )}

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
          <div className="how-final-celebration">You Can Build Custom Agents</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Custom Agents Toolkit</div>
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

          <SuggestedModules currentModuleId="custom-agents" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
