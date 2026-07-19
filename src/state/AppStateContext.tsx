import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { readState, writeState } from '../lib/storage'
import type { AppState } from '../types'

interface AppStateValue {
  state: AppState
  setPreferences: (patch: Partial<AppState>) => void
  replaceState: (state: AppState) => void
  toggleFavourite: (stableId: string) => boolean
  isFavourite: (stableId: string) => boolean
}

const Context = createContext<AppStateValue | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => readState())

  useEffect(() => {
    writeState(state)
    if (state.appearance === 'system') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = state.appearance
  }, [state])

  const setPreferences = useCallback((patch: Partial<AppState>) => setState((current) => ({ ...current, ...patch })), [])
  const replaceState = useCallback((replacement: AppState) => setState(replacement), [])
  const toggleFavourite = useCallback((stableId: string) => {
    const added = !state.favourites.includes(stableId)
    setState((current) => ({ ...current, favourites: added ? [...current.favourites, stableId] : current.favourites.filter((id) => id !== stableId) }))
    return added
  }, [state.favourites])
  const isFavourite = useCallback((stableId: string) => state.favourites.includes(stableId), [state.favourites])

  const value = useMemo<AppStateValue>(() => ({ state, setPreferences, replaceState, toggleFavourite, isFavourite }), [isFavourite, replaceState, setPreferences, state, toggleFavourite])

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useAppState(): AppStateValue {
  const value = useContext(Context)
  if (!value) throw new Error('useAppState must be used inside AppStateProvider')
  return value
}
