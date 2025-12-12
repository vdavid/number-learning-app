import { getLanguage } from '@features/languages'
import { useCallback, useEffect, useRef, useState } from 'react'

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
    const [isSupported, setIsSupported] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null)
    const language = getLanguage(languageId)

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
            setIsSupported(false)
            return
        }

        console.log('[useSTT] Initializing SpeechRecognition', { language: language.sttLanguageCode, continuous })

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
        recognition.onstart = () => {
            console.log('[useSTT] onstart')
            setIsListening(true)
            setError(null)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        recognition.onend = () => {
            console.log('[useSTT] onend')
            setIsListening(false)
            onEndRef.current?.()
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        recognition.onnomatch = (event: any) => {
            console.log('[useSTT] onnomatch', event)
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const results = event.results
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const lastResult = results[results.length - 1]

            console.log('[useSTT] onresult', {
                transcript: lastResult?.[0]?.transcript,
                isFinal: lastResult?.isFinal,
                confidence: lastResult?.[0]?.confidence
            })

            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (lastResult?.[0]) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const transcript: string = lastResult[0].transcript
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                const isFinal: boolean = lastResult.isFinal
                onResultRef.current?.(transcript, isFinal)
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        recognition.onerror = (event: { error: string }) => {
            console.log('[useSTT] onerror', event.error)
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        recognitionRef.current = recognition

        return () => {
            console.log('[useSTT] Cleaning up SpeechRecognition')
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            recognition.abort()
        }
    }, [language.sttLanguageCode, continuous])

    const start = useCallback(() => {
        if (!recognitionRef.current) return

        // Don't restart if already listening (though allow retrying if it thinks it is but isn't)
        // Actually, for safety, just log and try call start
        console.log('[useSTT] start called')
        setError(null)

        try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            recognitionRef.current.start()
            // We set isListening to true optimistically, but onstart will confirm it
            // setIsListening(true) 
        } catch (e) {
            console.warn('[useSTT] Failed to start recognition:', e)
        }
    }, [])

    const stop = useCallback(() => {
        if (!recognitionRef.current) return

        console.log('[useSTT] stop called')
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        recognitionRef.current.stop()
        // onend will handle state update
    }, [])

    return {
        isListening,
        isSupported,
        error,
        start,
        stop,
    }
}
