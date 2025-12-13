import { getLanguage } from '@features/languages'
import { VUMeter } from '@shared/components'
import { useAudioAnalyzer, useSTT, useTTS } from '@shared/hooks'
import { useProgressStore, useSessionStore, useSettingsStore } from '@shared/stores'
import { ArrowRight, SkipForward, Volume2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

const SILENCE_TIMEOUT = 1500 // ms of silence before checking answer
const TTS_DELAY = 1500 // ms to wait for TTS to finish before restarting recognition

/**
 * Speak mode: Number shown, user speaks it.
 */
export function SpeakMode() {
    const languageId = useSettingsStore((s) => s.languageId)
    const {
        transcript,
        setTranscript,
        result,
        setResult,
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
    const sttRef = useRef<{ start: () => void; stop: () => void } | null>(null)
    const [transcriptKey, setTranscriptKey] = useState(0)

    const { speakNumber } = useTTS({ languageId })

    // Helper to play TTS and restart recognition after
    const playAndRestartRecognition = useCallback(() => {
        if (!card) return
        sttRef.current?.stop()
        setIsListening(false)
        speakNumber(card.number)
        setTimeout(() => {
            sttRef.current?.start()
            setIsListening(true)
        }, TTS_DELAY)
    }, [card, speakNumber, setIsListening])

    const handleResult = useCallback(
        (text: string, isFinal: boolean) => {
            // Always update transcript so user can see what they're saying
            setTranscript(text)
            setTranscriptKey((k) => k + 1)

            // If already resolved, don't re-evaluate (but still show transcript)
            if (result) return

            if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
            }

            if (!card) return

            const parsed = language.parseSpokenNumber(text)
            const isCorrect = parsed === card.number

            if (isCorrect) {
                setResult('correct')
                setTranscript('')
                reviewCard(card.id, calculateRating(true))
                playAndRestartRecognition()
            } else if (isFinal) {
                silenceTimeoutRef.current = setTimeout(() => {
                    setResult('incorrect')
                    reviewCard(card.id, 'again')
                    playAndRestartRecognition()
                }, SILENCE_TIMEOUT)
            }
        },
        [card, result, language, setTranscript, setResult, reviewCard, calculateRating, playAndRestartRecognition],
    )

    const { isSupported, start, stop, error } = useSTT({
        languageId,
        onResult: handleResult,
        onError: (err) => {
            // eslint-disable-next-line no-console
            console.warn('STT error:', err)
            setIsListening(false)
        },
        onEnd: () => {
            setIsListening(false)
        },
    })

    useEffect(() => {
        sttRef.current = { start, stop }
    }, [start, stop])

    const volume = useAudioAnalyzer(isListening)

    // Start listening when card changes (only if no feedback yet)
    useEffect(() => {
        if (!card || !isSupported || result) return

        stop()
        setIsListening(false)

        const timer = setTimeout(() => {
            start()
            setIsListening(true)
        }, 500)

        return () => {
            clearTimeout(timer)
            stop()
        }
    }, [card, isSupported, result, start, stop, setIsListening])

    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        }
    }, [card])

    const handleMicClick = useCallback(() => {
        if (isListening) {
            stop()
            setIsListening(false)
        } else {
            start()
            setIsListening(true)
        }
    }, [isListening, start, stop, setIsListening])

    const handleListen = useCallback(() => {
        if (!card) return
        stop()
        setIsListening(false)
        speakNumber(card.number)
        setTimeout(() => {
            start()
            setIsListening(true)
        }, TTS_DELAY)
    }, [card, speakNumber, stop, start, setIsListening])

    const handleNext = useCallback(() => {
        nextCard()
    }, [nextCard])

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
            {/* Top: Listen button + label + Skip */}
            <div className='w-full px-6 flex items-center justify-between'>
                <button
                    onClick={handleListen}
                    className='p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--surface-overlay)] transition-colors'
                    aria-label='Play pronunciation'
                >
                    <Volume2 size={20} />
                </button>
                <p className='text-[var(--text-muted)] text-sm'>Say this number</p>
                {!result ? (
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={handleListen}
                            className='text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors'
                        >
                            Hint
                        </button>
                        <button
                            onClick={handleNext}
                            className='p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-colors'
                            aria-label='Skip'
                        >
                            <SkipForward size={20} />
                        </button>
                    </div>
                ) : (
                    <div className='w-10' />
                )}
            </div>

            {/* Middle: Number display */}
            <div className='flex-1 flex flex-col items-center justify-center relative'>
                {error && (
                    <div className='absolute top-0 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm mb-4'>
                        {error === 'not-allowed' ? 'Microphone access denied' : 'Microphone error'}
                    </div>
                )}

                <motion.div
                    key={card.number}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`font-mono text-7xl font-bold transition-colors duration-300 ${
                        result === 'correct'
                            ? 'text-[var(--success)]'
                            : result === 'incorrect'
                              ? 'text-[var(--error)]'
                              : 'text-[var(--text-primary)]'
                    }`}
                >
                    {card.number}
                </motion.div>

                <motion.div
                    key={`${card.number}-text`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className='mt-4 text-4xl font-medium text-[var(--accent-primary)]'
                >
                    {language.numberToWords(card.number)}
                </motion.div>

                {result && language.numberToRomanized && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-2 text-xl text-[var(--text-secondary)] font-medium'
                    >
                        {language.numberToRomanized(card.number)}
                    </motion.div>
                )}

                {transcript && (
                    <motion.div
                        key='transcript-bubble'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mt-6 relative rounded-2xl px-4 py-2 shadow-sm overflow-hidden'
                    >
                        {/* Background flash on update */}
                        <motion.div
                            key={transcriptKey}
                            initial={{ backgroundColor: 'var(--accent-primary)', opacity: 0.3 }}
                            animate={{ backgroundColor: 'var(--bg-surface)', opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className='absolute inset-0 rounded-2xl'
                        />
                        <p className='relative text-lg text-[var(--text-secondary)]'>{transcript}</p>
                        {/* Speech bubble tail */}
                        <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[var(--bg-surface)]' />
                    </motion.div>
                )}
            </div>

            {/* Bottom: Mic + Next button */}
            <div className='h-24 flex items-center justify-center gap-6 w-full px-8'>
                {result && (
                    <button
                        onClick={handleListen}
                        className='w-14 h-14 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors'
                        aria-label='Play pronunciation'
                    >
                        <Volume2 size={24} />
                    </button>
                )}

                <div onClick={handleMicClick} className='cursor-pointer'>
                    <VUMeter level={volume} isListening={isListening} />
                </div>

                {result && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={handleNext}
                        className={`h-14 px-8 rounded-full text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity ${
                            result === 'correct' ? 'bg-[var(--success)]' : 'bg-[var(--primary)]'
                        }`}
                    >
                        Next <ArrowRight size={20} />
                    </motion.button>
                )}
            </div>
        </div>
    )
}
