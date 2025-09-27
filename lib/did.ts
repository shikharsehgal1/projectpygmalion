interface AgentInputResponse {
  success: boolean;
  error?: string;
  data?: any;
}

interface AudioScript {
  type: 'audio';
  audio_url: string;
}

interface TextScript {
  type: 'text';
  input: string;
}

type Script = AudioScript | TextScript;

interface AgentInputPayload {
  script: Script;
}

// These would typically come from environment variables
// For now, using placeholder values - user needs to set these in .env.local
const DID_BASE_URL = 'https://api.d-id.com';
const AGENT_ID = process.env.DID_AGENT_ID || 'your-agent-id';
const STREAM_ID = process.env.DID_STREAM_ID || 'your-stream-id';
const BASIC_AUTH = process.env.DID_BASIC_AUTH || '';

async function callDidAPI(payload: AgentInputPayload): Promise<AgentInputResponse> {
  try {
    if (!BASIC_AUTH) {
      return {
        success: false,
        error: 'DID_BASIC_AUTH not configured in environment variables'
      };
    }

    const url = `${DID_BASE_URL}/agents/${AGENT_ID}/streams/${STREAM_ID}/input`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${BASIC_AUTH}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('D-ID API Error:', response.status, errorText);
      return {
        success: false,
        error: `D-ID API error: ${response.status} - ${errorText}`
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error calling D-ID API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function sendAudioToAgent(audioUrl: string): Promise<AgentInputResponse> {
  const payload: AgentInputPayload = {
    script: {
      type: 'audio',
      audio_url: audioUrl
    }
  };

  return await callDidAPI(payload);
}

export async function sendTextToAgent(text: string): Promise<AgentInputResponse> {
  const payload: AgentInputPayload = {
    script: {
      type: 'text',
      input: text
    }
  };

  return await callDidAPI(payload);
}

// Utility function for future WebRTC connection initialization
export async function initializeAgentStream(): Promise<{
  success: boolean;
  error?: string;
  streamUrl?: string;
}> {
  try {
    // Placeholder for WebRTC stream initialization
    // This would typically involve creating a new agent stream session
    console.log('Initializing D-ID Agent stream...');
    
    // TODO: Implement actual stream initialization
    // const response = await fetch(`${DID_BASE_URL}/agents/${AGENT_ID}/streams`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${BASIC_AUTH}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     // stream configuration
    //   }),
    // });
    
    return {
      success: true,
      streamUrl: 'placeholder-stream-url'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize stream'
    };
  }
}