import type { Stage } from '@curriculum/curriculum.ts'

import { range, sparseRange, toNumberEntries } from './utils.ts'

/**
 * Returns the default curriculum template with English descriptions as a template.
 * Languages can customize this via localizeStages().
 */
export function getDefaultStages(random: () => number, helpTexts: Record<number, string>): Stage[] {
    return [
        {
            displayName: 'Digits (1–10)',
            description: 'Learn the basic building blocks',
            numbers: toNumberEntries(range(1, 10), helpTexts),
        },
        {
            displayName: 'Teens (11–20)',
            description: 'Numbers eleven through twenty',
            numbers: toNumberEntries(range(11, 20), helpTexts),
        },
        {
            displayName: 'Twenties (21–30)',
            description: 'Practice the twenties',
            numbers: toNumberEntries(range(21, 30), helpTexts),
        },
        {
            displayName: 'Decades',
            description: 'Round numbers: 0, 40, 50... 100',
            numbers: toNumberEntries([0, 40, 50, 60, 70, 80, 90, 100], helpTexts),
        },
        {
            displayName: 'Two digits (31–99)',
            description: 'Master any two-digit number',
            numbers: toNumberEntries([33, 44, 55, 66, 77, 88, 99, ...sparseRange(31, 99, 50, random)], helpTexts),
        },
        {
            displayName: 'Hundreds',
            description: 'Round hundreds: 100, 200... 1000',
            numbers: toNumberEntries([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], helpTexts),
        },
        {
            displayName: 'Three digits (101–999)',
            description: 'Any number up to a thousand',
            numbers: toNumberEntries(
                [
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
                    ...sparseRange(101, 999, 32, random),
                ],
                helpTexts,
            ),
        },
        {
            displayName: 'Thousands (1000–9999)',
            description: 'Numbers in the thousands',
            numbers: toNumberEntries(
                [
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
                    ...sparseRange(1000, 9999, 33, random),
                ],
                helpTexts,
            ),
        },
        {
            displayName: 'Large numbers (10000+)',
            description: 'Ten thousands, millions, and beyond',
            numbers: toNumberEntries(
                [
                    10000,
                    20000,
                    30000,
                    40000,
                    50000,
                    100_000,
                    ...sparseRange(10001, 99999, 44, random),
                    ...sparseRange(100_001, 999_999, 20, random),
                    1_000_000,
                    ...sparseRange(1_000_001, 999_999_999, 20, random),
                    ...sparseRange(1_000_000_001, 999_999_999_999, 10, random),
                    10_000_000,
                    100_000_000,
                    1_000_000_000,
                    10_000_000_000,
                    100_000_000_000,
                    1_000_000_000_000,
                ],
                helpTexts,
            ),
        },
    ]
}
