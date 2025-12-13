/**
 * Sino-Korean number romanization.
 * Converts numbers to their romanized Korean pronunciation.
 */

const romanizedDigits: string[] = ['yeong', 'il', 'i', 'sam', 'sa', 'o', 'yuk', 'chil', 'pal', 'gu']

interface PlaceValue {
    divisor: number
    suffix: string
    useRecursive: boolean
}

const placeValues: PlaceValue[] = [
    { divisor: 100000000, suffix: 'eok', useRecursive: true },
    { divisor: 10000, suffix: 'man', useRecursive: true },
    { divisor: 1000, suffix: 'cheon', useRecursive: false },
    { divisor: 100, suffix: 'baek', useRecursive: false },
    { divisor: 10, suffix: 'sip', useRecursive: false },
]

function getPlacePrefix(value: number, useRecursive: boolean, recursiveFn: (n: number) => string): string {
    if (value === 1) return ''
    return useRecursive ? recursiveFn(value) : romanizedDigits[value]
}

/**
 * Convert a number to its Romanized Sino-Korean representation.
 * Examples: 1 → "il", 54 → "o-sip-sa", 100 → "baek"
 */
export function numberToRomanized(num: number): string {
    if (num === 0) return 'yeong'
    if (num < 0) return 'maineo-seu-' + numberToRomanized(-num)

    const parts: string[] = []
    let remaining = num

    for (const { divisor, suffix, useRecursive } of placeValues) {
        if (remaining >= divisor) {
            const value = Math.floor(remaining / divisor)
            const prefix = getPlacePrefix(value, useRecursive, numberToRomanized)
            parts.push((prefix ? prefix + '-' : '') + suffix)
            remaining %= divisor
        }
    }

    // Handle units
    if (remaining > 0) {
        parts.push(romanizedDigits[remaining])
    }

    // Join and clean up dashes
    let result = parts.join('-')
    result = result.replace(/--+/g, '-').replace(/^-|-$/g, '')

    return result || 'yeong'
}
