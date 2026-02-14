'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { ArrowLeft, RefreshCw, ExternalLink, Settings, Maximize2, Minimize2, PencilRuler } from 'lucide-react';
import VisualEditorOverlay from '@/components/VisualEditorOverlay';
import { useRouter, useSearchParams } from 'next/navigation';

function SimulationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);

  // Get URLs from query parameters
  const frontendUrl = searchParams.get('frontend') || 'http://localhost:5001';
  const backendUrl = searchParams.get('backend') || 'http://localhost:5000';
  const projectName = searchParams.get('project') || 'My Project';

  // Debug logging
  console.log('Simulation page params:', { frontendUrl, backendUrl, projectName });

  // Create a unique key for this simulation session to prevent caching
  const simulationKey = `${projectName}-${frontendUrl}-${Date.now()}`;

  // Add cache-busting parameter to prevent loading cached content
  const cacheBustUrl = `${frontendUrl}${frontendUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;

  useEffect(() => {
    // Reset state when project changes to prevent cached data issues
    setIsLoading(true);
    setError(null);
    setIsFullscreen(false);
    setRefreshKey(0);
    setEditMode(false);
    setIsEditorOpen(false);
    setHoveredSelector(null);

    let retryCount = 0;
    const maxRetries = 10;

    // Check if the Flask server is ready by trying to fetch the URL
    const checkServerReady = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(frontendUrl + '?t=' + Date.now(), {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // If we get here, the server is responding
        console.log('Server is responding, stopping loading');
        setIsLoading(false);
        return;
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch timeout, retrying...');
        } else {
          console.log('Fetch error:', error);
        }

        retryCount++;
        if (retryCount < maxRetries) {
          // Server not ready yet, try again in 1 second
          setTimeout(checkServerReady, 1000);
        } else {
          // Give up after max retries
          console.log('Max retries reached, stopping loading with error');
          setIsLoading(false);
          setError('Application may be running but not accessible via iframe. Try opening in a new tab.');
        }
      }
    };

    // Start checking immediately
    checkServerReady();

    // Fallback: stop loading after 15 seconds regardless
    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Application may be running but not accessible via iframe. Try opening in a new tab.');
      }
    }, 15000);

    return () => clearTimeout(fallbackTimer);
  }, [simulationKey, frontendUrl, isLoading]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const openEditor = () => setIsEditorOpen(true);
  const closeEditor = () => setIsEditorOpen(false);

  // Toggle simple visual editor overlays inside iframe (non-intrusive)
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    let doc: Document | null = null;
    try {
      doc = iframe.contentDocument;
    } catch (e) {
      // Cross-origin iframe, cannot access document
      setHoveredSelector('Hover requires same-origin preview. Use Edit Website to inspect elements.');
      return;
    }
    if (!win || !doc) {
      setHoveredSelector('Hover requires same-origin preview. Use Edit Website to inspect elements.');
      return;
    }

    // If edit mode is off, ensure no listeners and hide any overlay
    if (!editMode) {
      const existing = doc.getElementById('__ms_editor_overlay__') as HTMLDivElement | null;
      if (existing) existing.style.display = 'none';
      return;
    }

    const overlayId = '__ms_editor_overlay__';
    let overlay = doc.getElementById(overlayId) as HTMLDivElement | null;
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.id = overlayId;
      overlay.style.position = 'fixed';
      overlay.style.pointerEvents = 'none';
      overlay.style.border = '2px dashed #3b82f6';
      overlay.style.borderRadius = '4px';
      overlay.style.display = 'none';
      overlay.style.zIndex = '2147483647';
      doc.body.appendChild(overlay);
    }

    const moveHandler = (e: MouseEvent) => {
      if (!editMode) { overlay!.style.display = 'none'; return; }
      const target = e.target as HTMLElement;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      overlay!.style.display = 'block';
      overlay!.style.left = `${rect.left}px`;
      overlay!.style.top = `${rect.top}px`;
      overlay!.style.width = `${rect.width}px`;
      overlay!.style.height = `${rect.height}px`;
      let sel = target.tagName.toLowerCase();
      if (target.id) sel += `#${target.id}`;
      if (target.className) sel += `.${String(target.className).trim().split(/\s+/).join('.')}`;
      setHoveredSelector(sel);
    };
    const dblHandler = (_e: MouseEvent) => {
      if (!editMode) return;
      // Do not prevent underlying app dblclicks; just open editor
      openEditor();
    };

    doc.addEventListener('mousemove', moveHandler, true);
    doc.addEventListener('dblclick', dblHandler, true);
    return () => {
      doc.removeEventListener('mousemove', moveHandler, true);
      doc.removeEventListener('dblclick', dblHandler, true);
    };
  }, [editMode, refreshKey]);

  const handleBackToIDE = () => {
    const q = projectName ? `?project=${encodeURIComponent(projectName)}` : '';
    router.push(`/ide${q}`);
  };

  const handleOpenInNewTab = () => {
    window.open(frontendUrl, '_blank');
  };

  return (
    <div className={`h-screen bg-mono-black flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Header */}
      <div className="bg-mono-sidebar-bg border-b border-mono-border-grey px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
                  <button
            onClick={handleBackToIDE}
            className="flex items-center space-x-2 text-mono-medium-grey hover:text-mono-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to IDE</span>
                  </button>

          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-mono-medium-grey">Live Preview</span>
              </div>
            </div>

        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2 text-xs text-mono-medium-grey">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected to backend</span>
            </div>

          {/* Controls */}
                <button
            onClick={handleRefresh}
            className="p-2 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
                </button>

          <button
            onClick={handleOpenInNewTab}
            className="p-2 text-mono-medium-grey hover:text-mono-white transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={16} />
                </button>

          <button
            onClick={handleFullscreen}
            className="p-2 text-mono-medium-grey hover:text-mono-white transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

      {/* Project Info */}
      <div className="bg-mono-sidebar-bg border-b border-mono-border-grey px-4 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-mono-white">{projectName}</h1>
            <div className="flex items-center space-x-4 text-xs text-mono-medium-grey">
              <span>Frontend: {frontendUrl}</span>
              <span>Backend: {backendUrl}</span>
                </div>
                </div>

          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-green-600 text-mono-white text-xs rounded-sm">
              Running
                </div>
              </div>
            </div>
          </div>

      {/* Live Preview with left editor rail, center preview, and right chat */}
      <div className="flex-1 relative bg-mono-dark-bg flex">
        {/* Left editor rail */}
        <div className="w-64 border-r border-mono-border-grey bg-mono-sidebar-bg p-3 hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-mono-white">Visual Editor</div>
            <button
              onClick={() => setEditMode(v => !v)}
              className={`px-2 py-1 text-xs rounded-sm flex items-center gap-1 ${editMode ? 'bg-mono-accent-blue text-mono-white' : 'bg-mono-dark-bg text-mono-white hover:bg-mono-sidebar-bg'}`}
              title="Toggle Edit Mode"
            >
              <PencilRuler size={14} /> {editMode ? 'Editing' : 'Edit'}
            </button>
          </div>
          <button
            onClick={openEditor}
            className="w-full mb-3 px-3 py-2 rounded-sm bg-mono-accent-blue text-mono-white text-sm"
            title="Edit your website visually"
          >
            Edit Website
          </button>
          <div className="space-y-2 text-xs">
            <div className="text-mono-medium-grey">Hovered</div>
            <div className="p-2 bg-mono-dark-bg border border-mono-border-grey rounded-sm min-h-[40px] text-[10px] break-all text-mono-white">{hoveredSelector || '—'}</div>
            <div className="pt-2 text-mono-medium-grey">Quick actions</div>
            <button className="w-full px-2 py-1 bg-mono-dark-bg rounded-sm text-mono-white hover:bg-mono-sidebar-bg flex items-center gap-1" onClick={handleRefresh}>
              <RefreshCw size={12} /> Refresh preview
            </button>
            <a className="block w-full px-2 py-1 bg-mono-dark-bg rounded-sm text-mono-white hover:bg-mono-sidebar-bg text-center" href={cacheBustUrl} target="_blank">Open frontend</a>
                </div>
              </div>

        {/* Center preview area */}
        <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-mono-dark-bg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mono-accent-blue mx-auto mb-4"></div>
              <p className="text-mono-white">Loading your application...</p>
              <p className="text-sm text-mono-medium-grey mt-2">Starting servers and connecting to backend</p>
                              </div>
                            </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-mono-sidebar-bg">
            <div className="text-center">
              <div className="text-mono-destructive-red text-lg font-semibold mb-2">Connection Error</div>
              <p className="text-mono-medium-grey">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-mono-destructive-red text-mono-white rounded-sm hover:bg-mono-destructive-red/80"
              >
                Retry Connection
              </button>
                            </div>
                          </div>
        ) : (
          <div className="w-full h-full relative">
            <iframe
              key={refreshKey}
              src={cacheBustUrl}
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Live Application Preview"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Failed to load application in iframe. This may be due to cross-origin restrictions.');
                setIsLoading(false);
              }}
            />
            {error && (
              <div className="absolute inset-0 bg-mono-dark-bg bg-opacity-90 flex items-center justify-center">
                <div className="text-center p-8 bg-mono-sidebar-bg rounded-sm shadow-lg max-w-md border border-mono-border-grey">
                  <div className="text-mono-destructive-red text-lg font-semibold mb-4">Preview Unavailable</div>
                  <p className="text-mono-white mb-4">
                    The application is running but cannot be displayed in this preview due to browser security restrictions.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-mono-medium-grey">Your app is running at:</p>
                    <code className="block bg-mono-dark-bg p-2 rounded-sm text-sm text-mono-white border border-mono-border-grey">{cacheBustUrl}</code>
                  </div>
                  <button
                    onClick={() => window.open(cacheBustUrl, '_blank')}
                    className="mt-4 px-6 py-2 bg-mono-accent-blue text-mono-white rounded-sm hover:bg-mono-accent-blue/80 transition-colors"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
                        </div>


                      </div>

      <VisualEditorOverlay isOpen={isEditorOpen} onClose={closeEditor} projectName={projectName} />

      {/* Footer with additional controls */}
      <div className="bg-mono-sidebar-bg border-t border-mono-border-grey px-4 py-2">
        <div className="flex items-center justify-between text-xs text-mono-medium-grey">
          <div className="flex items-center space-x-4">
            <span>Real-time preview with live reload</span>
            <span>•</span>
            <span>Changes in IDE will auto-refresh</span>
                      </div>

          <div className="flex items-center space-x-2">
            <span>Powered by MechaStream Editor</span>
          </div>
        </div>

        {/* Right rail removed per request */}
          </div>
        </div>
  );
}

export default function SimulationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] text-gray-400">Loading…</div>}>
      <SimulationPageContent />
    </Suspense>
  );
}