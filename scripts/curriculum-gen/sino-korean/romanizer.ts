/**
 * Sino-Korean number romanization.
 * Converts numbers to their romanized Korean pronunciation.
 */

const ROMANIZED_DIGITS: string[] = ['yeong', 'il', 'i', 'sam', 'sa', 'o', 'yuk', 'chil', 'pal', 'gu']

/**
 * Convert a number to its Romanized Sino-Korean representation.
 * Examples: 1 → "il", 54 → "o-sip-sa", 100 → "baek"
 */
export function numberToRomanized(num: number): string {
    if (num === 0) return 'yeong'
    if (num < 0) return 'maineo-seu-' + numberToRomanized(-num)

    const parts: string[] = []
    let remaining = num

    // Handle 억 (hundred million)
    if (remaining >= 100000000) {
        const eok = Math.floor(remaining / 100000000)
        const prefix = eok === 1 ? '' : numberToRomanized(eok)
        parts.push((prefix ? prefix + '-' : '') + 'eok')
        remaining %= 100000000
    }

    // Handle 만 (ten thousand)
    if (remaining >= 10000) {
        const man = Math.floor(remaining / 10000)
        const prefix = man === 1 ? '' : numberToRomanized(man)
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
    result = result.replace(/--+/g, '-').replace(/^-|-$/g, '')

    return result || 'yeong'
}
