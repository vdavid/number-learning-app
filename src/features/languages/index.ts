import { sinoKorean } from './sino-korean'
import type { Language, LanguageRegistry } from './types'

export type { Language, LanguageRegistry } from './types'

/**
 * Registry of all available languages.
 * Add new languages here as they're implemented.
 */
export const languages: LanguageRegistry = {
    'sino-korean': sinoKorean,
}

/**
 * Get a language by its ID.
 * @throws if the language doesn't exist
 */
export function getLanguage(id: string): Language {
    const language = languages[id]
    if (!language) {
        throw new Error(`Language not found: ${id}`)
    }
    return language
}

/**
 * Get all available language IDs.
 */
export function getLanguageIds(): string[] {
    return Object.keys(languages)
}

/**
 * Get all languages as an array.
 */
export function getAllLanguages(): Language[] {
    return Object.values(languages)
}

/** Default language for the app */
export const DEFAULT_LANGUAGE_ID = 'sino-korean'
