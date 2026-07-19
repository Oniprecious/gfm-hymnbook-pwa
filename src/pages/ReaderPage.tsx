import { Heart, Home, Languages, Share2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { PageWidth, useShell } from '../components/AppShell'
import { IconButton } from '../components/IconButton'
import { LoadingState } from '../components/LoadingState'
import { ScreenHeader } from '../components/ScreenHeader'
import { useCatalogue } from '../hooks/useCatalogue'
import { cleanTitle, queryHymns } from '../lib/catalogue'
import { useAppState } from '../state/AppStateContext'

export function ReaderPage() {
  const { stableId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { catalogue, loading, error } = useCatalogue()
  const { state, setPreferences, isFavourite, toggleFavourite } = useAppState()
  const { notify } = useShell()
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const mode = searchParams.get('mode') ?? 'language'
  const themeId = Number.parseInt(searchParams.get('theme') ?? '0', 10) || 0
  const hymn = catalogue?.byId.get(stableId)

  const sequence = useMemo(() => {
    if (!catalogue || !hymn) return []
    if (mode === 'favourites') return queryHymns(catalogue, { favouriteIds: new Set(state.favourites) })
    if (mode === 'theme') return queryHymns(catalogue, { language: hymn.language, themeId })
    return queryHymns(catalogue, { language: hymn.language })
  }, [catalogue, hymn, mode, state.favourites, themeId])
  const index = hymn ? sequence.findIndex((item) => item.stableId === hymn.stableId) : -1
  const routeSuffix = mode === 'theme' ? `?mode=theme&theme=${themeId}` : mode === 'favourites' ? '?mode=favourites' : '?mode=language'

  const move = useCallback((offset: number) => {
    const target = sequence[index + offset]
    if (target) navigate(`/hymn/${target.stableId}${routeSuffix}`)
  }, [index, navigate, routeSuffix, sequence])

  useEffect(() => {
    if (hymn) {
      setPreferences({ lastOpenedHymn: hymn.stableId, preferredLanguage: hymn.language })
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [hymn, setPreferences])

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).matches('input,textarea,button')) return
      if (event.key === 'ArrowLeft') move(-1)
      if (event.key === 'ArrowRight') move(1)
    }
    window.addEventListener('keydown', keydown)
    return () => window.removeEventListener('keydown', keydown)
  }, [move])

  if (loading || error || !catalogue) return <LoadingState error={error} />
  if (!hymn) return <LoadingState error="That hymn could not be found." />

  const favourite = isFavourite(hymn.stableId)
  const counterpartLanguage = hymn.language === 'en' ? 'yo' : 'en'
  const counterpart = catalogue.byLanguageAndNumber.get(`${counterpartLanguage}:${hymn.counterpartNumber}`)
  const switchLanguage = () => {
    if (!counterpart || counterpart.availability === 'MISSING_TEXT') { notify('The corresponding hymn text is not yet available.'); return }
    navigate(`/hymn/${counterpart.stableId}${routeSuffix}`)
  }
  const share = async () => {
    const body = hymn.availability === 'MISSING_TEXT' ? 'Hymn text not yet available.' : hymn.lyrics
    const text = `${hymn.title}\n\n${body}`
    try {
      if (navigator.share) await navigator.share({ title: hymn.title, text })
      else { await navigator.clipboard.writeText(text); notify('Hymn text copied.') }
    } catch (shareError) {
      if ((shareError as DOMException).name !== 'AbortError') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `gfm-hymn-${hymn.language}-${hymn.hymnNumber}.txt`
        link.click()
        URL.revokeObjectURL(url)
        notify('Hymn text downloaded.')
      }
    }
  }
  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current
    const end = event.changedTouches[0]
    touchStart.current = null
    if (!start || !end) return
    const horizontal = end.clientX - start.x
    const vertical = end.clientY - start.y
    if (Math.abs(horizontal) >= 70 && Math.abs(horizontal) >= Math.abs(vertical) * 1.25) move(horizontal < 0 ? 1 : -1)
  }

  return (
    <div className="reader-page">
      <ScreenHeader title={`Hymn ${hymn.hymnNumber}`} back actions={<><IconButton aria-label="Share hymn" onClick={share}><Share2 aria-hidden="true" /></IconButton><IconButton className={favourite ? 'is-favourite' : ''} aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'} onClick={() => notify(toggleFavourite(hymn.stableId) ? 'Added to favourites.' : 'Removed from favourites.')}><Heart aria-hidden="true" fill={favourite ? 'currentColor' : 'none'} /></IconButton></>} />
      <div className="reader-controls" aria-label="Reading controls">
        <span>READING CONTROLS</span>
        <button type="button" aria-label="Decrease text size" onClick={() => setPreferences({ textSize: Math.max(14, state.textSize - 1) })}>A−</button>
        <button type="button" aria-label="Increase text size" onClick={() => setPreferences({ textSize: Math.min(36, state.textSize + 1) })}>A+</button>
        <button type="button" onClick={() => setPreferences({ lineSpacing: state.lineSpacing < 1.35 ? 1.5 : state.lineSpacing < 1.65 ? 1.8 : 1.2 })}>Spacing</button>
      </div>
      <main className="reader-main" onTouchStart={(event) => { const touch = event.touches[0]; if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY } }} onTouchEnd={onTouchEnd}>
        <PageWidth className="reader-width">
          <h1>{cleanTitle(hymn.title)}</h1>
          <div className="gold-rule" />
          {hymn.availability === 'MISSING_TEXT' && <div className="notice"><strong>Hymn text not yet available</strong><span>This numbered placeholder is intentionally preserved until authoritative text is supplied.</span></div>}
          {hymn.availability === 'NEEDS_REVIEW' && <div className="notice"><strong>Legacy text · review pending</strong><span>This text is preserved from the legacy catalogue and awaits authoritative-edition review.</span></div>}
          <div className="lyrics" style={{ fontSize: `${state.textSize}px`, lineHeight: state.lineSpacing }}>{hymn.availability === 'MISSING_TEXT' ? 'Hymn text not yet available.' : hymn.lyrics}</div>
        </PageWidth>
      </main>
      <div className="reader-quick-actions" aria-label="Hymn actions"><button type="button" onClick={switchLanguage}><Languages aria-hidden="true" /> {counterpartLanguage === 'yo' ? 'Yoruba' : 'English'}</button><Link to="/"><Home aria-hidden="true" /> Home</Link></div>
      <nav className="reader-navigation" aria-label="Hymn navigation"><button type="button" disabled={index <= 0} onClick={() => move(-1)}>Previous</button><button type="button" disabled={index < 0 || index >= sequence.length - 1} onClick={() => move(1)}>Next</button></nav>
    </div>
  )
}
