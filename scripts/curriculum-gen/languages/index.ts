import { sinoKoreanConfig } from './sino-korean.js'
import { swedishConfig } from './swedish.js'
import type { LanguageConfig } from './types.js'

export const configs: Record<string, LanguageConfig> = {
    'sino-korean': sinoKoreanConfig,
    swedish: swedishConfig,
}

export type { LanguageConfig } from './types.js'
