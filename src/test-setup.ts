import '@testing-library/dom'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock localStorage for Zustand persist middleware
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value
        },
        removeItem: (key: string) => {
            store = Object.fromEntries(Object.entries(store).filter(([k]) => k !== key))
        },
        clear: () => {
            store = {}
        },
        get length() {
            return Object.keys(store).length
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
})

// Mock window.matchMedia for components that use media queries
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
})

// Mock SpeechSynthesis for TTS tests
Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    value: {
        cancel: vi.fn(),
        speak: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        getVoices: vi.fn(() => []),
        onvoiceschanged: null,
        paused: false,
        pending: false,
        speaking: false,
    },
})

// Mock SpeechSynthesisUtterance
window.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
    lang: '',
    rate: 1,
    pitch: 1,
    text: '',
    voice: null,
    onend: null,
    onerror: null,
})) as unknown as typeof SpeechSynthesisUtterance

// Mock Audio for TTS tests
window.Audio = vi.fn().mockImplementation(() => ({
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    onended: null,
    onerror: null,
})) as unknown as typeof Audio

// Mock fetch for manifest loading
global.fetch = vi.fn(() =>
    Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
    }),
) as unknown as typeof fetch
