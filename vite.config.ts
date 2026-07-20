import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/gfm-hymnbook-pwa/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      injectRegister: false,
      manifest: false,
      includeAssets: [
        'favicon.png',
        'icons/apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-512.png',
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: false,
        skipWaiting: false,
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,webp,webmanifest,json}'],
      },
    }),
  ],
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: { reporter: ['text', 'html'] },
  },
})
