import sinoKoreanCurriculum from '@/curriculum/sino-korean.json' with { type: 'json' }
import swedishCurriculum from '@/curriculum/swedish.json' with { type: 'json' }
import type { LanguageId } from '@/languages/index.ts'

export interface Curriculum {
    /** All stages in learning order */
    stages: Stage[]
    /** Available voices for this language */
    voices: VoiceConfig[]
}

export interface Stage {
    displayName: string
    description: string // What this stage covers
    numbers: NumberEntry[]
}

export interface NumberEntry {
    value: number
    helpText?: string // Optional help text for tricky numbers
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
