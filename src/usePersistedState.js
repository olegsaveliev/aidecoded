import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext.jsx'

const STORAGE_KEY = 'module_stages'

function getAll() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

/**
 * Persists a value to sessionStorage for logged-in users.
 * On refresh, logged-in users resume where they left off.
 * Non-logged-in users always start fresh (default value).
 * Cleanup is handled centrally by App.jsx on sign-out.
 *
 * @param {string} key - e.g. 'model-training' or 'generation-entry'
 * @param {*} defaultValue - initial value when no saved state (-1, true, etc.)
 * @returns {[*, Function]} - [value, setValue] like useState
 */
export default function usePersistedState(key, defaultValue) {
  const { user } = useAuth()
  const prevUserRef = useRef(user)

  // Read from sessionStorage on mount — module_stages exists only for logged-in sessions
  // (cleared on sign-out in App.jsx), so its presence implies a valid session being restored
  const [value, setValue] = useState(() => {
    const all = getAll()
    return all[key] !== undefined ? all[key] : defaultValue
  })

  useEffect(() => {
    if (user) {
      const all = getAll()
      all[key] = value
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    }
  }, [user, key, value])

  // Reset to default on sign-out (user transitions from truthy → null)
  useEffect(() => {
    if (prevUserRef.current && !user) {
      setValue(defaultValue)
    }
    prevUserRef.current = user
  }, [user, defaultValue])

  return [value, setValue]
}
