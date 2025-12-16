import type { DecayState } from '@srs/types.ts'
import { motion } from 'motion/react'

interface LevelNodeProps {
    mode: 'listen' | 'speak'
    state: DecayState
    onClick?: () => void
    index: number
}

const stateStyles: Record<DecayState, { bg: string; border: string; text: string; glow?: string }> = {
    locked: {
        bg: 'bg-[var(--bg-surface)]',
        border: 'border-[var(--node-locked)]',
        text: 'text-[var(--text-disabled)]',
    },
    new: {
        bg: 'bg-[var(--bg-elevated)]',
        border: 'border-[var(--node-new)]',
        text: 'text-[var(--text-primary)]',
        glow: 'shadow-[0_0_20px_rgba(248,250,252,0.2)]',
    },
    gold: {
        bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20',
        border: 'border-[var(--node-gold)]',
        text: 'text-[var(--node-gold)]',
        glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
    },
    faded: {
        bg: 'bg-[var(--bg-surface)]',
        border: 'border-[var(--node-faded)]',
        text: 'text-[var(--node-faded)]',
    },
    rusty: {
        bg: 'bg-[var(--bg-surface)]',
        border: 'border-[var(--node-rusty)]',
        text: 'text-[var(--node-rusty)]',
    },
}

/**
 * A single node in the level selector path.
 * Shows decay state through visual styling.
 */
function LevelNode({ mode, state, onClick, index }: LevelNodeProps) {
    const styles = stateStyles[state]
    const isLocked = state === 'locked'
    const isNew = state === 'new'

    return (
        <motion.button
            type='button'
            onClick={isLocked ? undefined : onClick}
            disabled={isLocked}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={isLocked ? {} : { scale: 1.05 }}
            whileTap={isLocked ? {} : { scale: 0.98 }}
            className={`
                relative flex flex-col items-center justify-center
                w-20 h-20 rounded-2xl
                border-2 ${styles.border} ${styles.bg}
                ${styles.glow ?? ''}
                ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                ${isNew ? 'animate-pulse-glow' : ''}
                transition-all duration-200
            `}
        >
            {/* Mode icon */}
            <div className={`text-2xl ${styles.text}`}>{mode === 'listen' ? '🎧' : '🎤'}</div>

            {/* Stage indicator dot */}
            {state === 'rusty' && <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--error)]' />}
            {state === 'faded' && <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--warning)]' />}

            {/* Lock icon for locked nodes */}
            {isLocked && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl'>
                    <svg className='w-6 h-6 text-[var(--text-disabled)]' fill='currentColor' viewBox='0 0 20 20'>
                        <path
                            fillRule='evenodd'
                            d='M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z'
                            clipRule='evenodd'
                        />
                    </svg>
                </div>
            )}
        </motion.button>
    )
}

interface LevelNodePairProps {
    stageName: string
    stageIndex: number
    listenState: DecayState
    speakState: DecayState
    onListenClick?: () => void
    onSpeakClick?: () => void
    quietMode: boolean
}

/**
 * A pair of nodes (Listen + Speak) for a single stage.
 */
export function LevelNodePair({
    stageName,
    stageIndex,
    listenState,
    speakState,
    onListenClick,
    onSpeakClick,
    quietMode,
}: LevelNodePairProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stageIndex * 0.1 }}
            className='flex flex-col items-center gap-3'
        >
            {/* Stage name */}
            <p className='text-xs text-[var(--text-muted)] font-medium text-center max-w-[160px]'>{stageName}</p>

            {/* Node pair */}
            <div className='flex items-center gap-4'>
                <LevelNode mode='listen' state={listenState} onClick={onListenClick} index={stageIndex * 2} />
                <LevelNode
                    mode='speak'
                    state={quietMode ? 'locked' : speakState}
                    onClick={quietMode ? undefined : onSpeakClick}
                    index={stageIndex * 2 + 1}
                />
            </div>
        </motion.div>
    )
}
