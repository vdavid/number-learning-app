# Adding a new language

This guide explains how to add support for a new language to the number trainer.

## Overview

For each new language, you'll need to:

1. A Language definition (id, name, language code, flag)
2. A curriculum defining the learning stages
3. Implement number-to-words conversion (for TTS), spoken-words-to-number parsing (for STT validation), and optionally a
   romanization script, only if the language uses a non-Latin script.
4. Generate audio files
5. Wire it up in the app

## Step-by-step guide

### 1. Decide about the language basics

1. Decide on the language ID (examples: german, spanish, sino-korean), name ("German", "Spanish", "Sino-Korean"), code
   ([IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) and
   [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) codes, e.g."ge-DE", "sp-ES", "ko-KR"), and
   flag emoji ("🇩🇪", "🇪🇸", "🇰🇷").
2. Implement the Language interface in `src/features/languages/{your-language}/index.ts`.

### 2. Create the curriculum

1. Create a generator at `scripts/curriculum-gen/{your-language}/generate.ts` that outputs a `Curriculum` typed JSON to
   `src/features/languages/{your-language}/curriculum.json`, also filling the `helpText` field where it makes sense.
    - Stages
        - The curriculum should normally be these 9 stages:
            1. **1–10** (Digits)
            2. **11–20** (Teens)
            3. **21–30** (Twenties)
            4. **Decades** (0, 10, 20... 90, 100)
            5. **31–99** (Sparse random selection, ~50 cards)
            6. **Hundreds** (200, 300... 1000)
            7. **101–1000** (Sparse random selection, ~100 cards)
            8. **1000–10000** (Sparse random selection, ~100 cards)
            9. **10000+** (~200 cards)

        - But consider language-specific quirks, for example, 70–99 in French might deserve its separate stage.
        - Overall, just think about the stage structure before setting it up.

    - `helpText`
        - `helpText` is an important feature where we can aid the language student with clues for remembering the
          number, or about understanding the logic in the language.
        - Length should be max. 170 chars (soft limit), but be concise, only use longer helpTexts if meaningful.
        - Leave the vast majority of them empty for numbers above 1,000 and the such, but for numbers especially in the
          beginning, it'd be important to not just quiz them but also help English speakers understand the logic.
        - I'd like to add stuff like, {25, helpText: 'In Danish, we base things on 100, so 25 is like
          "quarter-of-a-hundred"'} and for Swedish, {11, helpText: "It's irregular, like in English."}, or also "{20,
          helpText: 'It's sometimes pronounced "ːʃügo" / "shuego", sometimes "ːʃügi" / "shuegi", at times even "ːʃü" /
          "shü"} or similar. Just one sentence here and there to help with cultural variations, background. Anything
          that makes it stick for students.
        - Think about how your language reads numbers and be especially mindful of the weird stuff. Those are the parts
          that students need to be particularly mindful of.
        - Some more examples:
            - Sino-Korean uses multipliers: 십 (10), 백 (100), 천 (1000), 만 (10000). Implicit "one" before multipliers:
              백 =100 (not 일백)
            - Japanese is similar to Sino-Korean with multipliers. It uses different readings for some numbers.
            - French has special cases for 70-79 (soixante-dix to soixante-dix-neuf), and for 80-99 (quatre-vingts
              system)
            - In German, units come before the tens: 54 = "vierundfünfzig" (four-and-fifty)
        - Don't write prefixes like `1 —`. The game already displays numbers, incl. non-latin script where applicable.
        - Don't rely on the sequence. Don't write "Almost at twenty!" for 19. The numbers are randomized per stage, and
          20 might come earlier than 19.
        - To know what numbers you can add help texts for, you'll need to know which random numbers actually end up,
          generate the curriculum first without the helpText to see which numbers actually get in the generation. Use
          the command
          `jq -r '[.stages[].numbers[].value] | join(", ")' src/features/languages/sino-korean/curriculum.json` to list
          the numbers. Don't generate
        - Make them timeless. These are flashcards in an SRS system. Even when the student is studying 3-digit numbers,
          single digits will sometimes come up. Consider this when writing the help texts.
        - See `scripts/curriculum-gen/sino-korean/generate.ts` for reference.

    - Randomization
        - The stages should be in order.
        - In the stages with sparse random selection, the generated numbers should be randomized, but in a deterministic
          fashion (seeded random gen) so that the curriculum always contains the same numbers even if regenerated.
        - The numbers within each stage should be randomized (so, first stage is not 1, 2, 3, ... but 8, 3, 5, etc. so
          it's a bit more interesting. But make this deterministic too.

2. Generate the curriculum JSON: `npx tsx scripts/curriculum-gen/{your-language}/generate.ts`.

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

Add it to the language registry in `src/features/languages/index.ts`. That's it!
