import { loadCurriculum } from '../curriculum.js'
import type { Language } from '../types.js'

import { numberToSinoKorean, numberToSinoKoreanRomanized, parseSinoKorean } from './normalizer.js'

export const sinoKorean: Language = {
    id: 'sino-korean',
    name: 'Sino-Korean',
    ttsLanguageCode: 'ko-KR',
    sttLanguageCode: 'ko-KR',
    flag: '🇰🇷',
    curriculum: loadCurriculum('sino-korean'),
    numberToNonLatin: numberToSinoKorean,
    numberToRomanized: numberToSinoKoreanRomanized,
    parseSpokenNumber: parseSinoKorean,
}
