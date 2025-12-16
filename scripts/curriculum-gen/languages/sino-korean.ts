import type { Stage } from '@shared/types/index.js'

import type { LanguageConfig } from './types.js'

const helpTexts: Record<number, string> = {
    // === Stage 1: Digits (1–10) ===
    1: 'Sounds like "eel". This is your most used LEGO block.',
    2: '"ee" sound, like the letter E.',
    3: 'Think "some" with an "ah" sound.',
    4: 'Short and simple, like "sah".',
    5: 'Sounds like "oh!"',
    6: 'Starts with a "y" sound: "yook".',
    7: 'Sounds like "cheel", rhymes with "meal".',
    8: 'Sounds like "pahl", rhymes with "doll".',
    9: '"goo", like in "goose".',
    10: 'This is "sip", your first multiplier! 20 is "i-sip" (2×10), 30 is "sam-sip" (3×10), but 10 is just "sip"—no "il" (1) prefix needed.',

    // === Stage 2: Teens (11–20) ===
    11: 'Sip (10) + il (1) = "sip-il". Teens follow this pattern: sip + digit.',
    12: 'Sip (10) + i (2) = "sip-i". Same pattern for all teens!',
    13: 'Sip (10) + sam (3) = "sip-sam".',
    14: 'Sip (10) + sa (4) = "sip-sa".',
    15: 'Sip (10) + o (5) = "sip-o".',
    16: 'Sip (10) + yuk (6) = "sip-yuk". The "yuk" sound stays the same.',
    17: 'Sip (10) + chil (7) = "sip-chil".',
    18: 'Sip (10) + pal (8) = "sip-pal".',
    19: 'Sip (10) + gu (9) = "sip-gu".',
    20: 'Now it flips! I (2) + sip (10) = "i-sip". Two tens = twenty. This pattern continues: 30 is "sam-sip", 40 is "sa-sip", etc.',

    // === Stage 3: Twenties (21–30) ===
    21: 'Three parts: i (2) + sip (10) + il (1) = "i-sip-il". This pattern works for all two-digit numbers!',
    22: 'I (2) + sip (10) + i (2) = "i-sip-i". Two-ten-two.',
    23: 'I (2) + sip (10) + sam (3) = "i-sip-sam".',
    24: 'I (2) + sip (10) + sa (4) = "i-sip-sa".',
    25: 'I (2) + sip (10) + o (5) = "i-sip-o".',
    26: 'I (2) + sip (10) + yuk (6) = "i-sip-yuk".',
    27: 'I (2) + sip (10) + chil (7) = "i-sip-chil".',
    28: 'I (2) + sip (10) + pal (8) = "i-sip-pal".',
    29: 'I (2) + sip (10) + gu (9) = "i-sip-gu".',
    30: 'Sam (3) + sip (10) = "sam-sip". Three tens = thirty.',

    // === Stage 4: Decades ===
    0: 'Zero is used mainly in technical contexts and phone numbers.',
    40: 'Sa (4) + sip (10) = "sa-sip". Four tens.',
    50: 'O (5) + sip (10) = "o-sip". Five tens.',
    60: 'Yuk (6) + sip (10) = "yuk-sip". Six tens.',
    70: 'Chil (7) + sip (10) = "chil-sip". Seven tens.',
    80: 'Pal (8) + sip (10) = "pal-sip". Eight tens.',
    90: 'Gu (9) + sip (10) = "gu-sip". Nine tens.',
    100: 'New multiplier: "baek" (100). Just "baek", not "il-baek"—no "one" prefix, same as with sip!',

    // === Stage 5: Two digits (31–99) ===
    33: 'Sam-sip-sam: three-ten-three. Double digits like this are satisfying!',
    44: 'Sa-sip-sa: four-ten-four.',
    55: 'O-sip-o: five-ten-five.',
    66: 'Yuk-sip-yuk: six-ten-six.',
    77: 'Chil-sip-chil: seven-ten-seven. Considered lucky!',
    88: 'Pal-sip-pal: eight-ten-eight. Very lucky number in Korean culture!',
    99: 'Gu-sip-gu: nine-ten-nine.',

    // === Stage 6: Hundreds ===
    200: 'I (2) + baek (100) = "i-baek". The pattern continues with the hundreds multiplier!',
    300: 'Sam (3) + baek (100) = "sam-baek".',
    400: 'Sa (4) + baek (100) = "sa-baek".',
    500: 'O (5) + baek (100) = "o-baek".',
    600: 'Yuk (6) + baek (100) = "yuk-baek".',
    700: 'Chil (7) + baek (100) = "chil-baek".',
    800: 'Pal (8) + baek (100) = "pal-baek".',
    900: 'Gu (9) + baek (100) = "gu-baek".',
    1000: 'New multiplier: "cheon" (1000). Just "cheon", not "il-cheon"—same pattern as baek and sip!',

    // === Stage 7: Three digits (101–999) ===
    101: 'Baek (100) + il (1) = "baek-il". No "and" needed—just stack the parts.',
    111: 'Baek (100) + sip (10) + il (1) = "baek-sip-il". Hundred-ten-one.',
    222: 'I-baek-i-sip-i: all twos!',
    333: 'Sam-baek-sam-sip-sam: triple threes.',
    444: 'Sa-baek-sa-sip-sa: all fours.',
    555: 'O-baek-o-sip-o: all fives.',
    666: 'Yuk-baek-yuk-sip-yuk: all sixes.',
    777: 'Chil-baek-chil-sip-chil: lucky sevens!',
    888: 'Pal-baek-pal-sip-pal: very lucky in Korean culture—8 is an auspicious number!',

    // === Stage 8: Thousands (1000–9999) ===
    1111: 'Cheon-baek-sip-il: all ones using every multiplier!',
    2000: 'I (2) + cheon (1000) = "i-cheon". Two thousand.',
    5000: 'O (5) + cheon (1000) = "o-cheon". Five thousand.',
    5006: 'O-cheon-yuk: five thousand six. Skip any zeros in the middle—no placeholder needed.',

    // === Stage 9: Man (10000+) ===
    10000: 'New unit: "man" (10,000). Korean groups by 10,000s, not 1,000s! Just "man", not "il-man".',
    10002: 'Man (10,000) + i (2) = "man-i". Ten thousand two.',
    20000: 'I (2) × man (10,000) = "i-man". Twenty thousand.',
    50000: 'O (5) × man (10,000) = "o-man". Fifty thousand.',
    100_000: 'Sip (10) × man (10,000) = "sip-man". One hundred thousand. The multipliers stack!',
    1_000_000: 'Baek (100) × man (10,000) = "baek-man". One million. Still using man as the base unit!',
    10_000_000: 'Cheon (1000) × man (10,000) = "cheon-man". Ten million. The man system scales beautifully!',
    100_000_000: 'Sip-man × man: one hundred million. Keep stacking the parts!',
    1_000_000_000: 'Baek-man × man: one billion. The multiplicative beauty of Korean numbers continues.',
    10_000_000_000: 'Cheon-man × man: ten billion. These large numbers follow the same logical patterns.',
    100_000_000_000: 'Sip × cheon-man × man: one hundred billion. Each part has its place.',
    1_000_000_000_000: "Baek × cheon-man × man: one trillion. The largest number you'll learn here!",
}

