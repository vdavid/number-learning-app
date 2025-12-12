import { sinoKorean } from './sino-korean'
import type { Language, LanguageRegistry } from './types'

export type { Language, LanguageRegistry } from './types'

const languageIdToLanguageMap: LanguageRegistry = {
    'sino-korean': sinoKorean,
}

export function getLanguage(id: string): Language {
    const language = languageIdToLanguageMap[id]
    if (!language) {
        throw new Error(`Language not found: ${id}`)
    }
    return language
}

export const DEFAULT_LANGUAGE_ID = 'sino-korean'
