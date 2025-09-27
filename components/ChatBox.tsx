"use client";

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranscriptEntry {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
}

export default function ChatBox() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);

  const addToTranscript = useCallback((type: 'user' | 'agent', content: string) => {
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
    };
    setTranscript(prev => [...prev, newEntry]);
  }, []);

  const sendAudioToAgent = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/agent-input', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.ok) {
        addToTranscript('user', '🎤 User spoke');
      } else {
        console.error('Failed to send audio to agent:', result.error);
        addToTranscript('user', '❌ Failed to send audio');
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      addToTranscript('user', '❌ Error sending audio');
    } finally {
      setIsProcessing(false);
    }
  }, [addToTranscript]);

  const sendTextToAgent = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/agent-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      
      if (result.ok) {
        addToTranscript('user', text);
        setTextInput('');
      } else {
        console.error('Failed to send text to agent:', result.error);
        addToTranscript('user', `❌ Failed to send: "${text}"`);
      }
    } catch (error) {
      console.error('Error sending text:', error);
      addToTranscript('user', `❌ Error sending: "${text}"`);
    } finally {
      setIsProcessing(false);
    }
  }, [addToTranscript]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        sendAudioToAgent(audioBlob);
        
        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);

      // Set silence timeout (5 seconds)
      silenceTimer.current = setTimeout(() => {
        if (mediaRecorder.current && isRecording) {
          stopRecording();
        }
      }, 5000);
    } catch (error) {
      console.error('Error starting recording:', error);
      addToTranscript('user', '❌ Failed to access microphone');
    }
  }, [isRecording, sendAudioToAgent, addToTranscript]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
    }
  }, [isRecording]);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    sendTextToAgent(textInput);
  }, [textInput, sendTextToAgent]);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Conversation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Transcript */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {transcript.length === 0 ? (
              <div className="text-center text-slate-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your AI agent</p>
                <p className="text-sm mt-2">Use the microphone or text input below</p>
              </div>
            ) : (
              transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-3 ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      entry.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {entry.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-75">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{entry.content}</p>
                  </div>
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex justify-center">
                <div className="bg-slate-100 rounded-2xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-slate-600">Processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Controls */}
        <div className="space-y-3 border-t pt-4">
          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!textInput.trim() || isProcessing}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Voice Input */}
          <div className="flex justify-center">
            <Button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              disabled={isProcessing}
              variant={isRecording ? "destructive" : "outline"}
              size="lg"
              className="rounded-full h-14 w-14"
            >
              {isRecording ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-center text-slate-500">
            Hold to record • Release to send • Auto-stops after 5s
          </p>
        </div>
      </CardContent>
    </Card>
  );
}