/**
 * Localize stages with Sino-Korean specific descriptions.
 */
function localizeStages(stages: Stage[]): Stage[] {
    const localizations: Record<string, Partial<Stage>> = {
        'Digits (1–10)': {
            description: 'Learn the basic building blocks: 일, 이, 삼... 십',
        },
        'Teens (11–20)': {
            description: 'Combine ten with digits: 십일, 십이... 이십',
        },
        'Twenties (21–30)': {
            description: 'Practice the twenties: 이십일... 삼십',
        },
        Decades: {
            description: 'Round numbers: 십, 이십, 삼십... 백',
        },
        Hundreds: {
            description: 'Round hundreds: 백, 이백... 천',
        },
        'Three digits (101–999)': {
            description: 'Any number up to a thousand',
        },
        'Thousands (1000–9999)': {
            description: 'Numbers in the thousands',
        },
        'Large numbers (10000+)': {
            displayName: 'Man (10000+)',
            description: 'The Korean "ten thousand" unit: 만',
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

export const sinoKoreanConfig: LanguageConfig = {
    id: 'sino-korean',
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
            id: 'matilda',
            name: 'Matilda',
            provider: 'elevenlabs',
            voiceId: 'XrExE9yKIg1WjnnlVkGX',
            gender: 'female',
        },
    ],
    localizeStages,
}
