"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const agentRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    (async () => {
      if (!videoRef.current) return;
      try {
        // Dynamic import to avoid SSR issues with D-ID SDK
        const agentModule = await import("@/lib/agent");
        agentRef.current = agentModule;
        
        await agentModule.initAgent(videoRef.current);
        console.log("streamId:", agentModule.streamId());
        setReady(true);
      } catch (error) {
        console.error("Failed to initialize agent:", error);
      }
    })();
    return () => { 
      if (agentRef.current) {
        agentRef.current.disconnect();
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
             Project Pygmalion
            </h1>
           <h2 className="text-2xl font-semibold text-slate-700 mb-2">
             Team LISA
           </h2>
           <p className="text-slate-600 mb-2">
             Luis Heysen, Immanuel Peters, Shikhar Sehgal, Angelo Fabrizio Torres Inga
           </p>
           <p className="text-slate-500 font-medium">
             Tracks: Best Avatar, Best Memory
            </p>
            <div className="flex items-center justify-center mt-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${ready ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-600">
                {ready ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Video Avatar Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                AI Agent
              </h2>
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted={false}
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Simple Chat Interface */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Chat with Agent
              </h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && ready && input.trim() && agentRef.current) {
                        agentRef.current.chat(input).then(() => setInput(""));
                      }
                    }}
                  />
                  <button
                    disabled={!ready || !input.trim()}
                    onClick={() => agentRef.current?.chat(input).then(() => setInput(""))}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask
                  </button>
                </div>
                <button
                  disabled={!ready}
                  onClick={() => agentRef.current?.speak("Hello! I'm speaking live.")}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Say "Hello"
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}