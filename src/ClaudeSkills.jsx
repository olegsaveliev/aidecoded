import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState'
import { scrollStageToTop } from './scrollUtils'
import EntryScreen from './EntryScreen'
import ModuleIcon from './ModuleIcon'
import Quiz from './Quiz'
import { claudeSkillsQuiz } from './quizData'
import SuggestedModules from './SuggestedModules'
import ToolChips from './ToolChips'
import Tooltip from './Tooltip'
import {
  TipIcon, CheckIcon, CrossIcon, WarningIcon,
  FileIcon, BookIcon, CodeIcon,
  SearchIcon, WrenchIcon, PackageIcon,
  SparklesIcon, BuildingIcon, ChatIcon,
  LayersIcon, ShieldIcon, GlobeIcon, BarChartIcon,
  RepeatIcon, UserIcon, GearIcon,
} from './ContentIcons'
import './ClaudeSkills.css'

/* ============================================================
   CONSTANTS
   ============================================================ */

const STAGES = [
  { key: 'mental-model', label: 'Mental Model' },
  { key: 'anatomy', label: 'Anatomy' },
  { key: 'patterns', label: 'Patterns' },
  { key: 'use-cases', label: 'Use Cases' },
  { key: 'builder', label: 'Builder' },
]

const STAGE_TOOLTIPS = {
  'mental-model': 'The mental model',
  'anatomy': 'Anatomy of a SKILL.md',
  'patterns': 'Writing patterns that work',
  'use-cases': 'Real use cases',
  'builder': 'Build your first skill',
}

const TOOLKIT = [
  { concept: 'SKILL.md', when: 'Every new skill', phrase: 'One file, permanent expertise', icon: <FileIcon size={24} color="#34C759" /> },
  { concept: 'Description Field', when: 'Skill triggers correctly', phrase: 'The make-or-break triggering mechanism', icon: <SearchIcon size={24} color="#34C759" /> },
  { concept: 'Critical Rules', when: 'Claude must never violate', phrase: 'Always, never, must — direct imperatives', icon: <ShieldIcon size={24} color="#34C759" /> },
  { concept: 'Anti-patterns', when: 'Reviewing your skill', phrase: 'Show the wrong way to prevent it', icon: <WarningIcon size={24} color="#34C759" /> },
  { concept: 'Progressive Disclosure', when: 'Large skills', phrase: 'Load only what is needed', icon: <LayersIcon size={24} color="#34C759" /> },
  { concept: 'Bundled Resources', when: 'Scripts and references', phrase: 'Keep SKILL.md lean, bundle the rest', icon: <PackageIcon size={24} color="#34C759" /> },
  { concept: 'Skill Builder', when: 'Creating a new skill', phrase: 'Structure drives quality', icon: <WrenchIcon size={24} color="#34C759" /> },
  { concept: 'Skill Ecosystem', when: 'Multiple skills', phrase: 'Skills compound over time', icon: <SparklesIcon size={24} color="#34C759" /> },
]

/* -- Annotated skill display sections (Stage 1) -- */

const SKILL_DISPLAY = [
  {
    id: 'frontmatter', badge: 'YAML Frontmatter',
    code: [
      '---', 'name: csv-cleaner',
      'description: "Use this skill whenever',
      '  the user wants to clean, transform,',
      '  validate, or fix CSV or TSV data files.',
      '  Triggers include: any mention of CSV,',
      '  TSV, spreadsheet data cleaning, fixing',
      '  messy data, removing duplicates, handling',
      '  missing values, or standardising column',
      '  formats. Also use when the user uploads',
      '  a data file and mentions quality issues.',
      '  Do NOT use for creating new spreadsheets',
      '  from scratch or for PDF/Word documents."',
      '---',
    ],
  },
  {
    id: 'overview', badge: 'Overview / When to Use',
    code: [
      '', '# CSV Data Cleaning', '',
      '## When to use this skill',
      'Use when the user has a CSV or TSV',
      'file with quality issues: duplicates,',
      'inconsistent formats, missing values,',
      'wrong data types, or encoding problems.',
    ],
  },
  {
    id: 'workflow', badge: 'Workflow',
    code: [
      '', '## Workflow', '',
      '1. INSPECT: Read first 20 rows and',
      '   describe what you see',
      '2. DIAGNOSE: Identify all quality issues',
      '3. PLAN: List transformations needed,',
      '   confirm with user before executing',
      '4. EXECUTE: Apply transformations',
      '5. VALIDATE: Show before/after stats',
    ],
  },
  {
    id: 'rules', badge: 'Critical Rules',
    code: [
      '', '## Critical rules',
      '- Never modify the original file',
      '- Always work on a copy: output.csv',
      '- Preserve column order exactly',
      '- Report count of rows affected per fix',
    ],
  },
  {
    id: 'issues', badge: 'Common Issues',
    code: [
      '', '## Common issues and fixes', '',
      '### Duplicate rows',
      '```python',
      'df = df.drop_duplicates()',
      'print(f"Removed {n} duplicates")',
      '```', '',
      '### Date standardisation',
      'Always convert to ISO 8601: YYYY-MM-DD',
      '```python',
      "df['date'] = pd.to_datetime(df['date'])",
      "  .dt.strftime('%Y-%m-%d')",
      '```', '',
      '### Missing values',
      'Ask user before filling or dropping.',
      'Default: flag as [MISSING], do not fill.',
    ],
  },
  {
    id: 'output', badge: 'Output Format',
    code: [
      '', '## Output format',
      'Always produce:',
      '- output.csv (cleaned data)',
      '- cleaning_report.md (what was changed)',
    ],
  },
]

// Compute line offsets for each section
let _offset = 1
const SKILL_SECTIONS = SKILL_DISPLAY.map(s => {
  const start = _offset
  _offset += s.code.length
  return { ...s, startLine: start }
})

/* -- Grader problems (Stage 2) -- */

