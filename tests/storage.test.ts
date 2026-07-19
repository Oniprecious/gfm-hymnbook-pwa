import { describe, expect, it } from 'vitest'
import { DEFAULT_STATE, exportSettings, importSettings, readState, STORAGE_KEY, validateAppState, writeState } from '../src/lib/storage'

const validIds = new Set(['en:0001', 'yo:0001'])

describe('versioned local settings', () => {
  it('persists only favourites and small reader preferences', () => {
    const state = { ...DEFAULT_STATE, favourites: ['en:0001', 'yo:0001'], textSize: 22, lineSpacing: 1.5, lastOpenedHymn: 'en:0001' }
    writeState(state)
    expect(readState()).toEqual(state)
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('lyrics')
  })

  it('round-trips a validated export', () => {
    const state = { ...DEFAULT_STATE, favourites: ['en:0001'], preferredLanguage: 'yo' as const }
    const exported = exportSettings(state, new Date('2026-07-19T00:00:00.000Z'))
    expect(importSettings(exported, validIds)).toEqual(state)
  })

  it('rejects malformed, unknown, unsafe and out-of-range imports', () => {
    expect(() => importSettings('{bad json', validIds)).toThrow('not valid JSON')
    expect(() => importSettings(JSON.stringify({ schema: 'wrong', version: 1, exportedAt: '', payload: DEFAULT_STATE }), validIds)).toThrow('not a supported')
    expect(() => importSettings(JSON.stringify({ schema: 'gfm-hymnbook-pwa-settings', version: 1, exportedAt: '', payload: { ...DEFAULT_STATE, favourites: ['en:9999'] } }), validIds)).toThrow('invalid hymn identifiers')
    expect(() => validateAppState({ ...DEFAULT_STATE, textSize: 100 })).toThrow('between 14 and 36')
    expect(() => validateAppState({ ...DEFAULT_STATE, unexpected: true })).toThrow('unexpected fields')
  })

  it('recovers safely from damaged local storage', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json')
    expect(readState()).toEqual(DEFAULT_STATE)
  })
})
