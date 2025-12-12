import { getLanguage } from '@features/languages'
import { useCallback, useEffect, useRef } from 'react'

interface UseTTSOptions {
    languageId: string
    onEnd?: () => void
}

/**
 * Hook for text-to-speech functionality.
 * Uses the Web Speech API.
 */
export function useTTS({ languageId, onEnd }: UseTTSOptions) {
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
    const language = getLanguage(languageId)

    // Cancel any ongoing speech on unmount
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel()
        }
    }, [])

    const speak = useCallback(
        (text: string) => {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = language.ttsLanguageCode
            utterance.rate = 0.9 // Slightly slower for learning
            utterance.pitch = 1

            if (onEnd) {
                utterance.onend = onEnd
            }

            utteranceRef.current = utterance
            window.speechSynthesis.speak(utterance)
        },
        [language.ttsLanguageCode, onEnd],
    )

    const speakNumber = useCallback(
        (num: number) => {
            const words = language.numberToWords(num)
            speak(words)
        },
        [language, speak],
    )

    const stop = useCallback(() => {
        window.speechSynthesis.cancel()
    }, [])

    return { speak, speakNumber, stop }
}
