import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

interface ModifyRequest {
  appId: string
  prompt: string
  currentFiles: { [key: string]: string }
}

export async function POST(request: NextRequest) {
  try {
    const body: ModifyRequest = await request.json()
    const { appId, prompt, currentFiles } = body

    // Initialize OpenAI
    let openai: OpenAI | null = null
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } catch (error) {
      console.log('OpenAI not configured, using mock responses')
    }

    // Modify the application
    const modifiedFiles = await modifyAppFiles(prompt, currentFiles, openai)
    
    // Update the app files
    const appDir = path.join(process.cwd(), 'apps', appId)
    
    for (const [filename, content] of Object.entries(modifiedFiles)) {
      const filePath = path.join(appDir, filename)
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, content)
    }

    return NextResponse.json({
      success: true,
      files: modifiedFiles,
      dependencies: getDependencies(modifiedFiles)
    })

  } catch (error) {
    console.error('Modify App Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to modify app' })
  }
}

async function modifyAppFiles(prompt: string, currentFiles: { [key: string]: string }, openai: OpenAI | null) {
  const systemPrompt = `You are an expert React/Next.js developer. Modify the existing application based on the user's request.

Current files:
${Object.entries(currentFiles).map(([file, content]) => `${file}:\n${content}\n`).join('\n')}

User request: ${prompt}

Modify the appropriate files to implement the requested changes. Return only the modified files with their complete content.`

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || ''
      return parseModifiedFiles(response, currentFiles)
    } catch (error) {
      console.error('OpenAI Error:', error)
    }
  }

  // Fallback to mock modifications
  return generateMockModifications(prompt, currentFiles)
}

function parseModifiedFiles(response: string, currentFiles: { [key: string]: string }) {
  // This would parse the AI response to extract modified files
  // For now, return mock modifications
  return generateMockModifications('mock', currentFiles)
}

function generateMockModifications(prompt: string, currentFiles: { [key: string]: string }) {
  const lowerPrompt = prompt.toLowerCase()
  const modifiedFiles = { ...currentFiles }

  // Find the main page file
  const mainFile = currentFiles['pages/index.js'] || currentFiles['pages/index.tsx']
  
  if (!mainFile) return currentFiles

  if (lowerPrompt.includes('dark mode') || lowerPrompt.includes('dark')) {
    // Add dark mode functionality
    const darkModeCode = mainFile.replace(
      'export default function Home() {',
      `export default function Home() {
  const [isDark, setIsDark] = useState(false)`
    ).replace(
      'import React, { useState } from \'react\'',
      'import React, { useState } from \'react\''
    ).replace(
      /className="([^"]*)"/g,
      'className={`$1 ${isDark ? \'bg-gray-900 text-white\' : \'\'}`}'
    ).replace(
      /<div className="([^"]*)">/,
      `<div className="$1">
        <button
          onClick={() => setIsDark(!isDark)}
          className={\`px-4 py-2 rounded-lg transition-colors \${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}\`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>`
    )

    modifiedFiles['pages/index.js'] = darkModeCode
  }

  if (lowerPrompt.includes('authentication') || lowerPrompt.includes('login')) {
    // Add authentication
    const authCode = mainFile.replace(
      'export default function Home() {',
      `export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')`
    ).replace(
      /<div className="([^"]*)">/,
      `<div className="$1">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            />
            <button
              onClick={() => setIsLoggedIn(true)}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>`
    ).replace(
      /<\/div>\s*<\/div>\s*\)\s*}/,
      `</div>
          </div>
        )}
      </div>
    </div>
  )}`
    )

    modifiedFiles['pages/index.js'] = authCode
  }

  if (lowerPrompt.includes('shopping cart') || lowerPrompt.includes('cart')) {
    // Add shopping cart
    const cartCode = mainFile.replace(
      'export default function Home() {',
      `export default function Home() {
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)`
    ).replace(
      /<div className="([^"]*)">/,
      `<div className="$1">
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          🛒 Cart ({cart.length})
        </button>
        {cartOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Shopping Cart</h3>
              {cart.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <div>
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span>{item.name}</span>
                      <span>{item.price}</span>
                    </div>
                  ))}
                  <button className="w-full bg-green-500 text-white py-2 rounded-lg mt-4">
                    Checkout
                  </button>
                </div>
              )}
              <button
                onClick={() => setCartOpen(false)}
                className="w-full bg-gray-500 text-white py-2 rounded-lg mt-2"
              >
                Close
              </button>
            </div>
          </div>
        )`
    )

    modifiedFiles['pages/index.js'] = cartCode
  }

  return modifiedFiles
}

function getDependencies(files: { [key: string]: string }) {
  const dependencies: { [key: string]: string } = {
    'next': 'latest',
    'react': 'latest',
    'react-dom': 'latest'
  }

  // Add Tailwind if CSS files exist
  if (Object.keys(files).some(file => file.includes('.css'))) {
    dependencies['tailwindcss'] = 'latest'
    dependencies['autoprefixer'] = 'latest'
    dependencies['postcss'] = 'latest'
  }

  return dependencies
} 