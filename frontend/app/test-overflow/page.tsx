'use client';

export default function TestOverflowPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Overflow Test Page</h1>
        
        {/* Test 1: Long text that might overflow */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 1: Long Text</h2>
          <p className="text-gray-700">
            This is a very long text that might cause horizontal overflow if not properly constrained. 
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        {/* Test 2: Wide table */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 2: Wide Table</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 border">Column 1</th>
                  <th className="px-4 py-2 border">Column 2</th>
                  <th className="px-4 py-2 border">Column 3</th>
                  <th className="px-4 py-2 border">Column 4</th>
                  <th className="px-4 py-2 border">Column 5</th>
                  <th className="px-4 py-2 border">Column 6</th>
                  <th className="px-4 py-2 border">Column 7</th>
                  <th className="px-4 py-2 border">Column 8</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">Data 1</td>
                  <td className="px-4 py-2 border">Data 2</td>
                  <td className="px-4 py-2 border">Data 3</td>
                  <td className="px-4 py-2 border">Data 4</td>
                  <td className="px-4 py-2 border">Data 5</td>
                  <td className="px-4 py-2 border">Data 6</td>
                  <td className="px-4 py-2 border">Data 7</td>
                  <td className="px-4 py-2 border">Data 8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Test 3: Long code block */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 3: Long Code Block</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <code>{`function veryLongFunctionNameWithManyParameters(
  parameter1, 
  parameter2, 
  parameter3, 
  parameter4, 
  parameter5, 
  parameter6, 
  parameter7, 
  parameter8
) {
  // This is a very long function that might cause overflow
  const result = parameter1 + parameter2 + parameter3 + parameter4 + 
                 parameter5 + parameter6 + parameter7 + parameter8;
  return result;
}`}</code>
          </pre>
        </div>

        {/* Test 4: Flex container with many items */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 4: Flex Container</h2>
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="bg-blue-100 px-4 py-2 rounded-lg text-blue-800 whitespace-nowrap">
                Item {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Test 5: Grid layout */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 5: Grid Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold">Grid Item {i + 1}</h3>
                <p className="text-sm text-gray-600">This is some content in a grid item.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test 6: Image test */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Test 6: Image Handling</h2>
          <div className="space-y-4">
            <div className="bg-gray-200 h-32 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Image placeholder (would be constrained to 100% width)</span>
            </div>
            <p className="text-sm text-gray-600">
              Images should be constrained to max-width: 100% and height: auto to prevent overflow.
            </p>
          </div>
        </div>

        {/* Debug info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug Information</h3>
          <p className="text-sm text-yellow-700">
            Check the browser console for any overflow warnings. If you see any overflowing elements, 
            they will be logged with their selectors and dimensions.
          </p>
          <button 
            onClick={() => {
              document.body.classList.toggle('overflow-debug');
              console.log('Debug mode toggled');
            }}
            className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
          >
            Toggle Debug Outlines
          </button>
        </div>
      </div>
    </div>
  )
} 