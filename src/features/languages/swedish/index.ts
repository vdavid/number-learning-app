import { loadCurriculum } from '../curriculum.js'
import type { Language } from '../types.js'

import { numberToSwedish, parseSwedish } from './normalizer.js'

export const swedish: Language = {
    id: 'swedish',
    name: 'Swedish',
    ttsLanguageCode: 'sv-SE',
    sttLanguageCode: 'sv-SE',
    flag: '🇸🇪',
    curriculum: loadCurriculum('swedish'),
    numberToNonLatin: numberToSwedish,
    parseSpokenNumber: parseSwedish,
}
