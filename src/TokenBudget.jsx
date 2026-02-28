import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon, CrossIcon, TipIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import './TokenBudget.css'

/* ══════════════════════════════════════
   LEVEL CONFIGURATIONS
   ══════════════════════════════════════ */

const LEVELS = [
  {
    id: 1,
    name: 'The Bloated Brief',
    learn: 'Removing filler words',
    budget: 40,
    original:
      "Hello! I was wondering if you could please help me out today by writing a short little summary that is maybe around 3 sentences or so about the topic of climate change and its effects on the world and what we can do about it? Thank you so much in advance, I really appreciate it!",
    task: 'Get a 3-sentence climate change summary with causes and solutions.',
    requirements: [
      { label: '3 sentences specified', keywords: ['3 sentence', '3-sentence', 'three sentence'], pattern: /\b3\b[\s\S]*?\bsentence/i },
      { label: 'Climate change mentioned', keywords: ['climate change', 'climate'], pattern: /climate[\s]*(change)?/i },
      { label: 'Solutions/actions included', keywords: ['solution', 'action', 'what we can do', 'fix', 'combat', 'address', 'prevent', 'reduce', 'mitigate'], pattern: /\b(solution|action|fix|combat|address|prevent|reduce|mitigate|fight|tackle|counteract)\b/i },
    ],
    hint: "Remove all pleasantries. AI doesn't need thank yous. Be direct.",
    lesson:
      "Pleasantries, filler words, and hedging ('maybe', 'kind of', 'if you could') waste tokens without adding value. AI doesn't need to be thanked — it needs clear instructions.",
    modelSolution: 'Summarize climate change in 3 sentences: causes, effects, and solutions.',
  },
  {
    id: 2,
    name: 'Say It Once',
    learn: 'Removing repetition',
    budget: 35,
    original:
      "Please write a professional email. The email should be professional in tone and written in a professional way. Make sure the email sounds professional and uses professional language throughout the entire email. The email is for a job application. It's a job application email.",
    task: 'Get a professional job application email.',
    requirements: [
      { label: 'Professional tone specified', keywords: ['professional'], pattern: /professional/i },
      { label: 'Job application purpose', keywords: ['job application', 'job', 'application', 'apply'], pattern: /\b(job|application|apply|position|employment|role|opening)\b/i },
      { label: 'Email format', keywords: ['email'], pattern: /email/i },
    ],
    hint: "If you said it once, don't say it again. Every repeated word is a wasted token.",
    lesson:
      'Repetition is the most common prompt mistake. State each requirement once, clearly. AI reads everything — saying it 5 times doesn\'t make it more likely to comply.',
    modelSolution: 'Write a professional job application email.',
  },
  {
    id: 3,
    name: 'Structure It',
    learn: 'Using format to replace words',
    budget: 30,
    original:
      "Can you give me a list of things? I want the list to have exactly 5 items on it. The items in the list should be numbered from 1 to 5. Each item should have a title that is bold, and then after the title there should be a brief explanation of about one sentence describing the item. The topic I want the list to cover is productivity tips for remote work.",
    task: 'Get 5 numbered productivity tips with bold titles and one-sentence explanations.',
    requirements: [
      { label: 'Exactly 5 items', keywords: ['5', 'five'], pattern: /\b(5|five)\b/i },
      { label: 'Numbered/list format', keywords: ['number', 'list', 'numbered'], pattern: /\b(number|list|numbered|ordered)\b/i },
      { label: 'Bold titles', keywords: ['bold', '**'], pattern: /(\bbold\b|\*\*)/i },
      { label: 'One-sentence descriptions', keywords: ['one sentence', '1 sentence', 'brief', 'description'], pattern: /\b(one[\s-]?sentence|1[\s-]?sentence|brief|description|explain)\b/i },
    ],
    hint: <>Show the format, don&apos;t describe it in words. &lsquo;<strong>bold</strong>&rsquo; is cheaper than &lsquo;make it bold&rsquo;.</>,
    lesson:
      "Format instructions are cheaper when shown rather than described. Saying 'bold title' is shorter and clearer than explaining the format in a full sentence.",
    modelSolution: 'List 5 remote work productivity tips. Format: numbered, bold title: one sentence.',
  },
  {
    id: 4,
    name: 'Essential Context Only',
    learn: 'Identifying essential vs redundant context',
    budget: 45,
    original:
      "I run a small business that sells handmade candles. I started the business in 2019, before COVID happened. During COVID we had to pivot to online sales. We have about 12 employees and we're based in Austin, Texas. Our revenue last year was around $450,000. We sell mostly on Etsy and also have our own website. I'm trying to grow the business. Could you write me a short Instagram bio for my candle business? Just 2 sentences please.",
    task: 'Get a 2-sentence Instagram bio for a handmade candle small business.',
    requirements: [
      { label: 'Handmade candles mentioned', keywords: ['handmade candle', 'candle', 'handmade'], pattern: /\b(handmade|candle)\b/i },
      { label: 'Small business mentioned', keywords: ['small business', 'business'], pattern: /\bbusiness\b/i },
      { label: '2 sentences exactly', keywords: ['2 sentence', '2-sentence', 'two sentence'], pattern: /\b(2|two)\b[\s\S]*?\bsentence/i },
      { label: 'Instagram bio format', keywords: ['instagram', 'bio'], pattern: /\b(instagram|bio)\b/i },
    ],
    hint: "Would the AI's answer change if you removed this detail? If not, cut it.",
    lesson:
      "Context only helps if it changes the output. Revenue, founding year, employee count — none of that affects an Instagram bio. Only include context that directly shapes the answer you need.",
    modelSolution: 'Write a 2-sentence Instagram bio for a small handmade candle business.',
  },
  {
    id: 5,
    name: 'The Ultimate Compression',
    learn: 'Combining all techniques',
    budget: 25,
    original:
      "Hi there! So I was thinking, and I hope this isn't too much to ask, but I was wondering if maybe you could help me write something for me? What I need is a really good, high quality, well-written title for an article. The article is about artificial intelligence and specifically about how artificial intelligence and AI tools are changing and transforming and revolutionizing the way that people who work in marketing and the marketing industry do their jobs and their work on a day to day basis. I would love if the title could be catchy and engaging and attention-grabbing. I need just one title please, not multiple titles, just one single title. Thank you so much!",
    task: 'Get one catchy article title about AI transforming marketing.',
    requirements: [
      { label: 'One title only', keywords: ['one title', '1 title', 'single title', 'a title'], pattern: /\b(one|1|single|a)\b[\s\S]*?\btitle\b/i },
      { label: 'AI + marketing topic', keywords: ['ai', 'artificial intelligence', 'marketing'], pattern: /\b(ai|artificial[\s-]?intelligence)\b/i },
      { label: 'Catchy/engaging tone', keywords: ['catchy', 'engaging', 'attention', 'creative', 'compelling'], pattern: /\b(catchy|engaging|attention|creative|compelling|punchy|bold|striking)\b/i },
    ],
    hint: 'Count every word. Does it earn its place?',
    lesson:
      "Master prompt engineers think in tokens. Every word is a cost. The best prompt is the shortest one that still gets exactly what you need. You just saved over a hundred tokens — multiply that by millions of API calls and you've saved a fortune.",
    modelSolution: 'Write one catchy article title: AI transforming marketing.',
  },
]

