import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CardState } from '../types'

import { useSessionStore } from './session-store'

const createMockCard = (overrides: Partial<CardState> = {}): CardState => ({
    id: 'sino-korean-1-listen',
    number: 1,
    mode: 'listen',
    languageId: 'sino-korean',
    stageIndex: 0,
    fsrs: {
        due: new Date(),
        stability: 1,
        difficulty: 5,
        reps: 0,
        lapses: 0,
        state: 'new',
    },
    ...overrides,
})

// Reset store between tests
beforeEach(() => {
    useSessionStore.getState().endSession()
    vi.useRealTimers()
})

describe('session-store', () => {
    describe('startSession', () => {
        it('should initialize session state correctly', () => {
            const cards = [createMockCard({ id: 'card-1' }), createMockCard({ id: 'card-2' })]

            useSessionStore.getState().startSession(cards)
            const state = useSessionStore.getState()

            expect(state.isActive).toBe(true)
            expect(state.queue.length).toBe(2)
            expect(state.currentIndex).toBe(0)
            expect(state.startTime).toBeInstanceOf(Date)
            expect(state.input).toBe('')
            expect(state.result).toBeNull()
        })

        it('should shuffle the queue', () => {
            // Use many cards to make shuffling detectable
            const cards = Array.from({ length: 20 }, (_, i) => createMockCard({ id: `card-${i}` }))

            // Run multiple times to check for shuffling
            const queues: string[][] = []
            for (let i = 0; i < 5; i++) {
                useSessionStore.getState().startSession([...cards])
                queues.push(useSessionStore.getState().queue.map((c) => c.id))
                useSessionStore.getState().endSession()
            }

            // At least one should be different (shuffled)
            const allSame = queues.every((q) => JSON.stringify(q) === JSON.stringify(queues[0]))
            // Very unlikely to be all same with 20 cards shuffled 5 times
            expect(allSame).toBe(false)
        })
    })

    describe('endSession', () => {
        it('should reset all session state', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().endSession()

            const state = useSessionStore.getState()
            expect(state.isActive).toBe(false)
            expect(state.queue).toEqual([])
            expect(state.currentIndex).toBe(0)
            expect(state.startTime).toBeNull()
            expect(state.input).toBe('')
            expect(state.result).toBeNull()
        })
    })

    describe('getCurrentCard', () => {
        it('should return the current card', () => {
            const card = createMockCard({ id: 'test-card' })
            useSessionStore.getState().startSession([card])

            const current = useSessionStore.getState().getCurrentCard()
            // Note: queue is shuffled, but with 1 card it will be the same
            expect(current?.id).toBe('test-card')
        })

        it('should return null when no session is active', () => {
            expect(useSessionStore.getState().getCurrentCard()).toBeNull()
        })
    })

    describe('nextCard', () => {
        it('should advance to the next card', () => {
            const cards = [createMockCard({ id: 'card-1', number: 1 }), createMockCard({ id: 'card-2', number: 2 })]

            useSessionStore.getState().startSession(cards)
            useSessionStore.getState().nextCard()

            expect(useSessionStore.getState().currentIndex).toBe(1)
        })

        it('should reset input and result when advancing', () => {
            const cards = [createMockCard(), createMockCard()]

            useSessionStore.getState().startSession(cards)
            useSessionStore.getState().setInput('123')
            useSessionStore.getState().setResult('correct')
            useSessionStore.getState().nextCard()

            expect(useSessionStore.getState().input).toBe('')
            expect(useSessionStore.getState().result).toBeNull()
        })

        it('should end session when no more cards', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().nextCard()

            expect(useSessionStore.getState().isActive).toBe(false)
        })
    })

    describe('setInput / clearInput', () => {
        it('should update input value', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().setInput('42')

            expect(useSessionStore.getState().input).toBe('42')
        })

        it('should clear input', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().setInput('42')
            useSessionStore.getState().clearInput()

            expect(useSessionStore.getState().input).toBe('')
        })
    })

    describe('setResult', () => {
        it('should set correct result', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().setResult('correct')

            expect(useSessionStore.getState().result).toBe('correct')
        })

        it('should set incorrect result', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().setResult('incorrect')

            expect(useSessionStore.getState().result).toBe('incorrect')
        })

        it('should reset result to null', () => {
            useSessionStore.getState().startSession([createMockCard()])
            useSessionStore.getState().setResult('correct')
            useSessionStore.getState().setResult(null)

            expect(useSessionStore.getState().result).toBeNull()
        })
    })

    describe('calculateRating', () => {
        it('should return "again" for incorrect answers', () => {
            useSessionStore.getState().startSession([createMockCard()])
            const rating = useSessionStore.getState().calculateRating(false)

            expect(rating).toBe('again')
        })

        it('should return "easy" for fast correct answers (< 2 seconds)', () => {
            vi.useFakeTimers()
            const now = new Date()
            vi.setSystemTime(now)

            useSessionStore.getState().startSession([createMockCard()])

            // Advance 1 second (fast answer)
            vi.setSystemTime(new Date(now.getTime() + 1000))

            const rating = useSessionStore.getState().calculateRating(true)
            expect(rating).toBe('easy')
        })

        it('should return "good" for slower correct answers (>= 2 seconds)', () => {
            vi.useFakeTimers()
            const now = new Date()
            vi.setSystemTime(now)

            useSessionStore.getState().startSession([createMockCard()])

            // Advance 3 seconds (slower answer)
            vi.setSystemTime(new Date(now.getTime() + 3000))

            const rating = useSessionStore.getState().calculateRating(true)
            expect(rating).toBe('good')
        })

        it('should return "good" if cardStartTime is null', () => {
            useSessionStore.setState({ cardStartTime: null })
            const rating = useSessionStore.getState().calculateRating(true)

            expect(rating).toBe('good')
        })
    })

    describe('listening state', () => {
        it('should set isListening', () => {
            useSessionStore.getState().setIsListening(true)
            expect(useSessionStore.getState().isListening).toBe(true)

            useSessionStore.getState().setIsListening(false)
            expect(useSessionStore.getState().isListening).toBe(false)
        })

        it('should set transcript', () => {
            useSessionStore.getState().setTranscript('오십사')
            expect(useSessionStore.getState().transcript).toBe('오십사')
        })
    })

    describe('isTimeLimitReached', () => {
        it('should return false when session just started', () => {
            useSessionStore.getState().startSession([createMockCard()])
            expect(useSessionStore.getState().isTimeLimitReached()).toBe(false)
        })

        it('should return true after 10 minutes', () => {
            vi.useFakeTimers()
            const now = new Date()
            vi.setSystemTime(now)

            useSessionStore.getState().startSession([createMockCard()])

            // Advance 11 minutes
            vi.setSystemTime(new Date(now.getTime() + 11 * 60 * 1000))

            expect(useSessionStore.getState().isTimeLimitReached()).toBe(true)
        })

        it('should return false when no session is active', () => {
            expect(useSessionStore.getState().isTimeLimitReached()).toBe(false)
        })
    })

    describe('getRemainingCount', () => {
        it('should return correct remaining count', () => {
            const cards = [createMockCard(), createMockCard(), createMockCard()]
            useSessionStore.getState().startSession(cards)

            expect(useSessionStore.getState().getRemainingCount()).toBe(3)

            useSessionStore.getState().nextCard()
            expect(useSessionStore.getState().getRemainingCount()).toBe(2)
        })
    })

    describe('getProgress', () => {
        it('should return 0 when queue is empty', () => {
            expect(useSessionStore.getState().getProgress()).toBe(0)
        })

        it('should return correct progress percentage', () => {
            const cards = [createMockCard(), createMockCard(), createMockCard(), createMockCard()]
            useSessionStore.getState().startSession(cards)

            expect(useSessionStore.getState().getProgress()).toBe(0)

            useSessionStore.getState().nextCard()
            expect(useSessionStore.getState().getProgress()).toBe(25)

            useSessionStore.getState().nextCard()
            expect(useSessionStore.getState().getProgress()).toBe(50)
        })
    })
})
