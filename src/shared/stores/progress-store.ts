import { getLanguage } from '@features/languages'
import { createEmptyCard, fsrs, generatorParameters, type Card as FSRSCard, Rating, State } from 'ts-fsrs'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { CardMode, CardState, DecayState, ResponseRating } from '../types'

/** Disable fuzz in test mode for deterministic scheduling */
const isTestMode = import.meta.env.MODE === 'test'

/** Parameters for FSRS algorithm */
const fsrsParams = generatorParameters({ enable_fuzz: !isTestMode })
const scheduler = fsrs(fsrsParams)

/** Generate a unique card ID */
function makeCardId(languageId: string, number: number, mode: CardMode): string {
    return `${languageId}-${number}-${mode}`
}

/** Convert our rating to FSRS rating */
function toFSRSRating(rating: ResponseRating): Rating {
    switch (rating) {
        case 'again':
            return Rating.Again
        case 'good':
            return Rating.Good
        case 'easy':
            return Rating.Easy
    }
}

/** Convert FSRS state to our state */
function fromFSRSState(state: State): CardState['fsrs']['state'] {
    switch (state) {
        case State.New:
            return 'new'
        case State.Learning:
            return 'learning'
        case State.Review:
            return 'review'
        case State.Relearning:
            return 'relearning'
    }
}

/** Calculate decay state based on card's due date and stability */
export function calculateDecayState(card: CardState, now: Date = new Date()): DecayState {
    const { fsrs: fsrsData } = card

    // New cards that haven't been reviewed
    if (fsrsData.state === 'new' && fsrsData.reps === 0) {
        return 'new'
    }

    const due = new Date(fsrsData.due)
    const daysSinceDue = (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)

    // Not yet due - gold (mastered)
    if (daysSinceDue < 0) {
        return 'gold'
    }

    // Due within a week - faded
    if (daysSinceDue < 7) {
        return 'faded'
    }

    // Overdue by more than a week - rusty
    return 'rusty'
}

/** Calculate the worst decay state for a stage's cards */
function calculateStageWorstDecay(
    cards: Record<string, CardState>,
    languageId: string,
    numbers: readonly number[],
    mode: CardMode,
    isFrontierStage: boolean,
): DecayState {
    let hasReviewedCards = false
    let worstDecay: DecayState = 'gold'

    for (const number of numbers) {
        const cardId = makeCardId(languageId, number, mode)
        const card = cards[cardId]

        if (!card) continue
        if (isFrontierStage && card.fsrs.reps === 0) continue

        hasReviewedCards = true
        const decay = calculateDecayState(card)

        if (decay === 'rusty') {
            if (!isFrontierStage) return 'rusty'
            worstDecay = 'rusty'
        } else if (decay === 'faded' && worstDecay !== 'rusty') {
            worstDecay = 'faded'
        }
    }

    if (isFrontierStage && !hasReviewedCards) {
        return 'new'
    }

    return worstDecay
}

interface ProgressState {
    /** All cards by ID (`${languageId}-${number}-${mode}`) */
    allCardsByID: Record<string, CardState>

    /** Highest unlocked stage per language (0-indexed) */
    unlockedStages: Record<string, number>

    /** Initialize cards for a language if not already done */
    initializeLanguage: (languageId: string) => void

    getOrCreateCard: (languageId: string, number: number, mode: CardMode, stageIndex: number) => CardState

    /** Review a card and update its FSRS data */
    reviewCard: (cardId: string, rating: ResponseRating) => void

    getAllDueCards: (languageId: string, quietMode: boolean) => CardState[]

    /** Get new cards from the frontier stage */
    getNewCards: (languageId: string, quietMode: boolean, limit: number) => CardState[]

    isStageUnlocked: (languageId: string, stageIndex: number) => boolean

    /** Unlock the next stage if conditions are met */
    checkAndUnlockNextStage: (languageId: string) => void

    /** Get decay state for a stage's nodes */
    getStageDecayState: (languageId: string, stageIndex: number, mode: CardMode) => DecayState

    /** Reset all progress (for testing/debug) */
    resetProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            allCardsByID: {},
            unlockedStages: {},

            initializeLanguage: (languageId: string) => {
                const state = get()
                if (state.unlockedStages[languageId] !== undefined) {
                    return // Already initialized
                }

                set({
                    unlockedStages: {
                        ...state.unlockedStages,
                        [languageId]: 0, // Start with first stage unlocked
                    },
                })
            },

            getOrCreateCard: (languageId: string, number: number, mode: CardMode, stageIndex: number) => {
                const cardId = makeCardId(languageId, number, mode)
                const existing = get().allCardsByID[cardId]

                if (existing) {
                    return existing
                }

                const fsrsCard = createEmptyCard()
                const newCard: CardState = {
                    id: cardId,
                    number,
                    mode,
                    languageId,
                    stageIndex,
                    fsrs: {
                        due: fsrsCard.due,
                        stability: fsrsCard.stability,
                        difficulty: fsrsCard.difficulty,
                        reps: fsrsCard.reps,
                        lapses: fsrsCard.lapses,
                        state: fromFSRSState(fsrsCard.state),
                        lastReview: fsrsCard.last_review ?? undefined,
                    },
                }

                set((state) => ({
                    allCardsByID: { ...state.allCardsByID, [cardId]: newCard },
                }))

                return newCard
            },

