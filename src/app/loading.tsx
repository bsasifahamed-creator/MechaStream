export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1220]" style={{ backgroundColor: '#0b1220' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading MechaStream...</p>
      </div>
    </div>
  )
}
