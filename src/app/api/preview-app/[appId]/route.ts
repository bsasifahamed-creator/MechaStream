import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface PreviewParams {
  appId: string
}

export async function GET(request: NextRequest, { params }: { params: PreviewParams }) {
  try {
    const { appId } = params
    
    // Check if app exists
    const appDir = path.join(process.cwd(), 'apps', appId)
    if (!fs.existsSync(appDir)) {
      return NextResponse.json({ success: false, error: 'App not found' })
    }

    // Read the main page file
    const mainFile = path.join(appDir, 'pages', 'index.js')
    if (!fs.existsSync(mainFile)) {
      return NextResponse.json({ success: false, error: 'Main page not found' })
    }

    const mainContent = fs.readFileSync(mainFile, 'utf-8')
    
    // Create a simple HTML page that renders the React component
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>App Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; padding: 0; font-family: system-ui; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${mainContent}
        ReactDOM.render(React.createElement(Home), document.getElementById('root'));
    </script>
</body>
</html>`

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Preview App Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load preview' })
  }
} 