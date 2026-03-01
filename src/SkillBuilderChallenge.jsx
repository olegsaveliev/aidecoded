import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import ModuleIcon from './ModuleIcon'
import SuggestedModules from './SuggestedModules'
import { CheckIcon, CrossIcon } from './ContentIcons'
import { scrollStageToTop } from './scrollUtils'
import './SkillBuilderChallenge.css'

/* ── Round data ────────────────────────────────────────────── */

const ROUNDS = [
  {
    title: 'The Incomplete Skill',
    difficulty: 'Beginner',
    difficultyColor: '#34C759',
    situation: 'Your team uses Claude to generate weekly status reports. A skill exists but it is incomplete. Claude is still making three consistent mistakes.',
    failingOutput: `# Weekly Status Report

This week we made good progress on
the project. Several tasks were completed
and we are on track for the deadline.

Next week we plan to continue working
on the remaining items.

Team: [no traffic light status shown]
Word count: 847 words`,
    errorNotes: [
      'No traffic light status (Red/Amber/Green)',
      'Vague prose instead of bullet points',
      'Way over the 200 word limit',
    ],
    lockedSkill: `---
name: weekly-report
description: "Use when user asks for
a weekly status report or team update"
---

# Weekly Report Skill

Help create clear weekly status reports.
Use professional language.
Include what was done this week
and what is planned for next week.
Output a well-formatted report.`,
    editableLabel: '## Critical Rules',
    placeholder: 'Write your rules here.\nTip: Start each rule with Always, Never, Must, or Do not.',
    initialContent: '',
    task: 'Add the critical rules that fix the three highlighted mistakes. The description and structure are fine — only the rules section needs work.',
    editorMode: 'rules-only',
    testCases: [
      {
        prompt: 'Write our weekly status report. The checkout feature shipped this week.',
        criteria: [
          { name: 'Traffic light present', check: c => /traffic.?light|red.*amber.*green|\[red\]|\[amber\]|\[green\]/i.test(c) },
          { name: 'Under 200 words', check: c => /200\s*word|word.*(?:count|limit).*200|never.*exceed.*200|maximum.*200/i.test(c) },
          { name: 'Bullet format', check: c => /bullet/i.test(c) || /never.*prose/i.test(c) },
        ],
      },
      {
        prompt: 'Can you create the team update for our sprint review?',
        criteria: [
          { name: 'Traffic light present', check: c => /traffic.?light|red.*amber.*green|\[red\]|\[amber\]|\[green\]/i.test(c) },
          { name: 'Under 200 words', check: c => /200\s*word|word.*(?:count|limit).*200|never.*exceed.*200|maximum.*200/i.test(c) },
          { name: 'Bullet format', check: c => /bullet/i.test(c) || /never.*prose/i.test(c) },
        ],
      },
      {
        prompt: 'We need the weekly update. Two blockers this week.',
        criteria: [
          { name: 'Traffic light present', check: c => /traffic.?light|red.*amber.*green|\[red\]|\[amber\]|\[green\]/i.test(c) },
          { name: 'Under 200 words', check: c => /200\s*word|word.*(?:count|limit).*200|never.*exceed.*200|maximum.*200/i.test(c) },
          { name: 'Blocker format', check: c => /blocker/i.test(c) },
        ],
      },
    ],
    exampleSolution: `## Critical Rules
- Always open with traffic light status:
  [RED] / [AMBER] / [GREEN] + one sentence
- Always use bullet points, never prose
- Never exceed 200 words total
- Always include three sections:
  This week / Next week / Blockers`,
    exampleLesson: 'Rules must be specific imperatives',
  },
  {
    title: 'The Broken Skill',
    difficulty: 'Intermediate',
    difficultyColor: '#F59E0B',
    situation: 'Your team\'s CSV data cleaning skill is producing bad results. Two things are wrong: the description triggers too broadly (it fires for creating new spreadsheets, which it should not) and the workflow is missing a critical step that causes data loss.',
    failingOutput: `Failure A — Wrong trigger:
User: "Create a sales tracker
spreadsheet from scratch"
Claude uses CSV cleaner skill.
Output: Tries to clean data that
doesn't exist yet, errors out.
→ Should NOT have triggered

Failure B — Missing safety step:
User: "Clean this customer data CSV"
Claude cleans the file correctly
but overwrites the original.
Output: "I've cleaned your file.
I updated customers.csv directly."
→ CRITICAL: original data lost`,
    errorNotes: [
      'Description triggers too broadly — fires for creating new files',
      'Workflow missing critical backup step — overwrites originals',
    ],
    lockedSkill: null,
    editableLabel: null,
    placeholder: null,
    initialContent: `---
name: csv-cleaner
description: "Use when the user has
a CSV or data file they want
to work with"
---

# CSV Cleaning

Clean data files by removing duplicates,
fixing formats, and handling missing values.

## Workflow
1. Read the file
2. Identify issues
3. Fix issues
4. Save the result

## Output
Produce a cleaned CSV file.`,
    task: 'Fix two things:\n1. The description is too broad — tighten it so it only triggers for cleaning existing files, not creating new ones\n2. Add the critical safety step missing from the workflow (hint: what happens to the original file?)',
    editorMode: 'full',
    testCases: [
      {
        prompt: 'Create a new expense tracker spreadsheet for Q4',
        description: 'Should NOT trigger',
        criteria: [
          { name: 'Excludes creation tasks', check: c => /do\s*not\s*use.*creat|not.*for.*new|not.*for.*creat|never.*trigger.*new|exclud.*creat/i.test(c) },
          { name: 'Mentions existing files', check: c => /existing/i.test(c) },
          { name: 'Specific trigger scope', check: c => /clean|quality|duplicat|format.*error|missing.*value|encoding/i.test(c) },
        ],
      },
      {
        prompt: 'Fix the formatting in my contacts.csv',
        description: 'Should trigger safely',
        criteria: [
          { name: 'Triggers for cleaning', check: c => /clean|fix|format|quality/i.test(c) },
          { name: 'Preserves original file', check: c => /backup|copy.*original|preserv.*original|original.*(?:copy|backup)|back.?up/i.test(c) },
          { name: 'Never overwrites', check: c => /never.*(?:overwrite|modify.*original|delete.*original)|work.*(?:on|with).*copy|only.*copy/i.test(c) },
        ],
      },
      {
        prompt: 'I have a messy TSV file with duplicate rows, can you help clean it up?',
        description: 'Should trigger (TSV included)',
        criteria: [
          { name: 'TSV included', check: c => /tsv/i.test(c) },
          { name: 'Preserves original', check: c => /backup|copy.*original|preserv.*original|original.*(?:copy|backup)|back.?up/i.test(c) },
          { name: 'Handles duplicates', check: c => /duplicat/i.test(c) },
        ],
      },
    ],
    exampleSolution: `---
name: csv-cleaner
description: "Use when the user has an existing
CSV or TSV file with quality issues
such as duplicates, formatting errors,
missing values, or encoding problems.
Do NOT use for creating new spreadsheets
from scratch or generating new data files."
---

# CSV Cleaning

Clean data files by removing duplicates,
fixing formats, and handling missing values.

## Workflow
1. COPY original to [filename]-backup.csv
   before ANY modifications
2. Work only on the copy
3. Never modify or delete the original
4. Read the file
5. Identify issues
6. Fix issues
7. Save the result

## Output
Produce a cleaned CSV file.`,
    exampleLesson: 'Description precision prevents wrong triggers',
  },
  {
    title: 'Write From Scratch',
    difficulty: 'Expert',
    difficultyColor: '#EF4444',
    situation: 'Your team uses Claude to review GitHub pull requests. There is no skill. Claude is doing it badly — it is too verbose, misses security issues, and does not follow your team\'s review format.',
    failingOutput: `## PR Review: Add user settings page

Overall this looks like a solid implementation
of the user settings page. I can see you've
added proper form handling and validation
which is great. The component structure
follows React best practices with proper
state management using useState hooks.

I noticed you're using inline styles in
a few places which could be refactored
to use CSS modules for better maintainability.
The error handling could also be improved
by adding try-catch blocks around the API
calls...

[continues for 800+ words]
[no security check performed]
[no verdict — Approve/Request Changes/Block]
[comments are generic, not code-specific]
[didn't check for missing tests]`,
    errorNotes: [
      '800+ words (should be under 300)',
      'No security check performed',
      'No Verdict at top (Approve/Request Changes/Block)',
      'Generic comments not specific to the code',
      'Does not check for missing tests',
    ],
    lockedSkill: null,
    editableLabel: null,
    placeholder: null,
    initialContent: `---
name:
description: "
---

`,
    task: 'Write the complete SKILL.md for a pull request review skill. You have all the information you need in the failure examples.',
    editorMode: 'full',
    hasHint: true,
    hintItems: [
      'Open with Verdict: [APPROVE / REQUEST CHANGES / BLOCK]',
      'Be under 300 words',
      'Always check: logic, security, tests, performance',
      'Flag any secret or credential in the diff as BLOCK severity',
    ],
    testCases: [
      {
        prompt: 'Basic feature PR — adds user settings page',
        description: 'Standard review',
        criteria: [
          { name: 'Has Verdict at top', check: c => /verdict/i.test(c) && /approve|request.*change|block/i.test(c) },
          { name: 'Under 300 words', check: c => /300\s*word|word.*300|exceed.*300|maximum.*300/i.test(c) },
          { name: 'Checks key areas', check: c => {
            const areas = [/logic/i, /security/i, /test/i, /performance/i]
            return areas.filter(r => r.test(c)).length >= 3
          }},
        ],
      },
      {
        prompt: 'PR with hardcoded API key on line 42',
        description: 'Security issue',
        criteria: [
          { name: 'Flags security issue', check: c => /secret|credential|api.?key|hardcoded|sensitive/i.test(c) },
          { name: 'BLOCK severity', check: c => /block/i.test(c) },
          { name: 'Specific line references', check: c => /line.*ref|L\d|specific.*line|line.*number/i.test(c) },
        ],
      },
      {
        prompt: 'PR adds new endpoint with no test file',
        description: 'Missing tests',
        criteria: [
          { name: 'Flags missing tests', check: c => /test.*coverage|missing.*test|no.*test|without.*test/i.test(c) },
          { name: 'Requests tests', check: c => /require|request|must.*(?:add|include|write).*test|need.*test/i.test(c) },
          { name: 'Before approving', check: c => /before.*approv|not.*approv|block.*until|request.*change/i.test(c) },
        ],
      },
    ],
    exampleSolution: `---
name: pr-review
description: "Use when the user asks
to review a pull request, check a PR,
do a code review, or give feedback on
a diff. Triggers include: PR review,
pull request, code review, review this
diff. Do NOT use for general code
explanation or debugging tasks."
---

# Pull Request Review

## Workflow
1. Read the full diff carefully
2. Check: logic correctness, security
   vulnerabilities, test coverage,
   performance impact
3. Write verdict and summary

## Critical Rules
- Always open with Verdict on line 1:
  APPROVE / REQUEST CHANGES / BLOCK
- Never exceed 300 words
- Always flag hardcoded secrets,
  API keys, or credentials as BLOCK
- Must check for missing test coverage
- Specific line references required
  for all issues found (L42, L78)

## Output Format
Verdict: [APPROVE / REQUEST CHANGES / BLOCK]

Summary: [2-3 sentences max]

Issues found:
- [Severity: BLOCK/MAJOR/MINOR] L[N]:
  [specific issue]

Missing: [tests/docs/etc if any]`,
    exampleLesson: 'Structure (verdict first) is part of the skill',
  },
]

