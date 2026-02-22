import { useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { CrossIcon } from './ContentIcons.jsx'
import './AuthModal.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function AuthModal({ isOpen, onClose, unlockMessage }) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setError('')
      setEmail('')
      setPassword('')
      setFullName('')
    }
  }, [isOpen, mode])

  useEffect(() => {
    if (!isOpen) return
    function handleEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  async function handleEmailSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (mode === 'signin') {
        const { error: err } = await signInWithEmail(email, password)
        if (err) {
          setError(err.message)
        } else {
          onClose()
        }
      } else {
        if (password.length < 8) {
          setError('Password must be at least 8 characters')
          setSubmitting(false)
          return
        }
        const { error: err } = await signUpWithEmail(email, password, fullName)
        if (err) {
          setError(err.message)
        } else {
          onClose()
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoogleClick() {
    signInWithGoogle()
  }

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose} aria-label="Close">
          <CrossIcon size={16} color="var(--text-secondary)" />
        </button>

        {unlockMessage && (
          <div className="auth-unlock-message">{unlockMessage}</div>
        )}

        <h2 className="auth-title">
          {mode === 'signin' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="auth-subtitle">
          {mode === 'signin'
            ? 'Sign in to track your progress'
            : 'Save your progress across all modules'}
        </p>

        <button className="auth-google-btn" onClick={handleGoogleClick} type="button">
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleEmailSubmit} className="auth-form">
          {mode === 'signup' && (
            <input
              className="auth-input"
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'signup' ? 8 : undefined}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {error && (
            <div className="auth-error">
              <CrossIcon size={14} color="#FF3B30" />
              {error}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting
              ? 'Please wait...'
              : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'signin' ? (
            <>No account? <button className="auth-toggle-link" onClick={() => setMode('signup')}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-toggle-link" onClick={() => setMode('signin')}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthModal
