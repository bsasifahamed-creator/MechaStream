
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate project');
      }

      const projectId = data.projectId ?? data.projectName;
      if (!projectId) {
        throw new Error('No project ID returned');
      }

      router.push(
        `/ide?project=${encodeURIComponent(projectId)}&prompt=${encodeURIComponent(prompt.trim())}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsLoading(false);
    }
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

            {/* Quick Start Form */}
            <div className="mt-10">
              <form onSubmit={handleSubmit} className="mx-auto max-w-md">
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
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className="flex-none rounded-lg bg-mono-accent-blue px-3.5 py-2.5 text-sm font-semibold text-mono-white shadow-sm hover:bg-mono-accent-blue/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mono-accent-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-mono-white border-t-transparent rounded-full animate-spin" />
                        Building...
                      </span>
                    ) : (
                      'Build'
                    )}
                  </button>
                </div>
              </form>

              {error && (
                <p className="mt-4 text-sm text-mono-destructive-red" role="alert">
                  {error}
                </p>
              )}
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
