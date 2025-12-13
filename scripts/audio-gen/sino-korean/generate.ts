#!/usr/bin/env npx tsx
/**
 * Sino-Korean audio generator.
 *
 * Generates audio files for numbers in the curriculum using ElevenLabs.
 * Reads from the curriculum manifest and generates opus files for each number/voice combo.
 *
 * Usage:
 *   # Generate all audio for all voices
 *   npx tsx scripts/audio-gen/sino-korean/generate.ts
 *
 *   # Generate for specific voice only
 *   npx tsx scripts/audio-gen/sino-korean/generate.ts --voice charlie
 *
 *   # Generate for specific stage only (0-indexed)
 *   npx tsx scripts/audio-gen/sino-korean/generate.ts --stage 0
 *
 *   # Generate for specific number range
 *   npx tsx scripts/audio-gen/sino-korean/generate.ts --min 1 --max 10
 *
 *   # Skip existing files (default: true)
 *   npx tsx scripts/audio-gen/sino-korean/generate.ts --skip-existing
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import 'dotenv/config'

import type { CurriculumManifest, VoiceConfig } from '../../types.js'
import { audioFileExists, createClient, generateAudio } from '../lib/elevenlabs.js'

import { numberToSinoKorean } from './number-to-words.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../..')
const audioDirectory = path.join(projectRoot, 'public/audio/sino-korean')
const manifestFilePath = path.join(audioDirectory, 'manifest.json')

type GenerateOptions = {
    voiceFilter?: string
    stageFilter?: number
    minNumber?: number
    maxNumber?: number
    skipExisting: boolean
    format?: 'mp3' | 'opus'
}

function parseArgs(): GenerateOptions {
    const args = process.argv.slice(2)
    const options: GenerateOptions = {
        skipExisting: true,
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--voice' && args[i + 1]) {
            options.voiceFilter = args[++i]
        } else if (arg === '--stage' && args[i + 1]) {
            options.stageFilter = parseInt(args[++i], 10)
        } else if (arg === '--min' && args[i + 1]) {
            options.minNumber = parseInt(args[++i], 10)
        } else if (arg === '--max' && args[i + 1]) {
            options.maxNumber = parseInt(args[++i], 10)
        } else if (arg === '--no-skip-existing') {
            options.skipExisting = false
        } else if (arg === '--skip-existing') {
            options.skipExisting = true
        } else if (arg === '--format' && args[i + 1]) {
            options.format = args[++i] as 'mp3' | 'opus'
        } else {
            throw new Error(`Unknown argument: ${arg}`)
        }
    }

    return options
}

function loadManifest(): CurriculumManifest {
    if (!fs.existsSync(manifestFilePath)) {
        throw new Error(`Manifest not found at ${manifestFilePath}. Run the curriculum generator first.`)
    }
    const content = fs.readFileSync(manifestFilePath, 'utf-8')
    return JSON.parse(content) as CurriculumManifest
}

function getOutputPath(num: number, voiceId: string, format: 'mp3' | 'opus'): string {
    return path.join(audioDirectory, `${num}-${voiceId}.${format}`)
}

async function main() {
    const options = parseArgs()
    const manifest = loadManifest()

    console.log('🎙️  Sino-Korean Audio Generator\n')

    // Filter voices
    let voices: VoiceConfig[] = manifest.voices
    if (options.voiceFilter) {
        voices = voices.filter((v) => v.id === options.voiceFilter)
        if (voices.length === 0) {
            throw new Error(`Voice "${options.voiceFilter}" not found in manifest`)
        }
    }
    console.log(`📢 Voices: ${voices.map((v) => v.name).join(', ')}`)

    // Collect all unique numbers to generate
    const numbersSet = new Set<number>()
    manifest.stages.forEach((stage, idx) => {
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
    console.log(`📁 Output directory: ${audioDirectory}\n`)

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
            const outputPath = getOutputPath(num, voice.id, options.format ?? 'mp3')
            const word = numberToSinoKorean(num)

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
