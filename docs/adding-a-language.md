# Adding a new language

This guide explains how to add support for a new language to the number trainer.

## Overview

Each language is defined by implementing the `Language` interface. This includes:

- Number-to-words conversion (for TTS)
- Speech-to-number parsing (for STT validation)
- A curriculum defining the learning stages

## Step-by-step guide

### 1. Create the language directory

```bash
mkdir src/features/languages/your-language
```

### 2. Create the curriculum

Create `curriculum.ts` defining the learning stages:

```typescript
import type { Curriculum, Stage } from '@shared/types'

export function createYourLanguageCurriculum(): Curriculum {
    const stages: Stage[] = [
        {
            name: 'Basic digits',
            description: 'Learn numbers 1-10',
            numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        },
        // Add more stages...
    ]

    return { stages }
}
```

**Tips for curriculum design:**

- Start simple (single digits)
- Group by concept (teens, decades, hundreds)
- Use sparse random selections for large ranges
- Consider language-specific quirks (for example French 70-99)

### 3. Create the normalizer

Create `normalizer.ts` for number parsing:

```typescript
// Map words to digits
const DIGIT_MAP: Record<string, number> = {
    one: 1,
    two: 2,
    // ...
}

export function numberToWords(num: number): string {
    // Convert number to spoken form
    // Example: 54 → "fifty-four"
}

export function parseSpokenNumber(text: string): number | null {
    // Parse STT output back to number
    // Must handle variations like "54", "fifty-four", "fifty four"
}

export function getVariations(num: number): string[] {
    // Return acceptable spoken forms for validation
}
```

**Important:** STT output varies! Your parser should handle:

- Pure digits: "54"
- Pure words: "fifty-four"
- Mixed: "50-four"
- With/without hyphens, spaces

### 4. Create the language definition

Create `index.ts`:

```typescript
import type { Language } from '../types'
import { createYourLanguageCurriculum } from './curriculum'
import { numberToWords, parseSpokenNumber, getVariations } from './normalizer'

export const yourLanguage: Language = {
    id: 'your-language',
    name: 'Your Language',
    ttsLanguageCode: 'xx-XX', // Consists of https://en.wikipedia.org/wiki/IETF_language_tag and https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
    sttLanguageCode: 'xx-XX',
    flag: '🇽🇽',
    curriculum: createYourLanguageCurriculum(),
    numberToWords,
    parseSpokenNumber,
    getAcceptableVariations: getVariations,
}
```

### 5. Register the language

Add to `src/features/languages/index.ts`:

```typescript
import { yourLanguage } from './your-language'

export const languages: LanguageRegistry = {
    'sino-korean': sinoKorean,
    'your-language': yourLanguage, // Add here
}
```

## Using LLMs to help

You can use an LLM to help generate curriculum and word mappings. See [llm-guidelines.md](llm-guidelines.md) for prompts
and guidelines.

## Testing

Add tests for your normalizer:

```typescript
// normalizer.test.ts
import { describe, it, expect } from 'vitest'
import { parseSpokenNumber, numberToWords } from './normalizer'

describe('Your language normalizer', () => {
    it('should convert numbers to words', () => {
        expect(numberToWords(54)).toBe('fifty-four')
    })

    it('should parse spoken numbers', () => {
        expect(parseSpokenNumber('fifty-four')).toBe(54)
        expect(parseSpokenNumber('54')).toBe(54)
    })
})
```

## Pre-generating audio (optional but recommended)

For MUCH better audio quality, we pre-generate audio files using ElevenLabs instead of relying on browser TTS.

### 1. Create the curriculum generator

Create scripts in `scripts/curriculum-gen/your-language/`:

```bash
scripts/curriculum-gen/your-language/
├── generate.ts      # Main generator script
└── romanizer.ts     # Number-to-romanization logic
```

The generator should output a manifest to `public/audio/your-language/manifest.json`.

See `scripts/curriculum-gen/sino-korean/` for reference.

### 2. Create the audio generator

Create scripts in `scripts/audio-gen/your-language/`:

```bash
scripts/audio-gen/your-language/
├── generate.ts        # Main generator script
└── number-to-words.ts # Number-to-native-words logic
```

### 3. Generate the curriculum and audio

```bash
# Generate the curriculum manifest
npx tsx scripts/curriculum-gen/your-language/generate.ts

# Generate audio files (requires ELEVENLABS_API_KEY in .env)
npx tsx scripts/audio-gen/your-language/generate.ts
```

Audio files are saved as `public/audio/your-language/{number}-{voice}.{extension}`.

See [scripts/README.md](../scripts/README.md) for detailed usage.

## Language-specific considerations

Think about how your language reads numbers, and be especially mindful of the weird stuff. Those are the parts that
students need to be particularly mindful of.

Here are some examples:

### Korean (Sino-Korean)

- Uses multipliers: 십 (10), 백 (100), 천 (1000), 만 (10000)
- Implicit "one" before multipliers: 백 = 100 (not 일백)

### Japanese

- Similar to Korean with multipliers
- Different readings for some numbers

### French

- Special cases 70-79 (soixante-dix to soixante-dix-neuf)
- Special cases 80-99 (quatre-vingts system)

### German

- Units before tens: 54 = "vierundfünfzig" (four-and-fifty)
