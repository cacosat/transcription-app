'use client'

import { useState, useEffect } from 'react';
import { Upload, Settings, FileText, Code, RotateCcw, Copy, Download } from 'lucide-react';
import { handleTranscribe } from './actions';

export default function Home() {
  // file
  const [file, setFile] = useState(null);

  // transcription config
  const [diarization, setDiarization] = useState(false);
  const [language, setLanguage] = useState('');
  const [groupSegments, setGroupSegments] = useState(true);
  const [outputFormat, setOutputFormat] = useState('segments_only');
  const [numSpeakers, setNumSpeakers] = useState('');
  const [prompt, setPrompt] = useState('');

  // transcription result
  const [loading, setLoading] = useState(false);
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [rawTranscription, setRawTranscription] = useState('');
  const [formattedTranscription, setFormattedTranscription] = useState('');
  const [activeTab, setActiveTab] = useState('formatted');

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      console.log(`uploaded fil succesfully:`, uploadedFile)
    }
  };

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
              
              {/* File Upload Section */}
              <UploadFile file={file} handleFileUpload={handleFileUpload} />

              {/* Transcription functionality */}
              <Transcription 
                diarization={diarization}
                setDiarization={setDiarization}
                language={language}
                setLanguage={setLanguage}
                groupSegments={groupSegments}
                setGroupSegments={setGroupSegments}
                outputFormat={outputFormat}
                setOutputFormat={setOutputFormat}
                numSpeakers={numSpeakers}
                setNumSpeakers={setNumSpeakers}
                prompt={prompt}
                setPrompt={setPrompt}
                handleTranscribe={handleTranscribe}
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

function UploadFile ({file, handleFileUpload}) {

  return (
    <div>
      <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">
        Upload Audio
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">MP3, MP4, WAV up to 10MB</p>
        </div>
      </div>
      {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
    </div>
  )
}

function Transcription({ 
  language, 
  setLanguage, 
  diarization, 
  setDiarization,
  groupSegments,
  setGroupSegments,
  outputFormat,
  setOutputFormat,
  numSpeakers,
  setNumSpeakers,
  prompt,
  setPrompt,
  handleTranscribe
}) {
  const handleSubmit = async () => {
    let data;
    const result = await handleTranscribe(data);
  }

  return (
    <>
      {/* <div>
        <h2 className="text-lg font-medium text-gray-900">Transcription Settings</h2>
        <div className="mt-3 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Language
            </label>
            <p className="text-gray-500 text-sm">Use 2 letter designation (e.g. "en" or "es")</p>
            <input
              type="text"
              name="language"
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 p-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="e.g., English, Spanish, French"
            />
          </div>
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="diarization"
                  name="diarization"
                  type="checkbox"
                  checked={diarization}
                  onChange={(e) => setDiarization(e.target.checked)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="diarization" className="font-medium text-gray-700">
                  Diarization
                </label>
                <p className="text-gray-500">Enable speaker identification</p>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <form>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-900 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleSubmit}
          >
          <Settings className="mr-2 h-4 w-4" />
          Transcribe
        </button>
      </form>
    </>
  )
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