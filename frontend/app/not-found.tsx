import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mono-black flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-mono-white mb-2">404</h1>
      <p className="text-mono-medium-grey mb-6">This page could not be found.</p>
      <Link
        href="/"
        className="rounded-lg bg-mono-accent-blue px-4 py-2.5 text-sm font-semibold text-mono-white hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  );
}
