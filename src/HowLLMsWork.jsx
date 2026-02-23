import { useState, useEffect, useRef, useMemo } from 'react'
import { encode, decode } from 'gpt-tokenizer'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import { MemoIcon, TypeIcon, HashIcon, EyeIcon, ZapIcon, TipIcon } from './ContentIcons.jsx'
import Quiz from './Quiz.jsx'
import ToolChips from './ToolChips.jsx'
import { howLLMsWorkQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'

const API_KEY = import.meta.env.OPENAI_API_KEY

const STAGES = ['Prompt', 'Tokenization', 'Embeddings', 'Attention', 'Generation']

const HOW_TOOLS = {
  0: [
    { name: 'OpenAI API', color: '#0071E3', desc: 'Most popular LLM API for building AI apps' },
    { name: 'Anthropic API', color: '#0071E3', desc: 'Claude models — strong at reasoning and safety' },
    { name: 'Google Gemini API', color: '#0071E3', desc: 'Google\'s multimodal AI models' },
  ],
  1: [
    { name: 'tiktoken (OpenAI)', color: '#34C759', desc: 'Fast BPE tokenizer used by GPT models' },
    { name: 'SentencePiece (Google)', color: '#34C759', desc: 'Tokenizer used in LLaMA and Gemini' },
    { name: 'HuggingFace Tokenizers', color: '#34C759', desc: 'Open source tokenizer library for any model' },
  ],
  2: [
    { name: 'text-embedding-3-small', color: '#0071E3', desc: 'OpenAI\'s fast, affordable embedding model' },
    { name: 'Sentence Transformers', color: '#34C759', desc: 'Free open source embedding models' },
    { name: 'Cohere Embeddings', color: '#0071E3', desc: 'Enterprise embedding API with multilingual support' },
  ],
  3: [
    { name: 'PyTorch', color: '#AF52DE', desc: 'Visualize attention weights in transformer models' },
    { name: 'BertViz', color: '#34C759', desc: 'Interactive attention visualization tool' },
    { name: 'TransformerLens', color: '#34C759', desc: 'Mechanistic interpretability library by Neel Nanda' },
  ],
  4: [
    { name: 'OpenAI API', color: '#0071E3', desc: 'Stream completions with logprobs for generation' },
    { name: 'LangChain', color: '#34C759', desc: 'Framework for chaining LLM calls and tools' },
    { name: 'LlamaIndex', color: '#34C759', desc: 'Data framework for LLM applications' },
  ],
}

const STAGE_TOOLTIPS = {
  Prompt: 'Your text is the starting point for everything. The AI processes every word you write through all 5 stages.',
  Tokenization: 'Your text gets split into tokens \u2014 small pieces the AI can process mathematically. Not words, not letters \u2014 something in between.',
  Embeddings: 'Each token becomes a list of numbers (a vector) that captures its meaning. Similar words get similar numbers \u2014 this is how AI understands context.',
  Attention: 'The Transformer looks at every token in relation to every other token simultaneously. This is what makes modern AI so powerful compared to older systems.',
  Generation: 'The model predicts the most likely next token, adds it, then predicts again \u2014 repeating until the response is complete. One token at a time.',
}

const STAGE_ICONS = [<MemoIcon size={18} />, <TypeIcon size={18} />, <HashIcon size={18} />, <EyeIcon size={18} />, <ZapIcon size={18} />]

const TOKEN_PASTELS = [
  { bgVar: '--token-pastels-1-bg', borderVar: '--token-pastels-1-border' },
  { bgVar: '--token-pastels-2-bg', borderVar: '--token-pastels-2-border' },
  { bgVar: '--token-pastels-3-bg', borderVar: '--token-pastels-3-border' },
  { bgVar: '--token-pastels-4-bg', borderVar: '--token-pastels-4-border' },
  { bgVar: '--token-pastels-5-bg', borderVar: '--token-pastels-5-border' },
]

const BAR_COLORS = ['#0071e3', '#2997ff', '#64b5f6', '#9fc5e8', '#cfe2f3']

const VECTOR_SHADES = [
  '#0071e3', '#2997ff', '#0058b0', '#40a9ff', '#004080',
  '#5cb8ff', '#003366', '#7ecbff', '#1a6ed8', '#4db8ff',
]

const SUGGESTIONS = [
  'The weather today is',
  'AI is changing the world',
  'Once upon a time',
  'Hello world',
]

function HowLLMsWork({ model, temperature, topP, maxTokens, onSwitchTab, onGoHome, onSubPageChange }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [showEntry, setShowEntry] = useState(true)
  const [prompt, setPrompt] = useState('The weather today is')
  const [stage, setStage] = useState(-1) // -1 = not started
  const [visibleTokens, setVisibleTokens] = useState([])
  const [embeddingProgress, setEmbeddingProgress] = useState([])
  const [attentionVisible, setAttentionVisible] = useState(false)
  const [embedData, setEmbedData] = useState(null)
  const [embedLoading, setEmbedLoading] = useState(false)
  const [vectorsReady, setVectorsReady] = useState(false)
  const [genStreamedText, setGenStreamedText] = useState('')
  const [genCandidates, setGenCandidates] = useState([])
  const [genPhase, setGenPhase] = useState('idle') // idle | logprobs | streaming | done
  const [showFinal, setShowFinal] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showWelcome, setShowWelcome] = useState(true)
  const [hoveredDot, setHoveredDot] = useState(null)
  const [maxStageReached, setMaxStageReached] = useState(-1)
  const [showQuiz, setShowQuiz] = useState(false)
  const [fading, setFading] = useState(false)
  const genAbortRef = useRef(null)
  const genStartedRef = useRef(false)
  const activeStepRef = useRef(null)

  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [stage])

  const allTokens = useMemo(() => {
    if (!prompt) return []
    try {
      const ids = encode(prompt)
      return ids.map((id) => ({ id, text: decode([id]) }))
    } catch {
      return []
    }
  }, [prompt])

  function reset() {
    if (genAbortRef.current) {
      genAbortRef.current.abort()
      genAbortRef.current = null
    }
    genStartedRef.current = false
    setStage(-1)
    setMaxStageReached(-1)
    setVisibleTokens([])
    setEmbeddingProgress([])
    setAttentionVisible(false)
    setEmbedData(null)
    setEmbedLoading(false)
    setVectorsReady(false)
    setGenStreamedText('')
    setGenCandidates([])
    setGenPhase('idle')
    setShowFinal(false)
    setShowQuiz(false)
    setElapsed(0)
  }

  function startJourney() {
    reset()
    setStartTime(Date.now())
    setStage(0)
    setMaxStageReached(0)
  }

  // Navigate to a specific stage (for back button and stepper clicks)
  function goToStage(targetStage) {
    if (targetStage < 0 || targetStage > maxStageReached) return
    setShowFinal(false)
    setStage(targetStage)
  }

  // Track the highest stage reached
  useEffect(() => {
    if (stage > maxStageReached) {
      setMaxStageReached(stage)
    }
  }, [stage, maxStageReached])

  // Embeddings: set vectorsReady once data arrives (forces clean re-render)
  useEffect(() => {
    if (embedData && embedData.tokens && embedData.tokens.length > 0) {
      setVectorsReady(true)
    }
  }, [embedData])

  // Report current sub-page to parent for breadcrumb
  useEffect(() => {
    if (!onSubPageChange) return
    if (showEntry) {
      onSubPageChange(null)
    } else if (showQuiz) {
      onSubPageChange('Quiz')
    } else if (showFinal) {
      onSubPageChange('Summary')
    } else if (stage >= 0 && stage < STAGES.length) {
      onSubPageChange(`Stage ${stage + 1}: ${STAGES[stage]}`)
    } else {
      onSubPageChange(null)
    }
  }, [showEntry, showQuiz, showFinal, stage, onSubPageChange])

  // Clear sub-page on unmount
  useEffect(() => {
    return () => onSubPageChange?.(null)
  }, [onSubPageChange])

  // Stage 1: Animate tokens appearing one by one (skip animation on revisit)
  useEffect(() => {
    if (stage !== 1) return
    // If revisiting, show all tokens instantly
    if (maxStageReached > 1) {
      setVisibleTokens(allTokens)
      return
    }
    setVisibleTokens([])
    let count = 0
    const interval = setInterval(() => {
      count++
      if (count <= allTokens.length) {
        setVisibleTokens(allTokens.slice(0, count))
      } else {
        clearInterval(interval)
      }
    }, 200)
    return () => clearInterval(interval)
  }, [stage, allTokens, maxStageReached])

  // Stage 2: Fetch real embeddings from OpenAI API
  useEffect(() => {
    if (stage !== 2 || embedData) return
    let cancelled = false
    setEmbedLoading(true)
    setEmbeddingProgress([])

    async function fetchEmbeddings() {
      if (!API_KEY || API_KEY === 'your-api-key-here') {
        setEmbedLoading(false)
        return
      }
      const tokenTexts = allTokens.map((t) => t.text.trim() || ' ')

      try {
        const res = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: tokenTexts,
          }),
        })

        if (!res.ok || cancelled) return

        const data = await res.json()
        const sorted = [...data.data].sort((a, b) => a.index - b.index)
        const vecs = sorted.map((d) => d.embedding)

        // Normalize dimensions 0 and 1 to 10%-90% of chart area
        const dim0 = vecs.map((v) => v[0])
        const dim1 = vecs.map((v) => v[1])
        const min0 = Math.min(...dim0), max0 = Math.max(...dim0)
        const min1 = Math.min(...dim1), max1 = Math.max(...dim1)
        const range0 = max0 - min0 || 1
        const range1 = max1 - min1 || 1

        const tokenEmbeds = vecs.map((vec) => ({
          vec: vec.slice(0, 8),
          x: ((vec[0] - min0) / range0) * 80 + 10,
          y: ((vec[1] - min1) / range1) * 80 + 10,
        }))

        if (!cancelled) {
          setEmbedData({ tokens: tokenEmbeds })
          setEmbedLoading(false)
        }
      } catch {
        if (!cancelled) setEmbedLoading(false)
      }
    }

    fetchEmbeddings()
    return () => { cancelled = true }
  }, [stage, embedData, allTokens])

  // Stage 2: Show all rows once vectors are ready (CSS handles staggered animation)
  useEffect(() => {
    if (stage !== 2 || !vectorsReady || !embedData) return
    setEmbeddingProgress(allTokens.map((_, i) => i))
  }, [stage, vectorsReady, embedData, allTokens])

  // Stage 3: Show attention lines with delay (instant on revisit)
  useEffect(() => {
    if (stage !== 3) {
      setAttentionVisible(false)
      return
    }
    // If revisiting, show immediately
    if (maxStageReached > 3) {
      setAttentionVisible(true)
      return
    }
    const t = setTimeout(() => setAttentionVisible(true), 400)
    return () => clearTimeout(t)
  }, [stage, maxStageReached])

  // Generation: streaming approach
  async function startGeneration() {
    if (genStartedRef.current) {
      setStage(4)
      return
    }
    genStartedRef.current = true
    setStage(4)

    if (!API_KEY || API_KEY === 'your-api-key-here') return

    const abort = new AbortController()
    genAbortRef.current = abort
    setGenPhase('logprobs')

    try {
      const logRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Complete the user\'s text naturally. Only output the continuation, not the original text.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1,
          temperature,
          top_p: topP,
          logprobs: true,
          top_logprobs: 5,
        }),
        signal: abort.signal,
      })

      if (!logRes.ok) return

      const logData = await logRes.json()
      const topLogprobs = logData.choices[0]?.logprobs?.content?.[0]?.top_logprobs || []
      const parsed = topLogprobs
        .map((lp) => ({ token: lp.token, prob: Math.exp(lp.logprob) }))
        .sort((a, b) => b.prob - a.prob)
      setGenCandidates(parsed)

      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 2000)
        abort.signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('Aborted', 'AbortError'))
        })
      })

      if (abort.signal.aborted) return

      setGenPhase('streaming')

      const streamRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: 'Complete the user\'s text naturally. Only output the continuation, not the original text.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
          stream: true,
        }),
        signal: abort.signal,
      })

      if (!streamRes.ok) return

      const reader = streamRes.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') break

          try {
            const json = JSON.parse(data)
            const delta = json.choices?.[0]?.delta?.content
            if (delta) {
              setGenStreamedText((prev) => prev + delta)
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      setGenPhase('done')
    } catch (err) {
      if (err.name === 'AbortError') return
      setGenPhase('done')
    }
  }

  function finishJourney() {
    if (genAbortRef.current) {
      genAbortRef.current.abort()
      genAbortRef.current = null
    }
    setElapsed(Date.now() - startTime)
    setFading(true)
    setTimeout(() => {
      setShowFinal(true)
      setStage(5)
      markModuleComplete('how-llms-work')
      setFading(false)
      requestAnimationFrame(() => {
        let el = document.querySelector('.how-llms')
        while (el) {
          if (el.scrollTop > 0) el.scrollTop = 0
          el = el.parentElement
        }
        window.scrollTo(0, 0)
      })
    }, 250)
  }

  useEffect(() => {
    return () => {
      if (genAbortRef.current) genAbortRef.current.abort()
    }
  }, [])

  // Compute attention weights for visualization
  const attentionPairs = useMemo(() => {
    if (allTokens.length < 2) return []
    const pairs = []
    for (let i = 0; i < allTokens.length; i++) {
      for (let j = 0; j < allTokens.length; j++) {
        if (i === j) continue
        let weight = 0.15
        if (i === 0 && j === allTokens.length - 1) weight = 0.9
        if (i === allTokens.length - 1 && j === 0) weight = 0.85
        if (Math.abs(i - j) === 1) weight = 0.5
        if (i === 0) weight = Math.max(weight, 0.4)
        pairs.push({ from: i, to: j, weight })
      }
    }
    return pairs
  }, [allTokens])

  const maxProb = genCandidates.length > 0 ? Math.max(...genCandidates.map((c) => c.prob)) : 1

  // Compute summary stats for final screen
  const genTokenCount = genStreamedText ? encode(genStreamedText).length : 0

  if (showEntry) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="how-llms-work" size={48} style={{ color: '#FF9500' }} />}
        title="How LLMs Work"
        description="Take an interactive journey through every stage an AI goes through to answer your question. From your words to tokens to embeddings to the final response — see it all happen live."
        buttonText="Start the Journey →"
        onStart={() => { setShowEntry(false); markModuleStarted('how-llms-work') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="how-llms quiz-fade-in">
        <Quiz
          questions={howLLMsWorkQuiz}
          tabName="How LLMs Work"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => reset()}
          onSwitchTab={onSwitchTab}
          currentModuleId="how-llms-work"
        />
      </div>
    )
  }

  return (
    <div className={`how-llms${fading ? ' how-fading' : ''}`}>
      {/* Welcome Banner — only after entry screen, before journey starts */}
      {showWelcome && stage === -1 && (
        <div className="how-welcome how-fade-in">
          <div className="how-welcome-text">
            <strong>Welcome to How LLMs Work</strong> — Take an interactive journey through every stage an AI goes through to answer your question. From your words to tokens to embeddings to the final response — see it all happen live!
          </div>
          <button className="how-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Prompt input — stage -1, no stepper yet */}
      {stage === -1 && !showFinal && (
        <div className="how-content">
          <div className="how-stage how-fade-in">
            <div className="how-input-area">
              <label htmlFor="how-prompt">
                Enter a prompt to begin
                <Tooltip text="This is the text that will travel through all 5 stages. Keep it short and simple for the best experience — try 'The weather today is' or 'Hello world'" />
              </label>
              <input
                id="how-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='e.g. "The weather today is"'
                className="how-input"
              />
              <div className="how-suggestion-chips">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    className={`how-suggestion-chip ${prompt === s ? 'how-suggestion-chip-active' : ''}`}
                    onClick={() => setPrompt(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="how-start-btn"
              onClick={startJourney}
              disabled={!prompt.trim()}
            >
              Start Journey
            </button>
          </div>
        </div>
      )}

      {/* Stepper + stage content — only when journey has started (stage >= 0) */}
      {stage >= 0 && !showFinal && (
        <>
          <div className="how-stepper-wrapper how-fade-in">
            <div className="how-stepper">
              <div className="how-stepper-inner">
                {STAGES.map((s, i) => {
                  const isCompleted = stage > i
                  const isCurrent = stage === i
                  const isActive = stage >= i
                  const isClickable = i <= maxStageReached && !isCurrent
                  return (
                    <div key={s} className="how-step-wrapper" ref={isCurrent ? activeStepRef : null}>
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
                          {s}
                          <Tooltip text={STAGE_TOOLTIPS[s]} />
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

            {/* Stage 0: Prompt */}
            {stage === 0 && (
              <div className="how-stage how-fade-in">
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>Stage 1: Your Prompt</strong>
                  </div>
                  <p>This is where it all begins. Your text is the input to the entire AI pipeline. The clearer and more specific your prompt, the better the AI understands what you want.</p>
                  <div className="how-info-tip"><TipIcon size={16} color="#eab308" /> Adding context like "You are an expert..." as a system prompt dramatically improves responses.</div>
                  <ToolChips tools={HOW_TOOLS[0]} />
                </div>
                <div className="how-prompt-bubble">{prompt}</div>
                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    <button className="how-back-btn" onClick={() => reset()}>&larr; Edit Prompt</button>
                    <button className="how-gotit-btn" onClick={() => setStage(1)}>Tokenize it &rarr;</button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 1: Tokenization */}
            {stage === 1 && (
              <div className="how-stage how-fade-in">
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>Stage 2: Tokenization</strong>
                  </div>
                  <p>Your text gets split into tokens &mdash; the AI's alphabet. Notice how common words are 1 token but rare or long words split into multiple pieces. This is why AI has token limits, not word limits.</p>
                  <div className="how-info-tip"><TipIcon size={16} color="#eab308" /> The spaces before words are often part of the token itself &mdash; that's why you see '&middot;weather' not 'weather'.</div>
                  <ToolChips tools={HOW_TOOLS[1]} />
                </div>
                <div className="how-token-display">
                  {visibleTokens.map((tok, i) => {
                    const color = TOKEN_PASTELS[i % TOKEN_PASTELS.length]
                    const display = tok.text.replace(/ /g, '\u00B7').replace(/\n/g, '\\n')
                    return (
                      <span
                        key={i}
                        className="how-token-chip how-pop-in"
                        style={{ background: `var(${color.bgVar})`, borderColor: `var(${color.borderVar})`, animationDelay: `${i * 0.05}s` }}
                      >
                        {display || '\u00B7'}
                      </span>
                    )
                  })}
                </div>
                {visibleTokens.length > 0 && (
                  <div className="how-token-count">
                    {allTokens.length} tokens from {prompt.length} characters
                  </div>
                )}
                {visibleTokens.length === allTokens.length && (
                  <div className="how-nav-row">
                    <div className="how-nav-buttons">
                      <button className="how-back-btn" onClick={() => goToStage(0)}>&larr; Back</button>
                      <button className="how-gotit-btn" onClick={() => setStage(2)}>Turn them into numbers &rarr;</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage 2: Embeddings */}
            {stage === 2 && (
              <div className="how-stage how-fade-in">
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>Stage 3: Embeddings</strong>
                  </div>
                  <p>Each token becomes a list of numbers (a vector) that captures its meaning mathematically. Words used in similar contexts end up with similar numbers.</p>
                  <div className="how-info-tip"><TipIcon size={16} color="#eab308" /> This is how AI knows that 'king' and 'queen' are related, or that 'Paris' relates to 'France' the same way 'Tokyo' relates to 'Japan'.</div>
                  <ToolChips tools={HOW_TOOLS[2]} />
                </div>

                {embedLoading && (
                  <div className="how-embed-loading">
                    <div className="how-embed-spinner" />
                    <span>Calculating embeddings...</span>
                  </div>
                )}

                {vectorsReady && embedData && (
                  <>
                    <div className="how-embed-grid how-vectors-fade-in">
                      {allTokens.map((tok, i) => {
                        const visible = embeddingProgress.includes(i)
                        const isRevisit = maxStageReached > 2
                        const display = tok.text.replace(/ /g, '\u00B7')
                        const vec = embedData.tokens[i]?.vec
                        return (
                          <div
                            key={i}
                            className={`how-embed-row ${visible ? (isRevisit ? 'how-embed-instant' : 'how-embed-visible') : ''}`}
                            style={visible && !isRevisit ? { animationDelay: `${i * 0.3}s` } : undefined}
                          >
                            <span className="how-embed-token">{display || '\u00B7'}</span>
                            <span className="how-embed-arrow">&rarr;</span>
                            <div className="how-embed-chips">
                              {vec ? vec.map((v, vi) => {
                                const val = v.toFixed(3)
                                let colorClass = 'how-embed-chip-zero'
                                if (v > 0.05) colorClass = 'how-embed-chip-pos'
                                else if (v < -0.05) colorClass = 'how-embed-chip-neg'
                                return (
                                  <span key={vi} className={`how-embed-chip ${colorClass}`}>
                                    {val}
                                  </span>
                                )
                              }) : <span className="how-embed-chip how-embed-chip-zero">...</span>}
                              <span className="how-embed-ellipsis">...</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="how-scatter">
                      <div className="how-scatter-title">Word Similarity Map &mdash; real embeddings from OpenAI</div>
                      <div className="how-scatter-container">
                        {/* 3D perspective grid background */}
                        <div className="how-scatter-perspective-grid">
                          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                              <line key={`pg-h-${v}`} x1="0" y1={v} x2="100" y2={v} stroke="var(--scatter-grid-3d)" strokeWidth="0.3" />
                            ))}
                            {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((v) => (
                              <line key={`pg-v-${v}`} x1={v} y1="0" x2={v} y2="100" stroke="var(--scatter-grid-3d)" strokeWidth="0.3" />
                            ))}
                          </svg>
                        </div>
                        {/* Main SVG chart */}
                        <svg className="how-scatter-svg" viewBox="0 0 500 380" preserveAspectRatio="xMidYMid meet">
                          <defs>
                            {embedData.tokens.map((_, i) => (
                              <marker
                                key={`arrow-${i}`}
                                id={`vec-arrow-${i}`}
                                markerWidth="8"
                                markerHeight="6"
                                refX="7"
                                refY="3"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 8 3, 0 6"
                                  fill={VECTOR_SHADES[i % VECTOR_SHADES.length]}
                                  opacity="0.7"
                                />
                              </marker>
                            ))}
                          </defs>

                          {/* Subtle grid lines at 25% intervals */}
                          {[0.25, 0.5, 0.75].map((frac) => {
                            const gx = 50 + frac * 400
                            const gy = 340 - frac * 320
                            return (
                              <g key={`grid-${frac}`}>
                                <line x1={gx} y1="20" x2={gx} y2="340" stroke="var(--scatter-grid)" strokeWidth="0.5" />
                                <line x1="50" y1={gy} x2="450" y2={gy} stroke="var(--scatter-grid)" strokeWidth="0.5" />
                              </g>
                            )
                          })}

                          {/* X axis */}
                          <line x1="50" y1="340" x2="450" y2="340" stroke="#6E6E73" strokeWidth="1" />
                          <polygon points="450,340 443,337 443,343" fill="#6E6E73" />
                          {/* X axis ticks */}
                          {[0.25, 0.5, 0.75].map((frac) => {
                            const tx = 50 + frac * 400
                            return <line key={`xt-${frac}`} x1={tx} y1="337" x2={tx} y2="343" stroke="#6E6E73" strokeWidth="1" />
                          })}
                          <text x="448" y="358" fontSize="10" fill="#6E6E73" fontFamily="-apple-system, sans-serif" textAnchor="end">Dimension 1 &rarr;</text>

                          {/* Y axis */}
                          <line x1="50" y1="340" x2="50" y2="20" stroke="#6E6E73" strokeWidth="1" />
                          <polygon points="50,20 47,27 53,27" fill="#6E6E73" />
                          {/* Y axis ticks */}
                          {[0.25, 0.5, 0.75].map((frac) => {
                            const ty = 340 - frac * 320
                            return <line key={`yt-${frac}`} x1="47" y1={ty} x2="53" y2={ty} stroke="#6E6E73" strokeWidth="1" />
                          })}
                          <text x="42" y="18" fontSize="10" fill="#6E6E73" fontFamily="-apple-system, sans-serif" textAnchor="end">&uarr;</text>
                          <text x="38" y="30" fontSize="9" fill="#6E6E73" fontFamily="-apple-system, sans-serif" textAnchor="end">Dim 2</text>

                          {/* Origin label */}
                          <text x="44" y="354" fontSize="9" fill="#6E6E73" fontFamily="'SF Mono', monospace" textAnchor="end">0,0</text>

                          {/* Vector arrows from origin to each token */}
                          {embedData.tokens.map((w, i) => {
                            // Convert percentages (10-90) to SVG coords
                            const cx = 50 + ((w.x - 10) / 80) * 400
                            const cy = 340 - ((w.y - 10) / 80) * 320
                            // Shorten arrow slightly so arrowhead doesn't overlap dot
                            const dx = cx - 50
                            const dy = cy - 340
                            const len = Math.sqrt(dx * dx + dy * dy)
                            const shortenBy = 8
                            const endX = len > shortenBy ? 50 + dx * (1 - shortenBy / len) : cx
                            const endY = len > shortenBy ? 340 + dy * (1 - shortenBy / len) : cy
                            return (
                              <line
                                key={`vec-${i}`}
                                x1="50"
                                y1="340"
                                x2={endX}
                                y2={endY}
                                stroke={VECTOR_SHADES[i % VECTOR_SHADES.length]}
                                strokeWidth="1.5"
                                opacity="0.5"
                                markerEnd={`url(#vec-arrow-${i})`}
                                className="how-scatter-vector"
                              />
                            )
                          })}

                          {/* Token dots + labels */}
                          {embedData.tokens.map((w, i) => {
                            const cx = 50 + ((w.x - 10) / 80) * 400
                            const cy = 340 - ((w.y - 10) / 80) * 320
                            const label = allTokens[i]?.text.trim() || '\u00B7'
                            const isHovered = hoveredDot === i
                            const r = isHovered ? 7 : 5
                            const glowOpacity = isHovered ? 0.6 : 0.4
                            // Determine label position to avoid edge overflow
                            const labelX = cx > 400 ? cx - 8 : cx < 80 ? cx + 8 : cx
                            const labelAnchor = cx > 400 ? 'end' : cx < 80 ? 'start' : 'middle'
                            const labelY = cy < 50 ? cy + 22 : cy - 14
                            return (
                              <g
                                key={`dot-${i}`}
                                className="how-scatter-dot-group"
                                onMouseEnter={() => setHoveredDot(i)}
                                onMouseLeave={() => setHoveredDot(null)}
                                style={{ cursor: 'default' }}
                              >
                                {/* Glow */}
                                <circle cx={cx} cy={cy} r={r + 4} fill={VECTOR_SHADES[i % VECTOR_SHADES.length]} opacity={glowOpacity * 0.35} />
                                {/* Dot */}
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={r}
                                  fill={VECTOR_SHADES[i % VECTOR_SHADES.length]}
                                  className="how-scatter-dot-circle"
                                />
                                {/* Label */}
                                <text
                                  x={labelX}
                                  y={labelY}
                                  textAnchor={labelAnchor}
                                  fontSize="13"
                                  fontWeight="700"
                                  fontFamily="'SF Mono', 'Menlo', monospace"
                                  fill="var(--text-primary)"
                                  className="how-scatter-dot-label"
                                >
                                  {label}
                                </text>
                                {/* Hover tooltip */}
                                {isHovered && (() => {
                                  const ttW = 170
                                  const ttH = 44
                                  const showBelow = cy < 70
                                  const ttY = showBelow ? cy + 14 : cy - ttH - 8
                                  const ttX = Math.max(4, Math.min(cx - ttW / 2, 500 - ttW - 4))
                                  return (
                                    <g>
                                      <rect
                                        x={ttX}
                                        y={ttY}
                                        width={ttW}
                                        height={ttH}
                                        rx="6"
                                        fill="var(--bg-surface)"
                                        stroke="var(--border)"
                                        strokeWidth="1"
                                        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.12))"
                                      />
                                      <text
                                        x={ttX + ttW / 2}
                                        y={ttY + 16}
                                        textAnchor="middle"
                                        fontSize="11"
                                        fontWeight="700"
                                        fontFamily="'SF Mono', 'Menlo', monospace"
                                        fill="var(--accent)"
                                      >
                                        {label}
                                      </text>
                                      <text
                                        x={ttX + ttW / 2}
                                        y={ttY + 34}
                                        textAnchor="middle"
                                        fontSize="9.5"
                                        fontFamily="'SF Mono', 'Menlo', monospace"
                                        fill="var(--text-secondary)"
                                      >
                                        [{w.vec.slice(0, 4).map((v) => v.toFixed(2)).join(', ')}...]
                                      </text>
                                    </g>
                                  )
                                })()}
                              </g>
                            )
                          })}

                          {/* Legend */}
                          <circle cx="70" cy="368" r="4" fill="var(--accent)" />
                          <text x="78" y="371" fontSize="10" fill="#6E6E73" fontFamily="-apple-system, sans-serif">Your tokens</text>
                          <line x1="140" y1="368" x2="160" y2="368" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" markerEnd="url(#vec-arrow-0)" />
                          <text x="166" y="371" fontSize="10" fill="#6E6E73" fontFamily="-apple-system, sans-serif">Vector direction</text>
                        </svg>
                      </div>
                      <div className="how-scatter-note">
                        Dots positioned using real OpenAI embedding vectors &mdash; tokens that appear in similar contexts in training data will naturally cluster closer together.
                      </div>
                    </div>
                  </>
                )}

                {vectorsReady && embedData && (
                  <div className="how-nav-row">
                    <div className="how-nav-buttons">
                      <button className="how-back-btn" onClick={() => goToStage(1)}>&larr; Back</button>
                      <button className="how-gotit-btn" onClick={() => setStage(3)}>Show me attention &rarr;</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Stage 3: Attention */}
            {stage === 3 && (
              <div className="how-stage how-fade-in">
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>Stage 4: Attention</strong>
                  </div>
                  <p>The Transformer looks at every token in relation to every other token simultaneously. The lines show which words 'pay attention' to each other.</p>
                  <div className="how-info-tip"><TipIcon size={16} color="#eab308" /> This is the breakthrough that made modern AI possible &mdash; before Transformers, AI read text word by word like a human. Now it sees the whole picture at once.</div>
                  <ToolChips tools={HOW_TOOLS[3]} />
                </div>

                <div className="how-attention">
                  <svg className="how-attn-svg" viewBox={`0 0 ${Math.max(allTokens.length * 100, 300)} 120`} preserveAspectRatio="xMidYMid meet">
                    {attentionVisible && attentionPairs.filter(p => p.weight > 0.3).map((pair, idx) => {
                      const x1 = pair.from * 100 + 50
                      const x2 = pair.to * 100 + 50
                      const y1 = 40
                      const y2 = 40
                      const midY = Math.min(y1, y2) - 20 - pair.weight * 30
                      return (
                        <path
                          key={idx}
                          d={`M${x1},${y1} Q${(x1 + x2) / 2},${midY} ${x2},${y2}`}
                          fill="none"
                          stroke="var(--accent)"
                          strokeWidth={pair.weight * 4}
                          opacity={pair.weight * 0.7}
                          className="how-attn-line"
                        />
                      )
                    })}
                    {allTokens.map((tok, i) => {
                      const display = tok.text.replace(/ /g, '\u00B7')
                      return (
                        <g key={i}>
                          <rect
                            x={i * 100 + 10}
                            y={25}
                            width={80}
                            height={32}
                            rx={8}
                            fill="var(--attn-rect-fill)"
                            stroke="var(--attn-rect-stroke)"
                            strokeWidth={1}
                          />
                          <text
                            x={i * 100 + 50}
                            y={46}
                            textAnchor="middle"
                            fontSize={13}
                            fontWeight={500}
                            fill="var(--attn-text-fill)"
                            fontFamily="-apple-system, sans-serif"
                          >
                            {display || '\u00B7'}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>

                <div className="how-nav-row">
                  <div className="how-nav-buttons">
                    <button className="how-back-btn" onClick={() => goToStage(2)}>&larr; Back</button>
                    <button className="how-gotit-btn" onClick={startGeneration}>Generate the response &rarr;</button>
                  </div>
                </div>
              </div>
            )}

            {/* Stage 4: Generation */}
            {stage === 4 && (
              <div className="how-stage how-fade-in">
                <div className="how-info-card how-info-card-edu">
                  <div className="how-info-card-header">
                    <strong>Stage 5: Generation</strong>
                  </div>
                  <p>The model predicts the most likely next token based on everything it has learned from training on billions of documents. Then it repeats &mdash; adding one token at a time until the response is complete.</p>
                  <div className="how-info-tip"><TipIcon size={16} color="#eab308" /> There's no 'understanding' happening &mdash; just incredibly sophisticated pattern matching at a scale humans can't comprehend.</div>
                  <ToolChips tools={HOW_TOOLS[4]} />
                </div>

                <div className="how-gen-output">
                  <span className="how-gen-prompt">{prompt}</span>
                  {genStreamedText && (
                    <>
                      <span className="how-gen-separator">&rarr;</span>
                      <span className="how-gen-token how-pop-in">{genStreamedText}</span>
                    </>
                  )}
                  {genPhase === 'streaming' && <span className="how-gen-cursor">|</span>}
                </div>

                {genCandidates.length > 0 && (
                  <div className="how-gen-bars">
                    <div className="how-gen-bars-label">Top 5 candidates for first token:</div>
                    {genCandidates.slice(0, 5).map((c, i) => {
                      const pct = c.prob * 100
                      const barWidth = (c.prob / maxProb) * 100
                      const display = c.token.replace(/ /g, '\u00B7').replace(/\n/g, '\\n')
                      return (
                        <div key={i} className="how-gen-bar-row">
                          <div className="how-gen-bar-token">{display || '\u00B7'}</div>
                          <div className="how-gen-bar-track">
                            <div
                              className="how-gen-bar-fill"
                              style={{ width: `${Math.max(barWidth, 2)}%`, background: BAR_COLORS[i] }}
                            />
                          </div>
                          <div className="how-gen-bar-pct">{pct.toFixed(1)}%</div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {genCandidates.length > 0 && (
                  <div className="how-sampling-note">
                    The bar chart shows token probabilities from one API call.
                    The streamed text is a separate call &mdash; the actual chosen tokens may differ
                    due to temperature sampling. This demonstrates how randomness makes AI responses varied.
                  </div>
                )}

                {genPhase === 'logprobs' && (
                  <div className="how-gen-status">Analyzing first token...</div>
                )}
                {genPhase === 'streaming' && (
                  <div className="how-gen-status">Streaming response...</div>
                )}

                {genPhase === 'done' && (
                  <div className="how-nav-row">
                    <div className="how-nav-buttons">
                      <button className="how-back-btn" onClick={() => goToStage(3)}>&larr; Back</button>
                      <button className="how-gotit-btn" onClick={finishJourney}>See the full picture &rarr;</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Final output */}
      {showFinal && (
        <div className="how-final how-fade-in">
          <div className="how-final-celebration">You just watched an LLM work!</div>

          <div className="how-final-label">AI Response</div>
          <div className="how-final-bubble">
            {genStreamedText}
          </div>

          <div className="how-final-recap">
            <div className="how-final-recap-title">Journey Recap</div>
            <div className="how-final-recap-items">
              <div className="how-final-recap-item">
                <span className="how-final-recap-emoji">{STAGE_ICONS[0]}</span>
                <span>Your prompt: {prompt.split(/\s+/).length} words &rarr; {allTokens.length} tokens</span>
              </div>
              <div className="how-final-recap-item">
                <span className="how-final-recap-emoji">{STAGE_ICONS[2]}</span>
                <span>Embeddings: {allTokens.length} vectors calculated</span>
              </div>
              <div className="how-final-recap-item">
                <span className="how-final-recap-emoji">{STAGE_ICONS[3]}</span>
                <span>Attention: every token compared to every other token</span>
              </div>
              <div className="how-final-recap-item">
                <span className="how-final-recap-emoji">{STAGE_ICONS[4]}</span>
                <span>Generation: response built one token at a time ({genTokenCount} tokens)</span>
              </div>
            </div>
          </div>

          <div className="how-final-stats">
            <span>{allTokens.length} input tokens</span>
            <span className="how-final-dot">&middot;</span>
            <span>{genTokenCount} output tokens</span>
            <span className="how-final-dot">&middot;</span>
            <span>{(elapsed / 1000).toFixed(1)}s total</span>
          </div>

          <div className="how-final-actions">
            <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
              Test Your Knowledge &rarr;
            </button>
            <button className="how-secondary-btn" onClick={reset}>
              Start over
            </button>
          </div>

          <SuggestedModules currentModuleId="how-llms-work" onSwitchTab={onSwitchTab} />
        </div>
      )}
    </div>
  )
}

export default HowLLMsWork
