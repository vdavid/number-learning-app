import { create } from 'zustand'

import type { CardState, ResponseRating } from '../types'

/** Result after answering - null means still attempting */
export type AttemptResult = 'correct' | 'incorrect' | null

/**
 * Seeded PRNG for deterministic shuffling in tests.
 * Uses a simple LCG (Linear Congruential Generator).
 */
let shuffleSeed: number | null = null

/** Set the shuffle seed for deterministic ordering (null = use Math.random) */
export function setShuffleSeed(seed: number | null): void {
    shuffleSeed = seed
}

/** Seeded random number generator */
function seededRandom(): number {
    if (shuffleSeed === null) {
        return Math.random()
    }
    // LCG parameters (same as glibc)
    shuffleSeed = (shuffleSeed * 1103515245 + 12345) & 0x7fffffff
    return shuffleSeed / 0x7fffffff
}

/** Fisher-Yates shuffle with seeded random */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

interface SessionState {
    /** Whether a session is active */
    isActive: boolean

    /** Queue of cards to review in this session */
    queue: CardState[]

    /** Current card index in the queue */
    currentIndex: number

    /** Session start time */
    startTime: Date | null

    /** Current input value (for listen mode) */
    input: string

    /** Time when current card was shown */
    cardStartTime: Date | null

    /** Current attempt result - null means still attempting */
    result: AttemptResult

    /** Whether STT is currently listening */
    isListening: boolean

    /** Current STT transcript */
    transcript: string

    /** Start a new session with the given cards */
    startSession: (cards: CardState[]) => void

    /** End the current session */
    endSession: () => void

    /** Get the current card */
    getCurrentCard: () => CardState | null

    /** Move to the next card */
    nextCard: () => void

    /** Update input value */
    setInput: (value: string) => void

    /** Clear input */
    clearInput: () => void

    /** Set attempt result */
    setResult: (result: AttemptResult) => void

    /** Calculate rating based on response time */
    calculateRating: (correct: boolean) => ResponseRating

    /** Set listening state */
    setIsListening: (listening: boolean) => void

    /** Set transcript */
    setTranscript: (transcript: string) => void

    /** Check if session time limit is reached (10 minutes) */
    isTimeLimitReached: () => boolean

    /** Get remaining cards count */
    getRemainingCount: () => number

    /** Get progress percentage */
    getProgress: () => number
}

const SESSION_TIME_LIMIT_MS = 10 * 60 * 1000 // 10 minutes
const EASY_THRESHOLD_MS = 2000 // 2 seconds for "easy" rating

export const useSessionStore = create<SessionState>((set, get) => ({
    isActive: false,
    queue: [],
    currentIndex: 0,
    startTime: null,
    input: '',
    cardStartTime: null,
    result: null,
    isListening: false,
    transcript: '',

    startSession: (cards: CardState[]) => {
        // Shuffle the queue for variety (uses seeded random if seed is set)
        const shuffled = shuffleArray(cards)
        const now = new Date()

        set({
            isActive: true,
            queue: shuffled,
            currentIndex: 0,
            startTime: now,
            input: '',
            cardStartTime: now,
            result: null,
            isListening: false,
            transcript: '',
        })
    },

    endSession: () => {
        set({
            isActive: false,
            queue: [],
            currentIndex: 0,
            startTime: null,
            input: '',
            cardStartTime: null,
            result: null,
            isListening: false,
            transcript: '',
        })
    },

    getCurrentCard: () => {
        const { queue, currentIndex } = get()
        return queue[currentIndex] ?? null
    },

    nextCard: () => {
        const { currentIndex, queue } = get()
        const nextIndex = currentIndex + 1

        if (nextIndex >= queue.length) {
            // Session complete
            get().endSession()
            return
        }

        set({
            currentIndex: nextIndex,
            input: '',
            cardStartTime: new Date(),
            result: null,
            isListening: false,
            transcript: '',
        })
    },

    setInput: (value: string) => {
        set({ input: value })
    },

    clearInput: () => {
        set({ input: '' })
    },

    setResult: (result: AttemptResult) => {
        set({ result })
    },

    calculateRating: (correct: boolean): ResponseRating => {
        if (!correct) return 'again'

        const { cardStartTime } = get()
        if (!cardStartTime) return 'good'

        const responseTime = Date.now() - cardStartTime.getTime()
        return responseTime < EASY_THRESHOLD_MS ? 'easy' : 'good'
    },

    setIsListening: (listening: boolean) => {
        set({ isListening: listening })
    },

    setTranscript: (transcript: string) => {
        set({ transcript })
    },

    isTimeLimitReached: () => {
        const { startTime } = get()
        if (!startTime) return false
        return Date.now() - startTime.getTime() >= SESSION_TIME_LIMIT_MS
    },

    getRemainingCount: () => {
        const { queue, currentIndex } = get()
        return queue.length - currentIndex
    },

    getProgress: () => {
        const { queue, currentIndex } = get()
        if (queue.length === 0) return 0
        return (currentIndex / queue.length) * 100
    },
}))
