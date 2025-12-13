/** Card mode - determines how the user practices */
export type CardMode = 'listen' | 'speak'

/** Card state for FSRS spaced repetition */
export interface CardState {
    /** Unique identifier: `${languageId}-${number}-${mode}` */
    id: string
    /** The number this card represents */
    number: number
    /** Practice mode */
    mode: CardMode
    /** Language this card belongs to */
    languageId: string
    /** Stage/level this card belongs to */
    stageIndex: number
    /** FSRS scheduling data */
    fsrs: {
        due: Date
        stability: number
        difficulty: number
        reps: number
        lapses: number
        state: 'new' | 'learning' | 'review' | 'relearning'
        lastReview?: Date
    }
}

/** Visual decay state for UI representation */
export type DecayState = 'locked' | 'new' | 'gold' | 'faded' | 'rusty'

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
 */
export type VoiceConfig = {
    /** Voice identifier (used in filename) */
    id: string
    /** ElevenLabs voice ID */
    elevenLabsVoiceId: string
    /** Display name */
    name: string
}

/** Rating for FSRS based on response time */
export type ResponseRating = 'again' | 'good' | 'easy'
