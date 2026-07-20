import { Mic, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageWidth, useShell } from '../components/AppShell'
import { HymnList } from '../components/HymnList'
import { IconButton } from '../components/IconButton'
import { LoadingState } from '../components/LoadingState'
import { ScreenHeader } from '../components/ScreenHeader'
import { useCatalogue } from '../hooks/useCatalogue'
import { parseDirectNumber, queryHymns } from '../lib/catalogue'
import { enableOnDeviceRecognition, parseVoiceNumber, speechRecognitionConstructor, type SpeechRecognitionLike } from '../lib/voice'
import { useAppState } from '../state/AppStateContext'
import type { Language } from '../types'

export function CataloguePage({ favouritesOnly = false }: { favouritesOnly?: boolean }) {
  const params = useParams()
  const routeLanguage: Language = params.language === 'yo' ? 'yo' : 'en'
  const themeId = params.themeId ? Number.parseInt(params.themeId, 10) : 0
  const { catalogue, loading, error } = useCatalogue()
  const { state, setPreferences } = useAppState()
  const { notify } = useShell()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [numberInput, setNumberInput] = useState('')
  const [listening, setListening] = useState(false)
  const [voiceMode, setVoiceMode] = useState<'idle' | 'preparing' | 'offline' | 'online'>('idle')
  const recognition = useRef<SpeechRecognitionLike | null>(null)
  const voiceAvailable = typeof window !== 'undefined' && Boolean(speechRecognitionConstructor())
  const language = favouritesOnly ? undefined : routeLanguage

  useEffect(() => {
    if (language) setPreferences({ preferredLanguage: language })
    return () => recognition.current?.abort()
  }, [language, setPreferences])

  const favouriteIds = useMemo(() => new Set(state.favourites), [state.favourites])
  const hymns = useMemo(() => catalogue ? queryHymns(catalogue, { language, themeId, favouriteIds: favouritesOnly ? favouriteIds : undefined, query }) : [], [catalogue, favouriteIds, favouritesOnly, language, query, themeId])
  if (loading || error || !catalogue) return <LoadingState error={error} />

  const title = favouritesOnly ? 'FAVOURITES' : themeId ? `THEME ${themeId}` : `${routeLanguage === 'yo' ? 'YORUBA' : 'ENGLISH'} HYMNS`
  const subtitle = favouritesOnly ? 'Your saved English and Yoruba hymns' : themeId ? catalogue.themes.find((theme) => theme.themeId === themeId)?.name : '1,048 hymns'
  const readerQuery = favouritesOnly ? '?mode=favourites' : themeId ? `?mode=theme&theme=${themeId}` : '?mode=language'

  const openNumber = (event?: FormEvent) => {
    event?.preventDefault()
    const number = parseDirectNumber(numberInput)
    const targetLanguage = language ?? state.preferredLanguage
    const hymn = number ? catalogue.byLanguageAndNumber.get(`${targetLanguage}:${number}`) : null
    if (!hymn) { notify('Enter a hymn number from 1 to 1048.'); return }
    navigate(`/hymn/${hymn.stableId}?mode=language`)
  }

  const startVoice = async () => {
    const Constructor = speechRecognitionConstructor()
    if (!Constructor) return
    recognition.current?.abort()
    const instance = new Constructor()
    recognition.current = instance
    const onlineLanguage = (language ?? state.preferredLanguage) === 'yo' ? 'yo-NG' : 'en-NG'
    instance.lang = onlineLanguage
    instance.continuous = false
    instance.interimResults = false
    instance.maxAlternatives = 5
    instance.onresult = (event) => {
      for (let resultIndex = 0; resultIndex < event.results.length; resultIndex += 1) {
        const result = event.results[resultIndex]
        if (!result) continue
        for (let alternative = 0; alternative < result.length; alternative += 1) {
          const transcript = result[alternative]?.transcript
          const number = parseVoiceNumber(transcript)
          if (number) {
            setListening(false)
            const targetLanguage = language ?? state.preferredLanguage
            navigate(`/hymn/${targetLanguage}:${String(number).padStart(4, '0')}?mode=language`)
            return
          }
        }
      }
      setListening(false)
      notify('No hymn number was recognised. Type the number instead.')
    }
    instance.onerror = () => { setListening(false); notify(instance.processLocally ? 'Offline voice could not recognise that number. Type it instead.' : 'Voice search is unavailable. Type the hymn number instead.') }
    instance.onend = () => setListening(false)
    setListening(true)
    setVoiceMode('preparing')
    const localResult = await enableOnDeviceRecognition(Constructor, instance, 'en-US')
    if (recognition.current !== instance) return
    if (localResult === 'available' || localResult === 'installed') {
      setVoiceMode('offline')
      if (localResult === 'installed') notify('Offline voice pack installed. Listening now.')
    } else {
      instance.lang = onlineLanguage
      instance.processLocally = false
      setVoiceMode('online')
    }
    instance.start()
  }

  return (
    <div className="catalogue-page">
      <ScreenHeader title={favouritesOnly ? 'Favourites' : themeId ? `Theme ${themeId}` : routeLanguage === 'yo' ? 'Yoruba hymns' : 'English hymns'} back />
      <section className="catalogue-hero">
        <PageWidth>
          <span className="hero-badge">HYMN CATALOGUE</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </PageWidth>
      </section>
      <main className="catalogue-main">
        <PageWidth>
          <div className="search-card">
            <label htmlFor="catalogue-search">Search number, title, or lyrics</label>
            <div className="search-input-wrap"><Search aria-hidden="true" /><input id="catalogue-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={routeLanguage === 'yo' ? 'Search Yoruba hymns' : 'Search English hymns'} autoComplete="off" /></div>
            <form className="number-form" onSubmit={openNumber}>
              <label htmlFor="direct-number">Open hymn by number</label>
              <div><input id="direct-number" value={numberInput} onChange={(event) => setNumberInput(event.target.value)} inputMode="numeric" pattern="[0-9]*" placeholder="1–1048" /><button className="primary-button" type="submit">Open hymn</button>{voiceAvailable && <IconButton className={listening ? 'is-listening' : ''} aria-label={voiceMode === 'preparing' ? 'Preparing offline voice recognition' : listening ? 'Listening for hymn number' : 'Speak hymn number'} disabled={listening} onClick={startVoice}><Mic aria-hidden="true" /></IconButton>}</div>
              {voiceAvailable && <small>{voiceMode === 'offline' ? 'Offline voice recognition is active on this device.' : voiceMode === 'preparing' ? 'Checking or downloading the on-device voice pack…' : 'Uses offline voice when the browser supports it; otherwise a connection is required.'}</small>}
            </form>
          </div>
          <div className="list-summary" role="status"><strong>{hymns.length.toLocaleString()}</strong> {hymns.length === 1 ? 'hymn' : 'hymns'}</div>
          <HymnList hymns={hymns} readerQuery={readerQuery} />
        </PageWidth>
      </main>
    </div>
  )
}
