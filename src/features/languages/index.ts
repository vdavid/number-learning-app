import { sinoKorean } from './sino-korean/index.js'
import { swedish } from './swedish/index.js'
import type { Language, LanguageRegistry } from './types.js'

export type { Language, LanguageRegistry } from './types.js'

const languageIdToLanguageMap: LanguageRegistry = {
    'sino-korean': sinoKorean,
    swedish: swedish,
}

export const defaultLanguageID = 'sino-korean'

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

export function getAllLanguageIds(): string[] {
    return Object.keys(languageIdToLanguageMap)
}
