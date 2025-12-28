import type { Pattern, Stage, VoiceConfig } from '@curriculum/curriculum.ts'
import type { LanguageId } from '@languages/index.ts'

export interface LanguageConfig {
    id: LanguageId
    helpTexts: Record<number, string>
    voices: VoiceConfig[]
    /** Pattern definitions for this language */
    patterns: Record<string, Pattern>
    /** Mapping from number to pattern IDs it demonstrates */
    numberPatternMap: Record<number, string[]>
    /** Optional stage customization: localize descriptions, add/remove numbers */
    localizeStages?: (stages: Stage[]) => Stage[]
}
