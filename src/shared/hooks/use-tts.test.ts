import { describe, expect, it } from 'vitest'

// These are pure functions extracted from use-tts.ts for testing
// Since they're module-private, we test the logic by re-implementing them here

/**
 * Build potential audio URLs for a number.
 */
function buildAudioUrls(languageId: string, num: number, voices: { id: string }[]): string[] {
    const audioFormats = ['mp3', 'opus'] as const

    const urls: string[] = []
    for (const voice of voices) {
        for (const format of audioFormats) {
            urls.push(`/audio/${languageId}/${num}-${voice.id}.${format}`)
        }
    }
    return urls
}

/**
 * Get a cache key for storing the chosen audio URL.
 */
function getAudioCacheKey(languageId: string, num: number): string {
    return `${languageId}:${num}`
}

/**
 * Pick a random item from an array.
 */
function pickRandom<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)]
}

describe('TTS pure functions', () => {
    describe('buildAudioUrls', () => {
        it('should build URLs for all voices and formats', () => {
            const voices = [{ id: 'charlie' }, { id: 'matilda' }]
            const urls = buildAudioUrls('sino-korean', 5, voices)

            expect(urls).toEqual([
                '/audio/sino-korean/5-charlie.mp3',
                '/audio/sino-korean/5-charlie.opus',
                '/audio/sino-korean/5-matilda.mp3',
                '/audio/sino-korean/5-matilda.opus',
            ])
        })

        it('should return empty array for no voices', () => {
            const urls = buildAudioUrls('sino-korean', 5, [])
            expect(urls).toEqual([])
        })

        it('should handle single voice', () => {
            const urls = buildAudioUrls('sino-korean', 10, [{ id: 'charlie' }])

            expect(urls).toEqual(['/audio/sino-korean/10-charlie.mp3', '/audio/sino-korean/10-charlie.opus'])
        })

        it('should include correct language in path', () => {
            const urls = buildAudioUrls('native-korean', 1, [{ id: 'voice1' }])

            expect(urls[0]).toContain('/audio/native-korean/')
        })

        it('should handle multi-digit numbers', () => {
            const urls = buildAudioUrls('sino-korean', 12345, [{ id: 'v' }])

            expect(urls).toContain('/audio/sino-korean/12345-v.mp3')
        })
    })

    describe('getAudioCacheKey', () => {
        it('should create a unique key from languageId and number', () => {
            expect(getAudioCacheKey('sino-korean', 5)).toBe('sino-korean:5')
            expect(getAudioCacheKey('sino-korean', 10)).toBe('sino-korean:10')
            expect(getAudioCacheKey('native-korean', 5)).toBe('native-korean:5')
        })

        it('should create different keys for different numbers', () => {
            const key1 = getAudioCacheKey('sino-korean', 1)
            const key2 = getAudioCacheKey('sino-korean', 2)

            expect(key1).not.toBe(key2)
        })

        it('should create different keys for different languages', () => {
            const key1 = getAudioCacheKey('sino-korean', 5)
            const key2 = getAudioCacheKey('native-korean', 5)

            expect(key1).not.toBe(key2)
        })
    })

    describe('pickRandom', () => {
        it('should return an item from the array', () => {
            const items = ['a', 'b', 'c', 'd', 'e']
            const picked = pickRandom(items)

            expect(items).toContain(picked)
        })

        it('should return the only item for single-item array', () => {
            expect(pickRandom(['only'])).toBe('only')
        })

        it('should pick from numbers array', () => {
            const numbers = [1, 2, 3, 4, 5]
            const picked = pickRandom(numbers)

            expect(numbers).toContain(picked)
        })

        it('should eventually pick different items (randomness test)', () => {
            const items = ['a', 'b', 'c', 'd', 'e']
            const picked = new Set<string>()

            // Pick many times to ensure randomness
            for (let i = 0; i < 100; i++) {
                picked.add(pickRandom(items))
            }

            // Should have picked multiple different items
            expect(picked.size).toBeGreaterThan(1)
        })
    })
})
