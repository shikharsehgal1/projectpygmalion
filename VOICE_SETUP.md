# Voice Minecraft Controller Setup Guide

This guide will help you set up voice control for your Minecraft bot using the OpenAI Agents SDK and MCP (Model Context Protocol).

## Prerequisites

1. **Node.js and npm** (version 16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version` and `npm --version`

2. **Python 3.8+**
   - Download from [python.org](https://python.org/)
   - Verify installation: `python --version`

3. **OpenAI API Key**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - You'll need access to the Realtime API

4. **Minecraft Server**
   - Your Minecraft server should be running and accessible
   - The bot should be able to connect to it

## Installation Steps

### 1. Install Python Dependencies

```bash
# Install Python dependencies for voice control
pip install -r requirements_voice.txt
```

### 2. Install Node.js Dependencies

```bash
# Install Node.js dependencies for the voice server
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# OpenAI API Key (required for voice agent)
OPENAI_API_KEY=your-openai-api-key-here

# Optional: Herdora API Key (if using Herdora for command conversion)
HERDORA_API_KEY=your-herdora-api-key-here
```

### 4. Start the Voice Server

```bash
# Start the Node.js voice server
npm start
```

This will start the server on `http://localhost:3000`

## Usage Instructions

### Method 1: Using the Web Interface (Recommended)

1. **Start the voice server:**
   ```bash
   npm start
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

3. **Generate an ephemeral key:**
   - Run the Python script to generate an ephemeral key:
   ```bash
   python voice_mcp_agent.py
   ```
   - Copy the generated ephemeral key (starts with `ek_`)

4. **Connect to the voice agent:**
   - Enter the ephemeral key in the web interface
   - Click "Connect"
   - Wait for the connection to establish

5. **Start voice control:**
   - Click "Start Listening"
   - Allow microphone access when prompted
   - Start speaking your Minecraft commands!

### Method 2: Using the Python Voice Agent Directly

1. **Start the MCP server:**
   ```bash
   python voice_mcp_agent.py
   ```

2. **Follow the prompts to:**
   - Enter the port (default: 39613)
   - Enter the bot username (default: MyBot)

3. **The script will:**
   - Generate an ephemeral key
   - Start the MCP server
   - Display instructions for using the web interface

## Voice Commands

The voice agent supports various Minecraft commands:

### Basic Movement
- "Move forward" - Move forward
- "Move back" - Move backward
- "Jump" - Make the bot jump
- "Fly to 100 64 200" - Fly to specific coordinates

### Inventory Management
- "Show inventory" - List bot's inventory
- "Find diamonds" - Search for diamond items
- "Equip sword" - Equip a sword

### Block Operations
- "Place stone block" - Place a stone block
- "Dig block" - Break the block in front
- "Get block info" - Get information about a block

### Communication
- "Say hello" - Send a chat message
- "Read chat" - Read recent chat messages

### Position and Information
- "Where am I?" - Get current position
- "What gamemode?" - Check current gamemode

## Troubleshooting

### Common Issues

1. **"Ephemeral key generation failed"**
   - Check your OpenAI API key in the `.env` file
   - Ensure you have access to the Realtime API
   - Verify your internet connection

2. **"MCP server not found"**
   - Make sure Node.js and npm are installed
   - Run `npm install` to install dependencies
   - Check that the MCP server package is available

3. **"Microphone access denied"**
   - Allow microphone access in your browser
   - Check browser permissions
   - Try refreshing the page

4. **"Connection failed"**
   - Verify the ephemeral key is correct
   - Check your internet connection
   - Ensure the OpenAI Realtime API is accessible

### Debug Mode

To run with debug logging:

```bash
# Python voice agent with debug
DEBUG=1 python voice_mcp_agent.py

# Node.js server with debug
DEBUG=1 npm start
```

## File Structure

```
minecraft-ai-bot/
├── voice_mcp_agent.py          # Python voice agent
├── voice_server.js            # Node.js voice server
├── voice_interface.html       # Web interface
├── package.json              # Node.js dependencies
├── requirements_voice.txt    # Python dependencies
├── .env                      # Environment variables
└── VOICE_SETUP.md           # This setup guide
```

## Advanced Configuration

### Custom Voice Commands

You can extend the voice command recognition by modifying the `convertVoiceToMCPTools` function in `voice_server.js`.

### MCP Tool Integration

The system automatically integrates with all available MCP tools:
- Position and movement tools
- Inventory management tools
- Block interaction tools
- Entity interaction tools
- Communication tools
- Game state tools

### Security Notes

- Ephemeral keys are temporary and expire quickly
- Always use HTTPS in production
- Keep your API keys secure
- The voice server runs locally for security

## Support

If you encounter issues:

1. Check the console logs in your browser
2. Review the server logs in the terminal
3. Verify all dependencies are installed
4. Ensure your OpenAI API key has the necessary permissions

## Next Steps

- Customize voice commands for your specific needs
- Add more sophisticated command recognition
- Integrate with additional MCP tools
- Set up automated voice command processing
