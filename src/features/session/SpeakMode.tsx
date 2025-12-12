import { getLanguage } from '@features/languages'
import { MicButton, VUMeter } from '@shared/components'
import { useAudioAnalyzer, useSTT, useTTS } from '@shared/hooks'
import { useProgressStore, useSessionStore, useSettingsStore } from '@shared/stores'
import { ArrowRight, RotateCcw, Volume2 } from 'lucide-react'
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

    const { speakNumber } = useTTS({ languageId })

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

                // Speak matching number
                speakNumber(card.number)

                // No auto-advance - user clicks Next to continue
            } else if (isFinal) {
                // Final result but wrong - wait for silence/timeout before failing
                silenceTimeoutRef.current = setTimeout(() => {
                    // Fail state
                    setFeedback('incorrect')
                    setIsListening(false)
                    reviewCard(card.id, 'again')

                    // Speak on failure so they know correct pronunciation
                    speakNumber(card.number)

                    // NOTE: We do NOT auto-advance here anymore. User must click Next.
                }, SILENCE_TIMEOUT)
            }
        },
        [card, feedback, language, setTranscript, setFeedback, setIsListening, reviewCard, calculateRating, nextCard, speakNumber],
    )

    const { isSupported, start, stop, error } = useSTT({
        languageId,
        onResult: handleResult,
        onError: (err) => {
            // eslint-disable-next-line no-console
            console.warn('STT error:', err)
        },
    })

    const volume = useAudioAnalyzer(isListening)

    // Restart listening when card changes
    useEffect(() => {
        if (!card || !isSupported) return

        // If we are already showing feedback, don't restart
        if (feedback) return

        // Stop previous (if any)
        stop()
        setIsListening(false)

        // Small delay to ensure clean restart state
        const timer = setTimeout(() => {
            start()
            setIsListening(true)
        }, 500)

        return () => {
            clearTimeout(timer)
            stop()
        }
    }, [card, isSupported, feedback, start, stop, setIsListening])

    // Cleanup timeouts on unmount or card change
    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
            }
        }
    }, [card])

    // Manual Mic Toggle
    const handleMicClick = useCallback(() => {
        if (isListening) {
            stop()
            setIsListening(false)
        } else {
            start()
            setIsListening(true)
        }
    }, [isListening, start, stop, setIsListening])

    // Skip Button Handler - plays pronunciation but keeps recognition running for another try
    const handleSkip = useCallback(() => {
        if (!card) return
        // Stop recognition temporarily while TTS plays (browser may stop mic during audio)
        stop()
        setIsListening(false)
        // Play the correct pronunciation as a hint
        speakNumber(card.number)
        // Restart recognition after TTS likely finishes (give it time to play)
        setTimeout(() => {
            start()
            setIsListening(true)
        }, 1500)
    }, [card, speakNumber, stop, start, setIsListening])

    const handleNext = useCallback(() => {
        nextCard()
    }, [nextCard])

    const handleListen = useCallback(() => {
        if (card) {
            speakNumber(card.number)
        }
    }, [card, speakNumber])

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
            {/* Top: Mode indicator + Skip Button */}
            <div className='w-full px-6 flex items-center justify-between'>
                <div className='w-12 flex justify-start'>
                    {!feedback && (
                        <button
                            onClick={handleListen}
                            className='p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-overlay)] transition-colors'
                            aria-label='Play pronunciation'
                        >
                            <Volume2 size={20} />
                        </button>
                    )}
                </div>
                <p className='text-[var(--text-muted)] text-sm'>Say this number</p>
                <div className='w-12 flex justify-end'>
                    {!feedback && (
                        <button
                            onClick={handleSkip}
                            className='text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors'
                        >
                            Skip
                        </button>
                    )}
                </div>
            </div>

            {/* Middle: Number display */}
            <div className='flex-1 flex flex-col items-center justify-center relative'>
                {/* Error Banner */}
                {error && !feedback && (
                    <div className='absolute top-0 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm mb-4'>
                        {error === 'not-allowed' ? 'Microphone access denied' : 'Microphone error'}
                        {error === 'not-allowed' && (
                            <div className='text-xs opacity-75 mt-1'>Check your browser permissions</div>
                        )}
                    </div>
                )}

                <motion.div
                    key={card.number}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`
font - mono text - 7xl font - bold transition - colors duration - 300
                        ${feedback === 'correct' ? 'text-[var(--success)]' : ''}
                        ${feedback === 'incorrect' ? 'text-[var(--error)]' : 'text-[var(--text-primary)]'}
`}
                >
                    {card.number}
                </motion.div>

                {/* Korean Text Hint */}
                <motion.div
                    key={`${card.number} -text`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='mt-4 text-4xl font-medium text-[var(--accent-primary)]'
                >
                    {language.numberToWords(card.number)}
                </motion.div>

                {/* Romanization (shown when feedback is given) */}
                {(feedback === 'correct' || feedback === 'incorrect') && language.numberToRomanized && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-2 text-xl text-[var(--text-secondary)] font-medium'
                    >
                        {language.numberToRomanized(card.number)}
                    </motion.div>
                )}

                {/* Transcript display */}
                {transcript && !feedback && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-6 text-lg text-[var(--text-secondary)]'
                    >
                        "{transcript}"
                    </motion.p>
                )}
            </div>

            {/* Bottom: Controls */}
            <div className='h-24 flex items-center justify-center w-full px-8'>
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
                            onClick={handleListen}
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
                    /* Mic Control */
                    isListening ? (
                        <div onClick={handleMicClick} className='cursor-pointer'>
                            <VUMeter level={volume} />
                        </div>
                    ) : (
                        <div className='flex flex-col items-center gap-2'>
                            <MicButton isListening={isListening} onClick={handleMicClick} disabled={feedback !== null} />
                            {!isListening && !feedback && !error && (
                                <span className='text-xs text-[var(--text-muted)]'>Paused</span>
                            )}
                            {!isListening && error && (
                                <button onClick={handleMicClick} className='flex items-center gap-1 text-sm text-[var(--primary)]'>
                                    <RotateCcw size={14} /> Retry
                                </button>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}
