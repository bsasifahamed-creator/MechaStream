import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'

interface BuildRequest {
  prompt: string
}

export async function POST(request: NextRequest) {
  try {
    const body: BuildRequest = await request.json()
    const { prompt } = body

    // Initialize OpenAI
    let openai: OpenAI | null = null
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } catch (error) {
      console.log('OpenAI not configured, using mock responses')
    }

    // Generate complete application structure
    const appStructure = await generateAppStructure(prompt, openai)
    
    // Create app files
    const appId = Date.now().toString()
    const appDir = path.join(process.cwd(), 'apps', appId)
    
    // Ensure apps directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'apps'))) {
      fs.mkdirSync(path.join(process.cwd(), 'apps'))
    }
    
    fs.mkdirSync(appDir, { recursive: true })
    
    // Write all files
    for (const [filename, content] of Object.entries(appStructure.files)) {
      const filePath = path.join(appDir, filename)
      const dir = path.dirname(filePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(filePath, content)
    }

    // Build dependencies without duplicate keys
    const mergedDependencies: Record<string, string> = {
      ...(appStructure as any).dependencies || {}
    }
    if (!mergedDependencies['react']) mergedDependencies['react'] = 'latest'
    if (!mergedDependencies['react-dom']) mergedDependencies['react-dom'] = 'latest'

    // Create package.json
    const packageJson = {
      name: `app-${appId}`,
      version: '1.0.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start'
      },
      dependencies: mergedDependencies
    }
    
    fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(packageJson, null, 2))

    return NextResponse.json({
      success: true,
      appId,
      files: appStructure.files,
      dependencies: appStructure.dependencies,
      url: `/api/preview-app/${appId}`
    })

  } catch (error) {
    console.error('Build App Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to build app' })
  }
}

