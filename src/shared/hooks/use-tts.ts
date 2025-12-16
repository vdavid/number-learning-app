import { useCallback, useEffect, useRef } from 'react'

import { createDebugLogger, logger } from '../utils'

import { getLanguage } from '@/languages'

const log = createDebugLogger('app:tts')

// Test mode detection
const isTestMode = import.meta.env.MODE === 'test'

// Audio play log for E2E testing
interface AudioPlayLogEntry {
    url: string
    timestamp: number
    type: 'audio-file' | 'web-speech'
}

declare global {
    interface Window {
        __audioPlayLog?: AudioPlayLogEntry[]
    }
}

// Initialize audio play log in test mode
if (isTestMode && typeof window !== 'undefined') {
    window.__audioPlayLog = []
}

/** Log an audio play event (test mode only) */
function logAudioPlay(url: string, type: 'audio-file' | 'web-speech'): void {
    if (isTestMode && window.__audioPlayLog) {
        window.__audioPlayLog.push({ url, timestamp: Date.now(), type })
    }
}

/** Clear the audio play log (for E2E test setup) */
export function clearAudioPlayLog(): void {
    if (typeof window !== 'undefined') {
        window.__audioPlayLog = []
    }
}

type UseTTSOptions = {
    languageId: string
    onEnd?: () => void
}

/** Cache for chosen audio URLs per (languageId, number) - persists across renders */
const chosenAudioCache = new Map<string, string>()

/** Track in-flight audio selection to prevent race conditions */
const pendingAudioSelection = new Map<string, Promise<string | null>>()

/** Track in-flight speakNumber calls to prevent duplicate plays (e.g. from React Strict Mode) */
let speakNumberInProgress = false

/**
 * Build potential audio URLs for a number.
 */
function buildAudioUrls(languageId: string, num: number, voices: { id: string }[]): string[] {
    /** Try multiple audio formats in order of preference. */
    const audioFormats = ['mp3', 'opus'] as const

    const urls: string[] = []
    for (const voice of voices) {
        for (const format of audioFormats) {
            urls.push(`/${languageId}/audio/${num}-${voice.id}.${format}`)
        }
    }
    return urls
}

/**
 * Check if an audio file exists using a HEAD request.
 */
async function checkAudioExists(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        if (!response.ok) return false
        // Vite dev server returns 200 for missing files (serves index.html)
        // So we must check Content-Type to confirm it's actually audio
        const contentType = response.headers.get('Content-Type') || ''
        return contentType.startsWith('audio/')
    } catch {
        return false
    }
}

/**
 * Find all existing audio files from a list of URLs.
 */
async function findExistingAudioFiles(urls: string[]): Promise<string[]> {
    log('Checking %d potential audio URLs', urls.length)
    const results = await Promise.all(urls.map(async (url) => ({ url, exists: await checkAudioExists(url) })))
    const existing = results.filter((r) => r.exists).map((r) => r.url)
    if (existing.length === 0) {
        log('No audio files found among %d URLs', urls.length)
    } else {
        log('Found %d existing audio files', existing.length)
    }
    return existing
}

/**
 * Get a cache key for storing the chosen audio URL.
 */
function getAudioCacheKey(languageId: string, num: number): string {
    return `${languageId}:${num}`
}

/**
 * Pick a random item from an array.
 */
function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

/** Simulated audio duration in test mode (ms) */
const mockAudioDurationMs = 100

/**
 * Play an audio file, returns a promise that resolves when playback starts.
 * In test mode, simulates playback without actual audio.
 */
function playAudio(url: string, onEnd?: () => void): Promise<HTMLAudioElement | null> {
    log('Playing audio: %s', url)

    // Log the audio play
    logAudioPlay(url, 'audio-file')

    // In test mode, simulate playback without actual audio
    if (isTestMode) {
        log('Test mode: simulating audio playback')
        return new Promise((resolve) => {
            setTimeout(() => {
                log('Test audio simulation ended')
                onEnd?.()
                resolve(null) // Resolve after simulated playback ends
            }, mockAudioDurationMs)
        })
    }

    // Real audio playback
    return new Promise((resolve, reject) => {
        const audio = new Audio(url)

        audio.onended = () => {
            log('Audio playback ended: %s', url)
            onEnd?.()
        }

        audio.onerror = () => {
            const error = new Error(`Failed to load audio: ${url}`)
            logger.warn('Audio error: %O', error)
            reject(error)
        }

        audio
            .play()
            .then(() => {
                logger.debug('Audio playback started: %s', url)
                resolve(audio)
            })
            .catch((err: unknown) => {
                const error = err instanceof Error ? err : new Error(String(err))
                logger.warn('Audio play() failed: %O', error)
                reject(error)
            })
    })
}

/**
 * Hook for text-to-speech functionality.
 * Uses pre-generated audio files when available, falls back to Web Speech API.
 */
