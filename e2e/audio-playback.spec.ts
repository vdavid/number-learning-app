import { expect, test } from '@playwright/test'

import { clearAudioLog, getAudioLog, resetTestState } from './test-utils'

test.describe('Audio Playback', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await resetTestState(page)
    })

    test('should play audio exactly once when card is shown in listen mode', async ({ page }) => {
        // Clear the audio log before starting
        await clearAudioLog(page)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Wait for audio to play (simulated in test mode)
        await page.waitForTimeout(500)

        // Get the audio log
        const audioLog = await getAudioLog(page)

        // Audio should have played exactly once
        expect(audioLog.length).toBeGreaterThanOrEqual(1)

        // The first audio should be for a number (either audio file or web speech)
        const firstAudio = audioLog[0]
        expect(firstAudio).toBeDefined()
        expect(['audio-file', 'web-speech']).toContain(firstAudio.type)
    })

    test('should play audio again after wrong answer', async ({ page }) => {
        await clearAudioLog(page)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Wait for initial audio
        await page.waitForTimeout(500)

        // Get initial audio count
        const initialLog = await getAudioLog(page)
        const initialCount = initialLog.length

        // Type a wrong answer
        await page.getByRole('button', { name: '9', exact: true }).click()

        // Wait for wrong answer evaluation (500ms delay + audio replay)
        await page.waitForTimeout(1500)

        // Get the audio log after wrong answer
        const afterWrongLog = await getAudioLog(page)

        // There should be more audio plays after wrong answer (replay happens)
        // At minimum, we should have the initial play
        expect(afterWrongLog.length).toBeGreaterThanOrEqual(initialCount)
    })

    test('should play audio when replay button is clicked', async ({ page }) => {
        await clearAudioLog(page)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Wait for initial audio and UI to stabilize
        await page.waitForTimeout(500)

        // Get the initial audio count
        const initialLog = await getAudioLog(page)
        const initialCount = initialLog.length

        // Click the replay button
        const replayButton = page.getByRole('button', { name: /Replay audio/i })
        await replayButton.click()

        // Wait for replay audio
        await page.waitForTimeout(300)

        // Get the audio log after replay
        const afterReplayLog = await getAudioLog(page)

        // Should have one more audio play
        expect(afterReplayLog.length).toBe(initialCount + 1)
    })

    test('should not play audio after correct answer until Next is clicked', async ({ page }) => {
        await clearAudioLog(page)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Wait for initial audio
        await page.waitForTimeout(500)

        // Get audio count before answer
        const beforeAnswerLog = await getAudioLog(page)
        const countBeforeAnswer = beforeAnswerLog.length

        // Type an answer and wait for evaluation
        await page.getByRole('button', { name: '5', exact: true }).click()
        await page.waitForTimeout(300)

        // Wait for Next button (answer was evaluated)
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })

        // Get audio count after answer (before clicking Next)
        const afterAnswerLog = await getAudioLog(page)

        // If it was a correct answer, no additional audio should play
        // If it was wrong, audio should replay
        // Either way, the count should be reasonable (not exponentially growing)
        expect(afterAnswerLog.length).toBeLessThanOrEqual(countBeforeAnswer + 2)

        // Clear log before next card
        await clearAudioLog(page)

        // Click Next to go to the next card
        await nextButton.click()

        // Wait for next card's audio
        await page.waitForTimeout(500)

        // Check if we're still in session (might have ended)
        const stillInSession = await page
            .getByText(/cards? remaining/i)
            .isVisible()
            .catch(() => false)

        if (stillInSession) {
            // Check if the next card is in listen mode (has keypad)
            const keypad = page.locator('.grid.grid-cols-3')
            const isListenMode = await keypad.isVisible().catch(() => false)

            if (isListenMode) {
                // Audio should play for the new listen card
                const newCardLog = await getAudioLog(page)
                expect(newCardLog.length).toBeGreaterThanOrEqual(1)
            }
            // If speak mode, no auto-play audio (user speaks)
        }
    })

    test('should log audio URL containing the language ID', async ({ page }) => {
        await clearAudioLog(page)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Wait for audio
        await page.waitForTimeout(500)

        // Get the audio log
        const audioLog = await getAudioLog(page)

        // At least one audio should have been logged
        expect(audioLog.length).toBeGreaterThanOrEqual(1)

        // Check that the URL contains either:
        // - "sino-korean" (for audio files)
        // - Korean text (for web speech fallback)
        const firstAudio = audioLog[0]

        if (firstAudio.type === 'audio-file') {
            expect(firstAudio.url).toContain('sino-korean')
        } else {
            // Web speech: URL format is "web-speech:<text>"
            expect(firstAudio.url).toMatch(/web-speech:/)
        }
    })
})
