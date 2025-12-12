import type { Curriculum } from '@shared/types'

/**
 * Language definition interface.
 * Each supported language implements this to provide number learning functionality.
 */
export interface Language {
    /** Unique identifier (for example 'sino-korean', 'native-korean', 'japanese') */
    id: string

    /** Display name (for example 'Sino-Korean', 'Native Korean') */
    name: string

    /** Language code for TTS (for example 'ko-KR', 'ja-JP') */
    ttsLanguageCode: string

    /** Language code for STT (for example 'ko-KR', 'ja-JP') */
    sttLanguageCode: string

    /** Flag emoji for visual identification */
    flag: string

    /** Curriculum defining the learning path */
    curriculum: Curriculum

    /**
     * Convert a number to its spoken representation.
     * Used for TTS and display hints.
     * @param num - The number to convert
     * @returns The spoken form (for example 54 → "오십사")
     */
    numberToWords: (num: number) => string

    /**
     * Parse spoken/transcribed text back to a number.
     * Handles variations in STT output (digits, words, mixed).
     * @param text - The transcribed text (for example "오십사", "54", "5십4")
     * @returns The numeric value, or null if parsing fails
     */
    parseSpokenNumber: (text: string) => number | null

    /**
     * Get acceptable spoken variations for a number.
     * Used for fuzzy matching in STT validation.
     * @param num - The number
     * @returns Array of acceptable spoken forms
     */
    getAcceptableVariations: (num: number) => string[]

    /**
     * Convert a number to its romanized representation.
     * Used for pronunciation guides.
     * @param num - The number
     * @returns The romanized form (for example "o-sip-sa")
     */
    numberToRomanized?: (num: number) => string

}

/** Registry of all available languages */
export type LanguageRegistry = Record<string, Language>
