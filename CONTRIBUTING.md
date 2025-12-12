# Contributing

Thanks for your interest in contributing this game! You're most welcome to do so. The easiest way to contribute is to
fork the repo, make your changes, and submit a PR. This doc is here to help you get started.

## Running the app locally in dev mode

- Make sure you have **Node.js** 20+ and **pnpm** 9+
- `git clone https://github.com/vdavid/number-learning-app` to clone the repo
- `cd number-learning-app` to enter the new dir
- `pnpm install` to install deps
- `pnpm dev` to start the dev server
- Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building

- `pnpm build` to build for production
- `pnpm preview` to preview the production build

## Scripts

| Command        | Description               |
| -------------- | ------------------------- |
| `pnpm dev`     | Start development server  |
| `pnpm build`   | Build for production      |
| `pnpm preview` | Preview production build  |
| `pnpm test`    | Run tests                 |
| `pnpm lint`    | Run ESLint                |
| `pnpm format`  | Format code with Prettier |

## Tech stack

- **React 19** with TypeScript
- **Vite 7** for builds and dev server
- **Tailwind CSS 4** for styling
- **Zustand** for state management
- **ts-fsrs** for spaced repetition scheduling
- **Motion** (Framer Motion) for animations
- **PWA** ready with offline support

## Project structure

```
src/
├── features/           # Feature modules
│   ├── languages/      # Language definitions (Korean, etc.)
│   ├── level-selector/ # Home screen with learning path
│   └── session/        # Game loop (Listen/Speak modes)
├── shared/             # Shared code
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand stores
│   └── types/          # TypeScript types
└── App.tsx             # Main app with routing
```

## Adding a new language

See [docs/adding-a-language.md](docs/adding-a-language.md) for detailed instructions.

The quick version:

1. Create a new directory in `src/features/languages/`
2. Implement the `Language` interface
3. Add the language to the registry in `src/features/languages/index.ts`
