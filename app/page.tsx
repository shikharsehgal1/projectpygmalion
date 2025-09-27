"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const agentRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [streamId, setStreamId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [buttonStates, setButtonStates] = useState({
    connect: false,
    ask: false,
    speak: false
  });

  const handleButtonClick = (buttonName: keyof typeof buttonStates, action: () => void) => {
    setButtonStates(prev => ({ ...prev, [buttonName]: true }));
    setTimeout(() => {
      setButtonStates(prev => ({ ...prev, [buttonName]: false }));
    }, 200);
    action();
  };

  useEffect(() => {
    const initializeAgent = async () => {
      if (!videoRef.current) return;
      try {
        setConnecting(true);
        // Dynamic import to avoid SSR issues with D-ID SDK
        const agentModule = await import("@/lib/agent");
        agentRef.current = agentModule;
        
        await agentModule.initAgent(videoRef.current);
        const id = agentModule.streamId();
        setStreamId(id || "N/A");
        console.log("streamId:", id);
        setReady(true);
      } catch (error) {
        console.error("Failed to initialize agent:", error);
      } finally {
        setConnecting(false);
      }
    };

    initializeAgent();
    
    return () => { 
      if (agentRef.current) {
        agentRef.current.disconnect();
      }
    };
  }, []);

  const handleConnect = () => {
    if (!ready && !connecting) {
      setConnecting(true);
      // Reconnection logic would go here
      setTimeout(() => {
        setConnecting(false);
        setReady(true);
      }, 2000);
    }
  };

  const handleAsk = () => {
    if (ready && input.trim() && agentRef.current) {
      agentRef.current.chat(input).then(() => setInput(""));
    }
  };

  const handleSpeak = () => {
    if (ready && agentRef.current) {
      agentRef.current.speak("Hello! I'm speaking live from the retro interface.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header Panel */}
        <div className="retro-panel rounded-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-300 mb-2" style={{ fontFamily: 'IBM Plex Mono, monospace' }}>
              LISA AVATAR
            </h1>
            <div className="text-sm text-gray-500" style={{ fontFamily: 'VT323, monospace' }}>
              MODEL: D-ID-88 • SERIES: PYGMALION
            </div>
          </div>
        </div>

        {/* Main Control Panel */}
        <div className="retro-panel rounded-lg p-8">
          {/* Video Display */}
          <div className="mb-8">
            <div className="led-display rounded px-3 py-1 mb-4 inline-block">
              <span className="text-lg pulse-glow">● VIDEO DISPLAY</span>
            </div>
            <div className="crt-screen aspect-video relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover rounded-lg relative z-0"
                autoPlay
                muted={false}
                playsInline
                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Status Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="led-display rounded p-3">
              <div className="text-xs mb-1">CONNECTION STATUS</div>
              <div className={`text-lg font-bold ${ready ? 'text-green-400' : connecting ? 'led-amber' : 'led-red'} pulse-glow`}>
                {ready ? '● ONLINE' : connecting ? '◐ CONNECTING' : '○ OFFLINE'}
              </div>
            </div>
            
            <div className="led-display rounded p-3">
              <div className="text-xs mb-1">STREAM ID</div>
              <div className="text-sm font-mono text-green-400 pulse-glow">
                {streamId || 'WAITING...'}
              </div>
            </div>
            
            <div className="led-display rounded p-3">
              <div className="text-xs mb-1">SYSTEM MODE</div>
              <div className="text-lg font-bold text-green-400 pulse-glow">
                ● INTERACTIVE
              </div>
            </div>
          </div>

          {/* Control Interface */}
          <div className="space-y-4">
            {/* Data Input */}
            <div>
              <div className="led-display rounded px-3 py-1 mb-2 inline-block">
                <span className="text-sm">DATA ENTRY</span>
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="ENTER COMMAND OR QUERY..."
                className="retro-input w-full px-4 py-3 rounded text-lg"
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleButtonClick('ask', handleAsk);
                  }
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleButtonClick('connect', handleConnect)}
                disabled={ready || connecting}
                className={`retro-button px-6 py-4 rounded text-lg font-bold text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStates.connect ? 'button-blink' : ''}`}
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${ready ? 'bg-green-400' : connecting ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                  <span>CONNECT</span>
                </div>
              </button>

              <button
                onClick={() => handleButtonClick('ask', handleAsk)}
                disabled={!ready || !input.trim()}
                className={`retro-button px-6 py-4 rounded text-lg font-bold text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStates.ask ? 'button-blink' : ''}`}
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>EXECUTE</span>
                </div>
              </button>

              <button
                onClick={() => handleButtonClick('speak', handleSpeak)}
                disabled={!ready}
                className={`retro-button px-6 py-4 rounded text-lg font-bold text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStates.speak ? 'button-blink' : ''}`}
                style={{ fontFamily: 'IBM Plex Mono, monospace' }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span>VOICE TEST</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-4 border-t border-gray-600">
            <div className="text-center text-xs text-gray-500" style={{ fontFamily: 'VT323, monospace' }}>
              TEAM LISA • TRACKS: BEST AVATAR, BEST MEMORY • D-ID AGENTS SDK v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}