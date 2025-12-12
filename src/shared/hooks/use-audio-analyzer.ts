import { useEffect, useRef, useState } from 'react'

/**
 * Hook to analyze audio volume from the microphone.
 * Returns a normalized volume level between 0 and 1.
 */
export function useAudioAnalyzer(isListening: boolean) {
    const [volume, setVolume] = useState(0)
    const audioContextRef = useRef<AudioContext | null>(null)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const rafRef = useRef<number | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        if (!isListening) {
            cleanup()
            setVolume(0)
            return
        }

        const initAudio = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                streamRef.current = stream

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                audioContextRef.current = audioContext

                const analyser = audioContext.createAnalyser()
                analyser.fftSize = 256
                analyserRef.current = analyser

                const source = audioContext.createMediaStreamSource(stream)
                sourceRef.current = source
                source.connect(analyser)

                const bufferLength = analyser.frequencyBinCount
                const dataArray = new Uint8Array(bufferLength)

                const updateVolume = () => {
                    if (!analyserRef.current) return

                    analyserRef.current.getByteFrequencyData(dataArray)

                    // Calculate RMS (Root Mean Square)
                    let sum = 0
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i] * dataArray[i]
                    }
                    const rms = Math.sqrt(sum / bufferLength)

                    // Normalize to 0-1 (assuming max byte value is 255, but RMS is usually lower)
                    // Sensitivity adjustment: divided by 128 instead of 255 to make it more responsive
                    const normalizedVolume = Math.min(1, rms / 128)

                    setVolume(normalizedVolume)
                    rafRef.current = requestAnimationFrame(updateVolume)
                }

                updateVolume()
            } catch (error) {
                console.error('Error initializing audio analyzer:', error)
            }
        }

        initAudio()

        return cleanup
    }, [isListening])

    function cleanup() {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }

        if (analyserRef.current) {
            analyserRef.current = null
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = null
        }

        if (audioContextRef.current) {
            void audioContextRef.current.close()
            audioContextRef.current = null
        }
    }

    return volume
}