export function useTTS({ languageId, onEnd }: UseTTSOptions) {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const language = getLanguage(languageId)

    // Use ref for onEnd to avoid callback identity changes
    const onEndRef = useRef(onEnd)
    onEndRef.current = onEnd

    // Pre-warm curriculum cache on mount (non-blocking)
    useEffect(() => {
        void loadCurriculum(languageId)
    }, [languageId])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel()
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    /**
     * Speak text using Web Speech API (fallback).
     * In test mode, simulates speech without actual audio.
     */
    const speakWithWebSpeech = useCallback(
        (text: string) => {
            log('Speaking with Web Speech API: %s', text)
            // Log the speech event
            logAudioPlay(`web-speech:${text}`, 'web-speech')

            // In test mode, simulate speech without actual audio
            if (isTestMode) {
                setTimeout(() => {
                    onEndRef.current?.()
                }, mockAudioDurationMs)
                return
            }

            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = language.ttsLanguageCode
            utterance.rate = 0.9
            utterance.pitch = 1

            if (onEndRef.current) {
                utterance.onend = onEndRef.current
            }

            utteranceRef.current = utterance
            window.speechSynthesis.speak(utterance)
        },
        [language.ttsLanguageCode],
    )

    /**
     * Speak arbitrary text (uses Web Speech API).
     */
    const speak = useCallback(
        (text: string) => {
            log('speak() called with text: %s', text)
            window.speechSynthesis.cancel()
            if (audioRef.current) {
                audioRef.current.pause()
            }
            speakWithWebSpeech(text)
        },
        [speakWithWebSpeech],
    )

    /**
     * Select an audio URL for a number (with deduplication to prevent race conditions).
     * Waits for curriculum to load if not yet available.
     */
    const selectAudioUrl = useCallback(
        async (num: number): Promise<string | null> => {
            log('selectAudioUrl() called for number %d', num)
            const cacheKey = getAudioCacheKey(languageId, num)

            // Check if we already have a chosen URL
            const cached = chosenAudioCache.get(cacheKey)
            if (cached) {
                log('Audio URL cache hit for %d', num)
                return cached
            }

            // Check if selection is already in progress (prevent race condition)
            const pending = pendingAudioSelection.get(cacheKey)
            if (pending) {
                log('Audio selection already in progress for %d', num)
                return pending
            }

            // Start new selection
            const selectionPromise = (async (): Promise<string | null> => {
                log('Starting audio selection for number %d in language %s', num, languageId)
                // Wait for the curriculum to load (this is fast if already cached)
                const curriculum = loadCurriculum(languageId)
                if (!curriculum?.voices || curriculum.voices.length === 0) {
                    logger.warn('No voices available in curriculum for %d', num)
                    return null
                }

                const potentialUrls = buildAudioUrls(languageId, num, curriculum.voices)
                const existingUrls = await findExistingAudioFiles(potentialUrls)

                if (existingUrls.length > 0) {
                    const chosen = pickRandom(existingUrls)
                    log('Selected audio URL for %d', num)
                    chosenAudioCache.set(cacheKey, chosen)
                    return chosen
                }
                log('No audio files found for %d, will use Web Speech fallback', num)
                return null
            })()

            pendingAudioSelection.set(cacheKey, selectionPromise)

            try {
                return await selectionPromise
            } finally {
                pendingAudioSelection.delete(cacheKey)
            }
        },
        [languageId],
    )

    /**
     * Internal async implementation for speaking a number.
     */
    const speakNumberImpl = useCallback(
        async (num: number) => {
            log('speakNumberImpl() called for %d', num)

            // Prevent concurrent calls (e.g. from React Strict Mode double-firing)
            if (speakNumberInProgress) {
                log('Skipping speakNumberImpl - already in progress')
                return
            }
            speakNumberInProgress = true

            try {
                // Stop any ongoing speech/audio
                window.speechSynthesis.cancel()
                if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current = null
                }

                // Select (or retrieve cached) audio URL
                const chosenUrl = await selectAudioUrl(num)

                // Try to play the chosen URL
                if (chosenUrl) {
                    try {
                        log('Attempting to play audio file for %d', num)
                        audioRef.current = await playAudio(chosenUrl, onEndRef.current)
                        logger.debug('Audio playback succeeded for %d', num)
                        return // Success!
                    } catch (error) {
                        logger.debug(
                            `Audio playback failed for %d, falling back to Web Speech. The error was: %O`,
                            num,
                            error,
                        )
                        // Audio failed, fall through to Web Speech
                    }
                }

                // Fallback to Web Speech API
                const words = language.numberToWords(num)
                logger.debug('Using Web Speech fallback for %d', num)
                speakWithWebSpeech(words)
            } finally {
                speakNumberInProgress = false
            }
        },
        [selectAudioUrl, language, speakWithWebSpeech],
    )

    // Store latest implementation in ref for stable speakNumber identity
    const speakNumberImplRef = useRef(speakNumberImpl)
    speakNumberImplRef.current = speakNumberImpl

    /**
     * Speak a number, preferring pre-generated audio.
     * This is fire-and-forget - errors are handled internally.
     * STABLE IDENTITY - safe to use in useEffect dependencies.
     */
    const speakNumber = useCallback((num: number) => {
        log('speakNumber() called for %d', num)
        void speakNumberImplRef.current(num)
    }, [])

    /**
     * Stop any ongoing speech/audio.
     */
    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current = null
        }
    }, [])

    return { speak, speakNumber, stop }
}
