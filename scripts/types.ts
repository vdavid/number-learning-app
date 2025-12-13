/**
 * Shared types for curriculum and audio generation scripts.
 */

/**
 * A number entry in the curriculum with metadata for learning.
 */
export type NumberEntry = {
    /** The numeric value (e.g., 1, 54, 1000) */
    value: number
    /** Optional help text for tricky numbers */
    helpText?: string
}

/**
 * A learning stage containing a set of numbers.
 */
export type StageManifest = {
    /** Stage name (e.g., "Digits (1–10)") */
    name: string
    /** Stage description */
    description: string
    /** Numbers in this stage */
    numbers: NumberEntry[]
}

/**
 * Voice configuration for audio generation.
 */
export type VoiceConfig = {
    /** Voice identifier (used in filename) */
    id: string
    /** ElevenLabs voice ID */
    elevenLabsVoiceId: string
    /** Display name */
    name: string
}

/**
 * Metadata for generated files.
 */
export type GeneratedMetadata = {
    /** Marker that this file is auto-generated */
    isGenerated: true
    /** Script that generated this file */
    generator: string
    /** ISO timestamp of generation */
    timestamp: string
}

/**
 * Complete curriculum manifest for a language.
 */
export type CurriculumManifest = {
    /** Metadata indicating this file is auto-generated - DO NOT EDIT */
    _generated: GeneratedMetadata
    /** Language identifier (e.g., "sino-korean") */
    language: string
    /** Display name */
    displayName: string
    /** BCP 47 language code for TTS */
    languageCode: string
    /** Available voices for this language */
    voices: VoiceConfig[]
    /** Learning stages */
    stages: StageManifest[]
}
