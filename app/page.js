'use client'

import { useState, useEffect } from 'react';
import { Upload, Settings, FileText, Code, RotateCcw, Copy, Download } from 'lucide-react';
import { handleTranscribe } from './actions';

export default function Home() {
  // uploadfile
  const [file, setFile] = useState(null);

  // transcription result
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [rawTranscription, setRawTranscription] = useState('');
  const [formattedTranscription, setFormattedTranscription] = useState('');
  const [activeTab, setActiveTab] = useState('formatted');

  const handleUpload = async (event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile)
      console.log('file uploaded succesfully into hook', file)
    }
  }

  const handleRestart = () => {
    setRawTranscription('');
    setFormattedTranscription('');
    setIsTranscribed(false);
    setFile(null);
    setDiarization(false);
    setLanguage('');
  };

  const handleCopy = () => {
    let textToCopy;
    // const textToCopy = ; // activeTab === 'formatted' ? formattedTranscription : rawTranscription
    try {
      textToCopy = JSON.stringify(rawTranscription, null, 2);
    } catch (error) {
      console.error('Error stringifying rawTranscription:', error);
      textToCopy = String(rawTranscription); // Fallback to basic string conversion
    }
    navigator.clipboard.writeText(textToCopy);
  };

  const handleDownload = () => {
    const textToDownload = activeTab === 'formatted' ? formattedTranscription : rawTranscription;
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription_${activeTab}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
            <div className="space-y-6">

              {/* Transcription functionality */}
              <Transcription 
                handleTranscribe={handleTranscribe}
                handleUpload={handleUpload}
                file={file}
              />

              {/* Transcription Results */}
              <TranscriptionResult 
                handleRestart={handleRestart}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isTranscribed={isTranscribed}
                setIsTranscribed={setIsTranscribed}
                handleCopy={handleCopy}
                handleDownload={handleDownload}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function UploadFile ({file, handleUpload}) {
  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        Upload Audio
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex justify-center text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative text-center cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-500">MP3, MP4, WAV up to 10MB</p>
        </div>
      </div>
      {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
    </div>
  )
}

function Transcription() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) {
      console.error('No file selected');
      return;
    }

    // Chunk size (e.g., 5MB)
    const chunkSize = 5 * 1024 * 1024;
    const chunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < chunks; i++) {
      const chunk = file.slice(i * chunkSize, (i + 1) * chunkSize);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64Chunk = e.target.result.split(',')[1]; // Remove the data URL prefix
        
        try {
          const result = await handleTranscribe({
            chunk: base64Chunk,
            fileName: file.name,
            chunkIndex: i,
            totalChunks: chunks,
            prompt: prompt
          });
          
          // Update progress
          setProgress(((i + 1) / chunks) * 100);
          console.log(`Chunk ${i + 1}/${chunks} processed`);
          
          // Handle the result (e.g., update state with partial transcription)
          console.log(result);
        } catch (error) {
          console.error('Error processing chunk:', error);
        }
      };

      reader.readAsDataURL(chunk);
    }

    // Final processing after all chunks are done
    console.log('Transcription complete');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
          Upload Audio
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex justify-center text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
              >
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
              </label>
            </div>
            <p className="text-xs text-gray-500">MP3, MP4, WAV up to 1 hour</p>
          </div>
        </div>
        {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
      </div>
      <div>
        <label htmlFor='prompt' className="block text-sm font-medium text-gray-700">
          Prompt
        </label>
        <p className="text-gray-500 text-sm">Keywords to help the model understand</p>
        <input
          type='text'
          name='prompt'
          placeholder='BCI, stakeholder, usabilidad, Juan'
          className="mt-1 p-1 text-black focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm"
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-900 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Settings className="mr-2 h-4 w-4" />
        Transcribe
      </button>
      {progress > 0 && (
        <div className="mt-4">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Progress: {progress.toFixed(2)}%</p>
        </div>
      )}
    </form>
  );
}

function TranscriptionResult({
  handleRestart,
  activeTab,
  setActiveTab, 
  isTranscribed,
  setIsTranscribed,
  handleCopy,
  handleDownload
}) {

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Transcription Results</h2>
          {isTranscribed && (
            <button
              onClick={handleRestart}
              className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Restart
            </button>
          )}
        </div>
        <div className="mt-3 bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`${
                  activeTab === 'formatted'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('formatted')}
              >
                Formatted
              </button>
              <button
                className={`${
                  activeTab === 'raw'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('raw')}
              >
                Raw
              </button>
            </nav>
          </div>
          <div className="p-4">
            {isTranscribed ? (
              <>
                {activeTab === 'formatted' ? (
                  <div>
                    <FileText className="h-5 w-5 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{formattedTranscription}</p>
                  </div>
                ) : (
                  <div>
                    <Code className="h-5 w-5 text-gray-400 mb-2" />
                    {/* <pre className="text-sm text-gray-500 whitespace-pre-wrap">{rawTranscription}</pre> */}
                  </div>
                )}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">Click the "Transcribe" button to see the results.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}