import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, BookIcon, FileIcon, CodeIcon, TrendingUpIcon, ChatIcon, TargetIcon, GearIcon, BarChartIcon, SearchIcon, ZapIcon, RocketIcon, EyeIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { fineTuningQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './FineTuning.css'

const FT_TOOLS = {
  0: [
    { name: 'OpenAI Fine-tuning API', color: '#5856D6', desc: 'Fine-tune GPT models with your data' },
    { name: 'HuggingFace', color: '#5856D6', desc: 'Open-source model hub and training tools' },
    { name: 'Google Vertex AI', color: '#0071E3', desc: 'Google Cloud fine-tuning platform' },
    { name: 'Azure OpenAI', color: '#0071E3', desc: 'Microsoft cloud fine-tuning service' },
  ],
  1: [
    { name: 'LangChain', color: '#34C759', desc: 'Framework for LLM application development' },
    { name: 'OpenAI API', color: '#5856D6', desc: 'Direct access to OpenAI models' },
    { name: 'Anthropic API', color: '#5856D6', desc: 'Access to Claude models' },
  ],
  2: [
    { name: 'PyTorch', color: '#5856D6', desc: 'Deep learning framework by Meta' },
    { name: 'TensorFlow', color: '#5856D6', desc: 'Google ML framework for production' },
    { name: 'HuggingFace Trainer', color: '#5856D6', desc: 'High-level training API' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Experiment tracking and visualization' },
  ],
  3: [
    { name: 'Label Studio', color: '#34C759', desc: 'Open-source data labeling tool' },
    { name: 'Scale AI', color: '#8E8E93', desc: 'Enterprise data labeling platform' },
    { name: 'Argilla', color: '#34C759', desc: 'Open-source data curation for LLMs' },
    { name: 'OpenAI Validator', color: '#5856D6', desc: 'Validate fine-tuning data format' },
  ],
  4: [
    { name: 'PEFT', color: '#5856D6', desc: 'Parameter-efficient fine-tuning library' },
    { name: 'QLoRA', color: '#5856D6', desc: 'Quantized LoRA for memory efficiency' },
    { name: 'Axolotl', color: '#34C759', desc: 'Easy-to-use fine-tuning framework' },
    { name: 'LLaMA Factory', color: '#34C759', desc: 'All-in-one LLM fine-tuning toolkit' },
  ],
  5: [
    { name: 'OpenAI Evals', color: '#5856D6', desc: 'Evaluation framework for LLMs' },
    { name: 'LM Eval Harness', color: '#34C759', desc: 'Standard benchmark evaluation' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Training monitoring and dashboards' },
    { name: 'Ragas', color: '#34C759', desc: 'RAG and LLM evaluation framework' },
  ],
  6: [
    { name: 'OpenAI Fine-tuning API', color: '#5856D6', desc: 'Production fine-tuning service' },
    { name: 'Google Vertex AI', color: '#0071E3', desc: 'Enterprise ML platform' },
    { name: 'HuggingFace AutoTrain', color: '#5856D6', desc: 'No-code fine-tuning solution' },
  ],
  7: [
    { name: 'OpenAI Fine-tuning API', color: '#5856D6', desc: 'Fine-tune GPT models' },
    { name: 'HuggingFace AutoTrain', color: '#5856D6', desc: 'Automated model training' },
    { name: 'Axolotl', color: '#34C759', desc: 'Streamlined fine-tuning workflow' },
    { name: 'Weights & Biases', color: '#8E8E93', desc: 'Full experiment tracking' },
  ],
}

const STAGES = [
  { key: 'what-is-ft', label: 'What is FT?' },
  { key: 'when-to-ft', label: 'When to FT' },
  { key: 'how-it-works', label: 'How It Works' },
  { key: 'data-prep', label: 'Data Prep' },
  { key: 'lora', label: 'LoRA' },
  { key: 'evaluation', label: 'Evaluation' },
  { key: 'real-world', label: 'Real World' },
  { key: 'checklist', label: 'Checklist' },
]

const STAGE_TOOLTIPS = {
  'what-is-ft': 'What fine-tuning is and why it matters',
  'when-to-ft': 'When to use fine-tuning vs RAG vs prompting',
  'how-it-works': 'How the fine-tuning process actually works',
  'data-prep': 'How to prepare high quality training data',
  'lora': 'LoRA \u2014 fine-tuning at a fraction of the cost',
  'evaluation': 'How to evaluate your fine-tuned model',
  'real-world': 'Real companies using fine-tuning today',
  'checklist': 'Your complete fine-tuning checklist',
}

const QUICK_REFERENCE = [
  { technique: 'Fine-Tuning Basics', when: 'Understanding FT', phrase: 'Specialize, don\'t retrain', icon: <BookIcon size={24} color="#8E8E93" /> },
  { technique: 'Decision Framework', when: 'Choosing approach', phrase: 'Prompt < RAG < FT < Scratch', icon: <TargetIcon size={24} color="#8E8E93" /> },
  { technique: 'Training Process', when: 'Running FT', phrase: 'Start from pre-trained weights', icon: <GearIcon size={24} color="#8E8E93" /> },
  { technique: 'Data Quality', when: 'Preparing data', phrase: '50 perfect > 5000 mediocre', icon: <BarChartIcon size={24} color="#8E8E93" /> },
  { technique: 'LoRA', when: 'Reducing cost', phrase: '0.06% params, 100x cheaper', icon: <ZapIcon size={24} color="#8E8E93" /> },
  { technique: 'Evaluation', when: 'Measuring quality', phrase: 'LLM-as-judge + human eval', icon: <EyeIcon size={24} color="#8E8E93" /> },
  { technique: 'Industry Use', when: 'Real applications', phrase: 'Med, Legal, Code, Finance', icon: <TrendingUpIcon size={24} color="#8E8E93" /> },
  { technique: 'Deployment', when: 'Going to production', phrase: 'A/B test, monitor, retrain', icon: <RocketIcon size={24} color="#8E8E93" /> },
]

/* ===================================
   STAGE 1 — WHAT IS FINE-TUNING?
   =================================== */
function WhatIsFTViz({ active }) {
  const [visiblePanels, setVisiblePanels] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    setVisiblePanels(0)
    let i = 0
    function showNext() {
      i++
      setVisiblePanels(i)
      if (i < 3) {
        timerRef.current = setTimeout(showNext, 600)
      }
    }
    timerRef.current = setTimeout(showNext, 400)
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">See how fine-tuning transforms responses:</div>

      <div className="ft-comparison-panels">
        {visiblePanels >= 1 && (
          <div className="ft-comp-panel ft-slide-in" style={{ borderTop: '2px solid #FF9500' }}>
            <div className="ft-comp-label">Base GPT-4</div>
            <div className="ft-comp-question">Q: Analyze this chest X-ray report</div>
            <div className="ft-comp-answer">I can provide general information about chest X-rays...</div>
            <div className="ft-comp-status">
              <CrossIcon size={14} color="#FF3B30" />
              <span>Generic, cautious, not specialized</span>
            </div>
          </div>
        )}

        {visiblePanels >= 2 && (
          <div className="ft-comp-panel ft-slide-in" style={{ borderTop: '2px solid #FF9500' }}>
            <div className="ft-comp-label">RAG + Medical Docs</div>
            <div className="ft-comp-answer">Based on retrieved literature: opacity in lower left...</div>
            <div className="ft-comp-status">
              <CheckIcon size={14} color="#34C759" />
              <span>Factual but still generic tone</span>
            </div>
          </div>
        )}

        {visiblePanels >= 3 && (
          <div className="ft-comp-panel ft-slide-in" style={{ borderTop: '2px solid #34C759' }}>
            <div className="ft-comp-label">Fine-tuned Medical Model</div>
            <div className="ft-comp-answer">Bilateral infiltrates consistent with pneumonia. Recommend: CBC, sputum culture, empiric antibiotics...</div>
            <div className="ft-comp-status">
              <CheckIcon size={14} color="#34C759" />
              <span>Expert tone, domain-specific reasoning</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 2 — WHEN TO FINE-TUNE
   =================================== */
function WhenToFTViz({ active }) {
  const [path, setPath] = useState([])
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (active) {
      setPath([])
      setResult(null)
    }
  }, [active])

  function decide(choice) {
    const newPath = [...path, choice]
    setPath(newPath)

    if (newPath.length === 1 && choice === 'yes') {
      setResult({ label: 'RAG', color: '#FF9500' })
    } else if (newPath.length === 2 && choice === 'yes') {
      setResult({ label: 'Fine-tuning', color: '#5856D6' })
    } else if (newPath.length === 3 && choice === 'yes') {
      setResult({ label: 'Prompting', color: '#0071E3' })
    } else if (newPath.length === 3 && choice === 'no') {
      setResult({ label: 'Fine-tuning', color: '#5856D6' })
    }
  }

  function resetTree() {
    setPath([])
    setResult(null)
  }

  const questions = [
    'Do you need specific facts from your documents?',
    'Do you need specific behavior, style, or tone?',
    'Is prompting already working well enough?',
  ]

  const currentQ = path.length

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">Click through the decision tree:</div>

      <div className="ft-decision-tree">
        {path.map((choice, i) => (
          <div key={i} className="ft-decision-node ft-decision-done">
            <div className="ft-decision-question">{questions[i]}</div>
            <div className="ft-decision-choice">{choice === 'yes' ? 'Yes' : 'No'}</div>
          </div>
        ))}

        {!result && currentQ < questions.length && (
          <div className="ft-decision-node ft-decision-active how-pop-in">
            <div className="ft-decision-question">{questions[currentQ]}</div>
            <div className="ft-decision-buttons">
              <button className="ft-decision-btn ft-decision-btn-yes" onClick={() => decide('yes')}>Yes</button>
              <button className="ft-decision-btn ft-decision-btn-no" onClick={() => decide('no')}>No</button>
            </div>
          </div>
        )}

        {result && (
          <div className="ft-decision-result how-pop-in" style={{ borderLeft: `2px solid ${result.color}` }}>
            <CheckIcon size={16} color="#34C759" />
            <span>Recommended: <strong style={{ color: result.color }}>{result.label}</strong></span>
          </div>
        )}
      </div>

      {result && (
        <div className="ft-step-actions">
          <button className="ft-replay-btn" onClick={resetTree}>Try again</button>
        </div>
      )}
    </div>
  )
}

/* ===================================
   STAGE 3 — HOW FINE-TUNING WORKS
   =================================== */
function HowFTWorksViz({ active }) {
  const [animStep, setAnimStep] = useState(0)

  const steps = [
    { num: 1, label: 'Pre-trained weights', desc: 'Start with billions of parameters trained on the internet' },
    { num: 2, label: 'Your training data flows in', desc: 'Feed prompt/response pairs into the model' },
    { num: 3, label: 'Weights shift slightly', desc: 'Parameters adjust toward your domain patterns' },
    { num: 4, label: 'Domain-specific model emerges', desc: 'The model now thinks like your expert data' },
    { num: 5, label: 'Ready to deploy', desc: 'Deploy and serve predictions to users' },
  ]

  useEffect(() => {
    if (active && animStep === 0) setAnimStep(1)
  }, [active])

  function nextStep() {
    if (animStep < steps.length) setAnimStep(animStep + 1)
  }

  function resetSteps() {
    setAnimStep(1)
  }

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">Step through the fine-tuning process:</div>
      <div className="ft-step-counter">Step {animStep} of {steps.length}</div>

      <div className="ft-pipeline-steps">
        {steps.map((s, i) => {
          const stepIdx = i + 1
          const isVisible = animStep >= stepIdx
          const isCurrent = animStep === stepIdx
          const isDone = animStep > stepIdx

          return isVisible ? (
            <div key={i} className={`ft-pipeline-card ft-slide-in ${isCurrent ? 'ft-pipeline-card-active' : ''} ${isDone ? 'ft-pipeline-card-done' : ''}`}>
              <div className="ft-pipeline-card-header">
                <div className={`ft-pipeline-card-num ${isDone ? 'ft-pipeline-card-num-done' : ''}`}>
                  {isDone ? <CheckIcon size={14} /> : stepIdx}
                </div>
                <div className="ft-pipeline-card-label">{s.label}</div>
              </div>
              <div className="ft-pipeline-card-desc">{s.desc}</div>
            </div>
          ) : null
        })}
      </div>

      <div className="ft-step-actions">
        {animStep < steps.length ? (
          <button className="ft-next-step-btn" onClick={nextStep}>Next Step &rarr;</button>
        ) : (
          <>
            <div className="ft-success-banner how-pop-in">Full fine-tuning pipeline complete!</div>
            <button className="ft-replay-btn" onClick={resetSteps}>Start Over</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 4 — PREPARING TRAINING DATA
   =================================== */
function DataPrepViz({ active }) {
  const [showBad, setShowBad] = useState(false)

  useEffect(() => {
    if (active) {
      setShowBad(false)
      const timer = setTimeout(() => setShowBad(true), 600)
      return () => clearTimeout(timer)
    }
  }, [active])

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">Good vs bad training examples:</div>

      <div className="ft-data-examples">
        <div className="ft-data-card ft-slide-in" style={{ borderTop: '2px solid #34C759' }}>
          <div className="ft-data-card-label">
            <CheckIcon size={14} color="#34C759" />
            <span>Good Example</span>
          </div>
          <div className="ft-data-code">
            <div className="ft-data-role ft-data-role-system">system: You are a medical assistant</div>
            <div className="ft-data-role ft-data-role-user">user: What are symptoms of diabetes?</div>
            <div className="ft-data-role ft-data-role-assistant">assistant: Common symptoms of diabetes include increased thirst (polydipsia), frequent urination (polyuria), unexplained weight loss, fatigue, blurred vision, and slow-healing wounds. Type 1 may present suddenly, while Type 2 develops gradually.</div>
          </div>
        </div>

        {showBad && (
          <div className="ft-data-card ft-slide-in" style={{ borderTop: '2px solid #FF3B30' }}>
            <div className="ft-data-card-label">
              <CrossIcon size={14} color="#FF3B30" />
              <span>Bad Example</span>
            </div>
            <div className="ft-data-code">
              <div className="ft-data-role ft-data-role-user">user: diabetes symptoms</div>
              <div className="ft-data-role ft-data-role-assistant">assistant: there are many symptoms look it up online</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 5 — LoRA
   =================================== */
function LoRAViz({ active }) {
  const [animPhase, setAnimPhase] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!active) return
    setAnimPhase(0)
    timerRef.current = setTimeout(() => setAnimPhase(1), 400)
    const t2 = setTimeout(() => setAnimPhase(2), 1200)
    const t3 = setTimeout(() => setAnimPhase(3), 2000)
    return () => {
      clearTimeout(timerRef.current)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [active])

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">How LoRA reduces parameters:</div>

      <div className="ft-lora-diagram">
        <div className={`ft-lora-section ${animPhase >= 1 ? 'ft-lora-visible' : ''}`}>
          <div className="ft-lora-matrix ft-lora-matrix-big">
            <div className="ft-lora-matrix-label">W (Original)</div>
            <div className="ft-lora-grid">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="ft-lora-cell" />
              ))}
            </div>
            <div className="ft-lora-params">7B parameters</div>
          </div>
        </div>

        {animPhase >= 2 && (
          <div className="ft-lora-section ft-lora-update how-pop-in">
            <div className="ft-lora-plus">=</div>
            <div className="ft-lora-small-matrices">
              <div className="ft-lora-matrix ft-lora-matrix-small">
                <div className="ft-lora-matrix-label">A</div>
                <div className="ft-lora-grid ft-lora-grid-small-a">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="ft-lora-cell ft-lora-cell-active" />
                  ))}
                </div>
              </div>
              <div className="ft-lora-times">&times;</div>
              <div className="ft-lora-matrix ft-lora-matrix-small">
                <div className="ft-lora-matrix-label">B</div>
                <div className="ft-lora-grid ft-lora-grid-small-b">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="ft-lora-cell ft-lora-cell-active" />
                  ))}
                </div>
              </div>
            </div>
            <div className="ft-lora-params ft-lora-params-small">~4M parameters (0.06%)</div>
          </div>
        )}

        {animPhase >= 3 && (
          <div className="ft-lora-badge how-pop-in">100x cheaper</div>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 6 — EVALUATION
   =================================== */
function EvaluationViz({ active }) {
  const [showBars, setShowBars] = useState(false)

  const tests = [
    { question: 'Medical diagnosis accuracy', base: 45, finetuned: 89, winner: 'ft' },
    { question: 'Clinical tone consistency', base: 30, finetuned: 92, winner: 'ft' },
    { question: 'Drug interaction knowledge', base: 55, finetuned: 88, winner: 'ft' },
    { question: 'General conversation', base: 90, finetuned: 82, winner: 'base' },
    { question: 'Treatment recommendations', base: 40, finetuned: 85, winner: 'ft' },
  ]

  useEffect(() => {
    if (active) {
      setShowBars(false)
      const timer = setTimeout(() => setShowBars(true), 400)
      return () => clearTimeout(timer)
    }
  }, [active])

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">Base model vs fine-tuned model comparison:</div>

      <div className="ft-eval-table">
        <div className="ft-eval-header">
          <span className="ft-eval-header-q">Test Question</span>
          <span className="ft-eval-header-score">Base</span>
          <span className="ft-eval-header-score">Fine-tuned</span>
          <span className="ft-eval-header-status" />
        </div>
        {tests.map((t, i) => (
          <div key={i} className="ft-eval-row">
            <span className="ft-eval-question">{t.question}</span>
            <div className="ft-eval-bar-cell">
              <div className="ft-eval-bar-track">
                <div className="ft-eval-bar ft-eval-bar-base" style={{ width: showBars ? `${t.base}%` : '0%' }} />
              </div>
              <span className="ft-eval-pct">{t.base}%</span>
            </div>
            <div className="ft-eval-bar-cell">
              <div className="ft-eval-bar-track">
                <div className="ft-eval-bar ft-eval-bar-ft" style={{ width: showBars ? `${t.finetuned}%` : '0%' }} />
              </div>
              <span className="ft-eval-pct">{t.finetuned}%</span>
            </div>
            <span className="ft-eval-status">
              {t.winner === 'ft' ? <CheckIcon size={14} color="#34C759" /> : <CrossIcon size={14} color="#FF3B30" />}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 7 — REAL WORLD EXAMPLES
   =================================== */
function RealWorldViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)

  const industries = [
    {
      icon: <SearchIcon size={20} color="#5856D6" />,
      name: 'Healthcare',
      text: 'Fine-tuned on medical literature and clinical notes. Clinical accuracy, drug interactions, dosing.',
      example: 'Med-PaLM 2 by Google',
    },
    {
      icon: <FileIcon size={20} color="#5856D6" />,
      name: 'Legal',
      text: 'Fine-tuned on case law, contracts, regulations. Reviews contracts, summarizes relevant case law.',
      example: 'Harvey AI',
    },
    {
      icon: <CodeIcon size={20} color="#5856D6" />,
      name: 'Coding',
      text: 'Fine-tuned on code repos and documentation. Company style, internal APIs, conventions.',
      example: 'GitHub Copilot, Cursor',
    },
    {
      icon: <TrendingUpIcon size={20} color="#5856D6" />,
      name: 'Finance',
      text: 'Fine-tuned on financial reports, earnings calls. Expert financial analysis and terminology.',
      example: 'Bloomberg GPT',
    },
    {
      icon: <BookIcon size={20} color="#5856D6" />,
      name: 'Education',
      text: 'Fine-tuned on curriculum and teaching methods. Tutors students, adapts to their level.',
      example: 'Khan Academy Khanmigo',
    },
    {
      icon: <ChatIcon size={20} color="#5856D6" />,
      name: 'Customer Service',
      text: 'Fine-tuned on products, policies, FAQs. Handles 80% of tickets, matches brand voice.',
      example: 'Intercom Fin',
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
    <div className="ft-viz">
      <div className="ft-demo-label">Fine-tuning powers industry-leading AI products:</div>
      <div className="ft-step-counter">Industry {visibleCards} of {industries.length}</div>

      <div className="ft-industry-cards">
        {industries.map((ind, i) => (
          i < visibleCards && (
            <div key={i} className="ft-industry-card ft-slide-in">
              <div className="ft-industry-card-icon">{ind.icon}</div>
              <div className="ft-industry-card-content">
                <div className="ft-industry-card-name">{ind.name}</div>
                <div className="ft-industry-card-text">{ind.text}</div>
                <div className="ft-industry-card-example">Example: {ind.example}</div>
              </div>
            </div>
          )
        ))}
      </div>

      <div className="ft-step-actions">
        {visibleCards < industries.length ? (
          <button className="ft-next-step-btn" onClick={nextCard}>Show Next &rarr;</button>
        ) : (
          <>
            <div className="ft-success-banner how-pop-in">All {industries.length} industries revealed!</div>
            <button className="ft-replay-btn" onClick={resetCards}>Start Over</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ===================================
   STAGE 8 — CHECKLIST
   =================================== */
function ChecklistViz({ active }) {
  const [checked, setChecked] = useState(new Set())

  const sections = [
    {
      title: 'Before You Start',
      items: ['Define the specific task clearly', 'Confirm fine-tuning beats prompting', 'Estimate budget', 'Choose base model'],
    },
    {
      title: 'Data Preparation',
      items: ['Collect minimum 50 quality examples', 'Format as prompt/response pairs', 'Review each for quality', 'Split 80% train / 20% validation'],
    },
    {
      title: 'Training',
      items: ['Start with 1-3 epochs', 'Monitor training loss curve', 'Watch for overfitting', 'Save checkpoints'],
    },
    {
      title: 'Evaluation',
      items: ['Compare to base model on test set', 'Human evaluation on 20+ examples', 'Test edge cases', 'Check for catastrophic forgetting'],
    },
    {
      title: 'Deployment',
      items: ['A/B test with small traffic %', 'Monitor production quality', 'Plan re-training schedule', 'Document data used'],
    },
  ]

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0)
  const progress = (checked.size / totalItems) * 100

  function toggleItem(key) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  return (
    <div className="ft-viz">
      <div className="ft-demo-label">Work through this checklist systematically:</div>

      <div className="ft-progress-bar">
        <div className="ft-progress-track">
          <div className="ft-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="ft-progress-label">{checked.size}/{totalItems} complete</span>
      </div>

      <div className="ft-checklist-sections">
        {sections.map((section, si) => (
          <div key={si} className="ft-checklist-section">
            <div className="ft-checklist-section-title">{section.title}</div>
            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`
              const isChecked = checked.has(key)
              return (
                <button
                  key={key}
                  className={`ft-checklist-item ${isChecked ? 'ft-checklist-item-done' : ''}`}
                  onClick={() => toggleItem(key)}
                >
                  <span className="ft-checklist-checkbox">
                    {isChecked && <CheckIcon size={12} color="#34C759" />}
                  </span>
                  <span className="ft-checklist-text">{item}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {checked.size === totalItems && (
        <div className="ft-success-banner how-pop-in" style={{ marginTop: 16 }}>
          Checklist complete! You're ready to fine-tune.
        </div>
      )}
    </div>
  )
}

/* ===================================
   MAIN COMPONENT
   =================================== */
function FineTuning({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('fine-tuning', -1)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(stage === -1)
  const [showFinal, setShowFinal] = useState(stage >= STAGES.length)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
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
      setFading(true)
      setTimeout(() => {
        setShowFinal(true)
        setStage(STAGES.length)
        markModuleComplete('fine-tuning')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.ft-root')
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

  function reset() {
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
  }

  const vizComponents = {
    0: <WhatIsFTViz active={stage === 0} />,
    1: <WhenToFTViz active={stage === 1} />,
    2: <HowFTWorksViz active={stage === 2} />,
    3: <DataPrepViz active={stage === 3} />,
    4: <LoRAViz active={stage === 4} />,
    5: <EvaluationViz active={stage === 5} />,
    6: <RealWorldViz active={stage === 6} />,
    7: <ChecklistViz active={stage === 7} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: What is Fine-Tuning?',
      content: "A pre-trained model like GPT-4 knows a little about everything. Fine-tuning continues training it on YOUR specific data \u2014 making it an expert in your domain.\n\nThink of it like hiring a smart generalist consultant and sending them to a 3-month specialist bootcamp. Same brain, much more focused expertise.\n\nApproaches by effort and control:\n\n\u2022 Prompting \u2014 zero effort, least control\n\n\u2022 RAG \u2014 low effort, good for facts\n\n\u2022 Fine-tuning \u2014 medium effort, best for style/behavior\n\n\u2022 Training from scratch \u2014 maximum effort, full control",
      tip: 'GPT-3.5 fine-tuned on medical data outperforms GPT-4 on medical tasks \u2014 specialization beats raw size.',
    },
    1: {
      title: 'Stage 2: When to Fine-Tune vs RAG vs Prompt',
      content: "Choosing the wrong approach wastes time and money.\n\nUSE PROMPTING WHEN: Task is straightforward, budget is tight, speed matters.\n\nUSE RAG WHEN: You need specific facts, info changes frequently, data privacy matters.\n\nUSE FINE-TUNING WHEN: You need specific tone or style, task is highly repetitive, behavior must be very consistent, you have 100+ quality examples.\n\nTRAIN FROM SCRATCH WHEN: Truly unique domain, large AI lab, budget over $10M.",
    },
    2: {
      title: 'Stage 3: How Fine-Tuning Actually Works',
      content: "Fine-tuning continues training on your dataset \u2014 starting from pre-trained weights, not random ones.\n\nThe process:\n\n1. Start with pre-trained model weights\n\n2. Prepare training examples (prompt \u2192 ideal response)\n\n3. Run training for a few epochs\n\n4. Weights shift slightly toward your domain\n\n5. Evaluate on held-out test examples\n\n6. Deploy the fine-tuned model\n\nKey insight: You're steering existing knowledge in a specific direction \u2014 not teaching from scratch.",
    },
    3: {
      title: 'Stage 4: Data is Everything',
      content: "Your fine-tuned model quality is entirely determined by training data quality.\n\nFormat (OpenAI style):\n\n{\"messages\": [{\"role\": \"system\", \"content\": \"...\"}, {\"role\": \"user\", \"content\": \"...\"}, {\"role\": \"assistant\", \"content\": \"...\"}]}",
      rules: true,
      tip: '50 perfect examples beat 5,000 mediocre ones.',
    },
    4: {
      title: 'Stage 5: LoRA \u2014 Fine-Tuning Without the Cost',
      content: "Full fine-tuning updates ALL parameters \u2014 expensive and slow. LoRA achieves similar results updating only a tiny fraction.\n\nHow LoRA works: Instead of updating full weight matrix W, add two small matrices A and B: W' = W + A\u00D7B\n\nResults:\n\nFull fine-tuning: 7 billion parameters\n\nLoRA: ~4 million parameters (0.06%)\n\nQuality difference: minimal\n\nCost difference: 100x cheaper",
      tip: 'This is why you can fine-tune LLaMA on a single GPU.',
    },
    5: {
      title: 'Stage 6: How Do You Know It\'s Working?',
      content: "Evaluation is the hardest part. No single accuracy metric exists.\n\n1. Automated metrics: Perplexity, ROUGE score, BLEU score\n\n2. Human evaluation: A/B test base vs fine-tuned model. Rate accuracy, tone, helpfulness.\n\n3. LLM-as-judge: Use GPT-4 to rate your model responses. Fast and scalable.\n\n4. Task-specific benchmarks: Known correct answers, measure match.",
      warnings: [
        'Catastrophic forgetting \u2014 loses general knowledge',
        'Overfitting \u2014 perfect on training, bad on new data',
        'Reward hacking \u2014 optimizes metric not quality',
      ],
    },
    6: {
      title: 'Stage 7: Fine-Tuning in the Wild',
      content: "Fine-tuning powers some of the most impressive AI products used by millions today.",
    },
    7: {
      title: 'Stage 8: Your Fine-Tuning Roadmap',
      content: "Work through this checklist systematically. Skipping steps is the number one cause of failed fine-tuning projects.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="fine-tuning" size={48} style={{ color: '#5856D6' }} />}
        title="Fine-Tuning"
        subtitle="Teaching AI to be an expert in YOUR domain"
        description="Pre-trained models are generalists. Fine-tuning makes them specialists. Learn how companies build custom AI models without training from scratch."
        buttonText="Start Learning"
        onStart={() => { setStage(0); markModuleStarted('fine-tuning') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms ft-root quiz-fade-in">
        <Quiz
          questions={fineTuningQuiz}
          tabName="Fine-Tuning"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="fine-tuning"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms ft-root${fading ? ' how-fading' : ''}`}>
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to Fine-Tuning</strong> — This is how you take a general-purpose AI and turn it into a domain expert. Medical AI, legal AI, coding AI — it all starts here.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper ft-stepper">
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

                  {explanations[stage].rules && (
                    <div className="ft-rules-list">
                      <div className="ft-rule"><CheckIcon size={14} color="#34C759" /> Minimum 50-100 examples (more = better)</div>
                      <div className="ft-rule"><CheckIcon size={14} color="#34C759" /> Consistent format and style</div>
                      <div className="ft-rule"><CheckIcon size={14} color="#34C759" /> Diverse examples covering edge cases</div>
                      <div className="ft-rule"><CheckIcon size={14} color="#34C759" /> Human-reviewed for accuracy</div>
                      <div className="ft-rule"><CrossIcon size={14} color="#FF3B30" /> No contradictory examples</div>
                      <div className="ft-rule"><CrossIcon size={14} color="#FF3B30" /> No low-quality or rushed responses</div>
                    </div>
                  )}

                  {explanations[stage].tip && (
                    <div className="ft-tip">
                      <TipIcon size={14} color="#eab308" />
                      <span>{explanations[stage].tip}</span>
                    </div>
                  )}

                  {explanations[stage].warnings && (
                    <div className="ft-warnings">
                      {explanations[stage].warnings.map((w, i) => (
                        <div key={i} className="ft-warning">
                          <WarningIcon size={14} color="#FF9500" />
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <ToolChips tools={FT_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'Show me the comparison \u2192',
                        'How does it actually work? \u2192',
                        'Data preparation \u2192',
                        'Show me LoRA \u2192',
                        'How do I evaluate it? \u2192',
                        'Real world examples \u2192',
                        'Give me the checklist \u2192',
                        'Test my knowledge \u2192',
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
          <div className="how-final-celebration">You're now a Fine-Tuning Expert!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Fine-Tuning Toolkit</div>
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
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="fine-tuning" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default FineTuning
