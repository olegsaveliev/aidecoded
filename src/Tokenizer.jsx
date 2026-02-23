import { useState, useEffect, useRef, useMemo } from 'react'
import { encode, decode } from 'gpt-tokenizer'
import Tooltip from './Tooltip.jsx'
import EntryScreen from './EntryScreen.jsx'
import ModuleIcon from './ModuleIcon.jsx'
import { useAuth } from './AuthContext'
import usePersistedState from './usePersistedState.js'
import Quiz from './Quiz.jsx'
import { tokenizerQuiz } from './quizData.js'
import SuggestedModules from './SuggestedModules.jsx'

const TOKEN_COLORS = [
  { bgVar: '--token-pastels-1-bg', borderVar: '--token-pastels-1-border' },
  { bgVar: '--token-pastels-2-bg', borderVar: '--token-pastels-2-border' },
  { bgVar: '--token-pastels-3-bg', borderVar: '--token-pastels-3-border' },
  { bgVar: '--token-pastels-4-bg', borderVar: '--token-pastels-4-border' },
  { bgVar: '--token-pastels-5-bg', borderVar: '--token-pastels-5-border' },
]

const SUGGESTIONS = [
  { text: 'The quick brown fox jumps over the lazy dog', label: 'Common words' },
  { text: 'ChatGPT is an AI assistant built by OpenAI', label: 'Proper nouns' },
  { text: 'Supercalifragilisticexpialidocious', label: 'Long rare word' },
  { text: 'SELECT * FROM users WHERE id = 1', label: 'Code syntax' },
]

const FUN_FACTS = [
  'The word "token" itself is 1 token!',
  'Emojis are usually 1\u20132 tokens',
  'Code is often more token-efficient than plain English',
  'GPT-4 "reads" your entire conversation as one long token sequence',
  'The Bible is approximately 800,000 tokens',
  'Shakespeare\u2019s complete works \u2248 1.2 million tokens',
]

