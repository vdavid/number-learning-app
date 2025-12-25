# Adding a new language

This guide explains how to add support for a new language to the number trainer.

## Overview

For each new language, you'll need to:

1. Create a language definition (id, name, language code, flag)
2. A curriculum defining the default learning stages
3. Implement two or three functions:
    1. `numberToWords` – 3 => "three". Used for text-to-speech (TTS) generation.
    2. `parseSpokenNumber` – {"three", "3", "٣"} => 3. Used for speech-to-text (STT) validation.
    3. `numberToRomanized` – optional, needed only if `numberToWords` returns non-Latin script, like "삼" in
       Sino-Korean. This should return a string like "o-sip-sa" ("fifty-four" in Korean).
4. Generate audio files
5. Wire it up in the app

## Step-by-step guide

### 1. Create the language definition

1. Decide on the language ID (examples: german, spanish, sino-korean), name ("German", "Spanish", "Sino-Korean"), code
   ([IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) and
   [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) codes, e.g."ge-DE", "sp-ES", "ko-KR"), and
   flag emoji ("🇩🇪", "🇪🇸", "🇰🇷").
2. Implement the Language interface in `src/languages/{your-language}/index.ts`.

### 2. Create the curriculum

1.  Create a language generator config at `scripts/curriculum-gen/languages/{your-language}.ts` that exports a
    `LanguageConfig`:

        ```ts
        import type { LanguageConfig } from './types.js'

        const helpTexts: Record<number, string> = {
            // Number-specific tips for English speakers
            1: 'Explain pronunciation or pattern here...',
            // ...
        }

        export const yourLanguageConfig: LanguageConfig = {
            id: 'your-language',
            helpTexts,
            voices: [], // We'll fill this in a later step
            localizeStages: (stages) => {
                // Customize stage names/descriptions here!
                return stages
            },
        }
        ```

2.  Register your config in `scripts/curriculum-gen/languages/index.ts`:

    ```ts
    import { yourLanguageConfig } from './your-language.js'

    export const configs: Record<string, LanguageConfig> = {
        // ...existing languages
        'your-language': yourLanguageConfig,
    }
    ```

3.  The curriculum uses a default 9-stage structure (defined in `default-stages.ts`):
    1. **1–10** (Digits)
    2. **11–20** (Teens)
    3. **21–30** (Twenties)
    4. **Decades** (0, 40, 50... 100)
    5. **31–99** (Sparse random selection)
    6. **Hundreds** (100, 200... 1000)
    7. **101–999** (Sparse random selection)
    8. **1000–9999** (Sparse random selection)
    9. **10000+** (Sparse random selection)

    Use `localizeStages()` to customize stage names/descriptions for your language, or override numbers if needed (e.g.,
    French might want a separate stage for 70–99).
    - `helpText`
        - `helpText` aids the student with clues for remembering the number, and about understanding language logic.
        - Should be max. 170 chars (soft limit). Be concise, only use longer `helpText`s if meaningful.
        - Leave the vast majority of them empty for numbers above 1,000 and such, but for numbers especially in the
          beginning, it'd be important to not just quiz them but also help English speakers understand the logic.
        - Think about how your language reads numbers and be especially mindful of the weird stuff. Those are the parts
          that students need to be particularly mindful of.
        - Some more examples:
            - Sino-Korean uses multipliers: 십 (10), 백 (100), 천 (1000), 만 (10000). Implicit "one" before multipliers:
              백 =100 (not 일백)
            - Japanese is similar to Sino-Korean with multipliers. It uses different readings for some numbers.
            - French has special cases for 70–79 (soixante-dix to soixante-dix-neuf), and for 80–99 (quatre-vingts
              system)
            - In German, units come before the tens: 54 = "vierundfünfzig" (four-and-fifty)
        - DO NOT write prefixes like `1 —`. The game already displays numbers, incl. non-latin script where applicable.
        - DO NOT rely on the sequence. Don't write "Almost at twenty!" for 19. The numbers are randomized per stage, and
          20 might come earlier than 19.
        - Make them timeless. These are flashcards in an SRS system. Even when the student is studying 3-digit numbers,
          single digits will sometimes come up. Consider this when writing the help texts.
        - To know what numbers you can add help texts for, you'll need to know which random numbers actually end up in
          the JSON. So it's best to generate the curriculum first without the `helpText` (using
          `pnpm cur-gen --lang your-language`) to see which numbers get into the generation. Use the command
          `jq -r '[.stages[].numbers[].value] | join(", ")' src/curriculum/swedish.json` to list the numbers.
        - See the files in `scripts/curriculum-gen/languages/` for reference, like `swedish.ts`, and `sino-korean.ts`.

