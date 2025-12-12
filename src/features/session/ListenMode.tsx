import { DigitDisplay, Keypad } from '@shared/components'
import { useTTS } from '@shared/hooks'
import { useSessionStore, useSettingsStore, useProgressStore } from '@shared/stores'
import { ArrowRight, Volume2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

const WRONG_ANSWER_DELAY = 500 // ms before marking wrong

/**
 * Listen mode: Audio plays, user types the number.
 */
export function ListenMode() {
    const languageId = useSettingsStore((s) => s.languageId)
    const { input, setInput, feedback, setFeedback, getCurrentCard, nextCard, calculateRating } = useSessionStore()
    const reviewCard = useProgressStore((s) => s.reviewCard)

    const card = getCurrentCard()
    const wrongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const { speakNumber } = useTTS({
        languageId,
        onEnd: () => {
            // Audio finished, user can now type
        },
    })

    // Play audio when card changes
    useEffect(() => {
        if (card) {
            speakNumber(card.number)
        }

        // Clear any pending timeout
        return () => {
            if (wrongTimeoutRef.current) {
                clearTimeout(wrongTimeoutRef.current)
            }
        }
    }, [card, speakNumber])

    // Check answer when input changes
    useEffect(() => {
        if (!card || feedback) return

        const target = String(card.number)

        // If input length matches target length
        if (input.length === target.length) {
            if (input === target) {
                // Correct!
                setFeedback('correct')
                const rating = calculateRating(true)
                reviewCard(card.id, rating)
                // No auto-advance - user clicks Next
            } else {
                // Wrong - wait briefly for correction
                wrongTimeoutRef.current = setTimeout(() => {
                    setFeedback('incorrect')
                    reviewCard(card.id, 'again')

                    // Show correct answer and replay audio
                    speakNumber(card.number)
                    // No auto-advance - user clicks Next
                }, WRONG_ANSWER_DELAY)
            }
        } else {
            // Clear timeout if user is still typing
            if (wrongTimeoutRef.current) {
                clearTimeout(wrongTimeoutRef.current)
                wrongTimeoutRef.current = null
            }
        }
    }, [input, card, feedback, setFeedback, reviewCard, calculateRating, nextCard, speakNumber])

    const handleKeyPress = useCallback(
        (key: string) => {
            if (feedback) return
            setInput(input + key)
        },
        [input, setInput, feedback],
    )

    const handleBackspace = useCallback(() => {
        if (feedback) return
        setInput(input.slice(0, -1))
    }, [input, setInput, feedback])

    const handleReplay = useCallback(() => {
        if (card) {
            speakNumber(card.number)
        }
    }, [card, speakNumber])

    const handleNext = useCallback(() => {
        nextCard()
    }, [nextCard])

    if (!card) return null

    const digitCount = String(card.number).length

    return (
        <div className='flex flex-col items-center justify-between h-full py-8'>
            {/* Top: Replay button */}
            <button
                type='button'
                onClick={handleReplay}
                className='p-4 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] transition-colors'
                aria-label='Replay audio'
            >
                <svg
                    className='w-8 h-8 text-[var(--accent-primary)]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                    />
                </svg>
            </button>

            {/* Middle: Digit display */}
            <div className='flex-1 flex items-center justify-center'>
                <DigitDisplay value={input} digitCount={digitCount} feedback={feedback} />
            </div>

            {/* Show correct answer on error */}
            {feedback === 'incorrect' && (
                <div className='text-center mb-4'>
                    <p className='text-[var(--text-muted)] text-sm mb-1'>Correct answer</p>
                    <p className='font-mono text-3xl text-[var(--error)]'>{card.number}</p>
                </div>
            )}

            {/* Bottom: Keypad or Next button */}
            {feedback === 'correct' ? (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={handleNext}
                    className='h-14 px-8 rounded-full bg-[var(--success)] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity'
                >
                    Next <ArrowRight size={20} />
                </motion.button>
            ) : feedback === 'incorrect' ? (
                <div className='flex items-center gap-6'>
                    {/* Listen Again */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={handleReplay}
                        className='w-14 h-14 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors'
                    >
                        <Volume2 size={24} />
                    </motion.button>

                    {/* Next Card */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={handleNext}
                        className='h-14 px-8 rounded-full bg-[var(--primary)] text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity'
                    >
                        Next <ArrowRight size={20} />
                    </motion.button>
                </div>
            ) : (
                <Keypad onKeyPress={handleKeyPress} onBackspace={handleBackspace} disabled={feedback !== null} />
            )}
        </div>
    )
}
