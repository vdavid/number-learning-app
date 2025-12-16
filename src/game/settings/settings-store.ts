import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { defaultLanguageID, type LanguageId } from '@/languages/index.ts'

interface SettingsState {
    /** Currently selected language ID */
    languageId: LanguageId

    /** Quiet mode - skip speak exercises when you can't talk */
    quietMode: boolean

    /** Set the current language */
    setLanguage: (languageId: LanguageId) => void

    /** Toggle quiet mode */
    toggleQuietMode: () => void

    /** Set quiet mode explicitly */
    setQuietMode: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            languageId: defaultLanguageID,
            quietMode: false,

            setLanguage: (languageId: LanguageId) => set({ languageId }),

            toggleQuietMode: () => set((state) => ({ quietMode: !state.quietMode })),

            setQuietMode: (enabled: boolean) => set({ quietMode: enabled }),
        }),
        {
            name: 'number-trainer-settings',
        },
    ),
)
