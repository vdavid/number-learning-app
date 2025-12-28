import sinoKoreanCurriculum from '@curriculum/sino-korean.json' with { type: 'json' }
import swedishCurriculum from '@curriculum/swedish.json' with { type: 'json' }
import type { LanguageId } from '@languages/index.ts'

/**
 * A pattern represents an atomic linguistic rule or fact that a learner must understand.
 * Examples: DIGIT_ONE, SUFFIX_TEEN, PATTERN_DECADE_UNIT_ORDER
 */
export interface Pattern {
    /** Unique identifier like 'DIGIT_ONE' or 'SUFFIX_TEEN' */
    id: string
    /** Human-readable description of what this pattern teaches */
    description: string
    /** Example numbers that demonstrate this pattern (~10 per pattern) */
    examples: number[]
}

export interface Curriculum {
    /** All patterns defined for this language */
    patterns: Record<string, Pattern>
    /** All stages in learning order */
    stages: Stage[]
    /** Available voices for this language */
    voices: VoiceConfig[]
}

export interface Stage {
    displayName: string
    description: string
    /** Pattern IDs that this stage introduces */
    patterns: string[]
    /** Numbers to practice in this stage */
    numbers: NumberEntry[]
}

export interface NumberEntry {
    value: number
    helpText?: string
    /** Pattern IDs that this number demonstrates */
    patterns: string[]
}

/**
 * Voice configuration for audio generation.
 * Each VoiceConfig maps to one set of generated audio files.
 */
export type VoiceConfig = {
    /** Voice identifier (used in filename, e.g., "charlie" → "1-charlie.mp3") */
    id: string
    /** Display name */
    name: string
    /** TTS provider to use */
    provider: TTSProvider
    /** Provider-specific voice ID (e.g., "IKne3meq5aSn9XLyUdCD" for ElevenLabs or "sv-SE-Chirp3-HD-Puck" for Google) */
    voiceId: string
    /** Voice gender */
    gender: VoiceGender
}

/** TTS provider type */
export type TTSProvider = 'elevenlabs' | 'google'

/** Voice gender */
export type VoiceGender = 'male' | 'female'

const curriculumMap: Record<string, Curriculum> = {
    'sino-korean': sinoKoreanCurriculum as Curriculum,
    swedish: swedishCurriculum as Curriculum,
}

export function loadCurriculum(languageId: LanguageId): Curriculum {
    const curriculum = curriculumMap[languageId]
    if (!curriculum) {
        throw new Error(`Curriculum not found: ${languageId}`)
    }
    return curriculum
}
