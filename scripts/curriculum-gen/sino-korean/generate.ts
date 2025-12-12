#!/usr/bin/env npx tsx
/**
 * Sino-Korean curriculum generator.
 *
 * Generates a deterministic curriculum manifest with all numbers
 * pre-selected and romanized. The output is saved to:
 * public/audio/sino-korean/manifest.json
 *
 * Usage:
 *   npx tsx scripts/curriculum-gen/sino-korean/generate.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { CurriculumManifest, NumberEntry, StageManifest } from '../../types.js'

import { numberToRomanized } from './romanizer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../../..')
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/audio/sino-korean')
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'manifest.json')

/**
 * Seeded random number generator for deterministic sparse ranges.
 * Uses a simple mulberry32 PRNG.
 */
function createSeededRandom(seed: number): () => number {
    let state = seed
    return () => {
        state |= 0
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * Generate a sparse selection of numbers within a range.
 * Uses seeded random for deterministic output.
 */
function sparseRange(min: number, max: number, count: number, random: () => number): number[] {
    const numbers: number[] = []
    const step = Math.floor((max - min) / count)

    for (let i = 0; i < count; i++) {
        const base = min + i * step
        const variation = Math.floor(random() * Math.min(step, 10))
        numbers.push(Math.min(base + variation, max))
    }

    // Ensure unique and sorted
    return [...new Set(numbers)].sort((a, b) => a - b)
}

/** Generate a full range of numbers */
function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/** Convert a number array to NumberEntry array with romanization */
function toNumberEntries(numbers: number[]): NumberEntry[] {
    return numbers.map((value) => ({
        value,
        romanization: numberToRomanized(value),
    }))
}

/**
 * Generate the Sino-Korean curriculum.
 * Uses a fixed seed (42) for deterministic output.
 */
function generateCurriculum(): CurriculumManifest {
    const random = createSeededRandom(42)

    const stages: StageManifest[] = [
        {
            name: 'Digits (1–10)',
            description: 'Learn the basic building blocks: 일, 이, 삼... 십',
            numbers: toNumberEntries(range(1, 10)),
        },
        {
            name: 'Teens (11–20)',
            description: 'Combine ten with digits: 십일, 십이... 이십',
            numbers: toNumberEntries(range(11, 20)),
        },
        {
            name: 'Twenties (21–30)',
            description: 'Practice the twenties: 이십일... 삼십',
            numbers: toNumberEntries(range(21, 30)),
        },
        {
            name: 'Decades',
            description: 'Round numbers: 십, 이십, 삼십... 백',
            numbers: toNumberEntries([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]),
        },
        {
            name: 'Two digits (31–99)',
            description: 'Master any two-digit number',
            numbers: toNumberEntries(sparseRange(31, 99, 50, random)),
        },
        {
            name: 'Hundreds',
            description: 'Round hundreds: 백, 이백... 천',
            numbers: toNumberEntries([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]),
        },
        {
            name: 'Three digits (101–999)',
            description: 'Any number up to a thousand',
            numbers: toNumberEntries(sparseRange(101, 999, 100, random)),
        },
        {
            name: 'Thousands (1000–9999)',
            description: 'Numbers in the thousands',
            numbers: toNumberEntries(sparseRange(1000, 9999, 100, random)),
        },
        {
            name: 'Man (10000+)',
            description: 'The Korean "ten thousand" unit: 만',
            numbers: toNumberEntries([
                10000,
                20000,
                50000,
                100000,
                ...sparseRange(10001, 99999, 100, random),
                ...sparseRange(100000, 999999, 50, random),
                1000000,
                10000000,
            ]),
        },
    ]

    return {
        _generated: {
            isGenerated: true,
            generator: 'scripts/curriculum-gen/sino-korean/generate.ts',
            timestamp: new Date().toISOString(),
        },
        language: 'sino-korean',
        displayName: 'Sino-Korean',
        languageCode: 'ko-KR',
        voices: [
            {
                id: 'charlie',
                elevenLabsVoiceId: 'IKne3meq5aSn9XLyUdCD',
                name: 'Charlie',
            },
            {
                id: 'matilda',
                elevenLabsVoiceId: 'XrExE9yKIg1WjnnlVkGX',
                name: 'Matilda',
            },
        ],
        stages,
    }
}

/** Main entry point */
function main() {
    console.log('🎓 Generating Sino-Korean curriculum...\n')

    const manifest = generateCurriculum()

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    // Write manifest
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 4))

    // Summary
    const totalNumbers = manifest.stages.reduce((sum, stage) => sum + stage.numbers.length, 0)
    console.log(`✅ Generated curriculum with ${manifest.stages.length} stages and ${totalNumbers} numbers`)
    console.log(`📁 Saved to: ${OUTPUT_FILE}\n`)

    // Stage breakdown
    console.log('Stage breakdown:')
    for (const stage of manifest.stages) {
        console.log(`  - ${stage.name}: ${stage.numbers.length} numbers`)
    }
}

main()
