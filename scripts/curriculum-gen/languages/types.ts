import type { Stage, VoiceConfig } from '@shared/types/index.js'

export interface LanguageConfig {
    id: string
    helpTexts: Record<number, string>
    voices: VoiceConfig[]
    // Optional stage customization: localize descriptions, add/remove numbers.
    localizeStages?: (stages: Stage[]) => Stage[]
}
