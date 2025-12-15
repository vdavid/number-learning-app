#!/usr/bin/env npx tsx
/**
 * Swedish curriculum generator.
 *
 * Generates a deterministic curriculum JSON with all numbers
 * pre-selected. The output is saved to:
 * src/features/languages/swedish/curriculum.json
 *
 * Usage:
 *   npx tsx scripts/curriculum-gen/swedish/generate.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Curriculum, NumberEntry, Stage } from '@shared/types/index.js'

/** Main entry point */
function main() {
    console.log('🇸🇪 Generating Swedish curriculum...\n')

    // Generate curriculum
    const curriculum = generateCurriculum()

    // Write curriculum
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const projectRoot = path.resolve(__dirname, '../../..')
    const outputDirectory = path.join(projectRoot, 'src/features/languages/swedish')
    const outputFilePath = path.join(outputDirectory, 'curriculum.json')
    fs.mkdirSync(outputDirectory, { recursive: true })

    let json = JSON.stringify(curriculum, null, 4)

    // Collapse number entry objects to single lines for better manual review
    // Handles: { "value": N } and { "value": N, "helpText": "..." }
    json = json.replace(/\{\n\s+"value": (\d+)\n\s+}/g, '{ "value": $1 }')
    // Match helpText values including escaped quotes: \" and other escape sequences
    json = json.replace(
        /\{\n\s+"value": (\d+),\n\s+"helpText": "((?:[^"\\]|\\.)*)"\n\s+}/g,
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

/** Shuffle an array using Fisher-Yates algorithm with seeded random */
function shuffleArray<T>(array: T[], random: () => number): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

/**
 * Help texts for Swedish numbers.
 * Guidelines:
 * - Focus on patterns and quirks that help English speakers
 * - Don't repeat what's shown in the UI
 * - Max ~170 chars
 */
const helpTexts: Record<number, string> = {
    // === Stage 1: Digits (1–10) ===
    1: '"Ett" for counting, but "en" before common-gender nouns. Here we use "ett".',
    2: 'The "tv" sounds like English "tv". Think "tvoh".',
    3: 'Like English "three" without the "th".',
    4: 'Think "fear-ah". The "y" sounds like German "ü".',
    5: 'Rhymes with English "hem".',
    6: 'Yes, really! Pronounced like English "sex".',
    7: 'Tricky! The "sj" makes a "hw" or "sh" sound. Like "hwoo" or "shoo".',
    8: 'The "å" sounds like "o" in "corn". Think "oh-tah".',
    9: 'Sounds like "nee-oh".',
    10: 'Sounds like "tee-oh". Your first building block for teens!',

    // === Stage 2: Teens (11–20) ===
    11: 'Irregular, like English "eleven". Just memorize it!',
    12: 'Irregular, like English "twelve". Also needs memorizing.',
    13: 'Tre (3) + ton. The "-ton" suffix means "-teen".',
    14: 'Note the "fj" start, different from "fyra".',
    15: 'Fem (5) + ton. Straightforward!',
    16: "Sex (6) + ton. Yes, that's how you say it!",
    17: 'Sju (7) + ton. Keep practicing that "sj" sound!',
    18: 'Shortened from "åtton". The "å" became "a".',
    19: 'Nio becomes "nit-" before "-ton".',
    20: 'The "tj" makes a "ch" sound, like "chew-goh".',

    // === Stage 3: Twenties (21–30) ===
    21: 'Tjugo + ett = tjugoett. In Swedish, tens come first (like English), unlike German.',
    22: 'Tjugo + två = tjugotvå. The pattern continues simply.',
    23: 'Tjugo + tre = tjugotre. In spoken Swedish, they often just say "tjuett", "tjutvå", "tjutre", ...',
    24: 'Tjugo + fyra = tjugofyra.',
    25: 'Tjugo + fem = tjugofem.',
    26: 'Tjugo + sex = tjugosex.',
    27: 'Tjugo + sju = tjugosju.',
    28: 'Tjugo + åtta = tjugoåtta.',
    29: 'Tjugo + nio = tjugonio.',
    30: 'Tre + tio, but modified. Note the double "t".',

    // === Stage 4: Decades ===
    0: 'Similar to English "null".',
    40: 'Fyra + tio, shortened to "fyrtio". The "y" sound remains.',
    50: 'Fem + tio. Nice and regular!',
    60: 'Sex + tio. Straightforward.',
    70: 'Sju + tio with double "t". That "sj" sound again!',
    80: 'Åtta + tio, simplified. The "å" stays.',
    90: 'Nio becomes "nit-" before "-tio".',
    100: 'Like English "hundred"! No "ett" needed for just 100.',

    // === Stage 5: Two digits (31–99) ===
    33: 'Trettio + tre = trettiotre. All threes!',
    44: 'Fyrtio + fyra = fyrtiofyra. All fours!',
    55: 'Femtio + fem = femtiofem. All fives!',
    66: 'Sextio + sex = sextiosex. All sixes!',
    77: 'Sjuttio + sju = sjuttiosju. All sevens — practice that "sj"!',
    88: 'Åttio + åtta = åttioåtta. All eights!',
    99: 'Nittio + nio = nittionio. All nines!',

    // === Stage 6: Hundreds ===
    200: 'Två + hundra = tvåhundra. Two hundred.',
    300: 'Tre + hundra = trehundra.',
    400: 'Fyra + hundra = fyrahundra.',
    500: 'Fem + hundra = femhundra.',
    600: 'Sex + hundra = sexhundra.',
    700: 'Sju + hundra = sjuhundra.',
    800: 'Åtta + hundra = åttahundra.',
    900: 'Nio + hundra = niohundra.',
    1000: 'Like English "thousand"! No "ett" needed for just 1000.',

    // === Stage 7: Three digits (101–999) ===
    101: 'Hundra + ett = hundraett. Simple stacking!',
    111: 'Hundra + elva = hundraelva. Hundred-eleven.',
    222: 'Tvåhundratjugotvå: all twos!',
    333: 'Trehundratrettiotre: all threes!',
    444: 'Fyrahundrafyrtiofyra: all fours!',
    555: 'Femhundrafemtiofem: all fives!',
    666: 'Sexhundrasextiosex: all sixes!',
    777: 'Sjuhundrasjuttiosju: all sevens!',
    888: 'Åttahundraåttioåtta: all eights!',
    999: 'Niohundranittionio: all nines!',

    // === Stage 8: Thousands (1000–9999) ===
    1001: 'Tusen + ett = tusenett. Just stack the parts.',
    1111: 'Tusen + hundra + elva = tusenhundraelva.',
    2000: 'Två + tusen = tvåtusen. Two thousand.',
    5000: 'Fem + tusen = femtusen. Five thousand.',

    // === Stage 9: Large numbers (10000+) ===
    10000: 'Tio + tusen = tiotusen. Ten thousand. Swedish groups by thousands like English.',
    100_000: 'Hundra + tusen = hundratusen. One hundred thousand.',
    1_000_000: 'Note "en" not "ett" because "miljon" is common gender.',
    10_000_000: 'Tio miljoner. Ten million — just like English, Swedish multiplies "miljon".',
    100_000_000: 'Hundra miljoner. One hundred million.',
    1_000_000_000: '"En miljard" — a billion. Note: "miljard" is common gender, so "en" not "ett".',
    10_000_000_000: 'Tio miljarder. Ten billion.',
    100_000_000_000: 'Hundra miljarder. One hundred billion.',
    1_000_000_000_000: '"En biljon" — a trillion. Swedish uses the long scale, so "biljon" = 10¹².',
}

