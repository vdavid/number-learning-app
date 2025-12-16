import { describe, expect, it } from 'vitest'

import { numberToSwedish, parseSwedish } from './normalizer.ts'

describe('Swedish normalizer', () => {
    describe('numberToSwedish', () => {
        it('should convert zero', () => {
            expect(numberToSwedish(0)).toBe('noll')
        })

        it('should convert single digits', () => {
            expect(numberToSwedish(1)).toBe('ett')
            expect(numberToSwedish(2)).toBe('två')
            expect(numberToSwedish(5)).toBe('fem')
            expect(numberToSwedish(7)).toBe('sju')
            expect(numberToSwedish(9)).toBe('nio')
        })

        it('should convert teens', () => {
            expect(numberToSwedish(10)).toBe('tio')
            expect(numberToSwedish(11)).toBe('elva')
            expect(numberToSwedish(12)).toBe('tolv')
            expect(numberToSwedish(13)).toBe('tretton')
            expect(numberToSwedish(15)).toBe('femton')
            expect(numberToSwedish(18)).toBe('arton')
            expect(numberToSwedish(19)).toBe('nitton')
        })

        it('should convert two-digit numbers', () => {
            expect(numberToSwedish(20)).toBe('tjugo')
            expect(numberToSwedish(21)).toBe('tjugoett')
            expect(numberToSwedish(25)).toBe('tjugofem')
            expect(numberToSwedish(30)).toBe('trettio')
            expect(numberToSwedish(54)).toBe('femtiofyra')
            expect(numberToSwedish(77)).toBe('sjuttiosju')
            expect(numberToSwedish(99)).toBe('nittionio')
        })

        it('should convert hundreds', () => {
            expect(numberToSwedish(100)).toBe('hundra')
            expect(numberToSwedish(200)).toBe('tvåhundra')
            expect(numberToSwedish(123)).toBe('hundratjugotre')
            expect(numberToSwedish(456)).toBe('fyrahundrafemtiosex')
            expect(numberToSwedish(999)).toBe('niohundranittionio')
        })

        it('should convert thousands', () => {
            expect(numberToSwedish(1000)).toBe('tusen')
            expect(numberToSwedish(2000)).toBe('tvåtusen')
            expect(numberToSwedish(1234)).toBe('tusentvåhundratrettiofyra')
            expect(numberToSwedish(9999)).toBe('niotusenniohundranittionio')
        })

        it('should convert ten thousands', () => {
            expect(numberToSwedish(10000)).toBe('tiotusen')
            expect(numberToSwedish(20000)).toBe('tjugotusen')
            expect(numberToSwedish(12345)).toBe('tolvtusentrehundrafyrtiofem')
            expect(numberToSwedish(54321)).toBe('femtiofyratusentrehundratjugoett')
        })

        it('should convert hundred thousands', () => {
            expect(numberToSwedish(100000)).toBe('hundratusen')
            expect(numberToSwedish(500000)).toBe('femhundratusen')
        })

        it('should convert millions', () => {
            expect(numberToSwedish(1000000)).toBe('en miljon')
            expect(numberToSwedish(2000000)).toBe('två miljoner')
            expect(numberToSwedish(1500000)).toBe('en miljon femhundratusen')
        })

        it('should convert billions', () => {
            expect(numberToSwedish(1_000_000_000)).toBe('en miljard')
            expect(numberToSwedish(2_000_000_000)).toBe('två miljarder')
            expect(numberToSwedish(1_500_000_000)).toBe('en miljard femhundra miljoner')
        })

        it('should convert trillions', () => {
            expect(numberToSwedish(1_000_000_000_000)).toBe('en biljon')
            expect(numberToSwedish(2_000_000_000_000)).toBe('två biljoner')
        })

        it('should handle negative numbers', () => {
            expect(numberToSwedish(-5)).toBe('minus fem')
            expect(numberToSwedish(-42)).toBe('minus fyrtiotvå')
        })
    })

    describe('parseSwedish', () => {
        it('should parse pure digits', () => {
            expect(parseSwedish('54')).toBe(54)
            expect(parseSwedish('123')).toBe(123)
            expect(parseSwedish('10000')).toBe(10000)
        })

        it('should parse zero', () => {
            expect(parseSwedish('noll')).toBe(0)
            expect(parseSwedish('0')).toBe(0)
        })

        it('should parse single digits', () => {
            expect(parseSwedish('ett')).toBe(1)
            expect(parseSwedish('fem')).toBe(5)
            expect(parseSwedish('nio')).toBe(9)
        })

        it('should parse teens', () => {
            expect(parseSwedish('tio')).toBe(10)
            expect(parseSwedish('elva')).toBe(11)
            expect(parseSwedish('tolv')).toBe(12)
            expect(parseSwedish('tretton')).toBe(13)
            expect(parseSwedish('arton')).toBe(18)
        })

        it('should parse tens', () => {
            expect(parseSwedish('tjugo')).toBe(20)
            expect(parseSwedish('tjugoett')).toBe(21)
            expect(parseSwedish('femtiofyra')).toBe(54)
            expect(parseSwedish('nittionio')).toBe(99)
        })

        it('should parse hundreds', () => {
            expect(parseSwedish('hundra')).toBe(100)
            expect(parseSwedish('tvåhundra')).toBe(200)
            expect(parseSwedish('hundratjugotre')).toBe(123)
        })

        it('should parse thousands', () => {
            expect(parseSwedish('tusen')).toBe(1000)
            expect(parseSwedish('tvåtusen')).toBe(2000)
            expect(parseSwedish('tusentvåhundratrettiofyra')).toBe(1234)
        })

        it('should parse ten thousands', () => {
            expect(parseSwedish('tiotusen')).toBe(10000)
            expect(parseSwedish('tjugotusen')).toBe(20000)
        })

        it('should parse millions', () => {
            expect(parseSwedish('en miljon')).toBe(1000000)
            expect(parseSwedish('två miljoner')).toBe(2000000)
        })

        it('should parse billions', () => {
            expect(parseSwedish('en miljard')).toBe(1_000_000_000)
            expect(parseSwedish('två miljarder')).toBe(2_000_000_000)
        })

        it('should parse trillions', () => {
            expect(parseSwedish('en biljon')).toBe(1_000_000_000_000)
            expect(parseSwedish('två biljoner')).toBe(2_000_000_000_000)
        })

        it('should parse mixed digit/word input (STT quirk)', () => {
            expect(parseSwedish('50fyra')).toBe(54)
            expect(parseSwedish('femtio4')).toBe(54)
        })

        it('should handle whitespace', () => {
            expect(parseSwedish('  femtiofyra  ')).toBe(54)
        })

        it('should handle case insensitivity', () => {
            expect(parseSwedish('FEMTIOFYRA')).toBe(54)
            expect(parseSwedish('Tjugo')).toBe(20)
        })

        it('should parse negative numbers', () => {
            expect(parseSwedish('minus fem')).toBe(-5)
            expect(parseSwedish('minus fyrtiotvå')).toBe(-42)
        })

        it('should return null for invalid input', () => {
            expect(parseSwedish('')).toBeNull()
            expect(parseSwedish('   ')).toBeNull()
        })
    })
})
