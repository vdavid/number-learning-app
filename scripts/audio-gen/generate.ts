#!/usr/bin/env npx tsx
/**
 * Multi-language audio generator.
 *
 * Generates audio files for numbers in the curriculum using ElevenLabs or Google Cloud TTS.
 * Reads from the curriculum JSON and generates audio files for each number/voice combo.
 *
 * Usage:
 *   # Generate all audio for all voices for Swedish
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice all
 *
 *   # Generate for specific voice only
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice charlie
 *
 *   # Generate for specific stage only (0-indexed)
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice charlie --stage 0
 *
 *   # Generate for a specific number range
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice charlie --min 1 --max 10
 *
 *   # To overwrite existing files
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice all --overwrite
 *
 *   # Specify output format (mp3 or opus)
 *   pnpm tsx scripts/audio-gen/generate.ts --language swedish --voice all --format opus
 */

import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadCurriculum, type Curriculum, type TTSProvider, type VoiceConfig } from '@curriculum/curriculum.ts'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { TextToSpeechConvertRequestOutputFormat } from '@elevenlabs/elevenlabs-js/api/resources/textToSpeech/types/TextToSpeechConvertRequestOutputFormat'
import { getAllLanguageIds, getLanguage, type Language, type LanguageId } from '@languages/index.ts'

import {
    audioFileExists as audioFileExistsElevenLabs,
    createClient,
    generateAudio as generateAudioElevenLabs,
} from './elevenlabs.ts'
import { audioFileExists as audioFileExistsGoogle, generateAudioGoogle } from './google-api.ts'

type GenerateOptions = {
    languageId: LanguageId | null
    voiceFilter: string // A voice name, e.g., "charlie" or "matilda", OR "all" to generate for all voices.
    providerFilter?: TTSProvider // Optional: only generate for this provider
    stageFilter?: number
    minNumber?: number
    maxNumber?: number
    skipExisting: boolean
    format?: 'mp3' | 'opus' | 'wav' // Defaults to mp3
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../..')

async function main() {
    const options = parseArgs()

    await generateAudioFiles(options)
}

function parseArgs(): GenerateOptions {
    const args = process.argv.slice(2)
    const options = extractOptions(args)
    validateOptions(options)
    return options
}

const ARG_HANDLERS: Record<string, (options: GenerateOptions, value: string) => void> = {
    '--language': (opts, val) => (opts.languageId = val as LanguageId),
    '--voice': (opts, val) => (opts.voiceFilter = val),
    '--provider': (opts, val) => (opts.providerFilter = val as TTSProvider),
    '--stage': (opts, val) => (opts.stageFilter = parseInt(val, 10)),
    '--min': (opts, val) => (opts.minNumber = parseInt(val, 10)),
    '--max': (opts, val) => (opts.maxNumber = parseInt(val, 10)),
    '--format': (opts, val) => (opts.format = val as 'mp3' | 'opus' | 'wav'),
}

function extractOptions(args: string[]): GenerateOptions {
    const options: GenerateOptions = {
        skipExisting: true,
        languageId: null,
        voiceFilter: 'all',
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--overwrite') {
            options.skipExisting = false
        } else if (ARG_HANDLERS[arg]) {
            if (args[i + 1]) ARG_HANDLERS[arg](options, args[++i])
        } else {
            throw new Error(`Unknown argument: ${arg}`)
        }
    }

    return options
}

function validateOptions(options: GenerateOptions): void {
    if (!options.languageId) {
        throw new Error(
            `Please use the --language argument. The possible languages are: ${getAllLanguageIds().join(',')}`,
        )
    }

    if (!options.voiceFilter) {
        throw new Error('Please use the --voice argument. Use "all" to generate for all voices.')
    }

    if (options.providerFilter && !['elevenlabs', 'google'].includes(options.providerFilter)) {
        throw new Error(`Invalid provider: ${options.providerFilter}. Must be either "elevenlabs" or "google".`)
    }

    if (!['mp3', 'opus', 'wav'].includes(options.format ?? 'mp3')) {
        throw new Error(`Invalid format: ${options.format}. Must be either "mp3", "opus" or "wav".`)
    }
}

function getOutputPath(languageId: LanguageId, num: number, voiceId: string, format: 'mp3' | 'opus' | 'wav'): string {
    const outputDirectory = path.join(projectRoot, `public/${languageId}/audio`)
    return path.join(outputDirectory, `${num}-${voiceId}.${format}`)
}

function audioFileExists(outputPath: string): boolean {
    // Both providers use the same fs.existsSync check, but we expose a unified function
    return audioFileExistsElevenLabs(outputPath) || audioFileExistsGoogle(outputPath)
}

function filterVoices(voices: VoiceConfig[], options: GenerateOptions): VoiceConfig[] {
    let filtered = voices

    if (options.voiceFilter !== 'all') {
        filtered = filtered.filter((v) => v.id === options.voiceFilter)
        if (filtered.length === 0) {
            throw new Error(`Voice "${options.voiceFilter}" not found in curriculum file`)
        }
    }

    if (options.providerFilter) {
        filtered = filtered.filter((v) => v.provider === options.providerFilter)
        if (filtered.length === 0) {
            throw new Error(`No voices found for provider "${options.providerFilter}"`)
        }
    }

    return filtered
}

