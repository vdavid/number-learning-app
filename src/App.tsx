import { LevelSelectorScreen } from '@features/level-selector'
import { SessionScreen } from '@features/session'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

/**
 * Main application component.
 * Sets up routing between the level selector and session screens.
 */
export function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<LevelSelectorScreen />} />
                <Route path='/session' element={<SessionScreen />} />
            </Routes>
        </BrowserRouter>
    )
}
