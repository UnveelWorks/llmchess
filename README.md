# ♟️ LLM Chess

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)

A modern chess playground where you can play against Large Language Models or watch two AI opponents battle each other. Built with React, TypeScript, and powered by various LLMs through OpenRouter.

## ✨ Features

- 🤖 **Human vs AI**: Play chess against state-of-the-art language models
- ⚔️ **AI vs AI**: Watch two different AI models compete against each other
- 🎨 **Modern UI**: Clean, responsive interface with smooth animations
- 🔧 **Multiple Models**: Support for OpenAI GPT, Anthropic Claude, and Google Gemini models
- 🎯 **Real-time Gameplay**: Instant move validation and game state updates
- 💾 **Persistent Storage**: Game state and API keys stored locally

## 🎮 Supported AI Models

### OpenAI
- GPT-5 Mini
- GPT-4.1 & GPT-4.1 Mini/Nano
- GPT-4o & GPT-4o Mini
- o4-mini & o3-mini

### Anthropic
- Claude 3.7 Sonnet
- Claude 3.5 Sonnet & Haiku

### Google
- Gemini 2.5 Pro & Flash
- Gemini 2.0 Flash
- Gemini 1.5 Pro

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/llmchess.git
   cd llmchess
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Configuration

1. Click on the settings/profile icon in the header
2. Enter your OpenRouter API key
3. Start a new game and select your preferred game mode and AI model

## 🎯 Game Modes

### Human vs AI
- Choose to play as white or black pieces
- Select from 13+ different AI models
- Each model has unique playing styles and strengths

### AI vs AI
- Watch two AI models compete
- Select different models for white and black pieces
- Perfect for comparing AI strategies and capabilities

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── board/          # Chess board components
│   ├── modal/          # Modal dialogs
│   └── ...
├── helpers/            # Utility functions
│   ├── aisdk.ts        # AI model integration
├── data/               # Static data and prompts
├── store/              # State management
├── types.d.ts          # TypeScript type definitions
└── pages/              # Application pages
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug Reports**: Found a bug? [Open an issue](https://github.com/yourusername/llmchess/issues)
- 💡 **Feature Requests**: Have an idea? [Start a discussion](https://github.com/yourusername/llmchess/discussions)
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📚 **Documentation**: Help improve docs, add examples, or write tutorials
- 🎨 **UI/UX**: Suggest design improvements or accessibility enhancements

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed
4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow the existing TypeScript/React patterns
- **Commits**: Use clear, descriptive commit messages
- **PRs**: Include a description of what your PR does and why
- **Testing**: Ensure your changes don't break existing functionality
- **Documentation**: Update README or add comments for complex logic

### Good First Issues

Look for issues labeled `good first issue` to get started. These are typically:
- UI improvements
- Bug fixes
- Documentation updates
- New AI model integrations

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [chess.js](https://github.com/jhlywa/chess.js) for chess game logic
- [OpenRouter](https://openrouter.ai/) for AI model access
- [Vercel AI SDK](https://sdk.vercel.ai/) for seamless AI integration
- The chess and AI communities for inspiration and feedback

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/yourusername/llmchess/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/llmchess/discussions)

---

<div align="center">
  <strong>Made with ♟️ for chess and AI enthusiasts</strong>
</div>