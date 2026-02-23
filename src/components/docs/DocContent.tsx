"use client";

export default function DocContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 min-w-0 overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-10 pb-20">
        {children}
      </div>
    </main>
  );
}
