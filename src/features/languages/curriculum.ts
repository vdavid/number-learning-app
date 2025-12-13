import type { Curriculum } from '@shared/types'

const curricula = import.meta.glob<{ default: Curriculum }>('./*/curriculum.json', { eager: true })

export function loadCurriculum(languageId: string): Curriculum {
    const module = curricula[`./${languageId}/curriculum.json`]
    if (!module) {
        throw new Error(`Curriculum not found: ${languageId}`)
    }
    return module.default
}
