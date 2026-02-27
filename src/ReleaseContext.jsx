import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const ReleaseContext = createContext({ hiddenModules: new Set(), releaseLoading: false })

export function ReleaseProvider({ children }) {
  const [hiddenModules, setHiddenModules] = useState(new Set())
  const [releaseLoading, setReleaseLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setReleaseLoading(false)
      return
    }

    supabase
      .from('module_releases')
      .select('module_id')
      .eq('released', false)
      .then(({ data, error }) => {
        if (!error && data) {
          setHiddenModules(new Set(data.map(row => row.module_id)))
        }
        setReleaseLoading(false)
      })
  }, [])

  return (
    <ReleaseContext.Provider value={{ hiddenModules, releaseLoading }}>
      {children}
    </ReleaseContext.Provider>
  )
}

export const useRelease = () => useContext(ReleaseContext)
