import * as sdk from "@d-id/client-sdk";

let manager: sdk.AgentManager | null = null;

export async function initAgent(videoEl: HTMLVideoElement) {
  const agentId = process.env.NEXT_PUBLIC_DID_AGENT_ID!;
  const clientKey = process.env.NEXT_PUBLIC_DID_CLIENT_KEY!;

  const callbacks: sdk.AgentManagerCallbacks = {
    // REQUIRED: attach streamed A/V to your <video>
    onSrcObjectReady(src: MediaStream) {
      videoEl.srcObject = src;
      videoEl.play().catch(() => {});
      return src;
    },
    onVideoStateChange(state) { console.log("video:", state); },
    onConnectionStateChange(state) { console.log("conn:", state); },
    onNewMessage(messages, type) { console.log(type, messages); },
    onError(err, data) { console.error("D-ID error", err, data); },
  };

  const streamOptions = { compatibilityMode: "auto", streamWarmup: true };

  manager = await sdk.createAgentManager(agentId, {
    auth: { type: "key", clientKey },
    callbacks,
    streamOptions,
  });

  await manager.connect(); // WebRTC session + chat created
  return manager;
}

export function streamId() { return manager?.stream?.id; } // handy for debugging
export async function chat(msg: string) { return manager!.chat(msg); }   // LLM → TTS → live stream
export async function speak(text: string) { return manager!.speak({ type: "text", input: text }); } // direct TTS
export async function disconnect() { await manager?.disconnect(); manager = null; }