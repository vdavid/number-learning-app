# Scripts

This folder contains build-time scripts for generating curriculum and audio files.

## Prerequisites

1. `pnpm install` at the project root to install deps.
2. `cp .env.example .env` and set your secrets in `.env`.

## Curriculum generators

These generators are language-specific. They generate deterministic curriculum with all numbers and help texts.

Run `pnpm cur-gen --lang {language-id}` to generate curriculum (or just `pnpm cur-gen` to gen all, it's fast!).

Outputs will be at `src/curriculum/{language-id}.json`.

The scripts overwrite existing files.

## Audio generator

Generates audio files for a given language, for each number. Uses ElevenLabs TTS.

Run the curriculum generator first to create `{language-id}.json`. This script uses the generated voice IDs from the
JSON.

It's at `scripts/audio-gen/generate.ts`. See the example usages at the top of the file.

Output will be at: `public/{language-id}/audio/{number}-{voice}.{extension}`. Examples:

- `1-charlie.mp3` - Number 1 spoken by Charlie, mp3 format (44kHz/128kbps)
- `54-matilda.opus` - Number 54 spoken by Matilda, Opus format (48kHz/128kbps)
