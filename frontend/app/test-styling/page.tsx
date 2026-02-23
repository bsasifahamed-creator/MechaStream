'use client'

export default function TestStyling() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Tailwind CSS Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-500 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Blue Card</h2>
              <p>This should be blue with white text</p>
            </div>
            
            <div className="bg-green-500 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Green Card</h2>
              <p>This should be green with white text</p>
            </div>
            
            <div className="bg-red-500 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Red Card</h2>
              <p>This should be red with white text</p>
            </div>
            
            <div className="bg-yellow-500 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Yellow Card</h2>
              <p>This should be yellow with white text</p>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mr-4">
              Primary Button
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 mr-4">
              Secondary Button
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
              Success Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 