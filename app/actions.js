'use server'

import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function handleTranscribe(data) {
  if (!process.env.REPLICATE_API_KEY) {
    throw new Error('Replicate API key not set');
  }

  try {
    const { chunk, fileName, chunkIndex, totalChunks, prompt } = data;

    // Here, you might want to save the chunk to a temporary file or cloud storage
    // For this example, we'll assume we're working with the base64 data directly

    const input = {
      file: `data:audio/wav;base64,${chunk}`,
      prompt: prompt,
      language: 'es',
      translate: false,
      group_segments: true,
      offset_seconds: 0,
      transcription_output_format: 'segments_only'
    };

    const output = await replicate.run(
      "thomasmol/whisper-diarization:aae6db69a923a6eab6bc3ec098148a8c9c999685be89f428a4a6072fca544d26",
      { input }
    );

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} transcribed`);

    return {
      success: true,
      chunkIndex,
      totalChunks,
      rawTranscription: output,
      formattedTranscription: "This is a placeholder for the formatted transcription. In a real application, this would be the formatted result from the transcription API.",
    };
  } catch (error) {
    console.error('Error during transcription:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}