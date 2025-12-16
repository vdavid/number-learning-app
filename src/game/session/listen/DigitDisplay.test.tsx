import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DigitDisplay } from './DigitDisplay.tsx'

describe('DigitDisplay', () => {
    it('should render the correct number of digit slots', () => {
        const { container } = render(<DigitDisplay value='' digitCount={4} result={null} />)

        // The container should have 4 child divs for 4 digits (w-14 class)
        expect(container.querySelectorAll('[class*="w-14"]')).toHaveLength(4)
    })

    it('should display entered digits', () => {
        render(<DigitDisplay value='12' digitCount={4} result={null} />)

        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should show placeholder for empty slots', () => {
        const { container } = render(<DigitDisplay value='1' digitCount={3} result={null} />)

        // One digit shown
        expect(screen.getByText('1')).toBeInTheDocument()
        // Two placeholder bars (empty slots)
        const placeholders = container.querySelectorAll('[class*="bg-"][class*="h-1"]')
        expect(placeholders).toHaveLength(2)
    })

    it('should apply correct styling when result is "correct"', () => {
        const { container } = render(<DigitDisplay value='42' digitCount={2} result='correct' />)

        const displayContainer = container.firstChild as HTMLElement
        expect(displayContainer.className).toContain('animate-flash-success')
    })

    it('should apply incorrect styling when result is "incorrect"', () => {
        const { container } = render(<DigitDisplay value='42' digitCount={2} result='incorrect' />)

        const displayContainer = container.firstChild as HTMLElement
        expect(displayContainer.className).toContain('animate-flash-error')
    })

    it('should not apply result styling when result is null', () => {
        const { container } = render(<DigitDisplay value='42' digitCount={2} result={null} />)

        const displayContainer = container.firstChild as HTMLElement
        expect(displayContainer.className).not.toContain('animate-flash-success')
        expect(displayContainer.className).not.toContain('animate-flash-error')
    })

    it('should apply filled slot styling when digit is present', () => {
        const { container } = render(<DigitDisplay value='5' digitCount={2} result={null} />)

        const slots = container.querySelectorAll('[class*="w-14"]')
        const filledSlot = slots[0]
        const emptySlot = slots[1]

        expect(filledSlot.className).toContain('border-[var(--accent-primary)]')
        expect(emptySlot.className).toContain('border-[var(--bg-hover)]')
    })

    it('should handle full input correctly', () => {
        render(<DigitDisplay value='1234' digitCount={4} result={null} />)

        expect(screen.getByText('1')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should display single digit numbers', () => {
        render(<DigitDisplay value='7' digitCount={1} result={null} />)

        expect(screen.getByText('7')).toBeInTheDocument()
    })
})
