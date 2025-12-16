import type { LanguageId } from '@/languages/index.ts'

/** Card state for FSRS spaced repetition */
export interface CardState {
    /** Unique identifier: `${languageId}-${number}-${mode}` */
    id: string
    /** The number this card represents */
    number: number
    /** Practice mode */
    mode: CardMode
    /** Language this card belongs to */
    languageId: LanguageId
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

/** Card mode - determines how the user practices */
export type CardMode = 'listen' | 'speak'

/** Visual decay state for UI representation */
export type DecayState = 'locked' | 'new' | 'gold' | 'faded' | 'rusty'

/** Rating for FSRS based on response time */
export type ResponseRating = 'again' | 'good' | 'easy'
