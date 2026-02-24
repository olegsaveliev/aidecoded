import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { aiInProductionQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AIInProduction.css'

const STAGES = [
  { key: 'silent-failure', label: 'Silent Failure', tooltip: 'Why AI features fail silently after launch' },
  { key: 'quality-metrics', label: 'Quality', tooltip: 'Quality metrics — measuring what the AI says' },
  { key: 'latency-cost', label: 'Latency & Cost', tooltip: 'Latency and cost — the operational metrics' },
  { key: 'drift', label: 'Drift', tooltip: 'Drift detection — when your AI stops being itself' },
  { key: 'ab-testing', label: 'A/B Testing', tooltip: 'A/B testing AI — how to improve safely' },
  { key: 'alerting', label: 'Alerting', tooltip: 'Alerting — getting woken up for the right reasons' },
  { key: 'full-stack', label: 'Full Stack', tooltip: 'Your production observability stack' },
]

/* ─── Stage 1: Silent Failure ─── */
function SilentFailureViz({ active }) {
  const [weekIndex, setWeekIndex] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setWeekIndex(0)
    if (!active) return
    timersRef.current.push(setTimeout(() => setWeekIndex(1), 1200))
    timersRef.current.push(setTimeout(() => setWeekIndex(2), 2400))
    return clearTimers
  }, [active])

  const leftMetrics = [
    { label: 'Uptime', value: '99.9%', status: 'green' },
    { label: 'Error rate', value: '0.08%', status: 'green' },
    { label: 'Avg response', value: '182ms', status: 'green' },
    { label: 'Requests today', value: '2,041', status: 'green' },
  ]

  const rightMetrics = [
    { label: 'Answer quality', value: weekIndex < 1 ? '87%' : weekIndex < 2 ? '74%' : '61%', status: weekIndex < 1 ? 'green' : weekIndex < 2 ? 'amber' : 'red' },
    { label: 'Hallucination rate', value: weekIndex < 1 ? '2.1%' : weekIndex < 2 ? '5.4%' : '8.3%', status: weekIndex < 1 ? 'green' : weekIndex < 2 ? 'amber' : 'red' },
    { label: 'User satisfaction', value: weekIndex < 1 ? '4.2/5' : weekIndex < 2 ? '3.6/5' : '3.1/5', status: weekIndex < 1 ? 'green' : weekIndex < 2 ? 'amber' : 'red' },
    { label: 'Escalation rate', value: weekIndex < 1 ? '5%' : weekIndex < 2 ? '9%' : '14%', status: weekIndex < 1 ? 'green' : weekIndex < 2 ? 'amber' : 'red' },
  ]

  const weeks = ['Week 1', 'Week 2', 'Week 3']

  return (
    <div>
      <div className="aip-dashboard-panels">
        <div className="aip-dashboard-panel">
          <div className="aip-panel-header aip-panel-header-amber">What most teams monitor</div>
          <div className="aip-panel-body">
            <div className="aip-metric-grid">
              {leftMetrics.map((m) => (
                <div key={m.label} className="aip-metric-card aip-metric-card-healthy">
                  <div className="aip-metric-label">{m.label}</div>
                  <div className={`aip-metric-value aip-metric-value-green`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="aip-dashboard-panel">
          <div className="aip-panel-header aip-panel-header-red">What is actually happening</div>
          <div className="aip-panel-body">
            <div className="aip-metric-grid">
              {rightMetrics.map((m) => (
                <div key={m.label} className={`aip-metric-card aip-metric-card-${m.status === 'green' ? 'healthy' : m.status === 'amber' ? 'warning' : 'critical'}`}>
                  <div className="aip-metric-label">{m.label}</div>
                  <div className={`aip-metric-value aip-metric-value-${m.status === 'green' ? 'green' : m.status === 'amber' ? 'amber' : 'red'}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="aip-timeline">
        {weeks.map((w, i) => (
          <div
            key={w}
            className="aip-timeline-bar"
            style={{
              height: `${i <= weekIndex ? 100 : 30}%`,
              background: i <= weekIndex ? (i === 0 ? '#34C759' : i === 1 ? '#FF9500' : '#FF3B30') : 'var(--bg-surface)',
              opacity: i <= weekIndex ? 1 : 0.4,
            }}
            title={w}
          />
        ))}
      </div>
      <div className="aip-timeline-labels">
        {weeks.map((w) => <span key={w}>{w}</span>)}
      </div>
      <p className="aip-caption">Without AI-specific metrics, you are flying blind.</p>
    </div>
  )
}

/* ─── Stage 2: Quality Metrics ─── */
function QualityMetricsViz({ active }) {
  const [evalRunning, setEvalRunning] = useState(false)
  const [evalStep, setEvalStep] = useState(-1)
  const [expandedCard, setExpandedCard] = useState(null)
  const [evalQuestion, setEvalQuestion] = useState('')
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) {
      clearTimers()
      setEvalRunning(false)
      setEvalStep(-1)
    }
    return clearTimers
  }, [active])

  const sparklines = [
    {
      name: 'LLM Judge Score',
      current: 71,
      color: '#FF9500',
      threshold: 80,
      points: [89, 88, 87, 86, 85, 83, 82, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 71, 71, 71, 71],
      status: 'Below threshold for 4 days',
      statusColor: 'amber',
    },
    {
      name: 'Thumbs Down Rate',
      current: '12.3%',
      color: '#FF9500',
      threshold: 8,
      points: [4, 4.2, 4.5, 4.8, 5.1, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.3, 12.3],
      status: 'Above threshold for 6 days',
      statusColor: 'amber',
    },
    {
      name: 'Escalation Rate',
      current: '14.1%',
      color: '#FF3B30',
      threshold: 10,
      points: [6, 6, 6.2, 6.5, 6.8, 7, 7.2, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.8, 12.5, 13, 13.5, 14, 14.1],
      status: 'Above threshold for 3 days',
      statusColor: 'red',
    },
  ]

  const flaggedResponses = [
    {
      user: 'Does the Pro plan include API access?',
      ai: 'Yes, API access is included in all plans.',
      verdict: 'Faithfulness FAIL',
      correct: 'API access requires Enterprise plan',
      detail: 'The model retrieved a general features doc but ignored the plan-specific restrictions. This is a common failure when retrieval returns top-level feature lists without tier filtering.',
    },
    {
      user: 'How do I export my data?',
      ai: 'You can export data from Settings > Data > Export. Choose CSV or JSON format.',
      verdict: 'Completeness FAIL',
      correct: 'Export is only available on paid plans',
      detail: 'The answer is technically correct but omits a critical constraint. Completeness evaluation checks whether important caveats are included.',
    },
    {
      user: 'What is your uptime SLA?',
      ai: 'We guarantee 99.9% uptime for all plans.',
      verdict: 'Faithfulness FAIL',
      correct: '99.9% SLA only on Enterprise plan',
      detail: 'The model conflated Enterprise-specific guarantees with general availability. This error pattern recurs when pricing/tier documentation is chunked without plan-level metadata.',
    },
  ]

  const evalScores = [
    { label: 'Faithfulness', value: 45, color: '#FF3B30' },
    { label: 'Relevance', value: 82, color: '#34C759' },
    { label: 'Completeness', value: 58, color: '#FF9500' },
  ]

  function runEval() {
    if (evalRunning) return
    setEvalRunning(true)
    setEvalStep(0)
    clearTimers()
    timersRef.current.push(setTimeout(() => setEvalStep(1), 800))
    timersRef.current.push(setTimeout(() => setEvalStep(2), 1600))
    timersRef.current.push(setTimeout(() => setEvalStep(3), 2400))
  }

  function renderSparkline(s) {
    const max = Math.max(...s.points, s.threshold || 0) * 1.1
    const w = 200
    const h = 40
    const pts = s.points.map((v, i) => `${(i / (s.points.length - 1)) * w},${h - (v / max) * h}`).join(' ')
    const threshY = s.threshold ? h - (s.threshold / max) * h : null
    return (
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {threshY != null && (
          <line x1="0" y1={threshY} x2={w} y2={threshY} stroke="#FF3B30" className="aip-sparkline-threshold" />
        )}
        <polyline points={pts} stroke={s.color} className="aip-sparkline-line aip-sparkline-line-animated" />
      </svg>
    )
  }

  return (
    <div>
      <div className="aip-chart-panel" style={{ marginBottom: 20 }}>
        <div className="aip-chart-header">Live quality monitoring &mdash; Aria</div>
        <div className="aip-chart-body">
          {sparklines.map((s) => (
            <div key={s.name} className="aip-sparkline-row">
              <div className="aip-sparkline-info">
                <div className="aip-sparkline-name">{s.name}</div>
                <div className={`aip-sparkline-current aip-metric-value-${s.statusColor}`}>{s.current}{typeof s.current === 'number' ? '%' : ''}</div>
              </div>
              <div className="aip-sparkline-chart">{active && renderSparkline(s)}</div>
              <div className="aip-sparkline-status">
                {s.statusColor === 'red' ? <CrossIcon size={14} color="#FF3B30" /> : <WarningIcon size={14} color="#FF9500" />}
                <span style={{ color: s.statusColor === 'red' ? '#FF3B30' : '#FF9500' }}>{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="aip-section-heading">Sample flagged responses</div>
      <div className="aip-flagged-cards">
        {flaggedResponses.map((r, i) => (
          <div key={i} className="aip-flagged-card" onClick={() => setExpandedCard(expandedCard === i ? null : i)}>
            <div className="aip-flagged-label">User</div>
            <div className="aip-flagged-text">{r.user}</div>
            <div className="aip-flagged-label" style={{ marginTop: 8 }}>Aria</div>
            <div className="aip-flagged-text">{r.ai}</div>
            <div className="aip-flagged-verdict">
              <CrossIcon size={14} color="#FF3B30" />
              <span style={{ color: '#FF3B30' }}>{r.verdict}</span>
            </div>
            <div className="aip-flagged-correct">Correct: {r.correct}</div>
            {expandedCard === i && (
              <div className="aip-flagged-detail">{r.detail}</div>
            )}
          </div>
        ))}
      </div>

      <div className="aip-eval-runner">
        <div className="aip-eval-runner-title">Run a spot eval</div>
        <input
          className="aip-eval-input"
          placeholder="Type a question to evaluate..."
          value={evalQuestion}
          onChange={(e) => setEvalQuestion(e.target.value)}
        />
        {evalQuestion.length > 5 && (
          <>
            <div className="aip-eval-answer">
              Aria would respond based on retrieved documentation. The judge evaluates faithfulness, relevance, and completeness against the source material.
            </div>
            <button className="aip-run-btn" onClick={runEval} disabled={evalRunning && evalStep < 3} style={{ marginTop: 8 }}>
              {evalRunning ? 'Evaluating...' : 'Run evaluation'}
            </button>
          </>
        )}
        {evalStep >= 0 && (
          <div className="aip-eval-scores">
            {evalScores.map((s, i) => (
              <div key={s.label} className="aip-eval-score-row" style={{ opacity: evalStep >= i ? 1 : 0.3, transition: 'opacity 0.4s ease' }}>
                <span className="aip-eval-score-label">{s.label}</span>
                <div className="aip-eval-score-bar">
                  <div
                    className="aip-eval-score-fill"
                    style={{ width: evalStep >= i ? `${s.value}%` : '0%', background: s.color }}
                  />
                </div>
                <span className="aip-eval-score-value" style={{ color: s.color }}>{evalStep >= i ? s.value : '--'}</span>
              </div>
            ))}
          </div>
        )}
        {evalStep >= 3 && (
          <div className={`aip-eval-verdict ${evalScores[0].value < 70 ? 'aip-eval-verdict-fail' : 'aip-eval-verdict-pass'}`}>
            <CrossIcon size={16} color="#FF3B30" />
            Overall: Needs improvement &mdash; faithfulness below threshold
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 3: Latency & Cost ─── */
function LatencyCostViz({ active }) {
  const [calcRequests, setCalcRequests] = useState(2000)
  const [calcInput, setCalcInput] = useState(2100)
  const [calcOutput, setCalcOutput] = useState(480)
  const [calcModel, setCalcModel] = useState('gpt-4o-mini')

  const modelPricing = {
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4o': { input: 2.50, output: 10.0 },
    'claude-3-5-sonnet': { input: 3.00, output: 15.0 },
  }

  const pricing = modelPricing[calcModel]
  const dailyCost = ((calcInput / 1000000) * pricing.input + (calcOutput / 1000000) * pricing.output) * calcRequests
  const monthlyCost = dailyCost * 30
  const costPer1k = (dailyCost / calcRequests) * 1000

  const latencyP50 = 420
  const latencyP95 = 1240
  const latencyP99 = 3800

  const costBars = [32, 35, 38, 41, 39, 44, 47, 42, 45, 48, 43, 46, 50, 47]
  const budget = 60

  const donutData = [
    { label: 'System prompt', pct: 28, color: '#5856D6' },
    { label: 'Retrieved chunks', pct: 45, color: '#FF9500' },
    { label: 'User query', pct: 8, color: '#34C759' },
    { label: 'Conversation history', pct: 19, color: '#AF52DE' },
  ]

  function renderDonut() {
    const r = 40
    const cx = 50
    const cy = 50
    let cumAngle = -90
    const segments = donutData.map((d) => {
      const startAngle = cumAngle
      const sweepAngle = (d.pct / 100) * 360
      cumAngle += sweepAngle
      const startRad = (startAngle * Math.PI) / 180
      const endRad = ((startAngle + sweepAngle) * Math.PI) / 180
      const x1 = cx + r * Math.cos(startRad)
      const y1 = cy + r * Math.sin(startRad)
      const x2 = cx + r * Math.cos(endRad)
      const y2 = cy + r * Math.sin(endRad)
      const largeArc = sweepAngle > 180 ? 1 : 0
      return (
        <path
          key={d.label}
          d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
          fill={d.color}
          stroke="var(--bg-card)"
          strokeWidth="2"
        />
      )
    })
    return (
      <svg viewBox="0 0 100 100" width="100" height="100">
        {segments}
        <circle cx={cx} cy={cy} r="22" fill="var(--bg-card)" />
      </svg>
    )
  }

  return (
    <div>
      <div className="aip-chart-panels">
        <div className="aip-chart-panel">
          <div className="aip-chart-header">Latency</div>
          <div className="aip-chart-body">
            <div className="aip-chart-values">
              <div className="aip-chart-stat">
                <span className="aip-chart-stat-label">P50</span>
                <span className="aip-chart-stat-value aip-metric-value-green">{latencyP50}ms</span>
              </div>
              <div className="aip-chart-stat">
                <span className="aip-chart-stat-label">P95</span>
                <span className="aip-chart-stat-value aip-metric-value-amber">{latencyP95}ms</span>
              </div>
              <div className="aip-chart-stat">
                <span className="aip-chart-stat-label">P99</span>
                <span className="aip-chart-stat-value aip-metric-value-red">{latencyP99}ms</span>
              </div>
            </div>
            <div className="aip-bar-chart">
              {Array.from({ length: 7 }, (_, i) => {
                const p50h = 20 + Math.random() * 10
                const p95h = 45 + Math.random() * 15
                const p99h = 70 + Math.random() * 25
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, height: '100%', justifyContent: 'flex-end' }}>
                    <div className="aip-bar" style={{ height: `${p99h}%`, background: '#FF3B30', opacity: 0.3 }} />
                    <div className="aip-bar" style={{ height: `${p95h}%`, background: '#FF9500', opacity: 0.5 }} />
                    <div className="aip-bar" style={{ height: `${p50h}%`, background: '#34C759' }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="aip-chart-panel">
          <div className="aip-chart-header">Daily cost</div>
          <div className="aip-chart-body">
            <div className="aip-chart-values">
              <div className="aip-chart-stat">
                <span className="aip-chart-stat-label">Current</span>
                <span className="aip-chart-stat-value aip-metric-value-green">$47.20/day</span>
              </div>
              <div className="aip-chart-stat">
                <span className="aip-chart-stat-label">Budget</span>
                <span className="aip-chart-stat-value">$60/day</span>
              </div>
            </div>
            <div className="aip-bar-chart">
              {costBars.map((v, i) => (
                <div
                  key={i}
                  className="aip-bar"
                  style={{
                    height: `${(v / budget) * 100}%`,
                    background: v > budget ? '#FF3B30' : v > budget * 0.85 ? '#FF9500' : '#34C759',
                  }}
                />
              ))}
            </div>
            <p className="aip-caption">Projected monthly: $1,416 &mdash; within budget</p>
          </div>
        </div>

        <div className="aip-chart-panel">
          <div className="aip-chart-header">Token breakdown</div>
          <div className="aip-chart-body">
            <div className="aip-donut-wrap">
              {renderDonut()}
              <div className="aip-donut-legend">
                {donutData.map((d) => (
                  <div key={d.label} className="aip-donut-item">
                    <span className="aip-donut-swatch" style={{ background: d.color }} />
                    {d.label}: {d.pct}%
                  </div>
                ))}
              </div>
            </div>
            <div className="how-info-tip" style={{ marginTop: 12 }}>
              <TipIcon size={16} color="#eab308" />
              Reducing retrieved chunks from 5 to 3 would save approximately 18% of input token costs.
            </div>
          </div>
        </div>
      </div>

      <div className="aip-calculator">
        <div className="aip-calculator-title">Cost calculator</div>
        <div className="aip-calc-sliders">
          <div className="aip-calc-slider-row">
            <span className="aip-calc-slider-label">Requests/day</span>
            <input type="range" className="aip-calc-slider-input" min="100" max="10000" step="100" value={calcRequests} onChange={(e) => setCalcRequests(+e.target.value)} />
            <span className="aip-calc-slider-value">{calcRequests.toLocaleString()}</span>
          </div>
          <div className="aip-calc-slider-row">
            <span className="aip-calc-slider-label">Avg input tokens</span>
            <input type="range" className="aip-calc-slider-input" min="100" max="8000" step="100" value={calcInput} onChange={(e) => setCalcInput(+e.target.value)} />
            <span className="aip-calc-slider-value">{calcInput.toLocaleString()}</span>
          </div>
          <div className="aip-calc-slider-row">
            <span className="aip-calc-slider-label">Avg output tokens</span>
            <input type="range" className="aip-calc-slider-input" min="50" max="4000" step="50" value={calcOutput} onChange={(e) => setCalcOutput(+e.target.value)} />
            <span className="aip-calc-slider-value">{calcOutput.toLocaleString()}</span>
          </div>
          <div className="aip-calc-slider-row">
            <span className="aip-calc-slider-label">Model</span>
            <select className="aip-calc-model-select" value={calcModel} onChange={(e) => setCalcModel(e.target.value)}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="claude-3-5-sonnet">claude-3.5-sonnet</option>
            </select>
          </div>
        </div>
        <div className="aip-calc-results">
          <div className="aip-calc-result">
            <div className="aip-calc-result-label">Daily cost</div>
            <div className="aip-calc-result-value">${dailyCost.toFixed(2)}</div>
          </div>
          <div className="aip-calc-result">
            <div className="aip-calc-result-label">Monthly cost</div>
            <div className="aip-calc-result-value">${monthlyCost.toFixed(0)}</div>
          </div>
          <div className="aip-calc-result">
            <div className="aip-calc-result-label">Per 1,000 queries</div>
            <div className="aip-calc-result-value">${costPer1k.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage 4: Drift Detection ─── */
function DriftDetectionViz({ active }) {
  const [visibleEvents, setVisibleEvents] = useState(0)
  const [driftAnswers, setDriftAnswers] = useState({})
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    clearTimers()
    setVisibleEvents(0)
    if (!active) return
    timersRef.current.push(setTimeout(() => setVisibleEvents(1), 600))
    timersRef.current.push(setTimeout(() => setVisibleEvents(2), 1400))
    timersRef.current.push(setTimeout(() => setVisibleEvents(3), 2200))
    return clearTimers
  }, [active])

  const events = [
    {
      day: 'Day 31',
      type: 'amber',
      title: 'Data drift detected',
      desc: 'Retrieval source age shift: docs older than 60 days jumped from 20% to 61%. Knowledge base growing stale.',
      action: 'Re-ingest updated pricing docs. Add docs from new features launched last month.',
    },
    {
      day: 'Day 58',
      type: 'amber',
      title: 'Concept drift detected',
      desc: 'New query cluster appeared: "API integration questions" grew from 0% to 18% of queries. Eval coverage for this topic: 0%.',
      action: 'Add 20 API integration evals. Add API docs to knowledge base.',
    },
    {
      day: 'Day 74',
      type: 'red',
      title: 'Model drift detected',
      desc: 'Regression eval score dropped from 88% to 71% overnight. Provider updated model on Day 74.',
      action: 'Pin to specific model version. Re-tune system prompt for new model behavior.',
    },
  ]

  const questions = [
    {
      text: 'Are old docs being retrieved more often?',
      options: ['Yes', 'No', 'Not tracking'],
    },
    {
      text: 'Are new question types appearing?',
      options: ['Yes', 'No', 'Not tracking'],
    },
    {
      text: 'Did eval scores drop recently?',
      options: ['Yes', 'No', 'Not tracking'],
    },
  ]

  const allAnswered = Object.keys(driftAnswers).length === 3

  function getDriftDiagnosis() {
    if (!allAnswered) return null
    if (driftAnswers[0] === 'Yes') return { type: 'Data Drift', desc: 'Your knowledge base is stale. Re-ingest updated documents and add effective_date metadata to your chunks.' }
    if (driftAnswers[1] === 'Yes') return { type: 'Concept Drift', desc: 'Users are asking new types of questions. Expand your eval set and add documentation for the new topic clusters.' }
    if (driftAnswers[2] === 'Yes') return { type: 'Model Drift', desc: 'Your LLM provider likely updated the model. Pin to a specific version and re-run your full eval suite.' }
    if (driftAnswers[0] === 'Not tracking' || driftAnswers[1] === 'Not tracking' || driftAnswers[2] === 'Not tracking') return { type: 'Insufficient Monitoring', desc: 'You are not tracking enough signals to detect drift. Start with retrieval source age and regression evals.' }
    return { type: 'No Drift Detected', desc: 'Signals look healthy. Keep monitoring and re-check weekly.' }
  }

  return (
    <div>
      <div className="aip-drift-timeline">
        <div className="aip-drift-line" />
        {events.map((e, i) => (
          <div key={e.day} className={`aip-drift-event ${i < visibleEvents ? 'aip-drift-event-visible' : ''}`}>
            <div className={`aip-drift-dot aip-drift-dot-${e.type}`} />
            <div className="aip-drift-day">{e.day}</div>
            <div className="aip-drift-title">{e.title}</div>
            <div className="aip-drift-desc">{e.desc}</div>
            <div className="aip-drift-action">{e.action}</div>
          </div>
        ))}
      </div>

      <div className="aip-drift-detector">
        <div className="aip-eval-runner-title">Diagnose Aria&rsquo;s current state</div>
        {questions.map((q, qi) => (
          <div key={qi} className="aip-drift-question">
            <div className="aip-drift-question-text">{q.text}</div>
            <div className="aip-drift-options">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  className={`aip-drift-option ${driftAnswers[qi] === opt ? 'aip-drift-option-selected' : ''}`}
                  onClick={() => setDriftAnswers((prev) => ({ ...prev, [qi]: opt }))}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
        {allAnswered && getDriftDiagnosis() && (
          <div className="aip-drift-result">
            <div className="aip-drift-result-title">{getDriftDiagnosis().type}</div>
            <div className="aip-drift-result-desc">{getDriftDiagnosis().desc}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 5: A/B Testing ─── */
function ABTestingViz({ active }) {
  const [phase, setPhase] = useState(0)
  const [skippedShadow, setSkippedShadow] = useState(false)

  useEffect(() => {
    if (!active) {
      setPhase(0)
      setSkippedShadow(false)
    }
  }, [active])

  const compareData = [
    { metric: 'LLM Judge', control: '71%', challenger: '84%', winner: 'Challenger' },
    { metric: 'Faithfulness', control: '78%', challenger: '91%', winner: 'Challenger' },
    { metric: 'Relevance', control: '82%', challenger: '80%', winner: 'Control' },
    { metric: 'Avg length', control: '280 tok', challenger: '340 tok', winner: '' },
    { metric: 'Cost/query', control: '$0.023', challenger: '$0.028', winner: 'Control' },
  ]

  function handlePhaseDecision(proceed) {
    if (phase === 0 && !proceed) {
      setSkippedShadow(true)
      setPhase(1)
      return
    }
    if (phase < 3) setPhase(phase + 1)
  }

  const splits = [
    { control: 100, challenger: 0, label: 'Shadow: all traffic to Control' },
    { control: 95, challenger: 5, label: 'Canary: 5% to Challenger' },
    { control: 50, challenger: 50, label: 'Rollout: 50/50 split' },
    { control: 0, challenger: 100, label: 'Complete: Challenger is new Control' },
  ]

  return (
    <div className="aip-ab-phases">
      <div className="aip-section-heading">Proposed change: add structured output format to Aria&rsquo;s system prompt</div>

      {/* Phase 1 - Shadow */}
      <div className={`aip-ab-phase ${phase > 0 ? '' : ''}`}>
        <div className="aip-ab-phase-header">
          Phase 1 &mdash; Shadow Test
          {phase > 0 && <span className="aip-badge aip-badge-green"><CheckIcon size={12} color="#34C759" /> Done</span>}
        </div>
        <div className="aip-ab-phase-body">
          <div className="aip-traffic-split">
            <div className="aip-traffic-control" style={{ width: `${splits[0].control}%` }}>Control 100%</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0' }}>
            All traffic goes to Control. Shadow copy also processes through Challenger. 1,000 queries compared offline.
          </p>

          <table className="aip-compare-table">
            <thead>
              <tr><th>Metric</th><th>Control</th><th>Challenger</th><th>Winner</th></tr>
            </thead>
            <tbody>
              {compareData.map((r) => (
                <tr key={r.metric}>
                  <td>{r.metric}</td>
                  <td>{r.control}</td>
                  <td>{r.challenger}</td>
                  <td className={r.winner === 'Challenger' ? 'aip-compare-winner' : ''}>{r.winner}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {phase === 0 && (
            <div className="aip-decision-gate">
              <button className="aip-decision-btn aip-decision-btn-yes" onClick={() => handlePhaseDecision(true)}>Proceed to canary</button>
              <button className="aip-decision-btn aip-decision-btn-no" onClick={() => handlePhaseDecision(false)}>Skip to canary</button>
            </div>
          )}
        </div>
      </div>

      {skippedShadow && phase >= 1 && (
        <div className="how-info-tip" style={{ margin: '12px 0', background: 'rgba(255, 59, 48, 0.06)', borderLeftColor: '#FF3B30' }}>
          <WarningIcon size={16} color="#FF3B30" />
          Skipping shadow testing is the most common cause of production AI incidents from changes. Always shadow test first.
        </div>
      )}

      {/* Phase 2 - Canary */}
      <div className={`aip-ab-phase ${phase < 1 ? 'aip-ab-phase-locked' : ''}`}>
        <div className="aip-ab-phase-header">
          Phase 2 &mdash; Canary (5%)
          {phase > 1 && <span className="aip-badge aip-badge-green"><CheckIcon size={12} color="#34C759" /> Done</span>}
        </div>
        {phase >= 1 && (
          <div className="aip-ab-phase-body">
            <div className="aip-traffic-split">
              <div className="aip-traffic-control" style={{ width: `${splits[1].control}%` }}>Control {splits[1].control}%</div>
              <div className="aip-traffic-challenger" style={{ width: `${splits[1].challenger}%` }}>{splits[1].challenger}%</div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '8px 0' }}>
              24h metrics: Challenger quality holding at 84%. No regressions detected.
            </p>
            {phase === 1 && (
              <div className="aip-decision-gate">
                <button className="aip-decision-btn aip-decision-btn-yes" onClick={() => handlePhaseDecision(true)}>Expand rollout</button>
                <button className="aip-decision-btn aip-decision-btn-no" onClick={() => setPhase(0)}>Roll back</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phase 3 - Full rollout */}
      <div className={`aip-ab-phase ${phase < 2 ? 'aip-ab-phase-locked' : ''}`}>
        <div className="aip-ab-phase-header">
          Phase 3 &mdash; Full Rollout
          {phase > 2 && <span className="aip-badge aip-badge-green"><CheckIcon size={12} color="#34C759" /> Done</span>}
        </div>
        {phase >= 2 && (
          <div className="aip-ab-phase-body">
            <div className="aip-traffic-split">
              <div className="aip-traffic-control" style={{ width: phase >= 3 ? '0%' : `${splits[2].control}%` }}>{phase >= 3 ? '' : `Control ${splits[2].control}%`}</div>
              <div className="aip-traffic-challenger" style={{ width: phase >= 3 ? '100%' : `${splits[2].challenger}%` }}>{phase >= 3 ? 'New Control 100%' : `Challenger ${splits[2].challenger}%`}</div>
            </div>
            {phase === 2 && (
              <div className="aip-decision-gate">
                <button className="aip-decision-btn aip-decision-btn-yes" onClick={() => handlePhaseDecision(true)}>Deploy 100%</button>
                <button className="aip-decision-btn aip-decision-btn-no" onClick={() => setPhase(1)}>Roll back to canary</button>
              </div>
            )}
            {phase >= 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 14, fontWeight: 600, color: '#34C759' }}>
                <CheckIcon size={16} color="#34C759" /> Improvement deployed safely: quality 71% &rarr; 84%
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Stage 6: Alerting ─── */
function AlertingViz({ active }) {
  const [alertMetric, setAlertMetric] = useState('LLM Judge Score')
  const [alertCondition, setAlertCondition] = useState('drops below')
  const [alertValue, setAlertValue] = useState('75')
  const [alertWindow, setAlertWindow] = useState('6 hours')
  const [alertSeverity, setAlertSeverity] = useState('High')
  const [activeTemplate, setActiveTemplate] = useState(null)

  const templates = {
    'Quality Drop': { metric: 'LLM Judge Score', condition: 'drops below', value: '75', window: '6 hours', severity: 'High' },
    'Cost Spike': { metric: 'Daily Cost', condition: 'rises above', value: '80', window: '24 hours', severity: 'Critical' },
    'Model Drift': { metric: 'Eval Suite Score', condition: 'drops below', value: '80', window: '24 hours', severity: 'High' },
  }

  function applyTemplate(name) {
    const t = templates[name]
    setAlertMetric(t.metric)
    setAlertCondition(t.condition)
    setAlertValue(t.value)
    setAlertWindow(t.window)
    setAlertSeverity(t.severity)
    setActiveTemplate(name)
  }

  function getFireCount() {
    const v = parseFloat(alertValue)
    if (alertMetric === 'LLM Judge Score' && v >= 70 && v <= 80) return 3
    if (alertMetric === 'Daily Cost' && v >= 60 && v <= 90) return 2
    if (alertMetric === 'Eval Suite Score' && v >= 75 && v <= 85) return 4
    if (alertMetric === 'Thumbs Down Rate' && v >= 8 && v <= 15) return 5
    if (alertMetric === 'P99 Latency' && v >= 3000 && v <= 5000) return 3
    if (v <= 0) return 0
    return Math.floor(Math.random() * 8) + 1
  }

  const fireCount = getFireCount()

  const alertStack = [
    { metric: 'LLM Judge Score', threshold: '< 75% for 6h', severity: 'High', channel: 'Slack' },
    { metric: 'Thumbs Down Rate', threshold: '> 10% for 6h', severity: 'High', channel: 'Slack' },
    { metric: 'Daily Cost', threshold: '> $80/day', severity: 'Critical', channel: 'Page' },
    { metric: 'Eval Suite Score', threshold: 'Drops > 5% in 24h', severity: 'High', channel: 'Slack' },
    { metric: 'P99 Latency', threshold: '> 5,000ms for 1h', severity: 'Medium', channel: 'Email' },
  ]

  return (
    <div>
      <div className="aip-alert-builder">
        <div className="aip-alert-builder-title">Build your alert</div>

        <div className="aip-alert-templates">
          {Object.keys(templates).map((name) => (
            <button
              key={name}
              className={`aip-alert-template-btn ${activeTemplate === name ? 'aip-alert-template-btn-active' : ''}`}
              onClick={() => applyTemplate(name)}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="aip-alert-form">
          <div className="aip-alert-form-row">
            <span className="aip-alert-form-label">Metric</span>
            <select className="aip-alert-select" value={alertMetric} onChange={(e) => { setAlertMetric(e.target.value); setActiveTemplate(null) }}>
              <option>LLM Judge Score</option>
              <option>Thumbs Down Rate</option>
              <option>P99 Latency</option>
              <option>Daily Cost</option>
              <option>Escalation Rate</option>
              <option>Eval Suite Score</option>
            </select>
          </div>
          <div className="aip-alert-form-row">
            <span className="aip-alert-form-label">Condition</span>
            <select className="aip-alert-select" value={alertCondition} onChange={(e) => { setAlertCondition(e.target.value); setActiveTemplate(null) }}>
              <option>drops below</option>
              <option>rises above</option>
              <option>anomaly detected</option>
            </select>
          </div>
          <div className="aip-alert-form-row">
            <span className="aip-alert-form-label">Value</span>
            <input className="aip-alert-input" type="number" value={alertValue} onChange={(e) => { setAlertValue(e.target.value); setActiveTemplate(null) }} />
          </div>
          <div className="aip-alert-form-row">
            <span className="aip-alert-form-label">Window</span>
            <select className="aip-alert-select" value={alertWindow} onChange={(e) => { setAlertWindow(e.target.value); setActiveTemplate(null) }}>
              <option>1 hour</option>
              <option>6 hours</option>
              <option>24 hours</option>
            </select>
          </div>
          <div className="aip-alert-form-row">
            <span className="aip-alert-form-label">Severity</span>
            <select className="aip-alert-select" value={alertSeverity} onChange={(e) => { setAlertSeverity(e.target.value); setActiveTemplate(null) }}>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Info</option>
            </select>
          </div>
        </div>

        <div className="aip-alert-preview">
          <div className="aip-alert-preview-title">Alert preview</div>
          <div className="aip-alert-preview-text">
            Alert when <strong>{alertMetric}</strong> {alertCondition} <strong>{alertValue}{alertMetric.includes('Rate') || alertMetric.includes('Score') ? '%' : alertMetric.includes('Cost') ? '$' : alertMetric.includes('Latency') ? 'ms' : ''}</strong> for {alertWindow}.
            Severity: <strong>{alertSeverity}</strong>.
          </div>
          <div className="aip-alert-fire-count" style={{ color: fireCount > 10 ? '#FF3B30' : fireCount === 0 ? '#FF9500' : '#34C759' }}>
            {fireCount > 10 ? <WarningIcon size={14} color="#FF3B30" /> : fireCount === 0 ? <WarningIcon size={14} color="#FF9500" /> : <CheckIcon size={14} color="#34C759" />}
            This alert would have fired {fireCount} times in 30 days.
            {fireCount > 10 && ' Warning: may cause alert fatigue.'}
            {fireCount === 0 && ' Warning: threshold may be too loose.'}
            {fireCount >= 2 && fireCount <= 5 && ' Good: actionable alert cadence.'}
          </div>
        </div>
      </div>

      <div className="aip-section-heading">Aria&rsquo;s recommended alert stack</div>
      <div className="aip-alert-stack">
        {alertStack.map((a) => (
          <div key={a.metric} className="aip-alert-stack-card">
            <span className="aip-alert-stack-metric">{a.metric}</span>
            <span className="aip-alert-stack-threshold">{a.threshold}</span>
            <span className={`aip-alert-stack-severity aip-severity-${a.severity.toLowerCase()}`}>{a.severity}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Stage 7: Full Stack ─── */
function FullStackViz({ active }) {
  const [openSection, setOpenSection] = useState(null)
  const [showTimeline, setShowTimeline] = useState(false)
  const [checkedItems, setCheckedItems] = useState(new Set())

  useEffect(() => {
    if (!active) {
      setOpenSection(null)
      setShowTimeline(false)
      setCheckedItems(new Set())
    }
  }, [active])

  const sections = [
    {
      name: 'Quality',
      status: 'green',
      metrics: [
        { name: 'Judge score', value: '88%', color: '#34C759' },
        { name: 'Thumbs down', value: '4.2%', color: '#34C759' },
        { name: 'Escalation', value: '6.1%', color: '#34C759' },
        { name: 'Trend', value: 'Rising', color: '#34C759' },
      ],
    },
    {
      name: 'Operations',
      status: 'green',
      metrics: [
        { name: 'P50', value: '380ms', color: '#34C759' },
        { name: 'P95', value: '940ms', color: '#34C759' },
        { name: 'P99', value: '2,100ms', color: '#FF9500' },
        { name: 'Daily cost', value: '$43.20', color: '#34C759' },
      ],
    },
    {
      name: 'Drift',
      status: 'green',
      metrics: [
        { name: 'Data freshness', value: '87%', color: '#34C759' },
        { name: 'Topic coverage', value: '94%', color: '#34C759' },
        { name: 'Model version', value: 'Pinned', color: '#34C759' },
      ],
    },
    {
      name: 'A/B Tests',
      status: 'green',
      metrics: [
        { name: 'Active experiments', value: '1', color: '#5856D6' },
        { name: 'Current canary', value: 'Reranker (12%)', color: '#34C759' },
        { name: 'Status', value: 'Healthy, 6h', color: '#34C759' },
      ],
    },
    {
      name: 'Alerts',
      status: 'green',
      metrics: [
        { name: 'Last 7 days', value: '3 fired', color: '#5856D6' },
        { name: 'Acknowledged', value: 'All', color: '#34C759' },
        { name: 'Unresolved', value: 'None', color: '#34C759' },
      ],
    },
  ]

  const checklistGroups = [
    { label: 'Week 1', items: ['User signal collection (thumbs up/down)', 'Cost tracking per query', 'Basic latency monitoring (P50/P95/P99)'] },
    { label: 'Month 1', items: ['LLM-as-judge on all conversations', 'Regression eval suite (nightly)', 'Threshold alerts on quality and cost', 'Model version pinning'] },
    { label: 'Month 2', items: ['Drift detection (data, concept, model)', 'Anomaly alerts', 'Query topic clustering'] },
    { label: 'Month 3', items: ['Shadow testing infrastructure', 'Canary deployment pipeline', 'Composite alerts'] },
  ]

  const totalItems = checklistGroups.reduce((sum, g) => sum + g.items.length, 0)

  function toggleCheck(item) {
    setCheckedItems((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const withoutEvents = [
    { text: 'Day 18: Pricing docs updated on website' },
    { text: 'Day 18-31: Users getting wrong pricing info' },
    { text: 'Day 25: Support tickets rising, CS team notices confusion' },
    { text: 'Day 28: Engineer gets Slack message: "Aria seems off"' },
    { text: 'Day 31: Root cause found. 13 days of wrong answers.' },
  ]

  const withEvents = [
    { text: 'Day 18, 14:00: Data drift alert fires' },
    { text: 'Day 18, 16:30: Fix deployed. Two hours of drift.' },
    { text: 'Day 21, 09:15: Regression eval alert fires' },
    { text: 'Day 21, 14:00: Model pinned, prompt re-tuned. Five hours of drift.' },
    { text: 'Day 21: Quality dashboard back to green.' },
  ]

  return (
    <div>
      <div className="aip-obs-sections">
        {sections.map((s) => (
          <div
            key={s.name}
            className={`aip-obs-section ${openSection === s.name ? 'aip-obs-section-open' : ''}`}
            onClick={() => setOpenSection(openSection === s.name ? null : s.name)}
          >
            <div className="aip-obs-section-header">
              <span>{s.name}</span>
              <span className={`aip-obs-status-dot aip-obs-status-${s.status}`} />
            </div>
            <div className="aip-obs-section-body">
              <div className="aip-obs-metrics">
                {s.metrics.map((m) => (
                  <div key={m.name} className="aip-obs-metric">
                    <span className="aip-obs-metric-name">{m.name}</span>
                    <span className="aip-obs-metric-value" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="aip-incident-btn" onClick={() => setShowTimeline(!showTimeline)}>
        {showTimeline ? 'Hide incident timeline' : 'The Aria incident: full timeline'}
      </button>

      {showTimeline && (
        <div className="aip-incident-timeline">
          <div className="aip-incident-col">
            <div className="aip-incident-col-header aip-incident-col-header-red">Without monitoring</div>
            <div className="aip-incident-events">
              {withoutEvents.map((e, i) => (
                <div key={i} className="aip-incident-event" style={{ animationDelay: `${i * 200}ms` }}>
                  <strong>{e.text.split(':')[0]}:</strong>{e.text.slice(e.text.indexOf(':') + 1)}
                </div>
              ))}
            </div>
          </div>
          <div className="aip-incident-col">
            <div className="aip-incident-col-header aip-incident-col-header-green">With full stack</div>
            <div className="aip-incident-events">
              {withEvents.map((e, i) => (
                <div key={i} className="aip-incident-event" style={{ animationDelay: `${i * 200}ms` }}>
                  <strong>{e.text.split(':')[0]}:</strong>{e.text.slice(e.text.indexOf(':') + 1)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="aip-checklist">
        <div className="aip-checklist-title">Build your stack</div>
        {checklistGroups.map((g) => (
          <div key={g.label} className="aip-checklist-group">
            <div className="aip-checklist-group-label">{g.label}</div>
            {g.items.map((item) => (
              <div key={item} className="aip-checklist-item" onClick={() => toggleCheck(item)}>
                <div className={`aip-checklist-box ${checkedItems.has(item) ? 'aip-checklist-box-checked' : ''}`}>
                  {checkedItems.has(item) && <CheckIcon size={12} color="#fff" />}
                </div>
                <span className="aip-checklist-text">{item}</span>
              </div>
            ))}
          </div>
        ))}
        <div className="aip-checklist-progress">
          <div className="aip-checklist-progress-bar">
            <div className="aip-checklist-progress-fill" style={{ width: `${(checkedItems.size / totalItems) * 100}%` }} />
          </div>
          <div className="aip-checklist-progress-label">
            {checkedItems.size === totalItems ? 'Production-ready observability' : `${checkedItems.size} / ${totalItems} items`}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stage content arrays ─── */

const STAGE_TOOLS = [
  [{ name: 'Datadog' }, { name: 'Grafana' }, { name: 'LangSmith' }, { name: 'Helicone' }, { name: 'Arize AI' }, { name: 'WhyLabs' }, { name: 'Weights & Biases' }, { name: 'Braintrust' }, { name: 'Honeycomb' }],
  [{ name: 'Braintrust' }, { name: 'LangSmith' }, { name: 'Ragas' }, { name: 'DeepEval' }, { name: 'UpTrain' }, { name: 'TruLens' }, { name: 'Promptfoo' }, { name: 'Helicone' }],
  [{ name: 'Helicone' }, { name: 'LangSmith' }, { name: 'OpenAI usage dashboard' }, { name: 'Anthropic console' }, { name: 'AWS Cost Explorer' }, { name: 'Datadog APM' }, { name: 'Grafana' }, { name: 'Prometheus' }],
  [{ name: 'WhyLabs' }, { name: 'Arize AI' }, { name: 'Evidently' }, { name: 'Fiddler AI' }, { name: 'LangSmith' }, { name: 'Braintrust' }, { name: 'Prometheus' }, { name: 'Grafana' }],
  [{ name: 'LaunchDarkly' }, { name: 'Split.io' }, { name: 'Statsig' }, { name: 'Eppo' }, { name: 'LangSmith experiments' }, { name: 'Braintrust experiments' }, { name: 'Honeycomb' }],
  [{ name: 'PagerDuty' }, { name: 'OpsGenie' }, { name: 'Datadog' }, { name: 'Grafana Alerting' }, { name: 'Slack webhooks' }, { name: 'LangSmith alerts' }, { name: 'Arize AI alerts' }, { name: 'AWS CloudWatch' }],
  [{ name: 'Datadog' }, { name: 'Grafana' }, { name: 'LangSmith' }, { name: 'Helicone' }, { name: 'Arize AI' }, { name: 'LaunchDarkly' }, { name: 'PagerDuty' }, { name: 'Braintrust' }],
]

/* ─── Stage content arrays ─── */

const STAGE_CONTENT = [
  // Stage 0 - Silent Failure
  {
    title: 'Your AI Is Failing and You Don\'t Know It',
    content: (
      <>
        <p>You ship your AI feature. Metrics look fine. Error rate: 0.1%. Uptime: 99.9%. Response time: 180ms. Everything looks healthy in your dashboard.</p>
        <p>But users are getting subtly wrong answers. The AI is confusing two similar product tiers. It is telling users they qualify for a feature that requires an upgrade. Some users are canceling because of advice the AI gave them confidently.</p>
        <p><strong>Your engineering dashboard never flagged anything.</strong></p>
        <p>This is the silent failure problem. Traditional software fails loudly: errors throw exceptions, logs capture them, alerts fire. AI fails quietly: a wrong answer does not throw an exception. A hallucinated fact does not generate a 500 error. The AI just keeps answering. Confidently. Wrongly.</p>
        <p className="aip-section-heading">The monitoring gap</p>
        <p>Most teams monitor their AI feature like software: uptime, error rate, response time, request count. These metrics tell you the AI is running. They tell you nothing about whether it is right. You need a second layer of monitoring: AI-specific metrics that measure quality, not just availability.</p>
        <p className="aip-section-heading">The Aria scenario</p>
        <p>Aria is a customer support chatbot deployed at NexaCo, answering 2,000 conversations per day using RAG. Engineering dashboard: all green. Support tickets about wrong answers: rising. No one connected these signals. By the end of this tutorial, you will have the monitoring stack that catches this incident in hours, not weeks.</p>
      </>
    ),
    tip: 'The most dangerous AI failures are not spectacular. They are subtle degradations that erode user trust slowly. By the time users complain loudly, the damage is done. The goal of AI monitoring is to catch degradation before users feel it.',
  },
  // Stage 1 - Quality Metrics
  {
    title: 'Measuring What Your AI Actually Says',
    content: (
      <>
        <p>Quality monitoring answers the most important question in AI production: <strong>is the AI giving correct, helpful answers?</strong></p>
        <p>This is hard to measure at scale because you cannot manually read 2,000 conversations a day. There is no ground truth for most open-ended questions. Quality is partially subjective.</p>
        <p className="aip-section-heading">1. LLM-as-judge</p>
        <p>Use a separate LLM to evaluate each response. Send the question, AI answer, and evaluation rubric. Get back a score with reasoning. Fast, scalable, surprisingly accurate. Best practice: calibrate judge against human labels. Metrics: faithfulness, relevance, completeness, groundedness.</p>
        <p className="aip-section-heading">2. User signals</p>
        <p>Thumbs up/down on responses. Follow-up questions (often signal confusion). Escalation to human agent (strong negative signal). Session abandonment. Repeat questions. Easier to collect, slower to accumulate, biased toward extremes &mdash; but high signal when patterns emerge.</p>
        <p className="aip-section-heading">3. Automated regression evals</p>
        <p>A fixed test set of questions with expected answers. Run against production daily. Alert if score drops below threshold. Catches regressions from model updates, prompt changes, or data changes. The most reliable quality signal you have.</p>
      </>
    ),
    tip: 'Start with user signals. They are free and already happening. Add LLM-as-judge for the queries where user signal is sparse. Add regression evals before any model or prompt change. Build all three over time — each catches different failure modes.',
  },
  // Stage 2 - Latency & Cost
  {
    title: 'The Operational Metrics That Kill Startups',
    content: (
      <>
        <p>Quality metrics tell you if your AI is right. Operational metrics tell you if you can afford to keep it running. Every request to an LLM costs money. Every token in, every token out, costs money.</p>
        <p className="aip-section-heading">1. Latency</p>
        <p>P50 latency: the median experience. P95: 1 in 20 users wait this long. P99: 1 in 100. Always track P95 and P99, not just average. Averages hide the tail experiences that users actually complain about.</p>
        <p className="aip-section-heading">2. Cost per query</p>
        <p>Total LLM spend divided by total queries. Track daily. Set budget alerts. Break down by input tokens, output tokens, embedding calls, reranker calls.</p>
        <p className="aip-section-heading">3. Token efficiency</p>
        <p>Track input token count per request. If rising, your RAG is retrieving too much. If very high, your system prompt grew. Output tokens divided by input tokens reveals bloated context vs. meaningful generation.</p>
      </>
    ),
    warning: 'Cost surprises are the most common AI production incident for early-stage teams. A single viral moment or a prompt that accidentally generates very long responses can multiply your monthly bill by 10x overnight. Set hard budget caps and alerts before you launch.',
  },
  // Stage 3 - Drift
  {
    title: 'When Your AI Stops Being Itself',
    content: (
      <>
        <p>You ship your AI. It works well. You move on. Three months later, something feels off. The answers are vaguer. Users are more confused. The AI seems to have changed. It probably has.</p>
        <p className="aip-section-heading">Type 1 &mdash; Data drift</p>
        <p>Your knowledge base changed but the AI did not. New product features launched. Old prices updated. The AI is still answering based on what it knew three months ago. Signal: answers about recent features are vague. Detection: compare retrieval source dates. Fix: refresh ingestion pipeline.</p>
        <p className="aip-section-heading">Type 2 &mdash; Concept drift</p>
        <p>User questions have changed, your AI has not. When you launched, users asked basic questions. Six months later, they ask about edge cases your eval set never covered. Signal: thumbs down rate rising on specific topics. Detection: cluster recent questions and compare distribution. Fix: expand eval set for new topics.</p>
        <p className="aip-section-heading">Type 3 &mdash; Model drift</p>
        <p>Your LLM provider updated the underlying model. Same API endpoint, different model behavior. Your carefully tuned prompts produce different output. Signal: regression eval scores drop suddenly. Detection: run evals on every model update. Fix: re-tune prompts, pin model versions.</p>
      </>
    ),
    tip: 'Model drift is the sneakiest. Providers update models silently — the same model string (e.g. gpt-4o) can behave differently month to month. Always pin to a specific model version in production (e.g. gpt-4o-2024-11-20) and only upgrade deliberately after running your full eval suite.',
  },
  // Stage 4 - A/B Testing
  {
    title: 'How to Improve Without Breaking Things',
    content: (
      <>
        <p>You have identified a quality problem. You have a fix: a new prompt, a new model, new chunking strategy. How do you deploy it safely? You A/B test it.</p>
        <p className="aip-section-heading">The shadow testing pattern</p>
        <p>Run new version in shadow mode. Send every production query to both versions. Neither version&rsquo;s answer reaches the user &mdash; only the control does. Compare outputs offline. Deploy only after shadow testing shows improvement with no regressions.</p>
        <p className="aip-section-heading">The canary pattern</p>
        <p>Route 5% of traffic to new version. Monitor quality metrics for 24-48 hours. If metrics hold or improve: increase to 20%, then 50%, then 100%. Rollback must be instant &mdash; feature flags, not code deployments.</p>
        <p className="aip-section-heading">What to A/B test</p>
        <p>System prompt changes. Model version upgrades. Chunk size changes. Number of retrieved chunks. Reranker on vs off. Response format changes.</p>
        <p className="aip-section-heading">What not to A/B test</p>
        <p>Fundamental architecture changes (shadow first). Changes affecting data privacy. Changes during incident response (fix first, optimise later).</p>
      </>
    ),
    tip: 'The minimum viable A/B test for AI: shadow test for 1,000 queries, run your eval suite on both sets of outputs, then canary at 5% with eval monitoring before any wider rollout. Skipping shadow testing is the most common cause of production AI incidents from changes.',
  },
  // Stage 5 - Alerting
  {
    title: 'Getting Woken Up for the Right Reasons',
    content: (
      <>
        <p>You have metrics. Now you need to know when those metrics are telling you something is wrong &mdash; before users tell you first.</p>
        <p className="aip-section-heading">1. Threshold alerts (start here)</p>
        <p>When metric X crosses value Y, alert. LLM judge score below 75%: alert. Thumbs down rate above 10%: alert. Simple to set up, first line of defence.</p>
        <p className="aip-section-heading">2. Anomaly alerts (smarter)</p>
        <p>When metric X deviates significantly from its recent baseline. No fixed threshold needed. Adapts to daily and weekly patterns. Best for metrics with natural variation.</p>
        <p className="aip-section-heading">3. Regression alerts</p>
        <p>When eval suite score drops by more than X% vs yesterday. Catches model drift and prompt regressions before users notice. Run evals on a schedule (daily minimum).</p>
        <p className="aip-section-heading">4. Composite alerts (most powerful)</p>
        <p>Alert only when multiple signals align. Example: judge score falls AND thumbs down rises AND escalation rises. Single metrics have noise. Multiple together are almost always real incidents.</p>
        <p className="aip-section-heading">Alert routing</p>
        <p>Severity 1 (critical): page on-call immediately. Severity 2 (high): Slack, respond in 1 hour. Severity 3 (medium): daily digest email. Severity 4 (info): dashboard only.</p>
      </>
    ),
    warning: 'Alert fatigue is a real production risk. An engineering team that receives 50 alerts per day starts ignoring all of them — including the important ones. Start with fewer, higher-confidence alerts. Add more only after proving they are actionable.',
  },
  // Stage 6 - Full Stack
  {
    title: 'Your Production Observability Stack',
    content: (
      <>
        <p>Every layer is in place. Let us see what full observability looks like &mdash; and run through the Aria incident from start to finish with the complete monitoring stack active.</p>
        <p className="aip-section-heading">The complete stack</p>
        <p><strong>Layer 1 &mdash; Quality:</strong> LLM-as-judge on 100% of conversations. Regression eval suite nightly. User signal collection.</p>
        <p><strong>Layer 2 &mdash; Operations:</strong> Latency P50, P95, P99. Cost per-query and daily total. Token efficiency.</p>
        <p><strong>Layer 3 &mdash; Drift:</strong> Retrieval source age distribution. Query topic clustering weekly. Model version pinned, eval on any change.</p>
        <p><strong>Layer 4 &mdash; A/B Safety:</strong> Shadow testing before any change. Canary at 5% before rollout. Instant rollback via feature flag.</p>
        <p><strong>Layer 5 &mdash; Alerting:</strong> Composite alerts on multiple signals. Severity routing. Monthly threshold review.</p>
      </>
    ),
    tip: 'Build this incrementally. Week 1: user signal collection and cost tracking. Month 1: LLM-as-judge and regression evals. Month 2: drift detection and anomaly alerts. Month 3: A/B infrastructure. Trying to build everything before launch means launching nothing.',
  },
]

const VISUALIZATIONS = [
  SilentFailureViz,
  QualityMetricsViz,
  LatencyCostViz,
  DriftDetectionViz,
  ABTestingViz,
  AlertingViz,
  FullStackViz,
]

const NEXT_LABELS = [
  'Quality metrics →',
  'Latency & cost →',
  'Drift detection →',
  'A/B testing →',
  'Alerting →',
  'Full stack →',
  'Test my knowledge →',
]

/* ─── Main Component ─── */
export default function AIInProduction({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ai-in-production', -1)
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
    if (stage === 1 && !dismissedTips.has('quality')) {
      setLearnTip({ key: 'quality', text: 'Click any flagged response card to see the full judge reasoning behind the score.' })
    } else if (stage === 4 && !dismissedTips.has('ab')) {
      setLearnTip({ key: 'ab', text: 'Try clicking No at the shadow test phase to see what happens when you skip straight to canary — it is a common mistake.' })
    } else if (stage === 6 && !dismissedTips.has('stack')) {
      setLearnTip({ key: 'stack', text: 'Click the Aria incident timeline button to see both paths — with and without monitoring.' })
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
        markModuleComplete('ai-in-production')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.aip-root')
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

  /* ─── Quiz Screen ─── */
  if (showQuiz) {
    return (
      <div className="how-llms aip-root quiz-fade-in">
        <Quiz
          questions={aiInProductionQuiz}
          tabName="AI in Production"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="ai-in-production"
        />
      </div>
    )
  }

  /* ─── Entry Screen ─── */
  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="ai-in-production" size={48} style={{ color: '#5856D6' }} />}
        title="AI in Production"
        subtitle="How to Know Your AI Feature Is Actually Working"
        description="You shipped it. Users are using it. But is it working? Most teams have no idea until something breaks badly enough for users to complain. Learn the monitoring, metrics and alerting that separate teams who know from teams who hope."
        buttonText="Start Monitoring"
        onStart={() => { setStage(0); markModuleStarted('ai-in-production') }}
      />
    )
  }

  const StageViz = VISUALIZATIONS[stage] || VISUALIZATIONS[0]
  const content = STAGE_CONTENT[stage] || STAGE_CONTENT[0]
  const tools = STAGE_TOOLS[stage] || []

  return (
    <div className={`how-llms aip-root ${fading ? 'how-fading' : ''}`}>

      {/* Welcome banner */}
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to AI in Production</strong> &mdash; This module covers what happens after you ship &mdash; the metrics, monitors and signals that tell you whether your AI feature is healthy, degrading, or silently failing. Each stage adds one layer to your production observability stack.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>7 stages</strong> of production AI monitoring</li>
              <li>Interact with <strong>dashboards, calculators, and alert builders</strong></li>
              <li>Build a complete <strong>observability stack</strong> for a real scenario</li>
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
            <div className="how-stepper aip-stepper">
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
                  <div className="aip-info-content">{content.content}</div>

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
          <div className="how-final-celebration">Your Production Observability Stack is Ready</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 24, textAlign: 'center' }}>
            You now have the five layers of AI production monitoring: quality, operations, drift, A/B safety, and alerting. The difference between teams that know and teams that hope is measured in hours, not weeks.
          </p>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="ai-in-production" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}
