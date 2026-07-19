import type { Catalogue, Hymn, Language, Theme, DataVersion } from '../types'

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`

export function normalizeSearch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

export function cleanTitle(title: string): string {
  return title.replace(/^\s*\d+\s*[.):-]?\s*/, '').trim()
}

export function stableId(language: Language, number: number): string {
  return `${language}:${String(number).padStart(4, '0')}`
}

export function parseDirectNumber(value: string): number | null {
  if (!/^\s*\d{1,4}\s*$/.test(value)) return null
  const number = Number.parseInt(value, 10)
  return number >= 1 && number <= 1048 ? number : null
}

function validateRuntime(hymns: Hymn[], themes: Theme[], version: DataVersion): void {
  if (!Array.isArray(hymns) || hymns.length !== 2096) throw new Error('The hymn catalogue record count is invalid.')
  if (!Array.isArray(themes) || themes.length !== 36) throw new Error('The theme catalogue is invalid.')
  if (version.recordCount !== hymns.length || version.themeCount !== themes.length) throw new Error('The catalogue version metadata does not match the data.')
  const ids = new Set<string>()
  for (const hymn of hymns) {
    if (hymn.stableId !== stableId(hymn.language, hymn.hymnNumber) || ids.has(hymn.stableId)) throw new Error(`Invalid hymn identifier: ${hymn.stableId}`)
    if (!hymn.title.trim() || (!hymn.lyrics.trim() && hymn.availability !== 'MISSING_TEXT')) throw new Error(`Invalid hymn record: ${hymn.stableId}`)
    ids.add(hymn.stableId)
  }
  for (const required of ['en:0600', 'yo:0303', 'yo:0600']) {
    const hymn = hymns.find((item) => item.stableId === required)
    if (hymn?.availability !== 'MISSING_TEXT') throw new Error(`Required placeholder is missing: ${required}`)
  }
}

export async function loadCatalogue(signal?: AbortSignal): Promise<Catalogue> {
  const [hymnsResponse, themesResponse, versionResponse] = await Promise.all([
    fetch(assetUrl('data/hymns.json'), { signal }),
    fetch(assetUrl('data/themes.json'), { signal }),
    fetch(assetUrl('data/version.json'), { signal }),
  ])
  if (!hymnsResponse.ok || !themesResponse.ok || !versionResponse.ok) throw new Error('The hymn catalogue could not be loaded.')
  const [hymns, themes, version] = await Promise.all([
    hymnsResponse.json() as Promise<Hymn[]>,
    themesResponse.json() as Promise<Theme[]>,
    versionResponse.json() as Promise<DataVersion>,
  ])
  validateRuntime(hymns, themes, version)
  return {
    hymns,
    themes,
    version,
    byId: new Map(hymns.map((hymn) => [hymn.stableId, hymn])),
    byLanguageAndNumber: new Map(hymns.map((hymn) => [`${hymn.language}:${hymn.hymnNumber}`, hymn])),
  }
}

export function queryHymns(
  catalogue: Catalogue,
  options: { language?: Language; themeId?: number; favouriteIds?: Set<string>; query?: string },
): Hymn[] {
  const normalized = normalizeSearch(options.query ?? '')
  const number = parseDirectNumber(options.query ?? '')
  return catalogue.hymns.filter((hymn) => {
    if (options.language && hymn.language !== options.language) return false
    if (options.themeId && hymn.themeId !== options.themeId) return false
    if (options.favouriteIds && !options.favouriteIds.has(hymn.stableId)) return false
    if (!normalized) return true
    return hymn.hymnNumber === number || normalizeSearch(hymn.title).includes(normalized) || normalizeSearch(hymn.lyrics).includes(normalized)
  })
}
