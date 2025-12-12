import { motion, AnimatePresence } from 'motion/react'

import type { AttemptResult } from '../stores'

interface DigitDisplayProps {
    /** Current input value */
    value: string
    /** Expected number of digits */
    digitCount: number
    /** Result state for visual indication */
    result: AttemptResult
}

/**
 * Display for typed digits with placeholder underscores.
 * Shows visual feedback on correct/incorrect answers.
 */
export function DigitDisplay({ value, digitCount, result }: DigitDisplayProps) {
    // Create array of slots
    const slots = Array.from({ length: digitCount }, (_, i) => value[i] ?? null)

    return (
        <div
            className={`
                relative flex items-center justify-center gap-3 p-6 rounded-2xl
                transition-all duration-300
                ${result === 'correct' ? 'animate-flash-success' : ''}
                ${result === 'incorrect' ? 'animate-flash-error' : ''}
            `}
        >
            {slots.map((digit, index) => (
                <motion.div
                    key={index}
                    className={`
                        w-14 h-20 flex items-center justify-center
                        rounded-xl border-2
                        font-mono text-4xl font-bold
                        transition-all duration-200
                        ${
                            digit
                                ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                                : 'border-[var(--bg-hover)] bg-[var(--bg-deep)]'
                        }
                    `}
                    initial={digit ? { scale: 1.1 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <AnimatePresence mode='wait'>
                        {digit ? (
                            <motion.span
                                key={`digit-${index}-${digit}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.1 }}
                            >
                                {digit}
                            </motion.span>
                        ) : (
                            <motion.span
                                key={`placeholder-${index}`}
                                className='w-8 h-1 bg-[var(--text-muted)] rounded'
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    )
}
