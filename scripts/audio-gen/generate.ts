#!/usr/bin/env npx tsx
/**
 * Multi-language audio generator.
 *
 * Generates audio files for numbers in the curriculum using ElevenLabs.
 * Reads from the curriculum JSON and generates opus files for each number/voice combo.
 *
 * Usage:
 *   # Generate all audio for all voices for sino-korean
 *   npx tsx scripts/audio-gen/generate.ts --language sino-korean --voice all
 *
 *   # Generate for specific voice only
 *   npx tsx scripts/audio-gen/generate.ts --language sino-korean --voice charlie
 *
 *   # Generate for specific stage only (0-indexed)
 *   npx tsx scripts/audio-gen/generate.ts --language sino-korean --voice charlie --stage 0
 *
 *   # Generate for a specific number range
 *   npx tsx scripts/audio-gen/generate.ts --language sino-korean --voice charlie --min 1 --max 10
 *
 *   # To overwrite existing files
 *   npx tsx scripts/audio-gen/generate.ts --language sino-korean --voice all --overwrite
 */

import 'dotenv/config'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { audioFileExists, createClient, generateAudio } from '@scripts/audio-gen/elevenlabs.js'

import { loadCurriculum } from '../../src/features/languages/curriculum.js'
import { getAllLanguageIds, getLanguage } from '../../src/features/languages/index.js'
import { VoiceConfig } from '../../src/shared/types/index.js'

type GenerateOptions = {
    languageId: string
    voiceFilter: string // A voice name, e.g., "charlie" or "matilda", OR "all" to generate for all voices.
    stageFilter?: number
    minNumber?: number
    maxNumber?: number
    skipExisting: boolean
    format?: 'mp3' | 'opus'
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../..')

async function main() {
    const options = parseArgs()

    await generateAudioFiles(options)
}

function parseArgs(): GenerateOptions {
    const args = process.argv.slice(2)
    const options: GenerateOptions = {
        skipExisting: true,
        languageId: '',
        voiceFilter: 'all',
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--language' && args[i + 1]) {
            options.languageId = args[++i]
        } else if (arg === '--voice' && args[i + 1]) {
            options.voiceFilter = args[++i]
        } else if (arg === '--stage' && args[i + 1]) {
            options.stageFilter = parseInt(args[++i], 10)
        } else if (arg === '--min' && args[i + 1]) {
            options.minNumber = parseInt(args[++i], 10)
        } else if (arg === '--max' && args[i + 1]) {
            options.maxNumber = parseInt(args[++i], 10)
        } else if (arg === '--overwrite') {
            options.skipExisting = false
        } else if (arg === '--format' && args[i + 1]) {
            options.format = args[++i] as 'mp3' | 'opus'
        } else {
            throw new Error(`Unknown argument: ${arg}`)
        }
    }

    if (!options.languageId) {
        throw new Error(
            `Please use the --language argument. The possible languages are: ${getAllLanguageIds().join(',')}`,
        )
    }

    if (!options.voiceFilter) {
        throw new Error('Please use the --voice argument. Use "all" to generate for all voices.')
    }

    if (!['mp3', 'opus'].includes(options.format ?? 'mp3')) {
        throw new Error(`Invalid format: ${options.format}. Must be either "mp3" or "opus".`)
    }

    return options
}

function getOutputPath(languageId: string, num: number, voiceId: string, format: 'mp3' | 'opus'): string {
    const outputDirectory = path.join(projectRoot, `public/${languageId}`)
    return path.join(outputDirectory, `${num}-${voiceId}.${format}`)
}

export async function generateAudioFiles(options: GenerateOptions) {
    const curriculum = loadCurriculum(options.languageId)

    console.log('🎙️  Sino-Korean Audio Generator\n')

    // Filter voices
    let voices: VoiceConfig[] = curriculum.voices
    if (options.voiceFilter) {
        voices = voices.filter((v) => v.id === options.voiceFilter)
        if (voices.length === 0) {
            throw new Error(`Voice "${options.voiceFilter}" not found in curriculum file`)
        }
    }
    console.log(`📢 Voices: ${voices.map((v) => v.name).join(', ')}`)

    // Collect all unique numbers to generate
    const numbersSet = new Set<number>()
    curriculum.stages.forEach((stage, idx) => {
        if (options.stageFilter !== undefined && idx !== options.stageFilter) {
            return
        }
        stage.numbers.forEach((entry) => {
            const num = entry.value
            if (options.minNumber !== undefined && num < options.minNumber) return
            if (options.maxNumber !== undefined && num > options.maxNumber) return
            numbersSet.add(num)
        })
    })

    const numbers = [...numbersSet].sort((a, b) => a - b)
    console.log(`🔢 Numbers to generate: ${numbers.length}`)
    console.log(`📁 Output directory: ${path.join(projectRoot, `public/${options.languageId}`)}\n`)

    if (numbers.length === 0) {
        console.log('No numbers to generate. Check your filters.')
        return
    }

    // Create client
    const client = createClient()

    // Generate audio for each number and voice
    let generated = 0
    let skipped = 0
    let failed = 0

    for (const voice of voices) {
        console.log(`\n🎤 Generating audio for voice: ${voice.name}`)

        for (const num of numbers) {
            const outputPath = getOutputPath(options.languageId, num, voice.id, options.format ?? 'mp3')
            const word = getLanguage(options.languageId).numberToWords(num)

            // Skip if exists and option is set
            if (options.skipExisting && audioFileExists(outputPath)) {
                skipped++
                continue
            }

            process.stdout.write(`  ${num} (${word})... `)

            try {
                await generateAudio(client, {
                    text: word,
                    voiceId: voice.elevenLabsVoiceId,
                    outputPath,
                    format: options.format,
                })
                console.log('✅')
                generated++
            } catch (error) {
                console.log(`❌ ${error instanceof Error ? error.message : error}`)
                failed++
            }
        }
    }

    // Summary
    console.log('\n📊 Summary:')
    console.log(`  ✅ Generated: ${generated}`)
    console.log(`  ⏭️  Skipped: ${skipped}`)
    console.log(`  ❌ Failed: ${failed}`)
}

main().catch((error: unknown) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
