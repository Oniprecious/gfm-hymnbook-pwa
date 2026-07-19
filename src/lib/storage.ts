import type { AppState, Appearance, Language, SettingsExport } from '../types'

export const STORAGE_KEY = 'gfm-pwa:state:v1'
export const SETTINGS_SCHEMA = 'gfm-hymnbook-pwa-settings'

export const DEFAULT_STATE: AppState = {
  favourites: [],
  appearance: 'system',
  textSize: 19,
  lineSpacing: 1.25,
  preferredLanguage: 'en',
  lastOpenedHymn: '',
}

const stableIdPattern = /^(en|yo):\d{4}$/
const appearances = new Set<Appearance>(['system', 'light', 'dark'])
const languages = new Set<Language>(['en', 'yo'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function validateAppState(value: unknown, validIds?: Set<string>): AppState {
  if (!isPlainObject(value)) throw new Error('Settings payload must be an object.')
  const allowed = new Set(['favourites', 'appearance', 'textSize', 'lineSpacing', 'preferredLanguage', 'lastOpenedHymn'])
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error('Settings contain unexpected fields.')
  if (!Array.isArray(value.favourites) || !value.favourites.every((id) => typeof id === 'string' && stableIdPattern.test(id) && (!validIds || validIds.has(id)))) throw new Error('Favourites contain invalid hymn identifiers.')
  if (!appearances.has(value.appearance as Appearance)) throw new Error('Appearance setting is invalid.')
  if (typeof value.textSize !== 'number' || !Number.isFinite(value.textSize) || value.textSize < 14 || value.textSize > 36) throw new Error('Text size must be between 14 and 36.')
  if (typeof value.lineSpacing !== 'number' || !Number.isFinite(value.lineSpacing) || value.lineSpacing < 1.1 || value.lineSpacing > 2) throw new Error('Line spacing must be between 1.1 and 2.')
  if (!languages.has(value.preferredLanguage as Language)) throw new Error('Preferred language is invalid.')
  if (typeof value.lastOpenedHymn !== 'string' || (value.lastOpenedHymn && (!stableIdPattern.test(value.lastOpenedHymn) || (validIds && !validIds.has(value.lastOpenedHymn))))) throw new Error('Last-opened hymn is invalid.')
  return {
    favourites: [...new Set(value.favourites as string[])],
    appearance: value.appearance as Appearance,
    textSize: value.textSize,
    lineSpacing: value.lineSpacing,
    preferredLanguage: value.preferredLanguage as Language,
    lastOpenedHymn: value.lastOpenedHymn,
  }
}

export function readState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? validateAppState(JSON.parse(raw)) : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

export function writeState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function exportSettings(state: AppState, now = new Date()): string {
  const bundle: SettingsExport = {
    schema: SETTINGS_SCHEMA,
    version: 1,
    exportedAt: now.toISOString(),
    payload: validateAppState(state),
  }
  return `${JSON.stringify(bundle, null, 2)}\n`
}

export function importSettings(raw: string, validIds: Set<string>): AppState {
  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch {
    throw new Error('The selected file is not valid JSON.')
  }
  if (!isPlainObject(value) || value.schema !== SETTINGS_SCHEMA || value.version !== 1 || typeof value.exportedAt !== 'string') throw new Error('This is not a supported G.F.M settings export.')
  const allowed = new Set(['schema', 'version', 'exportedAt', 'payload'])
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new Error('The import contains unexpected fields.')
  return validateAppState(value.payload, validIds)
}
