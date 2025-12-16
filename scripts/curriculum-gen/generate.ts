#!/usr/bin/env npx tsx

import * as fs from 'node:fs'

import type { Curriculum, Stage } from '@shared/types/index.js'

import { getDefaultStages } from './default-stages.js'
import { configs } from './languages/index.js'
import type { LanguageConfig } from './languages/types.js'
import {
    createSeededRandom,
    formatCurriculumJson,
    getCurriculumPath,
    shuffleArray,
    writeCurriculumFile,
} from './utils.js'

interface CliArgs {
    lang?: string
    check: boolean
}

function parseArgs(): CliArgs {
    const args = process.argv.slice(2)
    const result: CliArgs = { check: false }

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--lang' && args[i + 1]) {
            result.lang = args[i + 1]
            i++
        } else if (args[i] === '--check') {
            result.check = true
        }
    }

    return result
}

function generateCurriculum(config: LanguageConfig): Curriculum {
    const random = createSeededRandom(64) // Fixed seed for deterministic output!

    // Get default stages with this language's help texts
    let stages: Stage[] = getDefaultStages(random, config.helpTexts)

    // Apply language-specific localization if provided
    if (config.localizeStages) {
        stages = config.localizeStages(stages)
    }

    // Shuffle numbers within each stage for variety (deterministic due to seeded random)
    for (const stage of stages) {
        stage.numbers = shuffleArray(stage.numbers, random)
    }

    return {
        voices: config.voices,
        stages,
    }
}

function processLanguage(config: LanguageConfig): boolean {
    const curriculum = generateCurriculum(config)
    const outputPath = getCurriculumPath(config.id)

    // Write the curriculum
    writeCurriculumFile(config.id, curriculum)

    // Summary
    const totalNumbers = curriculum.stages.reduce((sum, stage) => sum + stage.numbers.length, 0)
    console.log(`✅ ${config.id}: ${curriculum.stages.length} stages, ${totalNumbers} numbers`)
    console.log(`   📁 ${outputPath}`)

    return true
}

function isUnchanged(curriculum: Curriculum, languageId: string) {
    const outputPath = getCurriculumPath(languageId)

    // Compare with the existing file
    const newContent = formatCurriculumJson(curriculum)
    let existingContent = ''

    try {
        existingContent = fs.readFileSync(outputPath, 'utf-8')
    } catch {
        console.error(`❌ ${languageId}: curriculum/${languageId}.json not found at ${outputPath}`)
        return false
    }

    if (newContent !== existingContent) {
        console.error(`❌ ${languageId}: curriculum/${languageId}.json is stale. Run 'pnpm cur-gen' to regenerate.`)
        return false
    }

    console.log(`✅ ${languageId}: curriculum/${languageId}.json is fresh`)
    return true
}

function main() {
    const args = parseArgs()

    // Determine which languages to process
    let languageIds: string[]
    if (args.lang) {
        if (!configs[args.lang]) {
            console.error(`❌ Unknown language: ${args.lang}`)
            console.error(`   Available: ${Object.keys(configs).join(', ')}`)
            process.exit(1)
        }
        languageIds = [args.lang]
    } else {
        languageIds = Object.keys(configs)
    }

    if (args.check) {
        console.log('🔍 Checking curriculum freshness...\n')
        if (languageIds.some((languageId) => !isUnchanged(generateCurriculum(configs[languageId]), languageId))) {
            process.exit(1)
        }
    }

    console.log('🎓 Generating curriculum files...\n')
    languageIds.forEach((languageId) => processLanguage(configs[languageId]))

    if (!args.check) {
        console.log('Done! 🎉')
    }
}

main()
