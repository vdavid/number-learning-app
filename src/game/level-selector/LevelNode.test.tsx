import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { LevelNodePair } from './LevelNode'

describe('LevelNodePair', () => {
    const defaultProps = {
        stageName: 'Stage 1',
        stageIndex: 0,
        listenState: 'new' as const,
        speakState: 'new' as const,
        quietMode: false,
    }

    it('should render stage name', () => {
        render(<LevelNodePair {...defaultProps} />)

        expect(screen.getByText('Stage 1')).toBeInTheDocument()
    })

    it('should render listen mode icon (🎧)', () => {
        render(<LevelNodePair {...defaultProps} />)

        expect(screen.getByText('🎧')).toBeInTheDocument()
    })

    it('should render speak mode icon (🎤)', () => {
        render(<LevelNodePair {...defaultProps} />)

        expect(screen.getByText('🎤')).toBeInTheDocument()
    })

    describe('locked state', () => {
        it('should show lock icon for locked nodes', () => {
            render(<LevelNodePair {...defaultProps} listenState='locked' />)

            // Lock icon is an SVG
            const lockIcons = screen.getAllByRole('button')[0].querySelectorAll('svg')
            expect(lockIcons.length).toBeGreaterThan(0)
        })

        it('should disable click handler for locked nodes', () => {
            const onClick = vi.fn()
            render(<LevelNodePair {...defaultProps} listenState='locked' onListenClick={onClick} />)

            const listenButton = screen.getAllByRole('button')[0]
            fireEvent.click(listenButton)

            expect(onClick).not.toHaveBeenCalled()
        })

        it('should apply locked styling', () => {
            render(<LevelNodePair {...defaultProps} listenState='locked' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('cursor-not-allowed')
            expect(listenButton.className).toContain('opacity-50')
        })
    })

    describe('new state', () => {
        it('should apply pulse animation for new nodes', () => {
            render(<LevelNodePair {...defaultProps} listenState='new' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('animate-pulse-glow')
        })

        it('should apply glow effect for new nodes', () => {
            render(<LevelNodePair {...defaultProps} listenState='new' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('shadow-')
        })
    })

    describe('gold state', () => {
        it('should apply gold gradient styling', () => {
            render(<LevelNodePair {...defaultProps} listenState='gold' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('from-amber')
        })

        it('should apply gold border', () => {
            render(<LevelNodePair {...defaultProps} listenState='gold' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('border-[var(--node-gold)]')
        })
    })

    describe('faded state', () => {
        it('should show warning indicator dot', () => {
            const { container } = render(<LevelNodePair {...defaultProps} listenState='faded' />)

            const warningDot = container.querySelector('.bg-\\[var\\(--warning\\)\\]')
            expect(warningDot).toBeInTheDocument()
        })

        it('should apply faded border styling', () => {
            render(<LevelNodePair {...defaultProps} listenState='faded' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('border-[var(--node-faded)]')
        })
    })

    describe('rusty state', () => {
        it('should show error indicator dot', () => {
            const { container } = render(<LevelNodePair {...defaultProps} listenState='rusty' />)

            const errorDot = container.querySelector('.bg-\\[var\\(--error\\)\\]')
            expect(errorDot).toBeInTheDocument()
        })

        it('should apply rusty border styling', () => {
            render(<LevelNodePair {...defaultProps} listenState='rusty' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).toContain('border-[var(--node-rusty)]')
        })
    })

    describe('quiet mode', () => {
        it('should lock speak node in quiet mode', () => {
            render(<LevelNodePair {...defaultProps} quietMode={true} speakState='new' />)

            const speakButton = screen.getAllByRole('button')[1]
            expect(speakButton.className).toContain('cursor-not-allowed')
            expect(speakButton).toBeDisabled()
        })

        it('should not lock listen node in quiet mode', () => {
            render(<LevelNodePair {...defaultProps} quietMode={true} listenState='new' />)

            const listenButton = screen.getAllByRole('button')[0]
            expect(listenButton.className).not.toContain('cursor-not-allowed')
            expect(listenButton).not.toBeDisabled()
        })

        it('should disable speak click handler in quiet mode', () => {
            const onSpeakClick = vi.fn()
            render(<LevelNodePair {...defaultProps} quietMode={true} onSpeakClick={onSpeakClick} />)

            const speakButton = screen.getAllByRole('button')[1]
            fireEvent.click(speakButton)

            expect(onSpeakClick).not.toHaveBeenCalled()
        })
    })

    describe('click handlers', () => {
        it('should call onListenClick when listen node is clicked', () => {
            const onListenClick = vi.fn()
            render(<LevelNodePair {...defaultProps} onListenClick={onListenClick} />)

            const listenButton = screen.getAllByRole('button')[0]
            fireEvent.click(listenButton)

            expect(onListenClick).toHaveBeenCalledTimes(1)
        })

        it('should call onSpeakClick when speak node is clicked', () => {
            const onSpeakClick = vi.fn()
            render(<LevelNodePair {...defaultProps} onSpeakClick={onSpeakClick} />)

            const speakButton = screen.getAllByRole('button')[1]
            fireEvent.click(speakButton)

            expect(onSpeakClick).toHaveBeenCalledTimes(1)
        })
    })

    describe('different states for each mode', () => {
        it('should render different states for listen and speak', () => {
            render(<LevelNodePair {...defaultProps} listenState='gold' speakState='rusty' />)

            const buttons = screen.getAllByRole('button')
            expect(buttons[0].className).toContain('border-[var(--node-gold)]')
            expect(buttons[1].className).toContain('border-[var(--node-rusty)]')
        })
    })
})
