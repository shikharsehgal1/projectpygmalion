#!/usr/bin/env python3
"""
Voice MCP Agent using OpenAI Agents SDK
Integrates voice control with MCP tools for Minecraft bot control
"""

import os
import json
import asyncio
import subprocess
import sys
import signal
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

class VoiceMCPAgent:
    def __init__(self):
        self.openai_client = None
        self.mcp_process = None
        self.setup_openai()
        self.setup_signal_handlers()
    
    def setup_openai(self):
        """Initialize OpenAI client with API key"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Error: OPENAI_API_KEY not found in .env file")
            print("Please add your OpenAI API key to the .env file:")
            print("OPENAI_API_KEY=your-openai-api-key-here")
            sys.exit(1)
        
        self.openai_client = OpenAI(api_key=api_key)
        print("OpenAI client initialized")
    
    def setup_signal_handlers(self):
        """Handle Ctrl+C gracefully"""
        signal.signal(signal.SIGINT, self.signal_handler)
    
    def signal_handler(self, signum, frame):
        """Clean up on Ctrl+C"""
        print("\nShutting down...")
        if self.mcp_process:
            self.mcp_process.terminate()
        sys.exit(0)
    
    def generate_ephemeral_key(self):
        """Generate ephemeral client key for Realtime API"""
        try:
            response = self.openai_client.realtime.client_secrets.create(
                session={
                    "type": "realtime",
                    "model": "gpt-realtime"
                }
            )
            return response.value
        except Exception as e:
            print(f"Error generating ephemeral key: {e}")
            return None
    
    def start_mcp_server(self):
        """Start the MCP server as a subprocess"""
        try:
            # Prompt for port with default
            port_input = input("Enter port (default: 39613): ").strip()
            port = port_input if port_input else "39613"
            
            # Prompt for username with default
            username_input = input("Enter bot username (default: MyBot): ").strip()
            username = username_input if username_input else "MyBot"
            
            print(f"Starting MCP server on port {port} with username {username}...")
            
            self.mcp_process = subprocess.Popen(
                ["npx", "github:LuisSalvadorHeysen/minecraft-mcp-server#main", "--host", "localhost", "--port", port, "--username", username],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=sys.stderr,
                text=True
            )
            print("MCP server started")
            return self.mcp_process
        except FileNotFoundError:
            print("Warning: npx not found. Please install Node.js and npm.")
            return None
        except Exception as e:
            print(f"Error starting MCP server: {e}")
            print("Assuming MCP server is already running.")
            return None
    
    def send_mcp_tool_call(self, tool_name: str, args: dict):
        """Send an MCP tool call to the server and return response"""
        mcp_message = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": args
            }
        }
        
        json_message = json.dumps(mcp_message) + "\n"
        
        if self.mcp_process and self.mcp_process.stdin:
            try:
                # Send tool call
                self.mcp_process.stdin.write(json_message)
                self.mcp_process.stdin.flush()
                
                # Read response
                if self.mcp_process.stdout:
                    try:
                        response = self.mcp_process.stdout.readline()
                        if response:
                            try:
                                response_data = json.loads(response.strip())
                                if "result" in response_data:
                                    return response_data["result"].get("content", [{}])[0].get("text", "No response text")
                                elif "error" in response_data:
                                    return f"Error: {response_data['error'].get('message', 'Unknown error')}"
                            except json.JSONDecodeError:
                                return response.strip()
                        return "No response"
                    except:
                        return "Response read error"
                
                return "Tool call sent successfully"
            except Exception as e:
                return f"Error sending tool call: {e}"
        else:
            return "MCP server not available"
    
    def process_voice_command(self, voice_text: str):
        """Process voice command and convert to MCP tool calls"""
        print(f"Processing voice command: '{voice_text}'")
        
        # Convert voice command to MCP tool calls using OpenAI
        conversion_prompt = f"""You are controlling a Minecraft bot connected to an MCP server. Convert this voice command into MCP tool calls.

Voice command: "{voice_text}"

Available MCP Tools:
- get-position: Get current bot position
- move-to-position: Move to specific coordinates
- fly-to: Fly to specific coordinates
- jump: Make the bot jump
- move-in-direction: Move in a direction for a duration
- look-at: Look at specific coordinates
- list-inventory: List bot's inventory
- find-item: Find item in inventory
- equip-item: Equip an item
- place-block: Place a block at coordinates
- dig-block: Dig a block at coordinates
- get-block-info: Get information about a block
- find-block: Find blocks of a specific type
- find-entity: Find entities of a specific type
- send-chat: Send a chat message
- read-chat: Read recent chat messages
- detect-gamemode: Detect current gamemode

Respond with a JSON array of MCP tool calls. For example:
[
  {{"tool": "get-position", "args": {{}}}},
  {{"tool": "send-chat", "args": {{"message": "/tp @p 100 64 100"}}}}
]

Only respond with the JSON array, no explanations."""

        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Minecraft MCP tool converter. Always respond with valid JSON arrays of MCP tool calls."},
                    {"role": "user", "content": conversion_prompt}
                ],
                max_tokens=512,
                temperature=0.1
            )
            
            content = response.choices[0].message.content.strip()
            
            # Try to parse as JSON
            try:
                tools = json.loads(content)
                if isinstance(tools, list):
                    return tools
                else:
                    print(f"Warning: Response is not a list: {tools}")
                    return [{"tool": "send-chat", "args": {"message": content}}]
            except json.JSONDecodeError:
                print(f"Warning: Could not parse JSON response: {content}")
                return [{"tool": "send-chat", "args": {"message": content}}]
                
        except Exception as e:
            print(f"Error converting voice command: {e}")
            return None
    
    def execute_mcp_tools(self, tools):
        """Execute a list of MCP tool calls"""
        if not tools:
            return
        
        print(f"Executing {len(tools)} MCP tool calls:")
        for i, tool_call in enumerate(tools, 1):
            tool_name = tool_call.get("tool", "unknown")
            args = tool_call.get("args", {})
            
            print(f"Executing tool {i}/{len(tools)}: {tool_name}")
            print(f"Arguments: {json.dumps(args, indent=2)}")
            
            response = self.send_mcp_tool_call(tool_name, args)
            print(f"Response: {response}")
            print("-" * 40)
    
    def run_voice_agent(self):
        """Run the voice agent with ephemeral key generation"""
        print("Voice MCP Agent started!")
        print("This will generate an ephemeral key for voice control.")
        
        # Start MCP server
        self.start_mcp_server()
        
        # Generate ephemeral key
        print("Generating ephemeral client key...")
        ephemeral_key = self.generate_ephemeral_key()
        
        if not ephemeral_key:
            print("Failed to generate ephemeral key. Exiting.")
            return
        
        print(f"Ephemeral key generated: {ephemeral_key[:20]}...")
        print("\nTo use voice control:")
        print("1. Open the voice_interface.html file in your browser")
        print("2. Enter the ephemeral key when prompted")
        print("3. Start speaking your Minecraft commands!")
        print("\nPress Ctrl+C to exit.")
        
        # Keep the agent running
        try:
            while True:
                # For now, we'll wait for the HTML interface to be used
                # In a real implementation, this would handle WebRTC connections
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            self.signal_handler(signal.SIGINT, None)

if __name__ == "__main__":
    agent = VoiceMCPAgent()
    agent.run_voice_agent()
