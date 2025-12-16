# Contributing

Thanks for your interest in contributing this game! You're most welcome to do so. The easiest way to contribute is to
fork the repo, make your changes, and submit a PR. This doc is here to help you get started.

This doc focuses on development processes. See the [architecture docs](docs/architecture.md) for more info on the
project structure.

See also [AGENTS.md](AGENTS.md) for processes and guidelines written for the robots.

## Running the app locally in dev mode

- Make sure you have **Node.js** 20+ and **pnpm** 9+
- `git clone https://github.com/vdavid/number-learning-app` to clone the repo
- `cd number-learning-app` to enter the new dir
- `pnpm install` to install deps
- `pnpm dev` to start the dev server
- Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building for production

- `pnpm build` to build for prod
- `pnpm preview` to preview the production build

## Scripts

- `pnpm format && pnpm tsc --noEmit && pnpm knip && pnpm lint:fix && pnpm test && pnpm test:e2e` - Run all checks
- `pnpm dev` - Start dev server
- `pnpm format:check && pnpm lint` - Run Prettier and ESLint without fixing
- `pnpm knip` - Check for unused files and exports

## Debugging

Debug logging is auto-enabled in dev mode. You can also enable it in production by either adding `?debug` to the URL, or
setting `localStorage.debug = '1'` in the browser console.

### Logging

The app uses a centralized logger in `src/shared/utils/logger.ts`:

```ts
import { logger } from '@/shared/utils/logger'

logger.debug('Only in debug mode')
logger.info('Always logs')
logger.warn('Warning')
logger.error('Error')
```

### Line-by-line debugging

TODO document this

## Adding a new language

See [docs/adding-a-language.md](docs/adding-a-language.md) for detailed instructions.
