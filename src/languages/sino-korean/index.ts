import { numberToSinoKorean, numberToSinoKoreanRomanized, parseSinoKorean } from './normalizer.ts'

import { loadCurriculum } from '@/curriculum/curriculum.ts'
import type { Language } from '@/languages'

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
