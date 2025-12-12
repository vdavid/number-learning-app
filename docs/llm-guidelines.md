# LLM guidelines for curriculum generation

This document provides prompts and guidelines for using LLMs to help generate language curricula and number parsing logic.

## Generating a curriculum

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

## Generating number-to-word mappings

```
For [LANGUAGE], provide the mapping from numbers to their spoken words.

I need:
1. Basic digit words (0-9)
2. Multiplier words (ten, hundred, thousand, etc.)
3. Any irregular numbers (like "eleven" in English)

Output as TypeScript:
const DIGIT_MAP: Record<string, number> = {
  'zero': 0,
  // ...
}

const MULTIPLIER_MAP: Record<string, number> = {
  'ten': 10,
  // ...
}

const IRREGULAR_MAP: Record<number, string> = {
  11: 'eleven',
  // ...
}
```

## Generating the conversion function

```
Write a TypeScript function to convert numbers to [LANGUAGE] words.

The function signature is:
function numberToWords(num: number): string

Consider:
- How multipliers work (for example Korean: 이십 = 2*10 = 20)
- Special cases like implicit "one" (백 = 100, not 일백)
- Pronunciation of 0 (might have multiple forms)
- Very large numbers (millions, billions)

Here are the word mappings:
[Paste the mappings from the previous prompt]
```

## Generating the parser function

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

## Validating the output

After generating code with an LLM, always:

1. **Test edge cases:**
   - Zero (often has special forms)
   - Numbers requiring implicit "one" (100, 1000)
   - Large numbers (10000+)
   - Round numbers vs compound numbers

2. **Test STT variations:**
   - All-digit input
   - All-word input
   - Mixed input
   - With/without spaces

3. **Verify curriculum coverage:**
   - All stages build on previous ones
   - No gaps in number coverage
   - Appropriate difficulty progression

## Example: generating Native Korean numbers

Native Korean (as opposed to Sino-Korean) is only used for numbers 1-99 (for counting items, ages, hours). Here's an example prompt:

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

## Tips for better LLM output

1. **Be specific about the language variant** - Korean has Sino-Korean and Native Korean; Chinese has multiple counting systems.

2. **Provide examples** - Show the LLM what format you expect with 2-3 examples.

3. **Ask for edge cases** - Explicitly ask about zeros, large numbers, and irregularities.

4. **Iterate** - Start with basic digits, verify, then expand to larger numbers.

5. **Cross-reference** - Verify LLM output against authoritative sources (textbooks, language references).

