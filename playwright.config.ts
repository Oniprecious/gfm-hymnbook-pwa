import { defineConfig, devices } from '@playwright/test'

const deployedBaseUrl = process.env.PLAYWRIGHT_BASE_URL
const baseURL = deployedBaseUrl ?? 'http://127.0.0.1:4173/gfm-hymnbook-pwa/'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: deployedBaseUrl
    ? undefined
    : {
        command: 'pnpm preview --port 4173',
        url: 'http://127.0.0.1:4173/gfm-hymnbook-pwa/',
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: 'chromium-phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'webkit-iphone', use: { ...devices['iPhone 13'] } },
    { name: 'chromium-tablet', use: { ...devices['iPad Pro 11'], browserName: 'chromium', channel: 'chrome' } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
  ],
})
