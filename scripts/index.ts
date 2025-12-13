import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Curriculum } from '../src/shared/types/index.js'

export function loadCurriculum(languageId: string): Curriculum {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const projectRoot = path.resolve(__dirname, '../../../..')
    const filePath = path.join(path.join(projectRoot, 'public/' + languageId), 'curriculum.json')
    if (!fs.existsSync(filePath)) {
        throw new Error(`Curriculum not found at ${filePath}. Run the curriculum generator first.`)
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as Curriculum
}
