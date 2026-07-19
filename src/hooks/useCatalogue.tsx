import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { loadCatalogue } from '../lib/catalogue'
import type { Catalogue } from '../types'

interface CatalogueState {
  catalogue: Catalogue | null
  loading: boolean
  error: string
}

const CatalogueContext = createContext<CatalogueState>({ catalogue: null, loading: true, error: '' })

export function CatalogueProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogueState>({ catalogue: null, loading: true, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    loadCatalogue(controller.signal).then(
      (catalogue) => setState({ catalogue, loading: false, error: '' }),
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ catalogue: null, loading: false, error: error instanceof Error ? error.message : 'The catalogue could not be loaded.' })
      },
    )
    return () => controller.abort()
  }, [])
  const value = useMemo(() => state, [state])
  return <CatalogueContext.Provider value={value}>{children}</CatalogueContext.Provider>
}

export function useCatalogue(): CatalogueState {
  return useContext(CatalogueContext)
}
