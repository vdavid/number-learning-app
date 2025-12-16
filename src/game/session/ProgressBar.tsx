import { motion } from 'motion/react'

interface ProgressBarProps {
    progress: number // 0-100
    className?: string
}

/**
 * Animated progress bar for session progress.
 */
export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
    return (
        <div className={`h-1 bg-[var(--bg-surface)] rounded-full overflow-hidden ${className}`}>
            <motion.div
                className='h-full bg-[var(--accent-primary)]'
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            />
        </div>
    )
}
