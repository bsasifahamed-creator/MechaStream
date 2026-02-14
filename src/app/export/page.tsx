'use client';

import React, { useState, Suspense } from 'react';
import { ArrowLeft, Download, Package, Globe } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ExportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') || '';

  const [subdomain, setSubdomain] = useState('');
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);

  const handleBack = () => {
    if (projectId) router.push(`/ide?project=${encodeURIComponent(projectId)}`);
    else router.push('/ide');
  };

  const zipUrl = projectId ? `/api/export/${encodeURIComponent(projectId)}?type=zip` : null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ArrowLeft size={20} />
            Back to IDE
          </button>
          {projectId && (
            <span className="text-sm text-gray-500">Project: {projectId}</span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-black">Export & Deploy</h1>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        {!projectId ? (
          <div className="text-center py-12 text-gray-600">
            <p>No project selected.</p>
            <Link href="/" className="text-black underline mt-2 inline-block">
              Create a project from the home page
            </Link>
            , then open Export from the IDE.
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-black mb-2">Export options</h2>
            <p className="text-gray-600 mb-8">
              Download your project or deploy it to a subdomain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-300 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black text-white rounded-sm">
                    <Package size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-black">Download as ZIP</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Download all project files as a ZIP archive.
                </p>
                <a
                  href={zipUrl!}
                  download={`${projectId}.zip`}
                  className="block w-full py-2 px-4 bg-black text-white text-center rounded-sm hover:bg-gray-800 transition-colors"
                >
                  <Download size={16} className="inline mr-2" />
                  Download ZIP
                </a>
              </div>

              <div className="border border-gray-300 rounded-sm p-6 opacity-75">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-700 text-white rounded-sm">
                    <Package size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-black">Export as Docker</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Export with Dockerfile and docker-compose.yml. Coming soon.
                </p>
                <button
                  disabled
                  className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-sm cursor-not-allowed"
                >
                  Export Docker
                </button>
              </div>

              <div className="border border-gray-300 rounded-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-black text-white rounded-sm">
                    <Globe size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-black">Deploy to subdomain</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">
                  Deploy as a subdomain (e.g. myapp.yourplatform.com). Requires backend setup.
                </p>
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value)}
                  placeholder="myproject"
                  className="w-full mb-2 px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mb-4">
                  {subdomain ? `${subdomain}.yourplatform.com` : 'Enter subdomain'}
                </p>
                <button
                  onClick={() => {
                    setDeployLoading(true);
                    setDeployError(null);
                    setTimeout(() => {
                      setDeployLoading(false);
                      setDeployError('Subdomain deployment requires server configuration (nginx, SSL). Not implemented in this version.');
                    }, 800);
                  }}
                  disabled={deployLoading || !subdomain.trim()}
                  className="w-full py-2 px-4 bg-black text-white rounded-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deployLoading ? 'Deploying…' : 'Deploy'}
                </button>
                {deployError && (
                  <p className="mt-2 text-sm text-red-600" role="alert">
                    {deployError}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function ExportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading…</div>}>
      <ExportPageContent />
    </Suspense>
  );
}
