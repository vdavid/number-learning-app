# Agent guidelines

Quick reference for AI agents working on this codebase.

## Project overview

Number learning app: an SRS web app for learning numbers in a foreign language. Uses FSRS spaced repetition. Currently
teaches Sino-Korean and Swedish numbers. Deployed as several PWAs, one for each language. In dev mode, all languages are
served from a single PWA, and a language selector is at the top-left.

### Tech stack

React 19, TypeScript 5.9, Zustand, Tailwind CSS 4, Vitest, pnpm.

## More docs

- `docs/adding-a-language.md` — How to add a new language module
- `docs/architecture.md` — Dir structure, state management, data flow
- `docs/style-guide.md` — Writing style, code conventions, commit messages

### Directory structure

```
docs/                   # Architecture, style guide, how-tos
e2e/                    # End-to-end tests
public/                 # Static assets: favicon and audio files
scripts/                # Audio and curriculum generation scripts
src/
├── game/               # Game screens
│   ├── level-selector/ # Home screen with learning path
│   ├── session/        # Game loop (Listen/Speak modes)
│   └── settings/       # Settings screen
├── languages/          # Language definitions (Sino-Korean, Swedish, etc.)
├── curriculum/         # Curriculum data and types
├── srs/                # Spaced repetition stores (progress, session)
├── ui/                 # Reusable UI components
├── utils/              # Utility functions (logger, etc.)
├── App.tsx             # Root component
└── index.css           # Global styles + Tailwind tokens
```

## Processes and tooling

### Code style

- **Prettier**: Single quotes, no semi, 4-space indent, trailing commas everywhere, 120 char line width.
- **ESLint (strict TypeScript)**: No `any`, no unused vars, prefer `const` over `let`, no floating promises (always
  `await`, `void`, or `.catch()`), no unsafe operations, no untyped assignments, import order enforced: builtin →
  external → internal → relative, alphabetized, no console\*\* (remove before committing, or use `logger`), complexity
  max. 15 (enforced!)
- **knip**: No unused files and exports.
- **More rules:** Use modules no classes, use pure functions. `const` over `let`. Func names start with verbs. camelCase
  for all vars AND ALL constants! Tests like `foo.test.ts` placed next to `foo.ts`.
- **Writing style**: IMPORTANT: Sentence case for all titles and labels! In all comms, incl. docs and messages! Active
  voice, friendly tone, no jargon. Use contractions ("I'm", "don't"). Oxford comma.

Load the [style guide](docs/style-guide.md) into your context and strictly keep it in mind if you're doing any
non-trivial changes to the repo.

### Commands

```bash
pnpm format && pnpm tsc --noEmit && pnpm knip && pnpm lint:fix && pnpm test --run && pnpm test:e2e # All-around helpful
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm playwright test -g "test name" --repeat-each=10 --workers=1 # Run a single test 10 times
```

## State management

Three Zustand stores:

1. **progress-store** (`src/srs/`) — FSRS card data, stage unlocking (persisted)
2. **session-store** (`src/srs/`) — current game state, queue (in-memory)
3. **settings-store** (`src/game/settings/`) — user preferences (persisted)

## Logging

Use `logger` instead of `console.*`:

```ts
import { createDebugLogger, logger } from '@/utils/logger'

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

## Writing a PR description

When asked to write a PR description, compare the git changes with `git log main..HEAD --pretty=format:"%h %s%n%b"`,
check a `git diff main..HEAD --stat` and do a deeper git diff to understand the key changes. Then write a title and desc
based on the [style guide](docs/style-guide.md). Return it in a Markdown block for easy copying.