async function generateAppStructure(prompt: string, openai: OpenAI | null) {
  const systemPrompt = `You are an expert full-stack developer. Generate a complete Next.js application based on the user's description.

Requirements:
- Create a complete, functional Next.js app
- Include all necessary files (pages, components, styles, etc.)
- Use modern React patterns and hooks
- Include Tailwind CSS for styling
- Make it responsive and mobile-friendly
- Include proper error handling
- Add interactive features where appropriate
- Create a realistic, production-ready application

Generate the complete file structure with all necessary files.`

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Create a complete Next.js application for: ${prompt}` }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      })

      const response = completion.choices[0]?.message?.content || ''
      return parseAppStructure(response, prompt)
    } catch (error) {
      console.error('OpenAI Error:', error)
    }
  }

  // Fallback to mock app structure
  return generateMockAppStructure(prompt)
}

function parseAppStructure(response: string, prompt: string) {
  // This would parse the AI response to extract file structure
  // For now, return mock structure
  return generateMockAppStructure(prompt)
}

function generateMockAppStructure(prompt: string) {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('restaurant') || lowerPrompt.includes('menu')) {
    return {
      files: {
        'pages/index.js': `import React, { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [activeTab, setActiveTab] = useState('menu')
  
  const menuItems = [
    { name: 'Margherita Pizza', price: '$12.99', description: 'Fresh mozzarella, tomato sauce, basil' },
    { name: 'Caesar Salad', price: '$8.99', description: 'Romaine lettuce, parmesan, croutons' },
    { name: 'Pasta Carbonara', price: '$14.99', description: 'Spaghetti, eggs, pancetta, parmesan' },
    { name: 'Tiramisu', price: '$6.99', description: 'Classic Italian dessert' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Head>
        <title>Bella Vista Restaurant</title>
        <meta name="description" content="Authentic Italian cuisine" />
      </Head>

      <header className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">🍕 Bella Vista</h1>
            <nav className="flex space-x-6">
              <button 
                onClick={() => setActiveTab('menu')}
                className={\`px-4 py-2 rounded-lg transition-colors \${activeTab === 'menu' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-orange-500'}\`}
              >
                Menu
              </button>
              <button 
                onClick={() => setActiveTab('contact')}
                className={\`px-4 py-2 rounded-lg transition-colors \${activeTab === 'contact' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-orange-500'}\`}
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'menu' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <span className="text-lg font-bold text-orange-600">{item.price}</span>
                </div>
                <p className="text-gray-600">{item.description}</p>
                <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Add to Order
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
                <div className="space-y-3">
                  <p className="flex items-center">
                    <span className="text-orange-500 mr-3">📞</span>
                    +1 (555) 123-4567
                  </p>
                  <p className="flex items-center">
                    <span className="text-orange-500 mr-3">📧</span>
                    info@bellavista.com
                  </p>
                  <p className="flex items-center">
                    <span className="text-orange-500 mr-3">📍</span>
                    123 Main Street, City, State 12345
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Hours</h3>
                <div className="space-y-2">
                  <p>Monday - Friday: 11:00 AM - 10:00 PM</p>
                  <p>Saturday - Sunday: 12:00 PM - 11:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}`,
        'pages/_app.js': `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`,
        'styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}`,
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
      },
      dependencies: {
        'next': 'latest',
        'react': 'latest',
        'react-dom': 'latest',
        'tailwindcss': 'latest',
        'autoprefixer': 'latest',
        'postcss': 'latest'
      }
    }
  }
  
  if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('dark')) {
    return {
      files: {
        'pages/index.js': `import React, { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [isDark, setIsDark] = useState(false)
  
  const projects = [
    { title: 'E-commerce Platform', tech: 'React, Node.js, MongoDB', description: 'Full-stack e-commerce solution' },
    { title: 'Task Management App', tech: 'React, Firebase', description: 'Real-time task collaboration' },
    { title: 'Weather Dashboard', tech: 'React, OpenWeather API', description: 'Weather tracking with charts' }
  ]

  return (
    <div className={\`min-h-screen transition-colors \${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}\`}>
      <Head>
        <title>John Developer - Portfolio</title>
        <meta name="description" content="Full-Stack Developer Portfolio" />
      </Head>

      <header className={\`\${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg\`}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">👨‍💻 John Developer</h1>
            <button
              onClick={() => setIsDark(!isDark)}
              className={\`px-4 py-2 rounded-lg transition-colors \${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}\`}
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4">Full-Stack Developer</h2>
        <p className={\`text-xl mb-8 \${isDark ? 'text-gray-300' : 'text-gray-600'}\`}>
          Creating beautiful, functional web applications
        </p>
        <div className="flex justify-center space-x-4">
          <button className={\`px-6 py-3 rounded-lg font-semibold transition-colors \${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white\`}>
            View Projects
          </button>
          <button className={\`px-6 py-3 rounded-lg font-semibold transition-colors \${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}\`}>
            Contact Me
          </button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Featured Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div key={index} className={\`rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105 \${isDark ? 'bg-gray-800' : 'bg-white'}\`}>
              <div className={\`h-48 \${isDark ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center\`}>
                <span className="text-4xl">🚀</span>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold mb-2">{project.title}</h4>
                <p className={\`text-sm mb-3 \${isDark ? 'text-blue-400' : 'text-blue-600'}\`}>{project.tech}</p>
                <p className={\`\${isDark ? 'text-gray-300' : 'text-gray-600'}\`}>{project.description}</p>
                <button className={\`mt-4 px-4 py-2 rounded-lg transition-colors \${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white\`}>
                  View Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}`,
        'pages/_app.js': `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`,
        'styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}`,
        'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
        'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
      },
      dependencies: {
        'next': 'latest',
        'react': 'latest',
        'react-dom': 'latest',
        'tailwindcss': 'latest',
        'autoprefixer': 'latest',
        'postcss': 'latest'
      }
    }
  }

  // Default app
  return {
    files: {
      'pages/index.js': `import React, { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Head>
        <title>My App</title>
        <meta name="description" content="Generated app" />
      </Head>
      
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🚀 Welcome to Your App</h1>
        <p className="text-xl text-gray-600 mb-8">
          This is your generated React application!
        </p>
        
        <div className="space-y-4">
          <div className="text-6xl font-bold text-blue-600">{count}</div>
          <button
            onClick={() => setCount(count + 1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Click me!
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Generated based on: "${prompt}"
        </p>
      </div>
    </div>
  )
}`,
      'pages/_app.js': `import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}`,
      'styles/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

html,
body {
  padding: 0;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
    Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}

* {
  box-sizing: border-box;
}`,
      'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`
    },
    dependencies: {
      'next': 'latest',
      'react': 'latest',
      'react-dom': 'latest',
      'tailwindcss': 'latest',
      'autoprefixer': 'latest',
      'postcss': 'latest'
    }
  }
} 