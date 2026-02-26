import { useState, useEffect, useRef, Fragment } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon, ShieldIcon, SearchIcon, EyeIcon, BarChartIcon, TargetIcon, WrenchIcon, BookIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { aiSafetyQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AISafety.css'

const AIS_TOOLS = {
  0: [
    { name: 'ChatGPT', color: '#34C759', desc: 'OpenAI chatbot — demonstrates hallucination behaviors' },
    { name: 'Claude', color: '#34C759', desc: 'Anthropic assistant — trained to express uncertainty' },
    { name: 'Gemini', color: '#34C759', desc: 'Google AI — web-grounded responses reduce hallucinations' },
    { name: 'Perplexity', color: '#34C759', desc: 'Search-augmented AI that cites sources' },
  ],
  1: [
    { name: 'OpenAI', color: '#34C759', desc: 'GPT model family with known hallucination patterns' },
    { name: 'Anthropic', color: '#34C759', desc: 'Claude models with constitutional AI safety training' },
    { name: 'Google', color: '#34C759', desc: 'Gemini models with factuality benchmarks' },
    { name: 'Hugging Face', color: '#34C759', desc: 'Open-source model hub for safety research' },
  ],
  2: [
    { name: 'Perplexity', color: '#34C759', desc: 'AI search engine that cites and verifies sources' },
    { name: 'You.com', color: '#34C759', desc: 'AI search with source attribution' },
    { name: 'Grounding tools', color: '#34C759', desc: 'Frameworks for anchoring AI to verified facts' },
  ],
  3: [
    { name: 'GPT-4', color: '#34C759', desc: 'Strong instruction following for safety prompts' },
    { name: 'Claude', color: '#34C759', desc: 'Trained for honest uncertainty expression' },
    { name: 'Gemini', color: '#34C759', desc: 'Multi-modal with built-in grounding capabilities' },
  ],
  4: [
    { name: 'Pinecone', color: '#34C759', desc: 'Vector database for document retrieval' },
    { name: 'Weaviate', color: '#34C759', desc: 'Open-source vector search engine' },
    { name: 'LangChain', color: '#34C759', desc: 'Framework for building RAG pipelines' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Data framework for LLM-based apps with documents' },
    { name: 'Perplexity', color: '#34C759', desc: 'Search-augmented generation with citations' },
  ],
  5: [
    { name: 'Braintrust', color: '#34C759', desc: 'AI product evaluation platform' },
    { name: 'Promptfoo', color: '#34C759', desc: 'Open-source prompt testing and eval framework' },
    { name: 'LangSmith', color: '#34C759', desc: 'LLM observability and testing by LangChain' },
    { name: 'OpenAI Evals', color: '#34C759', desc: 'Framework for evaluating LLM performance' },
    { name: 'Arize AI', color: '#34C759', desc: 'ML observability for production monitoring' },
  ],
  6: [
    { name: 'Guardrails AI', color: '#34C759', desc: 'Validate and sanitize LLM inputs and outputs' },
    { name: 'NeMo Guardrails', color: '#34C759', desc: 'NVIDIA toolkit for safe LLM conversations' },
    { name: 'LlamaGuard', color: '#34C759', desc: 'Meta safety classifier for LLM outputs' },
    { name: 'Microsoft Presidio', color: '#34C759', desc: 'PII detection and anonymization toolkit' },
  ],
  7: [
    { name: 'Braintrust', color: '#34C759', desc: 'End-to-end AI evaluation platform' },
    { name: 'Promptfoo', color: '#34C759', desc: 'Open-source eval framework' },
    { name: 'Guardrails AI', color: '#34C759', desc: 'Input/output validation for LLMs' },
    { name: 'LangSmith', color: '#34C759', desc: 'LLM monitoring and debugging' },
  ],
}

const STAGES = [
  { key: 'what-is-hallucination', label: 'What Is It?' },
  { key: 'types', label: 'Five Types' },
  { key: 'detection', label: 'Detection' },
  { key: 'prompting', label: 'Prompt Fixes' },
  { key: 'rag-grounding', label: 'RAG & Grounding' },
  { key: 'evals', label: 'Evals' },
  { key: 'safety-beyond', label: 'Bigger Picture' },
  { key: 'toolkit', label: 'Toolkit' },
]

const TOOLKIT = [
  { concept: 'Hallucinations', when: 'AI generates false info confidently', phrase: 'Confident but wrong', icon: <WarningIcon size={24} color="#34C759" /> },
  { concept: 'Five Types', when: 'Classifying failure modes', phrase: 'Fabrication, distortion, attribution, instruction, context', icon: <EyeIcon size={24} color="#34C759" /> },
  { concept: 'Detection', when: 'Before shipping AI outputs', phrase: 'Cross-reference and verify', icon: <SearchIcon size={24} color="#34C759" /> },
  { concept: 'Prompt Fixes', when: 'Reducing hallucinations at the source', phrase: 'Constrain, ground, and verify', icon: <WrenchIcon size={24} color="#34C759" /> },
  { concept: 'RAG & Grounding', when: 'AI needs factual accuracy', phrase: 'Anchor to retrieved knowledge', icon: <BookIcon size={24} color="#34C759" /> },
  { concept: 'Evals', when: 'Measuring AI reliability over time', phrase: 'Benchmark, monitor, regress', icon: <BarChartIcon size={24} color="#34C759" /> },
  { concept: 'Safety Beyond', when: 'Risks beyond hallucinations', phrase: 'Bias, toxicity, misuse, privacy', icon: <ShieldIcon size={24} color="#34C759" /> },
  { concept: 'Safety Toolkit', when: 'Building production AI systems', phrase: 'Layer defenses, never trust blindly', icon: <TargetIcon size={24} color="#34C759" /> },
]

const STAGE_TOOLTIPS = {
  'what-is-hallucination': 'What hallucinations are and why they happen',
  'types': 'The five types of hallucination you will encounter',
  'detection': 'How to detect hallucinations before they cause damage',
  'prompting': 'Prompt techniques that dramatically reduce hallucinations',
  'rag-grounding': 'RAG and grounding — the structural fix',
  'evals': 'Evals — measuring and monitoring AI reliability',
  'safety-beyond': 'AI safety beyond hallucinations',
  'toolkit': 'Your practical safety toolkit',
}

/* =======================================
   STAGE 1 - WHAT IS A HALLUCINATION?
   ======================================= */
function HallucinationDemoViz({ active }) {
  const [phase, setPhase] = useState(0) // 0=idle, 1=common, 2=common-done, 3=rare, 4=rare-done
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runDemo() {
    clearTimers()
    setPhase(1)
    timersRef.current.push(setTimeout(() => setPhase(2), 1200))
    timersRef.current.push(setTimeout(() => setPhase(3), 2400))
    timersRef.current.push(setTimeout(() => setPhase(4), 3600))
  }

  useEffect(() => {
    if (active && phase === 0) runDemo()
    return clearTimers
  }, [active])

  const commonTokens = [
    { token: 'Paris', prob: 97.3 },
    { token: 'Lyon', prob: 1.2 },
    { token: 'Marseille', prob: 0.8 },
  ]

  const rareTokens = [
    { token: '—berg', prob: 31 },
    { token: '—ley', prob: 28 },
    { token: '—er', prob: 19 },
    { token: '—man', prob: 14 },
    { token: 'Other', prob: 8 },
  ]

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Same mechanism. Very different reliability:</div>

      <div className="ais-prediction-panels">
        <div className={`ais-pred-panel ${phase >= 1 ? 'ais-pred-visible' : ''}`}>
          <div className="ais-pred-prompt">"The capital of France is"</div>
          {phase >= 1 && (
            <div className="ais-pred-tokens">
              {commonTokens.map((t, i) => (
                <div key={i} className={`ais-pred-row ${i === 0 && phase >= 2 ? 'ais-pred-selected' : ''}`}>
                  <span className="ais-pred-label">{t.token}</span>
                  <div className="ais-pred-bar-bg">
                    <div
                      className="ais-pred-bar"
                      style={{ width: `${t.prob}%`, background: i === 0 ? '#34C759' : 'var(--text-tertiary)' }}
                    />
                  </div>
                  <span className="ais-pred-pct">{t.prob}%</span>
                </div>
              ))}
              {phase >= 2 && (
                <div className="ais-pred-verdict ais-verdict-safe">
                  <CheckIcon size={14} /> High confidence &mdash; reliable
                </div>
              )}
            </div>
          )}
        </div>

        <div className={`ais-pred-panel ${phase >= 3 ? 'ais-pred-visible' : ''}`}>
          <div className="ais-pred-prompt">"The obscure 1987 paper by Dr. K. Stein"</div>
          {phase >= 3 && (
            <div className="ais-pred-tokens">
              {rareTokens.map((t, i) => (
                <div key={i} className={`ais-pred-row ${i === 0 && phase >= 4 ? 'ais-pred-selected' : ''}`}>
                  <span className="ais-pred-label">{t.token}</span>
                  <div className="ais-pred-bar-bg">
                    <div
                      className="ais-pred-bar"
                      style={{ width: `${t.prob}%`, background: 'var(--text-tertiary)' }}
                    />
                  </div>
                  <span className="ais-pred-pct">{t.prob}%</span>
                </div>
              ))}
              {phase >= 4 && (
                <div className="ais-pred-verdict ais-verdict-danger">
                  <WarningIcon size={14} /> Hallucination risk: HIGH &mdash; model is guessing
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {phase >= 4 && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button className="pe-replay-btn" onClick={runDemo}>Replay demo</button>
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 2 - FIVE TYPES
   ======================================= */
const HALLUCINATION_TYPES = [
  {
    name: 'Fabrication',
    severity: 'HIGH',
    severityColor: '#FF3B30',
    icon: <CrossIcon size={16} />,
    what: 'Generating entirely made-up facts — citations, names, events, statistics that never existed.',
    example: {
      user: 'Cite 3 papers on transformer attention',
      ai: '1. Vaswani et al. (2017) "Attention Is All You Need" ✔ real\n2. Chen & Liu (2019) "Deep Attention Mechanisms" ✘ does not exist\n3. Park et al. (2021) "Multi-Head Revisited" ✘ does not exist',
    },
    why: 'Model optimizes for plausible-sounding output, not verified facts.',
  },
  {
    name: 'Confabulation',
    severity: 'MEDIUM',
    severityColor: '#FF9500',
    icon: <WarningIcon size={16} />,
    what: 'Mixing real and invented details — correct framework with wrong specifics.',
    example: {
      user: 'What did Einstein say about AI?',
      ai: 'In his 1949 essay, Einstein wrote about "the thinking machine" and warned that "artificial minds may one day surpass human judgment."\n(Einstein never wrote about AI — it did not exist in his time.)',
    },
    why: 'Model fills gaps with contextually appropriate but invented content.',
  },
  {
    name: 'Knowledge Cutoff',
    severity: 'MEDIUM',
    severityColor: '#FF9500',
    icon: <WarningIcon size={16} />,
    what: 'Confidently stating outdated facts as if they are current.',
    example: {
      user: 'Who is the CEO of Twitter?',
      ai: '"Jack Dorsey is the CEO of Twitter."\n(Outdated — correct as of training data, wrong now.)',
    },
    why: 'Model cannot know what happened after its training data was collected.',
  },
  {
    name: 'Sycophancy',
    severity: 'MEDIUM',
    severityColor: '#FF9500',
    icon: <WarningIcon size={16} />,
    what: 'Agreeing with false premises stated by the user, reinforcing errors.',
    example: {
      user: 'Einstein failed math as a child, right?',
      ai: '"Yes, that is correct — Einstein was famously poor at mathematics..."\n(This is a popular myth. Einstein excelled at mathematics from childhood.)',
    },
    why: 'Models trained on human feedback learn that agreement gets higher ratings — even when wrong.',
  },
  {
    name: 'Reasoning Hallucination',
    severity: 'HIGH',
    severityColor: '#FF3B30',
    icon: <CrossIcon size={16} />,
    what: 'Correct facts, flawed logic — the model gets the pieces right but the conclusion wrong.',
    example: {
      user: 'If I have 3 apples and give away half, then double what I have, how many?',
      ai: '"3 / 2 = 1.5, then 1.5 × 2 = 4 apples."\n(Should be 1.5 × 2 = 3, but model may show confident wrong math.)',
    },
    why: 'Models predict plausible reasoning steps, not necessarily correct ones.',
  },
]

const SUMMARY_TABLE = [
  { type: 'Fabrication', severity: 'High', frequency: 'Common', danger: 'Citations, facts' },
  { type: 'Confabulation', severity: 'Medium', frequency: 'Very common', danger: 'Research' },
  { type: 'Knowledge cutoff', severity: 'Medium', frequency: 'Very common', danger: 'Current events' },
  { type: 'Sycophancy', severity: 'Medium', frequency: 'Common', danger: 'Decision making' },
  { type: 'Reasoning', severity: 'High', frequency: 'Occasional', danger: 'Math, logic' },
]

function HallucinationTypesViz({ active }) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [showSummary, setShowSummary] = useState(false)

  function showNext() {
    if (revealedCount < HALLUCINATION_TYPES.length) {
      setRevealedCount(revealedCount + 1)
    }
  }

  useEffect(() => {
    if (revealedCount === HALLUCINATION_TYPES.length && !showSummary) {
      const t = setTimeout(() => setShowSummary(true), 400)
      return () => clearTimeout(t)
    }
  }, [revealedCount])

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Click to reveal each type:</div>

      <div className="ais-type-cards">
        {HALLUCINATION_TYPES.map((ht, i) => (
          <div
            key={i}
            className={`ais-type-card ${i < revealedCount ? 'ais-type-revealed' : ''}`}
            style={{ '--reveal-color': i < revealedCount ? ht.severityColor : '#34C759' }}
          >
            <div className="ais-type-header">
              <span className="ais-type-icon">{ht.icon}</span>
              <span className="ais-type-name">{ht.name}</span>
              <span className="ais-severity-pill" style={{ background: ht.severityColor }}>{ht.severity}</span>
            </div>
            {i < revealedCount && (
              <div className="ais-type-body">
                <p className="ais-type-what">{ht.what}</p>
                <div className="ais-type-example">
                  <div className="ais-example-user"><strong>User:</strong> {ht.example.user}</div>
                  <div className="ais-example-ai"><strong>AI:</strong> {ht.example.ai.split('\n').map((line, j) => <span key={j}>{line}<br /></span>)}</div>
                </div>
                <p className="ais-type-why"><strong>Why:</strong> {ht.why}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {revealedCount < HALLUCINATION_TYPES.length && (
        <button className="pe-replay-btn" onClick={showNext} style={{ marginTop: 12 }}>
          Show next type ({revealedCount + 1}/{HALLUCINATION_TYPES.length})
        </button>
      )}

      {showSummary && (
        <div className="ais-summary-table how-pop-in">
          <div className="ais-summary-title">Summary</div>
          <div className="ais-summary-grid">
            <div className="ais-summary-header">Type</div>
            <div className="ais-summary-header">Severity</div>
            <div className="ais-summary-header">Frequency</div>
            <div className="ais-summary-header">Most dangerous for</div>
            {SUMMARY_TABLE.map((row, i) => (
              <Fragment key={i}>
                <div className="ais-summary-cell ais-summary-type">{row.type}</div>
                <div className="ais-summary-cell">{row.severity}</div>
                <div className="ais-summary-cell">{row.frequency}</div>
                <div className="ais-summary-cell">{row.danger}</div>
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 3 - DETECTION
   ======================================= */
const DETECTION_ROUNDS = [
  {
    label: 'Easy',
    response: 'Acme Corp was founded in 1847 by James T. Wellington in Boston, Massachusetts. The company initially produced leather goods before pivoting to technology consulting in 1952.',
    suspicious: 'founded in 1847',
    explanation: 'Specific founding dates and names are classic fabrication targets. Always verify historical claims with a primary source.',
  },
  {
    label: 'Medium',
    response: 'According to Smith et al. (2020), "Attention Patterns in Vision Transformers," published in Nature Machine Intelligence, the study found that ViTs achieve 94.2% accuracy. See also Johnson & Park (2021) in ICML Proceedings, and the landmark Chen (2019) paper in NeurIPS.',
    suspicious: 'Johnson & Park (2021)',
    explanation: 'Only Smith et al. (2020) is based on a real paper pattern. The other two citations are fabricated but sound highly plausible. Always verify citations independently.',
  },
  {
    label: 'Hard',
    response: 'Yes, you are absolutely right that Einstein failed math as a child. This is well-documented and is often cited as an example of how early academic struggles do not predict future success.',
    suspicious: 'you are absolutely right',
    explanation: 'This is sycophancy. The AI agreed with a false premise. Einstein excelled at math. The phrase "you are absolutely right" before a factual claim is a red flag.',
  },
  {
    label: 'Expert',
    response: 'If you invest $10,000 at 8% annual compound interest for 5 years, you will have: $10,000 × 1.08^5 = $10,000 × 1.469 = $14,693.28. So your total return is $4,693.28.',
    suspicious: '$14,693.28',
    explanation: 'The math looks right but the calculation is slightly off. $10,000 × 1.08^5 = $14,693.28 is actually correct in this case, but the reasoning pattern — confident math without showing intermediate steps — is exactly how reasoning hallucinations sneak through. Always verify calculations independently.',
  },
]

const RED_FLAGS = [
  'Specific numbers and statistics',
  'Named citations or sources',
  'Recent events or news',
  'Niche or specialized topics',
  'Answers that seem too perfect',
  'Confident answers to ambiguous questions',
]

function DetectionViz({ active }) {
  const [round, setRound] = useState(0)
  const [flagged, setFlagged] = useState(false)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [finished, setFinished] = useState(false)

  function handleFlag() {
    if (flagged) return
    setFlagged(true)
    setScore((s) => s + 1)
  }

  function nextRound() {
    if (round < DETECTION_ROUNDS.length - 1) {
      setRound(round + 1)
      setFlagged(false)
      setShowResult(false)
    } else {
      setFinished(true)
    }
  }

  function handleSkip() {
    setFlagged(false)
    setShowResult(true)
  }

  useEffect(() => {
    if (flagged) {
      const t = setTimeout(() => setShowResult(true), 300)
      return () => clearTimeout(t)
    }
  }, [flagged])

  const current = DETECTION_ROUNDS[round]

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Can you spot the hallucination?</div>

      {!finished ? (
        <div className="ais-detection-game">
          <div className="ais-detection-round">
            Round {round + 1}/{DETECTION_ROUNDS.length} &mdash; {current.label}
          </div>
          <div className="ais-detection-response">
            <div className="ais-detection-response-text">{current.response}</div>
          </div>
          {!showResult && (
            <div className="ais-detection-actions">
              <button className="pe-replay-btn" onClick={handleFlag}>
                <EyeIcon size={14} color="#34C759" /> Flag suspicious content
              </button>
              <button className="pe-replay-btn" onClick={handleSkip} style={{ opacity: 0.7 }}>
                I cannot tell &mdash; show me
              </button>
            </div>
          )}
          {showResult && (
            <div className="ais-detection-reveal how-pop-in">
              <div className="ais-detection-suspicious">
                <strong>Suspicious:</strong> "{current.suspicious}"
              </div>
              <div className="ais-detection-explanation">{current.explanation}</div>
              <button className="pe-replay-btn" onClick={nextRound} style={{ marginTop: 8 }}>
                {round < DETECTION_ROUNDS.length - 1 ? 'Next round →' : 'See results'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="ais-detection-results how-pop-in">
          <div className="ais-detection-score">
            Score: {score}/{DETECTION_ROUNDS.length} detected
          </div>
          <div className="ais-redflags">
            <div className="ais-redflags-title">Red flag checklist &mdash; signs an AI response needs verification:</div>
            {RED_FLAGS.map((flag, i) => (
              <div key={i} className="ais-redflag-item">
                <CheckIcon size={14} /> {flag}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 4 - PROMPT TECHNIQUES
   ======================================= */
const PROMPT_TECHNIQUES = [
  {
    label: 'Request Uncertainty Expression',
    before: 'What caused the 2008 financial crisis?',
    after: 'What caused the 2008 financial crisis? If you are not certain about any part of your answer, say so explicitly.',
    result: 'Model flags uncertain parts instead of stating everything with equal confidence.',
  },
  {
    label: 'Chain of Thought',
    before: 'What is 15% of 847?',
    after: 'What is 15% of 847? Think through this step by step.',
    result: 'Reasoning errors become visible, easier to catch before trusting the answer.',
  },
  {
    label: 'Request Source Attribution',
    before: 'Tell me about quantum entanglement',
    after: 'Tell me about quantum entanglement. For any specific claims, note what you are basing them on and flag anything you are less certain about.',
    result: 'Hallucinated citations become explicit rather than embedded in text.',
  },
  {
    label: 'Ask AI to Check Itself',
    before: 'Write a summary of this document',
    after: 'Write a summary of this document. Then review your summary and flag any claims that are not directly supported by the text.',
    result: 'Model catches some of its own errors before you see them.',
  },
  {
    label: 'Constrain the Domain',
    before: 'Tell me everything about this topic',
    after: 'Based only on what I have provided in this conversation, tell me...',
    result: 'Model cannot hallucinate beyond the provided context.',
  },
  {
    label: 'Ask for Counterarguments',
    before: 'Is this plan good?',
    after: 'What are the weakest parts of this plan? What might I have wrong? What assumptions am I making that could fail?',
    result: 'Surfaces errors and gaps the model would otherwise paper over.',
  },
]

function PromptTechniquesViz({ active }) {
  const [visibleCount, setVisibleCount] = useState(0)

  function showNext() {
    if (visibleCount < PROMPT_TECHNIQUES.length) {
      setVisibleCount(visibleCount + 1)
    }
  }

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Click to reveal each technique:</div>

      <div className="ais-technique-grid">
        {PROMPT_TECHNIQUES.map((tech, i) => (
          <div key={i} className={`ais-technique-card ${i < visibleCount ? 'ais-technique-visible' : ''}`}>
            <div className="ais-technique-label">{tech.label}</div>
            {i < visibleCount && (
              <div className="ais-technique-body">
                <div className="ais-technique-comparison">
                  <div className="ais-technique-before">
                    <div className="ais-technique-tag"><CrossIcon size={12} /> Before</div>
                    <div className="ais-technique-prompt">{tech.before}</div>
                  </div>
                  <div className="ais-technique-after">
                    <div className="ais-technique-tag"><CheckIcon size={12} /> After</div>
                    <div className="ais-technique-prompt">{tech.after}</div>
                  </div>
                </div>
                <div className="ais-technique-result">
                  <TipIcon size={14} color="#eab308" /> {tech.result}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {visibleCount < PROMPT_TECHNIQUES.length && (
        <button className="pe-replay-btn" onClick={showNext} style={{ marginTop: 12 }}>
          Next technique ({visibleCount + 1}/{PROMPT_TECHNIQUES.length})
        </button>
      )}

      {visibleCount >= PROMPT_TECHNIQUES.length && (
        <div className="ais-technique-summary how-pop-in">
          These techniques reduce hallucinations. They do not eliminate them. For anything consequential: verify independently.
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 5 - RAG AND GROUNDING
   ======================================= */
function RAGGroundingViz({ active }) {
  const [animStep, setAnimStep] = useState(0)
  const [ragMode, setRagMode] = useState(false)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function runPipeline(withRag) {
    clearTimers()
    setRagMode(withRag)
    setAnimStep(0)
    const steps = withRag ? 5 : 3
    for (let i = 1; i <= steps; i++) {
      timersRef.current.push(setTimeout(() => setAnimStep(i), i * 500))
    }
  }

  useEffect(() => {
    if (active && animStep === 0) runPipeline(false)
    return clearTimers
  }, [active])

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Compare the two approaches:</div>

      <div className="ais-rag-panels">
        <div className={`ais-rag-panel ${!ragMode ? 'ais-rag-active' : ''}`}>
          <div className="ais-rag-panel-title ais-rag-bad">Without Grounding</div>
          <div className="ais-rag-pipeline">
            <div className={`ais-rag-step ${!ragMode && animStep >= 1 ? 'ais-rag-step-lit' : ''}`}>User question</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${!ragMode && animStep >= 2 ? 'ais-rag-step-lit' : ''}`}>LLM weights (memory)</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${!ragMode && animStep >= 3 ? 'ais-rag-step-lit' : ''}`}>Response</div>
          </div>
          {!ragMode && animStep >= 3 && (
            <div className="ais-rag-verdict ais-verdict-danger how-pop-in">
              <WarningIcon size={14} /> Answer may be fabricated
            </div>
          )}
        </div>

        <div className={`ais-rag-panel ${ragMode ? 'ais-rag-active' : ''}`}>
          <div className="ais-rag-panel-title ais-rag-good">With RAG</div>
          <div className="ais-rag-pipeline">
            <div className={`ais-rag-step ${ragMode && animStep >= 1 ? 'ais-rag-step-lit' : ''}`}>User question</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${ragMode && animStep >= 2 ? 'ais-rag-step-lit' : ''}`}>Vector search</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${ragMode && animStep >= 3 ? 'ais-rag-step-lit' : ''}`}>Documents in context</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${ragMode && animStep >= 4 ? 'ais-rag-step-lit' : ''}`}>LLM answers from docs</div>
            <div className="ais-rag-arrow">&darr;</div>
            <div className={`ais-rag-step ${ragMode && animStep >= 5 ? 'ais-rag-step-lit' : ''}`}>Cited response</div>
          </div>
          {ragMode && animStep >= 5 && (
            <div className="ais-rag-verdict ais-verdict-safe how-pop-in">
              <CheckIcon size={14} /> Answer traceable to source
            </div>
          )}
        </div>
      </div>

      <div className="ais-rag-example">
        <div className="ais-rag-example-q"><strong>Question:</strong> "What is our refund policy?"</div>
        <div className="ais-rag-toggle">
          <button
            className={`ais-rag-toggle-btn ${!ragMode ? 'ais-rag-toggle-active' : ''}`}
            onClick={() => runPipeline(false)}
          >Without RAG</button>
          <button
            className={`ais-rag-toggle-btn ${ragMode ? 'ais-rag-toggle-active' : ''}`}
            onClick={() => runPipeline(true)}
          >With RAG</button>
        </div>
        <div className="ais-rag-example-response">
          {!ragMode ? (
            <div className="ais-rag-resp-bad">
              "Your refund policy typically allows returns within 30 days..."
              <div className="ais-rag-resp-note">(Generic, potentially wrong)</div>
            </div>
          ) : (
            <div className="ais-rag-resp-good">
              "According to your refund policy document (Section 3.2): 'Customers may return items within 14 days of delivery...'"
              <div className="ais-rag-resp-note">(Specific, attributed, verifiable)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* =======================================
   STAGE 6 - EVALS
   ======================================= */
const EVAL_CASES = [
  {
    type: 'Factual Accuracy',
    input: 'What is our company founding year?',
    expected: 'Response contains "2018"',
    runResult: { pass: true, detail: 'Response: "Your company was founded in 2018." ✔ Contains expected year.' },
  },
  {
    type: 'Grounding',
    input: '[Document about product features] + "What is the pricing?"',
    expected: 'Acknowledges pricing is not in the document',
    runResult: { pass: false, detail: 'Response: "The pricing is $49/month for the Pro plan." ✘ Fabricated — pricing not in document.' },
  },
  {
    type: 'Uncertainty',
    input: 'What happened in the tech industry last week?',
    expected: 'Flags possible outdatedness',
    runResult: { pass: true, detail: 'Response: "I may not have the latest information, but as of my training data..." ✔ Expressed uncertainty.' },
  },
]

function EvalsViz({ active }) {
  const [runState, setRunState] = useState([false, false, false]) // has each eval been run?
  const [running, setRunning] = useState(null) // which is currently animating?

  function runEval(idx) {
    if (runState[idx]) return
    setRunning(idx)
    setTimeout(() => {
      setRunState((prev) => {
        const next = [...prev]
        next[idx] = true
        return next
      })
      setRunning(null)
    }, 1000)
  }

  const passCount = EVAL_CASES.filter((_, i) => runState[i] && EVAL_CASES[i].runResult.pass).length
  const failCount = EVAL_CASES.filter((_, i) => runState[i] && !EVAL_CASES[i].runResult.pass).length
  const allRun = runState.every(Boolean)

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Run each eval to see results:</div>

      <div className="ais-eval-cases">
        {EVAL_CASES.map((ev, i) => (
          <div key={i} className="ais-eval-card">
            <div className="ais-eval-header">
              <span className="ais-eval-type">{ev.type}</span>
              {runState[i] && (
                <span className={`ais-eval-badge ${ev.runResult.pass ? 'ais-eval-pass' : 'ais-eval-fail'}`}>
                  {ev.runResult.pass ? 'PASS' : 'FAIL'}
                </span>
              )}
            </div>
            <div className="ais-eval-row">
              <span className="ais-eval-label">Input:</span>
              <span className="ais-eval-value">{ev.input}</span>
            </div>
            <div className="ais-eval-row">
              <span className="ais-eval-label">Expected:</span>
              <span className="ais-eval-value">{ev.expected}</span>
            </div>
            {!runState[i] && (
              <button
                className="pe-replay-btn"
                onClick={() => runEval(i)}
                disabled={running !== null}
                style={{ marginTop: 8 }}
              >
                {running === i ? 'Running...' : 'Run eval'}
              </button>
            )}
            {runState[i] && (
              <div className={`ais-eval-result how-pop-in ${ev.runResult.pass ? 'ais-eval-result-pass' : 'ais-eval-result-fail'}`}>
                {ev.runResult.detail}
              </div>
            )}
          </div>
        ))}
      </div>

      {allRun && (
        <div className="ais-eval-summary how-pop-in">
          <div className="ais-eval-summary-text">
            Eval suite: {passCount}/{EVAL_CASES.length} passing
            {failCount > 0 && <span className="ais-eval-fail-note"> &mdash; {failCount} failure would have caught a production incident</span>}
          </div>
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 7 - SAFETY BEYOND HALLUCINATIONS
   ======================================= */
const SAFETY_AREAS = [
  {
    icon: <ShieldIcon size={18} color="#34C759" />,
    name: 'Prompt Injection',
    what: 'Malicious instructions hidden in user input or retrieved content that hijack the AI\'s behavior.',
    risk: 'AI follows injected instructions instead of developer\'s system prompt.',
    mitigation: 'Input sanitization, instruction hierarchy enforcement, output monitoring.',
  },
  {
    icon: <WarningIcon size={18} />,
    name: 'Training Data Poisoning',
    what: 'Malicious content deliberately included in training data to create backdoors or biases in the trained model.',
    risk: 'Model behaves normally except when triggered by specific inputs.',
    mitigation: 'Training data vetting, red-team testing, behavioral monitoring.',
  },
  {
    icon: <CrossIcon size={18} />,
    name: 'Jailbreaking',
    what: 'Crafted prompts that bypass safety guardrails and get models to produce content they are designed to refuse.',
    risk: 'Safety measures circumvented.',
    mitigation: 'Layered safety systems, output classifiers, regular red-teaming.',
  },
  {
    icon: <WarningIcon size={18} />,
    name: 'Overreliance',
    what: 'Users treating AI output as ground truth without critical evaluation.',
    risk: 'Consequential decisions made on hallucinated or biased information.',
    mitigation: 'Uncertainty communication, friction on high-stakes outputs, user education.',
  },
  {
    icon: <WarningIcon size={18} />,
    name: 'Bias Amplification',
    what: 'Models reflect and amplify biases present in training data, producing unfair or discriminatory outputs at scale.',
    risk: 'Systematic harm at massive scale.',
    mitigation: 'Diverse training data, bias evals, demographic testing, human oversight.',
  },
  {
    icon: <ShieldIcon size={18} color="#34C759" />,
    name: 'Privacy Leakage',
    what: 'Models may reproduce memorized personal information from training data or from conversation context.',
    risk: 'Sensitive data exposed.',
    mitigation: 'PII detection, data minimization, private deployment, system prompt protection.',
  },
]

function SafetyBeyondViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function startAnimation() {
    clearTimers()
    setVisibleCards(0)
    SAFETY_AREAS.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setVisibleCards(i + 1), (i + 1) * 150))
    })
  }

  useEffect(() => {
    if (active) startAnimation()
    return clearTimers
  }, [active])

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Six critical safety areas:</div>

      <div className="ais-safety-grid">
        {SAFETY_AREAS.map((area, i) => (
          <div key={i} className={`ais-safety-card ${i < visibleCards ? 'ais-safety-visible' : ''}`}>
            <div className="ais-safety-card-header">
              <span className="ais-safety-card-icon">{area.icon}</span>
              <span className="ais-safety-card-name">{area.name}</span>
            </div>
            <p className="ais-safety-card-what">{area.what}</p>
            <div className="ais-safety-card-detail">
              <div><strong>Risk:</strong> {area.risk}</div>
              <div><strong>Mitigation:</strong> {area.mitigation}</div>
            </div>
          </div>
        ))}
      </div>

      {visibleCards >= SAFETY_AREAS.length && (
        <div className="ais-safety-conclusion how-pop-in">
          The common thread: AI systems fail in ways that are hard to predict, hard to detect, and sometimes hard to reverse. The answer is not to avoid AI &mdash; it is to deploy it with eyes open and appropriate safeguards.
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 8 - TOOLKIT
   ======================================= */
const CHECKLIST_ITEMS = {
  before_build: [
    'Identify all outputs that need to be factual',
    'Plan grounding strategy (RAG / tool use)',
    'Define what hallucination looks like for your specific use case',
    'Write at least 5 factual accuracy evals before writing a line of code',
  ],
  before_ship: [
    'All evals passing',
    'Test with adversarial inputs',
    'Verify uncertainty expression works',
    'Test grounding: ask questions beyond provided context',
    'Human review of 20 diverse test outputs',
    'Confirm model acknowledges knowledge limits',
  ],
  after_ship: [
    'Monitor for user corrections',
    'Weekly eval runs',
    'Alert on quality score drops',
    'Monthly human review of 50 samples',
    'Re-run full eval suite after any model or prompt update',
  ],
}

const REFERENCE_CARDS = [
  {
    title: 'Hallucination Red Flags',
    icon: <EyeIcon size={18} color="#34C759" />,
    items: ['Specific numbers without source', 'Named citations you cannot verify', 'Confident answers to ambiguous questions', 'Too-perfect formatting', 'Agreement without pushback'],
  },
  {
    title: 'Prompt Safety Patterns',
    icon: <WrenchIcon size={18} color="#34C759" />,
    items: ['Ask for uncertainty expression', 'Request step-by-step reasoning', 'Constrain to provided context only'],
  },
  {
    title: 'Eval Starter Kit',
    icon: <TargetIcon size={18} color="#34C759" />,
    items: ['5 factual accuracy checks', '3 grounding boundary tests', '2 uncertainty expression tests'],
  },
  {
    title: 'Monitoring Metrics',
    icon: <BarChartIcon size={18} color="#34C759" />,
    items: ['User correction rate', 'Thumbs-down on specific claims', 'Escalation mentions of incorrect info', 'A/B grounded vs ungrounded quality'],
  },
]

function ToolkitViz({ active }) {
  const [checked, setChecked] = useState(new Set())

  const allItems = [...CHECKLIST_ITEMS.before_build, ...CHECKLIST_ITEMS.before_ship, ...CHECKLIST_ITEMS.after_ship]
  const totalItems = allItems.length
  const progress = (checked.size / totalItems) * 100
  const allChecked = checked.size === totalItems

  function toggleItem(item) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  function renderColumn(title, items, borderColor) {
    return (
      <div className="ais-checklist-col" style={{ '--col-color': borderColor }}>
        <div className="ais-checklist-col-title">{title}</div>
        {items.map((item, i) => (
          <label key={i} className="ais-checklist-item">
            <input type="checkbox" checked={checked.has(item)} onChange={() => toggleItem(item)} />
            <span className={checked.has(item) ? 'ais-checked' : ''}>{item}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <div className="ais-viz">
      <div className="ais-demo-label">Your safety checklist &mdash; check off each item:</div>

      <div className="ais-progress-bar-wrap">
        <div className="ais-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="ais-progress-label">{checked.size}/{totalItems} items checked</div>

      <div className="ais-checklist-grid">
        {renderColumn('Before Build', CHECKLIST_ITEMS.before_build, '#0EA5E9')}
        {renderColumn('Before Ship', CHECKLIST_ITEMS.before_ship, '#5856D6')}
        {renderColumn('After Ship', CHECKLIST_ITEMS.after_ship, '#34C759')}
      </div>

      {allChecked && (
        <div className="ais-checklist-complete how-pop-in">
          <CheckIcon size={20} /> Safety toolkit complete. You are ready to ship AI that can be trusted.
        </div>
      )}

      <div className="ais-reference-grid">
        {REFERENCE_CARDS.map((card, i) => (
          <div key={i} className="ais-reference-card">
            <div className="ais-reference-card-header">
              {card.icon}
              <span>{card.title}</span>
            </div>
            <ul className="ais-reference-card-list">
              {card.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =======================================
   MAIN COMPONENT
   ======================================= */
function AISafety({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ai-safety', -1)
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
        markModuleComplete('ai-safety')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.ais-root')
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

  function handleStartOver() {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    setStage(-1)
    setMaxStageReached(-1)
    setShowFinal(false)
    setShowQuiz(false)
    setShowWelcome(true)
    setLearnTip(null)
    setLearnTipFading(false)
    setDismissedTips(new Set())
  }

  // Progressive learning tips at stage milestones
  useEffect(() => {
    if (stage === 0 && !dismissedTips.has('what-is') && !learnTip) {
      setLearnTip({ id: 'what-is', text: 'Look at the two prediction panels — same mechanism, very different reliability. This is why AI can be brilliant one moment and confidently wrong the next.' })
    } else if (stage === 2 && !dismissedTips.has('detection') && !learnTip) {
      setLearnTip({ id: 'detection', text: 'Try the detection game below — spotting hallucinations gets easier with practice, but the hardest ones still fool experts.' })
    } else if (stage === 4 && !dismissedTips.has('rag') && !learnTip) {
      setLearnTip({ id: 'rag', text: 'Toggle between "Without RAG" and "With RAG" to see the difference. Grounding is the single most effective structural fix for hallucinations.' })
    } else if (stage === 7 && !dismissedTips.has('toolkit') && !learnTip) {
      setLearnTip({ id: 'toolkit', text: 'Check off each item in the safety checklist — this is a real-world workflow used by production AI teams.' })
    } else {
      setLearnTip(null)
      setLearnTipFading(false)
    }
  }, [stage, dismissedTips]) // eslint-disable-line react-hooks/exhaustive-deps

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips((prev) => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const vizComponents = {
    0: <HallucinationDemoViz active={stage === 0} />,
    1: <HallucinationTypesViz active={stage === 1} />,
    2: <DetectionViz active={stage === 2} />,
    3: <PromptTechniquesViz active={stage === 3} />,
    4: <RAGGroundingViz active={stage === 4} />,
    5: <EvalsViz active={stage === 5} />,
    6: <SafetyBeyondViz active={stage === 6} />,
    7: <ToolkitViz active={stage === 7} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: When AI Makes Things Up',
      content: "You ask an AI to summarize a research paper. It returns a confident, well-structured summary — with citations to papers that do not exist. The author names are plausible. The journal names sound real. The years are believable. Every word of it is invented.\n\nThis is a hallucination. Not a bug. Not a glitch. A fundamental property of how language models work.\n\nLanguage models do not retrieve facts. They predict the most statistically likely next token given everything that came before. When asked \"What is the capital of France?\" the model does not look this up anywhere. It predicts that \"Paris\" is the most likely word to follow because it saw this pattern millions of times in training data.\n\nThis works brilliantly for common knowledge. It fails spectacularly for rare or obscure facts, recent events after training cutoff, specific numbers and citations, and anything the model has seen rarely. The model has no way to say \"I am not sure — let me check.\" It just generates the most plausible answer. Plausible is not the same as true.",
      tip: 'The most dangerous hallucinations are the confident ones. An AI that says "I think" or "I am not sure" is safer than one that states fabricated facts with total certainty. Confidence is not evidence of accuracy.',
    },
    1: {
      title: 'Stage 2: Not All Hallucinations Are Equal',
      content: "Hallucinations come in different flavors. Recognizing the type helps you know how serious it is and what caused it.\n\nSome hallucinations are outright fabrications — entirely invented facts, citations, or events. Others are subtler: mixing real information with invented details, agreeing with wrong premises, or producing plausible but flawed reasoning.\n\nUnderstanding the five types will help you know what to watch for and how to protect yourself in each situation.",
    },
    2: {
      title: 'Stage 3: Spotting What the AI Got Wrong',
      content: "You cannot always know if an AI is hallucinating. But you can learn to recognize the warning signs and build habits that protect you.\n\nThe single most important habit is simple: never trust AI output for anything consequential without independent verification. This is not about distrusting AI — it is about understanding what it is.",
      tip: 'The single best habit: never trust AI output for anything consequential without independent verification. This is not about distrusting AI — it is about understanding what it is.',
    },
    3: {
      title: 'Stage 4: Prompting Your Way to Fewer Lies',
      content: "You cannot eliminate hallucinations through prompting alone. But the right techniques dramatically reduce their frequency and make failures easier to detect.\n\nEach technique below addresses a different failure mode: some make the model express uncertainty, others force visible reasoning chains, and some constrain the model to only use provided information.\n\nThe key insight is that these techniques are additive — combining several of them creates layers of defense that catch different types of errors.",
    },
    4: {
      title: 'Stage 5: The Structural Fix',
      content: "Prompt techniques help at the margins. RAG (Retrieval Augmented Generation) addresses the root cause: models hallucinate when they rely on parametric memory (training weights) for facts they should look up.\n\nThe simple idea: instead of asking the model to remember facts, give it the facts in the context window. Then tell it: answer based only on this.\n\nWithout RAG, the model searches its weights and generates a plausible answer that may be wrong. With RAG, the system retrieves relevant documents, places them in the context window, and the model answers from the documents — much harder to hallucinate, much rarer to fail.\n\nGrounding means anchoring AI responses to verified, up-to-date sources: documents, web search, databases, or APIs. The best RAG systems combine retrieval with citation — every claim is linked to the specific passage it came from.",
      tip: 'The best RAG systems combine retrieval with citation — every claim in the response is linked to the specific passage it came from. This makes verification trivial and trust earned.',
    },
    5: {
      title: 'Stage 6: You Cannot Fix What You Do Not Measure',
      content: "Building an AI feature without evals is like shipping software without tests. You will not know it is broken until users do.\n\nThree eval types for hallucination reliability: Factual accuracy evals test questions with known correct answers. Grounding evals check that responses stay within provided context. Uncertainty evals verify the model flags its confidence correctly.\n\nAfter shipping, monitor for user corrections, thumbs-down on specific claims, and escalations mentioning incorrect information.",
      warning: 'Evals are not a one-time task. Models update. Prompts change. User inputs evolve. Run your hallucination evals on a schedule — at minimum after every model or prompt change.',
    },
    6: {
      title: 'Stage 7: The Bigger Picture',
      content: "Hallucinations are the most common AI failure. But they are not the only one. A complete picture of AI safety covers prompt injection, training data poisoning, jailbreaking, overreliance, bias amplification, and privacy leakage.\n\nEach of these represents a different attack surface or failure mode. Understanding them all helps you build truly robust AI systems — not just ones that happen to work most of the time.",
    },
    7: {
      title: 'Stage 8: Everything You Need to Ship Safely',
      content: "You now understand why AI fails. Here is exactly what to do about it.\n\nThe checklist below is organized into three phases: before you build (planning), before you ship (testing), and after you ship (monitoring). Check off each item as you work through it to build your safety muscle memory.",
    },
  }

  const nextLabels = [
    'Next: Five Types →',
    'Next: Detection →',
    'Next: Prompt Fixes →',
    'Next: RAG & Grounding →',
    'Next: Evals →',
    'Next: Bigger Picture →',
    'Next: Your Toolkit →',
    'See Your Results →',
  ]

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="ai-safety" size={48} style={{ color: '#34C759' }} />}
        title="AI Safety & Hallucinations"
        subtitle="Why AI Lies — And How to Stop It"
        description="AI systems can be brilliant one moment and confidently wrong the next. Understanding why hallucinations happen — and how to prevent them — is the most practical skill anyone building with AI can have."
        buttonText="Start Learning"
        onStart={() => { setStage(0); markModuleStarted('ai-safety') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms ais-root quiz-fade-in">
        <Quiz
          questions={aiSafetyQuiz}
          tabName="AI Safety & Hallucinations"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="ai-safety"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms ais-root${fading ? ' how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>
      {showWelcome && stage === 0 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to AI Safety &amp; Hallucinations</strong> &mdash; this module will change how you use AI. You will understand why the most capable AI systems still fail, how to spot it before it hurts you, and exactly what to do about it.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from understanding hallucinations to building a complete safety toolkit</li>
              <li>Try the <strong>interactive demos</strong> &mdash; detect hallucinations, compare prompting techniques, run evals</li>
              <li>Build your <strong>safety checklist</strong> for shipping AI features with confidence</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper ais-stepper">
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
                    <div className="how-info-tip">
                      <TipIcon size={16} color="#eab308" />
                      {explanations[stage].tip}
                    </div>
                  )}
                  {explanations[stage].warning && (
                    <div className="ais-warning-box">
                      <WarningIcon size={16} />
                      {explanations[stage].warning}
                    </div>
                  )}
                  <ToolChips tools={AIS_TOOLS[stage]} />
                </div>

                {vizComponents[stage]}

                {learnTip && (
                  <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
                    <span className="learn-tip-text">{learnTip.text}</span>
                    <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )}

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>&larr; Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {nextLabels[stage]}
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
          <div className="how-final-celebration">You now know how to ship AI safely.</div>

          <div className="pe-final-grid">
            {TOOLKIT.map((item) => (
              <div key={item.concept} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.concept}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your AI Safety Toolkit</div>
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

          <SuggestedModules currentModuleId="ai-safety" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default AISafety
