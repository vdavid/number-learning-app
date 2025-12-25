# Core Concepts

## Generate

1. Identify PATTERNS of the language, for example see later - use [[scripts/add-language.ipynb]]

2. Use these PATTERNS to create a PATTERN-SKILL matrix and the filter functions both direction:
    - getting a list of NUMBERs for a certain PATTERN
    - getting the list of PATTERNS for a certain NUMBER


## Repeat, recognize patterns

Learning certain things by hearth like how to pronounce letters or phonemes are the starting spot. 

But language isn't just brute force memorization. There are PATTERNS and rules that get "hardware accelerated" as we use them: our brains form neural pathways through repetition and practice, strengthening the connections.

These patterns help us relax cognitive load, in the end, most languages are logical and follow systematic rules. Most are similar, but some are quite different by language.

Instead of giving just a random number generator and checker we tried the following approach:

Generate a PATTERN set that covers the essential rules and patterns of the spoken/written number system.

## Patterns

What are patterns? For *English*, there are 59 patterns in total for a human to understand how to form any natural number
until 1 trillion:
- **13 patterns to memorize 0–12**: 13, each number is new
- **9 patterns to memorize/understand forming 13–19**: 1 ("teen")+1 (order: N&"teen")+7 (numbers)
- **8 patterns to memorize/understand forming decades (20, 30, ... 90)**: 8 (each decade)
- **4 patterns to understand how to form 21–29**: 2 (21 and 22 are not like 11 and 12)+1 (order: "20"&N)+1 (the rest are the same)
- **1 patterns to understand 31–39**: only 1 (it's the same as twenty-*)
- **1 patterns to understand the remaining between 40 and 99**: only 1 (it's the same)
- **2 patterns to learn hundreds**: 1 (hundred)+1 (pattern: N&"hundred")
- **1 patterns to learn 101–999**: only 1! (the order/pattern to form them)
- **4 patterns to learn plain thousands**: 1 (thousand)+1 (pattern: N&"thousand")+1 (pattern: NN&"thousand)+1 (pattern: NNN&"thousand)
- **2 patterns to learn the rest between 1001–999,999**: 1 (first part is NNN&"thousand")+1 (second part is just NNN, no magic)
- **4 patterns to learn millions**: like plain thousands
- **2 patterns to learn 1M–999M**: like 1k–1M
- **4 patterns to learn billions**: like plain thousands
- **3 patterns to learn 1B–1T**: like 1k–1M +1 (trillion)




So, first, figure out the patterns for your language, and write them down in `docs/your-language.md` to document how
patterns work in your language.

Then convert them to a list of constants in this format (these are for English):

- Stage 1: The Atomic Base (0–12)
    - `NUM_ZERO` – Rote memorization of "zero".
    - `NUM_ONE` – Rote memorization of "one".
    - `NUM_TWO` – Rote memorization of "two".
    - `NUM_THREE` – Rote memorization of "three".
    - `NUM_FOUR` – Rote memorization of "four".
    - `NUM_FIVE` – Rote memorization of "five".
    - `NUM_SIX` – Rote memorization of "six".
    - `NUM_SEVEN` – Rote memorization of "seven".
    - `NUM_EIGHT` – Rote memorization of "eight".
    - `NUM_NINE` – Rote memorization of "nine".
    - `NUM_TEN` – Rote memorization of "ten".
    - `NUM_ELEVEN` – Rote memorization of "eleven" (irregularity).
    - `NUM_TWELVE` – Rote memorization of "twelve" (irregularity).
- Stage 2: The "Teen" Constructors (13–19)
    - `SUFFIX_TEEN` – The word "teen" used as a suffix.
    - `PATTERN_TEEN_ORDER` – The rule that the digit comes before the suffix (unlike Asian languages often 10+3).
    - `STEM_THIR` – The modified stem for 13.
    - `STEM_FOUR` – The regular stem for 14.
    - `STEM_FIF` – The modified stem for 15.
    - `STEM_SIX` – The regular stem for 16.
    - `STEM_SEVEN` – The regular stem for 17.
    - `STEM_EIGH` – The modified stem for 18 (shared 't').
    - `STEM_NINE` – The regular stem for 19.
- Stage 3: The Decades (20–90)
    - `NUM_TWENTY` – Rote memorization of "twenty".
    - `NUM_THIRTY` – Rote memorization of "thirty".
    - `NUM_FORTY` – Rote memorization of "forty" (spelling change from four).
    - `NUM_FIFTY` – Rote memorization of "fifty".
    - `NUM_SIXTY` – Rote memorization of "sixty".
    - `NUM_SEVENTY` – Rote memorization of "seventy".
    - `NUM_EIGHTY` – Rote memorization of "eighty".
    - `NUM_NINETY` – Rote memorization of "ninety".
- Stage 4: Compound Decades (21–29)
    - `RULE_21_NOT_ELEVEN` – Explicit rule that 21 does not revert to "eleven" logic.
    - `RULE_22_NOT_TWELVE` – Explicit rule that 22 does not revert to "twelve" logic.
    - `PATTERN_DECADE_UNIT_ORDER` – The rule of saying "Twenty" then "One" (Big-Endian).
    - `PATTERN_2X_REGULARITY` – The rule that 23–29 follow the standard pattern.
- Stage 5: Pattern Extension (30–99)
    - `PATTERN_3X_SAME_AS_2X` – Understanding that 30s behave exactly like 20s.
    - `PATTERN_REMAINING_DECADES` – Understanding that 40–99 behave exactly like 20s.
- Stage 6: Hundreds & The "101" Exception
    - `UNIT_HUNDRED` – The word "hundred".
    - `PATTERN_N_HUNDRED` – The prefix pattern (Digit + "hundred").
    - `CONNECTOR_AND` – The specific connecting word "and" (or silence in US) used after hundred.
    - `PATTERN_HUNDRED_REMAINDER` – The logic of appending the remaining 0–99 part to the hundred block.
- Stage 7: Thousands
    - `UNIT_THOUSAND` – The word "thousand".
    - `PATTERN_N_THOUSAND` – Pattern for 1,000–9,000.
    - `PATTERN_NN_THOUSAND` – Pattern for 10,000–99,000.
    - `PATTERN_NNN_THOUSAND` – Pattern for 100,000–999,000.
    - `PATTERN_THOUSAND_HEAD` – Constructing the leading "thousand" block (1001–999,999).
    - `PATTERN_THOUSAND_TAIL` – Appending the standard 0–999 block after the thousand.
- Stage 8: Millions
    - `UNIT_MILLION` – The word "million".
    - `PATTERN_N_MILLION` – Pattern for 1M–9M.
    - `PATTERN_NN_MILLION` – Pattern for 10M–99M.
    - `PATTERN_NNN_MILLION` – Pattern for 100M–999M.
    - `PATTERN_MILLION_HEAD` – Constructing the leading "million" block.
    - `PATTERN_MILLION_TAIL` – Appending the remaining thousands/hundreds block.
- Stage 9: Billions
    - `UNIT_BILLION` – The word "billion".
    - `PATTERN_N_BILLION` – Pattern for 1B–9B.
    - `PATTERN_NN_BILLION` – Pattern for 10B–99B.
    - `PATTERN_NNN_BILLION` – Pattern for 100B–999B.
    - `PATTERN_BILLION_HEAD` – Constructing the leading "billion" block.
    - `PATTERN_BILLION_TAIL` – Appending the remaining millions block.
- Stage 10: Trillions (1 Fact)
    - `UNIT_TRILLION` – The word "trillion" (Pattern logic is reused from previous levels).

Add this to `docs/your-language.md` as well.
