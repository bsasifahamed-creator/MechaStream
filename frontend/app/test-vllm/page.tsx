import VLLMTest from '@/components/VLLMTest'

export default function TestVLLMPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            vLLM API Test
          </h1>
          <p className="text-gray-300 text-lg">
            Test interface to verify vLLM integration
          </p>
        </div>
        
        <VLLMTest />
      </div>
    </div>
  )
}