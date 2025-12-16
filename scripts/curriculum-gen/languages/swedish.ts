import type { Stage } from '@shared/types/index.js'

import type { LanguageConfig } from './types.js'

const helpTexts: Record<number, string> = {
    // === Stage 1: Digits (1–10) ===
    1: '"Ett" for counting, but "en" before common-gender nouns. Here we use "ett".',
    2: 'The "tv" sounds like English "tv". Think "tvoh".',
    3: 'Like English "three" without the "th".',
    4: 'Think "fear-ah". The "y" sounds like German "ü".',
    5: 'Rhymes with English "hem".',
    6: 'Yes, really! Pronounced like English "sex".',
    7: 'Tricky! The "sj" makes a "hw" or "sh" sound. Like "hwoo" or "shoo".',
    8: 'The "å" sounds like "o" in "corn". Think "oh-tah".',
    9: 'Sounds like "nee-oh".',
    10: 'Sounds like "tee-oh". Your first building block for teens!',

    // === Stage 2: Teens (11–20) ===
    11: 'Irregular, like English "eleven". Just memorize it!',
    12: 'Irregular, like English "twelve". Also needs memorizing.',
    13: 'Tre (3) + ton. The "-ton" suffix means "-teen".',
    14: 'Note the "fj" start, different from "fyra".',
    15: 'Fem (5) + ton. Straightforward!',
    16: "Sex (6) + ton. Yes, that's how you say it!",
    17: 'Sju (7) + ton. Keep practicing that "sj" sound!',
    18: 'Shortened from "åtton". The "å" became "a".',
    19: 'Nio becomes "nit-" before "-ton".',
    20: 'The "tj" makes a "ch" sound, like "chew-goh".',

    // === Stage 3: Twenties (21–30) ===
    21: 'Tjugo + ett = tjugoett. In Swedish, tens come first (like English), unlike German.',
    22: 'Tjugo + två = tjugotvå. The pattern continues simply.',
    23: 'Tjugo + tre = tjugotre. In spoken Swedish, they often just say "tjuett", "tjutvå", "tjutre", ...',
    24: 'Tjugo + fyra = tjugofyra.',
    25: 'Tjugo + fem = tjugofem.',
    26: 'Tjugo + sex = tjugosex.',
    27: 'Tjugo + sju = tjugosju.',
    28: 'Tjugo + åtta = tjugoåtta.',
    29: 'Tjugo + nio = tjugonio.',
    30: 'Tre + tio, but modified. Note the double "t".',

    // === Stage 4: Decades ===
    0: 'Similar to English "null".',
    40: 'Fyra + tio, shortened to "fyrtio". The "y" sound remains.',
    50: 'Fem + tio. Nice and regular!',
    60: 'Sex + tio. Straightforward.',
    70: 'Sju + tio with double "t". That "sj" sound again!',
    80: 'Åtta + tio, simplified. The "å" stays.',
    90: 'Nio becomes "nit-" before "-tio".',
    100: 'Like English "hundred"! No "ett" needed for just 100.',

    // === Stage 5: Two digits (31–99) ===
    33: 'Trettio + tre = trettiotre. All threes!',
    44: 'Fyrtio + fyra = fyrtiofyra. All fours!',
    55: 'Femtio + fem = femtiofem. All fives!',
    66: 'Sextio + sex = sextiosex. All sixes!',
    77: 'Sjuttio + sju = sjuttiosju. All sevens — practice that "sj"!',
    88: 'Åttio + åtta = åttioåtta. All eights!',
    99: 'Nittio + nio = nittionio. All nines!',

    // === Stage 6: Hundreds ===
    200: 'Två + hundra = tvåhundra. Two hundred.',
    300: 'Tre + hundra = trehundra.',
    400: 'Fyra + hundra = fyrahundra.',
    500: 'Fem + hundra = femhundra.',
    600: 'Sex + hundra = sexhundra.',
    700: 'Sju + hundra = sjuhundra.',
    800: 'Åtta + hundra = åttahundra.',
    900: 'Nio + hundra = niohundra.',
    1000: 'Like English "thousand"! No "ett" needed for just 1000.',

    // === Stage 7: Three digits (101–999) ===
    101: 'Hundra + ett = hundraett. Simple stacking!',
    111: 'Hundra + elva = hundraelva. Hundred-eleven.',
    222: 'Tvåhundratjugotvå: all twos!',
    333: 'Trehundratrettiotre: all threes!',
    444: 'Fyrahundrafyrtiofyra: all fours!',
    555: 'Femhundrafemtiofem: all fives!',
    666: 'Sexhundrasextiosex: all sixes!',
    777: 'Sjuhundrasjuttiosju: all sevens!',
    888: 'Åttahundraåttioåtta: all eights!',
    999: 'Niohundranittionio: all nines!',

    // === Stage 8: Thousands (1000–9999) ===
    1001: 'Tusen + ett = tusenett. Just stack the parts.',
    1111: 'Tusen + hundra + elva = tusenhundraelva.',
    2000: 'Två + tusen = tvåtusen. Two thousand.',
    5000: 'Fem + tusen = femtusen. Five thousand.',

    // === Stage 9: Large numbers (10000+) ===
    10000: 'Tio + tusen = tiotusen. Ten thousand. Swedish groups by thousands like English.',
    100_000: 'Hundra + tusen = hundratusen. One hundred thousand.',
    1_000_000: 'Note "en" not "ett" because "miljon" is common gender.',
    10_000_000: 'Tio miljoner. Ten million — just like English, Swedish multiplies "miljon".',
    100_000_000: 'Hundra miljoner. One hundred million.',
    1_000_000_000: '"En miljard" — a billion. Note: "miljard" is common gender, so "en" not "ett".',
    10_000_000_000: 'Tio miljarder. Ten billion.',
    100_000_000_000: 'Hundra miljarder. One hundred billion.',
    1_000_000_000_000: '"En biljon" — a trillion. Swedish uses the long scale, so "biljon" = 10¹².',
}

