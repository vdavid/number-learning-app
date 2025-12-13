import { getLanguage } from '@features/languages'
import { useCallback, useEffect, useRef } from 'react'

import { createDebugLogger } from '../utils'

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

type AudioManifest = {
    language: string
    voices: { id: string; name: string }[]
}

/** Cache for loaded manifests */
const manifestCache = new Map<string, AudioManifest | null>()

/** Track in-flight manifest loads to allow awaiting */
const pendingManifestLoads = new Map<string, Promise<AudioManifest | null>>()

/** Cache for chosen audio URLs per (languageId, number) - persists across renders */
const chosenAudioCache = new Map<string, string>()

/** Track in-flight audio selection to prevent race conditions */
const pendingAudioSelection = new Map<string, Promise<string | null>>()

/**
 * Load the audio manifest for a language.
 * Returns null if manifest doesn't exist or fails to load.
 * Multiple calls for the same language will share the same promise.
 */
async function loadManifest(languageId: string): Promise<AudioManifest | null> {
    // Return cached result if available
    if (manifestCache.has(languageId)) {
        return manifestCache.get(languageId) ?? null
    }

    // Return pending load if in progress
    const pending = pendingManifestLoads.get(languageId)
    if (pending) {
        return pending
    }

    // Start new load
    const loadPromise = (async (): Promise<AudioManifest | null> => {
        try {
            const response = await fetch(`/audio/${languageId}/manifest.json`)
            if (!response.ok) {
                manifestCache.set(languageId, null)
                return null
            }
            const manifest = (await response.json()) as AudioManifest
            manifestCache.set(languageId, manifest)
            return manifest
        } catch {
            manifestCache.set(languageId, null)
            return null
        }
    })()

    pendingManifestLoads.set(languageId, loadPromise)

    try {
        return await loadPromise
    } finally {
        pendingManifestLoads.delete(languageId)
    }
}

/** Try multiple audio formats in order of preference. */
const AUDIO_FORMATS = ['mp3', 'opus'] as const

/**
 * Build potential audio URLs for a number.
 */
function buildAudioUrls(languageId: string, num: number, voices: { id: string }[]): string[] {
    const urls: string[] = []
    for (const voice of voices) {
        for (const format of AUDIO_FORMATS) {
            urls.push(`/audio/${languageId}/${num}-${voice.id}.${format}`)
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
        return response.ok
    } catch {
        return false
    }
}

/**
 * Find all existing audio files from a list of URLs.
 */
async function findExistingAudioFiles(urls: string[]): Promise<string[]> {
    const results = await Promise.all(urls.map(async (url) => ({ url, exists: await checkAudioExists(url) })))
    return results.filter((r) => r.exists).map((r) => r.url)
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
const MOCK_AUDIO_DURATION = 100

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
        return new Promise((resolve) => {
            setTimeout(() => {
                onEnd?.()
            }, MOCK_AUDIO_DURATION)
            resolve(null) // No actual audio element in test mode
        })
    }

    // Real audio playback
    return new Promise((resolve, reject) => {
        const audio = new Audio(url)

        audio.onended = () => {
            onEnd?.()
        }

        audio.onerror = () => {
            reject(new Error(`Failed to load audio: ${url}`))
        }

        audio
            .play()
            .then(() => {
                resolve(audio)
            })
            .catch((err: unknown) => {
                reject(err instanceof Error ? err : new Error(String(err)))
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

    // Pre-warm manifest cache on mount (non-blocking)
    useEffect(() => {
        void loadManifest(languageId)
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
            // Log the speech event
            logAudioPlay(`web-speech:${text}`, 'web-speech')

            // In test mode, simulate speech without actual audio
            if (isTestMode) {
                setTimeout(() => {
                    onEndRef.current?.()
                }, MOCK_AUDIO_DURATION)
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
     * Waits for manifest to load if not yet available.
     */
    const selectAudioUrl = useCallback(
        async (num: number): Promise<string | null> => {
            const cacheKey = getAudioCacheKey(languageId, num)

            // Check if we already have a chosen URL
            const cached = chosenAudioCache.get(cacheKey)
            if (cached) return cached

            // Check if selection is already in progress (prevent race condition)
            const pending = pendingAudioSelection.get(cacheKey)
            if (pending) return pending

            // Start new selection
            const selectionPromise = (async (): Promise<string | null> => {
                // Wait for manifest to load (this is fast if already cached)
                const currentManifest = await loadManifest(languageId)
                if (!currentManifest?.voices || currentManifest.voices.length === 0) return null

                const potentialUrls = buildAudioUrls(languageId, num, currentManifest.voices)
                const existingUrls = await findExistingAudioFiles(potentialUrls)

                if (existingUrls.length > 0) {
                    const chosen = pickRandom(existingUrls)
                    chosenAudioCache.set(cacheKey, chosen)
                    return chosen
                }
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
                    audioRef.current = await playAudio(chosenUrl, onEndRef.current)
                    return // Success!
                } catch {
                    // Audio failed, fall through to Web Speech
                }
            }

            // Fallback to Web Speech API
            const words = language.numberToWords(num)
            speakWithWebSpeech(words)
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
