import type { Language } from '../types'

import { createSinoKoreanCurriculum } from './curriculum'
import { numberToSinoKorean, numberToSinoKoreanRomanized, parseSinoKorean } from './normalizer'

export const sinoKorean: Language = {
    id: 'sino-korean',
    name: 'Sino-Korean',
    ttsLanguageCode: 'ko-KR',
    sttLanguageCode: 'ko-KR',
    flag: '🇰🇷',
    curriculum: createSinoKoreanCurriculum(),
    numberToWords: numberToSinoKorean,
    numberToRomanized: numberToSinoKoreanRomanized,
    parseSpokenNumber: parseSinoKorean,
}
