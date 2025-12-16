import { loadCurriculum } from '../curriculum.js'

import { numberToSwedish, parseSwedish } from './normalizer.js'

import type { Language } from '@/languages'

export const swedish: Language = {
    id: 'swedish',
    name: 'Swedish',
    ttsLanguageCode: 'sv-SE',
    sttLanguageCode: 'sv-SE',
    flag: '🇸🇪',
    curriculum: loadCurriculum('swedish'),
    numberToWords: numberToSwedish,
    parseSpokenNumber: parseSwedish,
}
