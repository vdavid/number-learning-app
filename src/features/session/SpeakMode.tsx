import { getLanguage } from '@features/languages'
import { MicButton } from '@shared/components'
import { useSTT } from '@shared/hooks'
import { useSessionStore, useSettingsStore, useProgressStore } from '@shared/stores'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef } from 'react'

const SILENCE_TIMEOUT = 1500 // ms of silence before checking answer

/**
 * Speak mode: Number shown, user speaks it.
 */
export function SpeakMode() {
    const languageId = useSettingsStore((s) => s.languageId)
    const {
        transcript,
        setTranscript,
        feedback,
        setFeedback,
        isListening,
        setIsListening,
        getCurrentCard,
        nextCard,
        calculateRating,
    } = useSessionStore()
    const reviewCard = useProgressStore((s) => s.reviewCard)

    const card = getCurrentCard()
    const language = getLanguage(languageId)
    const silenceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleResult = useCallback(
        (text: string, isFinal: boolean) => {
            if (feedback) return

            setTranscript(text)

            // Clear any pending silence timeout
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
            }

            if (!card) return

            // Check if it matches
            const parsed = language.parseSpokenNumber(text)
            const isCorrect = parsed === card.number

            if (isCorrect) {
                // Correct!
                setFeedback('correct')
                setIsListening(false)
                const rating = calculateRating(true)
                reviewCard(card.id, rating)

                setTimeout(() => {
                    nextCard()
                }, 400)
            } else if (isFinal) {
                // Final result but wrong - set silence timeout
                silenceTimeoutRef.current = setTimeout(() => {
                    setFeedback('incorrect')
                    setIsListening(false)
                    reviewCard(card.id, 'again')

                    setTimeout(() => {
                        nextCard()
                    }, 1500)
                }, SILENCE_TIMEOUT)
            }
        },
        [card, feedback, language, setTranscript, setFeedback, setIsListening, reviewCard, calculateRating, nextCard],
    )

    const { isSupported, start, stop } = useSTT({
        languageId,
        onResult: handleResult,
        onError: (error) => {
            // eslint-disable-next-line no-console
            console.warn('STT error:', error)
        },
    })

    // Start listening when card changes
    useEffect(() => {
        if (card && isSupported && !feedback) {
            // Small delay to let UI settle
            const timer = setTimeout(() => {
                start()
                setIsListening(true)
            }, 500)

            return () => {
                clearTimeout(timer)
                stop()
            }
        }
    }, [card, isSupported, feedback, start, stop, setIsListening])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
            }
            stop()
        }
    }, [stop])

    const handleMicClick = useCallback(() => {
        if (isListening) {
            stop()
            setIsListening(false)
        } else {
            start()
            setIsListening(true)
        }
    }, [isListening, start, stop, setIsListening])

    if (!card) return null

    if (!isSupported) {
        return (
            <div className='flex flex-col items-center justify-center h-full text-center p-8'>
                <p className='text-[var(--error)] mb-4'>Speech recognition isn't supported in this browser.</p>
                <p className='text-[var(--text-muted)]'>Try using Chrome or Edge for the best experience.</p>
            </div>
        )
    }

    return (
        <div className='flex flex-col items-center justify-between h-full py-8'>
            {/* Top: Mode indicator */}
            <div className='text-center'>
                <p className='text-[var(--text-muted)] text-sm'>Say this number</p>
            </div>

            {/* Middle: Number display */}
            <div className='flex-1 flex flex-col items-center justify-center'>
                <motion.div
                    key={card.number}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
                        font-mono text-7xl font-bold
                        ${feedback === 'correct' ? 'text-[var(--success)]' : ''}
                        ${feedback === 'incorrect' ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}
                    `}
                >
                    {card.number}
                </motion.div>

                {/* Transcript display */}
                {transcript && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-6 text-lg text-[var(--text-secondary)]'
                    >
                        "{transcript}"
                    </motion.p>
                )}

                {/* Show correct pronunciation on error */}
                {feedback === 'incorrect' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-4 text-center'
                    >
                        <p className='text-[var(--text-muted)] text-sm mb-1'>Correct pronunciation</p>
                        <p className='text-xl text-[var(--accent-primary)]'>{language.numberToWords(card.number)}</p>
                    </motion.div>
                )}
            </div>

            {/* Bottom: Mic button */}
            <MicButton isListening={isListening} onClick={handleMicClick} disabled={feedback !== null} />
        </div>
    )
}
