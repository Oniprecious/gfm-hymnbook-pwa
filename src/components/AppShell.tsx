import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { NavigationDrawer } from './NavigationDrawer'
import { usePwa } from '../state/PwaContext'
import { useCatalogue } from '../hooks/useCatalogue'

interface ShellValue {
  openMenu: () => void
  notify: (message: string) => void
  offlineReady: boolean
}

const ShellContext = createContext<ShellValue | null>(null)

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('gfm-pwa:splash-seen'))
  const pwa = usePwa()
  const { catalogue } = useCatalogue()

  const notify = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3200)
  }, [])

  useEffect(() => {
    if (!showSplash) return
    sessionStorage.setItem('gfm-pwa:splash-seen', '1')
    const timer = window.setTimeout(() => setShowSplash(false), 1250)
    return () => window.clearTimeout(timer)
  }, [showSplash])

  const value = useMemo<ShellValue>(() => ({
    openMenu: () => setDrawerOpen(true),
    notify,
    offlineReady: Boolean(catalogue && pwa.serviceWorkerReady),
  }), [catalogue, notify, pwa.serviceWorkerReady])

  return (
    <ShellContext.Provider value={value}>
      {showSplash && (
        <div className="splash" role="status" aria-label="Opening G.F.M Hymn Book">
          <img src={`${import.meta.env.BASE_URL}images/splash_brand.png`} alt="G.F.M emblem and worship artwork" />
          <p>WORSHIP · WORD · FELLOWSHIP</p>
          <small>2,096 English &amp; Yoruba hymn records</small>
        </div>
      )}
      <NavigationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} notify={notify} />
      <Outlet />
      {pwa.needRefresh && (
        <div className="update-banner" role="status">
          <span>A new version is ready.</span>
          <button type="button" onClick={pwa.applyUpdate}>Update now</button>
          <button type="button" onClick={pwa.dismissUpdate}>Later</button>
        </div>
      )}
      <div className="toast" role="status" aria-live="polite">{toast}</div>
    </ShellContext.Provider>
  )
}

export function useShell(): ShellValue {
  const value = useContext(ShellContext)
  if (!value) throw new Error('useShell must be used inside AppShell')
  return value
}

export function PageWidth({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`page-width ${className}`.trim()}>{children}</div>
}
