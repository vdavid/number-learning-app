import type { AttemptResult } from '@srs/session-store.ts'
import { motion, AnimatePresence } from 'motion/react'

interface DigitDisplayProps {
    /** Current input value */
    value: string
    /** Expected number of digits */
    digitCount: number
    /** Result state for visual indication */
    result: AttemptResult
}

interface DigitSlot {
    key: string
    digit: string | null
    position: number
}

/**
 * Display for typed digits with placeholder underscores.
 * Shows visual feedback on correct/incorrect answers.
 */
export function DigitDisplay({ value, digitCount, result }: DigitDisplayProps) {
    // Create array of slots with stable keys
    const slots: DigitSlot[] = Array.from({ length: digitCount }, (_, i) => ({
        key: `slot-${i}`,
        digit: value[i] ?? null,
        position: i,
    }))

    return (
        <div
            className={`
                relative flex items-center justify-center gap-3 p-6 rounded-2xl
                transition-all duration-300
                ${result === 'correct' ? 'animate-flash-success' : ''}
                ${result === 'incorrect' ? 'animate-flash-error' : ''}
            `}
        >
            {slots.map((slot) => (
                <motion.div
                    key={slot.key}
                    className={`
                        w-14 h-20 flex items-center justify-center
                        rounded-xl border-2
                        font-mono text-4xl font-bold
                        transition-all duration-200
                        ${
                            slot.digit
                                ? 'border-[var(--accent-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)]'
                                : 'border-[var(--bg-hover)] bg-[var(--bg-deep)]'
                        }
                    `}
                    initial={slot.digit ? { scale: 1.1 } : false}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    <AnimatePresence mode='wait'>
                        {slot.digit ? (
                            <motion.span
                                key={`digit-${slot.position}-${slot.digit}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.1 }}
                            >
                                {slot.digit}
                            </motion.span>
                        ) : (
                            <motion.span
                                key={`placeholder-${slot.position}`}
                                className='w-8 h-1 bg-[var(--text-muted)] rounded'
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </div>
    )
}
