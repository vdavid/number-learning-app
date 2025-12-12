import { motion } from 'motion/react'

interface KeypadProps {
    onKeyPress: (key: string) => void
    onBackspace: () => void
    disabled?: boolean
}

const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', '⌫'],
]

/**
 * Custom numeric keypad for listen mode.
 * Large touch targets, satisfying feedback.
 */
export function Keypad({ onKeyPress, onBackspace, disabled }: KeypadProps) {
    const handleKey = (key: string) => {
        if (disabled) return

        if (key === '⌫') {
            onBackspace()
        } else if (key) {
            onKeyPress(key)
        }
    }

    return (
        <div className='grid grid-cols-3 gap-3 w-full max-w-xs mx-auto'>
            {KEYS.flat().map((key, index) => {
                if (!key) {
                    return <div key={`empty-${index}`} className='aspect-square' />
                }

                const isBackspace = key === '⌫'

                return (
                    <motion.button
                        key={key}
                        type='button'
                        onClick={() => {
                            handleKey(key)
                        }}
                        disabled={disabled}
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        className={`
                            aspect-square rounded-2xl
                            font-mono text-3xl font-semibold
                            transition-colors duration-150
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${
                                isBackspace
                                    ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] active:bg-[var(--accent-primary)] active:text-[var(--bg-deep)]'
                            }
                            border border-[var(--bg-hover)]
                            shadow-lg shadow-black/20
                        `}
                    >
                        {key}
                    </motion.button>
                )
            })}
        </div>
    )
}
