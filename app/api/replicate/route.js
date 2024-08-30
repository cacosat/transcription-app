import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function POST(req) {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });
    
    try {
      const output = await replicate.run(
        "thomasmol/whisper-diarization:aae6db69a923a6eab6bc3ec098148a8c9c999685be89f428a4a6072fca544d26",
        {
          input: req.body
        }
      );
      return NextResponse.json(output);
    } catch (error) {
      console.error('Replicate API endpoint error:', error);
      return NextResponse.json({error: 'Error processing req to replicate '}, {status: 500})
    }
}