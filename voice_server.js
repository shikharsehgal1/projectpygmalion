#!/usr/bin/env node
/**
 * Voice MCP Server
 * Bridges voice commands from OpenAI Agents SDK to MCP tools
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const path = require('path');

class VoiceMCPServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        this.mcpProcess = null;
        this.clients = new Set();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    
    setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
    }
    
    setupRoutes() {
        // Serve the voice interface
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'voice_interface.html'));
        });
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                mcpConnected: this.mcpProcess !== null,
                clients: this.clients.size 
            });
        });
        
        // Start MCP server
        this.app.post('/start-mcp', (req, res) => {
            const { port = '39613', username = 'MyBot' } = req.body;
            
            if (this.mcpProcess) {
                return res.json({ success: true, message: 'MCP server already running' });
            }
            
            try {
                this.startMCPServer(port, username);
                res.json({ success: true, message: 'MCP server started' });
            } catch (error) {
                res.json({ success: false, message: error.message });
            }
        });
        
        // Stop MCP server
        this.app.post('/stop-mcp', (req, res) => {
            if (this.mcpProcess) {
                this.mcpProcess.kill();
                this.mcpProcess = null;
                res.json({ success: true, message: 'MCP server stopped' });
            } else {
                res.json({ success: false, message: 'MCP server not running' });
            }
        });
        
        // Execute MCP tool call
        this.app.post('/execute-tool', async (req, res) => {
            const { tool, args } = req.body;
            
            if (!this.mcpProcess) {
                return res.json({ success: false, message: 'MCP server not running' });
            }
            
            try {
                const result = await this.executeMCPTool(tool, args);
                res.json({ success: true, result });
            } catch (error) {
                res.json({ success: false, message: error.message });
            }
        });
    }
    
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('New WebSocket client connected');
            this.clients.add(ws);
            
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleWebSocketMessage(ws, data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                    ws.send(JSON.stringify({ 
                        type: 'error', 
                        message: 'Invalid message format' 
                    }));
                }
            });
            
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }
    
    async handleWebSocketMessage(ws, data) {
        switch (data.type) {
            case 'voice_command':
                await this.handleVoiceCommand(ws, data.command);
                break;
            case 'mcp_tool_call':
                await this.handleMCPToolCall(ws, data.tool, data.args);
                break;
            default:
                ws.send(JSON.stringify({ 
                    type: 'error', 
                    message: 'Unknown message type' 
                }));
        }
    }
    
    async handleVoiceCommand(ws, command) {
        console.log('Processing voice command:', command);
        
        // Convert voice command to MCP tool calls
        const tools = await this.convertVoiceToMCPTools(command);
        
        if (tools && tools.length > 0) {
            ws.send(JSON.stringify({
                type: 'tools_generated',
                tools: tools
            }));
            
            // Execute tools sequentially
            for (const toolCall of tools) {
                const result = await this.executeMCPTool(toolCall.tool, toolCall.args);
                ws.send(JSON.stringify({
                    type: 'tool_result',
                    tool: toolCall.tool,
                    args: toolCall.args,
                    result: result
                }));
            }
        } else {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Could not convert voice command to MCP tools'
            }));
        }
    }
    
    async handleMCPToolCall(ws, tool, args) {
        try {
            const result = await this.executeMCPTool(tool, args);
            ws.send(JSON.stringify({
                type: 'tool_result',
                tool: tool,
                args: args,
                result: result
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    }
    
    async convertVoiceToMCPTools(voiceCommand) {
        // This would typically use OpenAI to convert voice commands to MCP tools
        // For now, we'll use a simple mapping
        const command = voiceCommand.toLowerCase();
        
        if (command.includes('move forward') || command.includes('go forward')) {
            return [{ tool: 'move-in-direction', args: { direction: 'forward', duration: 1000 } }];
        } else if (command.includes('move back') || command.includes('go back')) {
            return [{ tool: 'move-in-direction', args: { direction: 'backward', duration: 1000 } }];
        } else if (command.includes('jump')) {
            return [{ tool: 'jump', args: {} }];
        } else if (command.includes('inventory') || command.includes('show items')) {
            return [{ tool: 'list-inventory', args: {} }];
        } else if (command.includes('position') || command.includes('where am i')) {
            return [{ tool: 'get-position', args: {} }];
        } else if (command.includes('hello') || command.includes('say hello')) {
            return [{ tool: 'send-chat', args: { message: 'Hello from voice control!' } }];
        } else if (command.includes('place') && command.includes('block')) {
            return [{ tool: 'place-block', args: { x: '~', y: '~', z: '~' } }];
        } else if (command.includes('dig') || command.includes('break')) {
            return [{ tool: 'dig-block', args: { x: '~', y: '~', z: '~' } }];
        } else {
            // Default to sending as chat message
            return [{ tool: 'send-chat', args: { message: voiceCommand } }];
        }
    }
    
    startMCPServer(port, username) {
        console.log(`Starting MCP server on port ${port} with username ${username}`);
        
        this.mcpProcess = spawn('npx', [
            'github:LuisSalvadorHeysen/minecraft-mcp-server#main',
            '--host', 'localhost',
            '--port', port,
            '--username', username
        ], {
            stdio: ['pipe', 'pipe', 'inherit']
        });
        
        this.mcpProcess.on('error', (error) => {
            console.error('MCP server error:', error);
            this.mcpProcess = null;
        });
        
        this.mcpProcess.on('exit', (code) => {
            console.log(`MCP server exited with code ${code}`);
            this.mcpProcess = null;
        });
        
        // Give the server a moment to start
        setTimeout(() => {
            if (this.mcpProcess && !this.mcpProcess.killed) {
                console.log('MCP server started successfully');
            }
        }, 2000);
    }
    
    async executeMCPTool(toolName, args) {
        if (!this.mcpProcess) {
            throw new Error('MCP server not running');
        }
        
        const mcpMessage = {
            jsonrpc: "2.0",
            id: Date.now(),
            method: "tools/call",
            params: {
                name: toolName,
                arguments: args
            }
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('MCP tool call timeout'));
            }, 10000);
            
            // Send the tool call
            this.mcpProcess.stdin.write(JSON.stringify(mcpMessage) + '\n');
            
            // Listen for response
            const onData = (data) => {
                try {
                    const response = JSON.parse(data.toString().trim());
                    if (response.id === mcpMessage.id) {
                        clearTimeout(timeout);
                        this.mcpProcess.stdout.removeListener('data', onData);
                        
                        if (response.result) {
                            resolve(response.result.content?.[0]?.text || 'Success');
                        } else if (response.error) {
                            reject(new Error(response.error.message || 'MCP tool error'));
                        } else {
                            resolve('No response');
                        }
                    }
                } catch (error) {
                    // Ignore parsing errors for other messages
                }
            };
            
            this.mcpProcess.stdout.on('data', onData);
        });
    }
    
    start(port = 3000) {
        this.server.listen(port, () => {
            console.log(`Voice MCP Server running on http://localhost:${port}`);
            console.log('Open your browser and navigate to the URL above');
            console.log('Make sure to start the MCP server first using the /start-mcp endpoint');
        });
    }
}

// Start the server
const server = new VoiceMCPServer();
server.start(3000);
