// noinspection ES6PreferShortImport -- It doesn't work with a short import
import type { Curriculum } from '@shared/types'

import sinoKoreanCurriculum from '@/curriculum/sino-korean.json'
import swedishCurriculum from '@/curriculum/swedish.json'
import type { LanguageId } from '@/languages'

const curriculumMap: Record<string, Curriculum> = {
    'sino-korean': sinoKoreanCurriculum as Curriculum,
    swedish: swedishCurriculum as Curriculum,
}

export function loadCurriculum(languageId: LanguageId): Curriculum {
    const curriculum = curriculumMap[languageId]
    if (!curriculum) {
        throw new Error(`Curriculum not found: ${languageId}`)
    }
    return curriculum
}
