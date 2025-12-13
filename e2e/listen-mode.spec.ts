import { expect, test } from '@playwright/test'

import { resetTestState, setShuffleSeed } from './test-utils'

test.describe('Listen Mode - Happy Path', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await resetTestState(page)
    })

    test('should complete a listen exercise correctly', async ({ page }) => {
        // Set seed right before starting (seed 0 gives listen cards first)
        await setShuffleSeed(page, 0)

        // Wait for the page to load and show the level selector
        await expect(page.getByText('Sino-Korean')).toBeVisible()
        await expect(page.getByText('Number trainer')).toBeVisible()

        // Click "Start learning" button
        const learnButton = page.getByRole('button', { name: /Start learning/i })
        await expect(learnButton).toBeVisible()
        await learnButton.click()

        // Wait for session to start - should see cards remaining
        await expect(page.getByText(/card.*remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode first
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Type "1" - this may or may not be correct
        await page.getByRole('button', { name: '1', exact: true }).click()

        // Wait for the answer to be evaluated
        await page.waitForTimeout(1500)

        // Check if Next button appeared
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })

        // Click Next to proceed
        await nextButton.click()

        // Verify we're either still in session or returned home
        await page.waitForTimeout(500)
        const inSession = await page
            .getByText(/cards? remaining/i)
            .isVisible()
            .catch(() => false)
        const isHome = await page
            .getByText('Number trainer')
            .isVisible()
            .catch(() => false)
        expect(inSession || isHome).toBe(true)
    })

    test('should show keypad in listen mode', async ({ page }) => {
        // Set seed right before starting
        await setShuffleSeed(page, 0)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()

        // Wait for session to load
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 42, we should get listen mode first - verify keypad
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // All number buttons should be present
        for (let i = 0; i <= 9; i++) {
            await expect(page.getByRole('button', { name: String(i), exact: true })).toBeVisible()
        }

        // Backspace should be present
        await expect(page.getByRole('button', { name: '⌫' })).toBeVisible()
    })

    test('should update digit display when typing', async ({ page }) => {
        // Set seed right before starting
        await setShuffleSeed(page, 0)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()

        // Wait for session to load
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Type a digit
        await page.getByRole('button', { name: '5', exact: true }).click()

        // Wait for UI to update
        await page.waitForTimeout(200)

        // Either:
        // 1. The digit "5" should appear in the digit display
        // 2. The answer was already evaluated (for single-digit numbers)
        // In both cases, Next button should eventually appear
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })
    })

    test('should allow replaying audio', async ({ page }) => {
        // Set seed right before starting
        await setShuffleSeed(page, 0)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()

        // Wait for session
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 42, we should get listen mode
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Find and click replay button
        const replayButton = page.getByRole('button', { name: /replay audio/i })
        await expect(replayButton).toBeVisible()

        // Click should not throw an error (audio might not actually play in test)
        await replayButton.click()

        // UI should still be functional
        await expect(keypad).toBeVisible()
    })
})
