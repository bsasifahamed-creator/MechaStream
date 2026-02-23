'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-mono-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-lg border border-mono-border-grey bg-mono-sidebar-bg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-mono-white mb-2">Sign in</h1>
        <p className="text-mono-medium-grey text-sm mb-6">
          MechaStream – sign in to sync your projects.
        </p>
        <p className="text-mono-medium-grey text-sm mb-4">
          Authentication is not configured yet. Use the app without signing in.
        </p>
        <Link
          href="/"
          className="block w-full text-center rounded-lg bg-mono-accent-blue px-4 py-2.5 text-sm font-semibold text-mono-white hover:opacity-90 transition-opacity"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
