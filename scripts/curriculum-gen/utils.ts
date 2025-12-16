import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Curriculum, NumberEntry } from '@curriculum/curriculum.ts'
import type { LanguageId } from '@languages/index.ts'

/** For deterministic sparse ranges. Uses a simple mulberry32 PRNG. */
export function createSeededRandom(seed: number): () => number {
    let state = seed
    return () => {
        state |= 0
        state = (state + 0x6d2b79f5) | 0
        let t = Math.imul(state ^ (state >>> 15), 1 | state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Generates a sparse selection of numbers within the given range. Uses seeded random for deterministic output. */
export function sparseRange(min: number, max: number, count: number, random: () => number): number[] {
    const numbers: number[] = []
    const step = Math.floor((max - min) / count)

    for (let i = 0; i < count; i++) {
        const base = min + i * step
        // For small steps (≤100), vary by 0-9 for nice "last digit" variety
        // For large steps (>100), vary by up to 50% of step for natural spread
        const maxVariation = step <= 100 ? Math.min(step, 10) : Math.floor(step * 0.5)
        const variation = Math.floor(random() * maxVariation)
        numbers.push(Math.min(base + variation, max))
    }

    // Ensure unique and sorted
    return [...new Set(numbers)].sort((a, b) => a - b)
}

/** Generates a full range of numbers */
export function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/** Shuffles an array using Fisher-Yates with seeded random */
export function shuffleArray<T>(array: T[], random: () => number): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

/** Converts a number array to NumberEntry array with optional helpText */
export function toNumberEntries(numbers: number[], helpTexts: Record<number, string>): NumberEntry[] {
    return numbers.map((value) => {
        const entry: NumberEntry = { value }
        if (helpTexts[value]) {
            entry.helpText = helpTexts[value]
        }
        return entry
    })
}

/** Formats curriculum JSON with collapsed number entries for manual editing / readability */
export function formatCurriculumJson(curriculum: Curriculum): string {
    let json = JSON.stringify(curriculum, null, 4)

    // Collapse number entry objects to single lines for better manual review
    // Handles: { "value": N } and { "value": N, "helpText": "..." }
    json = json.replace(/\{\n\s+"value": (\d+)\n\s+}/g, '{ "value": $1 }')
    // Match helpText values including escaped quotes: \" and other escape sequences
    json = json.replace(
        /\{\n\s+"value": (\d+),\n\s+"helpText": "((?:[^"\\]|\\.)*)"\n\s+}/g,
        '{ "value": $1, "helpText": "$2" }',
    )

    return json + '\n'
}

function getProjectRoot(): string {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    return path.resolve(__dirname, '../..')
}

export function getCurriculumPath(languageId: LanguageId): string {
    return path.join(getProjectRoot(), `src/curriculum/${languageId}.json`)
}

/** Write curriculum to the appropriate file */
export function writeCurriculumFile(languageId: LanguageId, curriculum: Curriculum): string {
    const outputPath = getCurriculumPath(languageId)
    const outputDirectory = path.dirname(outputPath)
    fs.mkdirSync(outputDirectory, { recursive: true })
    fs.writeFileSync(outputPath, formatCurriculumJson(curriculum))
    return outputPath
}
