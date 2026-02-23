import { useState, useCallback, useRef, useEffect } from 'react'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import SuggestedModules from './SuggestedModules.jsx'
import { CheckIcon } from './ContentIcons.jsx'
import { useAuth } from './AuthContext'
import './AIEthicsTribunal.css'

/* ══════════════════════════════════════
   CASE DATA — 6 REAL-WORLD AI DILEMMAS
   ══════════════════════════════════════ */

const CASES = [
  {
    id: 1,
    name: 'The Resume Filter',
    label: 'THE HIRING ALGORITHM',
    facts: 'A Fortune 500 company uses an AI to screen 50,000 job applications per year. The AI was trained on 10 years of successful hire data. An audit reveals the AI scores candidates from certain universities 40% higher, regardless of qualifications. The company argues removing the AI would mean slower hiring and more human bias. Critics argue the AI perpetuates historical discrimination.',
    parties: { favor: 'The Company', against: 'Job Applicants' },
    inFavor: [
      'Processes 50,000 applications faster than any human team could',
      'Applies consistent criteria to every candidate',
      'Human recruiters show documented bias too',
      'Company can audit and adjust AI over time',
    ],
    against: [
      'Trained on historically biased hiring data',
      'Actively disadvantages qualified candidates',
      'Bias is systematic and affects thousands',
      'Speed does not justify discrimination',
    ],
    evidence: [
      { text: '40% score gap between university groups' },
      { text: 'Human recruiters show 25% bias in studies' },
      { text: 'AI processes each application in 0.3 seconds' },
    ],
    realOutcome: 'Amazon scrapped a similar system in 2018 after discovering it penalized resumes containing the word "women\'s" (as in "women\'s chess club"). Most experts now recommend AI as a screening assist, not a final decision maker.',
    whyDebated: 'Some argue improved AI with diverse training data could be fairer than humans. Others argue consequential decisions need human accountability.',
    teaches: 'Training data bias, algorithmic fairness, human-AI collaboration in high-stakes decisions.',
  },
  {
    id: 2,
    name: 'The AI Doctor',
    label: 'THE MEDICAL DIAGNOSIS',
    facts: 'A hospital deploys an AI that diagnoses skin cancer from photos with 94.5% accuracy \u2014 higher than the average dermatologist at 86.6%. The AI was trained mostly on images of light skin. On darker skin tones, accuracy drops to 78%. The hospital serves a diverse population.',
    parties: { favor: 'The Hospital', against: 'Patient Advocates' },
    inFavor: [
      '94.5% accuracy saves lives on average',
      'More accessible than specialist appointments',
      'Augments overworked doctors',
      'Better than no screening for underserved areas',
    ],
    against: [
      '78% accuracy on dark skin is dangerous',
      'Unequal care based on race is unethical',
      'Medical decisions require full accuracy',
      'Could create false confidence in misdiagnoses',
    ],
    evidence: [
      { text: '94.5% accuracy on light skin tones' },
      { text: '78% accuracy on dark skin tones' },
      { text: 'Average specialist wait time: 3 months' },
    ],
    realOutcome: 'FDA approved several AI diagnostic tools with requirements for diverse validation datasets. Most medical AI now requires mandatory bias testing across demographic groups before deployment.',
    whyDebated: 'Some argue imperfect AI is better than no screening for underserved communities. Others argue deploying unequal care tools violates medical ethics fundamentally.',
    teaches: 'Dataset diversity, algorithmic fairness across demographics, medical AI ethics.',
  },
  {
    id: 3,
    name: 'Safety vs Privacy',
    label: 'THE SURVEILLANCE CITY',
    facts: 'A city installs AI facial recognition cameras at 500 intersections. In the first year: violent crime drops 31%, missing persons cases solved up 60%. The system also incorrectly identified 47 innocent people as suspects, two of whom were briefly detained. Civil liberties groups demand removal.',
    parties: { favor: 'City Government', against: 'Civil Liberties Groups' },
    inFavor: [
      '31% violent crime reduction is significant',
      '60% improvement in missing persons cases',
      'Deters crime before it happens',
      'Cities have always used CCTV cameras',
    ],
    against: [
      '47 false identifications in one year',
      'Two wrongful detentions of innocent people',
      'Mass surveillance changes behavior of all citizens',
      'Disproportionate impact on minority communities in facial recognition accuracy',
    ],
    evidence: [
      { text: '31% violent crime reduction' },
      { text: '47 incorrect identifications' },
      { text: 'Facial recognition: 99% accuracy on some demographics, 65% on others' },
    ],
    realOutcome: 'San Francisco, Boston, and Portland banned government use of facial recognition. Other cities expanded programs. No consensus exists. EU AI Act classifies mass surveillance AI as high-risk with strict limitations.',
    whyDebated: 'Crime reduction is real and significant. Civil liberties concerns are equally real. Different communities weigh these differently based on their own experiences.',
    teaches: 'Privacy vs safety tradeoffs, demographic accuracy gaps, governance of AI.',
  },
  {
    id: 4,
    name: 'Who Decides What\'s True?',
    label: 'THE CONTENT MODERATOR',
    facts: 'A social platform uses AI to moderate 500 million posts per day \u2014 more than any human team could review. The AI removes content flagged as misinformation. In one month: it correctly removed 2.3M harmful posts. It also incorrectly removed 180,000 legitimate posts including news articles, satire, and political speech. Appeals take 3 weeks.',
    parties: { favor: 'Platform Safety Team', against: 'Free Speech Advocates' },
    inFavor: [
      '2.3M harmful posts removed protects users',
      'Human moderation is traumatic for workers',
      'Scale makes any other approach impossible',
      'Faster than human review by millions of hours',
    ],
    against: [
      '180,000 legitimate posts silenced',
      'Political speech removal is especially dangerous',
      '3-week appeal process effectively buries content',
      'Who decides what is "misinformation" matters',
    ],
    evidence: [
      { text: '2.3M harmful posts removed correctly' },
      { text: '180,000 legitimate posts incorrectly removed' },
      { text: '0.036% error rate at this scale = millions affected' },
    ],
    realOutcome: 'All major platforms use AI moderation. EU Digital Services Act requires transparent appeals and human review for contested decisions. No platform has solved the false positive problem.',
    whyDebated: 'At internet scale, even tiny error rates affect millions. The alternative \u2014 no moderation \u2014 also causes massive harm. The question is who bears the cost of errors.',
    teaches: 'Scale and error rates, free speech vs safety, transparency and appeals in AI systems.',
  },
  {
    id: 5,
    name: 'Judged by an Algorithm',
    label: 'THE SENTENCING ALGORITHM',
    facts: 'US courts use an AI called COMPAS to help judges determine recidivism risk \u2014 the likelihood a defendant will reoffend. Scores influence bail, sentencing, and parole decisions. A ProPublica investigation found the AI was twice as likely to falsely flag Black defendants as high risk compared to white defendants. The company disputed the methodology.',
    parties: { favor: 'Justice System Modernizers', against: 'Criminal Justice Reformers' },
    inFavor: [
      'Human judges show documented racial bias too',
      'Structured risk assessment adds consistency',
      'Judges can override \u2014 it is advisory only',
      'Could be improved with better data',
    ],
    against: [
      'Racial disparity in false positives is severe',
      'Defendants cannot see or challenge the algorithm',
      'Criminal justice must be explainable',
      'Advisory tools become de facto decisions',
    ],
    evidence: [
      { text: '2x false positive rate for Black defendants' },
      { text: 'Human judges also show documented racial bias' },
      { text: 'Used in sentencing decisions in 25+ states' },
    ],
    realOutcome: 'COMPAS is still widely used. Wisconsin Supreme Court ruled it constitutional if not used as the sole factor. EU AI Act would likely classify judicial AI as high-risk requiring full transparency.',
    whyDebated: 'Replacing human bias with AI bias does not solve the underlying problem. But removing all AI leaves only human bias. Neither option is obviously better.',
    teaches: 'Algorithmic accountability, criminal justice AI, explainability requirements, the limits of bias removal.',
  },
  {
    id: 6,
    name: 'Who Is Responsible?',
    label: 'THE AUTONOMOUS DECISION',
    facts: 'An autonomous AI trading system makes a series of trades in 14 minutes that destabilizes a regional bank, causing $2.1B in losses and affecting 340,000 account holders. No human approved the trades. The AI acted within its programmed parameters. The bank, the AI company, and the regulators all dispute responsibility.',
    parties: { favor: 'AI Trading Proponents', against: 'Financial Regulators' },
    inFavor: [
      'Human traders caused the 2008 financial crisis',
      'Speed of AI prevents worse human-caused crashes',
      'AI acted within approved parameters as designed',
      'Markets need speed that only AI can provide',
    ],
    against: [
      'No human accountability means no real accountability',
      '340,000 people harmed with no one to blame',
      'Speed without oversight is dangerous at scale',
      'Programmed parameters failed to anticipate reality',
    ],
    evidence: [
      { text: '$2.1B in losses in 14 minutes' },
      { text: '340,000 account holders affected' },
      { text: 'Similar: 2010 Flash Crash caused by algorithms' },
    ],
    realOutcome: 'The 2010 Flash Crash led to new circuit breakers requiring human approval above trade thresholds. Most jurisdictions now require human oversight for consequential autonomous AI decisions.',
    whyDebated: 'Defining "consequential" is hard. Markets move faster than humans can approve. The question of legal liability for AI decisions remains largely unresolved globally.',
    teaches: 'AI accountability, autonomous systems, legal liability, human oversight requirements.',
  },
]

