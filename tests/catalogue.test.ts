import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { normalizeSearch, parseDirectNumber, queryHymns, stableId } from '../src/lib/catalogue'
import type { Catalogue, DataVersion, Hymn, Theme } from '../src/types'

const hymns = JSON.parse(readFileSync(resolve('public/data/hymns.json'), 'utf8')) as Hymn[]
const themes = JSON.parse(readFileSync(resolve('public/data/themes.json'), 'utf8')) as Theme[]
const version = JSON.parse(readFileSync(resolve('public/data/version.json'), 'utf8')) as DataVersion
const catalogue: Catalogue = {
  hymns,
  themes,
  version,
  byId: new Map(hymns.map((hymn) => [hymn.stableId, hymn])),
  byLanguageAndNumber: new Map(hymns.map((hymn) => [`${hymn.language}:${hymn.hymnNumber}`, hymn])),
}

describe('canonical catalogue', () => {
  it('preserves exact language counts, stable IDs and placeholders', () => {
    expect(hymns).toHaveLength(2096)
    expect(hymns.filter((hymn) => hymn.language === 'en')).toHaveLength(1048)
    expect(hymns.filter((hymn) => hymn.language === 'yo')).toHaveLength(1048)
    expect(new Set(hymns.map((hymn) => hymn.stableId))).toHaveLength(2096)
    expect(catalogue.byId.get('en:0600')?.availability).toBe('MISSING_TEXT')
    expect(catalogue.byId.get('yo:0303')?.availability).toBe('MISSING_TEXT')
    expect(catalogue.byId.get('yo:0600')?.availability).toBe('MISSING_TEXT')
  })

  it('maps every English and Yoruba counterpart to an existing stable record', () => {
    for (const hymn of hymns) {
      const counterpartLanguage = hymn.language === 'en' ? 'yo' : 'en'
      expect(catalogue.byId.has(stableId(counterpartLanguage, hymn.counterpartNumber))).toBe(true)
    }
  })

  it('searches number, title, lyrics and normalized Yoruba text without altering data', () => {
    expect(queryHymns(catalogue, { language: 'en', query: '600' }).map((hymn) => hymn.stableId)).toContain('en:0600')
    expect(queryHymns(catalogue, { language: 'en', query: 'Jesus you are so good' }).map((hymn) => hymn.stableId)).toContain('en:0001')
    expect(queryHymns(catalogue, { language: 'en', query: 'Abba father' }).map((hymn) => hymn.stableId)).toContain('en:0001')
    expect(normalizeSearch(' F’ÍBÙKÚN — F’OLÚWA ')).toBe(normalizeSearch('f’íbùkún f’olúwa'))
  })

  it('accepts only direct hymn numbers in range', () => {
    expect(parseDirectNumber('1048')).toBe(1048)
    expect(parseDirectNumber('0')).toBeNull()
    expect(parseDirectNumber('1049')).toBeNull()
    expect(parseDirectNumber('hymn 12')).toBeNull()
  })
})
