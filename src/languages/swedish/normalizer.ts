/**
 * Swedish number converter and parser.
 * Handles the complexity of parsing STT output which may be:
 * - Pure digits: "54"
 * - Pure Swedish words: "femtiofyra"
 * - Mixed: "50fyra" or "femtio4"
 */

const units = ['noll', 'ett', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio']

const teens = ['tio', 'elva', 'tolv', 'tretton', 'fjorton', 'femton', 'sexton', 'sjutton', 'arton', 'nitton']

const tens = ['', '', 'tjugo', 'trettio', 'fyrtio', 'femtio', 'sextio', 'sjuttio', 'åttio', 'nittio']

/**
 * Converts a number to its Swedish spoken form.
 * Example: 54 → "femtiofyra"
 */
export function numberToSwedish(num: number): string {
    if (num < 0) return 'minus ' + numberToSwedish(-num)
    if (num === 0) return 'noll'
    if (num < 10) return units[num]
    if (num < 20) return teens[num - 10]
    if (num < 100) return formatTwoDigit(num)
    if (num < 1000) return formatHundreds(num)
    if (num < 1_000_000) return formatThousands(num)
    if (num < 1_000_000_000) return formatMillions(num)
    if (num < 1_000_000_000_000) return formatBillions(num)
    return formatTrillions(num)
}

function formatTwoDigit(num: number): string {
    const ten = Math.floor(num / 10)
    const unit = num % 10
    return tens[ten] + (unit > 0 ? units[unit] : '')
}

function formatHundreds(num: number): string {
    const hundred = Math.floor(num / 100)
    const remainder = num % 100
    const prefix = hundred === 1 ? '' : units[hundred]
    return prefix + 'hundra' + (remainder > 0 ? numberToSwedish(remainder) : '')
}

function formatThousands(num: number): string {
    const thousand = Math.floor(num / 1000)
    const remainder = num % 1000
    const prefix = thousand === 1 ? '' : numberToSwedish(thousand)
    return prefix + 'tusen' + (remainder > 0 ? numberToSwedish(remainder) : '')
}

function formatMillions(num: number): string {
    const million = Math.floor(num / 1_000_000)
    const remainder = num % 1_000_000
    const prefix = million === 1 ? 'en' : numberToSwedish(million)
    const miljonWord = million === 1 ? 'miljon' : 'miljoner'
    return prefix + ' ' + miljonWord + (remainder > 0 ? ' ' + numberToSwedish(remainder) : '')
}

function formatBillions(num: number): string {
    const billion = Math.floor(num / 1_000_000_000)
    const remainder = num % 1_000_000_000
    const prefix = billion === 1 ? 'en' : numberToSwedish(billion)
    const miljardWord = billion === 1 ? 'miljard' : 'miljarder'
    return prefix + ' ' + miljardWord + (remainder > 0 ? ' ' + numberToSwedish(remainder) : '')
}

function formatTrillions(num: number): string {
    const trillion = Math.floor(num / 1_000_000_000_000)
    const remainder = num % 1_000_000_000_000
    const prefix = trillion === 1 ? 'en' : numberToSwedish(trillion)
    const biljonWord = trillion === 1 ? 'biljon' : 'biljoner'
    return prefix + ' ' + biljonWord + (remainder > 0 ? ' ' + numberToSwedish(remainder) : '')
}

/**
 * Parses Swedish spoken/transcribed text back to a number.
 * Example: "femtiofyra", "54" → 54
 * Returns null if parsing fails.
 */
export function parseSwedish(text: string): number | null {
    // Remove whitespace and normalize
    const cleaned = text.trim().toLowerCase().replace(/\s+/g, ' ')

    if (!cleaned) return null

    // If it's purely numeric, just parse it
    if (/^\d+$/.test(cleaned)) {
        return parseInt(cleaned, 10)
    }

    // Handle zero
    if (cleaned === 'noll') {
        return 0
    }

    // Handle "minus" prefix
    if (cleaned.startsWith('minus ')) {
        const rest = parseSwedish(cleaned.slice(6))
        return rest !== null ? -rest : null
    }

    // Try to parse the Swedish words
    return parseSwedishWords(cleaned)
}

/**
 * Parse Swedish number words to a number.
 */
function parseSwedishWords(text: string): number | null {
    // Handle compound numbers with spaces (like "en miljon tvåhundra")
    // Order matters: biljon > miljard > miljon

    // Handle biljon/biljoner (trillion)
    const biljonMatch = text.match(/^(.+)\s+biljon(?:er)?\s*(.*)$/)
    if (biljonMatch) {
        const trillions = parseSmallNumber(biljonMatch[1])
        const remainder = biljonMatch[2] ? parseSwedishWords(biljonMatch[2]) : 0
        if (trillions === null || remainder === null) return null
        return trillions * 1_000_000_000_000 + remainder
    }

    // Handle miljard/miljarder (billion)
    const miljardMatch = text.match(/^(.+)\s+miljard(?:er)?\s*(.*)$/)
    if (miljardMatch) {
        const billions = parseSmallNumber(miljardMatch[1])
        const remainder = miljardMatch[2] ? parseSwedishWords(miljardMatch[2]) : 0
        if (billions === null || remainder === null) return null
        return billions * 1_000_000_000 + remainder
    }

    // Handle miljon/miljoner (million)
    const miljonMatch = text.match(/^(.+)\s+miljon(?:er)?\s*(.*)$/)
    if (miljonMatch) {
        const millions = parseSmallNumber(miljonMatch[1])
        const remainder = miljonMatch[2] ? parseSwedishWords(miljonMatch[2]) : 0
        if (millions === null || remainder === null) return null
        return millions * 1_000_000 + remainder
    }

    // Remove spaces for compound words (like "tio tusen" -> "tiotusen")
    const noSpaces = text.replace(/\s+/g, '')

    return parseCompoundNumber(noSpaces)
}

/**
 * Parse small numbers like "en", "två" for use with miljon/miljard.
 */
function parseSmallNumber(text: string): number | null {
    const cleaned = text.trim()
    if (cleaned === 'en' || cleaned === 'ett') return 1
    return parseSwedishWords(cleaned)
}

/**
 * Parse a compound Swedish number (no spaces, all words connected).
 */
function parseCompoundNumber(text: string): number | null {
    if (!text) return 0

    // Replace any digit sequences with their Swedish equivalent for mixed parsing
    const normalized = text.replace(/\d+/g, (match) => {
        const val = parseInt(match, 10)
        return numberToSwedish(val)
    })

    return parseCompoundNumberInner(normalized)
}

/**
 * Inner parsing of compound Swedish number.
 */
function parseCompoundNumberInner(text: string): number | null {
    if (!text) return 0

    let remaining = text
    let total = 0

    // Handle "tusen" (thousand)
    const tusenIndex = remaining.indexOf('tusen')
    if (tusenIndex !== -1) {
        const before = remaining.slice(0, tusenIndex)
        const after = remaining.slice(tusenIndex + 5)

        let thousands = 1
        if (before) {
            thousands = parseCompoundNumberInner(before) ?? 0
            if (thousands === 0) thousands = 1 // "tusen" alone means 1000
        }
        total += thousands * 1000

        remaining = after
    }

    // Handle "hundra" (hundred)
    const hundraIndex = remaining.indexOf('hundra')
    if (hundraIndex !== -1) {
        const before = remaining.slice(0, hundraIndex)
        const after = remaining.slice(hundraIndex + 6)

        let hundreds = 1
        if (before) {
            hundreds = parseUnit(before) ?? 1
        }
        total += hundreds * 100

        remaining = after
    }

    // Parse the remaining part (tens and units)
    if (remaining) {
        const value = parseTensAndUnits(remaining)
        if (value !== null) {
            total += value
        } else if (total === 0) {
            return null // Failed to parse anything
        }
    }

    return total || null
}

/**
 * Parse a single unit word (0-9).
 */
function parseUnit(word: string): number | null {
    const index = units.indexOf(word)
    if (index !== -1) return index

    // Special case: "en" is sometimes used instead of "ett"
    if (word === 'en') return 1

    return null
}

/**
 * Parse tens and units (0-99).
 */
function parseTensAndUnits(text: string): number | null {
    if (!text) return null

    // Check for exact unit match
    const unitValue = parseUnit(text)
    if (unitValue !== null) return unitValue

    // Check for teens (10-19)
    const teenIndex = teens.indexOf(text)
    if (teenIndex !== -1) return 10 + teenIndex

    // Check for tens with optional unit
    for (let t = 2; t <= 9; t++) {
        const tenWord = tens[t]
        if (text.startsWith(tenWord)) {
            const unitPart = text.slice(tenWord.length)
            if (!unitPart) return t * 10

            const unitValue = parseUnit(unitPart)
            if (unitValue !== null) {
                return t * 10 + unitValue
            }
        }
    }

    return null
}
