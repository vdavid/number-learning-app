#!/usr/bin/env node
/**
 * Setup curriculum symlinks (or copies as fallback).
 *
 * Links curriculum.json from src to public for runtime fetching.
 * - Dev mode: links all languages
 * - Build mode: links only VITE_LANGUAGE_ID if set, else all
 *
 * Usage: node scripts/setup-curriculum.js
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

function getLanguageIds() {
    const languagesDir = path.join(projectRoot, 'src/features/languages')
    return fs.readdirSync(languagesDir).filter((f) => {
        const fullPath = path.join(languagesDir, f)
        const stats = fs.statSync(fullPath)
        return stats.isDirectory() && f !== 'types' // Exclude non-language dirs
    })
}

function setupCurriculum(languageId) {
    const srcFile = path.join(projectRoot, 'src/features/languages', languageId, 'curriculum.json')
    const publicDir = path.join(projectRoot, 'public', languageId)
    const destFile = path.join(publicDir, 'curriculum.json')

    // Create public dir if needed
    fs.mkdirSync(publicDir, { recursive: true })

    // Remove existing file/symlink
    if (fs.existsSync(destFile)) {
        fs.unlinkSync(destFile)
    }

    // Copy file. (Symlinks don't work reliably in Vite's public directory.)
    try {
        fs.copyFileSync(srcFile, destFile)
        console.log(`✓ Copied ${languageId}`)
    } catch (error) {
        console.error(`✗ Failed to setup ${languageId}: ${error.message}`)
        process.exit(1)
    }
}

// Main
const languageId = process.env.VITE_LANGUAGE_ID
const languageIds = languageId ? [languageId] : getLanguageIds()

console.log(`Setting up curriculum for: ${languageIds.join(', ')}\n`)

for (const lang of languageIds) {
    setupCurriculum(lang)
}

console.log()
