import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test-setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'src/test-setup.ts'],
        },
    },
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
