<p align="center">
  <img src="public/images/logo.png" alt="LLM Chess" width="120" />
</p>

<h1 align="center">LLM Chess</h1>

<p align="center">
  A modern chess playground where you can play against Large Language Models or watch two AI opponents battle each other.
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19-blue.svg" alt="React"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" alt="TypeScript"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7-646CFF.svg" alt="Vite"></a>
</p>

---

## Features

- **Human vs AI** — Play chess against state-of-the-art language models
- **AI vs AI** — Watch two different AI models compete against each other
- **Agentic Tool Calling** — AI models use structured tool calls (`make_move`, `resign`, `offer_draw`) with enum-constrained legal moves for reliable play
- **30+ AI Models** — Support for OpenAI, Anthropic, Google, Minimax, and MoonshotAI models
- **Custom Prompts** — Override the system prompt to tweak AI behavior and strategy
- **Draw & Resignation** — AI models can offer draws or resign based on position evaluation
- **Modern UI** — Clean, responsive interface with drag-and-drop piece movement and move highlights

## Supported AI Models

### OpenAI
GPT-5.4 / GPT-5.4 Pro / GPT-5.3 / GPT-5.2 / GPT-5.1 / GPT-5 / GPT-5 Mini / o3 / o4 Mini / GPT-4.1 / GPT-4.1 Mini

### Anthropic
Claude Opus 4.6 / Claude Sonnet 4.6 / Claude Sonnet 4.5 / Claude Opus 4 / Claude Sonnet 4 / Claude Haiku 4.5 / Claude 3.5 Haiku

### Google
Gemini 3.1 Pro Preview / Gemini 3.1 Flash Lite Preview / Gemini 3 Pro Preview / Gemini 3 Flash Preview / Gemini 2.5 Pro / Gemini 2.5 Flash / Gemini 2.5 Flash Lite

### Minimax
M2.5

### MoonshotAI
Kimi K2.5 / Kimi K2 / Kimi Dev 72B

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

```bash
git clone https://github.com/UnveelWorks/llmchess.git
cd llmchess
npm install
npm run dev
```

Open `http://localhost:5173` in your browser, enter your OpenRouter API key in settings, and start a game.

## Game Modes

### Human vs AI
Choose to play as white or black, pick an AI model, and play. The board automatically flips when playing as black. Drag-and-drop pieces or click to move.

### AI vs AI
Select different models for white and black, then watch them play. Each model uses agentic tool calling to select moves from the legal moves list.

## How It Works

LLM Chess uses an **agentic tool-calling architecture** for AI move generation:

1. The AI receives the current board position (FEN), whose turn it is, and a list of legal moves
2. Legal moves are passed as a `z.enum()` constraint — the model structurally cannot hallucinate invalid moves
3. The AI calls one of four tools: `get_legal_moves`, `make_move`, `resign`, or `offer_draw`
4. If the agentic path fails, a structured-output fallback (`generateObject`) kicks in
5. As a last resort, a random legal move is selected

All LLM calls go through the [OpenRouter](https://openrouter.ai/) API using the [Vercel AI SDK](https://sdk.vercel.ai/).

## Tech Stack

- **React 19** + **TypeScript 5.9** — UI framework
- **Vite 7** with SWC — Build tooling
- **Zustand** — State management (game state + settings stores)
- **chess.js** — Chess rules and move validation
- **Vercel AI SDK** + **OpenRouter** — LLM integration with tool calling
- **Zod** — Schema validation for AI responses
- **Tailwind CSS v4** — Styling
- **React Router v7** — Routing

## Development

### Project Structure

```
src/
├── components/          # UI components
│   ├── board/           # Chess board rendering & drag-and-drop
│   ├── game_info/       # Game sidebar
│   ├── game_over/       # Game over dialog
│   ├── header/          # App header
│   ├── move_history/    # Move history display
│   ├── new_game_modal/  # New game configuration
│   ├── player_panel/    # Player info panels
│   ├── promotion_popup/ # Pawn promotion UI
│   └── ...              # Button, input, modal, select, etc.
├── data/                # System prompts
├── helpers/             # AI SDK integration, error handling
├── pages/               # Home page (game loop)
├── storage/             # localStorage wrapper
├── store/               # Zustand stores
└── types.d.ts           # Type definitions
```

### Available Scripts

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes, then run `npm run lint && npm run build`
4. Commit and push
5. Open a Pull Request

- Follow the existing TypeScript/React patterns
- Use Tailwind CSS for styling
- Keep commits focused and descriptive

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) — Chess game logic
- [OpenRouter](https://openrouter.ai/) — AI model access
- [Vercel AI SDK](https://sdk.vercel.ai/) — AI integration with tool calling
- [Zustand](https://zustand.docs.pmnd.rs/) — State management

---

<div align="center">
  <img src="public/images/logo.png" alt="LLM Chess" width="24" />
  <strong>Made for chess and AI enthusiasts</strong>
</div>
