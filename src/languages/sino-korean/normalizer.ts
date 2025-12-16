/**
 * Sino-Korean number parser and normalizer.
 * Handles the complexity of parsing STT output which may be:
 * - Pure digits: "54"
 * - Pure Hangul: "오십사"
 * - Mixed: "5십4" or "오십4"
 */

const digitToHangulMap: string[] = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

interface PlaceValue {
    divisor: number
    suffix: string
    useRecursive: boolean
}

const placeValues: PlaceValue[] = [
    { divisor: 1_000_000_000_000, suffix: '조', useRecursive: true },
    { divisor: 100_000_000, suffix: '억', useRecursive: true },
    { divisor: 10_000, suffix: '만', useRecursive: true },
    { divisor: 1_000, suffix: '천', useRecursive: false },
    { divisor: 100, suffix: '백', useRecursive: false },
    { divisor: 10, suffix: '십', useRecursive: false },
]

function formatPlaceValue(value: number, pv: PlaceValue): string {
    if (value === 1) return pv.suffix
    const prefix = pv.useRecursive ? numberToSinoKorean(value) : digitToHangulMap[value]
    return prefix + pv.suffix
}

// 54 → "오십사"
// 123 → "백이십삼"
export function numberToSinoKorean(num: number): string {
    if (num === 0) return '영'
    if (num < 0) return '마이너스 ' + numberToSinoKorean(-num)

    let result = ''
    let remaining = num

    for (const pv of placeValues) {
        if (remaining >= pv.divisor) {
            const value = Math.floor(remaining / pv.divisor)
            result += formatPlaceValue(value, pv)
            remaining %= pv.divisor
        }
    }

    // Handle units
    if (remaining > 0) {
        result += digitToHangulMap[remaining]
    }

    return result || '영'
}

const digitToRomanizedMap: string[] = ['yeong', 'il', 'i', 'sam', 'sa', 'o', 'yuk', 'chil', 'pal', 'gu']

interface RomanizedPlaceValue {
    divisor: number
    suffix: string
    useRecursive: boolean
}

function getRomanizedPrefix(value: number, useRecursive: boolean, recursiveFn: (n: number) => string): string {
    if (value === 1) return ''
    return useRecursive ? recursiveFn(value) : digitToRomanizedMap[value]
}

// 54 → "o-sip-sa"
export function numberToSinoKoreanRomanized(num: number): string {
    if (num === 0) return 'yeong'
    // Negative numbers not strictly needed for this app but good for completeness
    if (num < 0) return 'maineo-seu ' + numberToSinoKoreanRomanized(-num)

    const parts: string[] = []
    let remaining = num

    const romanizedPlaceValues: RomanizedPlaceValue[] = [
        { divisor: 1_000_000_000_000, suffix: 'jo', useRecursive: true },
        { divisor: 100_000_000, suffix: 'eok', useRecursive: true },
        { divisor: 10000, suffix: 'man', useRecursive: true },
        { divisor: 1000, suffix: 'cheon', useRecursive: false },
        { divisor: 100, suffix: 'baek', useRecursive: false },
        { divisor: 10, suffix: 'sip', useRecursive: false },
    ]

    for (const { divisor, suffix, useRecursive } of romanizedPlaceValues) {
        if (remaining >= divisor) {
            const value = Math.floor(remaining / divisor)
            const prefix = getRomanizedPrefix(value, useRecursive, numberToSinoKoreanRomanized)
            parts.push((prefix ? prefix + '-' : '') + suffix)
            remaining %= divisor
        }
    }

    // Handle units
    if (remaining > 0) {
        parts.push(digitToRomanizedMap[remaining])
    }

    // Join and clean up dashes
    let result = parts.join('-')
    // Fix double dashes or edge cases if any
    result = result.replace(/--+/g, '-').replace(/^-|-$/g, '')

    return result || 'yeong'
}

/**
 * Parse a potentially mixed Korean/digit string to a number.
 * Handles STT quirks like "5십4" or "오십4".
 */
export function parseSinoKorean(text: string): number | null {
    // Remove whitespace and normalize
    const cleaned = text.trim().replace(/\s+/g, '')

    if (!cleaned) return null

    // If it's purely numeric, just parse it
    if (/^\d+$/.test(cleaned)) {
        return parseInt(cleaned, 10)
    }

    // Check for standalone zero
    if (cleaned === '영' || cleaned === '공') {
        return 0
    }

    // Replace ANY digit sequence with its Hangul equivalent
    // This handles "50" -> "오십" and "2백" -> "이백"
    const normalized = cleaned.replace(/\d+/g, (match) => {
        const val = parseInt(match, 10)
        return numberToSinoKorean(val)
    })

    // Now parse the pure Hangul string
    return parseHangulNumber(normalized)
}

function parseHangulNumber(hangulNumberString: string): number | null {
    if (!hangulNumberString) return null

    let total = 0
    let current = 0
    let manBuffer = 0 // Buffer for values before 만

    let i = 0

    // noinspection NonAsciiCharacters
    const hangulNumberStringToDigitMap: Record<string, number> = {
        영: 0,
        공: 0, // Alternative for zero
        일: 1,
        이: 2,
        삼: 3,
        사: 4,
        오: 5,
        육: 6,
        칠: 7,
        팔: 8,
        구: 9,
    }

    // noinspection NonAsciiCharacters
    const hangulNumberStringToMultiplierMap: Record<string, number> = {
        십: 10,
        백: 100,
        천: 1000,
        만: 10000,
        억: 100_000_000,
        조: 1_000_000_000_000,
    }

    let joBuffer = 0 // Buffer for values before 조

    while (i < hangulNumberString.length) {
        const char = hangulNumberString[i]

        // Check for digits
        if (char in hangulNumberStringToDigitMap) {
            current = hangulNumberStringToDigitMap[char]
            i++
            continue
        }

        // Check for multipliers
        if (char in hangulNumberStringToMultiplierMap) {
            const multiplier = hangulNumberStringToMultiplierMap[char]

            if (multiplier === 10000) {
                // 만 - ten thousand
                // Everything accumulated so far goes into the man buffer
                manBuffer = (manBuffer + (current || 1)) * 10000
                current = 0
                total = 0
            } else if (multiplier === 100_000_000) {
                // 억 - hundred million
                total = (manBuffer + total + (current || 1)) * 100_000_000
                manBuffer = 0
                current = 0
            } else if (multiplier === 1_000_000_000_000) {
                // 조 - trillion
                joBuffer = (joBuffer + manBuffer + total + (current || 1)) * 1_000_000_000_000
                manBuffer = 0
                total = 0
                current = 0
            } else {
                // 십, 백, 천
                total += (current || 1) * multiplier
                current = 0
            }
            i++
            continue
        }

        // Unknown character - skip or fail
        i++
    }

    // Add any remaining current value
    total += current

    // Add the man buffer and jo buffer
    total += manBuffer
    total += joBuffer

    return total || null
}
