import { motion } from 'motion/react'

interface MicButtonProps {
    isListening: boolean
    onClick: () => void
    disabled?: boolean
}

/**
 * Microphone button for speak mode.
 * Shows pulsing animation when listening.
 */
export function MicButton({ isListening, onClick, disabled }: MicButtonProps) {
    return (
        <div className='relative flex items-center justify-center'>
            {/* Pulsing background when listening */}
            {isListening && (
                <motion.div
                    className='absolute w-32 h-32 rounded-full bg-[var(--accent-primary)]'
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.1, 0.3],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
            )}

            <motion.button
                type='button'
                onClick={onClick}
                disabled={disabled}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className={`
                    relative z-10 w-24 h-24 rounded-full
                    flex items-center justify-center
                    transition-all duration-300
                    disabled:opacity-40 disabled:cursor-not-allowed
                    ${
                        isListening
                            ? 'bg-[var(--accent-primary)] text-[var(--bg-deep)] shadow-[var(--shadow-glow)]'
                            : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    }
                    border-2 border-[var(--bg-hover)]
                `}
            >
                <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z'
                    />
                </svg>
            </motion.button>
        </div>
    )
}