            reviewCard: (cardId: string, rating: ResponseRating) => {
                const card = get().allCardsByID[cardId]
                if (!card) return

                // Convert our card state to FSRS card
                const stateKey = (card.fsrs.state.charAt(0).toUpperCase() +
                    card.fsrs.state.slice(1)) as keyof typeof State
                const fsrsCard: FSRSCard = {
                    due: new Date(card.fsrs.due),
                    stability: card.fsrs.stability,
                    difficulty: card.fsrs.difficulty,
                    elapsed_days: 0,
                    scheduled_days: 0,
                    reps: card.fsrs.reps,
                    lapses: card.fsrs.lapses,
                    state: State[stateKey],
                    last_review: card.fsrs.lastReview ? new Date(card.fsrs.lastReview) : undefined,
                    learning_steps: 0,
                }

                // Schedule with FSRS
                const now = new Date()
                const result = scheduler.repeat(fsrsCard, now)
                const fsrsRating = toFSRSRating(rating)
                // Get the scheduled card from the result - ts-fsrs v5 returns an object keyed by Rating
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
                const scheduledCard: FSRSCard = (result as any)[fsrsRating]?.card ?? fsrsCard

                // Update the card
                const updatedCard: CardState = {
                    ...card,
                    fsrs: {
                        due: scheduledCard.due,
                        stability: scheduledCard.stability,
                        difficulty: scheduledCard.difficulty,
                        reps: scheduledCard.reps,
                        lapses: scheduledCard.lapses,
                        state: fromFSRSState(scheduledCard.state),
                        lastReview: now,
                    },
                }

                set((state) => ({
                    allCardsByID: { ...state.allCardsByID, [cardId]: updatedCard },
                }))

                // Check if we should unlock the next stage
                get().checkAndUnlockNextStage(card.languageId)
            },

            getAllDueCards: (languageId: string, quietMode: boolean) => {
                const state = get()
                const now = new Date()
                const unlockedStage = state.unlockedStages[languageId] ?? 0

                return Object.values(state.allCardsByID)
                    .filter((card) => {
                        if (card.languageId !== languageId) return false
                        if (card.stageIndex > unlockedStage) return false
                        if (quietMode && card.mode === 'speak') return false
                        if (card.fsrs.state === 'new') return false

                        const due = new Date(card.fsrs.due)
                        return due <= now
                    })
                    .sort((a, b) => new Date(a.fsrs.due).getTime() - new Date(b.fsrs.due).getTime())
            },

            getNewCards: (languageId: string, quietMode: boolean, limit: number) => {
                const state = get()
                const unlockedStage = state.unlockedStages[languageId] ?? 0
                const language = getLanguage(languageId)
                const stage = language.curriculum.stages[unlockedStage]

                if (!stage) return []

                const newCards: CardState[] = []
                const modes: CardMode[] = quietMode ? ['listen'] : ['listen', 'speak']

                for (const number of stage.numbers) {
                    for (const mode of modes) {
                        if (newCards.length >= limit) break

                        const card = state.getOrCreateCard(languageId, number.value, mode, unlockedStage)
                        if (card.fsrs.state === 'new' && card.fsrs.reps === 0) {
                            newCards.push(card)
                        }
                    }
                    if (newCards.length >= limit) break
                }

                return newCards
            },

            isStageUnlocked: (languageId: string, stageIndex: number) => {
                const unlockedStage = get().unlockedStages[languageId] ?? 0
                return stageIndex <= unlockedStage
            },

            checkAndUnlockNextStage: (languageId: string) => {
                const state = get()
                const currentUnlocked = state.unlockedStages[languageId] ?? 0
                const language = getLanguage(languageId)
                const currentStage = language.curriculum.stages[currentUnlocked]

                if (!currentStage) return

                // Check if all cards in the current stage have been reviewed at least once
                let allReviewed = true
                for (const number of currentStage.numbers) {
                    for (const mode of ['listen', 'speak'] as CardMode[]) {
                        const cardId = makeCardId(languageId, number.value, mode)
                        const card = state.allCardsByID[cardId]
                        if (!card || card.fsrs.reps === 0) {
                            allReviewed = false
                            break
                        }
                    }
                    if (!allReviewed) break
                }

                // Unlock next stage if all reviewed and there are more stages
                if (allReviewed && currentUnlocked < language.curriculum.stages.length - 1) {
                    set({
                        unlockedStages: {
                            ...state.unlockedStages,
                            [languageId]: currentUnlocked + 1,
                        },
                    })
                }
            },

            getStageDecayState: (languageId: string, stageIndex: number, mode: CardMode) => {
                const state = get()
                const unlockedStage = state.unlockedStages[languageId] ?? 0

                if (stageIndex > unlockedStage) {
                    return 'locked'
                }

                const language = getLanguage(languageId)
                const stage = language.curriculum.stages[stageIndex]
                if (!stage) return 'locked'

                const isFrontierStage = stageIndex === unlockedStage
                return calculateStageWorstDecay(
                    state.allCardsByID,
                    languageId,
                    stage.numbers.map((num) => num.value),
                    mode,
                    isFrontierStage,
                )
            },

            resetProgress: () => {
                set({ allCardsByID: {}, unlockedStages: {} })
            },
        }),
        {
            name: 'number-trainer-progress',
            partialize: (state) => ({
                cards: state.allCardsByID,
                unlockedStages: state.unlockedStages,
            }),
        },
    ),
)
