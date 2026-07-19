import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await readFile(path.join(root, 'public', 'manifest.webmanifest'), 'utf8'))
const expectedBase = '/gfm-hymnbook-pwa/'
if (manifest.start_url !== expectedBase || manifest.scope !== expectedBase || manifest.display !== 'standalone') throw new Error('Manifest start URL, scope, or display mode is invalid')
for (const size of ['192x192', '512x512']) {
  const icon = manifest.icons.find((item) => item.sizes === size && item.purpose === 'any')
  if (!icon) throw new Error(`Manifest icon ${size} is missing`)
  await access(path.join(root, 'public', icon.src))
}
const maskable = manifest.icons.find((item) => item.purpose === 'maskable')
if (!maskable) throw new Error('Maskable icon is missing')
await access(path.join(root, 'public', maskable.src))
await access(path.join(root, 'public', 'icons', 'apple-touch-icon.png'))
console.log('Manifest valid: repository scope, standalone mode, install icons, maskable icon, and Apple touch icon are present.')
