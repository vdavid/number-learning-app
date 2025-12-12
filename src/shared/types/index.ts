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

/** A stage in the curriculum */
export interface Stage {
    /** Display name for the stage */
    name: string
    /** Description of what this stage covers */
    description: string
    /** Numbers included in this stage */
    numbers: number[]
}

/** Curriculum structure for a language */
export interface Curriculum {
    /** All stages in learning order */
    stages: Stage[]
}

/** Rating for FSRS based on response time */
export type ResponseRating = 'again' | 'good' | 'easy'

/** Session result for a single card */
export interface CardResult {
    cardId: string
    rating: ResponseRating
    responseTimeMs: number
}
