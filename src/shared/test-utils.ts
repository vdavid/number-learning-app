/**
 * Test utilities exposed on window for E2E tests.
 * Only initialized when import.meta.env.MODE === 'test'.
 */

import { clearAudioPlayLog } from '@shared/hooks'
import { setShuffleSeed } from '@shared/stores'

interface AudioPlayLogEntry {
    url: string
    timestamp: number
    type: 'audio-file' | 'web-speech'
}

interface TestUtils {
    /** Set the shuffle seed for deterministic card ordering */
    setShuffleSeed: (seed: number | null) => void
    /** Inject a transcript into the STT mock */
    injectTranscript: (text: string, isFinal: boolean) => void
    /** Clear the audio play log */
    clearAudioLog: () => void
    /** Get the audio play log */
    getAudioLog: () => AudioPlayLogEntry[]
}

declare global {
    interface Window {
        __testUtils?: TestUtils
        __audioPlayLog?: AudioPlayLogEntry[]
    }
}

/** Initialize test utilities on window (call this in main.tsx for test mode) */
export function initTestUtils(): void {
    if (typeof window === 'undefined') return

    window.__testUtils = {
        setShuffleSeed: (seed: number | null) => {
            setShuffleSeed(seed)
        },
        injectTranscript: (text: string, isFinal: boolean) => {
            window.__mockSTT?.injectTranscript(text, isFinal)
        },
        clearAudioLog: () => {
            clearAudioPlayLog()
        },
        getAudioLog: () => {
            return window.__audioPlayLog ?? []
        },
    }
}
