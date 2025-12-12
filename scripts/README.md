# Scripts

This folder contains build-time scripts for generating curriculum manifests and audio files.

## Prerequisites

1. Install dependencies from the project root:

    ```bash
    pnpm install
    ```

2. Create a `.env` file in the project root with your ElevenLabs API key:
    ```
    ELEVENLABS_API_KEY=your_api_key_here
    ```

## Folder structure

```
scripts/
├── types.ts                    # Shared TypeScript types
├── tsconfig.json              # TypeScript config for scripts
├── curriculum-gen/            # Curriculum generation scripts
│   └── sino-korean/
│       ├── generate.ts        # Generates manifest.json
│       └── romanizer.ts       # Number-to-romanization
└── audio-gen/                 # Audio generation scripts
    ├── lib/
    │   └── elevenlabs.ts      # ElevenLabs API client
    └── sino-korean/
        ├── generate.ts        # Generates audio files
        └── number-to-words.ts # Number-to-Korean words
```

## Curriculum generation

Generates a deterministic curriculum manifest with all numbers and their romanizations.

```bash
# Generate Sino-Korean curriculum
npx tsx scripts/curriculum-gen/sino-korean/generate.ts
```

Output: `public/audio/sino-korean/manifest.json`

The manifest contains:

- Language metadata (id, display name, language code)
- Voice configurations (id, ElevenLabs voice ID, name)
- Stages with numbers and romanizations

## Audio generation

Generates audio files for each number using ElevenLabs TTS.

**Important**: Run the curriculum generator first to create the manifest.

```bash
# Generate all audio for all voices (slow, many API calls)
npx tsx scripts/audio-gen/sino-korean/generate.ts

# Generate for a specific voice only. (By default, it generates for all known voices)
npx tsx scripts/audio-gen/sino-korean/generate.ts --voice charlie

# Generate for a specific stage (0-indexed)
npx tsx scripts/audio-gen/sino-korean/generate.ts --stage 0

# Generate in a specific format (default is mp3)
npx tsx scripts/audio-gen/sino-korean/generate.ts --format opus

# Generate for a specific number range
npx tsx scripts/audio-gen/sino-korean/generate.ts --min 1 --max 10

# Force regeneration (don't skip existing files)
npx tsx scripts/audio-gen/sino-korean/generate.ts --no-skip-existing
```

Output: `public/audio/sino-korean/{number}-{voice}.{extension}`

Examples:

- `1-charlie.{extension}` - Number 1 spoken by Charlie
- `54-matilda.{extension}` - Number 54 spoken by Matilda

### Audio format

Audio is generated in mp3/Opus format at 48kHz/128kbps, which provides:

- Excellent quality for speech
- Small file sizes (~10-15KB per number)
- Good browser support (Chrome, Firefox, Safari 11+, Edge)

## Adding a new language

1. Create curriculum generator: `scripts/curriculum-gen/{language}/`
    - `generate.ts` - Main generator script
    - `romanizer.ts` - Number-to-romanization logic

2. Create audio generator: `scripts/audio-gen/{language}/`
    - `generate.ts` - Main generator script
    - `number-to-words.ts` - Number-to-native-words logic

3. Run the curriculum generator to create the manifest
4. Run the audio generator to create audio files

See `sino-korean/` implementations as reference.

## Voice IDs

Voice IDs for ElevenLabs can be found using:

```bash
curl "https://api.elevenlabs.io/v2/voices?search=VoiceName" \
  -H "xi-api-key: YOUR_API_KEY"
```

Current voices:

- **Charlie** (Korean): `IKne3meq5aSn9XLyUdCD`
- **Matilda** (Korean): `XrExE9yKIg1WjnnlVkGX`
