import type { CardState } from '@srs/types.ts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { calculateDecayState, useProgressStore } from './progress-store.ts'

// Reset store between tests
beforeEach(() => {
    // Clear localStorage first
    localStorage.clear()
    // Then reset the store state
    useProgressStore.setState({ allCardsByID: {}, unlockedStages: {} })
})

describe('progress-store', () => {
    describe('calculateDecayState', () => {
        const createCardWithFsrs = (overrides: Partial<CardState['fsrs']>): CardState => ({
            id: 'test-card',
            number: 1,
            mode: 'listen',
            languageId: 'sino-korean',
            stageIndex: 0,
            fsrs: {
                due: new Date(),
                stability: 1,
                difficulty: 5,
                reps: 1,
                lapses: 0,
                state: 'review',
                lastReview: new Date(),
                ...overrides,
            },
        })

        it('should return "new" for cards that have never been reviewed', () => {
            const card = createCardWithFsrs({ state: 'new', reps: 0 })
            expect(calculateDecayState(card)).toBe('new')
        })

        it('should return "gold" for cards not yet due', () => {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const card = createCardWithFsrs({ due: tomorrow, reps: 1 })
            expect(calculateDecayState(card)).toBe('gold')
        })

        it('should return "faded" for cards due within a week', () => {
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
            const card = createCardWithFsrs({ due: threeDaysAgo, reps: 1 })
            expect(calculateDecayState(card)).toBe('faded')
        })

        it('should return "rusty" for cards overdue by more than a week', () => {
            const twoWeeksAgo = new Date()
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
            const card = createCardWithFsrs({ due: twoWeeksAgo, reps: 1 })
            expect(calculateDecayState(card)).toBe('rusty')
        })

        it('should use provided "now" date for calculations', () => {
            const due = new Date('2024-01-15')
            const card = createCardWithFsrs({ due, reps: 1 })

            // Before due date
            expect(calculateDecayState(card, new Date('2024-01-10'))).toBe('gold')
            // Just after due
            expect(calculateDecayState(card, new Date('2024-01-16'))).toBe('faded')
            // More than a week after due
            expect(calculateDecayState(card, new Date('2024-01-25'))).toBe('rusty')
        })
    })

    describe('initializeLanguage', () => {
        it('should initialize a language with stage 0 unlocked', () => {
            useProgressStore.getState().initializeLanguage('sino-korean')

            // Get fresh state after mutation
            expect(useProgressStore.getState().unlockedStages['sino-korean']).toBe(0)
        })

        it('should not re-initialize an already initialized language', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            // Manually change the unlocked stage to verify it's not reset
            useProgressStore.setState({
                unlockedStages: { 'sino-korean': 2 },
            })

            store.initializeLanguage('sino-korean')
            expect(useProgressStore.getState().unlockedStages['sino-korean']).toBe(2)
        })
    })

    describe('getOrCreateCard', () => {
        it('should create a new card with FSRS defaults', () => {
            const store = useProgressStore.getState()
            const card = store.getOrCreateCard('sino-korean', 5, 'listen', 0)

            expect(card.id).toBe('sino-korean-5-listen')
            expect(card.number).toBe(5)
            expect(card.mode).toBe('listen')
            expect(card.languageId).toBe('sino-korean')
            expect(card.stageIndex).toBe(0)
            expect(card.fsrs.state).toBe('new')
            expect(card.fsrs.reps).toBe(0)
        })

        it('should return existing card if already created', () => {
            const store = useProgressStore.getState()
            const card1 = store.getOrCreateCard('sino-korean', 5, 'listen', 0)
            const card2 = store.getOrCreateCard('sino-korean', 5, 'listen', 0)

            expect(card1).toBe(card2)
        })

        it('should create different cards for different modes', () => {
            const store = useProgressStore.getState()
            const listenCard = store.getOrCreateCard('sino-korean', 5, 'listen', 0)
            const speakCard = store.getOrCreateCard('sino-korean', 5, 'speak', 0)

            expect(listenCard.id).toBe('sino-korean-5-listen')
            expect(speakCard.id).toBe('sino-korean-5-speak')
            expect(listenCard.id).not.toBe(speakCard.id)
        })
    })

    describe('reviewCard', () => {
        it('should update card FSRS data on review', () => {
            const card = useProgressStore.getState().getOrCreateCard('sino-korean', 1, 'listen', 0)

            useProgressStore.getState().reviewCard(card.id, 'good')

            // Get fresh state after mutation
            const updatedCard = useProgressStore.getState().allCardsByID[card.id]
            expect(updatedCard.fsrs.reps).toBe(1)
            expect(updatedCard.fsrs.lastReview).toBeDefined()
            // State should change from 'new' after first review
            expect(updatedCard.fsrs.state).not.toBe('new')
        })

        it('should handle "again" rating (incorrect answer)', () => {
            const card = useProgressStore.getState().getOrCreateCard('sino-korean', 1, 'listen', 0)

            useProgressStore.getState().reviewCard(card.id, 'again')

            // Get fresh state after mutation
            const updatedCard = useProgressStore.getState().allCardsByID[card.id]
            expect(updatedCard.fsrs.reps).toBe(1)
        })

        it('should handle "easy" rating (fast correct answer)', () => {
            const card = useProgressStore.getState().getOrCreateCard('sino-korean', 1, 'listen', 0)

            useProgressStore.getState().reviewCard(card.id, 'easy')

            // Get fresh state after mutation
            const updatedCard = useProgressStore.getState().allCardsByID[card.id]
            expect(updatedCard.fsrs.reps).toBe(1)
        })

        it('should do nothing for non-existent card', () => {
            const store = useProgressStore.getState()
            // Should not throw
            store.reviewCard('non-existent-card', 'good')
        })
    })

    describe('getAllDueCards', () => {
        it('should return empty array when no cards exist', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')
            const dueCards = store.getAllDueCards('sino-korean', false)

            expect(dueCards).toEqual([])
        })

        it('should not return new cards (only due reviewed cards)', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')
            store.getOrCreateCard('sino-korean', 1, 'listen', 0)

            const dueCards = store.getAllDueCards('sino-korean', false)
            expect(dueCards).toEqual([])
        })

        it('should filter out speak cards in quiet mode', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            // Create and review cards
            const listenCard = store.getOrCreateCard('sino-korean', 1, 'listen', 0)
            const speakCard = store.getOrCreateCard('sino-korean', 1, 'speak', 0)

            // Review both cards
            store.reviewCard(listenCard.id, 'again')
            store.reviewCard(speakCard.id, 'again')

            // Use vi.useFakeTimers to make cards due
            vi.useFakeTimers()
            vi.setSystemTime(new Date(Date.now() + 60 * 60 * 1000)) // 1 hour later

            const dueCardsNormal = store.getAllDueCards('sino-korean', false)
            const dueCardsQuiet = store.getAllDueCards('sino-korean', true)

            expect(dueCardsNormal.some((c) => c.mode === 'speak')).toBe(true)
            expect(dueCardsQuiet.every((c) => c.mode === 'listen')).toBe(true)

            vi.useRealTimers()
        })
    })

    describe('getNewCards', () => {
        it('should return new cards from the frontier stage', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            const newCards = store.getNewCards('sino-korean', false, 10)

            expect(newCards.length).toBeGreaterThan(0)
            expect(newCards.every((c) => c.fsrs.state === 'new')).toBe(true)
        })

        it('should respect the limit parameter', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            const newCards = store.getNewCards('sino-korean', false, 2)

            expect(newCards.length).toBe(2)
        })

        it('should only return listen cards in quiet mode', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            const newCards = store.getNewCards('sino-korean', true, 10)

            expect(newCards.every((c) => c.mode === 'listen')).toBe(true)
        })
    })

    describe('isStageUnlocked', () => {
        it('should return true for stage 0 after initialization', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            expect(store.isStageUnlocked('sino-korean', 0)).toBe(true)
        })

        it('should return false for stage 1 initially', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            expect(store.isStageUnlocked('sino-korean', 1)).toBe(false)
        })
    })

    describe('getStageDecayState', () => {
        it('should return "locked" for stages beyond the unlocked stage', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            expect(store.getStageDecayState('sino-korean', 5, 'listen')).toBe('locked')
        })

        it('should return "new" for frontier stage with no reviewed cards', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')

            expect(store.getStageDecayState('sino-korean', 0, 'listen')).toBe('new')
        })
    })

    describe('resetProgress', () => {
        it('should clear all cards and unlocked stages', () => {
            const store = useProgressStore.getState()
            store.initializeLanguage('sino-korean')
            store.getOrCreateCard('sino-korean', 1, 'listen', 0)

            store.resetProgress()

            expect(Object.keys(useProgressStore.getState().allCardsByID)).toHaveLength(0)
            expect(Object.keys(useProgressStore.getState().unlockedStages)).toHaveLength(0)
        })
    })
})