/* ══════════════════════════════════════
   HELPER: SVG SCALES
   ══════════════════════════════════════ */

function ScalesOfJustice({ tilt = 0, glow = false, size = 80 }) {
  const leftY = 14 + tilt * 3
  const rightY = 14 - tilt * 3
  return (
    <svg
      className={`aet-scales-svg${glow ? ' aet-scales-glow' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pillar */}
      <line x1="24" y1="8" x2="24" y2="40" />
      {/* Base */}
      <line x1="16" y1="40" x2="32" y2="40" />
      {/* Beam */}
      <line x1="8" y1={10 + tilt * 1.5} x2="40" y2={10 - tilt * 1.5} />
      {/* Left pan chain */}
      <line x1="8" y1={10 + tilt * 1.5} x2="8" y2={leftY} />
      {/* Left pan */}
      <path d={`M2 ${leftY} Q8 ${leftY + 6} 14 ${leftY}`} />
      {/* Right pan chain */}
      <line x1="40" y1={10 - tilt * 1.5} x2="40" y2={rightY} />
      {/* Right pan */}
      <path d={`M34 ${rightY} Q40 ${rightY + 6} 46 ${rightY}`} />
      {/* Crown */}
      <circle cx="24" cy="8" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ══════════════════════════════════════
   HELPER: GAVEL SVG
   ══════════════════════════════════════ */

function GavelSvg({ dropping = false }) {
  return (
    <svg
      className={`aet-gavel-svg${dropping ? ' aet-gavel-drop' : ''}`}
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Gavel head */}
      <rect x="14" y="8" width="20" height="8" rx="2" />
      {/* Handle */}
      <line x1="24" y1="16" x2="24" y2="34" />
      {/* Sound block */}
      <rect x="10" y="36" width="28" height="4" rx="1" />
    </svg>
  )
}

/* ══════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════ */

function AIEthicsTribunal({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()

  const [started, setStarted] = useState(false)
  const [currentCase, setCurrentCase] = useState(0)
  const [verdict, setVerdict] = useState(null) // 'favor' | 'against' | 'deadlock'
  const [reasoning, setReasoning] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [verdicts, setVerdicts] = useState([]) // array of { caseId, verdict, reasoning }
  const [gameComplete, setGameComplete] = useState(false)
  const [gavelDropping, setGavelDropping] = useState(false)
  const [revealStep, setRevealStep] = useState(0) // 0=hidden, 1=gavel, 2=reveal

  const gameRef = useRef(null)
  const revealTimerRef = useRef(null)

  const activeCase = CASES[currentCase]

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
      revealTimerRef.current?.forEach(clearTimeout)
    }
  }, [])

  /* ── Handlers ── */

  const handleStart = useCallback(() => {
    setStarted(true)
    markModuleStarted('ai-ethics-tribunal')
  }, [markModuleStarted])

  const handleSelectVerdict = useCallback((v) => {
    setVerdict(v)
  }, [])

  const handleSubmitVerdict = useCallback(() => {
    if (!verdict) return
    setSubmitted(true)
    setGavelDropping(true)
    setRevealStep(1)

    // Total reveal: gavel (800ms) → banner (400ms) → your verdict (700ms) → real outcome (600ms) → nuance (600ms) → teaches (500ms) → next btn
    const delays = [800, 1200, 1900, 2500, 3100, 3600]
    revealTimerRef.current = []
    delays.forEach((d, i) => {
      revealTimerRef.current.push(
        setTimeout(() => {
          if (i === 0) setGavelDropping(false)
          setRevealStep(i + 2) // steps 2,3,4,5,6,7
        }, d)
      )
    })
  }, [verdict])

  const handleNextCase = useCallback(() => {
    const newVerdicts = [...verdicts, { caseId: activeCase.id, verdict, reasoning }]
    setVerdicts(newVerdicts)

    if (currentCase >= CASES.length - 1) {
      // All cases done
      setGameComplete(true)
      markModuleComplete('ai-ethics-tribunal')
      scrollToTop()
    } else {
      setCurrentCase((prev) => prev + 1)
      setVerdict(null)
      setReasoning('')
      setSubmitted(false)
      setRevealStep(0)
      scrollToTop()
    }
  }, [verdicts, activeCase, verdict, reasoning, currentCase, markModuleComplete])

  const handleReset = useCallback(() => {
    revealTimerRef.current?.forEach(clearTimeout)
    setCurrentCase(0)
    setVerdict(null)
    setReasoning('')
    setSubmitted(false)
    setVerdicts([])
    setGameComplete(false)
    setGavelDropping(false)
    setRevealStep(0)
    scrollToTop()
  }, [])

  /* ── Scale tilt based on verdict selection ── */
  const scaleTilt = verdict === 'favor' ? -1 : verdict === 'against' ? 1 : 0

  /* ── Entry Screen ── */

  if (!started) {
    return (
      <div className="aet-entry-wrap">
        <EntryScreen
          icon={<ModuleIcon module="ai-ethics-tribunal" size={64} style={{ color: '#F59E0B' }} />}
          title="AI Ethics Tribunal"
          subtitle="The hardest questions have no easy answers."
          description="Six real-world AI cases land on your bench. Hear both sides. Weigh the evidence. Deliver your verdict. Then see how the world actually ruled — and why reasonable people still disagree."
          buttonText="Take the Bench"
          onStart={handleStart}
        />
        <div className="aet-entry-meta">6 cases &middot; No wrong answers &middot; Real dilemmas</div>
      </div>
    )
  }

  /* ── Completion Screen ── */

  if (gameComplete) {
    const allVerdicts = [...verdicts]
    const deadlockCount = allVerdicts.filter((v) => v.verdict === 'deadlock').length
    let rank, rankTitle
    if (deadlockCount === 0) {
      rank = 'decisive'
      rankTitle = 'Decisive Judge'
    } else if (deadlockCount <= 2) {
      rank = 'careful'
      rankTitle = 'Careful Jurist'
    } else {
      rank = 'agnostic'
      rankTitle = 'Wise Agnostic'
    }

    return (
      <div className="aet-game" ref={gameRef}>
        <div className="aet-complete">
          <div className="aet-complete-scales">
            <ScalesOfJustice tilt={0} glow size={96} />
          </div>
          <h2 className="aet-complete-title">The Tribunal Adjourns.</h2>
          <p className="aet-complete-subtitle">You&rsquo;ve wrestled with the hardest questions in AI.</p>

          {/* Verdict summary */}
          <div className="aet-verdict-summary">
            {allVerdicts.map((v) => {
              const c = CASES.find((cs) => cs.id === v.caseId)
              return (
                <div key={v.caseId} className="aet-summary-row">
                  <span className="aet-summary-case">Case {String(v.caseId).padStart(2, '0')}: {c.name}</span>
                  <span className={`aet-summary-verdict aet-summary-${v.verdict}`}>
                    {v.verdict === 'favor' ? 'In Favor' : v.verdict === 'against' ? 'Against' : 'Deadlocked'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Judicial rank */}
          <div className={`aet-rank aet-rank-${rank}`}>
            <span className="aet-rank-label">Judicial Rank</span>
            <span className="aet-rank-title">{rankTitle}</span>
          </div>

          {/* Reflection */}
          <div className="aet-reflection">
            <p>What makes AI ethics hard is that reasonable, well-intentioned people reach different verdicts. The goal was never to give you the right answer — it was to make you think harder about the questions.</p>
          </div>

          {/* What you grappled with */}
          <div className="aet-grappled">
            <h3 className="aet-grappled-title">What you grappled with</h3>
            <div className="aet-grappled-list">
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Algorithmic hiring bias</div>
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Medical AI and demographic gaps</div>
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Surveillance and privacy</div>
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Content moderation at scale</div>
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Criminal justice AI</div>
              <div className="aet-grappled-item"><CheckIcon size={16} color="#34C759" /> Autonomous AI accountability</div>
            </div>
          </div>

          {/* Actions */}
          <div className="aet-complete-actions">
            <button className="aet-btn-primary" onClick={handleReset}>
              Hear New Cases
            </button>
            <button className="aet-btn-outline" onClick={onGoHome}>
              Back to Home
            </button>
          </div>

          <SuggestedModules currentModuleId="ai-ethics-tribunal" onSwitchTab={onSwitchTab} />
        </div>
      </div>
    )
  }

  /* ── Game Screen ── */

  return (
    <div className="aet-game" ref={gameRef}>
      {/* Case header bar */}
      <div className="aet-case-bar">
        <div className="aet-case-badge">CASE {String(activeCase.id).padStart(2, '0')} / 06</div>
        <div className="aet-case-scales">
          <ScalesOfJustice tilt={scaleTilt} size={40} />
        </div>
        <div className="aet-case-progress">Cases heard: {verdicts.length}/6</div>
      </div>

      {/* Case name */}
      <div className="aet-case-header">
        <span className="aet-case-label">{activeCase.label}</span>
        <h2 className="aet-case-name">&ldquo;{activeCase.name}&rdquo;</h2>
      </div>

      {/* Tribunal Chamber */}
      <div className="aet-chamber">
        {/* Case facts */}
        <div className="aet-facts">
          <span className="aet-facts-label">THE CASE</span>
          <p className="aet-facts-text">{activeCase.facts}</p>
        </div>

        {/* Argument panels */}
        <div className="aet-arguments">
          {/* In Favor panel */}
          <div className="aet-panel aet-panel-favor">
            <div className="aet-panel-header">
              <svg className="aet-panel-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0071E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="aet-panel-label aet-label-favor">IN FAVOR</span>
            </div>
            <p className="aet-panel-party">{activeCase.parties.favor}</p>
            <ul className="aet-panel-args">
              {activeCase.inFavor.map((arg, i) => (
                <li key={i} className="aet-arg aet-arg-favor">{arg}</li>
              ))}
            </ul>
          </div>

          {/* Against panel */}
          <div className="aet-panel aet-panel-against">
            <div className="aet-panel-header">
              <svg className="aet-panel-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="aet-panel-label aet-label-against">AGAINST</span>
            </div>
            <p className="aet-panel-party">{activeCase.parties.against}</p>
            <ul className="aet-panel-args">
              {activeCase.against.map((arg, i) => (
                <li key={i} className="aet-arg aet-arg-against">{arg}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Evidence cards */}
        <div className="aet-evidence">
          <span className="aet-evidence-label">KEY EVIDENCE</span>
          {activeCase.evidence.map((ev, i) => (
            <div key={i} className="aet-evidence-card">
              <span className="aet-evidence-text">{ev.text}</span>
            </div>
          ))}
        </div>

        {/* Verdict controls */}
        {!submitted && (
          <div className="aet-verdict-controls">
            <h3 className="aet-verdict-heading">DELIVER YOUR VERDICT</h3>
            <div className="aet-verdict-buttons">
              <button
                className={`aet-verdict-btn aet-verdict-favor${verdict === 'favor' ? ' aet-verdict-selected' : ''}`}
                onClick={() => handleSelectVerdict('favor')}
              >
                Rule IN FAVOR
              </button>
              <button
                className={`aet-verdict-btn aet-verdict-against${verdict === 'against' ? ' aet-verdict-selected' : ''}`}
                onClick={() => handleSelectVerdict('against')}
              >
                Rule AGAINST
              </button>
            </div>
            <button
              className={`aet-verdict-deadlock${verdict === 'deadlock' ? ' aet-verdict-selected' : ''}`}
              onClick={() => handleSelectVerdict('deadlock')}
            >
              Deadlocked — Too Close to Call
            </button>

            <div className="aet-reasoning">
              <label className="aet-reasoning-label" htmlFor="aet-reasoning">Your reasoning (optional):</label>
              <textarea
                id="aet-reasoning"
                className="aet-reasoning-textarea"
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Why did you rule this way?"
                rows={3}
              />
            </div>

            {verdict && (
              <button className="aet-submit-btn" onClick={handleSubmitVerdict}>
                Deliver Verdict
              </button>
            )}
          </div>
        )}

        {/* Verdict reveal */}
        {submitted && (
          <div className="aet-reveal">
            {/* Gavel animation */}
            {revealStep >= 1 && (
              <div className="aet-gavel-wrap">
                <GavelSvg dropping={gavelDropping} />
              </div>
            )}

            {/* Staggered reveal sections */}
            {revealStep >= 2 && (
              <div className="aet-reveal-content">
                <div className="aet-delivered-banner aet-stagger-in">VERDICT DELIVERED</div>

                {/* User's verdict */}
                {revealStep >= 3 && (
                  <div className="aet-your-verdict aet-stagger-in">
                    <span className="aet-your-label">Your ruling:</span>
                    <span className={`aet-your-ruling aet-ruling-${verdict}`}>
                      {verdict === 'favor' ? 'In Favor' : verdict === 'against' ? 'Against' : 'Deadlocked'}
                    </span>
                    {reasoning && (
                      <p className="aet-your-reasoning">&ldquo;{reasoning}&rdquo;</p>
                    )}
                  </div>
                )}

                {/* Real outcome */}
                {revealStep >= 4 && (
                  <div className="aet-real-outcome aet-stagger-in">
                    <span className="aet-real-label">WHAT THE WORLD DECIDED</span>
                    <p className="aet-real-text">{activeCase.realOutcome}</p>
                  </div>
                )}

                {/* Nuance box */}
                {revealStep >= 5 && (
                  <div className="aet-nuance aet-stagger-in">
                    <span className="aet-nuance-label">WHY THIS IS STILL DEBATED</span>
                    <p className="aet-nuance-text">{activeCase.whyDebated}</p>
                  </div>
                )}

                {/* What this teaches */}
                {revealStep >= 6 && (
                  <div className="aet-teaches aet-stagger-in">
                    <span className="aet-teaches-label">What this teaches us</span>
                    <p className="aet-teaches-text">{activeCase.teaches}</p>
                  </div>
                )}

                {/* Next case button */}
                {revealStep >= 7 && (
                  <button className="aet-next-btn aet-stagger-in" onClick={handleNextCase}>
                    {currentCase >= CASES.length - 1 ? 'All Cases Complete \u2192' : 'Next Case \u2192'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIEthicsTribunal
