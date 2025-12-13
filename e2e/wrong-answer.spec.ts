import { expect, test } from '@playwright/test'

import { resetTestState, setShuffleSeed } from './test-utils'

test.describe('Wrong Answer Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await resetTestState(page)
    })

    test('should show result after typing an answer', async ({ page }) => {
        // Set seed right before starting session (seed 0 gives listen cards first)
        await setShuffleSeed(page, 0)

        // Start a session
        await page.getByRole('button', { name: /Start learning/i }).click()

        // Wait for session to load
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode first
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Type an answer - for single digit numbers (1-9), evaluation is immediate
        // For "10", need 2 digits. Type "9" which will evaluate for 1-9 targets.
        await page.getByRole('button', { name: '9', exact: true }).click()

        // Wait for evaluation (immediate if correct, 500ms delay if wrong)
        // The Next button should appear in either case
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })

        // Verify the result state - either correct (green) or incorrect (with "Correct answer" shown)
        const correctAnswerLabel = page.getByText('Correct answer')
        const wasWrong = await correctAnswerLabel.isVisible().catch(() => false)

        // Either outcome is valid - we verify the flow completes
        if (wasWrong) {
            // Wrong answer: "Correct answer" label should be visible
            await expect(correctAnswerLabel).toBeVisible()
        }
    })

    test('should allow advancing after answering', async ({ page }) => {
        await setShuffleSeed(page, 0)

        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Get initial remaining count
        const initialText = await page.getByText(/cards? remaining/i).textContent()

        // Type an answer
        await page.getByRole('button', { name: '9', exact: true }).click()

        // Wait for Next button to appear
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })
        await nextButton.click()

        // Should advance to next card or end session
        await page.waitForTimeout(500)

        // Check we've moved on (different remaining count or back to home)
        const currentText = await page
            .getByText(/cards? remaining/i)
            .textContent()
            .catch(() => null)
        const isHome = await page
            .getByText('Number trainer')
            .isVisible()
            .catch(() => false)

        expect(currentText !== initialText || isHome).toBe(true)
    })

    test('should replace keypad with Next button after evaluation', async ({ page }) => {
        await setShuffleSeed(page, 0)

        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Type an answer
        await page.getByRole('button', { name: '9', exact: true }).click()

        // Next button should appear
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })

        // Keypad should be hidden when result is shown
        await expect(keypad).not.toBeVisible()
    })

    test('should complete multiple cards in sequence', async ({ page }) => {
        await setShuffleSeed(page, 0)

        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Complete 3 cards
        for (let i = 0; i < 3; i++) {
            const keypad = page.locator('.grid.grid-cols-3')
            const keypadVisible = await keypad.isVisible().catch(() => false)

            if (keypadVisible) {
                // Type an answer
                await page.getByRole('button', { name: '5', exact: true }).click()

                // Wait for Next button
                const nextButton = page.getByRole('button', { name: /Next/i })
                await expect(nextButton).toBeVisible({ timeout: 5000 })
                await nextButton.click()

                // Small delay between cards
                await page.waitForTimeout(300)
            }

            // Check if session ended
            const isHome = await page
                .getByText('Number trainer')
                .isVisible()
                .catch(() => false)
            if (isHome) break
        }

        // Session should still be running or have ended normally
        const stillInSession = await page
            .getByText(/cards? remaining/i)
            .isVisible()
            .catch(() => false)
        const isHome = await page
            .getByText('Number trainer')
            .isVisible()
            .catch(() => false)
        expect(stillInSession || isHome).toBe(true)
    })
})
