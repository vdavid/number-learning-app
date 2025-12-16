import type { Page } from '@playwright/test'

// Type declarations for audio play log
interface AudioPlayLogEntry {
    url: string
    timestamp: number
    type: 'audio-file' | 'web-speech'
}

/**
 * Inject a transcript into the STT mock.
 * Use this to simulate speaking in speak mode tests.
 */
export async function injectTranscript(page: Page, text: string, isFinal: boolean = true): Promise<void> {
    await page.evaluate(
        ({ t, f }) => {
            window.__testUtils?.injectTranscript(t, f)
        },
        { t: text, f: isFinal },
    )
}

/**
 * Wait for test utilities to be initialized.
 */
export async function waitForTestUtils(page: Page): Promise<void> {
    await page.waitForFunction(() => window.__testUtils !== undefined, { timeout: 5000 })
}

/**
 * Clear localStorage and reset for a fresh test.
 */
export async function resetTestState(page: Page): Promise<void> {
    await page.evaluate(() => {
        localStorage.clear()
    })
    await page.reload()
    await waitForTestUtils(page)
}

/**
 * Clear the audio play log.
 */
export async function clearAudioLog(page: Page): Promise<void> {
    await page.evaluate(() => {
        window.__testUtils?.clearAudioLog()
    })
}

/**
 * Get the audio play log.
 */
export async function getAudioLog(page: Page): Promise<AudioPlayLogEntry[]> {
    return page.evaluate(() => {
        return window.__testUtils?.getAudioLog() ?? []
    })
}

// Type declarations for the test utils
declare global {
    interface Window {
        __testUtils?: {
            injectTranscript: (text: string, isFinal: boolean) => void
            clearAudioLog: () => void
            getAudioLog: () => AudioPlayLogEntry[]
        }
        __mockSTT?: {
            injectTranscript: (text: string, isFinal: boolean) => void
        }
        __audioPlayLog?: AudioPlayLogEntry[]
    }
}
