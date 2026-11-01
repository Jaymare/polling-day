import { useEffect, useState } from 'react'

// useState that survives a page reload. Storage can be unavailable (private
// windows, blocked site data), so every access is guarded.
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // not persisted; the in-memory state still works
    }
  }, [key, value])

  return [value, setValue] as const
}
