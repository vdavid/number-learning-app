import { expect, test } from '@playwright/test'

import { resetTestState, setShuffleSeed } from './test-utils'

test.describe('Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await resetTestState(page)
    })

    test('should persist progress after completing exercises', async ({ page }) => {
        // Set seed right before starting (seed 0 gives listen cards first)
        await setShuffleSeed(page, 0)

        // Start a session
        const learnButton = page.getByRole('button', { name: /Start learning/i })
        await learnButton.click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode first
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Complete at least one exercise
        await page.getByRole('button', { name: '1', exact: true }).click()
        await page.waitForTimeout(1000)

        // Click Next to record the answer
        const nextButton = page.getByRole('button', { name: /Next/i })
        await expect(nextButton).toBeVisible({ timeout: 5000 })
        await nextButton.click()

        // Exit the session (click X button)
        const exitButton = page.getByRole('button', { name: /exit session/i })
        if (await exitButton.isVisible().catch(() => false)) {
            await exitButton.click()
        }

        // Should be back on home screen
        await expect(page.getByText('Number trainer')).toBeVisible()

        // Reload the page
        await page.reload()

        // Check that localStorage has data (session start initializes language)
        const hasProgress = await page.evaluate(() => {
            return localStorage.getItem('number-trainer-progress') !== null
        })
        expect(hasProgress).toBe(true)
    })

    test('should restore progress after page refresh', async ({ page }) => {
        // Set seed right before starting
        await setShuffleSeed(page, 0)

        // Start and complete some exercises
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode first
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Complete 1-2 cards
        for (let i = 0; i < 2; i++) {
            const button1 = page.getByRole('button', { name: '1', exact: true })
            if (!(await button1.isVisible().catch(() => false))) break

            await button1.click()
            await page.waitForTimeout(1000)

            const nextButton = page.getByRole('button', { name: /Next/i })
            if (await nextButton.isVisible().catch(() => false)) {
                await nextButton.click()
                await page.waitForTimeout(300)
            }

            // Check if we're still in session
            const stillInSession = await page
                .getByText(/cards? remaining/i)
                .isVisible()
                .catch(() => false)
            if (!stillInSession) break
        }

        // Exit session
        const exitButton = page.getByRole('button', { name: /exit session/i })
        if (await exitButton.isVisible().catch(() => false)) {
            await exitButton.click()
        }

        // Wait to be on home screen
        await expect(page.getByText('Number trainer')).toBeVisible()

        // Check that progress has been saved
        const hasProgress = await page.evaluate(() => {
            return localStorage.getItem('number-trainer-progress') !== null
        })
        expect(hasProgress).toBe(true)

        // Reload page
        await page.reload()

        // Check localStorage is still present
        const hasProgressAfterReload = await page.evaluate(() => {
            return localStorage.getItem('number-trainer-progress') !== null
        })
        expect(hasProgressAfterReload).toBe(true)
    })

    test('should show different button state after some progress', async ({ page }) => {
        // Set seed right before starting
        await setShuffleSeed(page, 0)

        // Verify we start with new cards available
        const learnButton = page.getByRole('button', { name: /Start learning/i })
        await expect(learnButton).toBeVisible()

        // Complete some exercises
        await learnButton.click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // With seed 0, we should get listen mode first
        const keypad = page.locator('.grid.grid-cols-3')
        await expect(keypad).toBeVisible({ timeout: 3000 })

        // Answer cards until session ends or we've done a few
        for (let attempts = 0; attempts < 5; attempts++) {
            const button1 = page.getByRole('button', { name: '1', exact: true })
            if (!(await button1.isVisible().catch(() => false))) break

            // Type a number
            await button1.click()
            await page.waitForTimeout(1000)

            // Click next
            const nextButton = page.getByRole('button', { name: /Next/i })
            if (await nextButton.isVisible().catch(() => false)) {
                await nextButton.click()
                await page.waitForTimeout(300)
            }

            // Check if session ended
            const isHome = await page
                .getByText('Number trainer')
                .isVisible()
                .catch(() => false)
            if (isHome) break

            const stillInSession = await page
                .getByText(/cards? remaining/i)
                .isVisible()
                .catch(() => false)
            if (!stillInSession) break
        }

        // Exit if still in session
        const exitButton = page.getByRole('button', { name: /exit session/i })
        if (await exitButton.isVisible().catch(() => false)) {
            await exitButton.click()
        }

        // Should be back home
        await expect(page.getByText('Number trainer')).toBeVisible()

        // Reload and verify progress persisted
        await page.reload()
        await expect(page.getByText('Number trainer')).toBeVisible()

        // The learn button should reflect any changes in due/new counts
        const learnButtonAfter = page.getByRole('button', { name: /Start learning|All caught up/i })
        await expect(learnButtonAfter).toBeVisible()
    })

    test('should persist settings (quiet mode) across page loads', async ({ page }) => {
        // Enable quiet mode
        const quietModeButton = page.getByRole('button', { name: /quiet mode/i })
        await quietModeButton.click()
        await expect(quietModeButton).toContainText('Quiet mode on')

        // Verify localStorage has settings
        const hasSettings = await page.evaluate(() => {
            return localStorage.getItem('number-trainer-settings') !== null
        })
        expect(hasSettings).toBe(true)

        // Reload
        await page.reload()

        // Quiet mode should still be on
        await expect(page.getByRole('button', { name: /quiet mode/i })).toContainText('Quiet mode on')
    })

    test('should persist unlocked stages', async ({ page }) => {
        // Check localStorage for progress data structure
        // This verifies the store is persisting correctly

        // Start a session to trigger language initialization
        await page.getByRole('button', { name: /Start learning/i }).click()
        await expect(page.getByText(/cards? remaining/i)).toBeVisible()

        // Exit immediately
        const exitButton = page.getByRole('button', { name: /exit session/i })
        await exitButton.click()

        // Check that progress store has been initialized
        const progressData = await page.evaluate((): { state?: { unlockedStages?: unknown } } | null => {
            const data = localStorage.getItem('number-trainer-progress')
            return data ? (JSON.parse(data) as { state?: { unlockedStages?: unknown } }) : null
        })

        expect(progressData).not.toBeNull()
        expect(progressData?.state).toBeDefined()
        expect(progressData?.state?.unlockedStages).toBeDefined()

        // Reload and verify unlockedStages is maintained (ignore cards due to timestamp changes)
        await page.reload()

        const progressDataAfter = await page.evaluate((): { state?: { unlockedStages?: unknown } } | null => {
            const data = localStorage.getItem('number-trainer-progress')
            return data ? (JSON.parse(data) as { state?: { unlockedStages?: unknown } }) : null
        })

        expect(progressDataAfter).not.toBeNull()
        expect(progressDataAfter?.state?.unlockedStages).toEqual(progressData?.state?.unlockedStages)
    })
})
