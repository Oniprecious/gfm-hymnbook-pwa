import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'
import { sha256, validateCatalogue } from './catalogue-validator.mjs'

const projectRoot = path.resolve(import.meta.dirname, '..')
const argumentIndex = process.argv.indexOf('--android-root')
const suppliedRoot = argumentIndex >= 0 ? process.argv[argumentIndex + 1] : process.env.GFM_ANDROID_ROOT
const androidRoot = path.resolve(suppliedRoot || path.join(projectRoot, '..', 'GFMHymnBook'))
const assetsRoot = path.join(androidRoot, 'app', 'src', 'main')
const outputData = path.join(projectRoot, 'public', 'data')
const outputImages = path.join(projectRoot, 'public', 'images')
const outputIcons = path.join(projectRoot, 'public', 'icons')

const catalogueSource = path.join(assetsRoot, 'assets', 'hymns.json')
const themesSource = path.join(assetsRoot, 'assets', 'themes.json')
const imageRoot = path.join(assetsRoot, 'res', 'drawable-nodpi')
const approvedImages = ['catalogue_header.png', 'gfm_logo.png', 'home_church.png', 'language_card.png', 'splash_brand.png']

if (!suppliedRoot && path.basename(androidRoot).toLowerCase() !== 'gfmhymnbook') throw new Error(`Refusing unexpected Android source path: ${androidRoot}`)

const catalogueBuffer = await readFile(catalogueSource)
const themesBuffer = await readFile(themesSource)
const hymns = JSON.parse(catalogueBuffer.toString('utf8'))
const themes = JSON.parse(themesBuffer.toString('utf8'))
const summary = validateCatalogue(hymns, themes)

await Promise.all([mkdir(outputData, { recursive: true }), mkdir(outputImages, { recursive: true }), mkdir(outputIcons, { recursive: true })])
await copyFile(catalogueSource, path.join(outputData, 'hymns.json'))
await copyFile(themesSource, path.join(outputData, 'themes.json'))
for (const filename of approvedImages) await copyFile(path.join(imageRoot, filename), path.join(outputImages, filename))

const logo = path.join(imageRoot, 'gfm_logo.png')
await sharp(logo).resize(192, 192, { fit: 'contain', background: '#f5f7fa' }).png().toFile(path.join(outputIcons, 'icon-192.png'))
await sharp(logo).resize(512, 512, { fit: 'contain', background: '#f5f7fa' }).png().toFile(path.join(outputIcons, 'icon-512.png'))
await sharp(logo).resize(410, 410, { fit: 'contain', background: '#f5f7fa' }).extend({ top: 51, bottom: 51, left: 51, right: 51, background: '#1e88e5' }).png().toFile(path.join(outputIcons, 'maskable-512.png'))
await sharp(logo).resize(180, 180, { fit: 'contain', background: '#f5f7fa' }).png().toFile(path.join(outputIcons, 'apple-touch-icon.png'))
await sharp(logo).resize(32, 32, { fit: 'contain', background: '#f5f7fa' }).png().toFile(path.join(projectRoot, 'public', 'favicon.png'))

const version = {
  schemaVersion: 1,
  dataVersion: Math.max(...hymns.map((hymn) => hymn.dataVersion)),
  catalogueSha256: sha256(catalogueBuffer),
  themesSha256: sha256(themesBuffer),
  ...summary,
}
await writeFile(path.join(outputData, 'version.json'), `${JSON.stringify(version, null, 2)}\n`, 'utf8')
console.log(`Synchronized ${summary.recordCount} hymns, ${summary.themeCount} themes, ${approvedImages.length} approved images, and install icons from ${androidRoot}`)
console.log(`Catalogue SHA-256: ${version.catalogueSha256}`)
