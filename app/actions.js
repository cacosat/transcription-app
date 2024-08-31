'use server'

import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate ({
    auth: process.env.REPLICATE_API_KEY,
})

export const handleTranscribe = async (event, formData) => {
    event.preventDefault();

    console.log('---')
    console.log('handleTranscribe started');

    if (!process.env.REPLICATE_API_KEY) {
        throw new Error(
            'replicate api not set'
        );
    }

    try {
        // extract relevant data
        const file = formData.get('file');
        // const language = formData.get('language');
        // const diarization = formData.get('diarization');
        // const groupSegments = formData.get('groupSegments');
        // const outputFormat = formData.get('outputFormat');
        // const numSpeakers = formData.get('numSpeakers');
        const prompt = formData.get('prompt');

        const input = {
            file: file,
            prompt: prompt,
            file_url: '',
            language: 'es',
            translate: false,
            group_segments: true,
            offset_seconds: 0,
            transcription_output_format: 'segments_only'
        }

        const output = await replicate.run("thomasmol/whisper-diarization:aae6db69a923a6eab6bc3ec098148a8c9c999685be89f428a4a6072fca544d26", { input });
        
        console.log('Output transcription: ', output)

        return {
            success: true,
            rawTranscription: output,
            formattedTranscription: "This is a placeholder for the formatted transcription. In a real application, this would be the formatted result from the transcription API.",
            isTranscribed: true,
        }
    } catch (error) {
        console.error('Error during transcription:', error.message);
        return {
            success: false,
            error: error.meassage
        }
    } finally {
        // setLoading(false);
    }
};