/** Convert a number array to NumberEntry array with optional helpText */
function toNumberEntries(numbers: number[]): NumberEntry[] {
    return numbers.map((value) => {
        const entry: NumberEntry = { value }
        if (helpTexts[value]) {
            entry.helpText = helpTexts[value]
        }
        return entry
    })
}

/**
 * Generate the Swedish curriculum.
 * Uses a fixed seed (42) for deterministic output.
 */
function generateCurriculum(): Curriculum {
    const random = createSeededRandom(42)

    const stages: Stage[] = [
        {
            displayName: 'Digits (0–10)',
            description: 'Learn the basics: noll, ett, två, tre... tio',
            numbers: toNumberEntries(range(1, 10)),
        },
        {
            displayName: 'Teens (11–20)',
            description: 'Irregular 11-12, then the -ton pattern: elva, tolv, tretton...',
            numbers: toNumberEntries(range(11, 20)),
        },
        {
            displayName: 'Twenties (21–30)',
            description: 'Practice with tjugo: tjugoett, tjugotvå...',
            numbers: toNumberEntries(range(21, 30)),
        },
        {
            displayName: 'Decades',
            description: 'Round tens: trettio, fyrtio... hundra',
            numbers: toNumberEntries([0, 40, 50, 60, 70, 80, 90, 100]),
        },
        {
            displayName: 'Two digits (31–99)',
            description: 'Master any two-digit number',
            numbers: toNumberEntries([33, 44, 55, 66, 77, 88, 99, ...sparseRange(31, 99, 50, random)]),
        },
        {
            displayName: 'Hundreds',
            description: 'Round hundreds: hundra, tvåhundra... tusen',
            numbers: toNumberEntries([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]),
        },
        {
            displayName: 'Three digits (101–999)',
            description: 'Any number up to a thousand',
            numbers: toNumberEntries([
                101,
                111,
                200,
                222,
                300,
                333,
                400,
                444,
                500,
                555,
                600,
                666,
                700,
                777,
                800,
                888,
                900,
                999,
                ...sparseRange(101, 999, 100, random),
            ]),
        },
        {
            displayName: 'Thousands (1000–9999)',
            description: 'Numbers in the thousands',
            numbers: toNumberEntries([
                1001,
                1111,
                2000,
                2222,
                3000,
                3333,
                4000,
                4444,
                5000,
                5555,
                6000,
                6666,
                7000,
                7777,
                8000,
                8888,
                9000,
                9999,
                ...sparseRange(1000, 9999, 100, random),
            ]),
        },
        {
            displayName: 'Large numbers (10000+)',
            description: 'Ten thousands, hundred thousands, and millions',
            numbers: toNumberEntries([
                10000,
                20000,
                30000,
                40000,
                50000,
                100_000,
                ...sparseRange(10001, 99999, 100, random),
                ...sparseRange(100_001, 999_999, 50, random),
                ...sparseRange(1_000_001, 999_999_999, 20, random),
                ...sparseRange(1_000_000_001, 999_999_999_999, 10, random),
                1_000_000,
                10_000_000,
                100_000_000,
                1_000_000_000,
                10_000_000_000,
                100_000_000_000,
                1_000_000_000_000,
            ]),
        },
    ]

    // Shuffle numbers within each stage for variety (deterministic due to seeded random)
    for (const stage of stages) {
        stage.numbers = shuffleArray(stage.numbers, random)
    }

    return {
        voices: [],
        stages,
    }
}

main()
