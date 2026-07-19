import { CheckCircle2, Download, Info, ShieldCheck, Smartphone, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { PageWidth, useShell } from '../components/AppShell'
import { LoadingState } from '../components/LoadingState'
import { ScreenHeader } from '../components/ScreenHeader'
import { useCatalogue } from '../hooks/useCatalogue'
import { exportSettings, importSettings } from '../lib/storage'
import { useAppState } from '../state/AppStateContext'

export function AboutPage() {
  const { catalogue, loading, error } = useCatalogue()
  const { state, replaceState } = useAppState()
  const { notify, offlineReady } = useShell()
  const fileInput = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState('')
  if (loading || error || !catalogue) return <LoadingState error={error} />

  const downloadSettings = () => {
    const blob = new Blob([exportSettings(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'gfm-hymnbook-settings-v1.json'
    link.click()
    URL.revokeObjectURL(url)
    notify('Settings export created.')
  }
  const readImport = async (file: File | undefined) => {
    if (!file) return
    try {
      if (file.size > 1_000_000) throw new Error('The settings file is too large.')
      const imported = importSettings(await file.text(), new Set(catalogue.byId.keys()))
      replaceState(imported)
      setFeedback(`Imported ${imported.favourites.length} favourite${imported.favourites.length === 1 ? '' : 's'} and reader settings.`)
    } catch (importError) {
      setFeedback(importError instanceof Error ? importError.message : 'The settings import failed.')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="standard-page">
      <ScreenHeader title="About and settings" back />
      <main>
        <PageWidth className="about-width">
          <section className="about-identity"><img src={`${import.meta.env.BASE_URL}images/gfm_logo.png`} width="112" height="112" alt="G.F.M logo" /><h1>G.F.M Hymn Book</h1><p>Progressive Web App · Data version {catalogue.version.dataVersion}</p></section>
          <section className="info-card"><Info aria-hidden="true" /><div><h2>Built for worship in English and Yoruba</h2><p>A complete catalogue of 2,096 documented hymn records with stable favourites, number/title/lyric search, themes, language switching and accessible reading controls.</p></div></section>
          <section className="info-card"><ShieldCheck aria-hidden="true" /><div><h2>Data integrity</h2><p>1,048 English and 1,048 Yoruba entries are preserved from the validated Android catalogue. English 600, Yoruba 303 and Yoruba 600 remain documented placeholders. No text was invented, translated, silently renumbered or globally OCR-replaced.</p><code title="Canonical catalogue SHA-256">{catalogue.version.catalogueSha256}</code></div></section>
          <section className="info-card"><CheckCircle2 aria-hidden="true" /><div><h2>{offlineReady ? 'Ready offline' : 'Offline setup in progress'}</h2><p>{offlineReady ? 'The application shell, both catalogues, themes and approved brand images are saved for offline use.' : 'Keep the app open online until the Home screen confirms offline readiness.'}</p></div></section>
          <section className="settings-card"><h2>Back up favourites and reading settings</h2><p>The catalogue itself is not stored in browser settings. Export creates a small, validated file containing favourites and preferences only.</p><div className="settings-actions"><button type="button" className="primary-button" onClick={downloadSettings}><Download aria-hidden="true" /> Export settings</button><button type="button" className="secondary-button" onClick={() => fileInput.current?.click()}><Upload aria-hidden="true" /> Import settings</button><input ref={fileInput} hidden type="file" accept="application/json,.json" onChange={(event) => readImport(event.target.files?.[0])} /></div>{feedback && <p className="import-feedback" role="status">{feedback}</p>}</section>
          <section className="install-card"><Smartphone aria-hidden="true" /><div><h2>Install on iPhone</h2><ol><li>Open this website in Safari.</li><li>Tap the Share button.</li><li>Tap <strong>Add to Home Screen</strong>.</li><li>Enable <strong>Open as Web App</strong> if shown.</li><li>Tap <strong>Add</strong>.</li></ol></div></section>
          <section className="limitations"><h2>Browser notes</h2><ul><li>Voice recognition is optional, varies by browser and may require a network connection.</li><li>iOS can remove website data when device storage is constrained; use settings export as a backup.</li><li>Audio is not included without authoritative tune mapping and redistribution permission.</li></ul></section>
        </PageWidth>
      </main>
    </div>
  )
}
