# D-ID Agent Integration Web App

A Next.js TypeScript application for interacting with D-ID AI agents through voice and text input.

## Features

- **Voice Interaction**: Record audio using your microphone and send it directly to D-ID agents
- **Text Chat**: Type messages to communicate with the AI agent
- **Real-time Transcript**: View conversation history with timestamps
- **Video Avatar**: Placeholder for D-ID agent video stream
- **Responsive Design**: Modern, mobile-friendly interface

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# D-ID API Configuration
DID_BASIC_AUTH=your_base64_encoded_credentials
DID_AGENT_ID=your_agent_id
DID_STREAM_ID=your_stream_id
```

To get your `DID_BASIC_AUTH`:
1. Go to [D-ID API Console](https://console.d-id.com/)
2. Get your API key from the account settings
3. Encode your credentials in base64 format: `username:api_key`
4. You can use this command: `echo -n "username:api_key" | base64`

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open Application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/agent-input/route.ts    # API endpoint for D-ID integration
│   ├── page.tsx                    # Main application page
│   └── layout.tsx                  # Root layout
├── components/
│   └── ChatBox.tsx                 # Chat interface component
├── lib/
│   └── did.ts                      # D-ID API utilities
└── README.md
```

## Usage

### Voice Input
1. Click and hold the microphone button
2. Speak your message
3. Release the button to send (or wait 5 seconds for auto-stop)
4. Audio is sent directly to D-ID agents for processing

### Text Input
1. Type your message in the text input field
2. Press Enter or click the send button
3. Text is sent to D-ID agents as a text script

## API Integration

The app integrates with D-ID Agents API:

- **Audio Input**: Sends audio as base64 data URL to the `/input` endpoint
- **Text Input**: Sends text messages to the same endpoint
- **Authentication**: Uses Basic Auth with credentials from environment variables

## Key Components

### ChatBox Component
- Handles microphone recording using MediaRecorder API
- Manages conversation transcript state
- Sends both audio and text to the backend API

### D-ID Utility Library
- Provides functions for API communication
- Handles authentication and error management
- Supports both audio and text script types

### API Route
- Processes multipart/form-data for audio files
- Handles JSON payloads for text input
- Forwards requests to D-ID Agents API

## Browser Compatibility

- Requires modern browsers with MediaRecorder API support
- Needs microphone permissions for voice recording
- WebRTC support needed for future video streaming

## Development Notes

- The video element currently shows a placeholder
- WebRTC connection initialization is stubbed for future implementation
- Audio is converted to base64 for transmission (consider file upload for production)
- Error handling includes user feedback in the transcript

## Production Considerations

- Implement proper file upload handling for audio
- Add WebRTC video streaming integration
- Include proper error boundaries and loading states
- Consider audio compression and format optimization
- Add user authentication and session management