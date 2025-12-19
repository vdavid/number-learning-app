import { execSync } from 'node:child_process'

import { describe, it, expect } from 'vitest'

describe('Audio Generator CLI', () => {
    it('should be runnable without module resolution errors', () => {
        // This command should not generate any audio files due to the invalid range (min 4 > max 3),
        // but it will fail early if there are any module resolution or syntax errors.
        const command =
            'pnpm tsx scripts/audio-gen/generate.ts --language sino-korean --voice matilda --format wav --min 4 --max 3'

        try {
            const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' })
            expect(output).toContain('No numbers to generate')
        } catch (error: unknown) {
            let message = 'Unknown error'
            if (error instanceof Error) {
                const execError = error as { stderr?: string; stdout?: string }
                message = execError.stderr || execError.stdout || error.message
            }
            throw new Error(`Script failed to run. This might be due to path alias issues. Error: ${message}`)
        }
    })
})
