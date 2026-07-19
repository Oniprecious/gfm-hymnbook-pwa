import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { validateCatalogue } from './catalogue-validator.mjs'

const root = path.resolve(import.meta.dirname, '..')
const hymns = JSON.parse(await readFile(path.join(root, 'public', 'data', 'hymns.json'), 'utf8'))
const themes = JSON.parse(await readFile(path.join(root, 'public', 'data', 'themes.json'), 'utf8'))
const summary = validateCatalogue(hymns, themes)
console.log(`Catalogue valid: ${summary.recordCount} records (${summary.languageCounts.en} English, ${summary.languageCounts.yo} Yoruba), ${summary.themeCount} themes, ${summary.availabilityCounts.MISSING_TEXT} unavailable, ${summary.availabilityCounts.NEEDS_REVIEW} review pending.`)
