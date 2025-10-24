# AI4CZ Streaming Platform

## Overview
AI4CZ is an interactive AI-powered streaming platform featuring an advanced AI assistant as a 3D animated character that responds to user messages in real-time in Chinese (中文). Built on BNB Chain, the platform combines live streaming aesthetics with AI chat capabilities. Users can interact with the AI4CZ assistant through a chat interface while viewing an animated 3D character display, creating an engaging live-streaming experience. The official Twitter account is https://x.com/ai4_cz. The platform also displays the BNB Chain smart contract address with copy-to-clipboard functionality.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend uses React 18 with TypeScript, Vite for bundling, and Wouter for routing. UI components are built with Shadcn/ui, Radix UI primitives, and styled with Tailwind CSS, supporting dark/light modes with BNB Chain brand colors. The design system features a high-contrast theme (white backgrounds, dark text) with vibrant accents for emphasis, using Inter, Space Grotesk, and JetBrains Mono fonts. State management utilizes a WebSocket hook for real-time communication, React hooks for local state, React Query for API data, and WalletContext for global BNB wallet authentication. The 3D visualization (CZ3DViewer) is a pure Three.js implementation using GLB format with progressive loading and hybrid format support: it automatically detects and loads both FBX and GLB/GLTF formats. A randomly selected idle animation (from 4 variants) loads first for instant UI availability and visual variety, while remaining emotion models (talking, thinking, angry, celebrating, crazy_dance, confused) load asynchronously in the background. The renderer is optimized with high-performance mode and capped pixel ratio for efficient rendering. A 20-second timeout (increased to accommodate large GLB files) ensures the app displays even if 3D models fail to load, showing a fallback visual. Audio playback uses a FIFO (First-In-First-Out) queue system: when multiple users interact simultaneously, audio responses are automatically queued and played sequentially, preventing overlapping audio and ensuring smooth playback even during high-activity periods.

**3D Model Format:**
- **Current**: GLB format (supports unlimited skinning weights, better performance than FBX)
- **Location**: `client/public/` (10 files: idle.glb, idle2.glb, idle3.glb, idle4.glb, talking.glb, thinking.glb, angry.glb, celebrating.glb, crazy_dance.glb, confused.glb)
- **Random Idle Selection**: On each page load, one of 4 idle animation variants is randomly selected for visual variety
- **Hybrid Loader**: Automatically detects file format by extension and uses appropriate loader (GLTFLoader for .glb/.gltf, FBXLoader for .fbx)
- **File Size**: ~27MB per GLB file

### Backend Architecture
The backend is an Express.js server handling HTTP requests and WebSocket connections for real-time chat. It supports dual AI providers (OpenAI GPT-3.5-turbo and Anthropic Claude Haiku) with a fallback mechanism. The AI assistant is exclusively focused on AI4CZ project topics, maintaining strict conversation boundaries to discuss only AI4CZ-related content. The assistant actively promotes the official Twitter account (https://x.com/ai4_cz) and politely redirects off-topic conversations back to AI4CZ. The AI personality is professional, friendly, and enthusiastic about the AI4CZ project. An emotion-based response system uses sentiment analysis to detect emotional tones, triggering corresponding animations. Data persistence uses Drizzle ORM with PostgreSQL (via Neon) and Zod for schema validation. Real-time communication orchestrates client connections, user messages, AI responses, emotion state updates, and live viewer count tracking.

### Feature Specifications
- **BNB Wallet Authentication**: Users must connect a BNB Chain wallet to send messages, integrating with MetaMask/Web3 wallets. WalletContext manages global authentication state with secure validation and event listeners.
- **Live Viewer Counter**: The server tracks and broadcasts real-time active WebSocket connections to all clients.
- **Text-to-Speech Narration**: CZ's responses are narrated using OpenAI TTS (model: tts-1, voice: "echo" - a friendly voice suitable for CZ's character). Audio is generated server-side, converted to base64, and auto-played in the browser. Animation syncs with audio duration using custom 'czAudioEnded' event, maintaining 'talking' animation while speaking and returning to 'idle' when finished.
- **Rate Limiting**: 5-second cooldown per user between messages to prevent spam, with real-time feedback shown via toast notifications.
- **Contract Address Display**: Displays a BNB Chain smart contract address with copy-to-clipboard functionality and toast notifications.
- **CZ Character Animations**: Features multiple emotion-based 3D animations including idle, talking, thinking, celebrating (happy), angry, crazy_dance (dancing), and confused states that respond dynamically to conversation context and user interactions.
- **High-Contrast Design**: Implements a clean, professional design with pure white backgrounds, dark gray foregrounds, and vibrant colors (BNB Chain yellow, blue, green, red) used sparingly for accents and active states. Dark mode inverts colors with dark backgrounds (9% lightness) and light text (92% lightness).
- **Language**: All application content, AI personality, and UI text are in Chinese (中文), except for the Contract Address section which remains in English for technical clarity.

## External Dependencies

**AI Services:**
- OpenAI API (GPT-3.5-turbo for chat, TTS-1 for voice narration)
- Anthropic API (Claude Haiku)

**Database:**
- PostgreSQL (via Neon serverless driver)

**UI & Styling:**
- Google Fonts: Inter, Space Grotesk, JetBrains Mono
- Radix UI component primitives
- Tailwind CSS

**Development Tools:**
- Replit-specific plugins (for runtime error handling, banners, Cartographer)
