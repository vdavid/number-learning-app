import { motion } from 'motion/react'

interface KeypadProps {
    onKeyPress: (key: string) => void
    onBackspace: () => void
    disabled?: boolean
}

interface KeypadKey {
    id: string
    value: string
    isEmpty: boolean
}

// Pre-generate keys with stable IDs
const KEYPAD_KEYS: KeypadKey[] = [
    { id: 'key-1', value: '1', isEmpty: false },
    { id: 'key-2', value: '2', isEmpty: false },
    { id: 'key-3', value: '3', isEmpty: false },
    { id: 'key-4', value: '4', isEmpty: false },
    { id: 'key-5', value: '5', isEmpty: false },
    { id: 'key-6', value: '6', isEmpty: false },
    { id: 'key-7', value: '7', isEmpty: false },
    { id: 'key-8', value: '8', isEmpty: false },
    { id: 'key-9', value: '9', isEmpty: false },
    { id: 'empty-bottom-left', value: '', isEmpty: true },
    { id: 'key-0', value: '0', isEmpty: false },
    { id: 'key-backspace', value: '⌫', isEmpty: false },
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
            {KEYPAD_KEYS.map((keyData) => {
                if (keyData.isEmpty) {
                    return <div key={keyData.id} className='aspect-square' />
                }

                const isBackspace = keyData.value === '⌫'

                return (
                    <motion.button
                        key={keyData.id}
                        type='button'
                        onClick={() => {
                            handleKey(keyData.value)
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
                        {keyData.value}
                    </motion.button>
                )
            })}
        </div>
    )
}
