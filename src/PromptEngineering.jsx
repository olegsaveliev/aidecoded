import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { promptEngineeringQuiz } from './quizData.js'
import { CheckIcon, CrossIcon, TipIcon, GearIcon, ChatIcon, RobotIcon, TheaterIcon, WrenchIcon, MemoIcon, SearchIcon, BarChartIcon, PencilIcon, TargetIcon, FileIcon, LinkIcon, TreeIcon, RefreshIcon, BookIcon, PlayIcon } from './ContentIcons.jsx'
import SuggestedModules from './SuggestedModules.jsx'

const PE_TOOLS = {
  0: [
    { name: 'OpenAI Playground', color: '#0071E3', desc: 'Interactive web UI to test prompts with GPT models' },
    { name: 'Claude.ai', color: '#0071E3', desc: 'Anthropic\'s chat interface for Claude models' },
    { name: 'PromptBase', color: '#8E8E93', desc: 'Marketplace for buying and selling prompts' },
  ],
  1: [
    { name: 'OpenAI API', color: '#0071E3', desc: 'Programmatic access to GPT models' },
    { name: 'LangChain PromptTemplate', color: '#34C759', desc: 'Templating system for structured prompts' },
    { name: 'Guidance (Microsoft)', color: '#34C759', desc: 'Constrained generation and prompt control' },
  ],
  2: [
    { name: 'OpenAI o1', color: '#0071E3', desc: 'Built-in chain of thought reasoning model' },
    { name: 'LangChain', color: '#34C759', desc: 'Chain prompts and tools together' },
    { name: 'DSPy', color: '#34C759', desc: 'Programming framework for optimizing prompts' },
  ],
  3: [
    { name: 'LangChain', color: '#34C759', desc: 'Tree of thoughts via multi-step chains' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Complex query planning and routing' },
    { name: 'DSPy', color: '#34C759', desc: 'Automated prompt optimization with modules' },
  ],
  4: [
    { name: 'Claude.ai', color: '#0071E3', desc: 'Excellent at following role instructions' },
    { name: 'ChatGPT', color: '#0071E3', desc: 'OpenAI\'s chat interface with custom instructions' },
    { name: 'OpenAI Playground', color: '#0071E3', desc: 'Test different roles with system prompts' },
  ],
  5: [
    { name: 'OpenAI API', color: '#0071E3', desc: 'System prompt via messages API parameter' },
    { name: 'Anthropic API', color: '#0071E3', desc: 'System prompt as dedicated field' },
    { name: 'LangChain', color: '#34C759', desc: 'System prompt management in chains' },
  ],
  6: [
    { name: 'LangChain', color: '#34C759', desc: 'Sequential and parallel chain orchestration' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Multi-step query engines' },
    { name: 'Flowise', color: '#34C759', desc: 'Visual no-code prompt chain builder' },
  ],
  7: [
    { name: 'PromptBase', color: '#8E8E93', desc: 'Browse proven prompt patterns and templates' },
    { name: 'LMSYS Chatbot Arena', color: '#8E8E93', desc: 'Compare model responses head-to-head' },
    { name: 'OpenAI Evals', color: '#0071E3', desc: 'Framework for evaluating prompt quality' },
  ],
}

const STAGES = [
  { key: 'zero-shot', label: 'Zero-Shot' },
  { key: 'few-shot', label: 'Few-Shot' },
  { key: 'cot', label: 'Chain of Thought' },
  { key: 'tot', label: 'Tree of Thoughts' },
  { key: 'role', label: 'Role Prompting' },
  { key: 'system', label: 'System Prompts' },
  { key: 'chaining', label: 'Prompt Chaining' },
  { key: 'patterns', label: 'Patterns' },
]

const STAGE_TOOLTIPS = {
  'zero-shot': 'Ask the AI directly without examples. The quality depends entirely on how specific your prompt is.',
  'few-shot': 'Provide examples of the desired output format before your actual question. Great for classification and formatting.',
  'cot': 'Ask the AI to think step by step. Dramatically improves accuracy on complex reasoning tasks.',
  'tot': 'Explore multiple reasoning paths simultaneously. The AI considers alternatives and picks the best approach.',
  'role': 'Assign a specific persona or expertise. The AI draws on different knowledge based on the role you give it.',
  'system': 'Use system-level instructions to configure behavior, tone, and constraints for an entire conversation.',
  'chaining': 'Break complex tasks into a sequence of simpler prompts, where each output feeds into the next.',
  'patterns': 'Common patterns that work well and anti-patterns to avoid. The golden rules of prompt engineering.',
}

const QUICK_REFERENCE = [
  { technique: 'Zero-Shot', when: 'Clear, well-defined tasks', phrase: '[Role] + [Task] + [Format]', icon: <TargetIcon size={24} color="#8E8E93" /> },
  { technique: 'Few-Shot', when: 'Pattern tasks, classification', phrase: '"Here are examples..."', icon: <FileIcon size={24} color="#8E8E93" /> },
  { technique: 'Chain of Thought', when: 'Complex reasoning', phrase: '"Think step by step"', icon: <LinkIcon size={24} color="#8E8E93" /> },
  { technique: 'Tree of Thoughts', when: 'Hard problems', phrase: '"Consider 3 approaches..."', icon: <TreeIcon size={24} color="#8E8E93" /> },
  { technique: 'Role Prompting', when: 'Expert answers', phrase: '"You are a senior..."', icon: <TheaterIcon size={24} color="#8E8E93" /> },
  { technique: 'System Prompts', when: 'Consistent behavior', phrase: 'Set in system prompt', icon: <GearIcon size={24} color="#8E8E93" /> },
  { technique: 'Prompt Chaining', when: 'Complex tasks', phrase: 'Break into steps', icon: <RefreshIcon size={24} color="#8E8E93" /> },
  { technique: 'Patterns', when: 'Always', phrase: 'Specific + Format + Constraints', icon: <BookIcon size={24} color="#8E8E93" /> },
]

async function callOpenAI({ model, temperature, topP, maxTokens, messages }) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, top_p: topP }),
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => null)
    throw new Error(errData?.error?.message || `API error: ${res.status}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

/* ─── Reusable Try-It Section ─── */
function TryItSection({ prompt, setPrompt, result, loading, error, onRun }) {
  return (
    <div className="pe-tryit">
      <div className="pe-tryit-label">Edit the prompt and see how the result changes</div>
      <textarea
        className="pe-tryit-textarea"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <div className="pe-tryit-actions">
        <button className="pe-tryit-run" onClick={onRun} disabled={loading || !prompt.trim()}>
          {loading ? <span className="pe-spinner" /> : 'Run →'}
        </button>
      </div>
      {error && <div className="pe-tryit-error">{error}</div>}
      {result && (
        <div className="pe-tryit-result">
          <div className="pe-tryit-result-label">AI Response:</div>
          <div className="pe-tryit-result-text">{result}</div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 1 — ZERO-SHOT PROMPTING
   ═══════════════════════════════════ */
function ZeroShotViz({ active, model, temperature, topP, maxTokens }) {
  const [phase, setPhase] = useState('idle') // idle | bad-prompt | bad-result | pause | good-prompt | good-result | done
  const [charIndex, setCharIndex] = useState(0)
  const [tryPrompt, setTryPrompt] = useState('You are a senior marketing expert. Write 3 bullet points about email marketing benefits for small business owners. Keep each under 20 words.')
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')
  const timerRef = useRef(null)

  const badPrompt = 'marketing'
  const badResult = 'Marketing is the process of promoting and selling products or services...'
  const goodPrompt = 'You are a marketing expert. Write 3 bullet points about email marketing benefits for small business owners. Max 15 words each.'
  const goodResult = '• Cost-effective: Reach thousands of customers for pennies per email\n• High ROI: Average $42 return per $1 spent\n• Direct channel: Bypass social media algorithms'

  const sequences = {
    'bad-prompt': { text: badPrompt, speed: 50, next: 'bad-result' },
    'bad-result': { text: badResult, speed: 18, next: 'pause' },
    'good-prompt': { text: goodPrompt, speed: 22, next: 'good-result' },
    'good-result': { text: goodResult, speed: 14, next: 'done' },
  }

  function startAnimation() {
    clearInterval(timerRef.current)
    setPhase('bad-prompt')
    setCharIndex(0)
  }

  useEffect(() => {
    if (active && phase === 'idle') startAnimation()
  }, [active])

  useEffect(() => {
    clearInterval(timerRef.current)
    if (phase === 'idle' || phase === 'done') return

    if (phase === 'pause') {
      timerRef.current = setTimeout(() => {
        setPhase('good-prompt')
        setCharIndex(0)
      }, 600)
      return () => clearTimeout(timerRef.current)
    }

    const seq = sequences[phase]
    if (!seq) return

    if (charIndex >= seq.text.length) {
      timerRef.current = setTimeout(() => {
        setPhase(seq.next)
        setCharIndex(0)
      }, phase.endsWith('-prompt') ? 400 : 300)
      return () => clearTimeout(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setCharIndex((c) => {
        if (c >= seq.text.length) { clearInterval(timerRef.current); return c }
        return c + 1
      })
    }, seq.speed)
    return () => clearInterval(timerRef.current)
  }, [phase, charIndex >= sequences[phase]?.text?.length])

  function handleReplay() {
    startAnimation()
  }

  // Derive visible text from phase + charIndex
  const phaseOrder = ['bad-prompt', 'bad-result', 'pause', 'good-prompt', 'good-result', 'done']
  const phaseIdx = phaseOrder.indexOf(phase)
  const isPastPhase = (p) => phaseIdx > phaseOrder.indexOf(p)
  const isCurrentPhase = (p) => phase === p

  const badPromptText = isPastPhase('bad-prompt') ? badPrompt : isCurrentPhase('bad-prompt') ? badPrompt.slice(0, charIndex) : ''
  const badResultText = isPastPhase('bad-result') ? badResult : isCurrentPhase('bad-result') ? badResult.slice(0, charIndex) : ''
  const goodPromptText = isPastPhase('good-prompt') ? goodPrompt : isCurrentPhase('good-prompt') ? goodPrompt.slice(0, charIndex) : ''
  const goodResultText = isPastPhase('good-result') ? goodResult : isCurrentPhase('good-result') ? goodResult.slice(0, charIndex) : ''

  const showBadVerdict = phaseIdx >= phaseOrder.indexOf('pause')
  const showGoodVerdict = phase === 'done'
  const showCursor = (p) => isCurrentPhase(p) && charIndex < sequences[p]?.text.length

  async function handleRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const result = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 300), messages: [{ role: 'user', content: tryPrompt }] })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <div className="pe-demo-label">See the difference specificity makes:</div>

      <div className="pe-split">
        <div className="pe-split-panel pe-split-bad">
          <div className="pe-split-label"><CrossIcon size={14} /> VAGUE PROMPT</div>
          <div className="pe-split-prompt">
            <span className="pe-prompt-text">{badPromptText}</span>
            {showCursor('bad-prompt') && <span className="pe-typing-cursor">|</span>}
          </div>
          {badResultText && (
            <>
              <div className="pe-split-divider" />
              <div className="pe-split-result">
                <div className="pe-split-result-text">{badResultText}</div>
                {showCursor('bad-result') && <span className="pe-typing-cursor">|</span>}
              </div>
            </>
          )}
          {showBadVerdict && (
            <div className="pe-split-verdict pe-verdict-bad">Too vague — AI guesses what you want</div>
          )}
        </div>

        <div className="pe-split-panel pe-split-good">
          <div className="pe-split-label"><CheckIcon size={14} /> SPECIFIC PROMPT</div>
          {goodPromptText ? (
            <>
              <div className="pe-split-prompt">
                <span className="pe-prompt-text">{goodPromptText}</span>
                {showCursor('good-prompt') && <span className="pe-typing-cursor">|</span>}
              </div>
              {goodResultText && (
                <>
                  <div className="pe-split-divider" />
                  <div className="pe-split-result">
                    <div className="pe-split-result-text">{goodResultText}</div>
                    {showCursor('good-result') && <span className="pe-typing-cursor">|</span>}
                  </div>
                </>
              )}
              {showGoodVerdict && (
                <div className="pe-split-verdict pe-verdict-good">Specific = predictable, useful output</div>
              )}
            </>
          ) : (
            <div className="pe-split-waiting">Waiting...</div>
          )}
        </div>
      </div>

      {phase === 'done' && (
        <button className="pe-replay-btn" onClick={handleReplay}><PlayIcon size={12} /> Replay animation</button>
      )}

      <div className="pe-tips">
        <strong><TipIcon size={14} color="#eab308" /> Quick wins:</strong>
        <ul>
          <li>Add a role: "You are a..."</li>
          <li>Specify format: "Write as bullet points / table / email"</li>
          <li>Add constraints: "In under 100 words"</li>
          <li>Add audience: "For a non-technical manager"</li>
        </ul>
      </div>

      <TryItSection prompt={tryPrompt} setPrompt={setTryPrompt} result={tryResult}
        loading={tryLoading} error={tryError} onRun={handleRun} />
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 2 — FEW-SHOT PROMPTING
   ═══════════════════════════════════ */
function FewShotViz({ active, model, temperature, topP, maxTokens }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const [tryPrompt, setTryPrompt] = useState(`Classify this email as Urgent/Normal/Low Priority:

Example 1:
Email: "Server is down, clients can't access system"
Classification: Urgent

Example 2:
Email: "Monthly newsletter attached"
Classification: Low Priority

Example 3:
Email: "Please review this proposal by Friday"
Classification: Normal

Now classify this:
Email: "Our payment system stopped working 10 mins ago"
Classification:`)
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')

  const demoCards = [
    {
      borderClass: 'pe-fs-card-none',
      tag: '0 examples',
      tagColor: 'var(--text-tertiary)',
      prompt: 'Classify this email:\n"Server is down" → ?',
      response: 'This could be urgent or informational depending on context. Without more information about the severity...',
      verdict: 'Confused — no pattern to follow',
      verdictClass: 'pe-fs-verdict-bad',
    },
    {
      borderClass: 'pe-fs-card-one',
      tag: '1 example',
      tagColor: '#ff9500',
      prompt: 'Classify this email:\nExample: "Server is down" = Urgent\n\nNow classify: "Please review proposal by Friday" → ?',
      response: 'Normal',
      verdict: 'Better — but still guessing a bit',
      verdictClass: 'pe-fs-verdict-ok',
    },
    {
      borderClass: 'pe-fs-card-three',
      tag: '3 examples',
      tagColor: '#34c759',
      prompt: 'Classify this email:\n"Server is down" = Urgent\n"Newsletter attached" = Low Priority\n"Review proposal by Friday" = Normal\n\nNow: "Payment system stopped 10 mins ago" → ?',
      response: <><span>Urgent</span> <CheckIcon size={14} color="#34C759" /></>,
      verdict: 'Confident and correct — pattern learned!',
      verdictClass: 'pe-fs-verdict-good',
    },
  ]

  useEffect(() => {
    if (active) setVisibleCards(1)
  }, [active])

  async function handleRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const result = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 200), messages: [{ role: 'user', content: tryPrompt }] })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <div className="pe-counter">
        <span className={visibleCards >= 1 ? 'pe-counter-active' : ''}>0 examples</span>
        <span className="pe-counter-arrow">→</span>
        <span className={visibleCards >= 2 ? 'pe-counter-active' : ''}>1 example</span>
        <span className="pe-counter-arrow">→</span>
        <span className={visibleCards >= 3 ? 'pe-counter-active' : ''}>3 examples</span>
        <span className="pe-counter-arrow">=</span>
        <span className={visibleCards >= 3 ? 'pe-counter-active pe-counter-highlight' : ''}>better results</span>
      </div>

      <div className="pe-demo-label">Watch how adding examples improves accuracy:</div>

      <div className="pe-fs-cards">
        {demoCards.slice(0, visibleCards).map((card, i) => (
          <div key={i} className={`pe-fs-card ${card.borderClass} pe-fs-card-visible`}>
            <div className="pe-fs-card-tag" style={{ color: card.tagColor }}>{card.tag}</div>
            <div className="pe-fs-card-prompt">{card.prompt}</div>
            <div className="pe-fs-card-divider" />
            <div className="pe-fs-card-response-label">AI Response:</div>
            <div className="pe-fs-card-response">{card.response}</div>
            <div className={`pe-fs-card-verdict ${card.verdictClass}`}>{card.verdict}</div>
          </div>
        ))}
        {visibleCards < demoCards.length && (
          <button className="pe-replay-btn" onClick={() => setVisibleCards(v => v + 1)}>
            Show next example &rarr;
          </button>
        )}
        {visibleCards >= demoCards.length && (
          <button className="pe-replay-btn" onClick={() => { setVisibleCards(0); requestAnimationFrame(() => setVisibleCards(1)) }}>
            <PlayIcon size={12} /> Replay
          </button>
        )}
      </div>

      <TryItSection prompt={tryPrompt} setPrompt={setTryPrompt} result={tryResult}
        loading={tryLoading} error={tryError} onRun={handleRun} />
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 3 — CHAIN OF THOUGHT
   ═══════════════════════════════════ */
function ChainOfThoughtViz({ active, model, temperature, topP, maxTokens }) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [tryPrompt, setTryPrompt] = useState('A store sells 3 types of apples. Red costs $1.20, Green costs $0.90, Yellow costs $1.50. If I buy 4 red, 3 green, and 6 yellow, what do I pay? Think step by step.')
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')
  const animatedRef = useRef(false)

  const cotSteps = [
    { num: '1', text: 'Red: 4 × $1.20 = $4.80' },
    { num: '2', text: 'Green: 3 × $0.90 = $2.70' },
    { num: '3', text: 'Yellow: 6 × $1.50 = $9.00' },
    { num: <CheckIcon size={14} color="#34C759" />, text: 'Total: $4.80 + $2.70 + $9.00 = $16.50' },
  ]

  useEffect(() => {
    if (!active || animatedRef.current) return
    animatedRef.current = true
    let i = 0
    const timer = setInterval(() => {
      i++
      setVisibleSteps(i)
      if (i >= cotSteps.length) clearInterval(timer)
    }, 700)
    return () => clearInterval(timer)
  }, [active])

  async function handleRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const result = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 400), messages: [{ role: 'user', content: tryPrompt }] })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <div className="pe-cot-comparison">
        <div className="pe-cot-panel">
          <div className="pe-cot-panel-title"><CrossIcon size={14} /> Without CoT</div>
          <div className="pe-cot-question">
            "A store sells 3 types of apples. Red costs $1.20, Green costs $0.90, Yellow costs $1.50. If I buy 4 red, 3 green, 6 yellow what do I pay?"
          </div>
          <div className="pe-cot-direct-answer">
            Answer: "$16.50"
            <div className="pe-cot-note">Just the answer — no way to verify if it's right!</div>
          </div>
        </div>

        <div className="pe-cot-panel">
          <div className="pe-cot-panel-title"><CheckIcon size={14} /> With CoT</div>
          <div className="pe-cot-question">
            Same question + <span className="pe-cot-magic">"Think step by step."</span>
          </div>
          <div className="pe-cot-steps">
            {cotSteps.map((step, i) => (
              <div key={i} className={`pe-cot-step ${i < visibleSteps ? 'pe-cot-step-visible' : ''}`}>
                <span className="pe-cot-step-num">{step.num}</span>
                <span className="pe-cot-step-text">{step.text}</span>
              </div>
            ))}
          </div>
          {visibleSteps >= cotSteps.length && (
            <div className="pe-cot-verdict how-pop-in"><CheckIcon size={14} /> Every step is verifiable!</div>
          )}
        </div>
      </div>

      <div className="pe-flow-diagram">
        <div className="pe-flow-box pe-flow-active">Question</div>
        <div className="pe-flow-arrow">→</div>
        <div className="pe-flow-box pe-flow-magic">"Think step by step"</div>
        <div className="pe-flow-arrow">→</div>
        <div className="pe-flow-box">Step 1</div>
        <div className="pe-flow-arrow">→</div>
        <div className="pe-flow-box">Step 2</div>
        <div className="pe-flow-arrow">→</div>
        <div className="pe-flow-box pe-flow-answer">Answer <CheckIcon size={12} color="#34C759" /></div>
      </div>

      <TryItSection prompt={tryPrompt} setPrompt={setTryPrompt} result={tryResult}
        loading={tryLoading} error={tryError} onRun={handleRun} />
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 4 — TREE OF THOUGHTS
   ═══════════════════════════════════ */
function TreeOfThoughtsViz({ active, model, temperature, topP, maxTokens }) {
  const [animStep, setAnimStep] = useState(0)
  const [tryPrompt, setTryPrompt] = useState(`Imagine 3 different experts solving this problem.
Each expert writes one step of their thinking,
then all experts review each other's steps.
If any expert realizes they're wrong, they stop.

The question is: A company has $100k budget. Should they invest in hiring 2 new developers, upgrading their infrastructure, or investing in marketing? They currently have 5 developers, aging servers, and no marketing team.`)
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')
  const animatedRef = useRef(false)

  useEffect(() => {
    if (!active || animatedRef.current) return
    animatedRef.current = true
    let i = 0
    const timer = setInterval(() => {
      i++
      setAnimStep(i)
      if (i >= 6) clearInterval(timer)
    }, 600)
    return () => clearInterval(timer)
  }, [active])

  async function handleRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const result = await callOpenAI({ model, temperature, topP, maxTokens, messages: [{ role: 'user', content: tryPrompt }] })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <svg className="pe-tree-svg" viewBox="0 0 500 320" fill="none">
        {/* Root node */}
        <rect x="200" y="10" width="100" height="36" rx="8" className={`pe-tree-node ${animStep >= 0 ? 'pe-tree-node-active' : ''}`} />
        <text x="250" y="33" className="pe-tree-label" fontWeight="600">Problem</text>

        {/* Branches from root */}
        <path d="M220 46 L120 100" className={`pe-tree-path ${animStep >= 1 ? 'pe-tree-path-active' : ''}`} />
        <path d="M250 46 L250 100" className={`pe-tree-path ${animStep >= 1 ? 'pe-tree-path-active' : ''}`} />
        <path d="M280 46 L380 100" className={`pe-tree-path ${animStep >= 1 ? 'pe-tree-path-active' : ''}`} />

        {/* Path A */}
        <rect x="70" y="100" width="100" height="36" rx="8" className={`pe-tree-node ${animStep >= 2 ? 'pe-tree-node-pruned' : ''}`} />
        <text x="120" y="123" className="pe-tree-label">Path A</text>
        {animStep >= 4 && <g transform="translate(120, 150)"><line x1="-5" y1="-5" x2="5" y2="5" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" /><line x1="5" y1="-5" x2="-5" y2="5" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" /></g>}

        {/* Path B */}
        <rect x="200" y="100" width="100" height="36" rx="8" className={`pe-tree-node ${animStep >= 2 ? 'pe-tree-node-active' : ''}`} />
        <text x="250" y="123" className="pe-tree-label">Path B</text>

        {/* Path C */}
        <rect x="330" y="100" width="100" height="36" rx="8" className={`pe-tree-node ${animStep >= 2 ? 'pe-tree-node-pruned' : ''}`} />
        <text x="380" y="123" className="pe-tree-label">Path C</text>
        {animStep >= 4 && <g transform="translate(380, 150)"><line x1="-5" y1="-5" x2="5" y2="5" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" /><line x1="5" y1="-5" x2="-5" y2="5" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" /></g>}

        {/* Path B sub-branches */}
        <path d="M230 136 L200 190" className={`pe-tree-path ${animStep >= 3 ? 'pe-tree-path-active' : ''}`} />
        <path d="M270 136 L300 190" className={`pe-tree-path ${animStep >= 3 ? 'pe-tree-path-active' : ''}`} />

        <rect x="155" y="190" width="90" height="32" rx="8" className={`pe-tree-node ${animStep >= 3 ? 'pe-tree-node-active' : ''}`} />
        <text x="200" y="210" className="pe-tree-label">Evaluate B1</text>

        <rect x="255" y="190" width="90" height="32" rx="8" className={`pe-tree-node ${animStep >= 3 ? 'pe-tree-node-active' : ''}`} />
        <text x="300" y="210" className="pe-tree-label">Evaluate B2</text>

        {/* Best path to answer */}
        <path d="M200 222 L250 270" className={`pe-tree-path ${animStep >= 5 ? 'pe-tree-path-best' : ''}`} />
        <path d="M300 222 L250 270" className={`pe-tree-path ${animStep >= 5 ? 'pe-tree-path-best' : ''}`} />

        {/* Answer node */}
        <rect x="200" y="270" width="100" height="36" rx="8" className={`pe-tree-node ${animStep >= 5 ? 'pe-tree-node-answer' : ''}`} />
        <text x="250" y="293" className="pe-tree-label" fontWeight="600">{animStep >= 5 ? 'Best Answer' : 'Answer'}</text>
        {animStep >= 5 && <g transform="translate(304, 288)"><polyline points="-4 0 -1 3 5 -3" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>}
      </svg>

      <div className="pe-tree-comparison">
        <div className="pe-tree-row">
          <span className="pe-tree-method">Chain of Thought:</span>
          <span className="pe-tree-desc">A → B → C → Answer (single path)</span>
        </div>
        <div className="pe-tree-row">
          <span className="pe-tree-method pe-tree-method-highlight">Tree of Thoughts:</span>
          <span className="pe-tree-desc">Explores A, B, C simultaneously → prunes bad paths → best answer</span>
        </div>
      </div>

      <div className="pe-tips">
        <strong>Prompt Template:</strong>
        <div className="pe-code-block">
          "Imagine 3 different experts solving this problem.{'\n'}
          Each expert writes one step of their thinking,{'\n'}
          then all experts review each other's steps.{'\n'}
          If any expert realizes they're wrong, they stop.{'\n'}
          The question is: [YOUR QUESTION]"
        </div>
      </div>

      <TryItSection prompt={tryPrompt} setPrompt={setTryPrompt} result={tryResult}
        loading={tryLoading} error={tryError} onRun={handleRun} />
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 5 — ROLE PROMPTING
   ═══════════════════════════════════ */
function RolePromptingViz({ active, model, temperature, topP, maxTokens }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const [tryPrompt, setTryPrompt] = useState('You are a senior cybersecurity expert with 20 years of experience. Explain zero-day vulnerabilities to a non-technical IT manager in 3 bullet points.')
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')

  const question = 'Should I invest in AI tools for my team?'

  const roleCards = [
    {
      name: 'CEO', accentClass: 'pe-role-accent-blue',
      response: 'Focus on competitive advantage. Companies adopting AI now will outpace those who wait. The question isn\'t whether to invest — it\'s how fast.',
    },
    {
      name: 'CTO', accentClass: 'pe-role-accent-purple',
      response: 'Evaluate integration complexity first. Consider security, existing infrastructure compatibility, and your team\'s technical readiness before committing.',
    },
    {
      name: 'CFO', accentClass: 'pe-role-accent-green',
      response: 'Run the numbers: average productivity gain is 20-40%. At your team size, calculate break-even point. Most companies see ROI within 6 months.',
    },
    {
      name: 'HR Director', accentClass: 'pe-role-accent-orange',
      response: 'Change management is critical. Budget for training, expect 3-month adoption curve, and address team concerns about job security proactively.',
    },
  ]

  const roleChips = [
    { name: 'Research Scientist', prefix: 'You are a research scientist. ' },
    { name: 'Lawyer', prefix: 'You are an experienced lawyer. ' },
    { name: 'Doctor', prefix: 'You are a medical doctor. ' },
    { name: 'Consultant', prefix: 'You are a senior business consultant. ' },
    { name: 'UX Designer', prefix: 'You are a UX designer with 15 years experience. ' },
    { name: 'Teacher', prefix: 'You are a patient, experienced teacher. ' },
    { name: 'Security Expert', prefix: 'You are a senior cybersecurity expert. ' },
    { name: 'Data Analyst', prefix: 'You are a senior data analyst. ' },
  ]

  useEffect(() => {
    if (active) setVisibleCards(1)
  }, [active])

  async function handleTryRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const result = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 300), messages: [{ role: 'user', content: tryPrompt }] })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <div className="pe-role-question">
        Question: <strong>"{question}"</strong>
      </div>

      <div className="pe-role-cards">
        {roleCards.slice(0, visibleCards).map((card) => (
          <div key={card.name} className={`pe-role-resp-card ${card.accentClass} pe-role-resp-card-visible`}>
            <div className="pe-role-resp-header">
              <span className="pe-role-resp-name">{card.name} perspective</span>
            </div>
            <div className="pe-role-resp-text">{card.response}</div>
          </div>
        ))}
        {visibleCards > 0 && visibleCards < roleCards.length && (
          <button className="pe-replay-btn" onClick={() => setVisibleCards(v => v + 1)}>
            Show next role &rarr;
          </button>
        )}
        {visibleCards >= roleCards.length && (
          <>
            <div className="pe-role-takeaway">
              Same question — 4 completely different expert angles. That's the power of role prompting.
            </div>
            <button className="pe-replay-btn" onClick={() => { setVisibleCards(0); requestAnimationFrame(() => setVisibleCards(1)) }}>
              <PlayIcon size={12} /> Replay
            </button>
          </>
        )}
      </div>

      <div className="pe-role-library">
        <div className="pe-role-library-label"><TheaterIcon size={14} /> Role Library — click to fill the prompt:</div>
        <div className="pe-role-chips">
          {roleChips.map((chip) => (
            <button key={chip.name} className="pe-role-chip" onClick={() => setTryPrompt(chip.prefix + 'Explain the importance of data privacy in 3 bullet points.')}>
              {chip.name}
            </button>
          ))}
        </div>
      </div>

      <TryItSection prompt={tryPrompt} setPrompt={setTryPrompt} result={tryResult}
        loading={tryLoading} error={tryError} onRun={handleTryRun} />
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 6 — SYSTEM PROMPTS
   ═══════════════════════════════════ */
function SystemPromptsViz({ active, model, temperature, topP, maxTokens, onSwitchTab }) {
  const [builderRole, setBuilderRole] = useState('')
  const [builderTone, setBuilderTone] = useState('')
  const [builderConstraint, setBuilderConstraint] = useState('')
  const [builderFormat, setBuilderFormat] = useState('')
  const [tryPrompt, setTryPrompt] = useState('What are the benefits of exercise?')
  const [trySystem, setTrySystem] = useState('')
  const [tryResult, setTryResult] = useState('')
  const [tryLoading, setTryLoading] = useState(false)
  const [tryError, setTryError] = useState('')

  const roleOptions = ['Helpful Assistant', 'IT Expert', 'Teacher', 'Marketing Expert', 'Doctor']
  const toneOptions = ['Formal', 'Casual', 'Technical', 'Simple']
  const constraintOptions = ['Under 3 sentences', 'Under 100 words', 'No jargon', 'Include examples']
  const formatOptions = ['Bullet points', 'Paragraphs', 'Numbered list', 'Table']

  useEffect(() => {
    const parts = []
    if (builderRole) parts.push(`You are a ${builderRole.toLowerCase()}.`)
    if (builderTone) parts.push(`Use a ${builderTone.toLowerCase()} tone.`)
    if (builderConstraint) parts.push(`Constraint: ${builderConstraint.toLowerCase()}.`)
    if (builderFormat) parts.push(`Format your response as ${builderFormat.toLowerCase()}.`)
    setTrySystem(parts.join(' '))
  }, [builderRole, builderTone, builderConstraint, builderFormat])

  async function handleRun() {
    setTryLoading(true); setTryError(''); setTryResult('')
    try {
      const messages = []
      if (trySystem) messages.push({ role: 'system', content: trySystem })
      messages.push({ role: 'user', content: tryPrompt })
      const result = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 300), messages })
      setTryResult(result)
    } catch (e) { setTryError(e.message) }
    setTryLoading(false)
  }

  return (
    <div className="pe-viz">
      <div className="pe-arch">
        <div className="pe-arch-box pe-arch-system">
          <div className="pe-arch-box-label"><GearIcon size={14} color="var(--accent)" /> System Prompt</div>
          <div className="pe-arch-box-desc">Hidden configuration layer</div>
        </div>
        <div className="pe-arch-arrow">+</div>
        <div className="pe-arch-box pe-arch-user">
          <div className="pe-arch-box-label"><ChatIcon size={14} /> User Message</div>
          <div className="pe-arch-box-desc">Your actual question</div>
        </div>
        <div className="pe-arch-arrow">→</div>
        <div className="pe-arch-box pe-arch-ai">
          <div className="pe-arch-box-label"><RobotIcon size={14} color="#34c759" /> AI Response</div>
          <div className="pe-arch-box-desc">Shaped by both</div>
        </div>
      </div>

      <div className="pe-builder">
        <div className="pe-builder-section-title"><WrenchIcon size={14} /> Build a System Prompt:</div>

        <div className="pe-builder-row">
          <div className="pe-builder-label">Role:</div>
          <div className="pe-builder-chips">
            {roleOptions.map((r) => (
              <button key={r} className={`pe-builder-chip ${builderRole === r ? 'pe-builder-chip-active' : ''}`} onClick={() => setBuilderRole(builderRole === r ? '' : r)}>{r}</button>
            ))}
          </div>
        </div>

        <div className="pe-builder-row">
          <div className="pe-builder-label">Tone:</div>
          <div className="pe-builder-chips">
            {toneOptions.map((t) => (
              <button key={t} className={`pe-builder-chip ${builderTone === t ? 'pe-builder-chip-active' : ''}`} onClick={() => setBuilderTone(builderTone === t ? '' : t)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="pe-builder-row">
          <div className="pe-builder-label">Constraint:</div>
          <div className="pe-builder-chips">
            {constraintOptions.map((c) => (
              <button key={c} className={`pe-builder-chip ${builderConstraint === c ? 'pe-builder-chip-active' : ''}`} onClick={() => setBuilderConstraint(builderConstraint === c ? '' : c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className="pe-builder-row">
          <div className="pe-builder-label">Format:</div>
          <div className="pe-builder-chips">
            {formatOptions.map((f) => (
              <button key={f} className={`pe-builder-chip ${builderFormat === f ? 'pe-builder-chip-active' : ''}`} onClick={() => setBuilderFormat(builderFormat === f ? '' : f)}>{f}</button>
            ))}
          </div>
        </div>

        {trySystem && (
          <div className="pe-builder-preview">
            <div className="pe-builder-preview-label">Generated System Prompt:</div>
            <div className="pe-builder-preview-text">{trySystem}</div>
          </div>
        )}
      </div>

      {onSwitchTab && (
        <div className="pe-playground-link">
          <TipIcon size={14} color="#eab308" /> You can already use system prompts in the <button className="pe-link-btn" onClick={() => onSwitchTab('playground')}>Playground tab →</button>
        </div>
      )}

      <div className="pe-tryit">
        <div className="pe-tryit-label">Test your system prompt — type a question below:</div>
        {trySystem && <div className="pe-tryit-system-badge">System: {trySystem}</div>}
        <textarea className="pe-tryit-textarea" value={tryPrompt} onChange={(e) => setTryPrompt(e.target.value)} rows={2} />
        <div className="pe-tryit-actions">
          <button className="pe-tryit-run" onClick={handleRun} disabled={tryLoading || !tryPrompt.trim()}>
            {tryLoading ? <span className="pe-spinner" /> : 'Run →'}
          </button>
        </div>
        {tryError && <div className="pe-tryit-error">{tryError}</div>}
        {tryResult && (
          <div className="pe-tryit-result">
            <div className="pe-tryit-result-label">AI Response:</div>
            <div className="pe-tryit-result-text">{tryResult}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 7 — PROMPT CHAINING
   ═══════════════════════════════════ */
function PromptChainingViz({ active, model, temperature, topP, maxTokens }) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [runningStep, setRunningStep] = useState(-1)   // -1=idle, 0/1/2=running that step, 3=done
  const [stepResults, setStepResults] = useState({})
  const [chainError, setChainError] = useState('')
  const timerRef = useRef(null)

  const pipelineSteps = [
    { icon: <MemoIcon size={14} color="#0071e3" />, label: 'Step 1: Research', desc: '"List top 3 challenges facing remote teams"', accentClass: 'pe-pipe-blue' },
    { icon: <SearchIcon size={14} color="#8b5cf6" />, label: 'Step 2: Analyze', desc: '"For each challenge suggest one solution"', accentClass: 'pe-pipe-purple' },
    { icon: <BarChartIcon size={14} color="#ff9500" />, label: 'Step 3: Summarize', desc: '"Write a 2-sentence executive summary"', accentClass: 'pe-pipe-orange' },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleSteps(0)
    let i = 0
    function showNext() {
      i++
      setVisibleSteps(i)
      if (i < pipelineSteps.length) {
        timerRef.current = setTimeout(showNext, 500)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  async function runChain() {
    setStepResults({})
    setChainError('')
    setRunningStep(0)
    try {
      const r1 = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 200), messages: [{ role: 'user', content: 'List 3 key challenges facing remote teams. Be concise, 1-2 sentences each.' }] })
      setStepResults(prev => ({ ...prev, 0: r1 }))
      setRunningStep(1)
      const r2 = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 200), messages: [{ role: 'user', content: `For each challenge below, suggest one practical solution in 1 sentence:\n\n${r1}` }] })
      setStepResults(prev => ({ ...prev, 1: r2 }))
      setRunningStep(2)
      const r3 = await callOpenAI({ model, temperature, topP, maxTokens: Math.min(maxTokens, 200), messages: [{ role: 'user', content: `Write a 2-sentence executive summary from these points:\n\n${r2}` }] })
      setStepResults(prev => ({ ...prev, 2: r3 }))
      setRunningStep(3)
    } catch (e) {
      setChainError(e.message)
      setRunningStep(-1)
    }
  }

  function resetChain() {
    setRunningStep(-1)
    setStepResults({})
    setChainError('')
  }

  const isRunning = runningStep >= 0 && runningStep < 3
  const isDone = runningStep === 3

  return (
    <div className="pe-viz">
      <div className="pe-pipe-flow">
        {pipelineSteps.map((step, i) => (
          <div key={i} className="pe-pipe-item">
            <div className={`pe-pipe-box ${step.accentClass} ${i < visibleSteps ? 'pe-pipe-box-visible' : ''} ${runningStep === i ? 'pe-pipe-box-running' : ''} ${stepResults[i] ? 'pe-pipe-box-done' : ''}`}>
              <div className="pe-pipe-box-header">
                <span className="pe-pipe-box-icon">{runningStep === i ? <span className="pe-spinner" /> : step.icon}</span>
                <span className="pe-pipe-box-label">{step.label}</span>
              </div>
              <div className="pe-pipe-box-desc">{step.desc}</div>
              {stepResults[i] && (
                <div className="pe-pipe-box-result how-pop-in">
                  <div className="pe-pipe-box-result-label"><CheckIcon size={14} /> Output:</div>
                  <div className="pe-pipe-box-result-text">{stepResults[i]}</div>
                </div>
              )}
            </div>
            {i < pipelineSteps.length - 1 && (
              <div className={`pe-pipe-connector ${i < visibleSteps - 1 ? 'pe-pipe-connector-visible' : ''}`}>
                <div className="pe-pipe-connector-line" />
                <div className="pe-pipe-connector-label">{runningStep === i + 1 && !stepResults[i + 1] ? 'feeding output into next step...' : '↓ output feeds into'}</div>
              </div>
            )}
          </div>
        ))}
        {visibleSteps === 0 && (
          <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}><PlayIcon size={12} /> Play demo</button>
        )}
      </div>

      {chainError && <div className="pe-tryit-error" style={{ marginTop: 12 }}>{chainError}</div>}

      {visibleSteps >= pipelineSteps.length && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          {!isRunning && !isDone && (
            <button className="pe-chain-run-btn" onClick={runChain}><PlayIcon size={12} /> Run this chain with real AI</button>
          )}
          {isRunning && (
            <div className="pe-chain-status">Running Step {runningStep + 1} of {pipelineSteps.length}...</div>
          )}
          {isDone && (
            <button className="pe-chain-run-btn pe-chain-reset-btn" onClick={resetChain}>↺ Reset and try again</button>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   STAGE 8 — PATTERNS & ANTI-PATTERNS
   ═══════════════════════════════════ */
function PatternsViz({ active }) {
  const [visibleCards, setVisibleCards] = useState(0)
  const [showRules, setShowRules] = useState(false)
  const timerRef = useRef(null)

  const dontCards = [
    '"Write me something about AI"',
    '"Make it better"',
    '"What do you think about X?"',
    '"Do everything in one prompt"',
    '"Don\'t be wrong"',
  ]

  const doCards = [
    '"Write a 200-word LinkedIn post about AI in healthcare for hospital administrators, professional tone"',
    '"Make it more concise — 3 bullet points, under 15 words each, remove jargon"',
    '"List 3 pros and 3 cons of X, then give a recommendation for a $50k budget"',
    '"Break complex tasks into separate focused prompts"',
    '"If you\'re uncertain about anything, say so and explain why"',
  ]

  const goldenRules = [
    { rule: 'Specific beats vague — always' },
    { rule: 'Format instructions get formatted output' },
    { rule: 'Role + expertise = expert answers' },
    { rule: 'One task per prompt for complex work' },
    { rule: 'Iterate — bad output = better prompt needed' },
    { rule: 'Constraints help — word limits, bullet counts' },
    { rule: 'Show examples when you can' },
    { rule: 'Ask AI to explain its reasoning' },
  ]

  function startAnimation() {
    clearTimeout(timerRef.current)
    setVisibleCards(0)
    setShowRules(false)
    let i = 0
    function showNext() {
      i++
      setVisibleCards(i)
      if (i < dontCards.length) {
        timerRef.current = setTimeout(showNext, 400)
      } else {
        timerRef.current = setTimeout(() => setShowRules(true), 500)
      }
    }
    timerRef.current = setTimeout(showNext, 300)
  }

  useEffect(() => {
    if (active) startAnimation()
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <div className="pe-viz">
      <div className="pe-patterns">
        <div className="pe-patterns-col">
          <div className="pe-patterns-col-header pe-patterns-header-dont"><CrossIcon size={14} /> DON'T</div>
          {dontCards.map((text, i) => (
            <div key={i} className={`pe-pattern-card pe-pattern-dont ${i < visibleCards ? 'pe-pattern-card-visible' : ''}`}>
              <span className="pe-pattern-num">{i + 1}</span>
              {text}
            </div>
          ))}
        </div>
        <div className="pe-patterns-col">
          <div className="pe-patterns-col-header pe-patterns-header-do"><CheckIcon size={14} /> DO</div>
          {doCards.map((text, i) => (
            <div key={i} className={`pe-pattern-card pe-pattern-do ${i < visibleCards ? 'pe-pattern-card-visible' : ''}`}>
              <span className="pe-pattern-num">{i + 1}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {visibleCards === 0 && (
        <button className="pe-replay-btn" onClick={startAnimation} style={{ marginTop: 8 }}><PlayIcon size={12} /> Play demo</button>
      )}

      {showRules && (
        <div className="pe-golden-rules how-pop-in">
          <div className="pe-golden-rules-title">The Golden Rules</div>
          <div className="pe-golden-rules-grid">
            {goldenRules.map((r, i) => (
              <div key={i} className="pe-golden-rule pe-golden-rule-visible" style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="pe-golden-rule-text">{r.rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
function PromptEngineering({ model, temperature, topP, maxTokens, onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
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
    if (stage < 7) {
      setStage(stage + 1)
    } else {
      setShowFinal(true)
      setStage(8)
      markModuleComplete('prompt-engineering')
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

  const apiProps = { model, temperature, topP, maxTokens }

  const vizComponents = {
    0: <ZeroShotViz active={stage === 0} {...apiProps} />,
    1: <FewShotViz active={stage === 1} {...apiProps} />,
    2: <ChainOfThoughtViz active={stage === 2} {...apiProps} />,
    3: <TreeOfThoughtsViz active={stage === 3} {...apiProps} />,
    4: <RolePromptingViz active={stage === 4} {...apiProps} />,
    5: <SystemPromptsViz active={stage === 5} {...apiProps} onSwitchTab={onSwitchTab} />,
    6: <PromptChainingViz active={stage === 6} {...apiProps} />,
    7: <PatternsViz active={stage === 7} />,
  }

  const explanations = {
    0: {
      title: 'Zero-Shot Prompting — Be Specific',
      content: "Zero-shot means giving the AI a task with no examples — just your instructions. Most people write vague prompts and get vague results.\n\nThe formula for a good zero-shot prompt:\n[Role] + [Task] + [Format] + [Context]\n\nExample: 'You are a senior marketing expert. Write 3 bullet points about email marketing benefits for small business owners. Keep each under 20 words.'",
    },
    1: {
      title: 'Few-Shot Prompting — Show Don\'t Tell',
      content: "Instead of explaining what you want, SHOW the AI with examples. This is called few-shot prompting — giving a 'few shots' (examples) before your actual question.\n\nThe more specific and relevant your examples, the better the AI understands the pattern you want it to follow.\n\nWorks amazingly well for:\n• Consistent tone/style matching\n• Data extraction and formatting\n• Classification tasks\n• Writing in someone's specific style",
    },
    2: {
      title: 'Chain of Thought — Make AI Show Its Work',
      content: "Chain of Thought (CoT) prompting makes the AI reason through problems step by step instead of jumping to an answer. This dramatically improves accuracy on complex tasks.\n\nThe magic phrase: 'Think step by step' or 'Let's work through this carefully'\n\nWhen to use CoT:\n• Math and logic problems\n• Complex multi-step reasoning\n• Debugging and analysis\n• Any task where you want to verify the reasoning",
    },
    3: {
      title: 'Tree of Thoughts — Explore Multiple Paths',
      content: "Tree of Thoughts extends Chain of Thought by exploring MULTIPLE reasoning paths simultaneously, like a tree branching out.\n\nThe AI considers different approaches, evaluates each one, prunes dead ends, and follows the most promising path.\n\nThis is how expert humans solve hard problems — they don't just follow one approach, they consider alternatives.\n\nBest for:\n• Creative problem solving\n• Strategic planning\n• Complex decisions with multiple valid approaches\n• Research and analysis tasks",
    },
    4: {
      title: 'Role Prompting — Unlock Expert Perspectives',
      content: "Assigning a role to the AI dramatically changes the quality and perspective of responses. The AI draws on different knowledge and communication styles based on the role you give it.\n\nPowerful role formats:\n• 'You are a senior [job title] with 20 years experience in [field]'\n• 'Act as a [role] who specializes in [niche]'\n• 'You are an expert [role] reviewing this for [specific audience]'\n\nPro tip: Combine role + audience for maximum effect.",
    },
    5: {
      title: 'System Prompts — Configure AI Behavior',
      content: "The system prompt is a special instruction that sets the AI's behavior for the ENTIRE conversation. Users don't see it — it's your hidden configuration layer.\n\nThis is how companies build custom AI assistants:\n• Customer service bots with specific personalities\n• Internal tools that only discuss company topics\n• AI assistants constrained to specific domains\n\nWhat to put in system prompts:\n• Role and expertise\n• Tone and communication style\n• Constraints and limitations\n• Output format preferences\n• Company/context specific knowledge",
    },
    6: {
      title: 'Prompt Chaining — Divide and Conquer',
      content: "Complex tasks often fail with a single prompt because you're asking the AI to do too much at once. Prompt chaining breaks the task into steps where each output feeds the next.\n\nThis is how professional AI workflows are built:\n• Step 1: Research and gather information\n• Step 2: Analyze and extract key points\n• Step 3: Structure and format\n• Step 4: Polish and finalize\n\nReal world example — writing a business report:\nPrompt 1: 'Analyze these 5 data points about our Q3 sales'\nPrompt 2: 'Based on this analysis, identify the 3 main risks'\nPrompt 3: 'Write an executive summary combining both outputs'",
    },
    7: {
      title: 'Prompt Patterns — The Golden Rules',
      content: "After learning all these techniques, here are the rules that apply to every single prompt you write.\n\nRemember: bad output doesn't mean the AI is bad — it means your prompt needs improvement. Treat prompting as a skill to practice, not a one-time task.",
    },
  }

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="prompt-engineering" size={48} style={{ color: '#34C759' }} />}
        title="Prompt Engineering"
        description="Learn 8 powerful techniques to get dramatically better results from any AI — with live examples you can try yourself."
        buttonText="Start Learning"
        onStart={() => { setStage(0); markModuleStarted('prompt-engineering') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms pe-root quiz-fade-in">
        <Quiz
          questions={promptEngineeringQuiz}
          tabName="Prompt Engineering"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="prompt-engineering"
        />
      </div>
    )
  }

  return (
    <div className="how-llms pe-root">
      {/* Welcome Banner — shows after entry screen, dismissable */}
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Prompt Engineering is the most valuable AI skill you can learn right now.</strong> The same AI gives completely different results based on how you ask. Let's learn how to ask better.
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Stepper + stage content — only when journey has started (stage >= 0) */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper pe-stepper">
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
            {/* Stage content */}
            {stage >= 0 && stage <= 7 && (
              <div className="how-stage how-fade-in" key={stage}>
                {/* Explanation card */}
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>{explanations[stage].title}</strong>
                  </div>
                  {explanations[stage].content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <ToolChips tools={PE_TOOLS[stage]} />
                </div>

                {/* Visualization */}
                {vizComponents[stage]}

                {/* Navigation */}
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    {stage > 0 && (
                      <button className="how-back-btn" onClick={prevStage}>← Back</button>
                    )}
                    <button className="how-gotit-btn" onClick={nextStage}>
                      {[
                        'Show me examples →',
                        'Chain my thoughts →',
                        'Explore the tree →',
                        'Pick a role →',
                        'Set the system →',
                        'Chain it together →',
                        'Learn the rules →',
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

      {/* Final summary */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You're now a Prompt Engineer!</div>

          <div className="pe-final-grid">
            {QUICK_REFERENCE.map((item) => (
              <div key={item.technique} className="pe-final-card">
                <div className="pe-final-card-emoji">{item.icon}</div>
                <div className="pe-final-card-name">{item.technique}</div>
              </div>
            ))}
          </div>

          <div className="pe-reference-wrapper">
            <div className="pe-reference-title">Your Prompt Engineering Toolkit</div>
            <table className="pe-reference">
              <thead>
                <tr>
                  <th>Technique</th>
                  <th>When to use</th>
                  <th>Magic phrase</th>
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

          <SuggestedModules currentModuleId="prompt-engineering" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default PromptEngineering
