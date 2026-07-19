import { createContext, useContext, type ReactNode } from 'react'
import { usePwaStatus } from '../hooks/usePwaStatus'

type PwaState = ReturnType<typeof usePwaStatus>
const Context = createContext<PwaState | null>(null)

export function PwaProvider({ children }: { children: ReactNode }) {
  const value = usePwaStatus()
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function usePwa(): PwaState {
  const value = useContext(Context)
  if (!value) throw new Error('usePwa must be used inside PwaProvider')
  return value
}
