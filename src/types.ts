export type Language = 'en' | 'yo'
export type Availability = 'AVAILABLE' | 'NEEDS_REVIEW' | 'MISSING_TEXT'
export type Appearance = 'system' | 'light' | 'dark'

export interface Hymn {
  stableId: string
  hymnNumber: number
  language: Language
  title: string
  lyrics: string
  themeId: number
  counterpartNumber: number
  availability: Availability
  dataVersion: number
  legacyRecordIndex: number
  legacyEid: string
  legacyYid: string
  reviewFlags: string[]
  legacyLyricsSha256: string
}

export interface Theme {
  themeId: number
  name: string
}

export interface DataVersion {
  schemaVersion: number
  dataVersion: number
  catalogueSha256: string
  themesSha256: string
  recordCount: number
  languageCounts: Record<Language, number>
  availabilityCounts: Record<Availability, number>
  themeCount: number
  yorubaUnicodeRecords: number
}

export interface Catalogue {
  hymns: Hymn[]
  themes: Theme[]
  version: DataVersion
  byId: Map<string, Hymn>
  byLanguageAndNumber: Map<string, Hymn>
}

export interface AppState {
  favourites: string[]
  appearance: Appearance
  textSize: number
  lineSpacing: number
  preferredLanguage: Language
  lastOpenedHymn: string
}

export interface SettingsExport {
  schema: 'gfm-hymnbook-pwa-settings'
  version: 1
  exportedAt: string
  payload: AppState
}