function Tokenizer({ onSwitchTab, onGoHome }) {
  const { markModuleStarted, markModuleComplete } = useAuth()
  const [showEntry, setShowEntry] = usePersistedState('tokenizer-entry', true)
  const [text, setText] = useState('')
  const [showWelcome, setShowWelcome] = useState(showEntry)
  const [showInfo, setShowInfo] = useState(true)
  const [factIndex, setFactIndex] = useState(0)
  const [factFading, setFactFading] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [learnTip, setLearnTip] = useState(null)
  const [learnTipFading, setLearnTipFading] = useState(false)
  const [dismissedTips, setDismissedTips] = useState(new Set())
  const [inputCount, setInputCount] = useState(0)
  const factTimer = useRef(null)
  const prevTextRef = useRef('')

  const tokenData = useMemo(() => {
    if (!text) return []
    try {
      const ids = encode(text)
      return ids.map((id) => ({
        id,
        text: decode([id]),
      }))
    } catch {
      return []
    }
  }, [text])

  useEffect(() => {
    if (tokenData.length > 0) markModuleComplete('tokenizer')
  }, [tokenData.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track distinct inputs (user typed something meaningful or clicked a suggestion)
  useEffect(() => {
    if (text.length >= 5 && text !== prevTextRef.current) {
      prevTextRef.current = text
      setInputCount((c) => c + 1)
    }
  }, [text])

  // Progressive learning tips at milestones
  useEffect(() => {
    if (inputCount === 1 && !dismissedTips.has('first') && !learnTip) {
      setLearnTip({ id: 'first', text: 'Look at the character-to-token ratio below — common English averages about 4 characters per token. Try a rare word like "Supercalifragilisticexpialidocious" to see it change!' })
    } else if (inputCount >= 2 && !dismissedTips.has('compare') && !learnTip) {
      setLearnTip({ id: 'compare', text: 'Notice how different inputs produce very different token counts! This is why AI costs are based on tokens, not words — some text is more "expensive" than others.' })
    } else if (inputCount >= 4 && !dismissedTips.has('explore') && !learnTip) {
      setLearnTip({ id: 'explore', text: 'You\'re getting the hang of it! Try typing in another language or pasting some code — tokenization works very differently for non-English text.' })
    }
  }, [inputCount, dismissedTips]) // eslint-disable-line react-hooks/exhaustive-deps

  function dismissLearnTip() {
    if (!learnTip) return
    setDismissedTips((prev) => new Set(prev).add(learnTip.id))
    setLearnTipFading(true)
    setTimeout(() => {
      setLearnTip(null)
      setLearnTipFading(false)
    }, 400)
  }

  // Rotate fun facts every 8 seconds
  useEffect(() => {
    factTimer.current = setInterval(() => {
      setFactFading(true)
      setTimeout(() => {
        setFactIndex((i) => (i + 1) % FUN_FACTS.length)
        setFactFading(false)
      }, 400)
    }, 8000)
    return () => clearInterval(factTimer.current)
  }, [])

  if (showEntry) {
    return (
      <EntryScreen
        icon={<ModuleIcon module="tokenizer" size={48} style={{ color: '#AF52DE' }} />}
        title="Token Visualizer"
        subtitle="See how AI reads your text"
        description="Before an AI can understand anything you write, it first breaks your text into tokens — small pieces that are its actual vocabulary. You'll see this happen in real time, and learn why AI has token limits, not word limits."
        buttonText="Start Tokenizing"
        onStart={() => { setShowEntry(false); markModuleStarted('tokenizer') }}
      />
    )
  }

  if (showQuiz) {
    return (
      <div className="tokenizer quiz-fade-in">
        <Quiz
          questions={tokenizerQuiz}
          tabName="Tokenizer"
          onBack={() => setShowQuiz(false)}
          onStartOver={() => { setShowQuiz(false); setShowEntry(true) }}
          onSwitchTab={onSwitchTab}
          currentModuleId="tokenizer"
        />
      </div>
    )
  }

  function handleStartOver() {
    setText('')
    setShowEntry(true)
    setShowWelcome(true)
    setShowInfo(true)
    setLearnTip(null)
    setDismissedTips(new Set())
    setInputCount(0)
    prevTextRef.current = ''
  }

  return (
    <div className="tokenizer">
      <button className="entry-start-over" onClick={handleStartOver}>
        &larr; Start over
      </button>
      {showWelcome && (
        <div className="tok-welcome">
          <div className="tok-welcome-text">
            <strong>Welcome to the Tokenizer</strong> — here's how to explore:
            <ol className="tok-welcome-steps">
              <li>Type text below or pick a suggestion — watch the colored tokens appear instantly</li>
              <li>Compare the <strong>character count</strong> vs <strong>token count</strong> — notice they're different!</li>
              <li>Try different inputs: common words, rare words, code — see how tokenization changes</li>
            </ol>
          </div>
          <button className="tok-welcome-dismiss" onClick={() => setShowWelcome(false)}>Got it</button>
        </div>
      )}

      {showInfo && (
        <div className="tok-info-banner">
          <div className="tok-info-banner-text">
            <strong>What is a token?</strong>
            <ul>
              <li>A token is roughly 3–4 characters or about &frac34; of a word</li>
              <li>Common words like &ldquo;the&rdquo; or &ldquo;is&rdquo; are usually 1 token</li>
              <li>Longer or rare words get split into multiple tokens</li>
              <li>Numbers, punctuation and spaces are often their own tokens</li>
              <li>This is why AI has token <em>limits</em> — not word limits</li>
              <li>GPT-4 can handle up to 128,000 tokens in one conversation</li>
            </ul>
          </div>
          <button className="tok-welcome-dismiss" onClick={() => setShowInfo(false)}>Got it</button>
        </div>
      )}

      <div className="tokenizer-model-label">
        Using the same tokenizer as GPT-4 and ChatGPT
        <Tooltip text="A tokenizer is the system that splits your text into tokens before the AI reads it. Different AI models use different tokenizers — this one is used by OpenAI's GPT-3.5, GPT-4 and ChatGPT, so what you see here is exactly how those models read your text." />
      </div>

      <div className="tokenizer-input-area">
        <label htmlFor="tokenizer-input">Enter text to tokenize</label>
        <textarea
          id="tokenizer-input"
          placeholder="Type or paste text here to see how it gets tokenized..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
        />
      </div>

      {!text && (
        <div className="tok-suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s.label} className="tok-suggestion" onClick={() => setText(s.text)}>
              <span className="tok-suggestion-text">{s.text}</span>
              <span className="tok-suggestion-label">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="token-stats">
        <span>{text.length} characters</span>
        <span className="token-arrow">&rarr;</span>
        <span className="token-count">{tokenData.length} tokens</span>
        {text.length > 0 && (
          <span className="token-ratio">
            ({(text.length / Math.max(tokenData.length, 1)).toFixed(1)} chars/token)
          </span>
        )}
        <Tooltip text="Tokens are what you pay for when using the OpenAI API. GPT-4o costs $5 per 1 million input tokens. Your current text would cost less than $0.0001!" />
      </div>

      <div className="token-chips">
        {tokenData.length === 0 && (
          <div className="token-placeholder">
            Tokens will appear here as you type...
          </div>
        )}
        {tokenData.map((token, i) => {
          const color = TOKEN_COLORS[i % TOKEN_COLORS.length]
          const display = token.text
            .replace(/ /g, '\u00B7')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
          return (
            <span
              key={i}
              className="token-chip"
              style={{
                background: `var(${color.bgVar})`,
                borderColor: `var(${color.borderVar})`,
              }}
              title={`Token ID: ${token.id}`}
            >
              {display || '\u00B7'}
            </span>
          )
        })}
      </div>

      {tokenData.length > 0 && (
        <div className="tok-legend">
          Each color represents a different token — notice how spaces are often included at the <strong>start</strong> of a token, not the end. This is how GPT tokenization works!
        </div>
      )}

      {learnTip && (
        <div className={`learn-tip ${learnTipFading ? 'learn-tip-fading' : ''}`} role="status" aria-live="polite">
          <span className="learn-tip-text">{learnTip.text}</span>
          <button className="learn-tip-dismiss" onClick={dismissLearnTip} aria-label="Dismiss tip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      <div className="tok-funfact">
        <div className="tok-funfact-label">Did you know?</div>
        <div className={`tok-funfact-text ${factFading ? 'tok-funfact-fading' : ''}`}>
          {FUN_FACTS[factIndex]}
        </div>
      </div>

      <div className="how-final-actions">
        <button className="quiz-launch-btn" onClick={() => setShowQuiz(true)}>
          Test Your Knowledge &rarr;
        </button>
        <button className="how-secondary-btn" onClick={handleStartOver}>Start over</button>
      </div>
      <SuggestedModules currentModuleId="tokenizer" onSwitchTab={onSwitchTab} />
    </div>
  )
}

export default Tokenizer