4. Generate patterns for the language.

What are patterns? For English, there are 59 patterns in total for a human to understand how to form any natural number
until 1 trillion:
- **13 patterns to memorize 0–12**: 13, each number is new
- **9 patterns to memorize/understand forming 13–19**: 1 ("teen")+1 (order: N&"teen")+7 (numbers)
- **8 patterns to memorize/understand forming decades (20, 30, ... 90)**: 8 (each decade)
- **4 patterns to understand how to form 21–29**: 2 (21 and 22 are not like 11 and 12)+1 (order: "20"&N)+1 (the rest are the same)
- **1 patterns to understand 31–39**: only 1 (it's the same as twenty-*)
- **1 patterns to understand the remaining between 40 and 99**: only 1 (it's the same)
- **2 patterns to learn hundreds**: 1 (hundred)+1 (pattern: N&"hundred")
- **1 patterns to learn 101–999**: only 1! (the order/pattern to form them)
- **4 patterns to learn plain thousands**: 1 (thousand)+1 (pattern: N&"thousand")+1 (pattern: NN&"thousand)+1 (pattern: NNN&"thousand)
- **2 patterns to learn the rest between 1001–999,999**: 1 (first part is NNN&"thousand")+1 (second part is just NNN, no magic)
- **4 patterns to learn millions**: like plain thousands
- **2 patterns to learn 1M–999M**: like 1k–1M
- **4 patterns to learn billions**: like plain thousands
- **3 patterns to learn 1B–1T**: like 1k–1M +1 (trillion)

So, first, figure out the patterns for your language, and write them down in `docs/your-language.md` to document how
patterns work in your language.

Then convert them to a list of constants in this format (these are for English):

- Stage 1: The Atomic Base (0–12)
    - `NUM_ZERO` – Rote memorization of "zero".
    - `NUM_ONE` – Rote memorization of "one".
    - `NUM_TWO` – Rote memorization of "two".
    - `NUM_THREE` – Rote memorization of "three".
    - `NUM_FOUR` – Rote memorization of "four".
    - `NUM_FIVE` – Rote memorization of "five".
    - `NUM_SIX` – Rote memorization of "six".
    - `NUM_SEVEN` – Rote memorization of "seven".
    - `NUM_EIGHT` – Rote memorization of "eight".
    - `NUM_NINE` – Rote memorization of "nine".
    - `NUM_TEN` – Rote memorization of "ten".
    - `NUM_ELEVEN` – Rote memorization of "eleven" (irregularity).
    - `NUM_TWELVE` – Rote memorization of "twelve" (irregularity).
- Stage 2: The "Teen" Constructors (13–19)
    - `SUFFIX_TEEN` – The word "teen" used as a suffix.
    - `PATTERN_TEEN_ORDER` – The rule that the digit comes before the suffix (unlike Asian languages often 10+3).
    - `STEM_THIR` – The modified stem for 13.
    - `STEM_FOUR` – The regular stem for 14.
    - `STEM_FIF` – The modified stem for 15.
    - `STEM_SIX` – The regular stem for 16.
    - `STEM_SEVEN` – The regular stem for 17.
    - `STEM_EIGH` – The modified stem for 18 (shared 't').
    - `STEM_NINE` – The regular stem for 19.
- Stage 3: The Decades (20–90)
    - `NUM_TWENTY` – Rote memorization of "twenty".
    - `NUM_THIRTY` – Rote memorization of "thirty".
    - `NUM_FORTY` – Rote memorization of "forty" (spelling change from four).
    - `NUM_FIFTY` – Rote memorization of "fifty".
    - `NUM_SIXTY` – Rote memorization of "sixty".
    - `NUM_SEVENTY` – Rote memorization of "seventy".
    - `NUM_EIGHTY` – Rote memorization of "eighty".
    - `NUM_NINETY` – Rote memorization of "ninety".
- Stage 4: Compound Decades (21–29)
    - `RULE_21_NOT_ELEVEN` – Explicit rule that 21 does not revert to "eleven" logic.
    - `RULE_22_NOT_TWELVE` – Explicit rule that 22 does not revert to "twelve" logic.
    - `PATTERN_DECADE_UNIT_ORDER` – The rule of saying "Twenty" then "One" (Big-Endian).
    - `PATTERN_2X_REGULARITY` – The rule that 23–29 follow the standard pattern.
- Stage 5: Pattern Extension (30–99)
    - `PATTERN_3X_SAME_AS_2X` – Understanding that 30s behave exactly like 20s.
    - `PATTERN_REMAINING_DECADES` – Understanding that 40–99 behave exactly like 20s.
- Stage 6: Hundreds & The "101" Exception
    - `UNIT_HUNDRED` – The word "hundred".
    - `PATTERN_N_HUNDRED` – The prefix pattern (Digit + "hundred").
    - `CONNECTOR_AND` – The specific connecting word "and" (or silence in US) used after hundred.
    - `PATTERN_HUNDRED_REMAINDER` – The logic of appending the remaining 0–99 part to the hundred block.
- Stage 7: Thousands
    - `UNIT_THOUSAND` – The word "thousand".
    - `PATTERN_N_THOUSAND` – Pattern for 1,000–9,000.
    - `PATTERN_NN_THOUSAND` – Pattern for 10,000–99,000.
    - `PATTERN_NNN_THOUSAND` – Pattern for 100,000–999,000.
    - `PATTERN_THOUSAND_HEAD` – Constructing the leading "thousand" block (1001–999,999).
    - `PATTERN_THOUSAND_TAIL` – Appending the standard 0–999 block after the thousand.
- Stage 8: Millions
    - `UNIT_MILLION` – The word "million".
    - `PATTERN_N_MILLION` – Pattern for 1M–9M.
    - `PATTERN_NN_MILLION` – Pattern for 10M–99M.
    - `PATTERN_NNN_MILLION` – Pattern for 100M–999M.
    - `PATTERN_MILLION_HEAD` – Constructing the leading "million" block.
    - `PATTERN_MILLION_TAIL` – Appending the remaining thousands/hundreds block.
- Stage 9: Billions
    - `UNIT_BILLION` – The word "billion".
    - `PATTERN_N_BILLION` – Pattern for 1B–9B.
    - `PATTERN_NN_BILLION` – Pattern for 10B–99B.
    - `PATTERN_NNN_BILLION` – Pattern for 100B–999B.
    - `PATTERN_BILLION_HEAD` – Constructing the leading "billion" block.
    - `PATTERN_BILLION_TAIL` – Appending the remaining millions block.
- Stage 10: Trillions (1 Fact)
    - `UNIT_TRILLION` – The word "trillion" (Pattern logic is reused from previous levels).

Add this to `docs/your-language.md` as well.

5. Generate the curriculum:

- `pnpm cur-gen --lang your-language` to generate a single language.
- `pnpm cur-gen` to generate all.
- `pnpm cur-gen:check` to verify all curriculum JSONs are fresh. (useful in CI)

### 3. Implement converter/parser scripts

- Number-to-words conversion is for TTS.
- Spoken-words-to-number parsing is for STT validation. STT output varies. The parser should handle:
    - Pure digits: "54"
    - Pure words: "fifty-four"
    - Mixed: "50-four"
    - With/without hyphens, spaces
- The romanization script is for displaying roman transcriptions for languages that use a non-Latin script.
- Unit test them thoroughly.

### 4. Generate audio files

For MUCH better audio quality, we pre-generate audio files using ElevenLabs instead of relying on browser TTS.

- Go to https://elevenlabs.io/app/speech-synthesis/text-to-speech and find a number of voices and settings that sound
  good for your language.
- Find the voice IDs for your selected voices by:
  `curl "https://api.elevenlabs.io/v2/voices?search=VoiceName" -H "xi-api-key: YOUR_API_KEY"` (substitute `VoiceName`)
- Generate the audio files by running `npx tsx scripts/audio-gen/generate.ts` with the voice ID and settings you picked.
  Run the script conservatively, just for five numbers at first, and check with a human if the audio sounds good. See
  the top of the file for options!
- Audio files will be saved as `public/{your-language}/audio/{number}-{voice}.{extension}`. Files are normally 10–15 kB
  apiece.

### 5. Wire up the new language in the app

Add it to the language registry in `src/languages/index.ts`. That's it!
