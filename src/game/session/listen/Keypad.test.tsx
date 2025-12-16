import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Keypad } from './Keypad.tsx'

describe('Keypad', () => {
    it('should render all number keys 0-9', () => {
        render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} />)

        for (let i = 0; i <= 9; i++) {
            expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
        }
    })

    it('should render backspace key', () => {
        render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} />)

        expect(screen.getByRole('button', { name: '⌫' })).toBeInTheDocument()
    })

    it('should call onKeyPress when a number key is clicked', () => {
        const onKeyPress = vi.fn()
        render(<Keypad onKeyPress={onKeyPress} onBackspace={vi.fn()} />)

        fireEvent.click(screen.getByRole('button', { name: '5' }))

        expect(onKeyPress).toHaveBeenCalledTimes(1)
        expect(onKeyPress).toHaveBeenCalledWith('5')
    })

    it('should call onBackspace when backspace key is clicked', () => {
        const onBackspace = vi.fn()
        render(<Keypad onKeyPress={vi.fn()} onBackspace={onBackspace} />)

        fireEvent.click(screen.getByRole('button', { name: '⌫' }))

        expect(onBackspace).toHaveBeenCalledTimes(1)
    })

    it('should not call handlers when disabled', () => {
        const onKeyPress = vi.fn()
        const onBackspace = vi.fn()
        render(<Keypad onKeyPress={onKeyPress} onBackspace={onBackspace} disabled={true} />)

        fireEvent.click(screen.getByRole('button', { name: '5' }))
        fireEvent.click(screen.getByRole('button', { name: '⌫' }))

        expect(onKeyPress).not.toHaveBeenCalled()
        expect(onBackspace).not.toHaveBeenCalled()
    })

    it('should disable all buttons when disabled prop is true', () => {
        render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} disabled={true} />)

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).toBeDisabled()
        })
    })

    it('should enable all buttons by default', () => {
        render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} />)

        const buttons = screen.getAllByRole('button')
        buttons.forEach((button) => {
            expect(button).not.toBeDisabled()
        })
    })

    it('should call onKeyPress with correct key for each number', () => {
        const onKeyPress = vi.fn()
        render(<Keypad onKeyPress={onKeyPress} onBackspace={vi.fn()} />)

        for (let i = 0; i <= 9; i++) {
            fireEvent.click(screen.getByRole('button', { name: String(i) }))
        }

        expect(onKeyPress).toHaveBeenCalledTimes(10)
        for (let i = 0; i <= 9; i++) {
            expect(onKeyPress).toHaveBeenCalledWith(String(i))
        }
    })

    it('should have 12 grid items (10 numbers + 1 empty + 1 backspace)', () => {
        const { container } = render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} />)

        // 11 buttons (0-9 + backspace) + 1 empty div
        const gridItems = container.querySelector('.grid')?.children
        expect(gridItems?.length).toBe(12)
    })

    it('should apply special styling to backspace button', () => {
        render(<Keypad onKeyPress={vi.fn()} onBackspace={vi.fn()} />)

        const backspaceButton = screen.getByRole('button', { name: '⌫' })
        expect(backspaceButton.className).toContain('text-[var(--text-secondary)]')
    })
})
