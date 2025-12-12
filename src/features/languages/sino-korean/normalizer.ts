/**
 * Sino-Korean number parser and normalizer.
 * Handles the complexity of parsing STT output which may be:
 * - Pure digits: "54"
 * - Pure Hangul: "오십사"
 * - Mixed: "5십4" or "오십4"
 */

/** Sino-Korean digit mappings */
const DIGIT_MAP: Record<string, number> = {
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

/** Reverse mapping: digit to Hangul */
const HANGUL_DIGITS: string[] = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/** Multiplier mappings */
const MULTIPLIER_MAP: Record<string, number> = {
    십: 10,
    백: 100,
    천: 1000,
    만: 10000,
    억: 100000000,
}

/**
 * Convert a number to Sino-Korean words.
 * Examples: 54 → "오십사", 123 → "백이십삼"
 */
export function numberToSinoKorean(num: number): string {
    if (num === 0) return '영'
    if (num < 0) return '마이너스 ' + numberToSinoKorean(-num)

    let result = ''
    let remaining = num

    // Handle 억 (hundred million)
    if (remaining >= 100000000) {
        const eok = Math.floor(remaining / 100000000)
        result += (eok === 1 ? '' : numberToSinoKorean(eok)) + '억'
        remaining %= 100000000
    }

    // Handle 만 (ten thousand)
    if (remaining >= 10000) {
        const man = Math.floor(remaining / 10000)
        result += (man === 1 ? '' : numberToSinoKorean(man)) + '만'
        remaining %= 10000
    }

    // Handle 천 (thousand)
    if (remaining >= 1000) {
        const cheon = Math.floor(remaining / 1000)
        result += (cheon === 1 ? '' : HANGUL_DIGITS[cheon]) + '천'
        remaining %= 1000
    }

    // Handle 백 (hundred)
    if (remaining >= 100) {
        const baek = Math.floor(remaining / 100)
        result += (baek === 1 ? '' : HANGUL_DIGITS[baek]) + '백'
        remaining %= 100
    }

    // Handle 십 (ten)
    if (remaining >= 10) {
        const sip = Math.floor(remaining / 10)
        result += (sip === 1 ? '' : HANGUL_DIGITS[sip]) + '십'
        remaining %= 10
    }

    // Handle units
    if (remaining > 0) {
        result += HANGUL_DIGITS[remaining]
    }

    return result || '영'
}

/**
 * Parse a potentially mixed Korean/digit string to a number.
 * Handles STT quirks like "5십4" or "오십4".
 */
const ROMANIZED_DIGITS: string[] = ['yeong', 'il', 'i', 'sam', 'sa', 'o', 'yuk', 'chil', 'pal', 'gu']

/**
 * Convert a number to its Romanized Sino-Korean representation.
 * Examples: 54 → "o-sip-sa"
 */
export function numberToSinoKoreanRomanized(num: number): string {
    if (num === 0) return 'yeong'
    // Negative numbers not strictly needed for this app but good for completeness
    if (num < 0) return 'maineo-seu ' + numberToSinoKoreanRomanized(-num)

    const parts: string[] = []
    let remaining = num

    // Handle 억 (hundred million)
    if (remaining >= 100000000) {
        const eok = Math.floor(remaining / 100000000)
        parts.push((eok === 1 ? '' : numberToSinoKoreanRomanized(eok)) + '-eok')
        remaining %= 100000000
    }

    // Handle 만 (ten thousand)
    if (remaining >= 10000) {
        const man = Math.floor(remaining / 10000)
        // If the prefix is 1, we usually drop the 'il' for man?
        // Actually, usually 'il-man' is just 'man'.
        const prefix = man === 1 ? '' : numberToSinoKoreanRomanized(man)
        parts.push((prefix ? prefix + '-' : '') + 'man')
        remaining %= 10000
    }

    // Handle 천 (thousand)
    if (remaining >= 1000) {
        const cheon = Math.floor(remaining / 1000)
        const prefix = cheon === 1 ? '' : ROMANIZED_DIGITS[cheon]
        parts.push((prefix ? prefix + '-' : '') + 'cheon')
        remaining %= 1000
    }

    // Handle 백 (hundred)
    if (remaining >= 100) {
        const baek = Math.floor(remaining / 100)
        const prefix = baek === 1 ? '' : ROMANIZED_DIGITS[baek]
        parts.push((prefix ? prefix + '-' : '') + 'baek')
        remaining %= 100
    }

    // Handle 십 (ten)
    if (remaining >= 10) {
        const sip = Math.floor(remaining / 10)
        const prefix = sip === 1 ? '' : ROMANIZED_DIGITS[sip]
        parts.push((prefix ? prefix + '-' : '') + 'sip')
        remaining %= 10
    }

    // Handle units
    if (remaining > 0) {
        parts.push(ROMANIZED_DIGITS[remaining])
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

/**
 * Parse a pure Hangul number string.
 * Uses a state machine to handle multipliers correctly.
 */
function parseHangulNumber(text: string): number | null {
    if (!text) return null

    let total = 0
    let current = 0
    let manBuffer = 0 // Buffer for values before 만

    let i = 0
    while (i < text.length) {
        const char = text[i]

        // Check for digits
        if (char in DIGIT_MAP) {
            current = DIGIT_MAP[char]
            i++
            continue
        }

        // Check for multipliers
        if (char in MULTIPLIER_MAP) {
            const multiplier = MULTIPLIER_MAP[char]

            if (multiplier === 10000) {
                // 만 - ten thousand
                // Everything accumulated so far goes into the man buffer
                manBuffer = (manBuffer + (current || 1)) * 10000
                current = 0
                total = 0
            } else if (multiplier === 100000000) {
                // 억 - hundred million
                total = (manBuffer + total + (current || 1)) * 100000000
                manBuffer = 0
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

    // Add the man buffer
    total += manBuffer

    return total || null
}

/**
 * Get acceptable variations for a number.
 * Includes the numeric string and common spoken forms.
 */
export function getSinoKoreanVariations(num: number): string[] {
    const variations: string[] = [
        String(num),
        numberToSinoKorean(num),
        // Add variations with spaces
        numberToSinoKorean(num).replace(/만/g, '만 ').trim(),
    ]

    // For round numbers, add abbreviated forms
    if (num % 10 === 0 && num >= 10) {
        const tens = num / 10
        if (tens <= 9) {
            variations.push(HANGUL_DIGITS[tens] + '십')
        }
    }

    return [...new Set(variations)]
}
