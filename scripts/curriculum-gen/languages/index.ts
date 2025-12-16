import type { LanguageId } from '@languages/index.ts'

import { sinoKoreanConfig } from './sino-korean.ts'
import { swedishConfig } from './swedish.ts'
import type { LanguageConfig } from './types.ts'

export const configs: Record<LanguageId, LanguageConfig> = {
    'sino-korean': sinoKoreanConfig,
    swedish: swedishConfig,
}

export type { LanguageConfig } from './types.ts'