/**
 * Localize stages with Swedish-specific descriptions.
 */
function localizeStages(stages: Stage[]): Stage[] {
    const localizations: Record<string, Partial<Stage>> = {
        'Digits (1–10)': {
            displayName: 'Digits (0–10)',
            description: 'Learn the basics: noll, ett, två, tre... tio',
        },
        'Teens (11–20)': {
            description: 'Irregular 11-12, then the -ton pattern: elva, tolv, tretton...',
        },
        'Twenties (21–30)': {
            description: 'Practice with tjugo: tjugoett, tjugotvå...',
        },
        Decades: {
            description: 'Round tens: trettio, fyrtio... hundra',
        },
        Hundreds: {
            description: 'Round hundreds: hundra, tvåhundra... tusen',
        },
        'Thousands (1000–9999)': {
            displayName: 'Thousands (1001–9999)',
        },
        'Large numbers (10000+)': {
            description: 'Ten thousands, hundred thousands, and millions',
        },
    }

    return stages.map((stage) => {
        const localization = localizations[stage.displayName]
        if (localization) {
            return { ...stage, ...localization }
        }
        return stage
    })
}

export const swedishConfig: LanguageConfig = {
    id: 'swedish',
    helpTexts,
    voices: [
        {
            id: 'charlie',
            name: 'Charlie',
            provider: 'elevenlabs',
            voiceId: 'IKne3meq5aSn9XLyUdCD',
            gender: 'male',
        },
        {
            id: 'achernar',
            name: 'Achernar',
            provider: 'google',
            voiceId: 'sv-SE-Chirp3-HD-Achernar',
            gender: 'female',
        },
        {
            id: 'laomedeia',
            name: 'Laomedeia',
            provider: 'google',
            voiceId: 'sv-SE-Chirp3-HD-Laomedeia',
            gender: 'female',
        },
        {
            id: 'puck',
            name: 'Puck',
            provider: 'google',
            voiceId: 'sv-SE-Chirp3-HD-Puck',
            gender: 'male',
        },
        {
            id: 'iapetus',
            name: 'Iapetus',
            provider: 'google',
            voiceId: 'sv-SE-Chirp3-HD-Iapetus',
            gender: 'male',
        },
    ],
    localizeStages,
}