/* ══════════════════════════════════════
   QUALITY EVALUATION ENGINE
   ══════════════════════════════════════ */

function estimateTokens(text) {
  return Math.ceil(text.trim().length / 4)
}

function evaluateRewrite(rewrite, level) {
  const text = rewrite.trim()
  const checks = level.requirements.map((req) => ({
    label: req.label,
    passed:
      req.keywords.some((kw) => text.toLowerCase().includes(kw.toLowerCase())) ||
      (req.pattern ? req.pattern.test(text) : false),
  }))

  const allPassed = checks.every((c) => c.passed)
  const tokenCount = estimateTokens(text)
  const underBudget = tokenCount <= level.budget

  return { checks, allPassed, underBudget, tokenCount }
}

/* ══════════════════════════════════════
   CONFETTI PARTICLES
   ══════════════════════════════════════ */

function Confetti() {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1 + Math.random() * 1.5,
    color: ['#34C759', '#0071E3', '#F59E0B', '#AF52DE'][i % 4],
  })), [])

  return (
    <div className="tb-confetti">
      {particles.map((p) => (
        <div
          key={p.id}
          className="tb-confetti-particle"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

function TokenBudget({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  const [started, setStarted] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [rewriteText, setRewriteText] = useState('')
  const [evaluation, setEvaluation] = useState(null)
  const [evaluating, setEvaluating] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [usedSolution, setUsedSolution] = useState(false)
  const [levelResults, setLevelResults] = useState([])
  const [gameComplete, setGameComplete] = useState(false)
  const [totalSaved, setTotalSaved] = useState(0)

  const gameRef = useRef(null)
  const levelBarRef = useRef(null)
  const evalTimerRef = useRef(null)
  const [announcement, setAnnouncement] = useState('')

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

  useEffect(() => {
    return () => {
      if (evalTimerRef.current) clearTimeout(evalTimerRef.current)
    }
  }, [])

  // Reset announcement so repeated identical announcements still trigger aria-live
  useEffect(() => {
    if (!announcement) return
    const t = setTimeout(() => setAnnouncement(''), 1000)
    return () => clearTimeout(t)
  }, [announcement])

  const level = LEVELS[currentLevel]
  const originalTokens = level ? estimateTokens(level.original) : 0
  const currentTokens = estimateTokens(rewriteText)
  const effectiveBudget = level ? level.budget : 0
  const tokensOverBudget = currentTokens - effectiveBudget
  const isOverBudget = tokensOverBudget > 0
  const savedTokens = originalTokens - currentTokens
  const budgetPct = effectiveBudget > 0 ? Math.min((currentTokens / effectiveBudget) * 100, 100) : 0

  const budgetColor = isOverBudget ? '#FF3B30' : tokensOverBudget > -5 ? '#FF9500' : savedTokens > originalTokens * 0.8 ? '#0071E3' : '#34C759'

  useEffect(() => {
    if (started) return
    setVisibleLines(0)
    const t1 = setTimeout(() => setVisibleLines(1), 300)
    const t2 = setTimeout(() => setVisibleLines(2), 600)
    const t3 = setTimeout(() => setVisibleLines(3), 900)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [started])

  /* ── Handlers ── */

  const handleStart = useCallback(() => {
    setStarted(true)
    markModuleStarted('token-budget')
  }, [markModuleStarted])

  const handleSubmit = useCallback(() => {
    if (isOverBudget || !rewriteText.trim()) return

    setEvaluating(true)
    setEvaluation(null)

    evalTimerRef.current = setTimeout(() => {
      const result = evaluateRewrite(rewriteText, level)
      setEvaluation(result)
      setEvaluating(false)

      if (result.allPassed && result.underBudget) {
        const saved = originalTokens - result.tokenCount
        setTotalSaved((prev) => prev + saved)
        setLevelResults((prev) => [
          ...prev,
          {
            levelId: level.id,
            name: level.name,
            originalTokens,
            rewriteTokens: result.tokenCount,
            saved,
            reduction: Math.round((1 - result.tokenCount / originalTokens) * 100),
            skipped: usedSolution,
          },
        ])

        if (levelResults.length === 0) {
          markModuleComplete('token-budget')
        }
      }
    }, 800)
  }, [isOverBudget, rewriteText, level, originalTokens, levelResults.length, markModuleComplete, usedSolution])

  const handleNextLevel = useCallback(() => {
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current)
    if (currentLevel < LEVELS.length - 1) {
      const nextLevel = LEVELS[currentLevel + 1]
      setCurrentLevel((prev) => prev + 1)
      setRewriteText('')
      setEvaluation(null)
      setEvaluating(false)
      setShowHint(false)
      setHintUsed(false)
      setShowSolution(false)
      setUsedSolution(false)
      setAnnouncement(`Level ${nextLevel.id}: ${nextLevel.name}`)
      scrollToTop()
      requestAnimationFrame(() => levelBarRef.current?.focus())
    } else {
      setGameComplete(true)
      setAnnouncement('All levels complete!')
      scrollToTop()
    }
  }, [currentLevel])

  const handleHint = useCallback(() => {
    if (!hintUsed) {
      setShowHint(true)
      setHintUsed(true)
    }
  }, [hintUsed])

  const handleShowSolution = useCallback(() => {
    setShowSolution(true)
    setUsedSolution(true)
    setRewriteText(level.modelSolution)
    setEvaluation(null)
  }, [level])

  const handleReset = useCallback(() => {
    if (evalTimerRef.current) clearTimeout(evalTimerRef.current)
    setCurrentLevel(0)
    setRewriteText('')
    setEvaluation(null)
    setEvaluating(false)
    setShowHint(false)
    setHintUsed(false)
    setShowSolution(false)
    setUsedSolution(false)
    setLevelResults([])
    setGameComplete(false)
    setTotalSaved(0)
    setAnnouncement('Level 1: The Bloated Brief')
    scrollToTop()
  }, [])

  /* ── Entry Screen ── */

  if (!started) {
    return (
      <div className="tb-entry-wrap">
        <EntryScreen
          icon={<ModuleIcon module="token-budget" size={64} style={{ color: '#F59E0B' }} />}
          title="Token Budget"
          taglines={['Same output.', 'Fewer tokens.', 'Lower cost.']}
          visibleLines={visibleLines}
          description="Every word you send to an AI costs money. In 5 increasingly brutal challenges, rewrite prompts to fit a shrinking token budget — without losing a single drop of quality. This is how pros think."
          buttonText="Start Saving"
          buttonClassName="entry-screen-btn-game"
          onStart={handleStart}
        >
          <div className="tb-entry-meta">5 levels &middot; Gets harder fast</div>
          <div className="tb-entry-meters">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="tb-entry-meter">
                <div className="tb-entry-meter-fill" />
              </div>
            ))}
          </div>
        </EntryScreen>
      </div>
    )
  }

  /* ── Completion Screen ── */

  if (gameComplete) {
    const avgReduction = levelResults.length > 0 ? Math.round(levelResults.reduce((sum, r) => sum + r.reduction, 0) / levelResults.length) : 0

    const costSaved = ((totalSaved / 1000) * 0.002).toFixed(4)

    let rank, rankTitle
    if (avgReduction >= 95) {
      rank = 'surgeon'
      rankTitle = 'Token Surgeon'
    } else if (avgReduction >= 85) {
      rank = 'optimizer'
      rankTitle = 'Prompt Optimizer'
    } else if (avgReduction >= 75) {
      rank = 'aware'
      rankTitle = 'Budget Aware'
    } else {
      rank = 'conscious'
      rankTitle = 'Cost Conscious'
    }

    return (
      <div className="tb-game" ref={gameRef}>
        <div className="tb-complete">
          <Confetti />
          <h2 className="tb-complete-title">Budget Mastered.</h2>
          <p className="tb-complete-subtitle">You think like a prompt engineer now.</p>

          <div className="tb-complete-stats">
            <div className="tb-stat">
              <span className="tb-stat-value tb-stat-green">{totalSaved}</span>
              <span className="tb-stat-label">Tokens saved</span>
            </div>
            <div className="tb-stat">
              <span className="tb-stat-value tb-stat-green">{avgReduction}%</span>
              <span className="tb-stat-label">Avg reduction</span>
            </div>
            <div className="tb-stat">
              <span className="tb-stat-value tb-stat-blue">${costSaved}</span>
              <span className="tb-stat-label">Saved per 1M calls</span>
            </div>
          </div>

          <div className={`tb-rank tb-rank-${rank}`}>
            <span className="tb-rank-label">Efficiency Rank</span>
            <span className="tb-rank-title">{rankTitle}</span>
          </div>

          <div className="tb-complete-chart">
            {(() => {
              const chartMax = Math.max(...levelResults.map((r) => r.originalTokens))
              return levelResults.map((r) => (
                <div key={r.levelId} className="tb-chart-row">
                  <span className="tb-chart-label">L{r.levelId}</span>
                  <div className="tb-chart-bars">
                    <div className="tb-chart-bar tb-chart-original" style={{ width: `${(r.originalTokens / chartMax) * 100}%` }}>
                      <span>{r.originalTokens}</span>
                    </div>
                    <div className="tb-chart-bar tb-chart-rewrite" style={{ width: `${(r.rewriteTokens / chartMax) * 100}%` }}>
                      <span>{r.rewriteTokens}</span>
                    </div>
                  </div>
                  <span className="tb-chart-pct">
                    -{r.reduction}%{r.skipped ? ' *' : ''}
                  </span>
                </div>
              ))
            })()}
          </div>

          <div className="tb-complete-lessons">
            <h3 className="tb-lessons-title">What you learned</h3>
            {LEVELS.map((l) => {
              const result = levelResults.find((r) => r.levelId === l.id)
              const skipped = result?.skipped
              return (
                <div key={l.id} className="tb-lesson-item">
                  <CheckIcon size={16} color={skipped ? 'var(--text-tertiary)' : '#34C759'} />
                  <span className={skipped ? 'tb-lesson-skipped' : ''}>
                    {l.learn} — Level {l.id}{skipped ? ' (used solution)' : ''}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="tb-complete-actions">
            <button className="tb-btn-primary" onClick={handleReset}>
              Optimize Again
            </button>
            <button className="tb-btn-outline" onClick={onGoHome}>
              Back to Home
            </button>
          </div>

          <SuggestedModules currentModuleId="token-budget" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ── Game Screen ── */

  const passed = evaluation && evaluation.allPassed && evaluation.underBudget

  return (
    <div className="tb-game" ref={gameRef}>
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</div>

      {/* Level header bar */}
      <div className="tb-level-bar" ref={levelBarRef} tabIndex={-1}>
        <div className="tb-level-badge">
          LEVEL {String(level.id).padStart(2, '0')} / 05
        </div>
        <span className="tb-level-name">{level.name}</span>
        <div className="tb-level-meter">
          <div
            className="tb-level-meter-fill"
            style={{
              width: `${budgetPct}%`,
              backgroundColor: budgetColor,
            }}
          />
        </div>
        <div className="tb-level-saved" style={{ color: savedTokens > 0 ? '#34C759' : 'var(--text-tertiary)' }}>
          Tokens saved: {Math.max(0, savedTokens)}
        </div>
      </div>

      {/* Split panels */}
      <div className="tb-panels">
        {/* Left: Original prompt */}
        <div className="tb-panel-original">
          <div className="tb-panel-label">ORIGINAL PROMPT</div>
          <div className="tb-original-box">
            <code>{level.original}</code>
          </div>
          <span className="tb-token-pill tb-token-red">{originalTokens} tokens</span>

          <div className="tb-mission-box">
            <div className="tb-mission-title">YOUR MISSION:</div>
            <p className="tb-mission-text">{level.task}</p>
          </div>

          <div className="tb-requirements">
            {level.requirements.map((req, i) => {
              const check = evaluation?.checks?.[i]
              const isPassed = check?.passed
              return (
                <div key={i} className="tb-req-item">
                  {isPassed ? <CheckIcon size={14} color="#34C759" /> : <CheckIcon size={14} color="var(--text-tertiary)" />}
                  <span className={isPassed ? 'tb-req-passed' : ''}>{req.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Rewrite workspace */}
        <div className="tb-panel-rewrite">
          <div className="tb-panel-label">YOUR REWRITE</div>
          <textarea
            className="tb-textarea"
            value={rewriteText}
            onChange={(e) => {
              setRewriteText(e.target.value)
              setEvaluation(null)
              setEvaluating(false)
            }}
            placeholder="Rewrite the prompt here..."
            disabled={!!passed}
            maxLength={2000}
            aria-label="Your rewritten prompt"
          />

          {/* Live token counter */}
          <div className="tb-counter">
            <div className="tb-counter-row">
              <span className="tb-counter-label">Current</span>
              <span className="tb-counter-value" style={{ color: isOverBudget ? '#FF3B30' : 'var(--text-primary)' }}>
                {currentTokens} tokens
              </span>
            </div>
            <div className="tb-counter-row">
              <span className="tb-counter-label">Budget</span>
              <span className="tb-counter-value">{effectiveBudget} tokens</span>
            </div>
            <div className="tb-counter-row">
              <span className="tb-counter-label">Saved</span>
              <span className="tb-counter-value" style={{ color: savedTokens > 0 ? '#34C759' : 'var(--text-tertiary)' }}>
                {savedTokens > 0 ? `${savedTokens} tokens` : '—'}
              </span>
            </div>
          </div>

          {/* Budget progress bar */}
          <div className="tb-budget-bar">
            <div
              className={`tb-budget-fill${isOverBudget ? ' tb-budget-over' : ''}`}
              style={{
                width: `${Math.min(budgetPct, 100)}%`,
                backgroundColor: budgetColor,
              }}
            />
          </div>

          {/* Submit */}
          <button
            className={`tb-submit${isOverBudget || !rewriteText.trim() ? ' tb-submit-disabled' : ''}`}
            onClick={handleSubmit}
            disabled={isOverBudget || !rewriteText.trim() || evaluating || !!passed}
          >
            {evaluating ? 'Checking...' : 'Check My Rewrite \u2192'}
          </button>

          {/* Hint */}
          {!passed && !showHint && (
            <button className="tb-hint-btn" onClick={handleHint}>
              <TipIcon size={14} color="#eab308" />
              Need a hint?
            </button>
          )}

          {showHint && !passed && (
            <div className="tb-hint-box">
              <TipIcon size={14} color="#eab308" />
              <span>{level.hint}</span>
            </div>
          )}

          {/* Show solution — appears after hint is used */}
          {!passed && showHint && !showSolution && (
            <button className="tb-hint-btn tb-solution-btn" onClick={handleShowSolution}>
              Still stuck? Show model solution
            </button>
          )}

          {showSolution && !passed && (
            <div className="tb-solution-box">
              <div className="tb-solution-label">MODEL SOLUTION</div>
              <code className="tb-solution-text">{level.modelSolution}</code>
              <span className="tb-solution-tokens">{estimateTokens(level.modelSolution)} tokens</span>
              <p className="tb-solution-note">This has been copied to your workspace. Hit "Check My Rewrite" to continue, or edit it first.</p>
            </div>
          )}

          {/* Evaluation result */}
          {evaluating && (
            <div className="tb-eval tb-eval-pending">
              <div className="tb-eval-dots">
                Checking quality
                <span className="tb-dots-anim">...</span>
              </div>
            </div>
          )}

          {evaluation && !evaluating && (
            <div className={`tb-eval ${passed ? 'tb-eval-pass' : 'tb-eval-fail'}`} role="status" aria-live="polite">
              {passed ? (
                <>
                  <Confetti />
                  <div className="tb-eval-header">
                    <CheckIcon size={18} color="#34C759" />
                    <span>Quality preserved!</span>
                  </div>
                  <div className="tb-eval-checks">
                    {evaluation.checks.map((c, i) => (
                      <div key={i} className="tb-eval-check">
                        <CheckIcon size={14} color="#34C759" />
                        <span>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="tb-eval-savings">
                    You saved {savedTokens} tokens! ({Math.round((1 - currentTokens / originalTokens) * 100)}% reduction)
                  </div>
                  <div className="tb-eval-lesson">
                    <TipIcon size={14} color="#eab308" />
                    <span>{level.lesson}</span>
                  </div>
                  <button className="tb-btn-primary" onClick={handleNextLevel}>
                    {currentLevel < LEVELS.length - 1 ? 'Next Level \u2192' : 'See Results \u2192'}
                  </button>
                </>
              ) : (
                <>
                  <div className="tb-eval-header">
                    <CrossIcon size={18} color="#FF3B30" />
                    <span>Quality lost!</span>
                  </div>
                  <div className="tb-eval-checks">
                    {evaluation.checks.map((c, i) => (
                      <div key={i} className="tb-eval-check">
                        {c.passed ? <CheckIcon size={14} color="#34C759" /> : <CrossIcon size={14} color="#FF3B30" />}
                        <span className={c.passed ? '' : 'tb-check-failed'}>{c.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="tb-eval-retry">Fix the missing requirements and try again.</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TokenBudget
