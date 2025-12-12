import { getLanguage } from '@features/languages'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseSTTOptions {
    languageId: string
    onResult?: (transcript: string, isFinal: boolean) => void
    onError?: (error: string) => void
    continuous?: boolean
}

interface STTResult {
    isListening: boolean
    isSupported: boolean
    start: () => void
    stop: () => void
}

/**
 * Hook for speech-to-text functionality.
 * Uses the Web Speech API with continuous recognition.
 */
export function useSTT({ languageId, onResult, onError, continuous = true }: UseSTTOptions): STTResult {
    const [isListening, setIsListening] = useState(false)
    const [isSupported, setIsSupported] = useState(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)
    const language = getLanguage(languageId)

    // Initialize recognition on mount
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            setIsSupported(false)
            return
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const recognition = new SpeechRecognitionAPI()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.continuous = continuous
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.interimResults = true
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.lang = language.sttLanguageCode
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.maxAlternatives = 3

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const results = event.results
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const lastResult = results[results.length - 1]
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (lastResult?.[0]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const transcript: string = lastResult[0].transcript
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const isFinal: boolean = lastResult.isFinal
                onResult?.(transcript, isFinal)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.onerror = (event: { error: string }) => {
            // Ignore 'no-speech' errors as they're common
            if (event.error !== 'no-speech') {
                onError?.(event.error)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.onend = () => {
            setIsListening(false)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        recognitionRef.current = recognition

        return () => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            recognition.abort()
        }
    }, [language.sttLanguageCode, continuous, onResult, onError])

    const start = useCallback(() => {
        if (!recognitionRef.current || isListening) return

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            recognitionRef.current.start()
            setIsListening(true)
        } catch {
            // Recognition might already be started
        }
    }, [isListening])

    const stop = useCallback(() => {
        if (!recognitionRef.current) return

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        recognitionRef.current.stop()
        setIsListening(false)
    }, [])

    return {
        isListening,
        isSupported,
        start,
        stop,
    }
}
