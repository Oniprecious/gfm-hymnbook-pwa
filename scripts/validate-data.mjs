import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { sha256, validateCatalogue } from './catalogue-validator.mjs'

const root = path.resolve(import.meta.dirname, '..')
const dataRoot = path.join(root, 'public', 'data')
const [hymnBuffer, themeBuffer, versionBuffer] = await Promise.all([
  readFile(path.join(dataRoot, 'hymns.json')),
  readFile(path.join(dataRoot, 'themes.json')),
  readFile(path.join(dataRoot, 'version.json')),
])
const hymns = JSON.parse(hymnBuffer.toString('utf8'))
const themes = JSON.parse(themeBuffer.toString('utf8'))
const version = JSON.parse(versionBuffer.toString('utf8'))
const summary = validateCatalogue(hymns, themes)
if (sha256(hymnBuffer) !== version.catalogueSha256) throw new Error('hymns.json bytes do not match version.json')
if (sha256(themeBuffer) !== version.themesSha256) throw new Error('themes.json bytes do not match version.json')
console.log(`Catalogue valid: ${summary.recordCount} records (${summary.languageCounts.en} English, ${summary.languageCounts.yo} Yoruba), ${summary.themeCount} themes, ${summary.availabilityCounts.MISSING_TEXT} unavailable, ${summary.availabilityCounts.NEEDS_REVIEW} review pending.`)
