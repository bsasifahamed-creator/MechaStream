"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    title: "Getting Started",
    links: [
      { label: "Overview", href: "/docs" },
      { label: "Quick Start", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Using MechaStream",
    links: [
      { label: "The Studio", href: "/docs/studio" },
      { label: "Schema System", href: "/docs/schema" },
      { label: "Component Registry", href: "/docs/components" },
    ],
  },
  {
    title: "Exporting & Deploying",
    links: [
      { label: "Export to ZIP", href: "/docs/export" },
      { label: "Deploy to Vercel", href: "/docs/deploy" },
    ],
  },
  {
    title: "Reference",
    links: [
      { label: "API Reference", href: "/docs/api" },
      { label: "Plans & Limits", href: "/docs/plans" },
    ],
  },
];

export default function DocSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[260px] flex flex-col bg-gray-900 border-r border-gray-800 overflow-y-auto hidden md:flex">
      <div className="flex-1 p-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.title}
            </div>
            <nav className="space-y-0.5">
              {group.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2 rounded-lg text-sm transition ${
                      isActive
                        ? "bg-indigo-500/20 text-indigo-400 font-medium"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Need help?
        </div>
        <a
          href="#"
          className="block text-sm text-gray-400 hover:text-indigo-400 transition"
        >
          Join Discord
        </a>
        <a
          href="mailto:support@mechastream.com"
          className="block text-sm text-gray-400 hover:text-indigo-400 transition"
        >
          Contact Support
        </a>
      </div>
    </aside>
  );
}
