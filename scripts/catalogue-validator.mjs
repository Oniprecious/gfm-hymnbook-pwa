import { createHash } from 'node:crypto'

export const EXPECTED_MISSING = [
  'en:0062', 'en:0275', 'en:0276', 'en:0277', 'en:0278', 'en:0600',
  'yo:0157', 'yo:0287', 'yo:0303', 'yo:0545', 'yo:0586', 'yo:0600',
  'yo:0821', 'yo:0878',
]

const REQUIRED_FIELDS = [
  'stableId', 'hymnNumber', 'language', 'title', 'lyrics', 'themeId',
  'counterpartNumber', 'availability', 'dataVersion', 'legacyRecordIndex',
  'legacyEid', 'legacyYid', 'reviewFlags', 'legacyLyricsSha256',
]

const AVAILABILITY = new Set(['AVAILABLE', 'NEEDS_REVIEW', 'MISSING_TEXT'])

function invariant(condition, message) {
  if (!condition) throw new Error(message)
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex')
}

export function validateCatalogue(hymns, themes) {
  invariant(Array.isArray(hymns), 'Catalogue must be an array')
  invariant(Array.isArray(themes), 'Theme catalogue must be an array')
  invariant(hymns.length === 2096, `Expected 2,096 hymns, found ${hymns.length}`)
  invariant(themes.length === 36, `Expected 36 themes, found ${themes.length}`)

  const themeIds = new Set()
  for (const theme of themes) {
    invariant(Number.isInteger(theme.themeId) && theme.themeId >= 1 && theme.themeId <= 36, `Invalid theme ID ${theme.themeId}`)
    invariant(typeof theme.name === 'string' && theme.name.trim().length > 0, `Empty theme name ${theme.themeId}`)
    invariant(!themeIds.has(theme.themeId), `Duplicate theme ID ${theme.themeId}`)
    themeIds.add(theme.themeId)
  }
  invariant([...Array(36)].every((_, index) => themeIds.has(index + 1)), 'Theme IDs must cover 1 through 36')
  invariant(themes.some((theme) => theme.themeId === 30), 'Theme 30 is missing')

  const ids = new Set()
  const byId = new Map()
  const counts = { en: 0, yo: 0 }
  const availabilityCounts = { AVAILABLE: 0, NEEDS_REVIEW: 0, MISSING_TEXT: 0 }
  const numbers = { en: new Set(), yo: new Set() }
  const lyricGroups = new Map()
  let yorubaUnicodeRecords = 0

  for (const hymn of hymns) {
    for (const field of REQUIRED_FIELDS) invariant(Object.hasOwn(hymn, field), `Missing ${field} on ${hymn.stableId ?? 'unknown record'}`)
    invariant(hymn.language === 'en' || hymn.language === 'yo', `Invalid language ${hymn.language}`)
    invariant(Number.isInteger(hymn.hymnNumber) && hymn.hymnNumber >= 1 && hymn.hymnNumber <= 1048, `Invalid number on ${hymn.stableId}`)
    const expectedId = `${hymn.language}:${String(hymn.hymnNumber).padStart(4, '0')}`
    invariant(hymn.stableId === expectedId, `Broken stable ID ${hymn.stableId}; expected ${expectedId}`)
    invariant(!ids.has(hymn.stableId), `Duplicate stable ID ${hymn.stableId}`)
    invariant(typeof hymn.title === 'string' && hymn.title.trim().length > 0, `Empty title ${hymn.stableId}`)
    invariant(typeof hymn.lyrics === 'string', `Lyrics must be a string on ${hymn.stableId}`)
    invariant(AVAILABILITY.has(hymn.availability), `Invalid availability ${hymn.stableId}`)
    invariant(Array.isArray(hymn.reviewFlags) && hymn.reviewFlags.every((flag) => typeof flag === 'string' && flag.length > 0), `Invalid review flags ${hymn.stableId}`)
    invariant(Number.isInteger(hymn.dataVersion) && hymn.dataVersion >= 1, `Invalid data version ${hymn.stableId}`)
    invariant(Number.isInteger(hymn.counterpartNumber) && hymn.counterpartNumber >= 1 && hymn.counterpartNumber <= 1048, `Invalid counterpart ${hymn.stableId}`)
    if (hymn.availability === 'MISSING_TEXT') {
      invariant(hymn.lyrics.trim().length === 0, `Missing-text record contains lyrics ${hymn.stableId}`)
      invariant(hymn.themeId === 0 || themeIds.has(hymn.themeId), `Invalid missing-text theme ${hymn.stableId}`)
    } else {
      invariant(hymn.lyrics.trim().length > 0, `Undocumented empty lyrics ${hymn.stableId}`)
      invariant(themeIds.has(hymn.themeId), `Invalid theme ${hymn.themeId} on ${hymn.stableId}`)
    }
    invariant(!hymn.title.includes('\uFFFD') && !hymn.lyrics.includes('\uFFFD'), `Replacement character found in ${hymn.stableId}`)
    ids.add(hymn.stableId)
    byId.set(hymn.stableId, hymn)
    counts[hymn.language] += 1
    availabilityCounts[hymn.availability] += 1
    numbers[hymn.language].add(hymn.hymnNumber)
    if (hymn.language === 'yo' && /[^\u0000-\u007f]/u.test(`${hymn.title}\n${hymn.lyrics}`)) yorubaUnicodeRecords += 1
    if (hymn.lyrics.trim()) {
      const group = lyricGroups.get(hymn.lyrics) ?? []
      group.push(hymn)
      lyricGroups.set(hymn.lyrics, group)
    }
  }

  invariant(counts.en === 1048 && counts.yo === 1048, `Language counts invalid: ${JSON.stringify(counts)}`)
  invariant(availabilityCounts.AVAILABLE === 1898 && availabilityCounts.NEEDS_REVIEW === 184 && availabilityCounts.MISSING_TEXT === 14, `Availability counts invalid: ${JSON.stringify(availabilityCounts)}`)
  for (const language of ['en', 'yo']) invariant([...Array(1048)].every((_, index) => numbers[language].has(index + 1)), `${language} numbering is incomplete`)
  invariant(yorubaUnicodeRecords > 0, 'Yoruba Unicode characters were lost')
  invariant(EXPECTED_MISSING.every((id) => byId.get(id)?.availability === 'MISSING_TEXT'), 'Documented unavailable records changed')
  invariant([...byId.values()].filter((hymn) => hymn.availability === 'MISSING_TEXT').every((hymn) => EXPECTED_MISSING.includes(hymn.stableId)), 'Unexpected unavailable record')
  for (const required of ['en:0600', 'yo:0303', 'yo:0600']) invariant(byId.get(required)?.availability === 'MISSING_TEXT', `Required placeholder missing: ${required}`)
  for (const hymn of hymns) {
    const other = hymn.language === 'en' ? 'yo' : 'en'
    const counterpart = `${other}:${String(hymn.counterpartNumber).padStart(4, '0')}`
    invariant(byId.has(counterpart), `Missing counterpart for ${hymn.stableId}`)
  }
  for (const duplicates of lyricGroups.values()) {
    if (duplicates.length > 1) invariant(duplicates.every((hymn) => hymn.reviewFlags.includes('DUPLICATE_LYRICS')), `Undocumented duplicate lyrics: ${duplicates.map((hymn) => hymn.stableId).join(', ')}`)
  }

  return { recordCount: hymns.length, languageCounts: counts, availabilityCounts, themeCount: themes.length, yorubaUnicodeRecords }
}
