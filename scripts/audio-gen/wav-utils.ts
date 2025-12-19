/**
 * Utility for creating a standard 44-byte WAV header for raw PCM data.
 */

interface WavHeaderOptions {
    sampleRate: number
    dataLength: number
    channels?: number // ElevenLabs/Google are typically 1 (Mono)
    bitDepth?: number // ElevenLabs/Google are typically 16
}

/**
 * Combines the header with the raw PCM data and returns the complete WAV buffer.
 */
export function wrapPcmInWav(rawPcmData: Buffer, sampleRate: number): Buffer {
    const header = createWavHeader({
        sampleRate,
        dataLength: rawPcmData.length,
    })

    return Buffer.concat([header, rawPcmData])
}

/**
 * Creates a standard 44-byte WAV header.
 */
function createWavHeader(options: WavHeaderOptions): Buffer {
    const { sampleRate, dataLength, channels = 1, bitDepth = 16 } = options

    const header = Buffer.alloc(44)

    // 1. RIFF chunk descriptor
    header.write('RIFF', 0)
    // File size - 8 bytes (total file size minus "RIFF" and this length field)
    header.writeUInt32LE(36 + dataLength, 4)
    header.write('WAVE', 8)

    // 2. fmt sub-chunk
    header.write('fmt ', 12)
    header.writeUInt32LE(16, 16) // Subchunk1Size (16 for PCM)
    header.writeUInt16LE(1, 20) // AudioFormat (1 for PCM)
    header.writeUInt16LE(channels, 22)
    header.writeUInt32LE(sampleRate, 24)
    // ByteRate = SampleRate * NumChannels * BitsPerSample / 8
    header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28)
    // BlockAlign = NumChannels * BitsPerSample / 8
    header.writeUInt16LE(channels * (bitDepth / 8), 32)
    header.writeUInt16LE(bitDepth, 34)

    // 3. data sub-chunk
    header.write('data', 36)
    header.writeUInt32LE(dataLength, 40)

    return header
}
