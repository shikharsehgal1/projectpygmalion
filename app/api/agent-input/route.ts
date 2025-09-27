import { NextRequest, NextResponse } from 'next/server';
import { sendAudioToAgent, sendTextToAgent } from '@/lib/did';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle audio input
      const formData = await request.formData();
      const audioFile = formData.get('audio') as File;
      
      if (!audioFile) {
        return NextResponse.json(
          { ok: false, error: 'No audio file provided' },
          { status: 400 }
        );
      }

      // Convert audio file to base64 or handle file upload
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const audioDataUrl = `data:${audioFile.type};base64,${audioBase64}`;

      const result = await sendAudioToAgent(audioDataUrl);
      
      if (result.success) {
        return NextResponse.json({ ok: true });
      } else {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500 }
        );
      }
    } else if (contentType.includes('application/json')) {
      // Handle text input
      const { text } = await request.json();
      
      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          { ok: false, error: 'No text provided' },
          { status: 400 }
        );
      }

      const result = await sendTextToAgent(text);
      
      if (result.success) {
        return NextResponse.json({ ok: true });
      } else {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { ok: false, error: 'Invalid content type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in agent-input API:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}