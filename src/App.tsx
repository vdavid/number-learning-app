import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { LevelSelectorScreen } from '@/game/level-selector/LevelSelectorScreen'
import { SessionScreen } from '@/game/session/SessionScreen'

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
