import { loadCurriculum } from '@curriculum/curriculum.ts'
import type { Language } from '@languages/index.ts'

import { numberToSinoKorean, numberToSinoKoreanRomanized, parseSinoKorean } from './normalizer.ts'

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
