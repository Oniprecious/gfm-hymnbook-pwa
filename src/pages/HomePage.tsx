import { BookOpen, CheckCircle2, CloudOff, Heart, Languages, Palette, Wifi } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalogue } from '../hooks/useCatalogue'
import { useAppState } from '../state/AppStateContext'
import { usePwa } from '../state/PwaContext'
import { LoadingState } from '../components/LoadingState'
import { ScreenHeader } from '../components/ScreenHeader'
import { PageWidth, useShell } from '../components/AppShell'

export function HomePage() {
  const { catalogue, loading, error } = useCatalogue()
  const { state } = useAppState()
  const { openMenu, offlineReady } = useShell()
  const { online } = usePwa()
  if (loading || error || !catalogue) return <LoadingState error={error} />
  const last = state.lastOpenedHymn ? catalogue.byId.get(state.lastOpenedHymn) : null
  return (
    <div className="home-page">
      <ScreenHeader title="G.F.M Hymns" subtitle="ENGLISH / YORUBA" onMenu={openMenu} />
      <main className="home-main">
        <PageWidth>
          <section className="home-intro">
            <p className="eyebrow">GRACIOUS FIRE MINISTRY INT’L</p>
            <h1>A hymn book for every moment of worship</h1>
            <p>Choose a language to browse all 1,048 numbered hymns.</p>
          </section>
          <div className="language-cards">
            <Link className="language-card" to="/catalogue/en" onClick={() => undefined}>
              <span><strong>HYMNS IN ENGLISH</strong><small>1,048 hymns</small></span>
            </Link>
            <Link className="language-card" to="/catalogue/yo">
              <span><strong>HYMNS IN YORUBA</strong><small>1,048 hymns</small></span>
            </Link>
          </div>
          {last && <Link className="continue-card" to={`/hymn/${last.stableId}`}><BookOpen aria-hidden="true" /><span><small>CONTINUE READING</small><strong>Hymn {last.hymnNumber} · {last.language === 'en' ? 'English' : 'Yoruba'}</strong></span></Link>}
          <div className="home-shortcuts" aria-label="Quick links">
            <Link to="/themes"><Palette aria-hidden="true" /><span>Themes</span></Link>
            <Link to="/favourites"><Heart aria-hidden="true" /><span>Favourites</span></Link>
            <Link to="/about"><Languages aria-hidden="true" /><span>Install &amp; settings</span></Link>
          </div>
          <div className={`cache-status ${offlineReady ? 'cache-status--ready' : ''}`} role="status">
            {offlineReady ? <CheckCircle2 aria-hidden="true" /> : online ? <Wifi aria-hidden="true" /> : <CloudOff aria-hidden="true" />}
            <span><strong>{offlineReady ? 'Ready for offline worship' : online ? 'Preparing offline access' : 'Offline setup incomplete'}</strong><small>{offlineReady ? 'Both catalogues and the reading experience are cached on this device.' : online ? 'Keep this page open until setup is confirmed.' : 'Reconnect once to finish saving the hymn book.'}</small></span>
          </div>
          <p className="data-footnote">Catalogue verified · {catalogue.version.recordCount.toLocaleString()} documented records</p>
        </PageWidth>
      </main>
    </div>
  )
}
