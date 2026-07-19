import { Languages, Palette } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageWidth } from '../components/AppShell'
import { LoadingState } from '../components/LoadingState'
import { ScreenHeader } from '../components/ScreenHeader'
import { useCatalogue } from '../hooks/useCatalogue'

export function ThemesPage() {
  const { catalogue, loading, error } = useCatalogue()
  if (loading || error || !catalogue) return <LoadingState error={error} />
  return (
    <div className="standard-page">
      <ScreenHeader title="Themes" back />
      <main>
        <PageWidth>
          <section className="page-intro"><span className="section-icon"><Palette aria-hidden="true" /></span><div><p className="eyebrow">36 WORSHIP THEMES</p><h1>Browse by theme</h1><p>Choose a theme, then open its English or Yoruba collection.</p></div></section>
          <div className="theme-grid">
            {catalogue.themes.map((theme) => (
              <article className="theme-card" key={theme.themeId}>
                <span className="number-badge">{String(theme.themeId).padStart(2, '0')}</span>
                <div><strong>{theme.name}</strong><span><Languages aria-hidden="true" /> Select language</span></div>
                <div className="theme-card__actions"><Link to={`/themes/${theme.themeId}/en`}>English</Link><Link to={`/themes/${theme.themeId}/yo`}>Yoruba</Link></div>
              </article>
            ))}
          </div>
        </PageWidth>
      </main>
    </div>
  )
}
