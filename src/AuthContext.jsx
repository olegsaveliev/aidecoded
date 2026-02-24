import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext({})

const FREE_MODULES = ['playground', 'tokenizer', 'generation']

// Inject localStorage display_name into user object (survives OAuth overwrites)
function enrichUser(user) {
  if (!user) return null
  try {
    const saved = localStorage.getItem(`display_name_${user.id}`)
    if (saved) {
      return { ...user, user_metadata: { ...user.user_metadata, display_name: saved } }
    }
  } catch { /* ignore */ }
  return user
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [startedModules, setStartedModules] = useState([])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(enrichUser(session?.user) ?? null)
      if (session?.user) {
        fetchProgress(session.user.id)
        loadStartedModules(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(enrichUser(session?.user) ?? null)
        if (session?.user) {
          fetchProgress(session.user.id)
          loadStartedModules(session.user.id)
        } else {
          setProgress([])
          setQuizResults([])
          setStartedModules([])
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProgress = async (userId) => {
    if (!supabase) return
    const [{ data: prog }, { data: quiz }] = await Promise.all([
      supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
    ])
    setProgress(prog || [])
    setQuizResults(quiz || [])
  }

  const markModuleComplete = async (moduleId) => {
    if (!supabase || !user) return
    const existing = progress.some(p => p.module_id === moduleId)
    if (existing) return
    await supabase
      .from('progress')
      .upsert({ user_id: user.id, module_id: moduleId })
    await fetchProgress(user.id)
  }

  const saveQuizResult = async (moduleId, score, maxScore) => {
    if (!supabase || !user) return
    await supabase
      .from('quiz_results')
      .insert({
        user_id: user.id,
        module_id: moduleId,
        score,
        max_score: maxScore
      })
    await fetchProgress(user.id)
  }

  const loadStartedModules = (userId) => {
    try {
      const saved = localStorage.getItem(`started_${userId}`)
      setStartedModules(saved ? JSON.parse(saved) : [])
    } catch { setStartedModules([]) }
  }

  const markModuleStarted = (moduleId) => {
    if (!user) return
    setStartedModules(prev => {
      if (prev.includes(moduleId)) return prev
      const next = [...prev, moduleId]
      localStorage.setItem(`started_${user.id}`, JSON.stringify(next))
      return next
    })
  }

  const isModuleStarted = (moduleId) =>
    startedModules.includes(moduleId) && !progress.some(p => p.module_id === moduleId)

  const isModuleComplete = (moduleId) =>
    progress.some(p => p.module_id === moduleId)

  const isModuleLocked = (moduleId) =>
    !FREE_MODULES.includes(moduleId) && !user

  const getQuizResult = (moduleId) =>
    quizResults
      .filter(q => q.module_id === moduleId)
      .sort((a, b) => b.score - a.score)[0]

  const completedCount = progress.length

  const signInWithGoogle = () => {
    if (!supabase) return
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const signInWithEmail = (email, password) => {
    if (!supabase) return Promise.resolve({ error: { message: 'Supabase not configured' } })
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signUpWithEmail = (email, password, fullName) => {
    if (!supabase) return Promise.resolve({ error: { message: 'Supabase not configured' } })
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
  }

  const updateDisplayName = async (name) => {
    if (!user) return { error: { message: 'Not authenticated' } }
    try {
      localStorage.setItem(`display_name_${user.id}`, name)
    } catch { /* quota exceeded — still update React state */ }
    setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, display_name: name } } : prev)
    return { error: null }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setProgress([])
    setQuizResults([])
  }

  return (
    <AuthContext.Provider value={{
      user, loading, progress, quizResults, startedModules,
      markModuleStarted, markModuleComplete, saveQuizResult,
      isModuleStarted, isModuleComplete, isModuleLocked, getQuizResult,
      completedCount, updateDisplayName,
      signInWithGoogle, signInWithEmail,
      signUpWithEmail, signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { FREE_MODULES }
