# Voice-Controlled Minecraft Bot with OpenAI Agents SDK

This project integrates voice control with your Minecraft bot using the OpenAI Agents SDK and MCP (Model Context Protocol). You can now control your Minecraft bot using natural voice commands!

## 🎯 Features

- **Voice Control**: Speak natural language commands to control your Minecraft bot
- **Real-time Processing**: Uses OpenAI's Realtime API for instant voice processing
- **MCP Integration**: Leverages all available MCP tools for comprehensive bot control
- **Web Interface**: Beautiful, responsive web interface for voice control
- **Secure Connection**: Uses ephemeral keys for secure browser-to-API communication
- **Cross-platform**: Works on Windows, macOS, and Linux

## 🚀 Quick Start

### Prerequisites

1. **Node.js 16+** and **npm**
2. **Python 3.8+**
3. **OpenAI API Key** with Realtime API access
4. **Minecraft Server** running and accessible

### Installation

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd minecraft-ai-bot
   ```

2. **Create environment file:**
   ```bash
   echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
   ```

3. **Install dependencies:**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies
   pip install -r requirements_voice.txt
   ```

4. **Start the voice controller:**
   ```bash
   # On macOS/Linux:
   ./start_voice_controller.sh
   
   # On Windows:
   start_voice_controller.bat
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎤 Voice Commands

The voice agent understands natural language commands and converts them to MCP tool calls:

### Movement Commands
- "Move forward" → `move-in-direction` tool
- "Jump" → `jump` tool
- "Fly to 100 64 200" → `fly-to` tool
- "Look at the player" → `look-at` tool

### Inventory Commands
- "Show my inventory" → `list-inventory` tool
- "Find diamonds" → `find-item` tool
- "Equip my sword" → `equip-item` tool

### Building Commands
- "Place a stone block" → `place-block` tool
- "Dig this block" → `dig-block` tool
- "What block is this?" → `get-block-info` tool

### Communication Commands
- "Say hello everyone" → `send-chat` tool
- "Read the chat" → `read-chat` tool

### Information Commands
- "Where am I?" → `get-position` tool
- "What gamemode am I in?" → `detect-gamemode` tool

## 🏗️ Architecture

The voice control system consists of several components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Voice Server   │    │   MCP Server    │
│                 │    │   (Node.js)      │    │   (Node.js)     │
│ - Voice Input   │◄──►│ - WebSocket      │◄──►│ - Minecraft     │
│ - WebRTC        │    │ - Command Conv.  │    │ - Bot Control   │
│ - UI            │    │ - Tool Execution │    │ - Tool Calls    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ OpenAI Realtime │    │   Python Agent   │    │  Minecraft      │
│      API        │    │   (Optional)     │    │   Server        │
│ - Voice Proc.   │    │ - Key Generation │    │ - Game World    │
│ - AI Processing │    │ - MCP Bridge     │    │ - Bot Actions   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
minecraft-ai-bot/
├── voice_mcp_agent.py          # Python voice agent with MCP integration
├── voice_server.js            # Node.js server for voice processing
├── voice_interface.html       # Web interface for voice control
├── package.json              # Node.js dependencies
├── requirements_voice.txt    # Python dependencies
├── start_voice_controller.sh # macOS/Linux startup script
├── start_voice_controller.bat # Windows startup script
├── VOICE_SETUP.md            # Detailed setup guide
└── README_VOICE.md           # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with:

```bash
# Required: OpenAI API Key for voice processing
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# Optional: Herdora API Key for command conversion
HERDORA_API_KEY=your-herdora-api-key-here
```

### MCP Server Configuration

The MCP server can be configured with:

- **Port**: Default 39613 (configurable)
- **Username**: Bot username in Minecraft
- **Host**: Server hostname (default: localhost)

### Voice Agent Configuration

The voice agent supports:

- **Model**: Uses `gpt-realtime` for voice processing
- **Tools**: All available MCP tools are automatically integrated
- **Instructions**: Customizable agent behavior and responses

## 🛠️ Development

### Adding New Voice Commands

To add new voice commands, modify the `convertVoiceToMCPTools` function in `voice_server.js`:

```javascript
async convertVoiceToMCPTools(voiceCommand) {
    const command = voiceCommand.toLowerCase();
    
    // Add your custom commands here
    if (command.includes('your custom command')) {
        return [{ tool: 'your-mcp-tool', args: { your: 'args' } }];
    }
    
    // ... existing commands
}
```

### Extending MCP Tools

The system automatically integrates with all MCP tools. To add new tools:

1. Update the MCP server with new tools
2. The voice agent will automatically recognize them
3. Add voice command mappings in `voice_server.js`

### Customizing the Web Interface

The web interface (`voice_interface.html`) can be customized:

- **Styling**: Modify the CSS in the `<style>` section
- **Functionality**: Extend the JavaScript in the `<script>` section
- **Layout**: Update the HTML structure

## 🔒 Security

- **Ephemeral Keys**: Temporary keys that expire quickly
- **Local Server**: Voice server runs locally for security
- **HTTPS**: Use HTTPS in production environments
- **API Key Protection**: Keep your OpenAI API key secure

## 🐛 Troubleshooting

### Common Issues

1. **"Ephemeral key generation failed"**
   - Check your OpenAI API key
   - Ensure Realtime API access
   - Verify internet connection

2. **"MCP server not found"**
   - Install Node.js and npm
   - Run `npm install`
   - Check MCP server availability

3. **"Microphone access denied"**
   - Allow microphone access in browser
   - Check browser permissions
   - Try refreshing the page

4. **"Connection failed"**
   - Verify ephemeral key
   - Check internet connection
   - Ensure OpenAI API accessibility

### Debug Mode

Enable debug logging:

```bash
# Python agent
DEBUG=1 python voice_mcp_agent.py

# Node.js server
DEBUG=1 npm start
```

## 📚 API Reference

### Voice Server Endpoints

- `GET /` - Serve the voice interface
- `GET /health` - Health check
- `POST /start-mcp` - Start MCP server
- `POST /stop-mcp` - Stop MCP server
- `POST /execute-tool` - Execute MCP tool

### WebSocket Messages

- `voice_command` - Process voice command
- `mcp_tool_call` - Execute MCP tool
- `tools_generated` - Tools generated from voice
- `tool_result` - Result from tool execution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for the Agents SDK and Realtime API
- The MCP community for the Minecraft server
- Contributors and testers

## 📞 Support

For support and questions:

1. Check the troubleshooting section
2. Review the setup guide
3. Check browser console logs
4. Review server logs
5. Open an issue on GitHub

---

**Happy voice-controlled Minecraft building! 🎮🎤**