import { describe, it, expect } from 'vitest'

import { numberToSinoKorean, parseSinoKorean } from './normalizer'

describe('Sino-Korean normalizer', () => {
    describe('numberToSinoKorean', () => {
        it('should convert zero', () => {
            expect(numberToSinoKorean(0)).toBe('영')
        })

        it('should convert single digits', () => {
            expect(numberToSinoKorean(1)).toBe('일')
            expect(numberToSinoKorean(5)).toBe('오')
            expect(numberToSinoKorean(9)).toBe('구')
        })

        it('should convert teens', () => {
            expect(numberToSinoKorean(10)).toBe('십')
            expect(numberToSinoKorean(11)).toBe('십일')
            expect(numberToSinoKorean(15)).toBe('십오')
            expect(numberToSinoKorean(19)).toBe('십구')
        })

        it('should convert two-digit numbers', () => {
            expect(numberToSinoKorean(20)).toBe('이십')
            expect(numberToSinoKorean(25)).toBe('이십오')
            expect(numberToSinoKorean(54)).toBe('오십사')
            expect(numberToSinoKorean(99)).toBe('구십구')
        })

        it('should convert hundreds', () => {
            expect(numberToSinoKorean(100)).toBe('백')
            expect(numberToSinoKorean(200)).toBe('이백')
            expect(numberToSinoKorean(123)).toBe('백이십삼')
            expect(numberToSinoKorean(456)).toBe('사백오십육')
        })

        it('should convert thousands', () => {
            expect(numberToSinoKorean(1000)).toBe('천')
            expect(numberToSinoKorean(2000)).toBe('이천')
            expect(numberToSinoKorean(1234)).toBe('천이백삼십사')
            expect(numberToSinoKorean(9999)).toBe('구천구백구십구')
        })

        it('should convert ten thousands (man)', () => {
            expect(numberToSinoKorean(10000)).toBe('만')
            expect(numberToSinoKorean(20000)).toBe('이만')
            expect(numberToSinoKorean(12345)).toBe('만이천삼백사십오')
            expect(numberToSinoKorean(54321)).toBe('오만사천삼백이십일')
        })

        it('should convert large numbers', () => {
            expect(numberToSinoKorean(100000)).toBe('십만')
            expect(numberToSinoKorean(1000000)).toBe('백만')
            expect(numberToSinoKorean(10000000)).toBe('천만')
        })
    })

    describe('parseSinoKorean', () => {
        it('should parse pure digits', () => {
            expect(parseSinoKorean('54')).toBe(54)
            expect(parseSinoKorean('123')).toBe(123)
            expect(parseSinoKorean('10000')).toBe(10000)
        })

        it('should parse single Hangul digits', () => {
            expect(parseSinoKorean('일')).toBe(1)
            expect(parseSinoKorean('오')).toBe(5)
            expect(parseSinoKorean('구')).toBe(9)
        })

        it('should parse zero', () => {
            expect(parseSinoKorean('영')).toBe(0)
            expect(parseSinoKorean('공')).toBe(0)
            expect(parseSinoKorean('0')).toBe(0)
        })

        it('should parse tens', () => {
            expect(parseSinoKorean('십')).toBe(10)
            expect(parseSinoKorean('이십')).toBe(20)
            expect(parseSinoKorean('십오')).toBe(15)
            expect(parseSinoKorean('오십사')).toBe(54)
        })

        it('should parse hundreds', () => {
            expect(parseSinoKorean('백')).toBe(100)
            expect(parseSinoKorean('이백')).toBe(200)
            expect(parseSinoKorean('백이십삼')).toBe(123)
        })

        it('should parse thousands', () => {
            expect(parseSinoKorean('천')).toBe(1000)
            expect(parseSinoKorean('이천')).toBe(2000)
            expect(parseSinoKorean('천이백삼십사')).toBe(1234)
        })

        it('should parse ten thousands', () => {
            expect(parseSinoKorean('만')).toBe(10000)
            expect(parseSinoKorean('이만')).toBe(20000)
            expect(parseSinoKorean('만이천삼백사십오')).toBe(12345)
        })

        it('should parse mixed digit/Hangul input (STT quirk)', () => {
            expect(parseSinoKorean('5십4')).toBe(54)
            expect(parseSinoKorean('오십4')).toBe(54)
            expect(parseSinoKorean('5십사')).toBe(54)
        })

        it('should handle whitespace', () => {
            expect(parseSinoKorean('  오십사  ')).toBe(54)
            expect(parseSinoKorean('오 십 사')).toBe(54)
        })

        it('should return null for invalid input', () => {
            expect(parseSinoKorean('')).toBeNull()
            expect(parseSinoKorean('   ')).toBeNull()
        })
    })
})
