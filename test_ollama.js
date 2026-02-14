const fetch = require('node-fetch');

async function testOllama() {
  try {
    console.log('Testing Ollama API...');
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-coder:6.7b',
        prompt: `You are an expert game developer. Generate a complete, playable HTML5 game based on the user's request. IMPORTANT: Output ONLY valid JSON with this exact format: {"files": [{"path": "index.html", "content": "complete HTML with embedded CSS and JavaScript"}]} - no markdown, no explanations, no code blocks. Create a single self-contained HTML file with all game logic, styling, and assets embedded. Make it fully playable with keyboard/mouse controls, scoring, and game mechanics. Use modern HTML5 Canvas or CSS animations. Include proper game loop, collision detection, and responsive design.

User request: create me a simple pong game`,
        stream: false
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    console.log('Response content:', data.response);
  } catch (error) {
    console.error('Error:', error);
  }
}

testOllama();
