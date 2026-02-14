'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Play, Pause, RefreshCw, Settings, Palette, Code, Eye, Download } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function PreviewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPlaying, setIsPlaying] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'code' | 'design'>('preview');

  useEffect(() => {
    // Get project data from URL params or localStorage
    const projectData = searchParams.get('project');
    if (projectData) {
      try {
        const data = JSON.parse(decodeURIComponent(projectData));
        if (data.previewUrl) {
          setPreviewUrl(data.previewUrl);
        }
      } catch (error) {
        console.error('Error parsing project data:', error);
      }
    }
  }, [searchParams]);

  const handleBack = () => {
    router.push('/ide');
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const refreshPreview = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const downloadProject = () => {
    // Implementation for downloading project
    console.log('Downloading project...');
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to IDE</span>
            </button>
            
            <div className="h-6 w-px bg-gray-600"></div>
            
            <h1 className="text-xl font-semibold text-white">Live Preview</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayPause}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button
              onClick={refreshPreview}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            
            <button
              onClick={downloadProject}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 p-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Eye size={16} />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'code'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Code size={16} />
            <span>Code</span>
          </button>
          
          <button
            onClick={() => setViewMode('design')}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
              viewMode === 'design'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Palette size={16} />
            <span>Design</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {viewMode === 'preview' && (
          <div className="flex-1 bg-white">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Live Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Eye size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Preview Available</h3>
                  <p className="text-gray-500">Start by creating a project in the IDE</p>
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'code' && (
          <div className="flex-1 bg-gray-900 p-4">
            <div className="bg-gray-800 rounded-lg p-4 h-full overflow-auto">
              <pre className="text-gray-300 text-sm">
                <code>
                  {/* Code content would go here */}
                  {`// Your project code will appear here
// This is a placeholder for the code view

function App() {
  return (
    <div className="app">
      <h1>Hello World</h1>
    </div>
  );
}`}
                </code>
              </pre>
            </div>
          </div>
        )}

        {viewMode === 'design' && (
          <div className="flex-1 bg-gray-900 p-4">
            <div className="bg-gray-800 rounded-lg p-4 h-full">
              <h3 className="text-white font-medium mb-4">Design Tools</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-2">Colors</h4>
                  <div className="flex space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer"></div>
                    <div className="w-8 h-8 bg-green-500 rounded cursor-pointer"></div>
                    <div className="w-8 h-8 bg-red-500 rounded cursor-pointer"></div>
                    <div className="w-8 h-8 bg-yellow-500 rounded cursor-pointer"></div>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-2">Typography</h4>
                  <select className="w-full bg-gray-600 text-white rounded px-2 py-1 text-sm">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                  </select>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-2">Spacing</h4>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                  />
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-gray-300 font-medium mb-2">Layout</h4>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs">Grid</button>
                    <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs">Flex</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading…</div>}>
      <PreviewPageContent />
    </Suspense>
  );
}
