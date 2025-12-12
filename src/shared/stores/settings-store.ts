import { DEFAULT_LANGUAGE_ID } from '@features/languages'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
    /** Currently selected language ID */
    languageId: string

    /** Quiet mode - skip speak exercises when you can't talk */
    quietMode: boolean

    /** Set the current language */
    setLanguage: (languageId: string) => void

    /** Toggle quiet mode */
    toggleQuietMode: () => void

    /** Set quiet mode explicitly */
    setQuietMode: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            languageId: DEFAULT_LANGUAGE_ID,
            quietMode: false,

            setLanguage: (languageId: string) => set({ languageId }),

            toggleQuietMode: () => set((state) => ({ quietMode: !state.quietMode })),

            setQuietMode: (enabled: boolean) => set({ quietMode: enabled }),
        }),
        {
            name: 'number-trainer-settings',
        },
    ),
)
