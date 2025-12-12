/**
 * ElevenLabs API client wrapper for audio generation.
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

export type AudioGenerationOptions = {
    /** Text to convert to speech */
    text: string
    /** ElevenLabs voice ID, looks like "IKne3meq5aSn9XLyUdCD". */
    voiceId: string
    outputPath: string
    /** E.g., "ko" for language enforcement */
    languageCode?: string
    /** Model ID (defaults to eleven_multilingual_v2) */
    modelId?: string
    // Defaults to mp3
    format?: 'mp3' | 'opus'
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create an ElevenLabs client from environment variable.
 */
export function createClient(): ElevenLabsClient {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
        throw new Error('ELEVENLABS_API_KEY environment variable is not set')
    }
    return new ElevenLabsClient({ apiKey })
}

/**
 * Generate audio for a single text and save to file.
 * Includes exponential backoff retry logic.
 */
export async function generateAudio(
    client: ElevenLabsClient,
    options: AudioGenerationOptions,
    maxRetries = 5,
): Promise<void> {
    const { text, voiceId, outputPath, modelId = 'eleven_multilingual_v2', format = 'mp3' } = options

    // Ensure output directory exists
    const dir = path.dirname(outputPath)
    fs.mkdirSync(dir, { recursive: true })

    let lastError: Error | null = null
    let delay = 0 // Start with no delay

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (delay > 0) {
            console.log(`  ⏳ Retrying in ${delay}ms...`)
            await sleep(delay)
        }

        try {
            const audioStream = await client.textToSpeech.convert(voiceId, {
                text,
                modelId,
                outputFormat: format === 'opus' ? 'opus_48000_128' : 'mp3_44100_128',
                languageCode: 'ko',
            })

            // Collect chunks from the readable stream
            const chunks: Buffer[] = []
            const reader = audioStream.getReader()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                chunks.push(Buffer.from(value))
            }

            // Write to file
            const buffer = Buffer.concat(chunks)
            fs.writeFileSync(outputPath, buffer)

            return // Success
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
            console.error(`  ❌ Attempt ${attempt + 1} failed: ${lastError.message}`)

            // Exponential backoff: 0 -> 1000 -> 2000 -> 4000 -> 8000
            delay = delay === 0 ? 1000 : delay * 2
        }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message}`)
}

/**
 * Check if an audio file already exists.
 */
export function audioFileExists(outputPath: string): boolean {
    return fs.existsSync(outputPath)
}
