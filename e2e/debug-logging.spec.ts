import { expect, test } from '@playwright/test'

test.describe('Debug logging', () => {
    test('should show debug logs when ?debug=1 query param is set', async ({ page }) => {
        const consoleLogs: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                consoleLogs.push(msg.text())
            }
        })

        await page.goto('/?debug=1')
        await page.waitForTimeout(500)

        const hasDebugLog = consoleLogs.some((log) => log.includes('[DEBUG]') && log.includes('App started'))
        expect(hasDebugLog).toBe(true)
    })

    test('should not show debug logs when debug is not enabled', async ({ page }) => {
        const consoleLogs: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                consoleLogs.push(msg.text())
            }
        })

        await page.goto('/')
        await page.waitForTimeout(500)

        const hasDebugLog = consoleLogs.some((log) => log.includes('[DEBUG]'))
        expect(hasDebugLog).toBe(false)
    })

    test('should show debug logs when localStorage.debug is set', async ({ page }) => {
        // First visit without debug to set localStorage
        await page.goto('/')
        await page.evaluate(() => {
            localStorage.setItem('debug', '1')
        })

        const consoleLogs: string[] = []
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                consoleLogs.push(msg.text())
            }
        })

        // Reload to pick up localStorage setting
        await page.reload()
        await page.waitForTimeout(500)

        const hasDebugLog = consoleLogs.some((log) => log.includes('[DEBUG]') && log.includes('App started'))
        expect(hasDebugLog).toBe(true)
    })
})
