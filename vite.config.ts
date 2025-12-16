import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Number trainer',
                short_name: 'NumTrain',
                description: 'Master numbers in any language through reflex training',
                theme_color: '#0a0a0f',
                background_color: '#0a0a0f',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,opus,json}'],
            },
        }),
    ],
    resolve: {
        alias: {
            '@curriculum': resolve(__dirname, './src/curriculum'),
            '@game': resolve(__dirname, './src/game'),
            '@languages': resolve(__dirname, './src/languages'),
            '@srs': resolve(__dirname, './src/srs'),
            '@ui': resolve(__dirname, './src/ui'),
            '@utils': resolve(__dirname, './src/utils'),
        },
    },
})
