"use client";

import { useState, useEffect } from 'react';
import ChatBox from '@/components/ChatBox';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Placeholder for WebRTC connection initialization
    const initializeWebRTC = async () => {
      try {
        // TODO: Initialize WebRTC connection to D-ID Agent stream
        console.log('WebRTC connection succeeded (placeholder)');
        setIsConnected(true);
      } catch (error) {
        console.error('WebRTC connection failed:', error);
      }
    };

    initializeWebRTC();
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
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-slate-600">
                {isConnected ? 'Connected' : 'Disconnected'}
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
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  playsInline
                  poster="https://images.pexels.com/photos/2182863/pexels-photo-2182863.jpeg?auto=compress&cs=tinysrgb&w=800"
                >
                  {/* Placeholder for D-ID Agent stream */}
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">
                      AI Agent
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-white rounded-2xl shadow-lg">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}