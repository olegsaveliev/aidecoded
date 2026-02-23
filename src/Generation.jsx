import { useState, useRef, useEffect, useCallback } from 'react'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import Quiz from './Quiz.jsx'
import { generationQuiz } from './quizData.js'
import { CheckIcon } from './ContentIcons.jsx'
import SuggestedModules from './SuggestedModules.jsx'

const BAR_COLORS = [
  '#0071e3',
  '#2997ff',
  '#64b5f6',
  '#9fc5e8',
  '#cfe2f3',
]

const TOKEN_SHADES = [
  '#0071e3',
  '#2997ff',
  '#0058b0',
  '#40a9ff',
  '#004080',
  '#5cb8ff',
  '#003366',
  '#7ecbff',
]

const SIM_STEPS = 15

const PUNCT = new Set(['.', ',', '!', '?', ':', ';', "'", ')'])

function spaceToken(token, prior) {
  if (prior.length === 0) return token
  if (token.startsWith(' ')) return token
  if (PUNCT.has(token[0])) return token
  return ' ' + token
}

const MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo']

function Generation({ model: defaultModel, maxTokens, onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [showEntry, setShowEntry] = usePersistedState('generation-entry', true)
  const [genModel, setGenModel] = useState(defaultModel || 'gpt-4o-mini')
  const [temperature, setTemperature] = useState(0.7)
  const [topP, setTopP] = useState(1)
  const [seed, setSeed] = useState('The weather in Paris is')
  const [tokens, setTokens] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phase, setPhase] = useState('idle')          // idle | active | done
  const [simulating, setSimulating] = useState(false)
  const [simCount, setSimCount] = useState(0)
  const [streaming, setStreaming] = useState(false)
  const [streamedText, setStreamedText] = useState('')
  const [doneMode, setDoneMode] = useState(null)       // 'sim' | 'auto' | null
  const [flashBar, setFlashBar] = useState(-1)
  const [showTopK, setShowTopK] = useState(true)
  const [showWelcome, setShowWelcome] = useState(showEntry)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const [manualPicks, setManualPicks] = useState(0)
  const [hasUsedAuto, setHasUsedAuto] = useState(false)
  const [tempChanged, setTempChanged] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const simRef = useRef(false)
  const timerRef = useRef(null)
  const tokensRef = useRef([])
  const simCountRef = useRef(0)
  const abortRef = useRef(null)

  useEffect(() => {
    tokensRef.current = tokens
  }, [tokens])

  // Progressive learning tips at milestones
  useEffect(() => {
    if (manualPicks === 1 && !dismissedTips.has('first') && !learnTip) {
      setLearnTip({ id: 'first', text: 'You just picked a token! Notice how the probability bars changed — each word you choose creates new context that shifts the AI\'s predictions.' })
    } else if (hasUsedAuto && !dismissedTips.has('auto') && !learnTip) {
      setLearnTip({ id: 'auto', text: 'That\'s how ChatGPT works — hundreds of token picks per second. Each word is still chosen by probability, just like you did manually!' })
    } else if (manualPicks >= 3 && !tempChanged && !dismissedTips.has('temp') && !learnTip) {
      setLearnTip({ id: 'temp', text: 'Try changing Temperature to 0 — the top bar will dominate. Then try 1.5 — probabilities spread out, making surprising choices more likely.' })
    }
  }, [manualPicks, hasUsedAuto, tempChanged, dismissedTips]) // eslint-disable-line react-hooks/exhaustive-deps

  const fadeTimerRef = useRef(null)

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips((prev) => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    fadeTimerRef.current = setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  const fetchCandidates = useCallback(async (text) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: genModel,
        messages: [
          { role: 'system', content: 'Complete the user\'s text naturally. Only output the continuation, not the original text.' },
          { role: 'user', content: text },
        ],
        max_tokens: 1,
        temperature,
        top_p: topP,
        logprobs: true,
        top_logprobs: 5,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      throw new Error(errData?.error?.message || `API error: ${res.status}`)
    }

    const data = await res.json()
    const topLogprobs = data.choices[0]?.logprobs?.content?.[0]?.top_logprobs || []
    return topLogprobs
      .map((lp) => ({ token: lp.token, prob: Math.exp(lp.logprob) }))
      .sort((a, b) => b.prob - a.prob)
  }, [genModel, temperature, topP])

  // Start manual mode
  async function handleStart() {
    setError('')
    setTokens([])
    setCandidates([])
    setStreamedText('')
    setDoneMode(null)
    setLoading(true)
    setPhase('active')
    try {
      const result = await fetchCandidates(seed)
      if (result) setCandidates(result)
    } catch (err) {
      setError(err.message)
      setPhase('idle')
    } finally {
      setLoading(false)
    }
  }

  // Manual bar click
  async function handleBarClick(tokenText, barIndex) {
    if (loading || simulating || streaming || phase !== 'active') return

    setFlashBar(barIndex)
    setTimeout(() => setFlashBar(-1), 350)

    const spaced = spaceToken(tokenText, tokensRef.current)
    const newTokens = [...tokensRef.current, spaced]
    setTokens(newTokens)
    setManualPicks((c) => c + 1)
    markModuleComplete('generation')

    setLoading(true)
    try {
      const nextText = seed + newTokens.join('')
      const result = await fetchCandidates(nextText)
      if (result) setCandidates(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ── Simulate mode ──
  function stopSim() {
    simRef.current = false
    setSimulating(false)
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  function startSim() {
    simRef.current = true
    simCountRef.current = 0
    setSimCount(0)
    setSimulating(true)

    async function simStep(cands) {
      if (!simRef.current) return
      if (simCountRef.current >= SIM_STEPS) {
        stopSim()
        setDoneMode('sim')
        setPhase('done')
        setCandidates([])
        return
      }

      let currentCands = cands
      if (!currentCands || currentCands.length === 0) {
        setLoading(true)
        try {
          const text = tokensRef.current.length === 0
            ? seed
            : seed + tokensRef.current.join('')
          currentCands = await fetchCandidates(text)
          if (!simRef.current) return
          if (currentCands) setCandidates(currentCands)
        } catch (err) {
          setError(err.message)
          stopSim()
          return
        } finally {
          setLoading(false)
        }
      }

      if (!currentCands || currentCands.length === 0 || !simRef.current) return

      const topToken = currentCands[0].token
      setFlashBar(0)
      setTimeout(() => setFlashBar(-1), 350)

      const spaced = spaceToken(topToken, tokensRef.current)
      const newTokens = [...tokensRef.current, spaced]
      setTokens(newTokens)
      simCountRef.current++
      setSimCount(simCountRef.current)

      if (simCountRef.current >= SIM_STEPS) {
        stopSim()
        setDoneMode('sim')
        setPhase('done')
        setCandidates([])
        return
      }

      setLoading(true)
      try {
        const nextText = seed + newTokens.join('')
        const result = await fetchCandidates(nextText)
        if (!simRef.current) return
        if (result) {
          setCandidates(result)
          timerRef.current = setTimeout(() => simStep(result), 1200)
        }
      } catch (err) {
        setError(err.message)
        stopSim()
      } finally {
        setLoading(false)
      }
    }

    if (phase === 'active' && candidates.length > 0) {
      simStep(candidates)
    } else {
      setPhase('active')
      simStep(null)
    }
  }

  // ── Automatic (streaming) mode ──
  async function startAutomatic() {
    setError('')
    setTokens([])
    setCandidates([])
    setStreamedText('')
    setDoneMode(null)
    setStreaming(true)
    setPhase('active')

    const abort = new AbortController()
    abortRef.current = abort

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: genModel,
          messages: [
            { role: 'system', content: 'Complete the user\'s text naturally. Only output the continuation, not the original text.' },
            { role: 'user', content: seed },
          ],
          max_tokens: maxTokens,
          temperature,
          top_p: topP,
          stream: true,
          logprobs: true,
          top_logprobs: 5,
        }),
        signal: abort.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData?.error?.message || `API error: ${res.status}`)
      }

      const reader = res.body.getReader()
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
            const choice = json.choices?.[0]
            const delta = choice?.delta?.content
            if (delta) {
              setStreamedText((prev) => {
                if (prev.length === 0) return delta
                if (delta.startsWith(' ')) return prev + delta
                if (PUNCT.has(delta[0]) || delta[0] === '\n') return prev + delta
                return prev + ' ' + delta
              })
            }

            // Update probability bars from streaming logprobs
            const topLogprobs = choice?.logprobs?.content?.[0]?.top_logprobs
            if (topLogprobs && topLogprobs.length > 0) {
              const parsed = topLogprobs
                .map((lp) => ({ token: lp.token, prob: Math.exp(lp.logprob) }))
                .sort((a, b) => b.prob - a.prob)
              setCandidates(parsed)
            }
          } catch {
            // skip malformed JSON
          }
        }
      }

      setStreaming(false)
      setDoneMode('auto')
      setPhase('done')
      setHasUsedAuto(true)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
      setStreaming(false)
      setPhase('idle')
    }
  }

  function stopAutomatic() {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setStreaming(false)
    setDoneMode('auto')
    setPhase('done')
    setHasUsedAuto(true)
  }

  function handleReset() {
    stopSim()
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setTokens([])
    setCandidates([])
    setStreamedText('')
    setError('')
    setPhase('idle')
    setFlashBar(-1)
    setLoading(false)
    setSimCount(0)
    setSimulating(false)
    setStreaming(false)
    setDoneMode(null)
  }

  function handleStartOver() {
    handleReset()
    setShowEntry(true)
    setShowWelcome(true)
    setShowTopK(true)
    setLearnTip(null)
    setDismissedTips(new Set())
    setManualPicks(0)
    setHasUsedAuto(false)
    setTempChanged(false)
  }

  useEffect(() => {
    return () => {
      simRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (abortRef.current) abortRef.current.abort()
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const maxProb = candidates.length > 0 ? Math.max(...candidates.map((c) => c.prob)) : 1
  const barsClickable = phase === 'active' && !simulating && !streaming && !loading
  const isBusy = simulating || streaming

  // Determine what to show in the text box
  const hasStreamedContent = streaming || (doneMode === 'auto' && streamedText)
  const hasTokenContent = tokens.length > 0

  if (showEntry) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="generation" size={48} style={{ color: '#0071E3' }} />}
        title="Token Generation"
        subtitle="Watch AI think, one word at a time"
        description="This is how ChatGPT actually works — it predicts the next word based on probability. You'll see real AI predictions, pick tokens yourself, and learn how Temperature changes what the AI chooses."
        buttonText="Start Generating"
        onStart={() => { setShowEntry(false); markModuleStarted('generation') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="generation quiz-fade-in">
        <Quiz
          questions={generationQuiz}
          tabName="Generation"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => { setShowQuiz(false); setShowEntry(true) }}
          onSwitchTab={onSwitchTab}
          currentModuleId="generation"
        />
      </div>
    )
  }

  return (
    <div className="generation">
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>
      {showWelcome && (
        <div className="gen-welcome">
          <div className="gen-welcome-text">
            <strong>Welcome to Generation</strong> — here's how to explore:
            <ol className="gen-welcome-steps">
              <li>Click <strong>Manual</strong> to see the AI's top 5 predictions — then click a bar to pick a word yourself</li>
              <li>Click <strong>Automatic</strong> to watch the AI complete the sentence at full speed</li>
              <li>Change <strong>Temperature</strong> and try again — watch how the probability bars change</li>
            </ol>
          </div>
          <button className="gen-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {/* Top-k explanation card */}
      {showTopK && (
        <div className="gen-topk-card gen-topk-card-open">
          <div className="gen-topk-content">
            <strong>What is Top-k sampling?</strong>
            <p>When the model predicts the next token, it assigns a probability to every word in its vocabulary (tens of thousands!). <strong>Top-k</strong> limits the selection to only the k most likely candidates. Here you see the top 5.</p>
            <p>Combined with <strong>Temperature</strong> (which sharpens or flattens the probabilities) and <strong>Top-p</strong> (which picks tokens until their cumulative probability reaches p), these controls determine how creative or predictable the output is.</p>
          </div>
          <button className="gen-topk-dismiss" onClick={() => setShowTopK(false)}>
            Got it <CheckIcon size={12} />
          </button>
        </div>
      )}

      {/* 1. Inline toolbar */}
      <div className="gen-inline-params">
        <div className="gen-inline-param">
          <span className="slider-name">Model</span>
          <select
            className="gen-model-select"
            value={genModel}
            onChange={(e) => setGenModel(e.target.value)}
          >
            {MODELS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="gen-inline-param">
          <span className="slider-name">
            Temperature
            <Tooltip text="Higher temperature = more surprising word choices. Lower = more predictable. Try 0 vs 1.5 and compare!" />
          </span>
          {/* Capped at 1.5 — values above ~1.3 produce garbled output with no educational value */}
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={temperature}
            onChange={(e) => { setTemperature(parseFloat(e.target.value)); setTempChanged(true) }}
          />
          <span className="slider-value">{temperature.toFixed(2)}</span>
        </div>
        <div className="gen-inline-param">
          <span className="slider-name">
            Top-p
            <Tooltip text="Narrows the pool of candidates. At 1.0 all top-k tokens compete. At 0.5 only tokens making up 50% probability are considered." />
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
          />
          <span className="slider-value">{topP.toFixed(2)}</span>
        </div>
      </div>

      {/* 2. Starting Prompt */}
      <div className="gen-input-area">
        <label htmlFor="gen-seed">
          Starting Prompt
          <Tooltip text="This is the beginning of the sentence the AI will complete. Try different prompts to see how context affects predictions!" />
        </label>
        <div className="gen-input-row">
          <input
            id="gen-seed"
            type="text"
            className="gen-seed-input"
            value={seed}
            onChange={(e) => {
              setSeed(e.target.value)
              handleReset()
            }}
            placeholder="Type a starting prompt..."
            disabled={phase !== 'idle'}
          />
        </div>
      </div>

      {/* Mode cards (idle only) */}
      {phase === 'idle' && (
        <div className="gen-mode-cards">
          <div className="gen-mode-card">
            <div className="gen-mode-card-title">Manual</div>
            <div className="gen-mode-card-desc">You are the AI. Click any bar to choose the next token yourself and build the sentence word by word.</div>
          </div>
          <div className="gen-mode-card">
            <div className="gen-mode-card-title">Automatic</div>
            <div className="gen-mode-card-desc">Full speed ahead. The AI completes the sentence naturally, just like ChatGPT does.</div>
          </div>
        </div>
      )}

      {/* 3. Generated Text */}
      <div className="gen-text-display">
        <label>Generated Text</label>
        <div className="gen-text-subtitle">Gray = your prompt &bull; Blue = AI generated tokens</div>
        <div className="gen-text-box">
          <span className="gen-seed-text">{seed}</span>
          {hasTokenContent && !hasStreamedContent && (
            <>
              <span className="gen-separator">&rarr;</span>
              {tokens.map((tok, i) => (
                <span
                  key={i}
                  className="gen-chosen-token"
                  style={{ color: TOKEN_SHADES[i % TOKEN_SHADES.length] }}
                >
                  {tok}
                </span>
              ))}
            </>
          )}
          {hasStreamedContent && (
            <>
              <span className="gen-separator">&rarr;</span>
              <span className="gen-streamed">{streamedText}</span>
            </>
          )}
          {(loading || streaming) && <span className="gen-cursor">|</span>}
        </div>
      </div>

      {/* 4. Buttons */}
      <div className="gen-controls">
        {phase === 'idle' && (
          <>
            <button
              className="gen-step-btn"
              onClick={handleStart}
              disabled={!seed.trim()}
            >
              Manual
            </button>
            <button
              className="gen-auto-btn"
              onClick={startAutomatic}
              disabled={!seed.trim()}
            >
              Automatic
            </button>
          </>
        )}
        {phase === 'active' && !isBusy && (
          <>
            <button
              className="gen-step-btn"
              onClick={startSim}
              disabled={loading}
            >
              Manual
            </button>
            <button
              className="gen-auto-btn"
              onClick={startAutomatic}
              disabled={loading}
            >
              Automatic
            </button>
          </>
        )}
        {simulating && (
          <button className="gen-auto-btn gen-auto-active" onClick={stopSim}>
            Stop
          </button>
        )}
        {streaming && (
          <button className="gen-auto-btn gen-auto-active" onClick={stopAutomatic}>
            Stop
          </button>
        )}
        <button className="gen-reset-btn" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* 5. Status row */}
      <div className="gen-status-row">
        {phase === 'active' && !isBusy && (
          <span className="gen-mode-label">Manual Mode — you are the model</span>
        )}
        {simulating && (
          <span className="gen-sim-progress">
            Manual mode... token {simCount}/{SIM_STEPS}
          </span>
        )}
        {streaming && (
          <span className="gen-sim-progress">Streaming response...</span>
        )}
        {phase === 'active' && !isBusy && tokens.length > 0 && (
          <span className="gen-shortcut-hint">
            {tokens.length} tokens chosen
          </span>
        )}
        {phase === 'done' && doneMode === 'sim' && (
          <span className="gen-done-msg">
            Simulation complete ({tokens.length} tokens) — see how the model thinks? Press Reset to try again.
          </span>
        )}
        {phase === 'done' && doneMode === 'auto' && (
          <span className="gen-done-msg">
            Complete! Press Reset to try again.
          </span>
        )}
      </div>

      {/* 6. Learning callout */}
      {learnTip && (
        <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      {/* 7. Probability bars */}
      {candidates.length > 0 && (
        <div className="gen-candidates">
          <label>
            {streaming ? 'Current Token Candidates' : 'Top 5 Candidates for Next Token'}
            <Tooltip text="These are the top 5 tokens the model is considering next. The percentages are real probabilities from the OpenAI API. Notice how confident the model is about some words vs others." />
          </label>
          <div className="gen-bars">
            {candidates.map((c, i) => {
              const pct = c.prob * 100
              const barWidth = (c.prob / maxProb) * 100
              const displayToken = c.token
                .replace(/ /g, '\u00B7')
                .replace(/\n/g, '\\n')
                .replace(/\t/g, '\\t')
              const isFlash = flashBar === i
              return (
                <div
                  key={i}
                  className={`gen-bar-row ${barsClickable ? 'gen-bar-clickable' : ''} ${isFlash ? 'gen-bar-flash' : ''}`}
                  onClick={() => barsClickable && handleBarClick(c.token, i)}
                >
                  <div className="gen-bar-token">{displayToken || '\u00B7'}</div>
                  <div className="gen-bar-track">
                    <div
                      className="gen-bar-fill"
                      style={{
                        width: `${Math.max(barWidth, 2)}%`,
                        background: BAR_COLORS[i] || BAR_COLORS[4],
                      }}
                    />
                  </div>
                  <div className="gen-bar-pct">{pct.toFixed(1)}%</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 8. Token limit note */}
      {phase === 'active' && !streaming && (
        <div className="gen-manual-note">
          Manual mode is limited to {SIM_STEPS} tokens — designed for learning how token prediction works step by step. Use Automatic for full sentence generation.
        </div>
      )}

      {/* 9. Click hint */}
      {candidates.length > 0 && !simulating && !streaming && doneMode === null && (
        <div className="gen-click-hint">
          Click any token to choose it — or use the buttons above
        </div>
      )}

      <div className="how-final-actions">
        <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
          Test Your Knowledge &rarr;
        </button>
        <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
      </div>
      <SuggestedModules currentModuleId="generation" onSwitchTab={onSwitchTab} />
    </div>
  )
}

export default Generation
