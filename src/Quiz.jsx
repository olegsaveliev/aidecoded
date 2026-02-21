import { useState, useEffect, useRef } from 'react'
import './Quiz.css'

const SCORE_MESSAGES = [
  { min: 0, max: 40, text: 'Keep exploring! Review the material and try again', emoji: '🌱' },
  { min: 50, max: 70, text: "Good progress! You're getting there", emoji: '🎯' },
  { min: 80, max: 90, text: 'Great work! You really understand this', emoji: '🌟' },
  { min: 100, max: 100, text: "Perfect score! You're an AI expert!", emoji: '🏆' },
]

function getScoreMessage(score) {
  for (const msg of SCORE_MESSAGES) {
    if (score >= msg.min && score <= msg.max) return msg
  }
  return SCORE_MESSAGES[0]
}

/* ─── Confetti burst (CSS-only particles) ─── */
function ConfettiBurst({ active }) {
  if (!active) return null
  const particles = Array.from({ length: 24 }, (_, i) => {
    const angle = (i / 24) * 2 * Math.PI
    const distance = 60 + Math.random() * 80
    const tx = Math.cos(angle) * distance
    const ty = Math.sin(angle) * distance
    const size = 4 + Math.random() * 6
    const colors = ['#34C759', '#FFD60A', '#0071E3', '#FF375F', '#AF52DE', '#FF9500']
    const color = colors[i % colors.length]
    const delay = Math.random() * 0.15
    return (
      <span
        key={i}
        className="quiz-confetti-particle"
        style={{
          '--tx': `${tx}px`,
          '--ty': `${ty}px`,
          '--size': `${size}px`,
          '--color': color,
          '--delay': `${delay}s`,
        }}
      />
    )
  })
  return <div className="quiz-confetti-burst">{particles}</div>
}

/* ─── Animated score circle (SVG) ─── */
function ScoreCircle({ score, total }) {
  const pct = total > 0 ? score / total : 0
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - pct * circumference)
    }, 100)
    return () => clearTimeout(timer)
  }, [pct, circumference])

  return (
    <div className="quiz-score-circle-wrapper">
      <svg className="quiz-score-circle" viewBox="0 0 160 160">
        <circle
          className="quiz-score-circle-bg"
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="10"
        />
        <circle
          className="quiz-score-circle-fg"
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 80 80)"
        />
      </svg>
      <div className="quiz-score-circle-text">
        <div className="quiz-score-circle-value">{score}</div>
        <div className="quiz-score-circle-label">out of {total}</div>
      </div>
    </div>
  )
}

function Quiz({ questions, tabName, onBack, onGoHome, onNextModule, nextModuleName }) {
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null) // index of selected answer
  const [showResult, setShowResult] = useState(false) // final score screen
  const [showConfetti, setShowConfetti] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef(null)
  const confettiTimerRef = useRef(null)

  const q = questions[current]
  const total = questions.length * 10
  const isCorrect = selected === q?.correct
  const answered = selected !== null

  function handleSelect(idx) {
    if (answered) return
    setSelected(idx)

    if (idx === q.correct) {
      setScore((s) => s + 10)
      setShowConfetti(true)
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 800)
    }

    timerRef.current = setTimeout(() => {
      if (current < questions.length - 1) {
        setTransitioning(true)
        setTimeout(() => {
          setCurrent((c) => c + 1)
          setSelected(null)
          setTransitioning(false)
        }, 250)
      } else {
        setShowResult(true)
      }
    }, 1500)
  }

  function handleRetry() {
    setCurrent(0)
    setScore(0)
    setSelected(null)
    setShowResult(false)
    setShowConfetti(false)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current)
    }
  }, [])

  // Final score screen
  if (showResult) {
    const msg = getScoreMessage(score)
    return (
      <div className="quiz-container quiz-fade-in">
        <div className="quiz-result-card">
          <div className="quiz-result-emoji">{msg.emoji}</div>
          <ScoreCircle score={score} total={total} />
          <div className="quiz-result-message">{msg.text}</div>

          <div className="quiz-result-actions">
            <button className="quiz-btn quiz-btn-primary" onClick={handleRetry}>
              Try Again
            </button>
            {onGoHome && (
              <button className="quiz-btn quiz-btn-secondary" onClick={onGoHome}>
                Go to Home
              </button>
            )}
            {onNextModule && nextModuleName && (
              <button className="quiz-btn quiz-btn-primary" onClick={onNextModule}>
                Next Module &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Question screen
  return (
    <div className="quiz-container quiz-fade-in">
      {/* Progress bar */}
      <div className="quiz-header">
        <div className="quiz-progress-info">
          Question {current + 1} of {questions.length}
        </div>
        <div className="quiz-score-tracker">{score}/{total}</div>
      </div>
      <div className="quiz-progress-bar">
        <div
          className="quiz-progress-fill"
          style={{ width: `${((current + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className={`quiz-card ${transitioning ? 'quiz-card-exit' : 'quiz-card-enter'}`}>
        <div className="quiz-question-number">Q{current + 1}</div>
        <div className="quiz-question">{q.question}</div>

        <div className="quiz-options">
          {q.options.map((opt, idx) => {
            let cls = 'quiz-option'
            if (answered) {
              if (idx === q.correct) cls += ' quiz-option-correct'
              else if (idx === selected && !isCorrect) cls += ' quiz-option-wrong'
              else cls += ' quiz-option-disabled'
            }
            return (
              <button
                key={idx}
                className={cls}
                onClick={() => handleSelect(idx)}
                disabled={answered}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {showConfetti && <ConfettiBurst active />}
      </div>

      {/* Back link */}
      {onBack && (
        <button className="quiz-back-link" onClick={onBack}>
          &larr; Back to {tabName}
        </button>
      )}
    </div>
  )
}

export default Quiz
