import { useState, useEffect, useRef } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import { CheckIcon, CrossIcon, TipIcon, WarningIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { aiFluencyQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'
import './AIFluency.css'

const AF_TOOLS = {
  0: [
    { name: 'ChatGPT', color: '#34C759', desc: 'OpenAI chatbot for conversational AI' },
    { name: 'Claude', color: '#34C759', desc: 'Anthropic assistant for thoughtful collaboration' },
    { name: 'Gemini', color: '#34C759', desc: 'Google AI with web-grounded responses' },
    { name: 'Perplexity', color: '#34C759', desc: 'Search-augmented AI that cites sources' },
    { name: 'Copilot', color: '#34C759', desc: 'Microsoft AI assistant for productivity' },
    { name: 'Llama', color: '#34C759', desc: 'Meta open-source language model family' },
  ],
  1: [
    { name: 'GPT-4', color: '#34C759', desc: 'Advanced model for iterative conversations' },
    { name: 'Claude', color: '#34C759', desc: 'Designed for nuanced, multi-turn dialogue' },
    { name: 'Gemini', color: '#34C759', desc: 'Multi-modal AI for creative iteration' },
    { name: 'Chain-of-thought', color: '#34C759', desc: 'Technique for step-by-step reasoning' },
    { name: 'Iteration techniques', color: '#34C759', desc: 'Methods for refining AI output progressively' },
  ],
  2: [
    { name: 'Claude custom instructions', color: '#34C759', desc: 'Set default collaboration style in Claude' },
    { name: 'ChatGPT custom instructions', color: '#34C759', desc: 'Configure how ChatGPT works with you' },
    { name: 'System prompts', color: '#34C759', desc: 'Define AI behavior at the system level' },
    { name: 'Cursor rules', color: '#34C759', desc: 'Set coding assistant collaboration terms' },
    { name: 'Copilot settings', color: '#34C759', desc: 'Configure Microsoft Copilot preferences' },
  ],
  3: [
    { name: 'Code review tools', color: '#34C759', desc: 'Tools for reviewing AI-generated code' },
    { name: 'Fact checkers', color: '#34C759', desc: 'Verify claims made by AI outputs' },
    { name: 'GitHub Copilot', color: '#34C759', desc: 'AI coding assistant requiring code review' },
    { name: 'Claude', color: '#34C759', desc: 'AI that can question its own outputs' },
    { name: 'GPT-4', color: '#34C759', desc: 'Advanced model for self-critique' },
  ],
  4: [
    { name: 'Claude', color: '#34C759', desc: 'Rich context window for detailed conversations' },
    { name: 'ChatGPT', color: '#34C759', desc: 'Custom instructions for persistent context' },
    { name: 'Custom instructions', color: '#34C759', desc: 'Set context defaults across conversations' },
    { name: 'Memory tools', color: '#34C759', desc: 'AI memory features for recurring context' },
    { name: 'Notion AI', color: '#34C759', desc: 'AI with workspace context built in' },
    { name: 'Copilot', color: '#34C759', desc: 'AI with access to your work environment' },
  ],
  5: [
    { name: 'Claude', color: '#34C759', desc: 'Strong at collaborative reasoning' },
    { name: 'GPT-4', color: '#34C759', desc: 'Advanced model for complex reasoning' },
    { name: 'Gemini', color: '#34C759', desc: 'Multi-modal reasoning capabilities' },
    { name: 'Socratic method', color: '#34C759', desc: 'Question-based collaborative thinking' },
    { name: "Devil's advocate", color: '#34C759', desc: 'Technique for stress-testing ideas' },
    { name: 'Steel-manning', color: '#34C759', desc: 'Building the strongest opposing argument' },
  ],
  6: [
    { name: 'Perplexity', color: '#34C759', desc: 'AI search for verifying claims' },
    { name: 'You.com', color: '#34C759', desc: 'AI search with source attribution' },
    { name: 'Fact-checking tools', color: '#34C759', desc: 'Independent verification resources' },
    { name: 'Google Scholar', color: '#34C759', desc: 'Academic source verification' },
    { name: 'Primary sources', color: '#34C759', desc: 'Original documents and data' },
  ],
  7: [
    { name: 'Claude', color: '#34C759', desc: 'Thoughtful AI for building fluency habits' },
    { name: 'ChatGPT', color: '#34C759', desc: 'Versatile AI for daily practice' },
    { name: 'Gemini', color: '#34C759', desc: 'Multi-modal AI for varied use cases' },
    { name: 'Perplexity', color: '#34C759', desc: 'Research-focused AI for verification' },
  ],
}

const STAGES = [
  { key: 'what-is-fluency', label: 'Why Plateau?' },
  { key: 'iteration', label: 'Iteration' },
  { key: 'setting-terms', label: 'Set Terms' },
  { key: 'questioning', label: 'Question It' },
  { key: 'context', label: 'Context' },
  { key: 'reasoning', label: 'Reasoning' },
  { key: 'limits', label: 'Trust' },
  { key: 'system', label: 'Your System' },
]

const STAGE_TOOLTIPS = {
  'what-is-fluency': 'What AI fluency is and why most people plateau',
  'iteration': 'The iteration habit \u2014 treat every response as a draft',
  'setting-terms': 'Setting the terms \u2014 tell AI how to work with you',
  'questioning': 'Questioning polished outputs \u2014 when things look good',
  'context': 'Thinking in context \u2014 what you put in shapes what comes out',
  'reasoning': 'Collaborative reasoning \u2014 think with AI not at it',
  'limits': 'Knowing the limits \u2014 when to trust and when to verify',
  'system': 'Your personal fluency system',
}

/* =======================================
   STAGE 1 - WHAT IS AI FLUENCY?
   ======================================= */
function PassiveVsFluent({ active }) {
  const [step, setStep] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) { clearTimers(); setStep(0); return }
    clearTimers()
    for (let i = 1; i <= 8; i++) {
      timersRef.current.push(setTimeout(() => setStep(i), i * 400))
    }
    return clearTimers
  }, [active])

  const passiveSteps = ['Types question', 'Reads response', 'Uses or ignores', 'Moves on']
  const fluentSteps = ['Types question', 'Pushes back and refines', 'Sets collaboration terms', 'Questions and verifies']

  return (
    <div className="af-viz af-paths">
      <div className="af-paths-grid">
        <div className="af-path-col af-path-passive">
          <div className="af-path-label" style={{ borderTop: '2px solid #FF9500' }}>Passive User</div>
          {passiveSteps.map((s, i) => (
            <div key={i} className={`af-path-step ${step > i ? 'af-path-step-visible' : ''}`}>
              <div className="af-path-step-num">{i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
          <div className={`af-path-result af-path-result-bad ${step >= 5 ? 'af-path-step-visible' : ''}`}>
            <CrossIcon size={14} />
            <span>20% of potential</span>
          </div>
        </div>
        <div className="af-path-col af-path-fluent">
          <div className="af-path-label" style={{ borderTop: '2px solid #34C759' }}>Fluent User</div>
          {fluentSteps.map((s, i) => (
            <div key={i} className={`af-path-step ${step > i + 4 ? 'af-path-step-visible' : ''}`}>
              <div className="af-path-step-num" style={{ background: '#34C759', color: '#fff' }}>{i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
          <div className={`af-path-result af-path-result-good ${step >= 8 ? 'af-path-step-visible' : ''}`}>
            <CheckIcon size={14} />
            <span>Full potential</span>
          </div>
        </div>
      </div>

      <div className={`af-stat-card ${step >= 8 ? 'af-path-step-visible' : ''}`}>
        <strong>Research finding:</strong>
        <p>Iterative conversations show 2.67x more fluency behaviors than passive ones. 85.7% of high-quality conversations involved iteration and refinement.</p>
      </div>

      <div className={`af-spectrum ${step >= 8 ? 'af-path-step-visible' : ''}`}>
        <div className="af-spectrum-bar">
          <div className="af-spectrum-fill" />
          <div className="af-spectrum-marker" />
        </div>
        <div className="af-spectrum-labels">
          <span>Passive</span>
          <span>Fluent</span>
        </div>
      </div>
    </div>
  )
}

/* =======================================
   STAGE 2 - THE ITERATION HABIT
   ======================================= */
function IterationBuilderViz({ active }) {
  const [iteration, setIteration] = useState(0)
  const [animating, setAnimating] = useState(false)

  const responses = [
    { prompt: 'Write a tagline for my productivity app', response: 'Stay organized. Stay ahead.' },
    { label: 'Too generic', response: 'The app that turns your chaos into calm \u2014 one task at a time.' },
    { label: 'Go deeper', response: 'For people who think in tabs \u2014 finally, an app that thinks like you do.' },
    { label: 'Try something different', response: 'What if your to-do list actually understood you?' },
  ]

  function handleIterate(idx) {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setIteration(idx)
      setAnimating(false)
    }, 300)
  }

  useEffect(() => {
    if (!active) { setIteration(0); setAnimating(false) }
  }, [active])

  const qualityPercent = [25, 50, 75, 100]

  return (
    <div className="af-viz af-iteration">
      <div className="af-iteration-thread">
        {responses.slice(0, iteration + 1).map((r, i) => (
          <div key={i} className="af-iteration-exchange af-fade-in">
            {i === 0 && <div className="af-iteration-prompt">{r.prompt}</div>}
            {i > 0 && <div className="af-iteration-action">{r.label}</div>}
            <div className="af-iteration-response">
              <div className="af-iteration-response-text">{r.response}</div>
              <div className="af-iteration-meta">Iteration {i + 1}</div>
            </div>
            {i < responses.length - 1 && i === iteration && (
              <div className="af-iteration-buttons">
                {i === 0 && (
                  <>
                    <button className="af-iter-btn" onClick={() => handleIterate(1)}>Too generic</button>
                    <button className="af-iter-btn" onClick={() => handleIterate(1)}>Wrong tone</button>
                  </>
                )}
                {i === 1 && (
                  <>
                    <button className="af-iter-btn" onClick={() => handleIterate(2)}>Go deeper</button>
                    <button className="af-iter-btn" onClick={() => handleIterate(2)}>Try something different</button>
                  </>
                )}
                {i === 2 && (
                  <>
                    <button className="af-iter-btn" onClick={() => handleIterate(3)}>Try something different</button>
                    <button className="af-iter-btn" onClick={() => handleIterate(3)}>Go deeper</button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="af-quality-bar">
        <div className="af-quality-label">Quality</div>
        <div className="af-quality-track">
          <div className="af-quality-fill" style={{ width: `${qualityPercent[iteration]}%` }} />
        </div>
        <div className="af-quality-steps">
          {[1, 2, 3, 4].map(n => (
            <span key={n} className={`af-quality-step ${n <= iteration + 1 ? 'af-quality-step-active' : ''}`}>{n}</span>
          ))}
        </div>
      </div>

      {iteration >= 3 && (
        <div className="af-iteration-insight af-fade-in">
          Notice how the quality changed. The first response was usable. The fourth is something worth using.
          <button className="af-iter-reset" onClick={() => setIteration(0)}>Try again</button>
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 3 - SETTING THE TERMS
   ======================================= */
function TermsBuilderViz({ active }) {
  const [selections, setSelections] = useState({
    challenge: null,
    thinking: null,
    uncertainty: null,
    role: null,
  })

  useEffect(() => {
    if (!active) setSelections({ challenge: null, thinking: null, uncertainty: null, role: null })
  }, [active])

  const categories = [
    {
      key: 'challenge',
      label: 'Challenge style',
      options: [
        { id: 'push-back', label: 'Push back on assumptions' },
        { id: 'devils-advocate', label: "Play devil's advocate" },
        { id: 'just-answer', label: 'Just answer what I ask' },
      ],
    },
    {
      key: 'thinking',
      label: 'Thinking style',
      options: [
        { id: 'reasoning-first', label: 'Show reasoning first' },
        { id: 'answer-then', label: 'Answer then explain' },
        { id: 'think-aloud', label: 'Think out loud' },
      ],
    },
    {
      key: 'uncertainty',
      label: 'Uncertainty style',
      options: [
        { id: 'flag-all', label: 'Flag all uncertainty' },
        { id: 'major-only', label: 'Only flag major gaps' },
        { id: 'confident', label: 'Just answer confidently' },
      ],
    },
    {
      key: 'role',
      label: 'Role',
      options: [
        { id: 'neutral', label: 'Neutral assistant' },
        { id: 'skeptical', label: 'Skeptical expert' },
        { id: 'enthusiastic', label: 'Enthusiastic collaborator' },
      ],
    },
  ]

  const termParts = {
    challenge: {
      'push-back': 'Push back if my assumptions seem wrong.',
      'devils-advocate': "Play devil's advocate on my ideas.",
      'just-answer': '',
    },
    thinking: {
      'reasoning-first': 'Walk me through your reasoning before answering.',
      'answer-then': 'Give your answer first, then explain your reasoning.',
      'think-aloud': 'Think out loud as you work through this.',
    },
    uncertainty: {
      'flag-all': 'Flag anything you are less than confident about.',
      'major-only': 'Flag only major gaps or uncertainties.',
      'confident': '',
    },
    role: {
      'neutral': '',
      'skeptical': 'Act as a skeptical expert who questions conventional wisdom.',
      'enthusiastic': 'Be an enthusiastic collaborator who builds on my ideas.',
    },
  }

  const termsText = Object.entries(selections)
    .map(([k, v]) => v ? termParts[k]?.[v] : '')
    .filter(Boolean)
    .join(' ')

  function handleSelect(category, optionId) {
    setSelections(prev => ({ ...prev, [category]: optionId }))
  }

  const hasAny = Object.values(selections).some(Boolean)

  return (
    <div className="af-viz af-terms">
      <div className="af-terms-comparison">
        <div className="af-terms-panel" style={{ borderTop: '2px solid #FF9500' }}>
          <div className="af-terms-panel-label">Without Terms</div>
          <div className="af-terms-prompt">Should I launch my product now or wait?</div>
          <div className="af-terms-response">Here are some pros and cons to consider. On one hand, launching now could capture early market share. On the other hand, waiting could allow for more refinement. Both approaches have merit depending on your situation.</div>
          <div className="af-terms-verdict">AI guesses what helpful means</div>
        </div>
        <div className="af-terms-panel" style={{ borderTop: '2px solid #34C759' }}>
          <div className="af-terms-panel-label">With Terms</div>
          <div className="af-terms-prompt">Should I launch my product now or wait? Challenge my assumptions. Tell me what I might be missing. Be direct.</div>
          <div className="af-terms-response">You are assuming your product is ready, but let me push back on that. What does your retention data look like after the beta? If it is below 40% at day 7, launching now means spending money to acquire users who will not stay. Three specific risks you are not considering: competitor timing, seasonal demand patterns, and your support team capacity at scale.</div>
          <div className="af-terms-verdict">AI knows how to help you</div>
        </div>
      </div>

      <div className="af-terms-builder">
        <div className="af-terms-builder-title">Build your collaboration terms</div>
        {categories.map(cat => (
          <div key={cat.key} className="af-terms-category">
            <div className="af-terms-category-label">{cat.label}</div>
            <div className="af-terms-options">
              {cat.options.map(opt => (
                <button
                  key={opt.id}
                  className={`af-terms-option ${selections[cat.key] === opt.id ? 'af-terms-option-active' : ''}`}
                  onClick={() => handleSelect(cat.key, opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {hasAny && (
          <div className="af-terms-result af-fade-in">
            <div className="af-terms-result-label">Add this to your prompts:</div>
            <div className="af-terms-result-text">{termsText}</div>
            <button className="af-terms-copy" onClick={() => navigator.clipboard?.writeText(termsText)}>Copy</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* =======================================
   STAGE 4 - QUESTIONING POLISHED OUTPUTS
   ======================================= */
function PolishedOutputViz({ active }) {
  const [activeTab, setActiveTab] = useState(0)
  const [revealed, setRevealed] = useState({})

  useEffect(() => {
    if (!active) { setActiveTab(0); setRevealed({}) }
  }, [active])

  const scenarios = [
    {
      tab: 'Code',
      output: 'function findMax(arr) {\n  let max = arr[0];\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}',
      looks: 'Looks great. Ship it?',
      issue: 'Subtle bug: returns undefined for empty arrays. No input validation. In production, this crashes silently and corrupts downstream data.',
      verdict: 'The code runs. The code is wrong.',
    },
    {
      tab: 'Research',
      output: 'Key findings:\n\u2022 Remote work increases productivity by 13% (Stanford, 2023)\n\u2022 67% of employees prefer hybrid models (Gallup)\n\u2022 Companies save $11,000 per remote worker annually\n\u2022 Dr. Sarah Mitchell at Harvard found that...',
      looks: 'Looks thorough. Use it?',
      issue: 'The Stanford study is from 2015, not 2023. The $11,000 figure is unverified. "Dr. Sarah Mitchell at Harvard" does not exist \u2014 this citation is fabricated. One conclusion ignores a major counterargument.',
      verdict: 'The document reads well. Parts of it are fabricated.',
    },
    {
      tab: 'Plan',
      output: 'Project plan:\nPhase 1: Research (2 weeks)\nPhase 2: Design (3 weeks)\nPhase 3: Development (6 weeks)\nPhase 4: Testing (2 weeks)\nPhase 5: Launch (1 week)\nTotal: 14 weeks, $45,000 budget',
      looks: 'Looks complete. Approve it?',
      issue: 'No risk mitigation section. Timeline assumes no dependencies between phases. Budget has no contingency. Testing is only 2 weeks for 6 weeks of development. No stakeholder review gates.',
      verdict: 'The plan sounds complete. Key sections are missing.',
    },
  ]

  const checklist = [
    'What is missing?',
    'What assumptions were made?',
    'What would a critic say?',
    'What could go wrong?',
    'What are you uncertain about?',
  ]

  const [checklistVisible, setChecklistVisible] = useState(0)

  useEffect(() => {
    if (Object.keys(revealed).length >= 3 && checklistVisible === 0) {
      let count = 0
      const timer = setInterval(() => {
        count++
        setChecklistVisible(count)
        if (count >= checklist.length) clearInterval(timer)
      }, 300)
      return () => clearInterval(timer)
    }
  }, [revealed]) // eslint-disable-line react-hooks/exhaustive-deps

  const sc = scenarios[activeTab]

  return (
    <div className="af-viz af-polished">
      <div className="af-polished-tabs">
        {scenarios.map((s, i) => (
          <button
            key={i}
            className={`af-polished-tab ${activeTab === i ? 'af-polished-tab-active' : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {s.tab}
          </button>
        ))}
      </div>

      <div className="af-polished-scenario">
        <pre className="af-polished-output">{sc.output}</pre>
        <div className="af-polished-looks">{sc.looks}</div>
        {!revealed[activeTab] ? (
          <button className="af-polished-examine" onClick={() => setRevealed(prev => ({ ...prev, [activeTab]: true }))}>
            Examine it
          </button>
        ) : (
          <div className="af-polished-issue af-fade-in">
            <WarningIcon size={16} />
            <div>
              <p>{sc.issue}</p>
              <div className="af-polished-verdict">{sc.verdict}</div>
            </div>
          </div>
        )}
      </div>

      {Object.keys(revealed).length >= 3 && (
        <div className="af-polished-checklist af-fade-in">
          <div className="af-polished-checklist-title">The questions to always ask after polished output:</div>
          {checklist.map((item, i) => (
            <div key={i} className={`af-polished-checklist-item ${i < checklistVisible ? 'af-polished-checklist-item-visible' : ''}`}>
              <CheckIcon size={14} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* =======================================
   STAGE 5 - THINKING IN CONTEXT
   ======================================= */
function ContextSliderViz({ active }) {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) setLevel(0)
  }, [active])

  const levels = [
    {
      label: 'Empty',
      context: '',
      response: 'Here are some tips for a difficult conversation with your manager: Stay calm. Be professional. Prepare your points in advance. Listen actively.',
      quality: 0,
    },
    {
      label: 'Minimal',
      context: 'About a promotion I was promised.',
      response: 'When discussing a promised promotion, document your achievements. Schedule a dedicated meeting. Be clear about your expectations and ask about the timeline.',
      quality: 25,
    },
    {
      label: 'Good',
      context: 'Promised 6 months ago, delayed twice, my manager keeps deflecting when I bring it up, I want to address it directly without damaging the relationship.',
      response: 'Given the two delays and the deflection pattern, try this: open with "I want to talk about the promotion timeline we discussed in [month]. I have noticed it has been postponed twice and I want to understand what is happening." This is direct without being confrontational. Then ask: "Is there something blocking this that I should know about?"',
      quality: 60,
    },
    {
      label: 'Rich',
      context: 'Promised 6 months ago, delayed twice, manager deflects. My manager responds well to data. I have been documenting my contributions. I am prepared to leave if this is not resolved. I want to be direct but professional.',
      response: 'Since your manager responds to data, lead with your documented contributions. Open with specifics: "In the last 6 months since we discussed my promotion, I have [specific achievements]. I want to revisit this conversation with concrete data." If they deflect again, escalate: "I need a clear timeline or an honest conversation about whether this is happening. I have documented my contributions and I need to make decisions about my career." Your willingness to leave is your leverage \u2014 you do not need to say it directly, but the confidence will come through.',
      quality: 100,
    },
  ]

  const current = levels[level]

  const contextChecklist = [
    'Real goal stated (not just the task)',
    'Relevant constraints included',
    'Your own thinking shared',
    'What success looks like defined',
    'What you have already tried noted',
  ]
  const [checked, setChecked] = useState(new Set())

  function toggleCheck(i) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="af-viz af-context">
      <div className="af-context-task">Help me prepare for a difficult conversation with my manager</div>

      <div className="af-context-slider">
        <div className="af-context-slider-labels">
          {levels.map((l, i) => (
            <button key={i} className={`af-context-level-btn ${level === i ? 'af-context-level-active' : ''}`} onClick={() => setLevel(i)}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="af-context-slider-track">
          <div className="af-context-slider-fill" style={{ width: `${current.quality}%` }} />
        </div>
        <div className="af-context-quality">Context quality: {current.quality}%</div>
      </div>

      {current.context && (
        <div className="af-context-added af-fade-in">
          <div className="af-context-added-label">Context added:</div>
          <div className="af-context-added-text">{current.context}</div>
        </div>
      )}

      <div className="af-context-response af-fade-in" key={level}>
        <div className="af-context-response-label">AI response:</div>
        <div className="af-context-response-text">{current.response}</div>
      </div>

      <div className="af-context-checklist">
        <div className="af-context-checklist-title">Context quality checklist</div>
        {contextChecklist.map((item, i) => (
          <button key={i} className={`af-context-checklist-item ${checked.has(i) ? 'af-context-checklist-checked' : ''}`} onClick={() => toggleCheck(i)}>
            <div className="af-context-checkbox">{checked.has(i) && <CheckIcon size={12} />}</div>
            <span>{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* =======================================
   STAGE 6 - COLLABORATIVE REASONING
   ======================================= */
function ReasoningViz({ active }) {
  const [choice, setChoice] = useState(null)
  const [step, setStep] = useState(0)
  const timersRef = useRef([])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  useEffect(() => {
    if (!active) { clearTimers(); setChoice(null); setStep(0) }
    return clearTimers
  }, [active])

  const options = [
    { id: 'agree', label: 'Ask AI to agree and give tips', bad: true },
    { id: 'challenge', label: 'Ask AI to challenge the assumption', bad: false },
    { id: 'think-aloud', label: 'Think out loud and invite pushback', bad: false },
  ]

  const conversations = {
    agree: [
      { role: 'user', text: 'Remote work is hurting my team. Give me tips to improve collaboration.' },
      { role: 'ai', text: 'Here are 5 tips: Use Slack channels. Have daily standups. Use video calls. Create shared documents. Schedule team building events.' },
    ],
    challenge: [
      { role: 'user', text: 'I think remote work is hurting collaboration. Challenge that assumption.' },
      { role: 'ai', text: 'Before accepting that premise, what specific evidence are you seeing? Is it fewer ideas, slower decisions, or something else? Many teams report that remote work hurts spontaneous collaboration but improves deep work. The real question might be: which type of collaboration are you losing, and is it the kind that matters most for your team?' },
      { role: 'user', text: 'Good point. It is mostly spontaneous problem-solving that has dropped. Deep work is actually better.' },
      { role: 'ai', text: 'That changes the problem entirely. You do not need to fix remote work. You need to create structured spaces for spontaneous-style problem solving. That is a much more targeted and solvable problem.' },
    ],
    'think-aloud': [
      { role: 'user', text: 'I am trying to figure out if remote work is hurting my team. My instinct says yes, but our output metrics are actually up. Help me think through this.' },
      { role: 'ai', text: 'Interesting tension. Output is up but your instinct says something is wrong. That instinct might be picking up on a leading indicator that metrics have not caught yet. What are you noticing that the numbers do not capture? Junior team members struggling? Fewer innovative ideas? Less mentoring happening?' },
      { role: 'user', text: 'Junior members. They are productive but not growing as fast. They are not learning by osmosis like they used to.' },
      { role: 'ai', text: 'Now we have a real insight. The problem is not remote work hurting collaboration. It is remote work changing how knowledge transfer happens. You need to replace the informal learning that used to happen naturally with something intentional. That is a completely different solution than "improve collaboration."' },
    ],
  }

  function handleChoice(id) {
    clearTimers()
    setChoice(id)
    setStep(0)
    const convo = conversations[id]
    convo.forEach((_, i) => {
      timersRef.current.push(setTimeout(() => setStep(i + 1), (i + 1) * 700))
    })
  }

  function handleReset() {
    clearTimers()
    setChoice(null)
    setStep(0)
  }

  return (
    <div className="af-viz af-reasoning">
      <div className="af-reasoning-comparison">
        <div className="af-reasoning-panel" style={{ borderTop: '2px solid #FF9500' }}>
          <div className="af-reasoning-panel-label">Vending Machine</div>
          <div className="af-reasoning-exchange">
            <div className="af-reasoning-msg af-reasoning-user">Should I raise prices?</div>
            <div className="af-reasoning-msg af-reasoning-ai">Here are some pros and cons of price increases. On one hand... On the other hand...</div>
            <div className="af-reasoning-msg af-reasoning-user">Thanks</div>
          </div>
          <div className="af-reasoning-verdict">You arrived where you started</div>
        </div>
        <div className="af-reasoning-panel" style={{ borderTop: '2px solid #34C759' }}>
          <div className="af-reasoning-panel-label">Thinking Partner</div>
          <div className="af-reasoning-exchange">
            <div className="af-reasoning-msg af-reasoning-user">I think I should raise prices. Here is my reasoning. Challenge my thinking.</div>
            <div className="af-reasoning-msg af-reasoning-ai">Your reasoning assumes stable demand. But what about...</div>
            <div className="af-reasoning-msg af-reasoning-user">Good point. But what about this counter?</div>
            <div className="af-reasoning-msg af-reasoning-ai">That changes things. Have you considered this different approach entirely?</div>
            <div className="af-reasoning-msg af-reasoning-user">That changes my whole approach actually.</div>
          </div>
          <div className="af-reasoning-verdict af-reasoning-verdict-good">You arrived somewhere new</div>
        </div>
      </div>

      <div className="af-reasoning-exercise">
        <div className="af-reasoning-exercise-title">Try it: Collaborative reasoning exercise</div>
        <div className="af-reasoning-scenario">Scenario: &ldquo;I think remote work is hurting my team&rsquo;s collaboration&rdquo;</div>

        {!choice && (
          <div className="af-reasoning-options">
            {options.map(opt => (
              <button key={opt.id} className="af-reasoning-option" onClick={() => handleChoice(opt.id)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {choice && (
          <div className="af-reasoning-convo">
            {conversations[choice].map((msg, i) => (
              <div key={`${choice}-${i}`} className={`af-reasoning-msg af-reasoning-convo-msg ${msg.role === 'user' ? 'af-reasoning-user' : 'af-reasoning-ai'} ${i < step ? 'af-msg-visible' : ''}`}>
                {msg.text}
              </div>
            ))}
            <div className={`af-reasoning-convo-result ${choice === 'agree' ? 'af-reasoning-result-bad' : 'af-reasoning-result-good'} ${step >= conversations[choice].length ? 'af-msg-visible' : ''}`}>
              {choice === 'agree'
                ? 'Generic tips. No new thinking generated. You arrived where you started.'
                : 'Genuine insight generated. The problem was reframed and a better solution emerged.'}
              <button className="af-iter-reset" onClick={handleReset}>Try another approach</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* =======================================
   STAGE 7 - KNOWING THE LIMITS
   ======================================= */
function TrustCalibrationViz({ active }) {
  const TASKS = [
    { id: 'brainstorm', label: 'Brainstorm product names', zone: 0 },
    { id: 'summarize', label: 'Summarize this PDF I uploaded', zone: 0 },
    { id: 'tax', label: 'What is the current tax rate for X?', zone: 2 },
    { id: 'draft', label: 'Draft an internal team update', zone: 0 },
    { id: 'medical', label: 'Cite sources for this medical claim', zone: 2 },
    { id: 'code', label: 'Write production API code', zone: 1 },
    { id: 'explain', label: 'Explain how photosynthesis works', zone: 0 },
    { id: 'competitor', label: 'What did competitor X announce last month?', zone: 2 },
  ]

  const ZONES = [
    { label: 'Use directly', color: '#34C759' },
    { label: 'Spot-check', color: '#FF9500' },
    { label: 'Verify fully', color: '#FF3B30' },
  ]

  const [placements, setPlacements] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [dragItem, setDragItem] = useState(null)

  useEffect(() => {
    if (!active) { setPlacements({}); setShowResults(false); setDragItem(null) }
  }, [active])

  function placeTask(taskId, zoneIdx) {
    setPlacements(prev => ({ ...prev, [taskId]: zoneIdx }))
  }

  const allPlaced = Object.keys(placements).length === TASKS.length
  const score = allPlaced ? TASKS.filter(t => placements[t.id] === t.zone).length : 0

  return (
    <div className="af-viz af-trust">
      <div className="af-trust-title">Where would you put these tasks?</div>

      <div className="af-trust-zones">
        {ZONES.map((zone, zi) => (
          <div key={zi} className="af-trust-zone" style={{ borderTop: `2px solid ${zone.color}` }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (dragItem) { placeTask(dragItem, zi); setDragItem(null) } }}
          >
            <div className="af-trust-zone-label" style={{ color: zone.color }}>{zone.label}</div>
            <div className="af-trust-zone-items">
              {TASKS.filter(t => placements[t.id] === zi).map(t => (
                <div key={t.id} className={`af-trust-item af-trust-item-placed ${showResults ? (t.zone === zi ? 'af-trust-correct' : 'af-trust-wrong') : ''}`}>
                  {t.label}
                  {showResults && t.zone !== zi && (
                    <span className="af-trust-hint">{ZONES[t.zone].label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="af-trust-unplaced">
        {TASKS.filter(t => placements[t.id] === undefined).map(t => (
          <div key={t.id} className="af-trust-item" draggable
            onDragStart={() => setDragItem(t.id)}
          >
            {t.label}
            <div className="af-trust-item-buttons">
              {ZONES.map((z, zi) => (
                <button key={zi} className="af-trust-place-btn" style={{ borderColor: z.color, color: z.color }}
                  onClick={() => placeTask(t.id, zi)} title={z.label}
                >
                  {zi + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {allPlaced && !showResults && (
        <button className="af-trust-check" onClick={() => setShowResults(true)}>Check my answers</button>
      )}

      {showResults && (
        <div className="af-trust-score af-fade-in">
          <strong>{score}/8 correct</strong>
          <button className="af-iter-reset" onClick={() => { setPlacements({}); setShowResults(false) }}>Try again</button>
        </div>
      )}

      <div className="af-trust-verification">
        <div className="af-trust-verification-title">Your personal verification checklist</div>
        <div className="af-trust-verification-items">
          <div className="af-trust-verification-item">
            <span className="af-trust-verification-num">1</span>
            What is the consequence if this is wrong?
          </div>
          <div className="af-trust-verification-item">
            <span className="af-trust-verification-num">2</span>
            Can I verify this independently?
          </div>
          <div className="af-trust-verification-item">
            <span className="af-trust-verification-num">3</span>
            Do I need to before using it?
          </div>
        </div>
      </div>
    </div>
  )
}

/* =======================================
   STAGE 8 - YOUR FLUENCY SYSTEM
   ======================================= */
function FluencyAssessmentViz({ active }) {
  const habits = [
    { key: 'iteration', label: 'I iterate and refine responses', action: 'This week: after every AI response, ask "what would make this better?"' },
    { key: 'terms', label: 'I set collaboration terms upfront', action: 'This week: start every AI conversation with "push back if my assumptions are wrong"' },
    { key: 'questioning', label: 'I question polished outputs', action: 'This week: after any finished-looking output, ask "what is missing from this?"' },
    { key: 'context', label: 'I provide rich context', action: 'This week: before sending any prompt, ask "what does AI not know that would change this?"' },
    { key: 'reasoning', label: 'I think with AI collaboratively', action: 'This week: share your thinking, not just your question \u2014 "here is how I see this, test it"' },
  ]

  const [scores, setScores] = useState({ iteration: 50, terms: 50, questioning: 50, context: 50, reasoning: 50 })

  useEffect(() => {
    if (!active) setScores({ iteration: 50, terms: 50, questioning: 50, context: 50, reasoning: 50 })
  }, [active])

  const avg = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)

  function getInterpretation(score) {
    if (score <= 40) return 'Passive user \u2014 big opportunity ahead'
    if (score <= 65) return 'Developing \u2014 good habits forming'
    if (score <= 85) return 'Proficient \u2014 most interactions are fluent'
    return 'Fluent \u2014 you work with AI like a partner'
  }

  const lowestKey = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]
  const lowestHabit = habits.find(h => h.key === lowestKey)

  const exampleCards = [
    {
      title: 'Research task',
      passive: 'Tell me about market trends in AI.',
      fluent: 'I am researching AI market trends for a board presentation. My thesis is that enterprise adoption will accelerate in 2025. Challenge that assumption. What data would change this view? Focus on the last 6 months.',
    },
    {
      title: 'Writing task',
      passive: 'Write a welcome email for new users.',
      fluent: 'Write a welcome email for new users of our project management tool. Push back if my assumptions about tone are wrong. Our users are busy PMs who hate fluff. Show me your reasoning for each section before writing.',
    },
    {
      title: 'Decision-making task',
      passive: 'Should we use React or Vue?',
      fluent: 'I am leaning toward React for our new app because of the ecosystem, but I am not sure. Our team of 4 has Vue experience. We need to ship in 8 weeks. Challenge my assumption that React is the right choice. What am I not considering?',
    },
  ]

  /* Simple radar chart using SVG */
  const radarSize = 200
  const center = radarSize / 2
  const radius = 80
  const points = habits.map((h, i) => {
    const angle = (Math.PI * 2 * i) / habits.length - Math.PI / 2
    const r = (scores[h.key] / 100) * radius
    return { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r }
  })
  const radarPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  const gridPoints = [0.25, 0.5, 0.75, 1].map(scale =>
    habits.map((_, i) => {
      const angle = (Math.PI * 2 * i) / habits.length - Math.PI / 2
      return { x: center + Math.cos(angle) * radius * scale, y: center + Math.sin(angle) * radius * scale }
    })
  )

  return (
    <div className="af-viz af-assessment">
      <div className="af-assessment-header">
        <div className="af-assessment-title">Your Fluency Snapshot</div>
        <div className="af-assessment-subtitle">Rate your current habits honestly</div>
      </div>

      <div className="af-assessment-body">
        <div className="af-assessment-sliders">
          {habits.map(h => (
            <div key={h.key} className="af-assessment-slider">
              <label className="af-assessment-slider-label">{h.label}</label>
              <input
                type="range" min="0" max="100" value={scores[h.key]}
                onChange={e => setScores(prev => ({ ...prev, [h.key]: Number(e.target.value) }))}
                className="af-slider-input"
              />
              <span className="af-assessment-slider-value">{scores[h.key]}</span>
            </div>
          ))}
        </div>

        <div className="af-assessment-radar">
          <svg width={radarSize} height={radarSize} viewBox={`0 0 ${radarSize} ${radarSize}`}>
            {gridPoints.map((ring, ri) => (
              <polygon key={ri} points={ring.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--border-light)" strokeWidth="1" />
            ))}
            {habits.map((_, i) => {
              const angle = (Math.PI * 2 * i) / habits.length - Math.PI / 2
              return <line key={i} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="var(--border-light)" strokeWidth="1" />
            })}
            <polygon points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(52,199,89,0.15)" stroke="#34C759" strokeWidth="2" />
            {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#34C759" />)}
          </svg>
        </div>
      </div>

      <div className="af-assessment-score">
        <div className="af-assessment-score-num">{avg}/100</div>
        <div className="af-assessment-score-text">{getInterpretation(avg)}</div>
      </div>

      <div className="af-assessment-focus">
        <div className="af-assessment-focus-title">Your one habit to focus on this week</div>
        <div className="af-assessment-focus-text">{lowestHabit.action}</div>
      </div>

      <div className="af-assessment-examples">
        <div className="af-assessment-examples-title">What fluency looks like in practice</div>
        {exampleCards.map((card, i) => (
          <div key={i} className="af-assessment-example">
            <div className="af-assessment-example-title">{card.title}</div>
            <div className="af-assessment-example-comparison">
              <div className="af-assessment-passive">
                <div className="af-assessment-comparison-label">Passive:</div>
                <div className="af-assessment-comparison-text">{card.passive}</div>
              </div>
              <div className="af-assessment-fluent">
                <div className="af-assessment-comparison-label">Fluent:</div>
                <div className="af-assessment-comparison-text">{card.fluent}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =======================================
   MAIN COMPONENT
   ======================================= */
function AIFluency({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [stage, setStage] = usePersistedState('ai-fluency', -1)
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
        markModuleComplete('ai-fluency')
        setFading(false)
        requestAnimationFrame(() => {
          let el = document.querySelector('.af-root')
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
    if (stage === 1 && !dismissedTips.has('iteration') && !learnTip) {
      setLearnTip({ id: 'iteration', text: 'Try the iteration habit right now \u2014 open any AI tool and push back on its first response.' })
    } else if (stage === 3 && !dismissedTips.has('questioning') && !learnTip) {
      setLearnTip({ id: 'questioning', text: 'Think of the last polished AI output you used without questioning \u2014 what might you have missed?' })
    } else if (stage === 5 && !dismissedTips.has('reasoning') && !learnTip) {
      setLearnTip({ id: 'reasoning', text: 'The best fluency exercise: share your thinking on a real decision you are facing right now.' })
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
    0: <PassiveVsFluent active={stage === 0} />,
    1: <IterationBuilderViz active={stage === 1} />,
    2: <TermsBuilderViz active={stage === 2} />,
    3: <PolishedOutputViz active={stage === 3} />,
    4: <ContextSliderViz active={stage === 4} />,
    5: <ReasoningViz active={stage === 5} />,
    6: <TrustCalibrationViz active={stage === 6} />,
    7: <FluencyAssessmentViz active={stage === 7} />,
  }

  const explanations = {
    0: {
      title: 'Stage 1: Why Most People Plateau',
      content: "Most people discover AI and go through the same journey.\n\nWeek 1: This is incredible. Month 1: This is really useful. Month 3: Hmm, it is kind of hit or miss. Month 6: I use it for simple stuff but not much else.\n\nThey plateau. Not because AI got worse. Because their collaboration habits stopped developing.\n\nAI fluency is not about knowing more prompts. It is about how you think while working with AI.\n\nThe passive user types a question, reads the answer, uses it or doesn't, and moves on. They get about 20% of what AI can deliver.\n\nThe fluent user treats the first response as a starting point. They push back, refine, redirect. They tell AI how to work with them. They question outputs that look too good. They get genuinely extraordinary results.\n\nThe difference is not intelligence or technical skill. It is a small set of learnable habits.\n\nReal data from 9,830 conversations: people who iterate and refine show more than double the collaboration quality of those who accept the first response. That gap is entirely closeable. That is what this tutorial teaches.",
      tip: 'The most important shift is mental: stop thinking of AI as a search engine that gives answers. Start thinking of it as a thinking partner that gets better the more you engage with it.',
    },
    1: {
      title: 'Stage 2: Every Response Is a Draft',
      content: "The single most impactful habit change you can make: stop treating AI responses as final answers. Start treating them as first drafts.\n\nWhat most people do: Ask, read, done.\n\nWhat fluent users do: Ask, read, push back, refine, push back again, get something genuinely excellent.\n\nThe first response is the AI's best guess at what you want based on limited information. Your job is to give it more information.\n\nReact to what you got: \"This is good but too formal \u2014 make it warmer.\" \"The second paragraph is exactly right \u2014 expand on that specifically.\" \"You missed the main point \u2014 it is about X not Y.\"\n\nAsk for alternatives: \"Show me three different approaches to this.\" \"What would a more skeptical version look like?\" \"How would this change if the audience was a technical expert instead?\"\n\nPush past the first safe answer. AI defaults to safe, middle-of-the-road responses. To get genuinely interesting output: \"Go further with this.\" \"Be more direct \u2014 less diplomatic.\" \"Give me the version you would be proud of.\"",
      tip: 'The best prompt is rarely the first one. Treat your initial prompt as opening a conversation \u2014 not placing an order. The second and third exchange are where the real quality emerges.',
    },
    2: {
      title: 'Stage 3: Tell AI How to Work With You',
      content: "Only 30% of people tell AI how they would like it to interact with them. This is one of the easiest habits to build and one of the highest-leverage things you can do.\n\nMost people describe WHAT they want. Fluent users also describe HOW they want the collaboration to work.\n\nWithout terms: \"Write a marketing email for my product\" \u2014 AI guesses what good looks like for you.\n\nWith terms: \"Write a marketing email for my product. Push back if my assumptions about the audience seem wrong. Walk me through your reasoning before writing. Tell me what you are uncertain about. Flag anything that could be improved.\" \u2014 AI becomes a thinking partner, not a text machine.\n\nWhat to specify: how you want it to challenge you, how you want it to think out loud, what uncertainty looks like, and what role you want it to play.\n\nThe system prompt habit: for any tool that lets you set a system prompt or custom instructions \u2014 set them once. Your defaults become your collaboration style. Every conversation starts already knowing how you like to work.",
      tip: 'Think of collaboration terms like a working agreement with a colleague. You do not re-explain how you like to work every meeting \u2014 you establish it once and it becomes the default. Do the same with AI.',
    },
    3: {
      title: 'Stage 4: When It Looks Good Is When to Look Harder',
      content: "Here is a counterintuitive finding from research on how people use AI: when AI produces a polished, finished-looking output \u2014 code that runs, a document that reads well, a plan that sounds complete \u2014 people become less critical, not more.\n\nThey check facts less. They question reasoning less. They identify missing context less. This is exactly backwards.\n\nThe formatting is unrelated to the accuracy. The confidence is unrelated to the correctness. The coherence is unrelated to the completeness.\n\nCode that runs is not necessarily code that works. A document that reads well is not necessarily a document that is right. A plan that sounds complete is not necessarily a complete plan.\n\nThe habit: when output looks finished \u2014 pause. Ask specifically: \"What is missing from this?\" \"What assumptions did you make?\" \"What would a critic say about this?\" \"What could go wrong with this approach?\" \"Is anything here that you are not confident about?\"",
      warning: 'The more capable AI becomes, the more important this habit becomes \u2014 not less. Better AI produces more convincing wrong answers. Critical evaluation is a skill that appreciates in value as AI improves.',
    },
    4: {
      title: 'Stage 5: What You Put In Shapes What Comes Out',
      content: "AI has no memory between conversations. No understanding of your situation. No knowledge of what you have tried. No awareness of what matters to you. Every conversation starts from zero.\n\nWhat goes into the context window is everything the AI knows about your task. What stays out of it is invisible to AI.\n\nThe context equation: vague context leads to vague output. Rich context leads to rich output. This is not about writing longer prompts. It is about giving AI the right information to do the right job.\n\nWhat belongs in context: your actual goal (not just the task), relevant constraints and context, your own perspective and opinions, and the right documents and data.\n\nWhat most people leave out: the real goal behind the stated task, the constraints that actually matter, the context that changes everything, their own thinking and perspective.\n\nFluent users know that the AI's output quality ceiling is set by the context quality. Raising the context ceiling raises everything.",
      tip: 'One powerful habit: before sending a prompt, ask yourself \"What does AI not know about this situation that would change its response?\" Then include that information.',
    },
    5: {
      title: 'Stage 6: Think With AI, Not At It',
      content: "Most people use AI as a vending machine. Put in request. Get out answer.\n\nFluent users use AI as a thinking partner. They think out loud. They share half-formed ideas. They argue. They change their mind. They arrive somewhere they could not have reached alone.\n\nVending machine interaction: \"What is the best marketing strategy for a B2B SaaS startup?\" \u2014 get a list of standard tactics.\n\nThinking partner interaction: \"I am trying to figure out my marketing strategy. I think content marketing is the right move but I am not sure. My instinct is that our buyers do not read blogs. Help me test that assumption.\" \u2014 get a conversation that sharpens your thinking.\n\nCollaborative reasoning techniques: think out loud with AI, use AI as a devil's advocate, stress-test your thinking, build on AI's thinking explicitly, and make AI change your mind.\n\nThe mindset shift: you are not extracting answers from AI. You are having a conversation that produces insights neither of you would have reached alone.",
      tip: 'The best indicator of a fluent AI conversation: you end up somewhere different from where you started. If AI just confirmed what you already thought, you probably did not push hard enough.',
    },
    6: {
      title: 'Stage 7: When to Trust and When to Verify',
      content: "Fluency is not blind trust. The most fluent AI users know exactly when to rely on AI and when to verify independently.\n\nThe key question is not \"is AI right or wrong.\" It is \"what would it cost me if AI were wrong here.\"\n\nHigh trust (use directly, low verification needed): brainstorming and ideation, first drafts for internal use, summarizing content you provided, explaining concepts you can check intuitively.\n\nMedium trust (use with light verification): research summaries (verify key claims), code for production use (review and test), analysis with your own data (check methodology).\n\nLow trust (verify everything before using): specific statistics and data points, citations and references, legal, medical, or financial specifics, recent events near or after training cutoff.\n\nThe calibration habit: before using any AI output, ask \"What is the consequence if this is wrong?\" If the consequence is low: use it. If the consequence is medium: spot-check. If the consequence is high: verify fully.",
      warning: 'The most dangerous pattern in AI use is not overconfidence in AI \u2014 it is inconsistency. People who verify medical claims but blindly trust AI for business decisions, or who fact-check research but not code. Build a consistent calibration, not a selective one.',
    },
    7: {
      title: 'Stage 8: Making Fluency a Habit, Not an Effort',
      content: "Fluency is not a set of techniques you apply. It is a way of working that becomes automatic.\n\nThe five shifts: from accepting first responses to treating every response as a draft. From describing tasks to setting collaboration terms. From trusting polished outputs to questioning finished-looking things. From giving tasks to sharing context and thinking. From extracting answers to thinking together.\n\nHow fluency compounds: each habit reinforces the others. When you iterate more, you notice more gaps. When you question more, you set better terms. When you share more context, your iterations land better. When you think out loud, your context gets richer.\n\nFluent users do not work harder than passive users. They work differently. And the difference compounds over time.\n\nThe self-assessment: after any significant AI interaction, ask: Did I iterate or just accept the first response? Did I set terms or just describe the task? Did I question the output or just use it? Did I share context or just give the task? Did I think with AI or just at it?",
      tip: 'The fastest way to improve AI fluency is to pick one habit and practice it deliberately for one week. Not all five at once. One. Make it automatic. Then add the next one.',
    },
  }

  const nextLabels = [
    'Next: The Iteration Habit \u2192',
    'Next: Setting the Terms \u2192',
    'Next: Questioning Outputs \u2192',
    'Next: Thinking in Context \u2192',
    'Next: Collaborative Reasoning \u2192',
    'Next: Knowing the Limits \u2192',
    'Next: Your Fluency System \u2192',
    'See Your Results \u2192',
  ]

  if (stage === -1) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="ai-fluency" size={48} style={{ color: '#34C759' }} />}
        title="AI Fluency"
        subtitle="From AI User to AI Power User"
        description="Research across 9,830 real AI conversations found that a small set of habits separates people who get extraordinary results from those who just get average ones. These are those habits."
        buttonText="Level Up"
        onStart={() => { setStage(0); markModuleStarted('ai-fluency') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms af-root quiz-fade-in">
        <Quiz
          questions={aiFluencyQuiz}
          tabName="AI Fluency"
          onBack={() => setShowQuiz(false)}
          onStartOver={handleStartOver}
          onSwitchTab={onSwitchTab}
          currentModuleId="ai-fluency"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms af-root${fading ? ' how-fading' : ''}`}>
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>
      {showWelcome && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to AI Fluency</strong> &mdash; this is not about learning more prompts. It is about changing how you think about working with AI. By the end, you will collaborate with AI in a fundamentally different way.
            <ol className="module-welcome-steps">
              <li>Walk through <strong>8 stages</strong> from understanding the fluency gap to building your personal system</li>
              <li>Try the <strong>interactive exercises</strong> &mdash; iterate on responses, build collaboration terms, calibrate trust</li>
              <li>Build your <strong>fluency snapshot</strong> and identify your highest-leverage habit to practice</li>
            </ol>
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper af-stepper">
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
                    <div className="af-warning-box">
                      <WarningIcon size={16} />
                      {explanations[stage].warning}
                    </div>
                  )}
                  <ToolChips tools={AF_TOOLS[stage]} />
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
          <div className="how-final-celebration">You are now thinking like a fluent AI user.</div>

          <div className="af-final-recap">
            <div className="af-final-recap-title">Your fluency journey:</div>
            <div className="af-final-recap-items">
              {STAGES.map((s, i) => (
                <div key={i} className="af-final-recap-item">
                  <CheckIcon size={14} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={handleStartOver}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="ai-fluency" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default AIFluency
