# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # TypeScript check (tsc -b) + Vite production build
npm run lint      # ESLint across the project
npm run preview   # Preview production build locally
```

No test framework is configured.

## Architecture

LLM Chess is a React 19 + TypeScript app (built with Vite + SWC) that lets users play chess against LLMs or watch two LLMs play each other. All LLM calls go through the OpenRouter API.

### Key Layers

**State management** — Two Zustand stores in `src/store/store.ts`:
- `useGameStore`: wraps a `chess.js` Chess instance; manages board state, turns, move history, and game-over conditions. The Chess instance is module-scoped (singleton), and `getFen()` is exported separately to read the current FEN.
- `useSettingsStore`: holds OpenRouter API key, retry count, and custom prompts. Hydrated from localStorage on app load.

**AI move generation** — `src/helpers/aisdk.ts` defines the `AISDK` class and the `Models` array (OpenAI, Anthropic, Google models). It uses Vercel AI SDK's `generateObject()` with Zod schema validation through the OpenRouter provider. The move generation loop lives in `src/pages/Home.tsx`: when it's an AI player's turn, a `useEffect` fires, prompts the LLM with the current FEN, validates the returned move against `chess.js` legal moves, and retries with a correction prompt if invalid (up to the configured retry count).

**Prompts** — System prompts for move generation and move correction are in `src/data/prompts.ts`. Users can override these via settings.

**Persistence** — `src/storage/storage.ts` provides a typed localStorage wrapper for settings (API keys, retries, prompts).

**Routing** — React Router with a single route: `Home.tsx` renders the game page under `App.tsx` (which provides the header, toast container, and settings hydration).

### Component Hierarchy

`App.tsx` → `Header` + `<Outlet>` (renders `Home.tsx`)
`Home.tsx` → `Board` + `GameInfo` + `NewGameModal` + `PromotionPopup`

`Board.tsx` handles the 8x8 grid rendering, drag-and-drop piece movement, move highlights, and board flipping (when playing as black). `GameInfo.tsx` shows the sidebar with player info and move history.

### Patterns

- **Result type for error handling**: `src/helpers/tryCatch.ts` wraps promises into `{data, error}` tuples.
- **Zod schema validation**: LLM responses are validated against a Zod schema (`{move: string, offerDraw: boolean, resign: boolean}`).
- **Refs for non-reactive state**: `Home.tsx` uses refs (`lastTurn`, `previousInvalidMoves`, `retriesRef`) to track AI retry state without triggering re-renders.
- **All styling is Tailwind CSS** (v4, using the Vite plugin). No separate CSS modules.
- **Images are WebP** in `public/images/`, preloaded in `index.html`.
