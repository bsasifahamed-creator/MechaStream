
'use client';

import React, { useState, useEffect } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectLink, setRedirectLink] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('error');
    if (q) setError(decodeURIComponent(q).replace(/\+/g, ' '));
  }, []);

  const runBuild = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      setError('Please enter a short description (e.g. "todo app") first.');
      return;
    }
    if (isLoading) return;

    setError(null);
    setRedirectLink(null);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data: { projectId?: string; projectName?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError('Invalid response from server. Try again.');
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.error || `Server error (${res.status}). Try again.`);
        setIsLoading(false);
        return;
      }

      const projectId = data.projectId ?? data.projectName;
      if (!projectId) {
        setError('No project ID returned. Try again.');
        setIsLoading(false);
        return;
      }

      const ideUrl = `/ide?project=${encodeURIComponent(projectId)}&prompt=${encodeURIComponent(trimmed)}`;
      window.location.replace(ideUrl);
      setError(null);
      setTimeout(() => {
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/ide')) {
          setRedirectLink(ideUrl);
          setIsLoading(false);
        }
      }, 1500);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Start Ollama (ollama serve) or try a shorter prompt.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong. Try again.');
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      e.preventDefault();
      setError('Please enter a short description (e.g. "todo app") first.');
      return;
    }
    e.preventDefault();
    setError(null);
    setRedirectLink(null);
    // Force navigation so output is always generated (avoids form submit being blocked)
    const url = `/api/generate?prompt=${encodeURIComponent(trimmed)}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen w-full bg-mono-black">
      {/* Header Menu */}
      <header className="bg-mono-sidebar-bg border-b border-mono-border-grey">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-mono-accent-blue">MechaStream</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/" className="text-mono-white hover:text-mono-accent-blue transition-colors">Home</a>
              <a href="/ide" className="text-mono-white hover:text-mono-accent-blue transition-colors">Code IDE</a>
              <a href="/simulation" className="text-mono-white hover:text-mono-accent-blue transition-colors">Simulation</a>
              <a href="/export" className="text-mono-white hover:text-mono-accent-blue transition-colors">Export</a>
              <a href="/login" className="text-mono-white hover:text-mono-accent-blue transition-colors">Login</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mono-dark-bg"></div>
        <div className="relative z-10 px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-mono-white sm:text-6xl lg:text-7xl">
              Build anything with
              <span className="block text-mono-accent-blue">
                AI
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-mono-medium-grey sm:text-xl">
              Describe what you want to build. Our AI creates the project, generates the code,
              and opens it in the IDE—ready to edit and run.
            </p>

            {/* Form submits to GET /api/generate?prompt=... so Build works with or without JavaScript */}
            <div className="mt-10">
              <form
                method="get"
                action="/api/generate"
                onSubmit={handleSubmit}
                className="mx-auto max-w-md"
                noValidate
              >
                <div className="flex gap-x-4">
                  <label htmlFor="prompt" className="sr-only">
                    Describe your project
                  </label>
                  <input
                    id="prompt"
                    name="prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Create a task management app..."
                    className="min-w-0 flex-auto rounded-lg border border-mono-border-grey bg-mono-sidebar-bg px-3.5 py-2 text-mono-white shadow-sm placeholder:text-mono-medium-grey focus:ring-2 focus:ring-inset focus:ring-mono-accent-blue sm:text-sm sm:leading-6"
                    autoComplete="off"
                    required
                  />
                  <button
                    type="submit"
                    className="flex-none rounded-lg bg-mono-accent-blue px-3.5 py-2.5 text-sm font-semibold text-mono-white shadow-sm hover:bg-mono-accent-blue/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mono-accent-blue min-w-[5rem] cursor-pointer"
                    aria-label="Build project"
                  >
                    Build
                  </button>
                </div>
              </form>

              {!prompt.trim() && !error && (
                <p className="mt-3 text-sm text-mono-medium-grey">
                  Type a short description above (e.g. &quot;todo app&quot;) then click Build.
                </p>
              )}
              {error && (
                <p
                  role="alert"
                  className="mt-4 text-sm text-mono-destructive-red"
                  style={{ color: '#ef4444', marginTop: '1rem', padding: '0.75rem', background: '#1a1a1a', borderRadius: '6px', border: '1px solid #ef4444' }}
                >
                  {error}
                </p>
              )}
              {redirectLink && (
                <p className="mt-4 text-sm" style={{ marginTop: '1rem', padding: '0.75rem', background: '#0f172a', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                  <span style={{ color: '#94a3b8' }}>Project created. </span>
                  <a href={redirectLink} style={{ color: '#3b82f6', fontWeight: 600 }}>Open in IDE →</a>
                </p>
              )}
              <p className="mt-3 text-xs text-mono-medium-grey">
                If Build does nothing, use the <a href="/build" style={{ color: '#3b82f6' }}>simple build page</a>.
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mono-dark-bg border border-mono-border-grey">
                  <svg className="h-6 w-6 text-mono-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-mono-white">AI-Powered</h3>
                <p className="mt-2 text-sm text-mono-medium-grey">Advanced AI generates complete applications from simple descriptions</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mono-dark-bg border border-mono-border-grey">
                  <svg className="h-6 w-6 text-mono-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-mono-white">Full-Stack</h3>
                <p className="mt-2 text-sm text-mono-medium-grey">Frontend, backend, and database—all generated automatically</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-mono-dark-bg border border-mono-border-grey">
                  <svg className="h-6 w-6 text-mono-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-mono-white">Instant Deploy</h3>
                <p className="mt-2 text-sm text-mono-medium-grey">Run and deploy your applications with one click</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