/* ── Score bands ───────────────────────────────────────────── */

const SCORE_BANDS = [
  { min: 24, label: 'Skill Architect', color: '#34C759' },
  { min: 18, label: 'Skilled Builder', color: '#F59E0B' },
  { min: 9, label: 'Getting There', color: '#0071E3' },
  { min: 0, label: 'Keep Practising', color: '#EF4444' },
]

function getScoreBand(score) {
  return SCORE_BANDS.find(b => score >= b.min)
}

const CONCEPT_PILLS = [
  'SKILL.md', 'Description field', 'Triggering', 'Critical Rules',
  'Imperative writing', 'Anti-patterns', 'Output format', 'Test cases',
  'Edge cases', 'Skill ecosystem',
]

/* ── Component ─────────────────────────────────────────────── */

function SkillBuilderChallenge({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('sbc-best')
    return saved ? Number(saved) : 0
  })
  const completedOnceRef = useRef(false)
  const timersRef = useRef([])

  const [started, setStarted] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)

  const [currentRound, setCurrentRound] = useState(0)
  const [roundPhase, setRoundPhase] = useState('edit')
  const [editorContent, setEditorContent] = useState('')
  const [testResults, setTestResults] = useState(null)
  const [visibleTests, setVisibleTests] = useState(0)
  const [roundScores, setRoundScores] = useState([])
  const [showComplete, setShowComplete] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const hintUsedRef = useRef(false)
  const [showExample, setShowExample] = useState(false)

  useEffect(() => {
    if (started) return
    const t1 = setTimeout(() => setVisibleLines(1), 300)
    const t2 = setTimeout(() => setVisibleLines(2), 600)
    const t3 = setTimeout(() => setVisibleLines(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [started])

  useEffect(() => {
    return () => timersRef.current.forEach(t => clearTimeout(t))
  }, [])

  function handleStart() {
    setStarted(true)
    markModuleStarted('skill-builder-challenge')
  }

  function handleSubmit() {
    if (!editorContent.trim()) return
    setRoundPhase('testing')
    setVisibleTests(0)
    setTestResults(null)

    const round = ROUNDS[currentRound]
    const content = editorContent.toLowerCase()

    const newTimers = []
    newTimers.push(setTimeout(() => {
      const results = round.testCases.map(test => ({
        prompt: test.prompt,
        description: test.description,
        criteria: test.criteria.map(criterion => ({
          name: criterion.name,
          passed: criterion.check(content),
        })),
      }))
      setTestResults(results)

      results.forEach((_, i) => {
        newTimers.push(setTimeout(() => {
          setVisibleTests(prev => prev + 1)
        }, (i + 1) * 200))
      })

      newTimers.push(setTimeout(() => {
        setRoundPhase('results')
        let score = results.reduce((sum, t) => sum + t.criteria.filter(c => c.passed).length, 0)
        if (currentRound === 2 && hintUsedRef.current) {
          score = Math.max(0, score - 5)
        }
        setRoundScores(prev => [...prev, score])

        if (!completedOnceRef.current) {
          markModuleComplete('skill-builder-challenge')
          completedOnceRef.current = true
        }
      }, results.length * 200 + 500))
    }, 1200))

    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = newTimers
  }

  function handleNextRound() {
    const nextRound = currentRound + 1
    if (nextRound >= ROUNDS.length) {
      const totalScore = roundScores.reduce((a, b) => a + b, 0)
      if (totalScore > bestScore) {
        setBestScore(totalScore)
        localStorage.setItem('sbc-best', String(totalScore))
      }
      setShowComplete(true)
      scrollStageToTop('.sbc-game')
      return
    }
    setCurrentRound(nextRound)
    setRoundPhase('edit')
    setEditorContent(ROUNDS[nextRound].initialContent)
    setTestResults(null)
    setVisibleTests(0)
    setShowHint(false)
    setHintUsed(false)
    hintUsedRef.current = false
    setShowExample(false)
    scrollStageToTop('.sbc-game')
  }

  function handleReset() {
    setCurrentRound(0)
    setRoundPhase('edit')
    setEditorContent('')
    setTestResults(null)
    setRoundScores([])
    setShowComplete(false)
    setShowHint(false)
    setHintUsed(false)
    hintUsedRef.current = false
    setShowExample(false)
    setVisibleTests(0)
    scrollStageToTop('.sbc-game')
  }

  function deriveRoundScore() {
    if (!testResults) return 0
    let s = testResults.reduce((sum, t) => sum + t.criteria.filter(c => c.passed).length, 0)
    if (currentRound === 2 && hintUsed) s = Math.max(0, s - 5)
    return s
  }

  /* ── Entry screen ──────────────────────────────────────── */

  if (!started) {
    return (
      <div className="sbc-entry">
        <ModuleIcon module="skill-builder-challenge" size={72} style={{ color: '#F59E0B' }} />
        <h1 className="sbc-entry-title">Skill Builder Challenge</h1>
        <div className="sbc-entry-taglines">
          <span className={`sbc-entry-tagline${visibleLines >= 1 ? ' visible' : ''}`}>Claude has a problem.</span>
          <span className={`sbc-entry-tagline${visibleLines >= 2 ? ' visible' : ''}`}>You have a SKILL.md.</span>
          <span className={`sbc-entry-tagline${visibleLines >= 3 ? ' visible' : ''}`}>Fix it.</span>
        </div>
        <div className="sbc-briefing">
          <p>
            In each round you will see Claude failing at a real task&mdash;producing
            wrong output, using bad patterns, missing critical knowledge. Your job
            is to write the SKILL.md that fixes it.
          </p>
          <p>
            After you submit, your skill runs against three test cases. You score
            points based on how many fail modes your skill prevents.
          </p>
          <p>Three rounds. Each one harder.</p>
        </div>
        <div className="sbc-entry-stats">
          <span className="sbc-stat">3 Rounds</span>
          <span className="sbc-stat">Real Test Cases</span>
          <span className="sbc-stat">Score-Based</span>
        </div>
        <button className="sbc-btn-primary" onClick={handleStart}>Enter the Lab</button>
      </div>
    )
  }

  /* ── Final results ─────────────────────────────────────── */

  if (showComplete) {
    const totalScore = roundScores.reduce((a, b) => a + b, 0)
    const band = getScoreBand(totalScore)
    const best = Math.max(totalScore, bestScore)

    const insights = []
    insights.push('The single most common gap across all three rounds: descriptive rules instead of imperative rules. "Reports should be concise" does not work. "Never exceed 200 words" does.')
    if (roundScores[1] < 6) {
      insights.push('Description precision is the triggering mechanism. Too broad = triggers for everything. Too narrow = never triggers. Always include explicit DO NOT USE FOR.')
    } else {
      insights.push('Your description was correctly scoped. This is the skill writing habit most people need the most practice with.')
    }
    if (roundScores[2] < 5) {
      insights.push('Writing from scratch is hard because you have to infer what the skill needs from the failure examples. That is exactly the real skill writing process: observe what Claude gets wrong, encode the fix.')
    } else {
      insights.push('Writing a skill from scratch from failure examples is the real workflow. You did it under pressure. That transfers directly.')
    }

    return (
      <div className="sbc-game">
        <div className="sbc-results">
          <div className="sbc-results-score-row">
            <span className="sbc-results-score">{totalScore}</span>
            <span className="sbc-results-max">/ 27</span>
          </div>
          <span className="sbc-results-band" style={{ background: `${band.color}18`, color: band.color, borderColor: band.color }}>
            {band.label}
          </span>

          <div className="sbc-results-breakdown">
            <div className="sbc-section-title">Round Breakdown</div>
            <table className="sbc-breakdown-table">
              <thead>
                <tr><th>Round</th><th>Score</th><th>Key lesson</th></tr>
              </thead>
              <tbody>
                {ROUNDS.map((round, i) => (
                  <tr key={i}>
                    <td>R{i + 1}</td>
                    <td className="sbc-score-cell">{roundScores[i] ?? 0} / 9</td>
                    <td>{round.exampleLesson}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sbc-results-insights">
            <div className="sbc-section-title">What Made the Difference</div>
            {insights.map((text, i) => (
              <div key={i} className="sbc-insight-card">{text}</div>
            ))}
          </div>

          <div className="sbc-results-best">Your best: {best} / 27</div>

          <div className="sbc-concept-pills">
            {CONCEPT_PILLS.map(pill => (
              <span key={pill} className="sbc-concept-pill">{pill}</span>
            ))}
          </div>

          <div className="sbc-results-actions">
            <button className="sbc-btn-primary" onClick={handleReset}>Play Again</button>
            <button className="sbc-btn-secondary" onClick={() => onSwitchTab('claude-skills')}>
              Go deeper in the Skills tutorial &rarr;
            </button>
          </div>

          <SuggestedModules currentModuleId="skill-builder-challenge" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ── Game screen ───────────────────────────────────────── */

  const round = ROUNDS[currentRound]
  const totalSoFar = roundScores.reduce((a, b) => a + b, 0)

  return (
    <div className="sbc-game">
      <div className="sbc-round-header">
        <div className="sbc-round-badges">
          <span className="sbc-round-badge">Round {currentRound + 1} of 3</span>
          <span className="sbc-difficulty-badge" style={{ color: round.difficultyColor, borderColor: round.difficultyColor }}>
            {round.difficulty}
          </span>
        </div>
        <span className="sbc-score-display">Score: {totalSoFar} / 27</span>
      </div>

      <div className="sbc-layout">
        {/* Left: Situation + Failing output */}
        <div className="sbc-left">
          <div className="sbc-situation">
            <span className="sbc-situation-label">Situation:</span>
            <p className="sbc-situation-text">{round.situation}</p>
          </div>

          <div className="sbc-failing-output">
            <span className="sbc-failing-label">Claude&rsquo;s Current Output</span>
            <pre className="sbc-output-text">{round.failingOutput}</pre>
          </div>

          <div className="sbc-error-list">
            {round.errorNotes.map((note, i) => (
              <span key={i} className="sbc-error-note">
                <CrossIcon size={10} color="#EF4444" />
                {note}
              </span>
            ))}
          </div>

          <div className="sbc-task">
            <span className="sbc-task-label">Your task:</span>
            <div className="sbc-task-text">{round.task}</div>
          </div>
        </div>

        {/* Right: Editor + Results */}
        <div className="sbc-right">
          <div className="sbc-editor">
            <div className="sbc-editor-header">
              <span>Your SKILL.md</span>
            </div>

            {round.editorMode === 'rules-only' && round.lockedSkill && (
              <div className="sbc-editor-locked">
                <pre>{round.lockedSkill}</pre>
              </div>
            )}

            {round.editorMode === 'rules-only' && (
              <div className="sbc-editor-divider">
                <span>{round.editableLabel}</span>
              </div>
            )}

            <div className="sbc-editor-editable">
              <textarea
                value={editorContent}
                onChange={e => setEditorContent(e.target.value)}
                placeholder={round.placeholder || ''}
                disabled={roundPhase !== 'edit'}
                rows={round.editorMode === 'rules-only' ? 6 : 16}
                spellCheck={false}
                aria-label="Your SKILL.md"
              />
            </div>
          </div>

          {round.hasHint && roundPhase === 'edit' && (
            <div className="sbc-helper">
              {!showHint ? (
                <button className="sbc-helper-toggle" aria-expanded={showHint} onClick={() => { setShowHint(true); setHintUsed(true); hintUsedRef.current = true }}>
                  Show hint (&minus;5 points)
                </button>
              ) : (
                <div className="sbc-helper-content">
                  <p className="sbc-helper-heading">The review should:</p>
                  <ul className="sbc-helper-list">
                    {round.hintItems.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {roundPhase === 'edit' && (
            <button className="sbc-submit" onClick={handleSubmit} disabled={!editorContent.trim()}>
              Run Test Cases
            </button>
          )}

          {roundPhase === 'testing' && !testResults && (
            <div className="sbc-testing-loading">
              <span>Testing your skill</span>
              <span className="sbc-dots">
                <span className="sbc-dot" />
                <span className="sbc-dot" />
                <span className="sbc-dot" />
              </span>
            </div>
          )}

          {testResults && (
            <div className="sbc-test-results">
              {testResults.map((test, i) => (
                i < visibleTests && (
                  <div
                    key={i}
                    className={`sbc-test-row ${test.criteria.every(c => c.passed) ? 'sbc-test-pass' : 'sbc-test-fail'}`}
                  >
                    <div className="sbc-test-header">
                      <span className="sbc-test-num">Test {i + 1}</span>
                      <span className={`sbc-test-badge ${test.criteria.every(c => c.passed) ? 'pass' : 'fail'}`}>
                        {test.criteria.every(c => c.passed) ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="sbc-test-prompt">{test.prompt}</div>
                    {test.description && <div className="sbc-test-desc">{test.description}</div>}
                    <div className="sbc-test-criteria">
                      {test.criteria.map((c, j) => (
                        <div key={j} className={`sbc-criterion ${c.passed ? 'passed' : 'failed'}`}>
                          {c.passed ? <CheckIcon size={12} color="#34C759" /> : <CrossIcon size={12} color="#EF4444" />}
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {roundPhase === 'results' && (
            <div className="sbc-round-complete">
              <div className="sbc-round-score">{deriveRoundScore()} / 9</div>
              <div className="sbc-round-lesson">{round.exampleLesson}</div>

              <button className="sbc-example-toggle" aria-expanded={showExample} onClick={() => setShowExample(!showExample)}>
                {showExample ? 'Hide' : 'See'} the example solution
              </button>

              {showExample && (
                <div className="sbc-example-solution">
                  <pre>{round.exampleSolution}</pre>
                </div>
              )}

              <button className="sbc-btn-primary sbc-next-btn" onClick={handleNextRound}>
                {currentRound < ROUNDS.length - 1
                  ? <>Round {currentRound + 2} &rarr;</>
                  : <>See Results &rarr;</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SkillBuilderChallenge
