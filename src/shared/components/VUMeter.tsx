import { motion } from 'motion/react'

interface VUMeterProps {
    level: number
}

/**
 * Visual VU Meter component.
 * Displays a pulsating circle based on the volume level.
 */
export function VUMeter({ level }: VUMeterProps) {
    // Amplify low levels for better visualization
    const amplifiedLevel = Math.min(1, level * 2)

    return (
        <div className="relative flex items-center justify-center w-24 h-24">
            {/* Outer glow ring */}
            <motion.div
                className="absolute inset-0 rounded-full bg-[var(--accent-primary)] opacity-20"
                animate={{
                    scale: 1 + amplifiedLevel * 1.5,
                    opacity: 0.2 + amplifiedLevel * 0.3,
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.5
                }}
            />

            {/* Inner pulsating circle */}
            <motion.div
                className="w-12 h-12 rounded-full bg-[var(--accent-primary)]"
                animate={{
                    scale: 0.8 + amplifiedLevel * 0.4,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                }}
            />

            {/* Icon or indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 text-white"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
            </div>
        </div>
    )
}
