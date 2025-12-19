/**
 * Google Cloud Text-to-Speech API client for audio generation.
 *
 * Uses the REST API with OAuth2 authentication via gcloud CLI.
 * Requires: gcloud auth login (for access token)
 */

import { exec } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

export type GoogleAudioGenerationOptions = {
    /** Text to convert to speech */
    text: string
    /** Google Cloud TTS voice name (e.g., "sv-SE-Chirp3-HD-Puck") */
    voiceName: string
    /** Language code (e.g., "sv-SE") */
    languageCode: string
    /** Gender for the voice */
    gender: 'MALE' | 'FEMALE'
    outputPath: string
    /** Audio format */
    format: 'ALAW' | 'MULAW' | 'MP3' | 'OGG_OPUS' | 'LINEAR16'
    /** Sample rate in Hertz (e.g., 24000) */
    sampleRateHertz?: number
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Get the current access token from gcloud CLI.
 */
async function getAccessToken(): Promise<string> {
    try {
        const { stdout } = await execAsync('gcloud auth print-access-token')
        return stdout.trim()
    } catch {
        throw new Error('Failed to get gcloud access token. Make sure you are logged in with: gcloud auth login')
    }
}

/**
 * Get the Google Cloud project number from environment.
 */
function getProjectNumber(): string {
    const projectNumber = process.env.GOOGLE_CLOUD_PROJECT_NUMBER
    if (!projectNumber) {
        throw new Error(
            'GOOGLE_CLOUD_PROJECT_NUMBER environment variable is not set. ' +
                'Find it in GCP Console → Project Settings → Project number',
        )
    }
    return projectNumber
}

/**
 * Generate audio using Google Cloud TTS and save to file.
 * Includes exponential backoff retry logic.
 */
export async function generateAudioGoogle(options: GoogleAudioGenerationOptions, maxRetries = 5): Promise<void> {
    const { text, voiceName, languageCode, gender, outputPath, format = 'mp3' } = options

    // Ensure output directory exists
    const dir = path.dirname(outputPath)
    fs.mkdirSync(dir, { recursive: true })

    const accessToken = await getAccessToken()
    const projectNumber = getProjectNumber()

    // Build the request body
    const requestBody = {
        input: { text },
        voice: {
            languageCode: languageCode.toLowerCase(),
            name: voiceName,
            ssmlGender: gender,
        },
        audioConfig: {
            audioEncoding: format,
        },
    }

    let lastError: Error | null = null
    let delay = 0

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        if (delay > 0) {
            console.log(`  ⏳ Retrying in ${delay}ms...`)
            await sleep(delay)
        }

        try {
            const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'x-goog-user-project': projectNumber,
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Google TTS API error (${response.status}): ${errorText}`)
            }

            const data = (await response.json()) as {
                audioContent: string
                audioConfig?: { sampleRateHertz: number }
            }

            // Decode base64 audio content and write to file
            let audioBuffer: Buffer = Buffer.from(data.audioContent, 'base64')

            if (format === 'LINEAR16') {
                const sampleRate = options.sampleRateHertz || data.audioConfig?.sampleRateHertz || 24000
                const { wrapPcmInWav } = await import('./wav-utils.ts')
                audioBuffer = wrapPcmInWav(audioBuffer, sampleRate)
            }

            fs.writeFileSync(outputPath, audioBuffer)

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