const GRADER_PROBLEMS = [
  { id: 0, text: 'Description is too vague', issue: 'No specific triggers, no exclusion criteria. "Use for reports and documents" matches everything.', fix: 'Add explicit trigger phrases and DO NOT USE FOR exclusions.' },
  { id: 1, text: '"try to make" is passive', issue: 'Claude treats passive suggestions as optional. It will not prioritize this.', fix: 'Use imperative: "Always format with..." or "Must include..."' },
  { id: 2, text: '"appropriate fonts" has no specifics', issue: 'Claude cannot guess what "appropriate" means in your context.', fix: 'Specify exact fonts and sizes: "Use Calibri 11pt body, 14pt headings."' },
  { id: 3, text: '"look right" is unmeasurable', issue: 'No concrete criteria for tables. Claude will use defaults.', fix: 'Specify: "Column widths: 30% / 70%. Header row: bold, gray background."' },
  { id: 4, text: '"when done" has no output format', issue: 'Claude will produce whatever format it thinks of first.', fix: 'Specify: "Output: report.docx + summary.md with change log."' },
  { id: 5, text: 'No anti-patterns shown', issue: 'Without anti-patterns, Claude defaults to its first guess.', fix: 'Add a "Common Mistakes" section with wrong vs right examples.' },
  { id: 6, text: 'No quick reference table', issue: 'Claude has to read the entire file to find what it needs.', fix: 'Add a "Quick Reference" table at the top of the skill body.' },
  { id: 7, text: 'No critical rules section', issue: 'No clear "never violate" boundaries for Claude to follow.', fix: 'Add "Critical Rules" with 3-5 imperative statements.' },
]

const GRADER_SKILL_TEXT = `---
name: report
description: "Use for reports and documents"
---

# Report Creation

This skill is for when you need to
create reports. Reports can be in
many formats. Usually Word is good.

You should try to make the formatting
nice. Use appropriate fonts and spacing.
Headers are good to include.

For tables, you can use them when
there is tabular data. Make sure
they look right.

Output the report when done.`

/* -- Use cases (Stage 3) -- */

const USE_CASES = [
  { domain: 'Document Generation', tag: '#34C759', skill: 'docx', icon: <FileIcon size={20} color="#34C759" />, solves: 'Word documents with correct formatting, DXA units, valid XML', trigger: 'User mentions Word doc, .docx, or professional document', rule: 'Never use unicode bullets. Always set dual table widths.' },
  { domain: 'Data Work', tag: '#0071E3', skill: 'xlsx', icon: <BarChartIcon size={20} color="#0071E3" />, solves: 'Excel files with correct formulas, formatting, and structure', trigger: 'User mentions Excel, .xlsx, spreadsheet, or tabular data output', rule: 'Always use openpyxl for complex formatting. Freeze header row.' },
  { domain: 'Design & Frontend', tag: '#AF52DE', skill: 'frontend-design', icon: <GlobeIcon size={20} color="#AF52DE" />, solves: 'Distinctive, production-quality UI that avoids generic AI aesthetics', trigger: 'User asks to build web components, pages, or UI', rule: 'Never use Inter, Roboto, Arial. Commit to a bold aesthetic.' },
  { domain: 'Company Workflow', tag: '#F59E0B', skill: '[your-company]-deploy', icon: <BuildingIcon size={20} color="#F59E0B" />, solves: 'Deployment steps specific to your infrastructure and tooling', trigger: 'User mentions deploy, release, ship, or push to production', rule: 'Always run validate.sh first. Never push to main directly.' },
  { domain: 'Research & Analysis', tag: '#5856D6', skill: 'competitive-research', icon: <SearchIcon size={20} color="#5856D6" />, solves: 'Structured competitor analysis in consistent format every time', trigger: 'User asks about competitors, market analysis, or competitive landscape', rule: 'Always cover: pricing, target segment, key differentiators.' },
  { domain: 'Communication', tag: '#0EA5E9', skill: 'executive-comms', icon: <ChatIcon size={20} color="#0EA5E9" />, solves: 'Emails and updates in your organisation\'s voice and structure', trigger: 'User asks to draft update to leadership, board, or executives', rule: 'Open with the one key point. Under 200 words. No jargon.' },
]

const STAGE_TOOLS = {
  0: [{ name: 'Claude Code', color: '#34C759', desc: 'AI pair programming tool with skill support' }],
  3: [
    { name: 'docx-js', color: '#0071E3', desc: 'JavaScript library for creating Word documents' },
    { name: 'openpyxl', color: '#34C759', desc: 'Python library for Excel file manipulation' },
  ],
}

const OUTPUT_TYPES = [
  { id: 'markdown', label: 'Markdown file' },
  { id: 'word', label: 'Word document' },
  { id: 'code', label: 'Code file' },
  { id: 'data', label: 'Structured data' },
  { id: 'other', label: 'Other' },
]

/* ============================================================
   HELPERS
   ============================================================ */

function generateSkillMd(state) {
  const { skillName, skillTask, triggerConditions, triggerPhrases, exclusions, rules, expertKnowledge, outputType, formatNotes } = state
  const desc = [
    triggerConditions && `Use this skill when ${triggerConditions}.`,
    triggerPhrases && `Triggers include: ${triggerPhrases}.`,
    exclusions && `Do NOT use for ${exclusions}.`,
  ].filter(Boolean).join(' ')
  const rulesText = rules.filter(r => r.trim()).map(r => `- ${r}`).join('\n')
  return [
    '---',
    `name: ${skillName || 'my-skill'}`,
    `description: "${desc || '...'}"`,
    '---',
    '',
    `# ${skillTask || 'My Skill'}`,
    '',
    '## Critical Rules',
    rulesText || '- ...',
    '',
    '## Expert Knowledge',
    expertKnowledge || '...',
    '',
    '## Output Format',
    `Type: ${outputType || 'markdown'}`,
    formatNotes || '...',
  ].join('\n')
}

function getQualityChecks(state) {
  const { skillName, triggerConditions, exclusions, rules, expertKnowledge, formatNotes } = state
  const checks = []
  if (skillName) {
    const valid = !/\s/.test(skillName) && !/[^a-zA-Z0-9\-_]/.test(skillName)
    checks.push({ pass: valid, text: valid ? 'Name is valid (no spaces, no special chars)' : 'Name should not contain spaces or special characters' })
  }
  if (triggerConditions) checks.push({ pass: true, text: 'Description has trigger conditions' })
  if (exclusions) {
    checks.push({ pass: true, text: 'Description has explicit DO NOT USE FOR' })
  } else if (triggerConditions) {
    checks.push({ pass: false, text: 'Add exclusions (DO NOT USE FOR)' })
  }
  const validRules = rules.filter(r => r.trim())
  if (validRules.length > 0) {
    const hasImperative = validRules.some(r => /^(Always|Never|Must|Do not|Ensure)/i.test(r.trim()))
    checks.push({ pass: hasImperative, text: hasImperative ? 'Has imperative rules (Always/Never)' : 'Rules should start with Always, Never, or Must' })
  }
  if (expertKnowledge && expertKnowledge.trim()) checks.push({ pass: true, text: 'Expert knowledge section is filled' })
  if (formatNotes && formatNotes.trim()) checks.push({ pass: true, text: 'Output format is specified' })
  // Warnings
  if (triggerConditions && triggerConditions.split(/\s+/).length < 10) {
    checks.push({ pass: false, text: 'Description may be too short — add more trigger phrases' })
  }
  if (expertKnowledge && expertKnowledge.trim() && expertKnowledge.split(/\s+/).length < 8) {
    checks.push({ pass: false, text: 'Expert knowledge seems generic — add what Claude gets wrong specifically' })
  }
  return checks
}

