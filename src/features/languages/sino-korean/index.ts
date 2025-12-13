import { loadCurriculum } from '@features/languages'

import type { Language } from '../types'

import { numberToSinoKorean, numberToSinoKoreanRomanized, parseSinoKorean } from './normalizer'

export const sinoKorean: Language = {
    id: 'sino-korean',
    name: 'Sino-Korean',
    ttsLanguageCode: 'ko-KR',
    sttLanguageCode: 'ko-KR',
    flag: '🇰🇷',
    curriculum: loadCurriculum('sino-korean'),
    numberToWords: numberToSinoKorean,
    numberToRomanized: numberToSinoKoreanRomanized,
    parseSpokenNumber: parseSinoKorean,
}
