import { motion } from 'motion/react'

interface AnswerDisplayProps {
    number: number
    nonLatinScript?: string
    romanizedForm?: string
    helpText?: string
    userAnsweredCorrectly?: boolean
}

/**
 * Display for the correct answer in listen mode.
 * Shows the number, optional non-Latin script, romanization, and optionally the help text.
 */
export function AnswerDisplay({
    number,
    nonLatinScript,
    romanizedForm,
    helpText,
    userAnsweredCorrectly = false,
}: AnswerDisplayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex flex-col items-center gap-3'
        >
            <div className='text-center'>
                {!userAnsweredCorrectly && <p className='text-[var(--text-muted)] text-sm mb-2'>Correct answer</p>}
                <div className='flex flex-col items-center gap-2'>
                    {/* Number (large) */}
                    {!userAnsweredCorrectly && (
                        <p className='font-mono text-4xl font-bold text-[var(--error)]'>{number}</p>
                    )}

                    {/* Non-lation script and romanization */}
                    {nonLatinScript && (
                        <div className='flex items-center justify-center gap-4'>
                            <p className='text-2xl font-medium'>{nonLatinScript}</p>
                            {!!romanizedForm && (
                                <p className='text-lg text-[var(--text-secondary)]'>({romanizedForm})</p>
                            )}
                        </div>
                    )}

                    {/* Help text on incorrect */}
                    {!userAnsweredCorrectly && helpText && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className='mt-3 text-sm text-[var(--text-secondary)] max-w-xs leading-relaxed'
                        >
                            {helpText}
                        </motion.p>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