function getRuleNudge(rule) {
  if (!rule.trim()) return null
  if (/^(Always|Never|Must|Do not|Ensure)/i.test(rule.trim())) return null
  return 'Skills work better with direct imperatives. Try starting with Always, Never, or Must.'
}

/* ============================================================
   ANNOTATION RENDER
   ============================================================ */

function renderAnnotation(sectionId) {
  switch (sectionId) {
    case 'frontmatter':
      return (
        <>
          <p>The frontmatter is the skill&rsquo;s identity. It contains two required fields:</p>
          <p><strong>NAME:</strong> A short identifier. Used internally. No spaces.</p>
          <p><strong>DESCRIPTION:</strong> The most important field. This is what Claude reads to decide whether to use this skill. It must be specific enough that Claude uses the skill when it should AND ignores it when it should not.</p>
          <p>Notice the pattern:</p>
          <ul>
            <li>Explicit triggers: &ldquo;Use when...&rdquo;</li>
            <li>Explicit non-triggers: &ldquo;Do NOT use for...&rdquo;</li>
            <li>Specific keywords that match how users actually phrase requests</li>
          </ul>
          <p>A poorly written description means the skill either never triggers or triggers for the wrong tasks.</p>
        </>
      )
    case 'overview':
      return (
        <>
          <p>Optional but useful for complex skills. Helps Claude orient before reading the detailed instructions. Keep it short &mdash; 2&ndash;3 sentences max.</p>
          <p>This section answers: <em>in what situation is Claude reading this?</em></p>
        </>
      )
    case 'workflow':
      return (
        <>
          <p>For skills that involve a specific sequence of steps, spell it out numbered and explicit. Claude will follow the sequence.</p>
          <p>Notice: Step 3 includes &ldquo;confirm with user before executing&rdquo; &mdash; this is a human checkpoint built into the workflow. Put these explicitly where they matter.</p>
        </>
      )
    case 'rules':
      return (
        <>
          <p>The most important section. Rules that must never be violated. Written as direct imperatives.</p>
          <p>Keep this short &mdash; 3&ndash;5 rules maximum. If you have 15 rules, they are not all critical. Prioritise ruthlessly.</p>
        </>
      )
    case 'issues':
      return (
        <>
          <p>Domain-specific patterns that Claude would not know or would get wrong without the skill. This is where the expert knowledge lives.</p>
          <p>These are the exact corrections you would otherwise make every session.</p>
        </>
      )
    case 'output':
      return (
        <>
          <p>Tells Claude exactly what to produce. Specificity here prevents the common failure where Claude produces the right content in the wrong format.</p>
        </>
      )
    default:
      return null
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function ClaudeSkills({ onSwitchTab }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  // Core state
  const [stage, setStage] = usePersistedState('claude-skills', -1)
  const [showEntry, setShowEntry] = useState(stage === -1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [maxStageReached, setMaxStageReached] = useState(stage)

  // Stage 1 — annotated skill
  const [selectedSection, setSelectedSection] = useState(null)

  // Stage 2 — skill grader
  const [foundProblems, setFoundProblems] = useState(new Set())

  // Stage 4 — skill builder
  const [skillName, setSkillName] = useState('')
  const [skillTask, setSkillTask] = useState('')
  const [triggerConditions, setTriggerConditions] = useState('')
  const [triggerPhrases, setTriggerPhrases] = useState('')
  const [exclusions, setExclusions] = useState('')
  const [rules, setRules] = useState([''])
  const [expertKnowledge, setExpertKnowledge] = useState('')
  const [outputType, setOutputType] = useState('markdown')
  const [customOutputType, setCustomOutputType] = useState('')
  const [formatNotes, setFormatNotes] = useState('')
  const [copied, setCopied] = useState(false)

  const activeStepRef = useRef(null)

  /* ---------- Handlers ---------- */

  function handleEntryDismiss() {
    setShowEntry(false)
    setStage(0)
    markModuleStarted('claude-skills')
  }

  function handleNext() {
    if (stage < STAGES.length - 1) {
      setStage(s => s + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setFading(false)
        markModuleComplete('claude-skills')
        scrollStageToTop('.cs-module', activeStepRef)
      }, 250)
    }
  }

  function handleBack() {
    if (stage > 0) setStage(s => s - 1)
  }

  function goToStage(i) {
    if (i <= maxStageReached && i !== stage) setStage(i)
  }

  function handleStartOver() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowEntry(true)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setFading(false)
    setSelectedSection(null)
    setFoundProblems(new Set())
    setSkillName('')
    setSkillTask('')
    setTriggerConditions('')
    setTriggerPhrases('')
    setExclusions('')
    setRules([''])
    setExpertKnowledge('')
    setOutputType('markdown')
    setCustomOutputType('')
    setFormatNotes('')
    setCopied(false)
  }

  /* ---------- Builder helpers ---------- */

  function addRule() {
    if (rules.length < 5) setRules([...rules, ''])
  }

  function removeRule(i) {
    setRules(rules.filter((_, idx) => idx !== i))
  }

  function updateRule(i, val) {
    const next = [...rules]
    next[i] = val
    setRules(next)
  }

  function handleFindProblem(id) {
    setFoundProblems(prev => new Set(prev).add(id))
  }

  const builderState = { skillName, skillTask, triggerConditions, triggerPhrases, exclusions, rules, expertKnowledge, outputType: outputType === 'other' ? customOutputType : outputType, formatNotes }
  const previewMd = generateSkillMd(builderState)
  const qualityChecks = getQualityChecks(builderState)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(previewMd)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function handleDownload() {
    const blob = new Blob([previewMd], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${skillName || 'my-skill'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  /* ---------- Effects ---------- */

  useEffect(() => {
    setMaxStageReached(prev => Math.max(prev, stage))
  }, [stage])

  useEffect(() => {
    if (stage < 0) return
    const cancel = scrollStageToTop('.cs-module', activeStepRef)
    return cancel
  }, [stage])

  /* ---------- Render ---------- */

  if (showEntry) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="claude-skills" size={48} style={{ color: '#34C759' }} />}
        title="Claude Skills"
        subtitle="Teach Claude Anything, Once"
        description={'A skill is a markdown file that loads expert knowledge into Claude\'s context exactly when it\'s needed. Write it once and Claude becomes permanently better at that task — for you, your team, or anyone you share it with. This tutorial teaches you how to write skills that actually work.'}
        buttonText="Start Learning"
        onStart={handleEntryDismiss}
      />
    )
  }

  if (showQuiz) {
    return (
      <Quiz
        questions={claudeSkillsQuiz}
        tabName="Claude Skills"
        onBack={() => setShowQuiz(false)}
        onStartOver={handleStartOver}
        onSwitchTab={onSwitchTab}
        currentModuleId="claude-skills"
      />
    )
  }

  return (
    <div className={`how-llms cs-module${fading ? ' how-fading' : ''}`}>
      {!showFinal && (
        <button className="entry-start-over" onClick={handleStartOver}>
          &larr; Start over
        </button>
      )}

      {/* ====== Welcome Banner ====== */}
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Claude Skills</strong> &mdash; here&rsquo;s how to explore:
            <ol className="module-welcome-steps">
              <li>The mental model &mdash; what skills are and why they exist</li>
              <li>Anatomy of a SKILL.md file, section by section</li>
              <li>Writing patterns that work and anti-patterns that fail</li>
              <li>Real use cases across different domains</li>
              <li>Interactive skill builder &mdash; write a real skill from scratch</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* ====== Stepper ====== */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper cs-stepper">
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
                        onKeyDown={isClickable ? e => (e.key === 'Enter' || e.key === ' ') && goToStage(i) : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        role={isClickable ? 'button' : undefined}
                      >
                        <div className="how-step-num">
                          {isCompleted ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
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
              <div className="how-stage how-fade-in" key={stage}>

          {/* ========== STAGE 0: MENTAL MODEL ========== */}
          {stage === 0 && (
            <div className="cs-stage">
              <div className="how-info-card how-info-card-edu">
                <div className="how-info-card-header">
                  <strong>Stage 1: What Skills Actually Are</strong>
                </div>
                <p>Skills package your specific domain knowledge into markdown files that Claude loads on demand. Instead of re-explaining context every session, you write it once and Claude becomes an expert every time.</p>
                <p>Claude knows a lot. But it does not know <em>your</em> specific context: your preferred file format conventions, the exact API quirks of your tech stack, your company&rsquo;s naming standards, the gotchas that took months to discover, and your output format preferences.</p>
                <p>Without skills, you re-explain this context every session. Skills solve this by packaging that context once, so it is available every time Claude needs it.</p>
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>The best signal that you need a skill: you find yourself correcting the same thing more than twice. That correction belongs in a SKILL.md.</span>
                </div>
                <ToolChips tools={STAGE_TOOLS[0]} />
              </div>

              <h3 className="cs-section-heading">The Mental Model</h3>

              <div className="cs-analogy-card">
                <p>Think of a skill as a <strong>condensed expert&rsquo;s brain</strong> in a markdown file.</p>
                <p>A senior developer on your team knows which patterns to use, which pitfalls to avoid, and what good output looks like. They could write that knowledge down.</p>
                <p>A SKILL.md is that write-down. When Claude reads it, it temporarily has that expertise for the duration of the task.</p>
              </div>

              <h3 className="cs-section-heading">How It Fits into Claude&rsquo;s Workflow</h3>

              {/* Before/After flow diagram */}
              <div className="cs-flow-container">
                <div className="cs-flow-row cs-flow-without">
                  <div className="cs-flow-label">Without a skill</div>
                  <div className="cs-flow-steps">
                    <div className="cs-flow-box">User Request</div>
                    <span className="cs-flow-arrow">&rarr;</span>
                    <div className="cs-flow-box">Claude general knowledge<span className="cs-flow-sublabel">Best guess</span></div>
                    <span className="cs-flow-arrow">&rarr;</span>
                    <div className="cs-flow-box">Plausible but wrong output</div>
                  </div>
                </div>
                <div className="cs-flow-row cs-flow-with">
                  <div className="cs-flow-label">With a skill</div>
                  <div className="cs-flow-steps">
                    <div className="cs-flow-box">User Request</div>
                    <span className="cs-flow-arrow">&rarr;</span>
                    <div className="cs-flow-box">Skill detected</div>
                    <span className="cs-flow-arrow">&rarr;</span>
                    <div className="cs-flow-box">SKILL.md loaded<span className="cs-flow-sublabel">Specific knowledge</span></div>
                    <span className="cs-flow-arrow">&rarr;</span>
                    <div className="cs-flow-box">Expert output</div>
                  </div>
                </div>
              </div>

              <h3 className="cs-section-heading">Three Loading Levels</h3>
              <p>Skills use progressive disclosure. Not everything loads every time &mdash; only what&rsquo;s needed.</p>

              <div className="cs-pyramid">
                <div className="cs-pyramid-tier cs-pyramid-top">
                  <div className="cs-pyramid-content">
                    <strong>METADATA</strong>
                    <span>name + description (~100 words)</span>
                  </div>
                  <div className="cs-pyramid-note">Always in context. Used to decide: does this skill apply?</div>
                </div>
                <div className="cs-pyramid-tier cs-pyramid-mid">
                  <div className="cs-pyramid-content">
                    <strong>SKILL.md BODY</strong>
                    <span>Instructions and patterns (&lt;500 lines ideal)</span>
                  </div>
                  <div className="cs-pyramid-note">Loads when Claude decides the skill is relevant to the task.</div>
                </div>
                <div className="cs-pyramid-tier cs-pyramid-bottom">
                  <div className="cs-pyramid-content">
                    <strong>BUNDLED RESOURCES</strong>
                    <span>Scripts, references, assets</span>
                  </div>
                  <div className="cs-pyramid-note">Loads only when the specific resource is needed.</div>
                </div>
              </div>

              <h3 className="cs-section-heading">When to Create a Skill</h3>

              <div className="cs-trigger-grid">
                <div className="cs-trigger-card">
                  <RepeatIcon size={20} color="#34C759" />
                  <strong>Repeated task</strong>
                  <p>You ask Claude to do the same type of task regularly and keep correcting the same things.</p>
                  <div className="cs-trigger-example">&ldquo;Every time I ask for a Word doc it uses A4 instead of US Letter.&rdquo;</div>
                </div>
                <div className="cs-trigger-card">
                  <BookIcon size={20} color="#34C759" />
                  <strong>Specialist knowledge</strong>
                  <p>The correct approach requires domain knowledge that took time to discover and is not generally known.</p>
                  <div className="cs-trigger-example">&ldquo;Our internal API has a quirk where pagination resets on sort change.&rdquo;</div>
                </div>
                <div className="cs-trigger-card">
                  <UserIcon size={20} color="#34C759" />
                  <strong>Team consistency</strong>
                  <p>Multiple people need Claude to produce output that looks and behaves the same.</p>
                  <div className="cs-trigger-example">&ldquo;Our reports all need the same header structure and citation format.&rdquo;</div>
                </div>
                <div className="cs-trigger-card">
                  <GearIcon size={20} color="#34C759" />
                  <strong>Complex workflow</strong>
                  <p>A task involves a specific sequence of steps that must happen in order, with specific tools.</p>
                  <div className="cs-trigger-example">&ldquo;Our deployment requires: validate &rarr; test &rarr; tag &rarr; push &rarr; notify.&rdquo;</div>
                </div>
              </div>

              <h3 className="cs-section-heading">When Not to Create a Skill</h3>

              <div className="cs-warning-item">
                <WarningIcon size={16} color="#EF4444" />
                <div>
                  <strong>One-off task:</strong> If you will only do this once, a prompt is faster than a skill. Skills earn their value through repeated use.
                </div>
              </div>
              <div className="cs-warning-item">
                <WarningIcon size={16} color="#EF4444" />
                <div>
                  <strong>Claude already handles it well:</strong> If Claude consistently produces good output without a skill, do not add complexity. Skills solve gaps, not strengths.
                </div>
              </div>
              <div className="cs-warning-item">
                <WarningIcon size={16} color="#EF4444" />
                <div>
                  <strong>Your context fits in a prompt:</strong> If the expertise can be conveyed in a few sentences at the top of a message, do that. A skill is for knowledge that is too large or too specialist to re-type every time.
                </div>
              </div>

              <div className="how-nav-row">
                <div className="how-nav-buttons">
                  <button className="how-gotit-btn" onClick={handleNext}>{STAGES[1].label} &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== STAGE 1: ANATOMY ========== */}
          {stage === 1 && (
            <div className="cs-stage">
              <div className="how-info-card how-info-card-edu">
                <div className="how-info-card-header">
                  <strong>Stage 2: Inside a SKILL.md</strong>
                </div>
                <p>Every SKILL.md has the same basic structure. Understanding each section tells you exactly what to write and why.</p>
                <p>The description field is the triggering mechanism &mdash; it is how Claude decides whether this skill is relevant. A poorly written description means the skill either never triggers or triggers for the wrong tasks.</p>
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>Keep SKILL.md under 500 lines. If you are approaching that limit, move content into a references/ file and point to it from SKILL.md with: &ldquo;For detailed X reference, read references/x.md.&rdquo; Claude will load it on demand.</span>
                </div>
              </div>

              <h3 className="cs-section-heading">Annotated Example: CSV Data Cleaner</h3>
              <p>Click any section to see its purpose and writing tips.</p>

              <div className="cs-annotated-layout">
                <div className="cs-skill-file">
                  {SKILL_SECTIONS.map(section => (
                    <div
                      key={section.id}
                      className={`cs-skill-section ${selectedSection === section.id ? 'active' : ''}`}
                      onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setSelectedSection(selectedSection === section.id ? null : section.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={section.badge}
                    >
                      <span className="cs-section-badge">{section.badge}</span>
                      {section.code.map((line, i) => (
                        <div key={i} className="cs-skill-line">
                          <span className="cs-line-num">{section.startLine + i}</span>
                          <span className="cs-line-code">{line || '\u00A0'}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {selectedSection && (
                  <div className="cs-annotation" key={selectedSection}>
                    <div className="cs-annotation-title">{SKILL_SECTIONS.find(s => s.id === selectedSection)?.badge}</div>
                    {renderAnnotation(selectedSection)}
                  </div>
                )}
              </div>

              <h3 className="cs-section-heading">Before vs After: Description Field</h3>

              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Before</div>
                  <div className="cs-compare-code">&ldquo;Use this for Word documents.&rdquo;</div>
                  <div className="cs-compare-issues">
                    <p>&bull; Too vague &mdash; what kind of Word document tasks?</p>
                    <p>&bull; No exclusion criteria</p>
                    <p>&bull; No specific triggers that match user phrasing</p>
                  </div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> After</div>
                  <div className="cs-compare-code">&ldquo;Use this skill whenever the user wants to create, read, edit, or manipulate Word documents (.docx files). Triggers include: any mention of Word doc, word document, .docx, or requests to produce professional documents with formatting. Do NOT use for PDFs, spreadsheets, Google Docs, or general coding tasks.&rdquo;</div>
                  <div className="cs-compare-issues">
                    <p>&bull; Explicit trigger phrases users actually say</p>
                    <p>&bull; Clear exclusion criteria</p>
                    <p>&bull; Covers the full range of relevant tasks</p>
                  </div>
                </div>
              </div>

              <h3 className="cs-section-heading">Bundled Resources</h3>

              <div className="cs-resource-cards">
                <div className="cs-resource-card">
                  <CodeIcon size={20} color="#34C759" />
                  <strong>Scripts</strong>
                  <p>Executable code for deterministic or repetitive tasks. Claude can run these directly without writing new code.</p>
                </div>
                <div className="cs-resource-card">
                  <BookIcon size={20} color="#34C759" />
                  <strong>References</strong>
                  <p>Large documentation files that only load when needed. Keeps the main SKILL.md lean while making deep reference available.</p>
                </div>
                <div className="cs-resource-card">
                  <PackageIcon size={20} color="#34C759" />
                  <strong>Assets</strong>
                  <p>Files used in output: templates, icons, fonts, starter files.</p>
                </div>
              </div>

              <div className="cs-folder-tree">
                <pre>{`csv-cleaner/
├── SKILL.md          ← required
├── scripts/          ← optional
│   ├── inspect.py
│   └── validate.py
├── references/       ← optional
│   └── encoding-guide.md
└── assets/           ← optional
    └── report-template.csv`}</pre>
              </div>

              <div className="how-nav-row">
                <div className="how-nav-buttons">
                  <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
                  <button className="how-gotit-btn" onClick={handleNext}>{STAGES[2].label} &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== STAGE 2: PATTERNS ========== */}
          {stage === 2 && (
            <div className="cs-stage">
              <div className="how-info-card how-info-card-edu">
                <div className="how-info-card-header">
                  <strong>Stage 3: What Works and What Fails</strong>
                </div>
                <p>Writing a SKILL.md is different from writing documentation for a human reader. Claude reads it as instructions. The patterns that work for human docs often fail for skills.</p>
                <p>Below are five concrete patterns that consistently produce better skills, followed by common anti-patterns and an interactive skill grader.</p>
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>After writing your first SKILL.md, test it by describing a task to Claude without mentioning the skill. Does it trigger? Does Claude produce the right output? Those are the two tests that matter.</span>
                </div>
              </div>

              {/* Pattern 1 */}
              <h3 className="cs-section-heading">Pattern 1 &mdash; Write Rules as Imperatives</h3>
              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Before</div>
                  <div className="cs-compare-code">It is generally better to use DXA units rather than percentages when setting table widths, as percentages can cause rendering issues in some applications like Google Docs.</div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> After</div>
                  <div className="cs-compare-code">Always use WidthType.DXA for table widths. Never use WidthType.PERCENTAGE &mdash; it breaks in Google Docs.</div>
                </div>
              </div>
              <p className="cs-compare-why"><em>Passive suggestions are treated as optional. Direct imperatives (always, never, must, do not) are followed.</em></p>

              {/* Pattern 2 */}
              <h3 className="cs-section-heading">Pattern 2 &mdash; Explain the Why for Critical Rules</h3>
              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Before</div>
                  <div className="cs-compare-code">Never use \n for line breaks.</div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> After</div>
                  <div className="cs-compare-code">Never use \n for line breaks &mdash; use separate Paragraph elements. (Reason: \n in docx-js creates invalid XML that breaks document rendering.)</div>
                </div>
              </div>
              <p className="cs-compare-why"><em>When Claude understands why a rule exists, it applies it correctly to edge cases the rule did not explicitly cover.</em></p>

              {/* Pattern 3 */}
              <h3 className="cs-section-heading">Pattern 3 &mdash; Show the Anti-pattern</h3>
              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Wrong way</div>
                  <div className="cs-compare-code cs-mono">{'new Paragraph({ children: [new TextRun(\'• Item\')] })'}</div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> Correct way</div>
                  <div className="cs-compare-code cs-mono">{'new Paragraph({\n  numbering: { reference: \'bullets\', level: 0 },\n  children: [new TextRun(\'Item\')]\n})'}</div>
                </div>
              </div>
              <p className="cs-compare-why"><em>Showing the wrong way alongside the right way prevents Claude from defaulting to the first approach it thinks of.</em></p>

              {/* Pattern 4 */}
              <h3 className="cs-section-heading">Pattern 4 &mdash; Structure by Decision Point</h3>
              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Before</div>
                  <div className="cs-compare-code">Long flowing explanation of how the entire system works, covering history, alternatives, tradeoffs, theory...</div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> After</div>
                  <div className="cs-compare-code cs-mono">{'## Quick Reference\n| Task       | Approach    |\n|------------|-------------|\n| Create new | Use docx-js |\n| Edit exist | Unpack XML  |\n| Read content | Use pandoc |'}</div>
                </div>
              </div>
              <p className="cs-compare-why"><em>Structure it around the decisions Claude will face. A quick reference table at the top is worth more than three pages of prose.</em></p>

              {/* Pattern 5 */}
              <h3 className="cs-section-heading">Pattern 5 &mdash; Include Real Numbers</h3>
              <div className="cs-compare">
                <div className="cs-compare-card cs-compare-bad">
                  <div className="cs-compare-label"><CrossIcon size={12} color="#EF4444" /> Before</div>
                  <div className="cs-compare-code">Set appropriate margins.</div>
                </div>
                <div className="cs-compare-card cs-compare-good">
                  <div className="cs-compare-label"><CheckIcon size={12} color="#34C759" /> After</div>
                  <div className="cs-compare-code cs-mono">{'Set 1-inch margins:\nmargin: { top: 1440, right: 1440,\n  bottom: 1440, left: 1440 }\n(1440 DXA = 1 inch)'}</div>
                </div>
              </div>
              <p className="cs-compare-why"><em>Vague instructions produce vague output. Claude cannot guess what &ldquo;appropriate&rdquo; means in your context.</em></p>

              {/* Anti-patterns */}
              <h3 className="cs-section-heading">Common Anti-patterns</h3>

              <div className="cs-antipattern-cards">
                <div className="cs-antipattern-card">
                  <strong>The Essay</strong>
                  <p>Writing SKILL.md as flowing prose about the domain. Claude cannot easily extract actionable rules from narrative.</p>
                  <div className="cs-antipattern-fix">Fix: Convert to numbered steps, Quick Reference tables, and explicit rules sections.</div>
                </div>
                <div className="cs-antipattern-card">
                  <strong>The Kitchen Sink</strong>
                  <p>Adding every fact you know about a domain into one skill. Claude spends context on irrelevant information.</p>
                  <div className="cs-antipattern-fix">Fix: One skill per workflow. Separate skills for separate tasks.</div>
                </div>
                <div className="cs-antipattern-card">
                  <strong>The Vague Trigger</strong>
                  <p>Description says &ldquo;use for data tasks&rdquo;. Everything is a data task. The skill never stops triggering.</p>
                  <div className="cs-antipattern-fix">Fix: Specify exactly what task type, what file type. Include explicit DO NOT USE FOR.</div>
                </div>
                <div className="cs-antipattern-card">
                  <strong>Instructions for Humans</strong>
                  <p>Writing &ldquo;you might want to consider whether&rdquo; or &ldquo;it can be useful to&rdquo;. These are hedges. Claude treats them as optional.</p>
                  <div className="cs-antipattern-fix">Fix: Always, never, must, do not. Declarative imperatives only.</div>
                </div>
                <div className="cs-antipattern-card">
                  <strong>Missing the Gotchas</strong>
                  <p>Writing a skill that covers the happy path but omits the edge cases where things go wrong. The value of a skill is exactly those edge cases.</p>
                  <div className="cs-antipattern-fix">Fix: For every rule, ask: what would Claude do wrong without this?</div>
                </div>
              </div>

              {/* Skill Grader */}
              <h3 className="cs-section-heading">Skill Grader</h3>
              <p>Read the skill below and identify the problems. How many can you find?</p>

              <div className="cs-grader">
                <div className="cs-grader-skill">
                  <pre>{GRADER_SKILL_TEXT}</pre>
                </div>
                <p className="cs-grader-prompt">Click each problem you can spot:</p>
                <div className="cs-grader-issues">
                  {GRADER_PROBLEMS.map(problem => (
                    <div
                      key={problem.id}
                      className={`cs-grader-issue ${foundProblems.has(problem.id) ? 'found' : ''}`}
                      onClick={() => handleFindProblem(problem.id)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFindProblem(problem.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={problem.text}
                    >
                      <div className="cs-grader-issue-header">
                        {foundProblems.has(problem.id)
                          ? <CheckIcon size={16} color="#34C759" />
                          : <span className="cs-grader-q">?</span>
                        }
                        <span>{problem.text}</span>
                      </div>
                      {foundProblems.has(problem.id) && (
                        <div className="cs-grader-issue-detail">
                          <p className="cs-grader-issue-problem">{problem.issue}</p>
                          <p className="cs-grader-issue-fix"><strong>Fix:</strong> {problem.fix}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="cs-grader-score">
                  <div className="cs-grader-score-fill" style={{ width: `${(foundProblems.size / GRADER_PROBLEMS.length) * 100}%` }} />
                  <span className="cs-grader-score-text">{foundProblems.size} of {GRADER_PROBLEMS.length} found</span>
                </div>
              </div>

              <div className="how-nav-row">
                <div className="how-nav-buttons">
                  <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
                  <button className="how-gotit-btn" onClick={handleNext}>{STAGES[3].label} &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== STAGE 3: USE CASES ========== */}
          {stage === 3 && (
            <div className="cs-stage">
              <div className="how-info-card how-info-card-edu">
                <div className="how-info-card-header">
                  <strong>Stage 4: Skills Across Domains</strong>
                </div>
                <p>Skills are not just for code or document generation. Any repeatable task where Claude needs domain-specific knowledge is a candidate.</p>
                <p>Skills compound. They do not conflict &mdash; Claude loads only the relevant skill for each task. They get better over time as you add corrections. And they transfer to teams &mdash; share a SKILL.md and everyone benefits.</p>
                <div className="how-info-tip">
                  <TipIcon size={16} color="#eab308" />
                  <span>Start with the task you do most often that Claude currently handles imperfectly. Write a skill for that one task. Use it for a week. Every time you correct Claude, add that correction to the skill.</span>
                </div>
                <ToolChips tools={STAGE_TOOLS[3]} />
              </div>

              <div className="cs-use-case-grid">
                {USE_CASES.map(uc => (
                  <div key={uc.skill} className="cs-use-case-card">
                    <div className="cs-domain-tag" style={{ color: uc.tag }}>{uc.icon} {uc.domain}</div>
                    <div className="cs-use-case-skill">{uc.skill}</div>
                    <p className="cs-use-case-solves">{uc.solves}</p>
                    <div className="cs-use-case-trigger"><strong>Trigger:</strong> {uc.trigger}</div>
                    <div className="cs-use-case-rule">{uc.rule}</div>
                  </div>
                ))}
              </div>

              <h3 className="cs-section-heading">The Skills Ecosystem</h3>
              <p>Skills connect to Claude like plugins. A task comes in, Claude picks the right skill, and expert output comes out.</p>

              {/* Ecosystem diagram */}
              <div className="cs-ecosystem">
                <svg viewBox="0 0 500 240" className="cs-ecosystem-svg">
                  {/* Central Claude circle */}
                  <circle cx="250" cy="120" r="35" fill="none" stroke="#34C759" strokeWidth="2" />
                  <text x="250" y="125" textAnchor="middle" fill="var(--text-primary)" fontSize="12" fontWeight="600">Claude</text>

                  {/* Skill boxes */}
                  {[
                    { x: 60, y: 40, label: 'docx', active: false },
                    { x: 60, y: 160, label: 'csv-cleaner', active: true },
                    { x: 380, y: 40, label: 'deploy', active: false },
                    { x: 380, y: 160, label: 'frontend', active: false },
                    { x: 220, y: 10, label: 'research', active: false },
                  ].map((s, i) => {
                    const bx = s.x + 40, by = s.y + 18
                    const dx = 250 - bx, dy = 120 - by
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    /* Line end: circle border */
                    const ex = 250 - 37 * dx / dist
                    const ey = 120 - 37 * dy / dist
                    /* Line start: box border */
                    const adx = Math.abs(dx), ady = Math.abs(dy)
                    const tX = adx > 0 ? 40 / adx : Infinity
                    const tY = ady > 0 ? 18 / ady : Infinity
                    const tBox = Math.min(tX, tY)
                    const sx = bx + dx * tBox
                    const sy = by + dy * tBox
                    return (
                      <g key={i}>
                        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={s.active ? '#34C759' : 'var(--border)'} strokeWidth={s.active ? 2 : 1} strokeDasharray={s.active ? '6 3' : '4'} />
                        <rect x={s.x} y={s.y} width="80" height="36" rx="6" fill={s.active ? 'rgba(52,199,89,0.1)' : 'var(--bg-secondary)'} stroke={s.active ? '#34C759' : 'var(--border)'} strokeWidth={s.active ? 2 : 1} />
                        <text x={s.x + 40} y={s.y + 22} textAnchor="middle" fill="var(--text-primary)" fontSize="10">{s.label}</text>
                      </g>
                    )
                  })}

                  {/* Task flow */}
                  <line x1="0" y1="120" x2="207" y2="120" stroke="#34C759" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
                  <line x1="293" y1="120" x2="500" y2="120" stroke="#34C759" strokeWidth="1.5" markerEnd="url(#arrowGreen)" />
                  <defs>
                    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <path d="M0,0 L8,3 L0,6" fill="#34C759" />
                    </marker>
                  </defs>
                  <text x="10" y="110" fill="var(--text-secondary)" fontSize="9">task in</text>
                  <text x="460" y="110" fill="var(--text-secondary)" fontSize="9">expert out</text>
                </svg>
              </div>

              <div className="how-nav-row">
                <div className="how-nav-buttons">
                  <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
                  <button className="how-gotit-btn" onClick={handleNext}>{STAGES[4].label} &rarr;</button>
                </div>
              </div>
            </div>
          )}

          {/* ========== STAGE 4: BUILDER ========== */}
          {stage === 4 && (
            <div className="cs-stage">
              <div className="how-info-card how-info-card-edu">
                <div className="how-info-card-header">
                  <strong>Stage 5: Write a Real Skill Now</strong>
                </div>
                <p>This is not a quiz. This is a real skill builder. Fill in the sections below and you will have an actual SKILL.md you can use.</p>
              </div>

              <div className="cs-builder">
                {/* Left: Form */}
                <div className="cs-builder-form">

                  {/* Section 1: Identity */}
                  <div className="cs-builder-section">
                    <h4 className="cs-builder-heading">1. Skill Identity</h4>
                    <label className="cs-builder-label">What task will this skill help with?</label>
                    <input
                      type="text"
                      className="cs-builder-input"
                      placeholder="e.g. creating weekly status reports in our format"
                      value={skillTask}
                      onChange={e => setSkillTask(e.target.value)}
                    />
                    <label className="cs-builder-label">Your skill name (no spaces):</label>
                    <input
                      type="text"
                      className="cs-builder-input"
                      placeholder="e.g. weekly-report"
                      value={skillName}
                      onChange={e => setSkillName(e.target.value)}
                    />
                  </div>

                  {/* Section 2: Description */}
                  <div className="cs-builder-section">
                    <h4 className="cs-builder-heading">2. Description (triggering)</h4>
                    <label className="cs-builder-label">When should this trigger?</label>
                    <textarea
                      className="cs-builder-textarea"
                      placeholder="When the user asks for a status report, weekly update, team summary..."
                      value={triggerConditions}
                      onChange={e => setTriggerConditions(e.target.value)}
                      rows={2}
                    />
                    <label className="cs-builder-label">What exact phrases should trigger it?</label>
                    <textarea
                      className="cs-builder-textarea"
                      placeholder="status report, weekly update, team update, sprint summary..."
                      value={triggerPhrases}
                      onChange={e => setTriggerPhrases(e.target.value)}
                      rows={2}
                    />
                    <label className="cs-builder-label">What should it NOT trigger for?</label>
                    <textarea
                      className="cs-builder-textarea"
                      placeholder="One-off emails, ad-hoc analysis, general writing tasks..."
                      value={exclusions}
                      onChange={e => setExclusions(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {/* Section 3: Rules */}
                  <div className="cs-builder-section">
                    <h4 className="cs-builder-heading">3. Critical Rules</h4>
                    <label className="cs-builder-label">What are the 3&ndash;5 rules Claude must NEVER violate?</label>
                    {rules.map((rule, i) => {
                      const nudge = getRuleNudge(rule)
                      return (
                        <div key={i} className="cs-rule-row">
                          <input
                            type="text"
                            className="cs-builder-input"
                            placeholder="Always..., Never..., Must..."
                            value={rule}
                            onChange={e => updateRule(i, e.target.value)}
                          />
                          {rules.length > 1 && (
                            <button className="cs-rule-remove" onClick={() => removeRule(i)} aria-label="Remove rule">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          )}
                          {nudge && <div className="cs-imperative-nudge">{nudge}</div>}
                        </div>
                      )
                    })}
                    {rules.length < 5 && (
                      <button className="cs-add-rule-btn" onClick={addRule}>+ Add Rule</button>
                    )}
                  </div>

                  {/* Section 4: Expert Knowledge */}
                  <div className="cs-builder-section">
                    <h4 className="cs-builder-heading">4. Expert Knowledge</h4>
                    <label className="cs-builder-label">What does Claude get wrong without your specific knowledge?</label>
                    <textarea
                      className="cs-builder-textarea"
                      placeholder="e.g. Our reports always open with the traffic light status (Red/Amber/Green) before any prose. Claude defaults to prose first."
                      value={expertKnowledge}
                      onChange={e => setExpertKnowledge(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Section 5: Output Format */}
                  <div className="cs-builder-section">
                    <h4 className="cs-builder-heading">5. Output Format</h4>
                    <label className="cs-builder-label">What exactly should Claude produce?</label>
                    <div className="cs-output-options">
                      {OUTPUT_TYPES.map(t => (
                        <button
                          key={t.id}
                          className={`cs-output-option ${outputType === t.id ? 'active' : ''}`}
                          onClick={() => setOutputType(t.id)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {outputType === 'other' && (
                      <input
                        type="text"
                        className="cs-builder-input"
                        placeholder="Specify output type..."
                        value={customOutputType}
                        onChange={e => setCustomOutputType(e.target.value)}
                        style={{ marginTop: 8 }}
                      />
                    )}
                    <label className="cs-builder-label" style={{ marginTop: 12 }}>Specific format notes:</label>
                    <textarea
                      className="cs-builder-textarea"
                      placeholder="e.g. Always include: Executive Summary (3 bullets), Completed this week, Planned next week, Blockers. Under 400 words total."
                      value={formatNotes}
                      onChange={e => setFormatNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right: Live Preview */}
                <div className="cs-preview-wrapper">
                  <div className="cs-preview-label">Your SKILL.md</div>
                  <div className="cs-preview">
                    <pre>{previewMd}</pre>
                  </div>

                  {/* Quality Checks */}
                  {qualityChecks.length > 0 && (
                    <div className="cs-quality">
                      {qualityChecks.map((check, i) => (
                        <div key={i} className="cs-quality-row">
                          {check.pass
                            ? <CheckIcon size={16} color="#34C759" />
                            : <WarningIcon size={16} color="#F59E0B" />
                          }
                          <span>{check.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="cs-preview-actions">
                    <button className="cs-copy-btn" onClick={handleCopy}>
                      {copied ? 'Copied!' : 'Copy SKILL.md'}
                    </button>
                    <button className="cs-download-btn" onClick={handleDownload}>
                      Download SKILL.md
                    </button>
                  </div>

                  <div className="cs-install-info">
                    <strong>How to install this skill:</strong>
                    <p>In Claude Code: place in <code>~/.claude/skills/</code></p>
                    <p>In claude.ai: add to project files</p>
                    <p>In Claude Desktop: add to skills folder</p>
                  </div>
                </div>
              </div>

              <p>You built your first skill. Now try it: describe your task to Claude and see if it triggers. Refine based on what you observe.</p>

              <div className="how-nav-row">
                <div className="how-nav-buttons">
                  <button className="how-back-btn" onClick={handleBack}>&larr; Back</button>
                  <button className="how-gotit-btn" onClick={handleNext}>See Summary &rarr;</button>
                </div>
              </div>
            </div>
          )}

              </div>
            )}
          </div>
        </>
      )}

      {/* ====== Final Screen ====== */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now know Claude Skills!</div>
          <div className="pe-final-grid">
            {TOOLKIT.map(item => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>
          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Claude Skills Toolkit</div>
            <table className="pe-reference">
              <thead><tr><th>Concept</th><th>When to use</th><th>Key phrase</th></tr></thead>
              <tbody>
                {TOOLKIT.map(item => (
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
          <SuggestedModules currentModuleId="claude-skills" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
