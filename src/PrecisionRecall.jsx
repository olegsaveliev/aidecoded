import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, TargetIcon, BarChartIcon, SearchIcon, ZapIcon, EyeIcon, TrendingUpIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { precisionRecallQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './PrecisionRecall.css'

const PR_TOOLS = {
  0: [
    { name: 'Scikit-learn', color: '#5856D6', desc: 'Python ML library with metrics module' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'Google deep learning framework' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Meta deep learning framework' },
    { name: 'Keras', color: '#5856D6', desc: 'High-level neural network API' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Experiment tracking and visualization' },
    { name: 'MLflow', color: '#8E8E93', desc: 'Open-source ML lifecycle platform' },
  ],
  1: [
    { name: 'sklearn confusion_matrix', color: '#5856D6', desc: 'Compute confusion matrix from predictions' },
    { name: 'sklearn.metrics', color: '#5856D6', desc: 'Full classification metrics suite' },
    { name: 'Seaborn heatmap', color: '#34C759', desc: 'Statistical data visualization' },
    { name: 'TensorBoard', color: '#5856D6', desc: 'Visualization toolkit for ML experiments' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Interactive confusion matrix plots' },
  ],
  2: [
    { name: 'sklearn precision_score', color: '#5856D6', desc: 'Compute precision from predictions' },
    { name: 'TensorFlow metrics', color: '#5856D6', desc: 'Built-in precision metric' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Custom metric computation' },
    { name: 'Keras', color: '#5856D6', desc: 'Precision metric callback' },
  ],
  3: [
    { name: 'sklearn recall_score', color: '#5856D6', desc: 'Compute recall from predictions' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'Built-in recall metric' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Custom recall computation' },
    { name: 'Keras', color: '#5856D6', desc: 'Recall metric callback' },
    { name: 'MLflow', color: '#8E8E93', desc: 'Log and compare recall across runs' },
  ],
  4: [
    { name: 'sklearn PR curve', color: '#5856D6', desc: 'Precision-recall curve computation' },
    { name: 'matplotlib', color: '#34C759', desc: 'Python plotting library' },
    { name: 'Plotly', color: '#34C759', desc: 'Interactive plotting library' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Interactive PR curve plots' },
    { name: 'TensorBoard curves', color: '#5856D6', desc: 'PR curve visualization' },
  ],
  5: [
    { name: 'sklearn f1_score', color: '#5856D6', desc: 'Compute F1 from predictions' },
    { name: 'sklearn fbeta_score', color: '#5856D6', desc: 'Weighted F-beta score' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'Built-in F1 metric' },
    { name: 'PyTorch', color: '#5856D6', desc: 'Custom F1 computation' },
    { name: 'Keras', color: '#5856D6', desc: 'F1 metric callback' },
  ],
  6: [
    { name: 'Scikit-learn', color: '#5856D6', desc: 'Full classification report' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'Model evaluation suite' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Compare metrics across experiments' },
    { name: 'MLflow', color: '#8E8E93', desc: 'Track metric choices per project' },
  ],
}

const STAGES = [
  { key: 'accuracy-lie', label: 'Accuracy Lie' },
  { key: 'confusion-matrix', label: 'TP/TN/FP/FN' },
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
  { key: 'trade-off', label: 'Trade-off' },
  { key: 'f1-score', label: 'F1 Score' },
  { key: 'choosing', label: 'Choosing' },
]

const STAGE_TOOLTIPS = {
  'accuracy-lie': 'Why accuracy alone is dangerously misleading',
  'confusion-matrix': 'The confusion matrix \u2014 TP, TN, FP, FN',
  'precision': 'Precision \u2014 when you say yes, are you right?',
  'recall': 'Recall \u2014 are you catching everything that matters?',
  'trade-off': 'The precision-recall trade-off',
  'f1-score': 'F1 score \u2014 when you need to balance both',
  'choosing': 'Choosing the right metric for any situation',
}

const QUICK_REFERENCE = [
  { technique: 'Accuracy', when: 'Balanced datasets only', phrase: '(TP+TN) / Total', icon: <WarningIcon size={24} color="#FF9500" /> },
  { technique: 'Precision', when: 'FP is costly', phrase: 'TP / (TP + FP)', icon: <TargetIcon size={24} color="#5856D6" /> },
  { technique: 'Recall', when: 'FN is costly', phrase: 'TP / (TP + FN)', icon: <SearchIcon size={24} color="#5856D6" /> },
  { technique: 'F1 Score', when: 'Both matter equally', phrase: '2PR / (P + R)', icon: <BarChartIcon size={24} color="#5856D6" /> },
  { technique: 'Confusion Matrix', when: 'Understanding errors', phrase: 'TP, TN, FP, FN grid', icon: <EyeIcon size={24} color="#5856D6" /> },
  { technique: 'PR Curve', when: 'Comparing models', phrase: 'Threshold vs P/R frontier', icon: <TrendingUpIcon size={24} color="#5856D6" /> },
  { technique: 'Decision Framework', when: 'Picking a metric', phrase: 'Which mistake costs more?', icon: <ZapIcon size={24} color="#5856D6" /> },
]

/* ===================================
   SHARED EMAIL GRID DATA
   =================================== */

// Generate 100 emails: 20 spam (indices 0-19), 80 legit (indices 20-99)
// Each email has a "confidence score" used by the threshold slider
function generateEmails() {
  const emails = []
  // 20 spam emails with varied confidence scores
  const spamConfidences = [95, 92, 88, 85, 82, 78, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10]
  for (let i = 0; i < 20; i++) {
    emails.push({ id: i, isSpam: true, confidence: spamConfidences[i] })
  }
  // 80 legit emails with varied (low) confidence scores
  for (let i = 0; i < 80; i++) {
    const conf = Math.max(2, Math.round(5 + (i / 80) * 55 + (Math.sin(i * 7) * 8)))
    emails.push({ id: 20 + i, isSpam: false, confidence: Math.min(conf, 60) })
  }
  return emails
}

const EMAILS = generateEmails()

function classifyEmails(emails, threshold) {
  let tp = 0, tn = 0, fp = 0, fn = 0
  const classified = emails.map(e => {
    const flagged = e.confidence >= threshold
    let category
    if (e.isSpam && flagged) { tp++; category = 'tp' }
    else if (!e.isSpam && !flagged) { tn++; category = 'tn' }
    else if (!e.isSpam && flagged) { fp++; category = 'fp' }
    else { fn++; category = 'fn' }
    return { ...e, flagged, category }
  })
  return { classified, tp, tn, fp, fn }
}

/* ===================================
   EMAIL GRID COMPONENT (shared)
   =================================== */

function EmailGrid({ emails, highlightCategory, faded, animateReveal, small }) {
  return (
    <div className={`pr-email-grid${small ? ' pr-email-grid-small' : ''}`}>
      {emails.map((e, i) => {
        const isHighlighted = !highlightCategory || highlightCategory === e.category
        const shouldFade = faded && !isHighlighted
        return (
          <div
            key={e.id}
            className={`pr-email-cell pr-cat-${e.category}${shouldFade ? ' pr-cell-faded' : ''}${animateReveal ? ' pr-cell-reveal' : ''}`}
            style={animateReveal ? { animationDelay: `${i * 8}ms` } : undefined}
            title={`${e.isSpam ? 'Spam' : 'Legit'} | ${e.flagged ? 'Flagged' : 'Not flagged'} | ${e.category.toUpperCase()}`}
          >
            {e.category === 'tp' && (
              <svg className="pr-cell-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {e.category === 'fn' && (
              <svg className="pr-cell-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ===================================
   CONFUSION MATRIX TABLE
   =================================== */

const CM_LABELS = {
  tp: 'True Positive: spam correctly caught',
  fn: 'False Negative: spam that slipped through',
  fp: 'False Positive: legit wrongly flagged',
  tn: 'True Negative: legit correctly ignored',
}

function ConfusionMatrixTable({ tp, tn, fp, fn, highlightCell, onCellClick }) {
  function handleKey(e, cell) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onCellClick?.(cell)
    }
  }

  return (
    <div className="pr-cm-table" role="grid" aria-label="Confusion matrix">
      <div className="pr-cm-header-row" role="row">
        <div className="pr-cm-corner" role="columnheader" />
        <div className="pr-cm-col-header" role="columnheader">Predicted Spam</div>
        <div className="pr-cm-col-header" role="columnheader">Predicted Legit</div>
      </div>
      <div className="pr-cm-row" role="row">
        <div className="pr-cm-row-header" role="rowheader">Actual Spam</div>
        <div
          className={`pr-cm-cell pr-cm-tp${highlightCell === 'tp' ? ' pr-cm-active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`${CM_LABELS.tp}: ${tp} emails. Click to highlight in grid`}
          aria-pressed={highlightCell === 'tp'}
          onClick={() => onCellClick?.('tp')}
          onKeyDown={(e) => handleKey(e, 'tp')}
        >
          <div className="pr-cm-cell-label">TP</div>
          <div className="pr-cm-cell-count">{tp}</div>
        </div>
        <div
          className={`pr-cm-cell pr-cm-fn${highlightCell === 'fn' ? ' pr-cm-active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`${CM_LABELS.fn}: ${fn} emails. Click to highlight in grid`}
          aria-pressed={highlightCell === 'fn'}
          onClick={() => onCellClick?.('fn')}
          onKeyDown={(e) => handleKey(e, 'fn')}
        >
          <div className="pr-cm-cell-label">FN</div>
          <div className="pr-cm-cell-count">{fn}</div>
        </div>
      </div>
      <div className="pr-cm-row" role="row">
        <div className="pr-cm-row-header" role="rowheader">Actual Legit</div>
        <div
          className={`pr-cm-cell pr-cm-fp${highlightCell === 'fp' ? ' pr-cm-active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`${CM_LABELS.fp}: ${fp} emails. Click to highlight in grid`}
          aria-pressed={highlightCell === 'fp'}
          onClick={() => onCellClick?.('fp')}
          onKeyDown={(e) => handleKey(e, 'fp')}
        >
          <div className="pr-cm-cell-label">FP</div>
          <div className="pr-cm-cell-count">{fp}</div>
        </div>
        <div
          className={`pr-cm-cell pr-cm-tn${highlightCell === 'tn' ? ' pr-cm-active' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`${CM_LABELS.tn}: ${tn} emails. Click to highlight in grid`}
          aria-pressed={highlightCell === 'tn'}
          onClick={() => onCellClick?.('tn')}
          onKeyDown={(e) => handleKey(e, 'tn')}
        >
          <div className="pr-cm-cell-label">TN</div>
          <div className="pr-cm-cell-count">{tn}</div>
        </div>
      </div>
    </div>
  )
}

/* ===================================
   METRIC BAR
   =================================== */

function MetricBar({ label, value, muted }) {
  const pct = Math.round(value * 100)
  return (
    <div className="pr-metric-bar">
      <div className="pr-metric-bar-label">
        <span>{label}</span>
        <span className="pr-metric-bar-value">{pct}%</span>
      </div>
      <div className="pr-metric-bar-track">
        <div className={`pr-metric-bar-fill${muted ? ' pr-metric-bar-muted' : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ===================================
   STAGE 1 — THE ACCURACY LIE
   =================================== */

function AccuracyLieViz({ active }) {
  const [phase, setPhase] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) return
    clearTimers()
    setPhase(0)
    // Phase 0: show grid
    // Phase 1: sweep animation (all labeled legit)
    timersRef.current.push(setTimeout(() => setPhase(1), 600))
    // Phase 2: show accuracy counter
    timersRef.current.push(setTimeout(() => setPhase(2), 1400))
    // Phase 3: reveal the missed spam
    timersRef.current.push(setTimeout(() => setPhase(3), 2800))
    // Phase 4: show punchline
    timersRef.current.push(setTimeout(() => setPhase(4), 4000))
    return clearTimers
  }, [active])

  // 100 emails: 1 spam (index 0), 99 legit
  const trapEmails = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    isSpam: i === 0,
    confidence: i === 0 ? 45 : 10,
  }))

  const classified = trapEmails.map(e => ({
    ...e,
    flagged: false,
    category: e.isSpam ? 'fn' : 'tn',
  }))

  return (
    <div className="pr-viz">
      <div className="pr-demo-label">The Accuracy Trap</div>

      <div className="pr-accuracy-demo">
        <div className="pr-email-grid">
          {classified.map((e, i) => (
            <div
              key={e.id}
              className={`pr-email-cell ${e.isSpam ? 'pr-cell-spam' : 'pr-cell-legit'}${phase >= 3 && e.isSpam ? ' pr-cell-pulse' : ''}${phase >= 1 ? ' pr-cell-reveal' : ''}`}
              style={{ animationDelay: `${i * 15}ms` }}
            >
              {phase >= 1 && !e.isSpam && (
                <svg className="pr-cell-icon pr-cell-check-small" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {phase >= 3 && e.isSpam && (
                <svg className="pr-cell-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {phase >= 2 && (
          <div className="pr-accuracy-counters how-fade-in">
            <div className="pr-counter pr-counter-good">
              <CheckIcon size={16} color="#34C759" />
              <span>Correct: 99 / 100</span>
              <span className="pr-counter-pct">Accuracy: 99%</span>
            </div>
            {phase >= 3 && (
              <div className="pr-counter pr-counter-bad how-fade-in">
                <CrossIcon size={16} color="#FF3B30" />
                <span>Spam caught: 0 / 1</span>
                <span className="pr-counter-pct">Spam recall: 0%</span>
              </div>
            )}
          </div>
        )}

        {phase >= 4 && (
          <div className="pr-punchline how-fade-in">
            <div className="pr-punchline-line"><strong>99% accurate.</strong></div>
            <div className="pr-punchline-line"><strong>0% useful as a spam filter.</strong></div>
            <div className="pr-punchline-cta">This is why we need better metrics.</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 2 — CONFUSION MATRIX
   =================================== */

function ConfusionMatrixViz({ active }) {
  const [phase, setPhase] = useState(0)
  const [highlightCell, setHighlightCell] = useState(null)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) return
    clearTimers()
    setPhase(0)
    setHighlightCell(null)
    timersRef.current.push(setTimeout(() => setPhase(1), 400))
    timersRef.current.push(setTimeout(() => setPhase(2), 1200))
    return clearTimers
  }, [active])

  const { classified, tp, tn, fp, fn } = classifyEmails(EMAILS, 50)

  return (
    <div className="pr-viz">
      <div className="pr-demo-label">Interactive Confusion Matrix</div>

      <div className="pr-cm-demo">
        {phase >= 1 && (
          <div className="how-fade-in">
            <EmailGrid emails={classified} highlightCategory={highlightCell} faded={!!highlightCell} animateReveal={true} />
          </div>
        )}

        <div className="pr-cm-legend">
          <div className="pr-legend-item" onClick={() => setHighlightCell(highlightCell === 'tp' ? null : 'tp')}>
            <div className="pr-legend-swatch pr-swatch-tp" />
            <span>TP: {tp} &mdash; Spam correctly caught</span>
          </div>
          <div className="pr-legend-item" onClick={() => setHighlightCell(highlightCell === 'tn' ? null : 'tn')}>
            <div className="pr-legend-swatch pr-swatch-tn" />
            <span>TN: {tn} &mdash; Legit correctly ignored</span>
          </div>
          <div className="pr-legend-item" onClick={() => setHighlightCell(highlightCell === 'fp' ? null : 'fp')}>
            <div className="pr-legend-swatch pr-swatch-fp" />
            <span>FP: {fp} &mdash; Legit wrongly flagged</span>
          </div>
          <div className="pr-legend-item" onClick={() => setHighlightCell(highlightCell === 'fn' ? null : 'fn')}>
            <div className="pr-legend-swatch pr-swatch-fn" />
            <span>FN: {fn} &mdash; Spam that slipped through</span>
          </div>
        </div>

        {phase >= 2 && (
          <div className="how-fade-in">
            <ConfusionMatrixTable
              tp={tp} tn={tn} fp={fp} fn={fn}
              highlightCell={highlightCell}
              onCellClick={(cell) => setHighlightCell(highlightCell === cell ? null : cell)}
            />
            <div className="pr-cm-summary">
              Total correct: {tp + tn} / 100 = {tp + tn}% accuracy.
              But look at the four numbers individually&hellip;
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 3 — PRECISION
   =================================== */

function PrecisionViz({ active }) {
  const [threshold, setThreshold] = useState(50)
  const [showExplorer, setShowExplorer] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) return
    clearTimers()
    setThreshold(50)
    setShowExplorer(false)
    timersRef.current.push(setTimeout(() => setShowExplorer(true), 800))
    return clearTimers
  }, [active])

  const { classified, tp, fp } = classifyEmails(EMAILS, threshold)
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  return (
    <div className="pr-viz">
      <div className="pr-demo-label">Precision Spotlight</div>

      <div className="pr-precision-demo">
        <EmailGrid emails={classified} highlightCategory={null} faded={false} />

        <div className="pr-spotlight-split">
          <div className="pr-spotlight-group pr-spotlight-tp">
            <div className="pr-spotlight-count">{tp}</div>
            <div className="pr-spotlight-label">TP &mdash; Were spam</div>
          </div>
          <div className="pr-spotlight-group pr-spotlight-fp">
            <div className="pr-spotlight-count">{fp}</div>
            <div className="pr-spotlight-label">FP &mdash; Were NOT spam</div>
          </div>
        </div>

        <MetricBar label="Precision" value={precision} />

        <div className="pr-formula-display">
          Precision = TP &divide; (TP + FP) = {tp} &divide; {tp + fp} = {Math.round(precision * 100)}%
        </div>

        {showExplorer && (
          <div className="pr-explorer how-fade-in">
            <label className="pr-explorer-label" htmlFor="pr-precision-threshold">Move the detection threshold</label>
            <input
              id="pr-precision-threshold"
              type="range"
              min="10"
              max="90"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="pr-threshold-slider"
            />
            <div className="pr-threshold-value">Threshold: {threshold}%</div>
            <div className="pr-explorer-hint">
              {threshold < 35 ? 'Low threshold: catching more spam but annoying users with false alarms'
                : threshold > 65 ? 'High threshold: fewer false alarms but missing more spam'
                : 'Balanced threshold: reasonable trade-off between precision and coverage'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 4 — RECALL
   =================================== */

function RecallViz({ active }) {
  const [showComparison, setShowComparison] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) return
    clearTimers()
    setShowComparison(false)
    timersRef.current.push(setTimeout(() => setShowComparison(true), 800))
    return clearTimers
  }, [active])

  const { classified, tp, fn, fp } = classifyEmails(EMAILS, 50)
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  return (
    <div className="pr-viz">
      <div className="pr-demo-label">Recall Spotlight</div>

      <div className="pr-recall-demo">
        <EmailGrid emails={classified} highlightCategory={null} faded={false} />

        <div className="pr-spotlight-split">
          <div className="pr-spotlight-group pr-spotlight-tp">
            <div className="pr-spotlight-count">{tp}</div>
            <div className="pr-spotlight-label">TP &mdash; We caught these</div>
          </div>
          <div className="pr-spotlight-group pr-spotlight-fn">
            <div className="pr-spotlight-count">{fn}</div>
            <div className="pr-spotlight-label">FN &mdash; These got through</div>
          </div>
        </div>

        <MetricBar label="Recall" value={recall} />

        <div className="pr-formula-display">
          Recall = TP &divide; (TP + FN) = {tp} &divide; {tp + fn} = {Math.round(recall * 100)}%
        </div>

        <div className="pr-alias-list">
          Also called: <strong>Sensitivity</strong>, <strong>True Positive Rate</strong>, <strong>Hit Rate</strong>
        </div>

        {showComparison && (
          <div className="pr-side-by-side how-fade-in">
            <div className="pr-side-panel pr-side-precision">
              <div className="pr-side-title">Precision view</div>
              <div className="pr-side-desc">{tp + fp} flagged, {tp} were real</div>
              <MetricBar label="Precision" value={precision} />
            </div>
            <div className="pr-side-panel pr-side-recall">
              <div className="pr-side-title">Recall view</div>
              <div className="pr-side-desc">{tp + fn} actual spam, {tp} caught</div>
              <MetricBar label="Recall" value={recall} />
            </div>
            <div className="pr-side-caption">Same numbers. Different questions. Both matter.</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 5 — THE TRADE-OFF
   =================================== */

function TradeOffViz({ active }) {
  const [threshold, setThreshold] = useState(50)

  useEffect(() => {
    if (!active) return
    setThreshold(50)
  }, [active])

  const { classified, tp, tn, fp, fn } = classifyEmails(EMAILS, threshold)
  const precision = tp + fp > 0 ? tp / (tp + fp) : 1
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0

  // Generate PR curve points
  const curvePoints = []
  for (let t = 10; t <= 95; t += 3) {
    const r = classifyEmails(EMAILS, t)
    const p = r.tp + r.fp > 0 ? r.tp / (r.tp + r.fp) : 1
    const rec = r.tp + r.fn > 0 ? r.tp / (r.tp + r.fn) : 0
    curvePoints.push({ t, p, r: rec })
  }

  function setPreset(val) {
    setThreshold(val)
  }

  return (
    <div className="pr-viz">
      <div className="pr-demo-label">Interactive Precision-Recall Trade-off</div>

      <div className="pr-tradeoff-demo">
        <EmailGrid emails={classified} highlightCategory={null} faded={false} />

        <div className="pr-live-counters">
          <div className="pr-live-counter pr-lc-tp">TP: {tp}</div>
          <div className="pr-live-counter pr-lc-fp">FP: {fp}</div>
          <div className="pr-live-counter pr-lc-fn">FN: {fn}</div>
          <div className="pr-live-counter pr-lc-tn">TN: {tn}</div>
        </div>

        <div className="pr-dual-bars">
          <MetricBar label="Precision" value={precision} />
          <MetricBar label="Recall" value={recall} />
        </div>

        <div className="pr-threshold-control">
          <label className="pr-threshold-label" htmlFor="pr-tradeoff-threshold">Detection threshold: {threshold}%</label>
          <input
            id="pr-tradeoff-threshold"
            type="range"
            min="10"
            max="95"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="pr-threshold-slider"
          />
          <div className="pr-threshold-hint">
            {threshold < 30 ? 'Very aggressive: flagging almost everything suspicious'
              : threshold < 50 ? 'Catching more spam but more false alarms'
              : threshold < 70 ? 'Balanced detection threshold'
              : threshold < 85 ? 'Conservative: fewer false alarms but missing spam'
              : 'Very conservative: only flagging the most obvious spam'}
          </div>
        </div>

        <div className="pr-presets">
          <button className={`pr-preset-btn${threshold <= 25 ? ' pr-preset-active' : ''}`} onClick={() => setPreset(20)}>High Recall</button>
          <button className={`pr-preset-btn${threshold > 40 && threshold < 60 ? ' pr-preset-active' : ''}`} onClick={() => setPreset(50)}>Balanced</button>
          <button className={`pr-preset-btn${threshold >= 75 ? ' pr-preset-active' : ''}`} onClick={() => setPreset(80)}>High Precision</button>
        </div>

        {/* Mini PR curve */}
        <div className="pr-curve-wrapper">
          <div className="pr-curve-title">Precision-Recall Curve</div>
          <svg className="pr-curve-svg" viewBox="0 0 220 160">
            {/* Axes */}
            <line x1="30" y1="10" x2="30" y2="140" stroke="var(--text-tertiary)" strokeWidth="1" />
            <line x1="30" y1="140" x2="210" y2="140" stroke="var(--text-tertiary)" strokeWidth="1" />
            <text x="4" y="80" fill="var(--text-tertiary)" fontSize="9" textAnchor="middle" transform="rotate(-90, 10, 80)">Precision</text>
            <text x="120" y="156" fill="var(--text-tertiary)" fontSize="9" textAnchor="middle">Recall</text>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1].map(v => (
              <line key={v} x1="30" y1={140 - v * 130} x2="210" y2={140 - v * 130} stroke="var(--border-light)" strokeWidth="0.5" strokeDasharray="3,3" />
            ))}
            {/* Curve */}
            <polyline
              className="pr-curve-line"
              points={curvePoints.map(pt => `${30 + pt.r * 180},${140 - pt.p * 130}`).join(' ')}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Current position dot */}
            <circle
              className="pr-curve-dot"
              cx={30 + recall * 180}
              cy={140 - precision * 130}
              r="5"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ===================================
   STAGE 6 — F1 SCORE
   =================================== */

function F1ScoreViz({ active }) {
  const [precisionVal, setPrecisionVal] = useState(75)
  const [recallVal, setRecallVal] = useState(75)
  const [activePreset, setActivePreset] = useState(null)

  useEffect(() => {
    if (!active) return
    setPrecisionVal(75)
    setRecallVal(75)
    setActivePreset(null)
  }, [active])

  const p = precisionVal / 100
  const r = recallVal / 100
  const regular = (p + r) / 2
  const f1 = p + r > 0 ? (2 * p * r) / (p + r) : 0
  const diff = regular - f1

  const presets = [
    { label: 'Balanced', p: 80, r: 80, desc: 'Balanced model. Both metrics agree.' },
    { label: 'One-sided', p: 95, r: 20, desc: 'High precision, low recall. Regular average flatters this model. F1 reveals the weakness.' },
    { label: 'Near-perfect', p: 92, r: 88, desc: 'Strong model. Both metrics agree closely.' },
  ]

  return (
    <div className="pr-viz">
      <div className="pr-demo-label">F1 Score Calculator</div>

      <div className="pr-f1-demo">
        <div className="pr-f1-sliders">
          <div className="pr-f1-slider-group">
            <label htmlFor="pr-f1-precision">Precision: {precisionVal}%</label>
            <input
              id="pr-f1-precision"
              type="range" min="5" max="100" value={precisionVal}
              onChange={e => { setPrecisionVal(Number(e.target.value)); setActivePreset(null) }}
              className="pr-threshold-slider"
            />
          </div>
          <div className="pr-f1-slider-group">
            <label htmlFor="pr-f1-recall">Recall: {recallVal}%</label>
            <input
              id="pr-f1-recall"
              type="range" min="5" max="100" value={recallVal}
              onChange={e => { setRecallVal(Number(e.target.value)); setActivePreset(null) }}
              className="pr-threshold-slider"
            />
          </div>
        </div>

        <div className="pr-f1-results">
          <div className="pr-f1-result-row">
            <span className="pr-f1-result-label">Regular average: (P + R) &divide; 2</span>
            <span className="pr-f1-result-value">{Math.round(regular * 100)}%</span>
          </div>
          <div className="pr-f1-result-row pr-f1-result-main">
            <span className="pr-f1-result-label">F1 (harmonic mean): 2PR &divide; (P + R)</span>
            <span className="pr-f1-result-value">{Math.round(f1 * 100)}%</span>
          </div>
          {diff > 0.005 && (
            <div className={`pr-f1-diff${diff > 0.15 ? ' pr-f1-diff-large' : ''}`}>
              Harmonic mean is {Math.round(diff * 100)}% lower
              {diff > 0.15 && ' \u2014 F1 penalises the imbalance'}
            </div>
          )}
        </div>

        <div className="pr-f1-bars">
          <div className="pr-f1-bar-pair">
            <MetricBar label="Regular avg" value={regular} muted />
            <MetricBar label="F1 score" value={f1} />
          </div>
        </div>

        <div className="pr-f1-presets">
          <div className="pr-f1-presets-label">Try these examples:</div>
          <div className="pr-f1-preset-btns">
            {presets.map((preset, i) => (
              <button
                key={i}
                className={`pr-preset-btn${activePreset === i ? ' pr-preset-active' : ''}`}
                onClick={() => { setPrecisionVal(preset.p); setRecallVal(preset.r); setActivePreset(i) }}
              >
                {preset.label}
              </button>
            ))}
          </div>
          {activePreset !== null && (
            <div className="pr-f1-preset-desc how-fade-in">
              {presets[activePreset].desc}
            </div>
          )}
        </div>

        <div className="pr-formula-display">
          F1 = 2 &times; (P &times; R) &divide; (P + R)
        </div>
      </div>
    </div>
  )
}

/* ===================================
   STAGE 7 — CHOOSING THE RIGHT METRIC
   =================================== */

const SCENARIOS = [
  { id: 'medical', label: 'Medical test for rare disease', correct: 'recall', explanation: 'Missing a disease is catastrophic. False positives just mean more tests.' },
  { id: 'spam', label: 'Spam filter for work email', correct: 'precision', explanation: "Missing the CEO's email is catastrophic. Letting some spam through is annoying, not fatal." },
  { id: 'fraud', label: 'Fraud detection for bank', correct: 'recall', explanation: 'Missing real fraud costs real money. False positives just need investigation.' },
  { id: 'recs', label: 'Product recommendation engine', correct: 'f1', explanation: 'Both matter roughly equally. You want relevant results without drowning users.' },
  { id: 'security', label: 'Security breach detection', correct: 'recall', explanation: 'Missing a breach is catastrophic. False alarms waste time but do not cause breaches.' },
  { id: 'hiring', label: 'Hiring resume screener', correct: 'debated', explanation: 'FP: interviewing unqualified candidates (costly). FN: rejecting qualified candidates (also costly). Context-dependent \u2014 good discussion to have.' },
]

function ChoosingViz({ active }) {
  const [assignments, setAssignments] = useState({})
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!active) return
    setAssignments({})
    setRevealed(false)
  }, [active])

  function assignScenario(scenarioId, bucket) {
    if (revealed) return
    setAssignments(prev => ({ ...prev, [scenarioId]: bucket }))
  }

  function revealAnswers() {
    if (revealed) return
    setRevealed(true)
  }

  const allAssigned = Object.keys(assignments).length === SCENARIOS.length
  const score = revealed ? SCENARIOS.filter(s => {
    if (s.correct === 'debated') return assignments[s.id] === 'precision' || assignments[s.id] === 'recall' || assignments[s.id] === 'f1'
    return assignments[s.id] === s.correct
  }).length : 0

  const buckets = ['precision', 'recall', 'f1']
  const bucketLabels = { precision: 'Optimise Precision', recall: 'Optimise Recall', f1: 'Optimise F1' }

  return (
    <div className="pr-viz">
      <div className="pr-demo-label">Scenario Sorter</div>

      <div className="pr-choosing-demo">
        <div className="pr-scenarios">
          {SCENARIOS.map(s => {
            const assigned = assignments[s.id]
            const isCorrect = revealed && (s.correct === 'debated' ? true : assigned === s.correct)
            const isWrong = revealed && !isCorrect && assigned
            return (
              <div key={s.id} className={`pr-scenario-card${assigned ? ' pr-scenario-assigned' : ''}${isCorrect && revealed ? ' pr-scenario-correct' : ''}${isWrong ? ' pr-scenario-wrong' : ''}`}>
                <div className="pr-scenario-label">{s.label}</div>
                {!revealed && (
                  <div className="pr-scenario-buckets">
                    {buckets.map(b => (
                      <button
                        key={b}
                        className={`pr-bucket-btn${assigned === b ? ' pr-bucket-active' : ''}`}
                        onClick={() => assignScenario(s.id, b)}
                      >
                        {b === 'precision' ? 'Precision' : b === 'recall' ? 'Recall' : 'F1'}
                      </button>
                    ))}
                  </div>
                )}
                {revealed && (
                  <div className="pr-scenario-result how-fade-in">
                    <div className="pr-scenario-answer">
                      {isCorrect ? <CheckIcon size={14} color="#34C759" /> : <CrossIcon size={14} color="#FF3B30" />}
                      <span>
                        {s.correct === 'debated' ? 'Debated \u2014 both valid' : `Recommended: ${s.correct.charAt(0).toUpperCase() + s.correct.slice(1)}`}
                      </span>
                    </div>
                    <div className="pr-scenario-explanation">{s.explanation}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {allAssigned && !revealed && (
          <button className="pr-reveal-btn how-fade-in" onClick={revealAnswers}>
            Check my answers
          </button>
        )}

        {revealed && (
          <div className="pr-score-display how-fade-in">
            Score: {score} / {SCENARIOS.length} correct
          </div>
        )}

        {/* Quick reference card */}
        <div className="pr-reference-card">
          <div className="pr-reference-title">Quick Reference</div>
          <div className="pr-reference-table-wrapper">
            <table className="pr-reference-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Formula</th>
                  <th>Optimise when</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Precision</td><td>TP / (TP + FP)</td><td>FP is costly</td></tr>
                <tr><td>Recall</td><td>TP / (TP + FN)</td><td>FN is costly</td></tr>
                <tr><td>F1</td><td>2PR / (P + R)</td><td>Both matter equally</td></tr>
                <tr><td>Accuracy</td><td>(TP + TN) / Total</td><td>Only when balanced dataset</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ===================================
   MAIN COMPONENT
   =================================== */

function PrecisionRecall({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('precision-recall', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const fadeTimerRef = useRef(null)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
    window.scrollTo(0, 0)
  }, [stage])

  function goToStage(target) {
    if (target < 0 || target > maxStageReached) return
    setShowFinal(false)
    setStage(target)
  }

  function nextStage() {
    if (stage < STAGES.length - 1) {
      setStage(stage + 1)
    } else {
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('precision-recall')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.pr-root')
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

  function dismissLearnTip() {
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 300)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
  }

  // Progressive learn tips — milestone-based
  useEffect(() => {
    if (stage === 1 && !dismissedTips.has('stage1')) {
      setLearnTip({ key: 'stage1', text: 'Click any zone in the confusion matrix to highlight those emails in the grid \u2014 see exactly which emails fall into each category.' })
    } else if (stage === 4 && !dismissedTips.has('stage4')) {
      setLearnTip({ key: 'stage4', text: 'Try dragging the threshold slider all the way left and all the way right to see the extremes \u2014 watch precision and recall pull in opposite directions.' })
    } else if (stage === 6 && !dismissedTips.has('stage6')) {
      setLearnTip({ key: 'stage6', text: 'The scenario sorter has one card with no single correct answer \u2014 that is intentional. Real-world metric choices are rarely black and white.' })
    }
  }, [stage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const vizComponents = {
    0: <AccuracyLieViz active={stage === 0} />,
    1: <ConfusionMatrixViz active={stage === 1} />,
    2: <PrecisionViz active={stage === 2} />,
    3: <RecallViz active={stage === 3} />,
    4: <TradeOffViz active={stage === 4} />,
    5: <F1ScoreViz active={stage === 5} />,
    6: <ChoosingViz active={stage === 6} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: Why 99% Accurate Can Still Be Terrible',
      content: "Imagine your company builds a spam filter. You test it on 100 emails. It correctly classifies 99 of them. 99% accurate. Sounds incredible.\n\nBut here is what actually happened: out of 100 emails, only 1 was spam. Your filter flagged nothing as spam. It let the spam through. It is 99% accurate because it was correct about all 99 legitimate emails. And completely useless as a spam filter.\n\nThis is the accuracy trap. When your dataset is imbalanced \u2014 far more of one class than another \u2014 accuracy becomes meaningless.\n\nReal-world AI is almost always imbalanced: cancer detection (99.5% of scans are healthy), fraud detection (99.9% of transactions are legit), spam filtering (90%+ of emails are legitimate). In every case, a model that predicts the majority class every single time will score very high accuracy and be completely useless.",
      tip: 'The accuracy trap is why ML engineers almost never report accuracy alone. Precision, recall, and F1 were invented specifically because accuracy is so easy to game.',
    },
    1: {
      title: 'Stage 2: Meet TP, TN, FP, FN',
      content: "To understand what a model is really doing, we need to look at four numbers \u2014 not one. These four numbers form the confusion matrix.\n\nLet us use a realistic spam filter: 100 emails total, 20 are actually spam, 80 are actually legitimate. The model makes a prediction about each one. Every prediction falls into one of four buckets:\n\nTrue Positive (TP): actually spam, predicted spam. Correct. \"We caught the bad guy.\"\nTrue Negative (TN): actually legit, predicted legit. Correct. \"We let the innocent go.\"\nFalse Positive (FP): actually legit, predicted spam. Wrong. \"We arrested an innocent person.\" Also called Type I Error.\nFalse Negative (FN): actually spam, predicted legit. Wrong. \"The bad guy got away.\" Also called Type II Error.\n\nEvery single prediction your model makes lands in exactly one of these four cells. The confusion matrix shows you all of them.",
      tip: "The names are from the model's perspective: True = model was correct. False = model was wrong. Positive = model predicted the positive class (spam). Negative = model predicted the negative class (legit).",
    },
    2: {
      title: 'Stage 3: When You Say Spam, Are You Right?',
      content: "Precision answers one question: of everything the model called spam, how much was actually spam?\n\nPrecision = TP / (TP + FP)\n\nIn plain English: when the model fires the alarm, how often is it a real alarm?\n\nWhy precision matters: low precision means lots of false alarms \u2014 your legitimate emails going to spam folder, users missing important messages, trust in the system eroding. High precision means when it flags spam, it is spam.\n\nPrecision is about quality of positives. Not quantity. Quality. The precision-focused question: \"Of all the things I flagged, how many were actually worth flagging?\"",
      tip: 'A model that never predicts spam has undefined precision \u2014 it never makes a false positive because it never predicts positive at all. This is why precision alone is also incomplete.',
    },
    3: {
      title: 'Stage 4: Are You Catching All the Spam?',
      content: "Recall answers the opposite question: of all the actual spam that existed, how much did the model catch?\n\nRecall = TP / (TP + FN)\n\nIn plain English: of all the bad guys out there, how many did we actually catch?\n\nWhy recall matters: low recall means spam slipping through, users seeing spam in their inbox, the filter is not doing its job. High recall means catching almost all spam.\n\nRecall is about coverage of actual positives. Not quality. Coverage. The recall-focused question: \"Of all the things that deserved to be flagged, how many did I actually flag?\"\n\nPrecision vs recall in one sentence: Precision: \"Are my alarms accurate?\" Recall: \"Am I missing anything?\"",
      tip: 'Precision and recall pull in opposite directions. Catching more spam (higher recall) usually means more false alarms (lower precision). Fewer false alarms (higher precision) usually means missing more spam (lower recall). There is almost always a trade-off.',
    },
    4: {
      title: 'Stage 5: You Cannot Have Everything',
      content: "Here is the uncomfortable truth: improving precision usually hurts recall, and vice versa. Why? Because both share TP in the numerator.\n\nTo increase precision: be more selective about what you flag, only flag when very confident. Result: fewer FP (good!) but also fewer TP (bad!). Recall drops.\n\nTo increase recall: flag more aggressively, flag anything slightly suspicious. Result: more TP (good!) but also more FP (bad!). Precision drops.\n\nThis is controlled by the decision threshold \u2014 the confidence level at which the model decides to say \"yes, this is spam.\" High threshold (90% confidence): only obvious spam flagged, precision high, recall low. Low threshold (20% confidence): anything suspicious flagged, precision low, recall high.\n\nAs you sweep the threshold from 0 to 100%, you trace the precision-recall curve. The shape of that curve tells you how good your model fundamentally is.",
      warning: 'There is no universally correct threshold. The right threshold depends entirely on what kind of mistake is more costly in your specific situation. This is a product and business decision, not just a technical one.',
    },
    5: {
      title: 'Stage 6: The Metric That Balances Both',
      content: "Sometimes you need one number that captures both precision and recall together. That number is the F1 score.\n\nF1 = 2 \u00d7 (Precision \u00d7 Recall) / (Precision + Recall)\n\nThis formula is called the harmonic mean. It is stricter than a regular average.\n\nWhen P and R are balanced, harmonic and regular mean agree. But when they diverge: Precision=90%, Recall=10% \u2014 regular average is 50%, but F1 is only 18%. The F1 score punishes extreme imbalance.\n\nA spam filter with 90% precision but 10% recall is not really a \"50%\" spam filter. It is barely useful. F1 of 18% reflects that.\n\nWhen to use F1: when precision and recall are both important, when you want a single summary metric, when your dataset is imbalanced.",
      tip: 'F1 is not always the right metric. If precision matters much more than recall (or vice versa) in your situation, there is a weighted version called F-beta. F2 weights recall twice as much as precision. F0.5 weights precision twice as much as recall.',
    },
    6: {
      title: 'Stage 7: Which Metric Matters for Your Problem?',
      content: "Now you know all the metrics. The last skill is knowing which one to optimise. The answer always comes from asking: \"What kind of mistake is more costly?\"\n\nWhen false positives are costly, optimise for precision. Examples: spam filter flagging important emails, content moderation removing legitimate posts, email marketing sending to uninterested people.\n\nWhen false negatives are costly, optimise for recall. Examples: cancer screening missing a real cancer, fraud detection missing real fraud, security alerts missing a real threat.\n\nWhen both matter equally, use F1 score. Examples: search engine ranking, information retrieval, general classification tasks.\n\nThe decision framework: ask \"If my model makes a mistake, which mistake costs more \u2014 a false alarm or a miss?\" False alarm costs more \u2192 optimise precision. A miss costs more \u2192 optimise recall. Both similar cost \u2192 optimise F1.",
      tip: 'This is never purely a technical decision. The right metric depends on the business context, user experience, regulatory requirements, and ethical considerations. The best ML engineers align closely with product and business teams before choosing an optimisation target.',
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="precision-recall" size={48} style={{ color: '#5856D6' }} />}
        title="Precision &amp; Recall"
        subtitle="Why Your AI Is Lying to You About Accuracy"
        description="Your spam filter is 99% accurate. It also misses half of all spam. Both are true. Understanding how that happens &mdash; and what to actually measure &mdash; is one of the most important skills in AI evaluation."
        buttonText="Start Evaluating"
        onStart={() => { setStage(0); markModuleStarted('precision-recall') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms pr-root quiz-fade-in">
        <Quiz
          questions={precisionRecallQuiz}
          tabName="Precision &amp; Recall"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="precision-recall"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms pr-root${fading ? ' how-fading' : ''}`}>
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Precision &amp; Recall</strong> &mdash; this module uses one running example throughout: a spam filter. By the end you will understand TP, TN, FP, FN, precision, recall and F1 &mdash; and know exactly which one to optimise for in any real situation.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>7 stages</strong> &mdash; from the accuracy trap to choosing the right metric</li>
              <li>Use the <strong>interactive visualisations</strong> &mdash; email grids, threshold sliders, and a scenario sorter</li>
              <li>At the end, review your <strong>metrics toolkit</strong> and test your knowledge with a quiz</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Learn tip */}
      {learnTip && (
        <div className={`learn-tip${learnTipFading ? ' learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <TipIcon size={16} color="#eab308" />
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={() => { setDismissedTips(prev => new Set(prev).add(learnTip.key)); dismissLearnTip() }} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper pr-stepper">
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
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{explanations[stage].title}</strong>
                  </div>
                  {explanations[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}

                  {explanations[stage].tip && (
                    <div className="pr-tip">
                      <TipIcon size={14} color="#eab308" />
                      <span>{explanations[stage].tip}</span>
                    </div>
                  )}

                  {explanations[stage].warning && (
                    <div className="pr-warning">
                      <WarningIcon size={14} color="#FF9500" />
                      <span>{explanations[stage].warning}</span>
                    </div>
                  )}

                  <ToolChips tools={PR_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'The confusion matrix \u2192',
                        'Precision \u2192',
                        'Recall \u2192',
                        'The trade-off \u2192',
                        'F1 score \u2192',
                        'Choosing the right metric \u2192',
                        'See Your Toolkit \u2192',
                      ][stage]}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You now understand Precision &amp; Recall!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Metrics Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>When to use</th>
                  <th>Formula</th>
                </tr>
              </thead>
              <tbody>
                {QUICK_REFERENCE.map((item) => (
                  <tr key={item.technique}>
                    <td className="pe-ref-technique">{item.technique}</td>
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
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="precision-recall" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default PrecisionRecall
