import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { machineLearningQuiz } from './quizData.js'
import './MachineLearning.css'

const ML_TOOLS = {
  0: [
    { name: 'Scikit-learn', color: '#34C759', desc: 'Most popular ML library for Python' },
    { name: 'Python', color: '#8E8E93', desc: 'The dominant language for machine learning' },
    { name: 'Jupyter Notebooks', color: '#8E8E93', desc: 'Interactive coding environment for data science' },
  ],
  1: [
    { name: 'Scikit-learn', color: '#34C759', desc: 'Supports supervised, unsupervised, and more' },
    { name: 'PyTorch', color: '#AF52DE', desc: 'Deep learning framework by Meta' },
    { name: 'OpenAI Gym', color: '#34C759', desc: 'Reinforcement learning environments' },
  ],
  2: [
    { name: 'Scikit-learn', color: '#34C759', desc: 'Classification, regression, and evaluation tools' },
    { name: 'XGBoost', color: '#34C759', desc: 'Gradient boosting — best for tabular data' },
    { name: 'Pandas', color: '#34C759', desc: 'Data manipulation and analysis library' },
    { name: 'NumPy', color: '#34C759', desc: 'Numerical computing foundation for ML' },
  ],
  3: [
    { name: 'PyTorch', color: '#AF52DE', desc: 'Most popular deep learning framework' },
    { name: 'TensorFlow', color: '#AF52DE', desc: 'Google\'s ML framework for production' },
    { name: 'Keras', color: '#AF52DE', desc: 'High-level neural network API' },
    { name: 'FastAI', color: '#34C759', desc: 'High-level deep learning library' },
  ],
  4: [
    { name: 'Scikit-learn', color: '#34C759', desc: 'Cross-validation and regularization tools' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Experiment tracking and visualization' },
    { name: 'Early Stopping (Keras)', color: '#AF52DE', desc: 'Callback to stop training before overfitting' },
  ],
  5: [
    { name: 'Scikit-learn', color: '#34C759', desc: 'Decision Trees, SVM, KNN, and more' },
    { name: 'XGBoost', color: '#34C759', desc: 'Kaggle competition champion for tabular data' },
    { name: 'LightGBM', color: '#34C759', desc: 'Fast gradient boosting by Microsoft' },
  ],
  6: [
    { name: 'MLflow', color: '#8E8E93', desc: 'Open source ML lifecycle management' },
    { name: 'Vertex AI (Google)', color: '#0071E3', desc: 'Google Cloud\'s managed ML platform' },
    { name: 'Azure ML', color: '#0071E3', desc: 'Microsoft\'s cloud ML service' },
  ],
  7: [
    { name: 'MLflow', color: '#8E8E93', desc: 'Experiment tracking and model registry' },
    { name: 'DVC', color: '#34C759', desc: 'Data version control for ML projects' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Training monitoring and collaboration' },
    { name: 'Evidently AI', color: '#34C759', desc: 'ML model monitoring and observability' },
    { name: 'Seldon', color: '#34C759', desc: 'Model deployment and serving platform' },
  ],
}

const STAGES = [
  { key: 'what-is-ml', label: 'What is ML?', emoji: '🤖' },
  { key: 'types', label: 'Types of ML', emoji: '🌳' },
  { key: 'supervised', label: 'Supervised Learning', emoji: '📚' },
  { key: 'neural-networks', label: 'Neural Networks', emoji: '🧠' },
  { key: 'overfitting', label: 'Overfitting', emoji: '⚖️' },
  { key: 'algorithms', label: 'Algorithms', emoji: '⚡' },
  { key: 'business', label: 'Real Use Cases', emoji: '🌍' },
  { key: 'lifecycle', label: 'ML Lifecycle', emoji: '🔄' },
]

const STAGE_TOOLTIPS = {
  'what-is-ml': 'How ML learns rules from data instead of humans writing them.',
  'types': 'Supervised, unsupervised, and reinforcement learning explained.',
  'supervised': 'The training loop: predict, compare, adjust, repeat.',
  'neural-networks': 'Layers of interconnected nodes that learn complex patterns.',
  'overfitting': 'When models memorize instead of learning — and how to fix it.',
  'algorithms': 'Decision Trees, Random Forest, XGBoost and more.',
  'business': 'How ML powers banking, healthcare, retail, and more.',
  'lifecycle': 'The real ML workflow — 80% is data, not models.',
}

const QUICK_REFERENCE = [
  { emoji: '🤖', technique: 'ML Fundamentals', when: 'Understanding AI', phrase: 'Data in, rules out' },
  { emoji: '🌳', technique: 'ML Types', when: 'Choosing approach', phrase: 'Supervised, Unsupervised, RL' },
  { emoji: '📚', technique: 'Training Loop', when: 'Building models', phrase: 'Predict, compare, adjust' },
  { emoji: '🧠', technique: 'Neural Networks', when: 'Complex patterns', phrase: 'Layers learn features' },
  { emoji: '⚖️', technique: 'Generalization', when: 'Model evaluation', phrase: 'Not too simple, not too complex' },
  { emoji: '⚡', technique: 'Algorithm Choice', when: 'Problem solving', phrase: 'Start simple, then iterate' },
  { emoji: '🌍', technique: 'Business Impact', when: 'Real applications', phrase: 'ML is already everywhere' },
  { emoji: '🔄', technique: 'ML Lifecycle', when: 'Production ML', phrase: '80% data, 20% models' },
]

/* ═══════════════════════════════════
   STAGE 1 — WHAT IS MACHINE LEARNING?
   ═══════════════════════════════════ */
function WhatIsMLViz({ active }) {
  const [showML, setShowML] = useState(false)
  const [emailResults, setEmailResults] = useState([])
  const [showAccuracy, setShowAccuracy] = useState(false)
  const timerRef = useRef(null)

  const emails = [
    { text: 'You won a FREE iPhone! Click NOW!', isSpam: true },
    { text: 'Team meeting moved to 3pm tomorrow', isSpam: false },
    { text: 'CONGRATULATIONS! You\'ve been selected...', isSpam: true },
    { text: 'Please review the Q3 budget proposal', isSpam: false },
    { text: 'Make $5000 from home TODAY!!!', isSpam: true },
  ]

  const mlPredictions = [true, false, true, false, true]

  useEffect(() => {
    if (!active) return
    setShowML(false)
    setEmailResults([])
    setShowAccuracy(false)
    timerRef.current = setTimeout(() => setShowML(true), 800)
    return () => clearTimeout(timerRef.current)
  }, [active])

  function classifyEmail(idx, userGuess) {
    if (emailResults[idx] !== undefined) return
    setEmailResults((prev) => {
      const next = [...prev]
      next[idx] = userGuess
      if (next.filter((r) => r !== undefined).length === emails.length) {
        setTimeout(() => setShowAccuracy(true), 500)
      }
      return next
    })
  }

  const userCorrect = emailResults.filter((r, i) => r !== undefined && r === emails[i].isSpam).length
  const mlCorrect = mlPredictions.filter((p, i) => p === emails[i].isSpam).length

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">Two approaches to the same problem:</div>

      <div className="ml-comparison">
        <div className="ml-comp-panel ml-comp-traditional how-fade-in">
          <div className="ml-comp-header">TRADITIONAL PROGRAMMING</div>
          <div className="ml-comp-flow">
            <span className="ml-comp-flow-box ml-comp-flow-rules">Rules written by humans</span>
            <span className="ml-comp-flow-plus">+</span>
            <span className="ml-comp-flow-box ml-comp-flow-data">Data</span>
            <span className="ml-comp-flow-arrow">→</span>
            <span className="ml-comp-flow-box ml-comp-flow-output">Output</span>
          </div>
          <div className="ml-comp-example">
            <div className="ml-comp-code">
              IF email contains "winner" OR "prize" → spam<br />
              IF email contains "meeting" OR "agenda" → normal
            </div>
          </div>
          <div className="ml-comp-verdict ml-verdict-bad">Brittle — breaks when spammers change words</div>
        </div>

        <div className={`ml-comp-panel ml-comp-ml ${showML ? 'how-fade-in' : 'ml-comp-hidden'}`}>
          <div className="ml-comp-header">MACHINE LEARNING</div>
          <div className="ml-comp-flow">
            <span className="ml-comp-flow-box ml-comp-flow-data">Data</span>
            <span className="ml-comp-flow-plus">+</span>
            <span className="ml-comp-flow-box ml-comp-flow-answers">Correct Answers</span>
            <span className="ml-comp-flow-arrow">→</span>
            <span className="ml-comp-flow-box ml-comp-flow-rules">Rules learned automatically</span>
          </div>
          <div className="ml-comp-example">
            <div className="ml-comp-code">
              Show 10,000 spam + 10,000 normal emails<br />
              → Model figures out patterns BY ITSELF<br />
              → Works even on emails it has never seen
            </div>
          </div>
          <div className="ml-comp-verdict ml-verdict-good">Adapts — improves with more data</div>
        </div>
      </div>

      {showML && (
        <div className="ml-email-demo how-pop-in">
          <div className="ml-email-title">Try it: classify these emails as spam or not spam</div>
          {emails.map((email, i) => (
            <div key={i} className="ml-email-row">
              <span className="ml-email-text">{email.text}</span>
              <div className="ml-email-buttons">
                {emailResults[i] === undefined ? (
                  <>
                    <button className="ml-email-btn ml-email-btn-spam" onClick={() => classifyEmail(i, true)}>Spam</button>
                    <button className="ml-email-btn ml-email-btn-safe" onClick={() => classifyEmail(i, false)}>Not Spam</button>
                  </>
                ) : (
                  <span className={`ml-email-result ${emailResults[i] === emails[i].isSpam ? 'ml-email-correct' : 'ml-email-wrong'}`}>
                    {emailResults[i] === emails[i].isSpam ? '✅ Correct' : '❌ Wrong'}
                  </span>
                )}
              </div>
            </div>
          ))}
          {showAccuracy && (
            <div className="ml-email-score how-pop-in">
              <div>Your accuracy: <strong>{userCorrect}/{emails.length}</strong></div>
              <div>ML model accuracy: <strong>{mlCorrect}/{emails.length}</strong> (5/5)</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 2 — TYPES OF MACHINE LEARNING
   ═══════════════════════════════════ */
function TypesViz({ active }) {
  const [visibleBranches, setVisibleBranches] = useState(0)
  const [expandedBranch, setExpandedBranch] = useState(null)

  const branches = [
    {
      icon: '🎓',
      name: 'Supervised Learning',
      subtitle: 'Learning from labeled examples',
      types: ['Classification (spam/not spam, cat/dog)', 'Regression (predict house price, stock value)'],
      examples: 'Email spam, image recognition, loan approval',
      color: '#AF52DE',
    },
    {
      icon: '🔍',
      name: 'Unsupervised Learning',
      subtitle: 'Finding hidden patterns in unlabeled data',
      types: ['Clustering (group similar customers)', 'Dimensionality reduction'],
      examples: 'Customer segments, anomaly detection, recommendation engines',
      color: '#5856D6',
    },
    {
      icon: '🎮',
      name: 'Reinforcement Learning',
      subtitle: 'Learning through trial and error with rewards',
      types: ['Agent takes actions in environment', 'Gets rewards for good, penalties for bad'],
      examples: 'Game playing AI, robotics, self-driving cars, RLHF in ChatGPT!',
      color: '#FF9500',
    },
  ]

  useEffect(() => {
    if (active && visibleBranches === 0) setVisibleBranches(1)
  }, [active])

  function nextBranch() {
    if (visibleBranches < branches.length) setVisibleBranches(visibleBranches + 1)
  }

  function resetBranches() {
    setVisibleBranches(1)
    setExpandedBranch(null)
  }

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">Three families of Machine Learning:</div>

      {visibleBranches > 0 && (
        <div className="ml-step-counter">Type {visibleBranches} of {branches.length}</div>
      )}

      <div className="ml-types-tree">
        <div className="ml-types-root">🤖 Machine Learning</div>
        <div className="ml-types-branches">
          {branches.map((b, i) => (
            <div
              key={i}
              className={`ml-types-branch ${i < visibleBranches ? 'ml-types-branch-visible' : ''}`}
              style={{ '--branch-color': b.color }}
            >
              <button
                className={`ml-types-branch-header ${expandedBranch === i ? 'ml-types-branch-expanded' : ''}`}
                onClick={() => setExpandedBranch(expandedBranch === i ? null : i)}
              >
                <span className="ml-types-branch-icon">{b.icon}</span>
                <div className="ml-types-branch-text">
                  <div className="ml-types-branch-name">{b.name}</div>
                  <div className="ml-types-branch-subtitle">{b.subtitle}</div>
                </div>
              </button>
              {expandedBranch === i && (
                <div className="ml-types-branch-detail how-pop-in">
                  <div className="ml-types-branch-types">
                    {b.types.map((t, j) => (
                      <div key={j} className="ml-types-type-item">→ {t}</div>
                    ))}
                  </div>
                  <div className="ml-types-branch-examples">Examples: {b.examples}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="ml-step-actions">
        {visibleBranches > 0 && visibleBranches < branches.length ? (
          <button className="ml-next-step-btn" onClick={nextBranch}>Next Type →</button>
        ) : visibleBranches >= branches.length ? (
          <>
            <div className="ml-success-banner how-pop-in">All {branches.length} ML types revealed!</div>
            <button className="ml-replay-btn" onClick={resetBranches}>↺ Start Over</button>
          </>
        ) : null}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 3 — HOW SUPERVISED LEARNING WORKS
   ═══════════════════════════════════ */
function SupervisedViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const [predictSize, setPredictSize] = useState('1600')
  const [predictBeds, setPredictBeds] = useState('3')
  const [predictLoc, setPredictLoc] = useState('City')
  const [predicted, setPredicted] = useState(null)

  const tableData = [
    { size: '1,200', beds: 2, location: 'Suburbs', price: '$280k' },
    { size: '2,400', beds: 4, location: 'City', price: '$650k' },
    { size: '800', beds: 1, location: 'Rural', price: '$120k' },
    { size: '1,800', beds: 3, location: 'City', price: '$480k' },
    { size: '1,500', beds: 2, location: 'Suburbs', price: '$320k' },
  ]

  const steps = [
    { num: 1, label: 'Collect Data', icon: '📊' },
    { num: 2, label: 'Split Data', icon: '✂️' },
    { num: 3, label: 'Train Model', icon: '🏋️' },
    { num: 4, label: 'Evaluate', icon: '📈' },
    { num: 5, label: 'Deploy', icon: '🚀' },
  ]

  useEffect(() => {
    if (active && animStep === 0) setAnimStep(1)
  }, [active])

  useEffect(() => {
    setPredicted(null)
  }, [predictSize, predictBeds, predictLoc])

  function nextStep() {
    if (animStep < steps.length) setAnimStep(animStep + 1)
  }

  function resetSteps() {
    setAnimStep(1)
    setPredicted(null)
  }

  function handlePredict() {
    const size = parseInt(predictSize) || 1600
    const beds = parseInt(predictBeds) || 3
    const locMult = predictLoc === 'City' ? 1.3 : predictLoc === 'Suburbs' ? 1.0 : 0.7
    const price = Math.round((size * 150 + beds * 25000) * locMult / 1000)
    setPredicted(price)
  }

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">The supervised learning pipeline:</div>

      <div className="ml-step-counter">Step {animStep} of {steps.length}</div>

      <div className="ml-supervised-steps">
        {steps.map((s, i) => {
          const stepIdx = i + 1
          const isDone = animStep > stepIdx
          const isCurrent = animStep === stepIdx
          const connector = i > 0 ? (
            <div key={`c${i}`} className={`ml-sup-connector ${animStep > i ? 'ml-sup-connector-active' : ''}`}>
              <svg width="24" height="12" viewBox="0 0 24 12"><path d="M0 6h20M16 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          ) : null
          return [
            connector,
            <div key={`s${i}`} className={`ml-sup-step ${animStep > i ? 'ml-sup-step-active' : ''} ${isDone ? 'ml-sup-step-done' : ''} ${isCurrent ? 'ml-sup-step-current' : ''}`}>
              {isDone ? <span className="ml-sup-step-check">✓</span> : <span className="ml-sup-step-icon">{s.icon}</span>}
              <span className="ml-sup-step-label">{s.label}</span>
            </div>,
          ]
        })}
      </div>

      {animStep >= 1 && (
        <div className="ml-sup-popup ml-sup-popup-in" key={`popup-${animStep}`}>
          {/* STEP 1 — Collect Data */}
          {animStep === 1 && (
            <>
              <div className="ml-sup-table-wrapper">
                <table className="ml-sup-table">
                  <thead>
                    <tr><th>Size (sqft)</th><th>Beds</th><th>Location</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i}>
                        <td>{row.size}</td>
                        <td>{row.beds}</td>
                        <td>{row.location}</td>
                        <td className="ml-sup-price">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ml-sup-popup-text">
                We gathered 5 houses with known prices. In real ML you'd need thousands of examples. Each row is one training example. Each column is a <strong>feature</strong> the model will learn from.
              </div>
              <div className="ml-sup-popup-highlight">More data = better model, up to a point</div>
            </>
          )}

          {/* STEP 2 — Split Data */}
          {animStep === 2 && (
            <>
              <div className="ml-sup-table-wrapper">
                <table className="ml-sup-table">
                  <thead>
                    <tr><th>Size (sqft)</th><th>Beds</th><th>Location</th><th>Price</th></tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, i) => (
                      <tr key={i} className={i >= 4 ? 'ml-sup-test-row' : ''}>
                        <td>{row.size}</td>
                        <td>{row.beds}</td>
                        <td>{row.location}</td>
                        <td className="ml-sup-price">{row.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="ml-sup-split-labels">
                  <span className="ml-sup-split-train">Training set (80%) — model learns from these</span>
                  <span className="ml-sup-split-test">Test set (20%) — tested later</span>
                </div>
              </div>
              <div className="ml-sup-popup-text">
                We never test on data the model trained on — that would be like giving students the exam answers during study time.
                The test set tells us if the model truly <strong>learned</strong> or just <strong>memorized</strong>.
              </div>
              <div className="ml-sup-popup-highlight">This is how we know if ML actually worked</div>
            </>
          )}

          {/* STEP 3 — Train Model */}
          {animStep === 3 && (
            <>
              <div className="ml-sup-popup-text">
                The model makes predictions on training data, compares to real prices, calculates error, adjusts its internal weights to reduce error. Repeat thousands of times.
              </div>
              <div className="ml-sup-popup-text" style={{ fontWeight: 500, marginBottom: 8 }}>Watch the loss (error) decrease with each iteration:</div>
              <div className="ml-sup-loss-steps">
                <div className="ml-sup-loss-row"><span className="ml-sup-loss-iter">Iteration 1</span><div className="ml-sup-loss-track"><div className="ml-sup-loss-fill-step" style={{ width: '90%' }} /></div><span className="ml-sup-loss-val ml-sup-loss-high">Error $180k</span></div>
                <div className="ml-sup-loss-row"><span className="ml-sup-loss-iter">Iteration 10</span><div className="ml-sup-loss-track"><div className="ml-sup-loss-fill-step" style={{ width: '48%' }} /></div><span className="ml-sup-loss-val ml-sup-loss-mid">Error $95k</span></div>
                <div className="ml-sup-loss-row"><span className="ml-sup-loss-iter">Iteration 100</span><div className="ml-sup-loss-track"><div className="ml-sup-loss-fill-step" style={{ width: '22%' }} /></div><span className="ml-sup-loss-val ml-sup-loss-low">Error $42k</span></div>
                <div className="ml-sup-loss-row"><span className="ml-sup-loss-iter">Iteration 1000</span><div className="ml-sup-loss-track"><div className="ml-sup-loss-fill-step" style={{ width: '9%' }} /></div><span className="ml-sup-loss-val ml-sup-loss-done">Error $18k</span></div>
              </div>
              <div className="ml-sup-popup-highlight">This is gradient descent in action</div>
            </>
          )}

          {/* STEP 4 — Evaluate */}
          {animStep === 4 && (
            <>
              <div className="ml-sup-popup-text">
                We test the model on the 20% it never saw during training. If it predicts well here — it will work on new real houses too!
              </div>
              <div className="ml-sup-eval-table-wrapper">
                <table className="ml-sup-table">
                  <thead>
                    <tr><th>House</th><th>Predicted</th><th>Actual</th><th>Error</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>House 1</td><td>$267k</td><td>$280k</td><td className="ml-sup-eval-pct">4.6%</td></tr>
                    <tr><td>House 2</td><td>$634k</td><td>$650k</td><td className="ml-sup-eval-pct">2.5%</td></tr>
                    <tr><td>House 3</td><td>$127k</td><td>$120k</td><td className="ml-sup-eval-pct">5.8%</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="ml-sup-popup-highlight">Average error: 4.3% — pretty good!</div>
            </>
          )}

          {/* STEP 5 — Deploy */}
          {animStep === 5 && (
            <>
              <div className="ml-sup-popup-text">
                The model is now live! Give it any house details and it predicts the price instantly. Try it:
              </div>
              <div className="ml-sup-predict-form">
                <div className="ml-sup-predict-row">
                  <label className="ml-sup-predict-label">
                    Size (sqft)
                    <input type="number" className="ml-sup-predict-input" value={predictSize} onChange={e => setPredictSize(e.target.value)} min="400" max="10000" />
                  </label>
                  <label className="ml-sup-predict-label">
                    Beds
                    <input type="number" className="ml-sup-predict-input" value={predictBeds} onChange={e => setPredictBeds(e.target.value)} min="1" max="8" />
                  </label>
                  <label className="ml-sup-predict-label">
                    Location
                    <select className="ml-sup-predict-input" value={predictLoc} onChange={e => setPredictLoc(e.target.value)}>
                      <option value="City">City</option>
                      <option value="Suburbs">Suburbs</option>
                      <option value="Rural">Rural</option>
                    </select>
                  </label>
                </div>
                <button className="ml-sup-predict-btn" onClick={handlePredict}>Predict Price</button>
                {predicted !== null && (
                  <div className="ml-sup-predict-result how-pop-in">
                    Predicted price: <strong>${predicted}k</strong>
                  </div>
                )}
              </div>
              <div className="ml-sup-popup-highlight">This is how Zillow's Zestimate works!</div>
            </>
          )}
        </div>
      )}

      <div className="ml-step-actions">
        {animStep > 0 && animStep < steps.length ? (
          <button className="ml-next-step-btn" onClick={nextStep}>Next Step →</button>
        ) : animStep >= steps.length ? (
          <>
            <div className="ml-success-banner how-pop-in">Full supervised learning pipeline complete!</div>
            <button className="ml-replay-btn" onClick={resetSteps}>↺ Start Over</button>
          </>
        ) : null}
      </div>

    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 4 — NEURAL NETWORKS
   ═══════════════════════════════════ */
function NeuralNetworkViz({ active }) {
  const [animPhase, setAnimPhase] = useState(0) // 0=idle,1=structure,2=forward pass,3=done
  const [weights, setWeights] = useState({ w1: 0.73, w2: 0.45, w3: 0.62 })
  const svgRef = useRef(null)
  const timerRef = useRef(null)

  const layers = [
    { label: 'Input', nodes: ['Size', 'Beds', 'Location'], color: '#AF52DE' },
    { label: 'Hidden 1', nodes: ['H1', 'H2', 'H3', 'H4'], color: '#5856D6' },
    { label: 'Hidden 2', nodes: ['H5', 'H6', 'H7', 'H8'], color: '#5856D6' },
    { label: 'Output', nodes: ['Price'], color: '#34c759' },
  ]

  useEffect(() => {
    if (!active || animPhase > 0) return
    setAnimPhase(1)
    timerRef.current = setTimeout(() => setAnimPhase(2), 800)
    const timer2 = setTimeout(() => setAnimPhase(3), 2000)
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(timer2)
    }
  }, [active])

  function adjustWeight(key, delta) {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(1, +(prev[key] + delta).toFixed(2))),
    }))
  }

  const layerX = [60, 180, 300, 420]
  const nodePositions = layers.map((layer, li) => {
    const x = layerX[li]
    const count = layer.nodes.length
    const startY = 100 - (count - 1) * 22
    return layer.nodes.map((_, ni) => ({ x, y: startY + ni * 44 }))
  })

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">A neural network processes data in layers:</div>

      <div className="ml-nn-wrapper">
        <svg viewBox="0 0 480 240" className={`ml-nn-svg ${animPhase >= 1 ? 'ml-nn-visible' : ''}`}>
          {/* Connections */}
          {nodePositions.slice(0, -1).map((layerNodes, li) =>
            layerNodes.map((from, fi) =>
              nodePositions[li + 1].map((to, ti) => {
                const isActive = animPhase >= 2
                return (
                  <line
                    key={`${li}-${fi}-${ti}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    className={`ml-nn-connection ${isActive ? 'ml-nn-connection-active' : ''}`}
                    style={{ animationDelay: `${(li * 0.3 + fi * 0.05 + ti * 0.05)}s` }}
                  />
                )
              })
            )
          )}
          {/* Nodes */}
          {nodePositions.map((layerNodes, li) =>
            layerNodes.map((pos, ni) => {
              const isActive = animPhase >= (li === 0 ? 1 : 2)
              return (
                <g key={`n${li}-${ni}`}>
                  <circle
                    cx={pos.x} cy={pos.y} r="16"
                    className={`ml-nn-node ${isActive ? 'ml-nn-node-active' : ''}`}
                    style={{ fill: isActive ? layers[li].color : 'var(--bg-secondary)', animationDelay: `${li * 0.3}s` }}
                  />
                  <text
                    x={pos.x} y={pos.y + 4}
                    className="ml-nn-node-label"
                    textAnchor="middle"
                    fontSize="8"
                  >
                    {layers[li].nodes[ni]}
                  </text>
                </g>
              )
            })
          )}
          {/* Layer labels */}
          {layers.map((layer, li) => (
            <text key={`l${li}`} x={layerX[li]} y={225} textAnchor="middle" className="ml-nn-layer-label" fontSize="10">
              {layer.label}
            </text>
          ))}
        </svg>
      </div>

      {animPhase >= 3 && (
        <div className="ml-nn-interactive how-pop-in">
          <div className="ml-nn-interactive-title">Adjust weights — this is what training does automatically!</div>
          <div className="ml-nn-weight-controls">
            {Object.entries(weights).map(([key, val]) => (
              <div key={key} className="ml-nn-weight-row">
                <span className="ml-nn-weight-name">{key === 'w1' ? 'Size weight' : key === 'w2' ? 'Beds weight' : 'Location weight'}</span>
                <button className="ml-nn-weight-btn" onClick={() => adjustWeight(key, -0.1)}>−</button>
                <span className="ml-nn-weight-val">{val.toFixed(2)}</span>
                <button className="ml-nn-weight-btn" onClick={() => adjustWeight(key, 0.1)}>+</button>
              </div>
            ))}
            <div className="ml-nn-weight-result">
              Predicted price: <strong>${Math.round(1200 * weights.w1 * 0.5 + 2 * weights.w2 * 80 + weights.w3 * 150)}k</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 5 — OVERFITTING VS UNDERFITTING
   ═══════════════════════════════════ */
function OverfittingViz({ active }) {
  const [animDone, setAnimDone] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    setAnimDone(false)
    timerRef.current = setTimeout(() => setAnimDone(true), 600)
    return () => clearTimeout(timerRef.current)
  }, [active])

  const dataPoints = [
    { x: 20, y: 160 }, { x: 60, y: 130 }, { x: 100, y: 110 },
    { x: 140, y: 85 }, { x: 180, y: 70 }, { x: 220, y: 55 },
    { x: 260, y: 50 }, { x: 300, y: 40 },
  ]

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">The Goldilocks problem — finding the right complexity:</div>

      <div className="ml-overfit-panels">
        <div className={`ml-overfit-panel ${animDone ? 'ml-overfit-panel-visible' : ''}`}>
          <div className="ml-overfit-panel-title">Underfitting</div>
          <div className="ml-overfit-panel-subtitle">Too simple</div>
          <svg viewBox="0 0 320 200" className="ml-overfit-chart">
            {dataPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" className="ml-overfit-dot" />
            ))}
            <line x1="10" y1="105" x2="310" y2="105" className="ml-overfit-line ml-overfit-line-under" />
          </svg>
          <div className="ml-overfit-scores">
            <span>Train error: <strong className="ml-score-bad">HIGH</strong></span>
            <span>Test error: <strong className="ml-score-bad">HIGH</strong></span>
          </div>
        </div>

        <div className={`ml-overfit-panel ml-overfit-panel-good ${animDone ? 'ml-overfit-panel-visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="ml-overfit-panel-title">Just Right</div>
          <div className="ml-overfit-panel-subtitle">Good generalization</div>
          <svg viewBox="0 0 320 200" className="ml-overfit-chart">
            {dataPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" className="ml-overfit-dot" />
            ))}
            <path d="M 10 170 Q 80 130 140 85 Q 200 55 310 35" fill="none" className="ml-overfit-line ml-overfit-line-good" />
          </svg>
          <div className="ml-overfit-scores">
            <span>Train error: <strong className="ml-score-good">LOW</strong></span>
            <span>Test error: <strong className="ml-score-good">LOW ✅</strong></span>
          </div>
        </div>

        <div className={`ml-overfit-panel ${animDone ? 'ml-overfit-panel-visible' : ''}`} style={{ animationDelay: '0.4s' }}>
          <div className="ml-overfit-panel-title">Overfitting</div>
          <div className="ml-overfit-panel-subtitle">Too complex</div>
          <svg viewBox="0 0 320 200" className="ml-overfit-chart">
            {dataPoints.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="5" className="ml-overfit-dot" />
            ))}
            <path d="M 15 162 Q 30 158 60 130 Q 70 115 80 125 Q 90 135 100 110 Q 110 90 130 88 Q 145 86 140 85 Q 155 72 170 74 Q 185 71 180 70 Q 200 48 220 55 Q 240 62 250 50 Q 270 45 280 48 Q 290 42 300 40" fill="none" className="ml-overfit-line ml-overfit-line-over" />
          </svg>
          <div className="ml-overfit-scores">
            <span>Train error: <strong className="ml-score-good">VERY LOW</strong></span>
            <span>Test error: <strong className="ml-score-bad">HIGH ❌</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 6 — KEY ML ALGORITHMS
   ═══════════════════════════════════ */
function AlgorithmsViz({ active }) {
  const [expandedAlgo, setExpandedAlgo] = useState(null)
  const [visibleCards, setVisibleCards] = useState(0)
  const timerRef = useRef(null)

  const algorithms = [
    {
      icon: '🌳',
      name: 'Decision Tree',
      desc: 'Yes/no splits leading to a decision',
      detail: 'Income > 50k? → Yes → Employment > 2 years? → APPROVE',
      bestFor: 'Explainable decisions, business rules',
    },
    {
      icon: '🌲',
      name: 'Random Forest',
      desc: '100 decision trees vote → majority wins',
      detail: 'Multiple trees each see different data, then vote on the answer.',
      bestFor: 'Tabular data, very reliable',
    },
    {
      icon: '📈',
      name: 'Linear Regression',
      desc: 'Draw the best straight line through data',
      detail: 'Find the line that minimizes distance to all data points.',
      bestFor: 'Predicting continuous values',
    },
    {
      icon: '🎯',
      name: 'Support Vector Machine',
      desc: 'Find the widest boundary between classes',
      detail: 'Draw the widest possible margin between two groups of data.',
      bestFor: 'Small datasets, binary classification',
    },
    {
      icon: '⚡',
      name: 'XGBoost',
      desc: 'Each tree corrects previous tree\'s mistakes',
      detail: 'Gradient boosting builds trees sequentially, each fixing errors.',
      bestFor: 'Kaggle competitions, tabular data champion',
    },
    {
      icon: '🔗',
      name: 'K-Nearest Neighbors',
      desc: 'Classify by looking at your neighbors',
      detail: 'A new point is classified by the majority vote of its K closest neighbors.',
      bestFor: 'Simple classification, recommendation',
    },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    setExpandedAlgo(null)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < algorithms.length) {
        timerRef.current = setTimeout(showNext, 300)
      }
    }
    timerRef.current = setTimeout(showNext, 200)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">Click an algorithm to learn more:</div>

      <div className="ml-algo-cards">
        {algorithms.map((algo, i) => (
          <div key={i} className={`ml-algo-card ${i < visibleCards ? 'ml-algo-card-visible' : ''}`}>
            <button
              className={`ml-algo-card-header ${expandedAlgo === i ? 'ml-algo-card-expanded' : ''}`}
              onClick={() => setExpandedAlgo(expandedAlgo === i ? null : i)}
            >
              <span className="ml-algo-card-icon">{algo.icon}</span>
              <div className="ml-algo-card-text">
                <div className="ml-algo-card-name">{algo.name}</div>
                <div className="ml-algo-card-desc">{algo.desc}</div>
              </div>
            </button>
            {expandedAlgo === i && (
              <div className="ml-algo-card-detail how-pop-in">
                <div className="ml-algo-card-formula">{algo.detail}</div>
                <div className="ml-algo-card-best">Best for: {algo.bestFor}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}>Play demo</button>
      )}
      {visibleCards >= algorithms.length && (
        <button className="pe-replay-btn" onClick={startAnimation}>Replay animation</button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 7 — ML IN BUSINESS
   ═══════════════════════════════════ */
function BusinessViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)

  const industries = [
    {
      icon: '🏦',
      name: 'Banking & Finance',
      uses: ['Credit scoring (loan approval)', 'Fraud detection', 'Algorithmic trading', 'Risk assessment'],
      tools: 'XGBoost, Random Forest',
    },
    {
      icon: '🏥',
      name: 'Healthcare',
      uses: ['Disease diagnosis from scans', 'Drug discovery', 'Patient readmission prediction', 'Medical image analysis'],
      tools: 'CNN, ResNet, PyTorch',
    },
    {
      icon: '🛒',
      name: 'Retail & E-commerce',
      uses: ['Product recommendations', 'Demand forecasting', 'Price optimization', 'Customer churn prediction'],
      tools: 'Collaborative filtering, LSTM',
    },
    {
      icon: '🚗',
      name: 'Transportation',
      uses: ['Self-driving vehicles', 'Route optimization', 'Predictive maintenance', 'Traffic prediction'],
      tools: 'Reinforcement Learning, CNN',
    },
    {
      icon: '📱',
      name: 'Technology',
      uses: ['Spam filtering', 'Search ranking', 'Ad targeting', 'Content moderation'],
      tools: 'BERT, XGBoost, Neural Networks',
    },
    {
      icon: '🏭',
      name: 'Manufacturing',
      uses: ['Quality control (defect detection)', 'Predictive maintenance', 'Supply chain optimization', 'Energy optimization'],
      tools: 'Computer Vision, Time Series',
    },
  ]

  useEffect(() => {
    if (active && visibleCards === 0) setVisibleCards(1)
  }, [active])

  function nextCard() {
    if (visibleCards < industries.length) setVisibleCards(visibleCards + 1)
  }

  function resetCards() {
    setVisibleCards(1)
  }

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">ML is already everywhere — across every industry:</div>

      <div className="ml-step-counter">Industry {visibleCards} of {industries.length}</div>

      <div className="ml-business-cards">
        {industries.map((ind, i) => (
          i < visibleCards && (
            <div key={i} className="ml-business-card ml-slide-in">
              <div className="ml-business-card-icon">{ind.icon}</div>
              <div className="ml-business-card-content">
                <div className="ml-business-card-name">{ind.name}</div>
                <ul className="ml-business-card-uses">
                  {ind.uses.map((use, j) => (
                    <li key={j}>{use}</li>
                  ))}
                </ul>
                <div className="ml-business-card-tools">Tools: {ind.tools}</div>
              </div>
            </div>
          )
        ))}
      </div>

      <div className="ml-step-actions">
        {visibleCards < industries.length ? (
          <button className="ml-next-step-btn" onClick={nextCard}>Next Industry →</button>
        ) : (
          <>
            <div className="ml-success-banner how-pop-in">All {industries.length} industries revealed!</div>
            <button className="ml-replay-btn" onClick={resetCards}>↺ Start Over</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 8 — THE ML PROJECT LIFECYCLE
   ═══════════════════════════════════ */
function LifecycleViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const [looping, setLooping] = useState(false)

  const steps = [
    { label: 'Business Problem', icon: '🎯', pct: 0, desc: 'Define what you want to predict or classify — this shapes everything.' },
    { label: 'Data Collection', icon: '📥', pct: 20, desc: 'Gather raw data from databases, APIs, surveys, or web scraping.' },
    { label: 'Data Cleaning & EDA', icon: '🧹', pct: 35, desc: 'Fix missing values, remove outliers, and explore patterns in data.' },
    { label: 'Feature Engineering', icon: '🔧', pct: 15, desc: 'Create new input variables that help the model learn better.' },
    { label: 'Model Training', icon: '🏋️', pct: 10, desc: 'Feed data into algorithms and let the model learn patterns.' },
    { label: 'Model Evaluation', icon: '📊', pct: 10, desc: 'Test on held-out data — check accuracy, precision, recall.' },
    { label: 'Deployment', icon: '🚀', pct: 5, desc: 'Ship the model to production via API, batch jobs, or edge.' },
    { label: 'Monitoring', icon: '👁️', pct: 5, desc: 'Watch for data drift, performance decay — retrain when needed.' },
  ]

  useEffect(() => {
    if (active && animStep === 0) setAnimStep(1)
  }, [active])

  function nextStep() {
    if (animStep < steps.length) setAnimStep(animStep + 1)
  }

  function loopBack() {
    setLooping(true)
    setTimeout(() => {
      setAnimStep(1)
      setLooping(false)
    }, 500)
  }

  return (
    <div className="ml-viz">
      <div className="ml-demo-label">The real ML workflow — notice where time is spent:</div>

      <div className="ml-step-counter">Step {animStep} of {steps.length}</div>

      <div className={`ml-lc-zigzag ${looping ? 'ml-lc-fade-out' : ''}`}>
        {steps.map((s, i) => {
          if (i >= animStep) return null
          const isLeft = i % 2 === 0
          const isActive = i === animStep - 1
          const isCompleted = i < animStep - 1

          return (
            <div key={i} className="ml-lc-row">
              {/* Arrow from previous step */}
              {i > 0 && (
                <div className={`ml-lc-arrow ${isLeft ? 'ml-lc-arrow-from-right' : 'ml-lc-arrow-from-left'}`}>
                  <svg width="40" height="28" viewBox="0 0 40 28">
                    {isLeft ? (
                      <path d="M36 2 C36 14, 4 14, 4 26" stroke="#AF52DE" strokeWidth="2" fill="none" strokeLinecap="round" />
                    ) : (
                      <path d="M4 2 C4 14, 36 14, 36 26" stroke="#AF52DE" strokeWidth="2" fill="none" strokeLinecap="round" />
                    )}
                    <polygon
                      points={isLeft ? '4,22 0,26 8,26' : '36,22 32,26 40,26'}
                      fill="#AF52DE"
                    />
                  </svg>
                </div>
              )}

              <div
                className={`ml-lc-card ml-slide-in ${isLeft ? 'ml-lc-card-left' : 'ml-lc-card-right'} ${isActive ? 'ml-lc-card-active' : ''} ${isCompleted ? 'ml-lc-card-done' : ''}`}
              >
                <div className="ml-lc-card-header">
                  <div className={`ml-lc-card-num ${isCompleted ? 'ml-lc-card-num-done' : ''}`}>
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div className="ml-lc-card-icon">{s.icon}</div>
                  <div className="ml-lc-card-title">{s.label}</div>
                </div>
                <div className="ml-lc-card-desc">{s.desc}</div>
                {s.pct > 0 && (
                  <div className="ml-lc-card-pct">
                    <div className="ml-lc-pct-track">
                      <div className="ml-lc-pct-fill" style={{ width: `${s.pct}%` }} />
                    </div>
                    <span className="ml-lc-pct-label">{s.pct}% of project time</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {animStep >= steps.length && (
        <div className="ml-lifecycle-insight how-pop-in">
          <strong>The dirty secret of ML:</strong> ~80% of time is spent on data, not models. "Data Scientists spend 80% of their time cleaning data and 20% complaining about it."
        </div>
      )}

      <div className="ml-step-actions">
        {animStep < steps.length ? (
          <button className="ml-next-step-btn" onClick={nextStep}>Next Step →</button>
        ) : (
          <>
            <div className="ml-success-banner how-pop-in">Full ML lifecycle revealed!</div>
            <button className="ml-lc-loop-btn" onClick={loopBack}>↻ Loop back to Data Collection</button>
          </>
        )}
      </div>

    </div>
  )
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
function MachineLearning({ onSwitchTab, onGoHome }) {
  const [stage, setStage] = useState(-1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(true)
  const [showFinal, setShowFinal] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (stage > maxStageReached) setMaxStageReached(stage)
  }, [stage, maxStageReached])

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
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
      setShowFinal(true)
      setStage(STAGES.length)
    }
  }

  function prevStage() {
    if (stage > 0) setStage(stage - 1)
  }

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  const vizComponents = {
    0: <WhatIsMLViz active={stage === 0} />,
    1: <TypesViz active={stage === 1} />,
    2: <SupervisedViz active={stage === 2} />,
    3: <NeuralNetworkViz active={stage === 3} />,
    4: <OverfittingViz active={stage === 4} />,
    5: <AlgorithmsViz active={stage === 5} />,
    6: <BusinessViz active={stage === 6} />,
    7: <LifecycleViz active={stage === 7} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: What is Machine Learning?',
      content: "Machine Learning is the science of teaching computers to learn from examples instead of explicit rules.\n\nTraditional programming: humans write the rules\nMachine Learning: the algorithm finds the rules itself\n\nThe key insight: if you show a computer enough examples with correct answers, it can figure out the underlying pattern — often better than humans can.\n\nEvery time you use a spam filter, Netflix recommendation, or fraud detection system — that's ML working silently.",
    },
    1: {
      title: 'Stage 2: Three Types of ML',
      content: "All ML falls into three categories based on how the algorithm learns:\n\nSupervised: Teacher provides answers → most common in business\nUnsupervised: No answers provided → finds hidden structure\nReinforcement: Trial and error with rewards → used in games and robotics\n\nThe LLMs we've been studying use ALL THREE: Pre-training is self-supervised, RLHF is reinforcement learning!",
    },
    2: {
      title: 'Stage 3: How Supervised Learning Works',
      content: "The training loop is simple but powerful:\n1. Make a prediction\n2. Compare to correct answer\n3. Calculate the error (loss)\n4. Adjust model parameters to reduce error\n5. Repeat millions of times\n\nThis is called gradient descent — the algorithm always moves in the direction that reduces error most.\n\nThe test set is crucial: it tells you if the model actually learned general patterns or just memorized the training data (called overfitting).",
    },
    3: {
      title: 'Stage 4: Neural Networks',
      content: "Neural networks are inspired by the brain — interconnected nodes that process information in layers.\n\nEach connection has a weight (importance). Each node applies an activation function. Training adjusts millions of weights to minimize error.\n\nKey insight: deep networks (many layers) can learn incredibly complex patterns. This is why they call it 'deep learning' — it's neural networks with many hidden layers.\n\nThe Transformer models powering ChatGPT are neural networks with a special 'attention' mechanism you already learned about!",
    },
    4: {
      title: 'Stage 5: The Goldilocks Problem',
      content: "The biggest challenge in ML is generalization — does the model learn real patterns or just memorize data?\n\nUnderfitting: Model too simple, misses the pattern\nOverfitting: Model too complex, memorizes noise\n\nSolutions for overfitting:\n- More training data (most effective)\n- Dropout (randomly disable neurons during training)\n- Regularization (penalize complexity)\n- Cross-validation (use multiple train/test splits)\n- Early stopping (stop training before overfitting starts)\n\nWhen ChatGPT sometimes 'hallucinates', it's partly because the model learned spurious patterns from training data.",
    },
    5: {
      title: 'Stage 6: The ML Algorithm Toolkit',
      content: "Different problems need different algorithms. Knowing when to use which is the art of ML engineering.\n\nGeneral rule:\n- Start with simple (Linear/Logistic Regression)\n- Try ensemble methods (Random Forest, XGBoost)\n- Use neural networks only when simpler methods fail\n- Complex ≠ better for most business problems\n\nXGBoost wins more Kaggle competitions than deep learning for structured tabular data!",
    },
    6: {
      title: 'Stage 7: ML is Already Everywhere',
      content: "You interact with ML dozens of times per day without realizing it.\n\nEvery recommendation, every search result, every fraud alert, every photo filter — these are all ML models making real-time predictions.\n\nFor IT managers: the question is no longer 'should we use ML?' but 'which problems in our business would benefit most from ML?'",
    },
    7: {
      title: 'Stage 8: The Real ML Workflow',
      content: "The dirty secret of ML: 80% of time is spent on data, not models.\n\n'Data Scientists spend 80% of their time cleaning data and 20% complaining about it.'\n\nThe ML lifecycle is never truly finished — models degrade over time as the world changes (called data drift or concept drift).\n\nGood MLOps practices keep models fresh and reliable in production.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon="🤖"
        title="Machine Learning"
        subtitle="How machines actually learn from data"
        description="Before ChatGPT, before transformers, before all the AI buzz — there was Machine Learning. Understanding ML gives you the foundation to understand everything else in AI. No math degree required."
        buttonText="Start Learning"
        onStart={() => setStage(0)}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms ml-root quiz-fade-in">
        <Quiz
          questions={machineLearningQuiz}
          tabName="Machine Learning"
          onBack={() => setShowQuiz(false)}
          onGoHome={onGoHome ? () => { reset(); onGoHome() } : undefined}
        />
      </div>
    )
  }

  return (
    <div className="how-llms ml-root">
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Machine Learning</strong> — This is the foundation of all modern AI. From spam filters to recommendation engines to self-driving cars — it all starts here. Let's build your mental model from scratch.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper ml-stepper">
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
                  <ToolChips tools={ML_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>← Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'I get it, show me more →',
                        'Let\'s explore each type →',
                        'Show me how training works →',
                        'Take me deeper →',
                        'Got it, next challenge →',
                        'Show me real use cases →',
                        'How do projects work? →',
                        'Test my knowledge →',
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
          <div className="how-final-celebration">🎉 You're now an ML Expert!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.emoji}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">📋 Your Machine Learning Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>When to use</th>
                  <th>Key phrase</th>
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
            {onSwitchTab && (
              <>
                <button className="how-start-btn" onClick={() => onSwitchTab('playground')}>
                  → Practice in Playground
                </button>
                <button className="how-secondary-btn" onClick={() => onSwitchTab('how-llms-work')}>
                  → Try How LLMs Work next
                </button>
              </>
            )}
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MachineLearning
