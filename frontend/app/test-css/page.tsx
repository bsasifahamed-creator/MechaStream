export default function TestCSSPage() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">CSS Test Page</h1>
        
        {/* Test Tailwind Classes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Blue Card</h2>
            <p>This tests basic Tailwind classes</p>
          </div>
          
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Green Card</h2>
            <p>This tests basic Tailwind classes</p>
          </div>
          
          <div className="bg-purple-500 text-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Purple Card</h2>
            <p>This tests basic Tailwind classes</p>
          </div>
        </div>
        
        {/* Test Custom CSS Classes */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Custom CSS Test</h2>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Card Component</h3>
            <p>This tests the custom card class from globals.css</p>
          </div>
          
          <div className="mt-4">
            <button className="btn-primary mr-4">Primary Button</button>
            <button className="btn-secondary mr-4">Secondary Button</button>
            <button className="btn-accent">Accent Button</button>
          </div>
        </div>
        
        {/* Test Gradients */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Gradient Test</h2>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Gradient Background</h3>
            <p>This tests gradient backgrounds</p>
          </div>
        </div>
        
        {/* Test Text Gradients */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Text Gradient Test</h2>
          <h3 className="text-3xl font-bold text-gradient">Gradient Text</h3>
          <p className="text-gray-300 mt-2">This tests the text-gradient utility class</p>
        </div>
        
        {/* Test Overflow Prevention */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Overflow Test</h2>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-gray-800">
              This is a very long text that should not cause horizontal overflow. 
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
              veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex 
              ea commodo consequat.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 