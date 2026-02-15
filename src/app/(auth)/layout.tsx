export default function AuthPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.14),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.12),transparent_32%),linear-gradient(145deg,#020617,#0b1220_55%,#111827)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10 sm:px-0">
        <div className="w-full">{children}</div>
      </div>
    </div>
  )
}
