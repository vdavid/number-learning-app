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
- Consider language-specific quirks (for example, French 70–99)

### 3. Create the normalizer

Create `normalizer.ts` for number parsing:

```typescript
// Map words to digits
const numberStringToDigitMap: Record<string, number> = {
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

You can use an LLM to help generate curriculum and word mappings. See [adding-new-language.md](adding-new-language.md)
for prompts and guidelines.

This section provides prompts and guidelines for using LLMs to help generate language curricula and number parsing
logic.

### Generating curriculum

Use this prompt to generate a curriculum for a new language:

```
I'm building a number learning app. I need a curriculum for learning [LANGUAGE] numbers.

The curriculum should be structured as stages, where each stage introduces a new concept. For example:
- Stage 1: Basic digits (1-10)
- Stage 2: Teens (11-20)
- Stage 3: Decades (10, 20, 30... 100)
- And so on...

For each stage, provide:
1. A short name
2. A brief description
3. The numbers to include

Consider these language-specific quirks:
- [List any known irregularities, like French 70-99]

Output as JSON:
{
  "stages": [
    {
      "name": "Stage name",
      "description": "What this stage teaches",
      "numbers": [1, 2, 3, ...]
    }
  ]
}

Make sure to:
- Start simple and build complexity
- Group numbers by the concept they teach
- For large ranges (100-999), use a sparse selection (~50-100 numbers)
- Include milestone numbers (100, 1000, 10000, etc.)
```

### Generating number-to-word mappings

```
For [LANGUAGE], provide the mapping from numbers to their spoken words.

I need:
1. Basic digit words (0-9)
2. Multiplier words (ten, hundred, thousand, etc.)
3. Any irregular numbers (like "eleven" in English)

Output as TypeScript:
const numberStringToDigitMap: Record<string, number> = {
  'zero': 0,
  // ...
}

const numberStringToMultiplierMap: Record<string, number> = {
  'ten': 10,
  // ...
}

const irregularNumberToStringMap: Record<number, string> = {
  11: 'eleven',
  // ...
}
```

### Generating the conversion function

```
Write a TypeScript function to convert numbers to [LANGUAGE] words.

The function signature is:
function numberToWords(num: number): string

Consider:
- How multipliers work (for example, Korean: 이십 = 2*10 = 20)
- Special cases like implicit "one" (백 = 100, not 일백)
- Pronunciation of 0 (might have multiple forms)
- Very large numbers (millions, billions)

Here are the word mappings:
[Paste the mappings from the previous prompt]
```

### Generating the parser function

```
Write a TypeScript function to parse [LANGUAGE] number text back to an integer.

The function signature is:
function parseSpokenNumber(text: string): number | null

The input might be:
- Pure digits: "54"
- Pure [LANGUAGE] words: "[word for 54]"
- Mixed: "5[word for 10]4"

Consider:
- STT often produces mixed output
- Normalize spacing and punctuation
- Handle both forms if multiple exist

Here are the word mappings:
[Paste the mappings]
```

### Validating the output

After generating code with an LLM, always:

1. **Test edge cases:**
    - Zero (often has special forms)
    - Numbers requiring implicit "one" (100, 1000)
    - Large numbers (10000+)
    - Round numbers vs. compound numbers

2. **Test STT variations:**
    - All-digit input
    - All-word input
    - Mixed input
    - With/without spaces

3. **Verify curriculum coverage:**
    - All stages build on previous ones
    - No gaps in number coverage
    - Appropriate difficulty progression

### Example: generating Native Korean numbers

Native Korean (as opposed to Sino-Korean) is only used for numbers 1–99 (for counting items, ages, hours). Here's an
example prompt:

```
Generate a curriculum for Native Korean numbers (하나, 둘, 셋...).

Note that Native Korean is only used for numbers 1-99, typically for:
- Counting items
- Telling ages
- Hours (but not minutes)

The numbers 1-4 have shortened forms when used with counters:
- 하나 → 한 (one)
- 둘 → 두 (two)
- 셋 → 세 (three)
- 넷 → 네 (four)

Please structure the curriculum appropriately for this limited range.
```

### Tips for better LLM output

1. **Be specific about the language variant**: Korean has Sino-Korean and Native Korean; Chinese has multiple counting
   systems.
2. **Provide examples**: Show the LLM what format you expect with 2–3 examples.
3. **Ask for edge cases**: Explicitly ask about zeros, large numbers, and irregularities.
4. **Iterate**: Start with basic digits, verify, then expand to larger numbers.
5. **Cross-reference**: Verify LLM output against authoritative sources (textbooks, language references).

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

The generator should output a manifest to `public/your-language/curriculum.json`.

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

Audio files are saved as `public/your-language/audio/{number}-{voice}.{extension}`.

See [scripts/README.md](../scripts/README.md) for detailed usage.

## Language-specific considerations

Think about how your language reads numbers and be especially mindful of the weird stuff. Those are the parts that
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
