# MaxAgentStream 🐰

An interactive AI streaming application featuring Max, the lovable rabbit mascot from Giggles Academy! Built with React, Three.js, Express, and WebSocket for real-time communication.

## Features

* **3D Interactive Character**: Max comes to life with animations and emotions
* **Real-time Chat**: WebSocket-based communication for instant responses
* **AI-Powered Responses**: Integration with OpenAI or Anthropic for intelligent conversations
* **Text-to-Speech**: Audio responses for an immersive experience
* **Emotion Analysis**: Max reacts with appropriate emotions to conversations
* **BNB Chain Integration**: Wallet connection and blockchain features

## Tech Stack

* **Frontend**: React, TypeScript, Three.js, React Three Fiber
* **Backend**: Express, Node.js, WebSocket
* **AI Services**: OpenAI GPT-3.5 / Anthropic Claude
* **Styling**: Tailwind CSS, Radix UI
* **3D Graphics**: Three.js, React Three Drei

## Getting Started

### Prerequisites

* Node.js 18 or higher
* npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SolClaude33/ai16cz.git
cd ai16cz
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```env
# Required: At least one AI service API key
OPENAI_API_KEY=your_openai_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_key_here

# Optional
NODE_ENV=development
PORT=5000
```

### Running Locally

For Windows:

```bash
$env:NODE_ENV="development"; npx tsx server/index.ts
```

For Linux/Mac:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Set environment variables in Vercel dashboard:  
   * `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`  
   * `NODE_ENV=production`

### Environment Variables

| Variable            | Description                              | Required           |
| ------------------- | ---------------------------------------- | ------------------ |
| OPENAI\_API\_KEY    | OpenAI API key for GPT responses and TTS | One of the AI keys |
| ANTHROPIC\_API\_KEY | Anthropic API key for Claude responses   | One of the AI keys |
| NODE\_ENV           | Environment (development/production)     | No                 |
| PORT                | Server port (default: 5000)              | No                 |

## Project Structure

```
MaxAgentStream/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── contexts/    # React contexts
│   └── public/          # Static assets (3D models, animations)
├── server/              # Backend Express server
│   ├── index.ts         # Main server file
│   ├── routes.ts        # WebSocket routes
│   ├── ai-service.ts    # AI integration
│   └── emotion-analyzer.ts
├── shared/              # Shared TypeScript types
└── vercel.json          # Vercel deployment config

```

## Features in Detail

### 3D Character Animation

* Idle, talking, thinking, and emotion-based animations
* Smooth transitions between animation states
* Real-time lip-sync with audio responses

### AI Integration

* Supports both OpenAI and Anthropic models
* Automatic fallback between providers
* Context-aware responses about crypto and blockchain

### WebSocket Communication

* Real-time bidirectional communication
* Viewer count tracking
* Rate limiting (5-second cooldown per user)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Acknowledgments

* Max character from Giggles Academy
* Built for educational purposes on BNB Chain

## About

ai16cz.vercel.app

