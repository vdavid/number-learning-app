import type { Stage, VoiceConfig } from '@shared/types/index.js'

import { LanguageId } from '../../../src/languages/index.js'

export interface LanguageConfig {
    id: LanguageId
    helpTexts: Record<number, string>
    voices: VoiceConfig[]
    // Optional stage customization: localize descriptions, add/remove numbers.
    localizeStages?: (stages: Stage[]) => Stage[]
}
