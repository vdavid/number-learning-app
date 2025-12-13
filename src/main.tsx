import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { App } from './App'
import './index.css'
import { initTestUtils } from './shared/test-utils'
import { logger } from './shared/utils'

// Initialize test utilities in test mode (for E2E tests)
if (import.meta.env.MODE === 'test') {
    initTestUtils()
}

logger.debug('App started')

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Root element not found')
}

createRoot(rootElement).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
