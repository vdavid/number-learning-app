# Architecture overview

This document describes the high-level architecture of the number learning app.

## Tech stack

- **React 19** with TypeScript
- **Vite 7** for builds and dev server
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **ts-fsrs** for spaced repetition scheduling
- **Motion** (Framer Motion) for animations
- **PWA** ready with offline support

## Project structure

The codebase is organized into modules under `src/`:

```
src/
├── game/               # Game screens
│   ├── level-selector/ # Home screen with learning path
│   ├── session/        # Game loop (Listen/Speak modes)
│   └── settings/       # Settings screen
├── languages/          # Language definitions (Sino-Korean, Swedish, etc.)
├── curriculum/         # Curriculum data and types
├── srs/                # Spaced repetition stores (progress, session)
├── ui/                 # Reusable UI components
├── utils/              # Utility functions
└── App.tsx             # Main app with routing
```

Each module contains related components, hooks, logic, and co-located tests.

## Key concepts

### Modules

- `game/` — Game screens (level-selector, session, settings)
- `languages/` — Pluggable language definitions
- `curriculum/` — Curriculum data and types
- `srs/` — Spaced repetition stores
- `ui/` — Reusable UI components
- `utils/` — Utility functions

### Languages

Languages are pluggable modules that define:

- **Curriculum**: The learning stages and which numbers they contain
- **Normalizer**: Converts between numbers and spoken words
- **Metadata**: TTS/STT language codes, display name, flag

See [adding-a-language.md](adding-a-language.md) for how to add new languages.

### State management

We use Zustand for state management with three stores:

1. **Progress store** (`progress-store.ts`)
    - Persisted to localStorage
    - Tracks all cards and their FSRS scheduling data
    - Manages stage unlocking

2. **Session store** (`session-store.ts`)
    - In-memory only (not persisted)
    - Tracks current session state (queue, current card, input)

3. **Settings store** (`settings-store.ts`)
    - Persisted to localStorage
    - User preferences (current language, quiet mode)

### FSRS integration

We use [ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) for spaced repetition scheduling:

- **Card states**: new → learning → review (with relearning on lapses)
- **Rating**: Based on response time (< 2s = Easy, ≥ 2s = Good, wrong = Again)
- **Scheduling**: Cards are due when their `due` date passes

### Decay visualization

The "rotting" visual system shows card freshness:

- **locked**: Stage not unlocked – Gray, locked icon
- **new**: Not yet practiced – Pulsing white
- **gold**: Recently reviewed, high stability – Gold glow
- **faded**: Due within 7 days – Muted
- **rusty**: Overdue (> 7 days) – Brown, warning dot

## Data flow

### Starting a session

```
User clicks "Start learning"
    ↓
Progress store: getDueCards() + getNewCards()
    ↓
Session store: startSession(cards)
    ↓
Navigate to /session
    ↓
SessionScreen renders Listen or Speak mode based on card.mode
```

### Answering a card

```
User types/speaks answer
    ↓
Compare to expected (Listen: digits match, Speak: parsed number matches)
    ↓
Calculate rating (Easy/Good/Again based on correctness + time)
    ↓
Progress store: reviewCard(cardId, rating)
    ↓
FSRS schedules next review
    ↓
Session store: nextCard()
```

## Styling

We use Tailwind CSS 4 with custom design tokens defined in `index.css`:

- **Colors**: Dark theme with cyan accent
- **Typography**: Outfit (display), JetBrains Mono (numbers)
- **Animations**: CSS keyframes + Motion library

## PWA

The app is PWA-ready with:

- Service worker (via vite-plugin-pwa)
- Offline support
- Install prompt
- App manifest

## Testing

We use Vitest for testing:

```bash
pnpm test          # Watch mode
pnpm test --run    # Single run
pnpm test:coverage # With coverage report
```

Tests are co-located with source files (`*.test.ts`).
