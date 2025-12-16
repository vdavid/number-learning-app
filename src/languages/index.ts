import { sinoKorean } from '@features/languages/sino-korean'
import { swedish } from '@features/languages/swedish'
import type { Curriculum } from '@shared/types'

export interface Language {
    // A lowercase, kebab-case ID like 'sino-korean' or 'native-korean'
    id: string

    // Displayable name like 'Sino-Korean' or 'Native Korean'
    name: string
    // Language code for Web Speech API. Like 'ko-KR', 'ja-JP'.
    // Made from [ISO-639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes), a dash,
    // and [ISO_3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
    ttsLanguageCode: string

    // Language code for speech-to-text. Like 'ko-KR', 'ja-JP'. Same idea as TTS language code.
    sttLanguageCode: string
    // Flag emoji for visual identification
    flag: string

    // The curriculum defining the learning path
    curriculum: Curriculum

    // Used for TTS and display hints. 54 → "오십사"
    numberToWords: (num: number) => string

    // Parses spoken/transcribed text back to a number. For example, "오십사", "54", "5십4" => 54. Null if parsing fails.
    // Used for validation in speaking mode.
    parseSpokenNumber: (text: string) => number | null

    // Returns romanized form, like "o-sip-sa")
    numberToRomanized?: (num: number) => string
}

const languageIdToLanguageMap = {
    'sino-korean': sinoKorean,
    swedish: swedish,
} as const satisfies Record<string, Language>

export type LanguageId = keyof typeof languageIdToLanguageMap

export const defaultLanguageID = 'sino-korean'

export function getLanguage(id: LanguageId): Language {
    const language = languageIdToLanguageMap[id]
    if (!language) {
        throw new Error(`Language not found: ${id}`)
    }
    return language
}

export function getAllLanguages(): Array<{ id: LanguageId; language: Language }> {
    return Object.entries(languageIdToLanguageMap).map(([id, language]) => ({ id: id as LanguageId, language }))
}

export function getAllLanguageIds(): LanguageId[] {
    return Object.keys(languageIdToLanguageMap) as LanguageId[]
}
