# Project Pygmalion - D-ID Agent Integration

A Next.js TypeScript application for interacting with D-ID AI agents using the official D-ID Agents SDK.

## Features

- **Live Video Avatar**: Real-time D-ID agent video stream via WebRTC
- **Text Chat**: Direct communication with AI agent using LLM
- **Text-to-Speech**: Direct TTS without LLM processing
- **Responsive Design**: Modern, mobile-friendly interface

## Setup Instructions

### 1. D-ID Studio Setup

1. Go to [D-ID Studio](https://studio.d-id.com/)
2. Create your Agent
3. Go to **... → </> Embed**
4. **Allowlist your domain** (e.g., `http://localhost:3000`)
5. Copy the two values: **`data-agent-id`** and **`data-client-key`**

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# D-ID Agents SDK Configuration
NEXT_PUBLIC_DID_AGENT_ID=your_agent_id_here
NEXT_PUBLIC_DID_CLIENT_KEY=your_client_key_here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. Open Application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── page.tsx                    # Main application page with SDK integration
│   └── layout.tsx                  # Root layout
├── lib/
│   └── agent.ts                    # D-ID Agents SDK wrapper
└── README.md
```

## Usage

### Text Input
1. Type your message in the input field
2. Press Enter or click "Ask" button
3. The agent will respond with both voice and video

### Direct Speech
Click "Say Hello" to make the agent speak without LLM processing

## SDK Integration

The app uses the official D-ID Agents SDK:

- **WebRTC Connection**: Direct real-time video/audio stream
- **Chat Method**: `chat(message)` - Agent/LLM responds with voice
- **Speak Method**: `speak(text)` - Direct TTS without LLM
- **Client Key Authentication**: Secure front-end authentication

## Key Components

### Agent SDK Wrapper (`lib/agent.ts`)
- Initializes D-ID Agent Manager with WebRTC
- Handles video stream attachment
- Provides chat and speak methods
- Manages connection lifecycle

### Main Page Component
- Video element for agent stream
- Simple chat interface
- Connection status indicator
 
## Browser Compatibility

- Requires modern browsers with WebRTC support
- HTTPS required (or localhost for development)
- Camera/microphone permissions may be requested

## Important Notes

- **Domain allowlisting is required** in D-ID Studio Embed settings
- The SDK is **front-end only** - Agent/Knowledge management via Studio or API
- WebRTC requires HTTPS in production (localhost works for development)
 
## Team Information

**Project Pygmalion - Team LISA**
- Luis Heysen
- Immanuel Peters  
- Shikhar Sehgal
- Angelo Fabrizio Torres Inga

**Competition Tracks**: Best Avatar, Best Memory