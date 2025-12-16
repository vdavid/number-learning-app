# Agent guidelines

Quick reference for AI agents working on this codebase.

## Project overview

Number trainer: a reflex trainer web app for mastering numbers in foreign languages. Uses FSRS spaced repetition.
Currently supports Sino-Korean numbers.

## Tech stack

React 19, TypeScript 5.9, Zustand, Tailwind CSS 4, Vitest, pnpm

## Commands

```bash
pnpm format && pnpm tsc --noEmit && pnpm knip && pnpm lint:fix && pnpm test --run && pnpm test:e2e # All-around helpful
pnpm dev          # Start dev server
pnpm build        # Production build
```

## Directory structure

```
src/
├── features/           # Vertical slices (languages, level-selector, session)
├── shared/             # Reusable code (components, hooks, stores, types)
├── App.tsx             # Root component
└── index.css           # Global styles + Tailwind tokens
scripts/                # Audio/curriculum generation scripts
docs/                   # Architecture, style guide, how-tos
```

## Documentation index

- `docs/architecture.md` — Directory structure, state management, data flow
- `docs/style-guide.md` — Writing style, code conventions, commit messages
- `docs/adding-a-language.md` — How to add a new language module

## Code style (enforced by Prettier + ESLint + knip)

**Prettier**:

- Single quotes, no semicolons
- 4-space indent
- Trailing commas everywhere
- 120 char line width

**ESLint (strict TypeScript)**:

- **No `any`** — use `unknown` or proper types
- **No unused variables** — remove or prefix with `_`
- **No floating promises** — always `await` or `.catch()`
- **No unsafe operations** — no `as any`, no untyped assignments
- **Import order enforced** — builtin → external → internal → relative, alphabetized
- **No console** (warning) — remove before committing or use a logger
- **Complexity max 15** — split large functions

**knip**:

- **No unused files and exports** — all exported items must be imported somewhere

## Code conventions

- **Functional only** — no classes anywhere, use modules and pure functions
- **`const` everything** — unless it makes code unnecessarily verbose
- **Function names start with verbs** — `getUser`, `handleClick`, `parseNumber`
- **camelCase** for all variables/constants, including module-level
- **Minimal exports** — only export what other modules need
- **Co-located tests** — `foo.test.ts` next to `foo.ts`

## JSDoc philosophy

Only add JSDoc that provides value:

- ❌ Don't document `getName` with "Gets the name"
- ❌ Don't repeat TypeScript types in `@param`/`@returns`
- ✅ Document caveats, formats (`YYYY-MM-DD`), constraints (`must end with /`)
- ✅ Consider renaming before adding a comment

## Writing style

- IMPORTANT: Sentence case for all titles and labels!
- Active voice, friendly tone, no jargon
- Use contractions (I'm, don't) to make it friendly
- Oxford comma
- See `docs/style-guide.md` for the full guide!

## State management

Three Zustand stores in `src/shared/stores/`:

1. **progress-store** — FSRS card data, stage unlocking (persisted)
2. **session-store** — current game state, queue (in-memory)
3. **settings-store** — user preferences (persisted)

## Logging

Use `logger` instead of `console.*`:

```ts
import { createDebugLogger, logger } from '@/shared/utils/logger'

logger.info('User started session') // Always logs with [INFO] prefix
logger.debug('Card state:', card) // Only logs when debug mode is enabled
logger.warn('Deprecated API used')
logger.error('Failed to load audio')
const log = createDebugLogger('app:tts')
log('Playing audio for %d', number) // Namespaced logs for debug mode only
```

Debug logs are enabled in dev mode.

## Adding a language

See `docs/adding-a-language.md`.
