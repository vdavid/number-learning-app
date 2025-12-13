import { getAllLanguages, getLanguage } from '@features/languages'
import { Button } from '@shared/components'
import { useProgressStore, useSettingsStore, useSessionStore } from '@shared/stores'
import { motion } from 'motion/react'
import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { LevelNodePair } from './LevelNode'

const MAX_NEW_CARDS_PER_SESSION = 10

export function LevelSelectorScreen() {
    const navigate = useNavigate()

    const { languageId, quietMode, toggleQuietMode, setLanguage } = useSettingsStore()
    const { initializeLanguage, getAllDueCards, getNewCards, getStageDecayState } = useProgressStore()
    const { startSession } = useSessionStore()

    const language = getLanguage(languageId)
    const stages = language.curriculum.stages
    const allLanguages = getAllLanguages()

    // Initialize language on mount
    useEffect(() => {
        initializeLanguage(languageId)
    }, [languageId, initializeLanguage])

    // Handle "Learn" button - start a session with due cards + new cards
    const handleLearn = useCallback(() => {
        const dueCards = getAllDueCards(languageId, quietMode)
        const newCards = getNewCards(languageId, quietMode, MAX_NEW_CARDS_PER_SESSION)

        const sessionCards = [...dueCards, ...newCards]

        if (sessionCards.length === 0) {
            // Nothing to review - maybe show a message?
            return
        }

        startSession(sessionCards)
        void navigate('/session')
    }, [languageId, quietMode, getAllDueCards, getNewCards, startSession, navigate])

    // Get counts for the learn button
    const dueCards = getAllDueCards(languageId, quietMode)
    const newCards = getNewCards(languageId, quietMode, MAX_NEW_CARDS_PER_SESSION)
    const totalCards = dueCards.length + newCards.length

    return (
        <div className='flex flex-col min-h-full bg-[var(--bg-base)] bg-grid-pattern'>
            {/* Header */}
            <header className='sticky top-0 z-10 bg-[var(--bg-base)]/80 backdrop-blur-sm border-b border-[var(--bg-surface)] p-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <span className='text-2xl'>{language.flag}</span>
                        <div>
                            {import.meta.env.DEV ? (
                                <select
                                    value={languageId}
                                    onChange={(e) => {
                                        setLanguage(e.target.value)
                                    }}
                                    className='text-lg font-semibold text-[var(--text-primary)] bg-transparent border-none cursor-pointer focus:outline-none'
                                >
                                    {allLanguages.map(({ id, language: lang }) => (
                                        <option key={id} value={id}>
                                            {lang.flag} {lang.name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <h1 className='text-lg font-semibold text-[var(--text-primary)]'>{language.name}</h1>
                            )}
                            <p className='text-xs text-[var(--text-muted)]'>Number trainer</p>
                        </div>
                    </div>

                    {/* Settings placeholder */}
                    <button
                        type='button'
                        className='p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors'
                        aria-label='Settings'
                    >
                        <svg
                            className='w-6 h-6 text-[var(--text-secondary)]'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                            />
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Level path */}
            <main className='flex-1 overflow-y-auto p-6'>
                <div className='flex flex-col items-center gap-8'>
                    {/* Path visualization */}
                    <div className='relative'>
                        {/* Connecting line */}
                        <div className='absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--bg-surface)] -translate-x-1/2' />

                        {/* Stage nodes */}
                        <div className='relative flex flex-col items-center gap-8'>
                            {stages.map((stage, index) => (
                                <LevelNodePair
                                    key={stage.name}
                                    stageName={stage.name}
                                    stageIndex={index}
                                    listenState={getStageDecayState(languageId, index, 'listen')}
                                    speakState={getStageDecayState(languageId, index, 'speak')}
                                    quietMode={quietMode}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom bar */}
            <footer className='sticky bottom-0 bg-[var(--bg-base)]/95 backdrop-blur-sm border-t border-[var(--bg-surface)] p-4'>
                {/* Quiet mode toggle */}
                <div className='flex items-center justify-center gap-3 mb-4'>
                    <button
                        type='button'
                        onClick={toggleQuietMode}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-full
                            transition-all duration-200
                            ${
                                quietMode
                                    ? 'bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]'
                                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                            }
                        `}
                    >
                        <span>{quietMode ? '🤫' : '🔊'}</span>
                        <span className='text-sm font-medium'>{quietMode ? 'Quiet mode on' : 'Quiet mode off'}</span>
                    </button>
                </div>

                {/* Learn button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                        variant='primary'
                        size='lg'
                        onClick={handleLearn}
                        disabled={totalCards === 0}
                        className='w-full'
                    >
                        {totalCards === 0 ? (
                            'All caught up! 🎉'
                        ) : (
                            <>
                                Start learning
                                <span className='ml-2 px-2 py-0.5 bg-black/20 rounded-full text-sm'>
                                    {dueCards.length > 0 && `${dueCards.length} due`}
                                    {dueCards.length > 0 && newCards.length > 0 && ' + '}
                                    {newCards.length > 0 && `${newCards.length} new`}
                                </span>
                            </>
                        )}
                    </Button>
                </motion.div>
            </footer>
        </div>
    )
}
