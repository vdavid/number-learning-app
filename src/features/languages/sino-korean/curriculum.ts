import type { Curriculum, Stage } from '@shared/types'

/**
 * Generate a sparse selection of numbers within a range.
 * Used for higher-number stages to avoid overwhelming card counts.
 */
function sparseRange(min: number, max: number, count: number): number[] {
    const numbers: number[] = []
    const step = Math.floor((max - min) / count)

    for (let i = 0; i < count; i++) {
        // Add some randomness within each segment
        const base = min + i * step
        const variation = Math.floor(Math.random() * Math.min(step, 10))
        numbers.push(Math.min(base + variation, max))
    }

    // Ensure we have unique numbers
    return [...new Set(numbers)].sort((a, b) => a - b)
}

/** Generate the full range of numbers */
function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Sino-Korean number curriculum.
 * Follows the spec's 9 stages, from basic digits to large numbers.
 */
export function createSinoKoreanCurriculum(): Curriculum {
    const stages: Stage[] = [
        {
            name: 'Digits (1–10)',
            description: 'Learn the basic building blocks: 일, 이, 삼... 십',
            numbers: range(1, 10),
        },
        {
            name: 'Teens (11–20)',
            description: 'Combine ten with digits: 십일, 십이... 이십',
            numbers: range(11, 20),
        },
        {
            name: 'Twenties (21–30)',
            description: 'Practice the twenties: 이십일... 삼십',
            numbers: range(21, 30),
        },
        {
            name: 'Decades',
            description: 'Round numbers: 십, 이십, 삼십... 백',
            numbers: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        },
        {
            name: 'Two digits (31–99)',
            description: 'Master any two-digit number',
            numbers: sparseRange(31, 99, 50),
        },
        {
            name: 'Hundreds',
            description: 'Round hundreds: 백, 이백... 천',
            numbers: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
        },
        {
            name: 'Three digits (101–999)',
            description: 'Any number up to a thousand',
            numbers: sparseRange(101, 999, 100),
        },
        {
            name: 'Thousands (1000–9999)',
            description: 'Numbers in the thousands',
            numbers: sparseRange(1000, 9999, 100),
        },
        {
            name: 'Man (10000+)',
            description: 'The Korean "ten thousand" unit: 만',
            numbers: [
                10000,
                20000,
                50000,
                100000,
                ...sparseRange(10001, 99999, 100),
                ...sparseRange(100000, 999999, 50),
                1000000,
                10000000,
            ],
        },
    ]

    return { stages }
}
