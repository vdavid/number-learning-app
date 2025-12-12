import { getLanguage } from '@features/languages'
import { useCallback, useEffect, useRef, useState } from 'react'

// Web Speech API type definitions
interface SpeechRecognitionResult {
    readonly isFinal: boolean
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
}

interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number
    onstart: ((this: SpeechRecognition, ev: Event) => void) | null
    onend: ((this: SpeechRecognition, ev: Event) => void) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
    onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null
    start(): void
    stop(): void
    abort(): void
}

interface SpeechRecognitionConstructor {
    new (): SpeechRecognition
}

interface SpeechWindow extends Window {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
}

/** Check if Speech Recognition API is available */
function isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false
    const speechWindow = window as SpeechWindow
    return !!(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition)
}

interface UseSTTOptions {
    languageId: string
    onResult?: (transcript: string, isFinal: boolean) => void
    onError?: (error: string) => void
    onEnd?: () => void
    continuous?: boolean
}

interface STTResult {
    isListening: boolean
    isSupported: boolean
    error: string | null
    start: () => void
    stop: () => void
}

/**
 * Hook for speech-to-text functionality.
 * Uses the Web Speech API with continuous recognition.
 */
export function useSTT({ languageId, onResult, onError, onEnd, continuous = true }: UseSTTOptions): STTResult {
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)
    const language = getLanguage(languageId)

    // Check support once at initialization
    const isSupported = isSpeechRecognitionSupported()

    // Refs for callbacks to avoid re-initializing effect
    const onResultRef = useRef(onResult)
    const onErrorRef = useRef(onError)
    const onEndRef = useRef(onEnd)

    useEffect(() => {
        onResultRef.current = onResult
        onErrorRef.current = onError
        onEndRef.current = onEnd
    }, [onResult, onError, onEnd])

    // Initialize recognition on mount
    useEffect(() => {
        const speechWindow = window as SpeechWindow
        const SpeechRecognitionAPI = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            return
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = continuous
        recognition.interimResults = true
        recognition.lang = language.sttLanguageCode
        recognition.maxAlternatives = 3

        recognition.onstart = () => {
            setIsListening(true)
            setError(null)
        }

        recognition.onend = () => {
            setIsListening(false)
            onEndRef.current?.()
        }

        recognition.onnomatch = () => {
            // No match found - this is expected sometimes
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const results = event.results
            const lastResult = results[results.length - 1]

            if (lastResult?.[0]) {
                const transcript = lastResult[0].transcript
                const isFinal = lastResult.isFinal
                onResultRef.current?.(transcript, isFinal)
            }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(event.error)

            // If it's a fatal error, ensure we mark as not listening
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setIsListening(false)
            }

            // Ignore 'no-speech' errors as they're common
            if (event.error !== 'no-speech') {
                onErrorRef.current?.(event.error)
            }
        }

        recognitionRef.current = recognition

        return () => {
            recognition.abort()
        }
    }, [language.sttLanguageCode, continuous])

    const start = useCallback(() => {
        if (!recognitionRef.current) return

        setError(null)

        try {
            recognitionRef.current.start()
        } catch {
            // Recognition may already be started
        }
    }, [])

    const stop = useCallback(() => {
        if (!recognitionRef.current) return

        recognitionRef.current.stop()
    }, [])

    return {
        isListening,
        isSupported,
        error,
        start,
        stop,
    }
}
