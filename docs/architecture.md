# Architecture overview

This document describes the high-level architecture of the number trainer app.

## Directory structure

```
src/
├── features/           # Feature modules (vertical slices)
│   ├── languages/      # Language definitions
│   │   ├── sino-korean/
│   │   │   ├── curriculum.ts    # Learning stages
│   │   │   ├── normalizer.ts    # Number ↔ word conversion
│   │   │   └── index.ts         # Language definition
│   │   ├── types.ts             # Language interface
│   │   └── index.ts             # Language registry
│   ├── level-selector/ # Home screen feature
│   │   ├── LevelNode.tsx
│   │   └── LevelSelectorScreen.tsx
│   └── session/        # Game loop feature
│       ├── ListenMode.tsx
│       ├── SpeakMode.tsx
│       └── SessionScreen.tsx
├── shared/             # Shared code (used across features)
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks (TTS, STT)
│   ├── stores/         # Zustand state stores
│   └── types/          # TypeScript type definitions
├── App.tsx             # Root component with routing
├── main.tsx            # Entry point
└── index.css           # Global styles and design tokens
```

## Key concepts

### Features

Features are vertical slices of functionality. Each feature:

- Has its own directory under `src/features/`
- Contains all related components, hooks, and logic
- Exports a clean public API via `index.ts`
- Has tests co-located with source files

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

| State    | Meaning                           | Visual             |
| -------- | --------------------------------- | ------------------ |
| `locked` | Stage not unlocked                | Grey, locked icon  |
| `new`    | Not yet practiced                 | Pulsing white      |
| `gold`   | Recently reviewed, high stability | Gold glow          |
| `faded`  | Due soon (within 7 days)          | Muted              |
| `rusty`  | Overdue (> 7 days)                | Brown, warning dot |

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
