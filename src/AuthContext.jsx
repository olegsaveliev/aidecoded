import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from './supabase'
import ALL_MODULES from './moduleData'
import { useRelease } from './ReleaseContext'

const AuthContext = createContext({})

const FREE_MODULES = ['playground', 'tokenizer', 'generation']
const VALID_MODULE_IDS = new Set(ALL_MODULES.map(m => m.id))

// Inject localStorage display_name into user object (synchronous fallback while DB loads)
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

// Fetch display name from profiles table (OAuth-proof, works across devices)
async function fetchProfileName(userId) {
  if (!supabase) return null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()
    return data?.full_name || null
  } catch { return null }
}

// Fetch DB display name and merge into user state (guards against stale updates)
async function syncProfileName(userId, setUser) {
  const dbName = await fetchProfileName(userId)
  if (dbName) {
    try { localStorage.setItem(`display_name_${userId}`, dbName) } catch {}
    setUser(prev => {
      if (!prev || prev.id !== userId) return prev
      return { ...prev, user_metadata: { ...prev.user_metadata, display_name: dbName } }
    })
  }
}

// ReleaseProvider must wrap AuthProvider in the component tree (see main.jsx)
export const AuthProvider = ({ children }) => {
  const { hiddenModules } = useRelease()
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
      const enriched = enrichUser(session?.user) ?? null
      setUser(enriched)
      if (session?.user) {
        fetchProgress(session.user.id)
        loadStartedModules(session.user.id)
        syncProfileName(session.user.id, setUser)
      }
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        const enriched = enrichUser(session?.user) ?? null
        setUser(enriched)
        if (session?.user) {
          fetchProgress(session.user.id)
          loadStartedModules(session.user.id)
          syncProfileName(session.user.id, setUser)
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

  // Track activity dates — recorded when user accesses any module
  const [visitDates, setVisitDates] = useState([])

  useEffect(() => {
    if (!user?.id) return
    try {
      const raw = JSON.parse(localStorage.getItem(`visits_${user.id}`) || '[]')
      setVisitDates(Array.isArray(raw) ? raw : [])
    } catch { setVisitDates([]) }
  }, [user?.id])

  const recordVisitDate = () => {
    if (!user?.id) return
    const key = `visits_${user.id}`
    const today = new Date().toISOString().slice(0, 10)
    try {
      const raw = JSON.parse(localStorage.getItem(key) || '[]')
      const saved = Array.isArray(raw) ? raw : []
      if (saved.includes(today)) return
      saved.push(today)
      const cutoff = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10)
      const trimmed = saved.filter(d => d >= cutoff)
      localStorage.setItem(key, JSON.stringify(trimmed))
      setVisitDates(trimmed)
    } catch {}
  }

  const markModuleStarted = (moduleId) => {
    if (!user) return
    recordVisitDate()
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

  const completedCount = useMemo(() =>
    progress.filter(p => VALID_MODULE_IDS.has(p.module_id) && !hiddenModules.has(p.module_id)).length,
    [progress, hiddenModules]
  )

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
    // 1. Persist to profiles table (server-side, OAuth-proof)
    if (supabase) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, full_name: name })
      if (error) return { error }
    }
    // 2. Cache in localStorage (instant on next page load)
    try { localStorage.setItem(`display_name_${user.id}`, name) } catch {}
    // 3. Update React state (immediate UI)
    setUser(prev => prev ? { ...prev, user_metadata: { ...prev.user_metadata, display_name: name } } : prev)
    return { error: null }
  }

  const signOut = async () => {
    if (!supabase) return
    // Clear state first, before async signOut that might fail
    setUser(null)
    setProgress([])
    setQuizResults([])
    setStartedModules([])
    setVisitDates([])
    try { await supabase.auth.signOut() } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{
      user, loading, progress, quizResults, startedModules, visitDates,
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
