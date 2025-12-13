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

export function getAllLanguages(): Array<{ id: string; language: Language }> {
    return Object.entries(languageIdToLanguageMap).map(([id, language]) => ({ id, language }))
}

export const defaultLanguageID = 'sino-korean'
