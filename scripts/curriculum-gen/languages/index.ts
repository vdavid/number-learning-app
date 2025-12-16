import { LanguageId } from '../../../src/languages/index.js'

import { sinoKoreanConfig } from './sino-korean.js'
import { swedishConfig } from './swedish.js'
import type { LanguageConfig } from './types.js'

export const configs: Record<LanguageId, LanguageConfig> = {
    'sino-korean': sinoKoreanConfig,
    swedish: swedishConfig,
}

export type { LanguageConfig } from './types.js'