function collectNumbers(curriculum: Curriculum, options: GenerateOptions): number[] {
    const numbersSet = new Set<number>()
    curriculum.stages.forEach((stage, index) => {
        if (options.stageFilter !== undefined && index !== options.stageFilter) return
        stage.numbers.forEach((entry) => {
            const num = entry.value
            if (options.minNumber !== undefined && num < options.minNumber) return
            if (options.maxNumber !== undefined && num > options.maxNumber) return
            numbersSet.add(num)
        })
    })
    return [...numbersSet].sort((a, b) => a - b)
}

async function generateForVoice(
    voice: VoiceConfig,
    numbers: number[],
    options: GenerateOptions,
    languageId: LanguageId,
    elevenLabsClientOrNull: ElevenLabsClient | null,
): Promise<{ generated: number; skipped: number; failed: number }> {
    const language = getLanguage(languageId)

    let generated = 0,
        skipped = 0,
        failed = 0

    for (const num of numbers) {
        const format = options.format ?? 'mp3'
        const outputPath = getOutputPath(languageId, num, voice.id, format)
        const words = language.numberToWords(num)

        if (options.skipExisting && audioFileExists(outputPath)) {
            skipped++
            continue
        }

        process.stdout.write(`  ${num} (${words})... `)

        try {
            await generateSingleAudio(voice, words, outputPath, format, language, elevenLabsClientOrNull)
            console.log('✅')
            generated++
        } catch (error) {
            console.log(`❌ ${error instanceof Error ? error.message : error}`)
            failed++
        }
    }

    return { generated, skipped, failed }
}

async function generateSingleAudio(
    voice: VoiceConfig,
    words: string,
    outputPath: string,
    format: 'mp3' | 'opus' | 'wav',
    language: Language,
    elevenLabsClientOrNull: ElevenLabsClient | null,
): Promise<void> {
    if (voice.provider === 'elevenlabs') {
        if (!elevenLabsClientOrNull) throw new Error('ElevenLabs client not initialized')
        const formatToElevenLabsMap: Record<string, TextToSpeechConvertRequestOutputFormat> = {
            wav: TextToSpeechConvertRequestOutputFormat.Pcm32000, // pcm_44100 is paid
            mp3: TextToSpeechConvertRequestOutputFormat.Mp344100128,
            opus: TextToSpeechConvertRequestOutputFormat.Opus48000128,
        }
        await generateAudioElevenLabs(elevenLabsClientOrNull, {
            text: words,
            voiceId: voice.voiceId,
            languageCode: language.ttsLanguageCode.substring(0, 2),
            outputPath,
            format: formatToElevenLabsMap[format] || TextToSpeechConvertRequestOutputFormat.Mp344100128,
        })
    } else {
        const formatToGoogleMap: Record<string, 'ALAW' | 'MULAW' | 'MP3' | 'OGG_OPUS' | 'LINEAR16'> = {
            wav: 'LINEAR16',
            mp3: 'MP3',
            opus: 'OGG_OPUS',
        }
        await generateAudioGoogle({
            text: words,
            voiceName: voice.voiceId,
            languageCode: language.ttsLanguageCode,
            gender: voice.gender === 'male' ? 'MALE' : 'FEMALE',
            outputPath,
            format: formatToGoogleMap[format] || 'MP3',
        })
    }
}

export async function generateAudioFiles(options: GenerateOptions) {
    if (!options.languageId) {
        throw new Error('Please specify a language ID using --language')
    }
    const curriculum = loadCurriculum(options.languageId)

    console.log('🎙️  Audio Generator\n')

    const voices = filterVoices(curriculum.voices, options)
    console.log(`📢 Voices: ${voices.map((v) => `${v.name} (${v.provider})`).join(', ')}`)

    const numbers = collectNumbers(curriculum, options)
    console.log(`🔢 Numbers to generate: ${numbers.length}`)
    console.log(`📁 Output directory: ${path.join(projectRoot, `public/${options.languageId}`)}\n`)

    if (numbers.length === 0) {
        console.log('No numbers to generate. Check your filters.')
        return
    }

    const hasElevenLabsVoices = voices.some((v) => v.provider === 'elevenlabs')
    const elevenLabsClientOrNull = hasElevenLabsVoices ? createClient() : null

    let totalGenerated = 0,
        totalSkipped = 0,
        totalFailed = 0

    for (const voice of voices) {
        console.log(`\n🎤 Generating audio for voice: ${voice.name} (${voice.provider})`)
        const { generated, skipped, failed } = await generateForVoice(
            voice,
            numbers,
            options,
            options.languageId,
            elevenLabsClientOrNull,
        )
        totalGenerated += generated
        totalSkipped += skipped
        totalFailed += failed
    }

    console.log('\n📊 Summary:')
    console.log(`  ✅ Generated: ${totalGenerated}`)
    console.log(`  ⏭️  Skipped: ${totalSkipped}`)
    console.log(`  ❌ Failed: ${totalFailed}`)
}

main().catch((error: unknown) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
