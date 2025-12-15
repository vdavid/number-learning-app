#!/usr/bin/env npx tsx
/**
 * Sino-Korean curriculum generator.
 *
 * Generates a deterministic curriculum JSON with all numbers
 * pre-selected and romanized. The output is saved to:
 * src/features/languages/sino-korean/curriculum.json
 *
 * Usage:
 *   npx tsx scripts/curriculum-gen/sino-korean/generate.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Curriculum, NumberEntry, Stage } from '@shared/types/index.js'

/** Main entry point */
function main() {
    console.log('🎓 Generating Sino-Korean curriculum...\n')

    // Generate curriculum curriculum
    const curriculum = generateCurriculum()

    // Write curriculum
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const projectRoot = path.resolve(__dirname, '../../..')
    const outputDirectory = path.join(projectRoot, 'src/features/languages/sino-korean')
    const outputFilePath = path.join(outputDirectory, 'curriculum.json')
    fs.mkdirSync(outputDirectory, { recursive: true })

    let json = JSON.stringify(curriculum, null, 4)

    // Collapse number entry objects to single lines for better manual review
    // Handles: { "value": N } and { "value": N, "helpText": "..." }
    json = json.replace(
        /\{\n\s+"value": (\d+)\n\s+\}/g,
        '{ "value": $1 }',
    )
    json = json.replace(
        /\{\n\s+"value": (\d+),\n\s+"helpText": "([^"]+)"\n\s+\}/g,
        '{ "value": $1, "helpText": "$2" }',
    )

    fs.writeFileSync(outputFilePath, json + '\n')

    // Summary
    const totalNumbers = curriculum.stages.reduce((sum, stage) => sum + stage.numbers.length, 0)
    console.log(`✅ Generated curriculum with ${curriculum.stages.length} stages and ${totalNumbers} numbers`)
    console.log(`📁 Saved to: ${outputFilePath}\n`)

    // Stage breakdown
    console.log('Stage breakdown:')
    for (const stage of curriculum.stages) {
        console.log(`  - ${stage.displayName}: ${stage.numbers.length} numbers`)
    }
}

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
    return numbers.map((value) => ({ value }))
}

/**
 * Generate the Sino-Korean curriculum.
 * Uses a fixed seed (42) for deterministic output.
 */
function generateCurriculum(): Curriculum {
    const random = createSeededRandom(42)

    const stages: Stage[] = [
        {
            displayName: 'Digits (1–10)',
            description: 'Learn the basic building blocks: 일, 이, 삼... 십',
            numbers: toNumberEntries(range(1, 10)),
        },
        {
            displayName: 'Teens (11–20)',
            description: 'Combine ten with digits: 십일, 십이... 이십',
            numbers: toNumberEntries(range(11, 20)),
        },
        {
            displayName: 'Twenties (21–30)',
            description: 'Practice the twenties: 이십일... 삼십',
            numbers: toNumberEntries(range(21, 30)),
        },
        {
            displayName: 'Decades',
            description: 'Round numbers: 십, 이십, 삼십... 백',
            numbers: toNumberEntries([10, 20, 30, 40, 50, 60, 70, 80, 90, 100]),
        },
        {
            displayName: 'Two digits (31–99)',
            description: 'Master any two-digit number',
            numbers: toNumberEntries(sparseRange(31, 99, 50, random)),
        },
        {
            displayName: 'Hundreds',
            description: 'Round hundreds: 백, 이백... 천',
            numbers: toNumberEntries([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]),
        },
        {
            displayName: 'Three digits (101–999)',
            description: 'Any number up to a thousand',
            numbers: toNumberEntries(sparseRange(101, 999, 100, random)),
        },
        {
            displayName: 'Thousands (1000–9999)',
            description: 'Numbers in the thousands',
            numbers: toNumberEntries(sparseRange(1000, 9999, 100, random)),
        },
        {
            displayName: 'Man (10000+)',
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

main()
