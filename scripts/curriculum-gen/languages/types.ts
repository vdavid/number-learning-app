import type { Stage, VoiceConfig } from '@curriculum/curriculum.ts'
import type { LanguageId } from '@languages/index.ts'

export interface LanguageConfig {
    id: LanguageId
    helpTexts: Record<number, string>
    voices: VoiceConfig[]
    // Optional stage customization: localize descriptions, add/remove numbers.
    localizeStages?: (stages: Stage[]) => Stage[]
}
