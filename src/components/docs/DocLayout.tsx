"use client";

import DocContent from "./DocContent";

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-950">
      <div className="w-[260px] shrink-0" aria-hidden />
      <DocContent>{children}</DocContent>
    </div>
  );
}
