import type { Language } from '../types'

import { createSinoKoreanCurriculum } from './curriculum'
import { getSinoKoreanVariations, numberToSinoKorean, parseSinoKorean } from './normalizer'

/**
 * Sino-Korean number system.
 * Used for counting money, phone numbers, addresses, dates, and more.
 * Follows Chinese-derived number words: 일, 이, 삼...
 */
export const sinoKorean: Language = {
    id: 'sino-korean',
    name: 'Sino-Korean',
    ttsLanguageCode: 'ko-KR',
    sttLanguageCode: 'ko-KR',
    flag: '🇰🇷',
    curriculum: createSinoKoreanCurriculum(),
    numberToWords: numberToSinoKorean,
    parseSpokenNumber: parseSinoKorean,
    getAcceptableVariations: getSinoKoreanVariations,
}
