import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface DeploymentRequest {
  projectId: string
  projectName: string
  code: string
  dependencies: string[]
  config: {
    platform: 'vercel' | 'netlify' | 'github-pages' | 'custom'
    domain?: string
    environment?: 'production' | 'preview'
    buildCommand?: string
    outputDirectory?: string
  }
}

interface DeploymentResponse {
  deploymentId: string
  status: 'pending' | 'building' | 'deployed' | 'failed'
  url?: string
  logs?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: DeploymentRequest = await request.json()
    const { projectId, projectName, code, dependencies, config } = body

    // Create deployment directory
    const deploymentDir = path.join(process.cwd(), 'deployments', projectId)
    fs.mkdirSync(deploymentDir, { recursive: true })

    // Generate project files
    await generateProjectFiles(deploymentDir, projectName, code, dependencies, config)

    // Simulate deployment process
    const deploymentId = `deploy-${Date.now()}`
    const deploymentUrl = await simulateDeployment(deploymentId, config)

    const response: DeploymentResponse = {
      deploymentId,
      status: 'building',
      url: deploymentUrl,
      logs: [
        'Initializing deployment...',
        'Building project files...',
        'Installing dependencies...',
        'Deploying to platform...'
      ]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Deployment error:', error)
    return NextResponse.json(
      { error: 'Deployment failed' },
      { status: 500 }
    )
  }
}

async function generateProjectFiles(
  deploymentDir: string,
  projectName: string,
  code: string,
  dependencies: string[],
  config: any
) {
  // Create package.json
  const packageJson = {
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      ...dependencies.reduce((acc, dep) => ({ ...acc, [dep]: 'latest' }), {})
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      '@vitejs/plugin-react': '^4.0.0',
      'vite': '^4.0.0',
      'typescript': '^5.0.0'
    }
  }

  fs.writeFileSync(
    path.join(deploymentDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // Create vite.config.js
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '${config.outputDirectory || 'dist'}',
    sourcemap: true
  }
})`

  fs.writeFileSync(path.join(deploymentDir, 'vite.config.js'), viteConfig)

  // Create index.html
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`

  fs.writeFileSync(path.join(deploymentDir, 'index.html'), indexHtml)

  // Create src directory and files
  const srcDir = path.join(deploymentDir, 'src')
  fs.mkdirSync(srcDir, { recursive: true })

  // Create main.jsx
  const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`

  fs.writeFileSync(path.join(srcDir, 'main.jsx'), mainJsx)

  // Create App.jsx with the user's code
  const appJsx = code
  fs.writeFileSync(path.join(srcDir, 'App.jsx'), appJsx)

  // Create index.css
  const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}`

  fs.writeFileSync(path.join(srcDir, 'index.css'), indexCss)

  // Create tailwind.config.js
  const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`

  fs.writeFileSync(path.join(deploymentDir, 'tailwind.config.js'), tailwindConfig)

  // Create postcss.config.js
  const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`

  fs.writeFileSync(path.join(deploymentDir, 'postcss.config.js'), postcssConfig)

  // Create README.md
  const readme = `# ${projectName}

This project was generated using MechaStream.

## Development

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Preview

\`\`\`bash
npm run preview
\`\`\`
`

  fs.writeFileSync(path.join(deploymentDir, 'README.md'), readme)
}

async function simulateDeployment(deploymentId: string, config: any): Promise<string> {
  // Simulate deployment delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Generate deployment URL based on platform
  const baseUrl = getPlatformUrl(config.platform)
  const subdomain = deploymentId.slice(-8)
  
  return `${baseUrl}/${subdomain}`
}

function getPlatformUrl(platform: string): string {
  switch (platform) {
    case 'vercel':
      return 'https://vercel.app'
    case 'netlify':
      return 'https://netlify.app'
    case 'github-pages':
      return 'https://github.io'
    case 'custom':
      return 'https://custom-domain.com'
    default:
      return 'https://deployment.app'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deploymentId = searchParams.get('id')

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      )
    }

    // Simulate checking deployment status
    const status = await getDeploymentStatus(deploymentId)

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error checking deployment status:', error)
    return NextResponse.json(
      { error: 'Failed to check deployment status' },
      { status: 500 }
    )
  }
}

async function getDeploymentStatus(deploymentId: string) {
  // Simulate deployment status check
  const deploymentTime = parseInt(deploymentId.split('-')[1])
  const elapsed = Date.now() - deploymentTime
  
  if (elapsed < 5000) {
    return {
      deploymentId,
      status: 'building',
      url: `https://deployment.app/${deploymentId.slice(-8)}`,
      logs: [
        'Building project...',
        'Installing dependencies...',
        'Deploying to platform...'
      ]
    }
  } else if (elapsed < 10000) {
    return {
      deploymentId,
      status: 'deployed',
      url: `https://deployment.app/${deploymentId.slice(-8)}`,
      logs: [
        'Build completed successfully',
        'Deployment successful',
        'Your app is live!'
      ]
    }
  } else {
    return {
      deploymentId,
      status: 'deployed',
      url: `https://deployment.app/${deploymentId.slice(-8)}`,
      logs: [
        'Build completed successfully',
        'Deployment successful',
        'Your app is live!'
      ]
    }
  }
} 