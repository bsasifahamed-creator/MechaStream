import Link from "next/link";
import DocSidebar from "@/components/docs/DocSidebar";
import DocLayout from "@/components/docs/DocLayout";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-4 px-6 py-4 bg-gray-950 border-b border-gray-800">
        <Link href="/" className="text-xl font-bold text-white hover:text-indigo-400 transition shrink-0">
          MechaStream
        </Link>
        <div className="flex-1 max-w-md mx-4">
          <input
            type="search"
            placeholder="Search docs..."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
            aria-label="Search docs"
          />
        </div>
        <Link
          href="/studio"
          className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
        >
          Go to Studio →
        </Link>
      </header>
      <div className="flex">
        <DocSidebar />
        <div className="flex-1 min-w-0 md:ml-[260px]">
          <DocLayout>{children}</DocLayout>
        </div>
      </div>
    </div>
  );
}
