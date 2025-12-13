/**
 * Convert numbers to Sino-Korean words for TTS.
 */

const hangulDigits: string[] = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']

/**
 * Convert a number to Sino-Korean words.
 * Examples: 1 → "일", 54 → "오십사", 100 → "백"
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
        result += (cheon === 1 ? '' : hangulDigits[cheon]) + '천'
        remaining %= 1000
    }

    // Handle 백 (hundred)
    if (remaining >= 100) {
        const baek = Math.floor(remaining / 100)
        result += (baek === 1 ? '' : hangulDigits[baek]) + '백'
        remaining %= 100
    }

    // Handle 십 (ten)
    if (remaining >= 10) {
        const sip = Math.floor(remaining / 10)
        result += (sip === 1 ? '' : hangulDigits[sip]) + '십'
        remaining %= 10
    }

    // Handle units
    if (remaining > 0) {
        result += hangulDigits[remaining]
    }

    return result || '영'
}
