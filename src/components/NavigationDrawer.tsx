import { BookOpen, Download, Heart, Home, Info, Languages, MoonStar, Share2, Sun, X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppState } from '../state/AppStateContext'
import { IconButton } from './IconButton'

export function NavigationDrawer({ open, onClose, notify }: { open: boolean; onClose: () => void; notify: (message: string) => void }) {
  const panel = useRef<HTMLElement>(null)
  const { state, setPreferences } = useAppState()

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const focusable = () => [...(panel.current?.querySelectorAll<HTMLElement>('a,button:not([disabled])') ?? [])]
    focusable()[0]?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('drawer-open')
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.classList.remove('drawer-open')
      previous?.focus()
    }
  }, [open, onClose])

  const shareApp = async () => {
    const data = { title: 'G.F.M Hymn Book', text: 'English and Yoruba hymns for worship.', url: window.location.origin + import.meta.env.BASE_URL }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(data.url); notify('App link copied.') }
    } catch (error) {
      if ((error as DOMException).name !== 'AbortError') notify('Sharing is not available in this browser.')
    }
    onClose()
  }

  if (!open) return null
  const nextAppearance = state.appearance === 'dark' ? 'light' : 'dark'
  return (
    <div className="drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <aside ref={panel} className="drawer" role="dialog" aria-modal="true" aria-label="Application navigation">
        <div className="drawer__hero">
          <div>
            <strong>G.F.M Hymn Book</strong>
            <span>English and Yoruba</span>
          </div>
          <IconButton aria-label="Close navigation menu" onClick={onClose}><X aria-hidden="true" /></IconButton>
        </div>
        <nav aria-label="Main navigation">
          <NavLink to="/" onClick={onClose}><Home aria-hidden="true" /> Home</NavLink>
          <NavLink to="/catalogue/en" onClick={onClose}><BookOpen aria-hidden="true" /> English hymns</NavLink>
          <NavLink to="/catalogue/yo" onClick={onClose}><Languages aria-hidden="true" /> Yoruba hymns</NavLink>
          <NavLink to="/themes" onClick={onClose}><Download aria-hidden="true" /> Themes</NavLink>
          <NavLink to="/favourites" onClick={onClose}><Heart aria-hidden="true" /> Favourites</NavLink>
          <button type="button" onClick={() => setPreferences({ appearance: nextAppearance })}>
            {nextAppearance === 'dark' ? <MoonStar aria-hidden="true" /> : <Sun aria-hidden="true" />} {nextAppearance === 'dark' ? 'Dark appearance' : 'Light appearance'}
          </button>
          <button type="button" onClick={shareApp}><Share2 aria-hidden="true" /> Share</button>
          <NavLink to="/about" onClick={onClose}><Info aria-hidden="true" /> About and settings</NavLink>
        </nav>
      </aside>
    </div>
  )
}
