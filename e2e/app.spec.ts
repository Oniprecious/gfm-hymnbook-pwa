import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { name: 'GRACIOUS FAMILY HYMN BOOK' })).toBeVisible()
})

test('loads from the repository subpath with all install metadata and no critical accessibility violations', async ({ page, request }) => {
  await expect(page.getByRole('link', { name: /HYMNS IN ENGLISH/ })).toBeVisible()
  for (const asset of ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'data/hymns.json', 'data/themes.json', 'data/version.json', 'sw.js']) {
    const response = await request.get(asset)
    expect(response.status(), `${asset} should load`).toBe(200)
  }
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter((violation) => violation.impact === 'critical')).toEqual([])
})

test('searches and opens English and Yoruba hymns by number, title and lyric', async ({ page }) => {
  await page.getByRole('link', { name: /HYMNS IN ENGLISH/ }).click()
  await page.getByLabel('Search number, title, or lyrics').fill('Abba father')
  await expect(page.getByRole('link', { name: /Hymn 1,/ })).toBeVisible()
  await page.getByLabel('Open hymn by number').fill('600')
  await page.getByRole('button', { name: 'Open hymn' }).click()
  await expect(page.getByRole('heading', { name: 'Hymn text not yet available' })).toBeVisible()
  await page.goto('./#/catalogue/yo')
  await page.getByLabel('Open hymn by number').fill('1')
  await page.getByRole('button', { name: 'Open hymn' }).click()
  await expect(page.getByText('Legacy text · review pending')).toBeVisible()
})

test('persists favourites, typography and last-opened hymn across reload', async ({ page }) => {
  await page.goto('./#/hymn/en:0001?mode=language')
  await page.getByRole('button', { name: 'Add to favourites' }).click()
  await page.getByRole('button', { name: 'Increase text size' }).click()
  await page.getByRole('button', { name: 'Spacing' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Remove from favourites' })).toBeVisible()
  await page.goto('./#/favourites')
  await expect(page.getByRole('link', { name: /Hymn 1,/ })).toBeVisible()
  await page.goto('./')
  await expect(page.getByText(/Hymn 1 · English/)).toBeVisible()
})

test('navigates hymns and switches counterpart without using array positions', async ({ page }) => {
  await page.goto('./#/hymn/en:0001?mode=language')
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(page.getByText('Hymn 2', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Open hymn actions' }).click()
  await page.getByRole('menuitem', { name: 'Yoruba' }).click()
  await expect(page.getByText('Hymn 2', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Open hymn actions' })).toBeVisible()
  await page.getByRole('button', { name: 'Open hymn actions' }).click()
  await expect(page.getByRole('menuitem', { name: 'English' })).toBeVisible()
  await page.getByRole('button', { name: 'Collapse hymn actions' }).click()
  await expect(page.getByRole('button', { name: 'Open hymn actions' })).toBeVisible()
  await page.getByRole('button', { name: 'Open hymn actions' }).click()
  await page.getByRole('menuitem', { name: 'Add favourite' }).click()
  await expect(page.getByRole('button', { name: 'Remove from favourites' })).toBeVisible()
  await page.getByRole('button', { name: 'Open hymn actions' }).click()
  await page.getByRole('menuitem', { name: 'Home' }).click()
  await expect(page.getByRole('heading', { name: 'GRACIOUS FAMILY HYMN BOOK' })).toBeVisible()
})

test('relaunches and reads both catalogues offline after readiness', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit does not support service workers in this Windows environment')
  await expect(page.getByText('Ready for offline worship')).toBeVisible({ timeout: 30_000 })
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'GRACIOUS FAMILY HYMN BOOK' })).toBeVisible()
  await page.goto('./#/catalogue/en')
  await page.getByLabel('Search number, title, or lyrics').fill('Jesus you are so good')
  await expect(page.getByRole('link', { name: /Hymn 1,/ })).toBeVisible()
  await page.goto('./#/catalogue/yo')
  await page.getByLabel('Open hymn by number').fill('1')
  await page.getByRole('button', { name: 'Open hymn' }).click()
  await expect(page.getByText('Legacy text · review pending')).toBeVisible()
  await context.setOffline(false)
})
