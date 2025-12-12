# Number trainer

![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)
![React](https://img.shields.io/badge/react-19.2-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A reflex trainer web app for mastering numbers in foreign languages. Train your brain to understand and speak numbers instantly, not just translate them.

## Overview

Number trainer helps you build reflexes for numbers in foreign languages. Instead of mentally translating "오십사" → "fifty-four" → 54, you'll learn to instantly recognize 오십사 as 54.

The app uses spaced repetition (FSRS algorithm) to optimize your learning, with two practice modes:
- **Listen mode**: Hear a number, type the digits
- **Speak mode**: See a number, say it aloud

Currently supports **Sino-Korean** numbers. The architecture supports adding more languages.

## Getting started

### Prerequisites

- **Node.js** 20+ 
- **pnpm** 9+

### Installation

```bash
git clone <repo-url>
cd number-learning-app
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building

```bash
pnpm build
pnpm preview
```

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

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

