// noinspection ES6PreferShortImport -- It doesn't work with a short import
import type { Curriculum } from '../../shared/types/index.js'

import sinoKoreanCurriculum from './sino-korean/curriculum.json'
import swedishCurriculum from './swedish/curriculum.json'

const curriculumMap: Record<string, Curriculum> = {
    'sino-korean': sinoKoreanCurriculum as Curriculum,
    swedish: swedishCurriculum as Curriculum,
}

export function loadCurriculum(languageId: string): Curriculum {
    const curriculum = curriculumMap[languageId]
    if (!curriculum) {
        throw new Error(`Curriculum not found: ${languageId}`)
    }
    return curriculum
}
