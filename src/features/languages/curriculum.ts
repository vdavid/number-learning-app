// noinspection ES6PreferShortImport -- It doesn't work with a short import
import type { Curriculum } from '../../shared/types/index.js'

const curriculumForAllLanguages = import.meta.glob<{ default: Curriculum }>('./*/curriculum.json', { eager: true })

export function loadCurriculum(languageId: string): Curriculum {
    const module = curriculumForAllLanguages[`./${languageId}/curriculum.json`]
    if (!module) {
        throw new Error(`Curriculum not found: ${languageId}`)
    }
    return module.default
}
