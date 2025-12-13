import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Curriculum } from '@shared/types'

import { sinoKorean } from './sino-korean'
import type { Language, LanguageRegistry } from './types'

export type { Language, LanguageRegistry } from './types'

const languageIdToLanguageMap: LanguageRegistry = {
    'sino-korean': sinoKorean,
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

export function loadCurriculum(languageId: string): Curriculum {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const projectRoot = path.resolve(__dirname, '../../../..')
    const filePath = path.join(path.join(projectRoot, 'public/' + languageId), 'curriculum.json')
    if (!fs.existsSync(filePath)) {
        throw new Error(`Curriculum not found at ${filePath}. Run the curriculum generator first.`)
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Curriculum
}
