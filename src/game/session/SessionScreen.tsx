import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ListenMode } from './listen/ListenMode.tsx'
import { ProgressBar } from './ProgressBar.tsx'
import { SpeakMode } from './speak/SpeakMode.tsx'

import { useSessionStore } from '@/srs/session-store.ts'

/**
 * Main session screen - the game loop.
 * Switches between Listen and Speak modes based on current card.
 */
export function SessionScreen() {
    const navigate = useNavigate()
    const { isActive, getCurrentCard, getProgress, getRemainingCount, endSession } = useSessionStore()

    const card = getCurrentCard()
    const progress = getProgress()
    const remaining = getRemainingCount()

    const handleExit = useCallback(() => {
        endSession()
        void navigate('/')
    }, [endSession, navigate])

    // Redirect if no active session
    useEffect(() => {
        if (!isActive || !card) {
            void navigate('/')
        }
    }, [isActive, card, navigate])

    if (!isActive || !card) {
        return null
    }

    return (
        <div className='flex flex-col h-full bg-[var(--bg-base)]'>
            {/* Header */}
            <header className='flex items-center justify-between p-4 border-b border-[var(--bg-surface)]'>
                <button
                    type='button'
                    onClick={handleExit}
                    className='p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors'
                    aria-label='Exit session'
                >
                    <svg
                        className='w-6 h-6 text-[var(--text-secondary)]'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                    </svg>
                </button>

                <div className='text-center'>
                    <p className='text-sm text-[var(--text-muted)]'>
                        {remaining} card{remaining !== 1 ? 's' : ''} remaining
                    </p>
                </div>

                {/* Mode indicator */}
                <div
                    className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${
                            card.mode === 'listen'
                                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]'
                                : 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                        }
                    `}
                >
                    {card.mode === 'listen' ? '🎧 Listen' : '🎤 Speak'}
                </div>
            </header>

            {/* Progress bar */}
            <ProgressBar progress={progress} className='w-full' />

            {/* Main content */}
            <main className='flex-1 overflow-hidden'>{card.mode === 'listen' ? <ListenMode /> : <SpeakMode />}</main>
        </div>
    )
}
