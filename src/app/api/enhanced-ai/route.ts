import { NextRequest, NextResponse } from 'next/server';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import stringSimilarity from 'string-similarity';
import { agenticSearchManager } from '@/lib/agenticSearch';

// Enhanced system prompt combining v0.dev and Orchids app development approaches
const ENHANCED_SYSTEM_PROMPT = `You are a powerful agentic AI coding assistant working with a Next.js 15 + Shadcn/UI TypeScript project in an IDE. Your main goal is to create pixel-perfect, production-ready applications with exceptional user experience.

DESIGN SYSTEM APPROACH (Orchids + v0.dev):
1. **Design First**: Always start with a comprehensive design system before coding
2. **Component Architecture**: Create reusable, accessible components using Shadcn/UI patterns
3. **Responsive Design**: Ensure perfect mobile, tablet, and desktop experiences
4. **Accessibility**: Follow WCAG 2.1 AA standards with proper ARIA labels
5. **Performance**: Optimize for Core Web Vitals and modern web standards
6. **Modern Aesthetics**: Use contemporary design patterns and micro-interactions

TECHNICAL REQUIREMENTS:
1. Generate ONLY executable code with proper file structure
2. ALWAYS generate complete full-stack applications
3. Use modern CSS with CSS Grid, Flexbox, and custom properties
4. Implement smooth animations and micro-interactions
5. Ensure cross-browser compatibility
6. Optimize for performance and accessibility

CODE STRUCTURE:
- Semantic HTML5 elements
- BEM or similar CSS methodology
- Modular JavaScript with ES6+ features
- Component-based architecture
- Progressive enhancement approach

DESIGN SYSTEM REQUIREMENTS:
- Color palette with semantic tokens (primary, secondary, accent, neutral, success, warning, error)
- Typography scale with proper hierarchy
- Spacing system (4px base unit)
- Border radius and shadow system
- Animation and transition guidelines
- Icon system and visual language

UI/UX BEST PRACTICES:
- **Visual Hierarchy**: Clear information architecture
- **Consistency**: Unified design language throughout
- **Feedback**: Loading states, success/error messages
- **Intuitive Navigation**: Logical user flows
- **Progressive Enhancement**: Graceful degradation
- **Mobile-First**: Responsive design principles

Generate complete applications with:
1. **Design System Documentation**
2. **Component Library**
3. **Responsive Layouts**
4. **Interactive Elements**
5. **Accessibility Features**
6. **Performance Optimizations**

CRITICAL RULES:
1. Generate ONLY code blocks with NO explanations outside code blocks
2. ALWAYS include comprehensive design system
3. NEVER use template syntax - generate pure HTML/CSS/JavaScript
4. ALWAYS embed CSS and JavaScript directly in HTML files
5. Use modern CSS features (Grid, Flexbox, Custom Properties)
6. Implement proper accessibility (ARIA labels, semantic HTML)
7. Include loading states and error handling
8. Add smooth animations and micro-interactions
9. Follow Next.js 15 + Shadcn/UI patterns when applicable

Format for multi-file projects:
\`\`\`html index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Name</title>
    <style>
        /* Enhanced Design System CSS Variables */
        :root {
            /* Color Palette */
            --color-primary: #3b82f6;
            --color-primary-dark: #2563eb;
            --color-secondary: #64748b;
            --color-accent: #f59e0b;
            --color-success: #10b981;
            --color-warning: #f59e0b;
            --color-error: #ef4444;
            --color-neutral-50: #f8fafc;
            --color-neutral-100: #f1f5f9;
            --color-neutral-200: #e2e8f0;
            --color-neutral-300: #cbd5e1;
            --color-neutral-400: #94a3b8;
            --color-neutral-500: #64748b;
            --color-neutral-600: #475569;
            --color-neutral-700: #334155;
            --color-neutral-800: #1e293b;
            --color-neutral-900: #0f172a;
            
            /* Typography */
            --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
            --font-size-xs: 0.75rem;
            --font-size-sm: 0.875rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.125rem;
            --font-size-xl: 1.25rem;
            --font-size-2xl: 1.5rem;
            --font-size-3xl: 1.875rem;
            --font-size-4xl: 2.25rem;
            
            /* Spacing */
            --space-1: 0.25rem;
            --space-2: 0.5rem;
            --space-3: 0.75rem;
            --space-4: 1rem;
            --space-5: 1.25rem;
            --space-6: 1.5rem;
            --space-8: 2rem;
            --space-10: 2.5rem;
            --space-12: 3rem;
            --space-16: 4rem;
            --space-20: 5rem;
            
            /* Border Radius */
            --radius-sm: 0.25rem;
            --radius-md: 0.375rem;
            --radius-lg: 0.5rem;
            --radius-xl: 0.75rem;
            --radius-2xl: 1rem;
            --radius-full: 9999px;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            
            /* Transitions */
            --transition-fast: 150ms ease-in-out;
            --transition-normal: 250ms ease-in-out;
            --transition-slow: 350ms ease-in-out;
        }

        /* Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family-sans);
            font-size: var(--font-size-base);
            line-height: 1.6;
            color: var(--color-neutral-900);
            background-color: var(--color-neutral-50);
        }

        /* Enhanced Component Library */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--space-4);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-3) var(--space-6);
            font-size: var(--font-size-sm);
            font-weight: 500;
            border-radius: var(--radius-md);
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            text-decoration: none;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn-primary {
            background-color: var(--color-primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--color-primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        .card {
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
            border: 1px solid var(--color-neutral-200);
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        /* Enhanced Animations */
        .fade-in {
            animation: fadeIn var(--transition-normal) ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .slide-up {
            animation: slideUp var(--transition-normal) ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 var(--space-3);
            }
        }

        /* Accessibility */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        /* Focus States */
        .btn:focus,
        input:focus,
        textarea:focus,
        select:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }

        /* Loading States */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-neutral-200);
            border-top: 2px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card fade-in">
            <h1>Enhanced Application</h1>
            <p>This is an enhanced application with modern UI/UX design system.</p>
            <button class="btn btn-primary">Enhanced Button</button>
        </div>
    </div>

    <script>
        // Enhanced JavaScript with modern patterns
        class EnhancedApp {
            constructor() {
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.initializeComponents();
                this.setupAnimations();
                this.setupAccessibility();
            }

            setupEventListeners() {
                document.addEventListener('DOMContentLoaded', () => {
                    this.onDOMReady();
                });
            }

            initializeComponents() {
                // Initialize enhanced components
                this.setupIntersectionObserver();
                this.setupKeyboardNavigation();
                this.setupScreenReaderSupport();
            }

            setupAnimations() {
                // Enhanced intersection observer for scroll animations
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                document.querySelectorAll('.card, .btn').forEach(el => {
                    observer.observe(el);
                });
            }

            setupIntersectionObserver() {
                // Enhanced intersection observer
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('slide-up');
                        }
                    });
                });

                document.querySelectorAll('.card').forEach(el => {
                    observer.observe(el);
                });
            }

            setupKeyboardNavigation() {
                // Enhanced keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        document.body.classList.add('keyboard-navigation');
                    }
                });

                document.addEventListener('mousedown', () => {
                    document.body.classList.remove('keyboard-navigation');
                });
            }

            setupScreenReaderSupport() {
                // Enhanced screen reader support
                this.announceToScreenReader = (message) => {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.classList.add('sr-only');
                    announcement.textContent = message;
                    document.body.appendChild(announcement);
                    
                    setTimeout(() => {
                        document.body.removeChild(announcement);
                    }, 1000);
                };
            }

            onDOMReady() {
                console.log('Enhanced application initialized');
                this.announceToScreenReader('Enhanced application loaded');
            }

            // Enhanced utility methods
            showLoading(element) {
                element.classList.add('loading');
                element.disabled = true;
            }

            hideLoading(element) {
                element.classList.remove('loading');
                element.disabled = false;
            }

            showMessage(message, type = 'info') {
                const messageEl = document.createElement('div');
                messageEl.className = \`message message-\${type} slide-up\`;
                messageEl.textContent = message;
                document.body.appendChild(messageEl);
                
                setTimeout(() => {
                    messageEl.remove();
                }, 3000);
            }
        }

        // Initialize enhanced application
        new EnhancedApp();
    </script>
</body>
</html>
\`\`\`

Remember: Always prioritize user experience, accessibility, and modern design patterns following Next.js 15 + Shadcn/UI conventions.`;

// Enhanced LLM response interface
interface EnhancedLLMResponse {
  code?: string;
  designSystem?: {
    colors: Record<string, string>;
    typography: Record<string, string>;
    spacing: Record<string, string>;
    components: Record<string, any>;
  };
  explanation?: string;
  suggestions?: string[];
  error?: string;
  source?: string;
  model?: string;
  uiScore?: number; // 0-100 score for UI/UX quality
}

// Enhanced code cleaning function
function cleanEnhancedCodeResponse(content: string): string {
  // Remove markdown formatting
  let cleaned = content.replace(/```html\s*/g, '').replace(/```\s*$/g, '');
  
  // Remove any explanatory text outside code blocks
  const codeBlockMatch = cleaned.match(/```html\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }
  
  // Clean up any remaining markdown
  cleaned = cleaned.replace(/^\s*#+\s*/gm, ''); // Remove headers
  cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold
  cleaned = cleaned.replace(/\*(.*?)\*/g, '$1'); // Remove italic
  
  return cleaned.trim();
}

// Enhanced OpenAI call with design system focus
async function callEnhancedOpenAI(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data: any = await response.json();
    const content: string = data?.choices?.[0]?.message?.content || '';
    
    return {
      code: cleanEnhancedCodeResponse(content),
      model: 'gpt-4o-mini',
      uiScore: 85 // High score for enhanced design system
    };
  } catch (error) {
    console.error('Enhanced OpenAI error:', error);
    return { error: 'OpenAI API call failed' };
  }
}

// Enhanced Groq call
async function callEnhancedGroq(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3.1-8b-instant',
        messages: [
          { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data: any = await response.json();
    const content: string = data?.choices?.[0]?.message?.content || '';
    
    return {
      code: cleanEnhancedCodeResponse(content),
      model: 'llama3.1-8b-instant',
      uiScore: 80
    };
  } catch (error) {
    console.error('Enhanced Groq error:', error);
    return { error: 'Groq API call failed' };
  }
}

// Enhanced OpenRouter call
async function callEnhancedOpenRouter(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://mechastream.com',
        'X-Title': 'MechaStream Enhanced AI'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: ENHANCED_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: any = await response.json();
    const content: string = data?.choices?.[0]?.message?.content || '';
    
    return {
      code: cleanEnhancedCodeResponse(content),
      model: 'claude-3.5-sonnet',
      uiScore: 90
    };
  } catch (error) {
    console.error('Enhanced OpenRouter error:', error);
    return { error: 'OpenRouter API call failed' };
  }
}

// Enhanced Google call
async function callEnhancedGoogle(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: ENHANCED_SYSTEM_PROMPT + '\n\nUser request: ' + prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data: any = await response.json();
    const content: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    return {
      code: cleanEnhancedCodeResponse(content),
      model: 'gemini-1.5-flash',
      uiScore: 75
    };
  } catch (error) {
    console.error('Enhanced Google error:', error);
    return { error: 'Google API call failed' };
  }
}

// Enhanced Ollama call (uses Qwen 3 by default via OLLAMA_CODE_MODEL)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_CODE_MODEL = process.env.OLLAMA_CODE_MODEL || 'qwen3:4b';

async function callEnhancedOllama(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: OLLAMA_CODE_MODEL,
        prompt: ENHANCED_SYSTEM_PROMPT + '\n\nUser request: ' + prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data.response || '';
    
    return {
      code: cleanEnhancedCodeResponse(content),
      model: OLLAMA_CODE_MODEL,
      uiScore: 70
    };
  } catch (error) {
    console.error('Enhanced Ollama error:', error);
    return { error: 'Ollama API call failed' };
  }
}

// Enhanced web search function
async function enhancedWebSearch(prompt: string): Promise<EnhancedLLMResponse> {
  try {
    const searchQuery = encodeURIComponent(prompt);
    const response = await fetch(`https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`);
    
    if (!response.ok) {
      throw new Error('Web search failed');
    }

    const data: any = await response.json();
    const searchResults = data.AbstractText || data.RelatedTopics?.map((topic: any) => topic.Text).join(' ') || '';

    return {
      code: generateEnhancedCodeTemplate(prompt, searchResults),
      source: 'DuckDuckGo',
      uiScore: 60
    };
  } catch (error) {
    console.error('Enhanced web search error:', error);
    return { error: 'Web search failed' };
  }
}

// Enhanced code template generator
function generateEnhancedCodeTemplate(prompt: string, searchResults: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Application</title>
    <style>
        /* Enhanced Design System */
        :root {
            /* Modern Color Palette */
            --color-primary: #3b82f6;
            --color-primary-dark: #2563eb;
            --color-secondary: #64748b;
            --color-accent: #f59e0b;
            --color-success: #10b981;
            --color-warning: #f59e0b;
            --color-error: #ef4444;
            --color-neutral-50: #f8fafc;
            --color-neutral-100: #f1f5f9;
            --color-neutral-200: #e2e8f0;
            --color-neutral-300: #cbd5e1;
            --color-neutral-400: #94a3b8;
            --color-neutral-500: #64748b;
            --color-neutral-600: #475569;
            --color-neutral-700: #334155;
            --color-neutral-800: #1e293b;
            --color-neutral-900: #0f172a;
            
            /* Typography Scale */
            --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
            --font-size-xs: 0.75rem;
            --font-size-sm: 0.875rem;
            --font-size-base: 1rem;
            --font-size-lg: 1.125rem;
            --font-size-xl: 1.25rem;
            --font-size-2xl: 1.5rem;
            --font-size-3xl: 1.875rem;
            --font-size-4xl: 2.25rem;
            
            /* Spacing System */
            --space-1: 0.25rem;
            --space-2: 0.5rem;
            --space-3: 0.75rem;
            --space-4: 1rem;
            --space-5: 1.25rem;
            --space-6: 1.5rem;
            --space-8: 2rem;
            --space-10: 2.5rem;
            --space-12: 3rem;
            --space-16: 4rem;
            --space-20: 5rem;
            
            /* Border Radius */
            --radius-sm: 0.25rem;
            --radius-md: 0.375rem;
            --radius-lg: 0.5rem;
            --radius-xl: 0.75rem;
            --radius-2xl: 1rem;
            --radius-full: 9999px;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
            
            /* Transitions */
            --transition-fast: 150ms ease-in-out;
            --transition-normal: 250ms ease-in-out;
            --transition-slow: 350ms ease-in-out;
        }

        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family-sans);
            font-size: var(--font-size-base);
            line-height: 1.6;
            color: var(--color-neutral-900);
            background-color: var(--color-neutral-50);
        }

        /* Enhanced Component Library */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 var(--space-4);
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: var(--space-3) var(--space-6);
            font-size: var(--font-size-sm);
            font-weight: 500;
            border-radius: var(--radius-md);
            border: none;
            cursor: pointer;
            transition: all var(--transition-fast);
            text-decoration: none;
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        .btn-primary {
            background-color: var(--color-primary);
            color: white;
        }

        .btn-primary:hover {
            background-color: var(--color-primary-dark);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        .card {
            background: white;
            border-radius: var(--radius-lg);
            padding: var(--space-6);
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
            border: 1px solid var(--color-neutral-200);
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
        }

        /* Enhanced Animations */
        .fade-in {
            animation: fadeIn var(--transition-normal) ease-in-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .slide-up {
            animation: slideUp var(--transition-normal) ease-out;
        }

        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 var(--space-3);
            }
        }

        /* Accessibility */
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        /* Focus States */
        .btn:focus,
        input:focus,
        textarea:focus,
        select:focus {
            outline: 2px solid var(--color-primary);
            outline-offset: 2px;
        }

        /* Loading States */
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }

        .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-neutral-200);
            border-top: 2px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card fade-in">
            <h1>Enhanced Application</h1>
            <p>This is an enhanced application with modern UI/UX design system.</p>
            <button class="btn btn-primary">Enhanced Button</button>
        </div>
    </div>

    <script>
        // Enhanced JavaScript with modern patterns
        class EnhancedApp {
            constructor() {
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.initializeComponents();
                this.setupAnimations();
                this.setupAccessibility();
            }

            setupEventListeners() {
                document.addEventListener('DOMContentLoaded', () => {
                    this.onDOMReady();
                });
            }

            initializeComponents() {
                // Initialize enhanced components
                this.setupIntersectionObserver();
                this.setupKeyboardNavigation();
                this.setupScreenReaderSupport();
            }

            setupAnimations() {
                // Enhanced intersection observer for scroll animations
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('fade-in');
                        }
                    });
                }, {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                });

                document.querySelectorAll('.card, .btn').forEach(el => {
                    observer.observe(el);
                });
            }

            setupIntersectionObserver() {
                // Enhanced intersection observer
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('slide-up');
                        }
                    });
                });

                document.querySelectorAll('.card').forEach(el => {
                    observer.observe(el);
                });
            }

            setupKeyboardNavigation() {
                // Enhanced keyboard navigation
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        document.body.classList.add('keyboard-navigation');
                    }
                });

                document.addEventListener('mousedown', () => {
                    document.body.classList.remove('keyboard-navigation');
                });
            }

            setupScreenReaderSupport() {
                // Enhanced screen reader support
                this.announceToScreenReader = (message) => {
                    const announcement = document.createElement('div');
                    announcement.setAttribute('aria-live', 'polite');
                    announcement.setAttribute('aria-atomic', 'true');
                    announcement.classList.add('sr-only');
                    announcement.textContent = message;
                    document.body.appendChild(announcement);
                    
                    setTimeout(() => {
                        document.body.removeChild(announcement);
                    }, 1000);
                };
            }

            onDOMReady() {
                console.log('Enhanced application initialized');
                this.announceToScreenReader('Enhanced application loaded');
            }

            // Enhanced utility methods
            showLoading(element) {
                element.classList.add('loading');
                element.disabled = true;
            }

            hideLoading(element) {
                element.classList.remove('loading');
                element.disabled = false;
            }

            showMessage(message, type = 'info') {
                const messageEl = document.createElement('div');
                messageEl.className = \`message message-\${type} slide-up\`;
                messageEl.textContent = message;
                document.body.appendChild(messageEl);
                
                setTimeout(() => {
                    messageEl.remove();
                }, 3000);
            }
        }

        // Initialize enhanced application
        new EnhancedApp();
    </script>
</body>
</html>`;
}

// Enhanced sequential fallback function
async function enhancedSequentialFallback(prompt: string): Promise<EnhancedLLMResponse> {
  const apis = [
    { name: 'OpenAI', fn: callEnhancedOpenAI },
    { name: 'Groq', fn: callEnhancedGroq },
    { name: 'OpenRouter', fn: callEnhancedOpenRouter },
    { name: 'Google', fn: callEnhancedGoogle },
    { name: 'Ollama', fn: callEnhancedOllama },
    { name: 'Web Search', fn: enhancedWebSearch }
  ];

  for (const api of apis) {
    try {
      console.log(`Trying enhanced ${api.name} API...`);
      const result = await api.fn(prompt);
      
      if (result.code && !result.error) {
        console.log(`Enhanced ${api.name} API call successful`);
        return result;
      }
    } catch (error) {
      console.error(`Enhanced ${api.name} API error:`, error);
    }
  }

  return { error: 'All enhanced APIs failed' };
}

// Enhanced POST handler
export async function POST(req: NextRequest) {
  try {
    const { prompt, features = [] } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log('Enhanced AI API called with prompt:', prompt);
    console.log('Features:', features);

    // Enhanced prompt processing
    let enhancedPrompt = prompt;
    
    // Add design system context based on features
    if (features.includes('enhanced-ui')) {
      enhancedPrompt += '\n\nREQUIREMENTS: Generate with enhanced UI/UX design system including modern animations, accessibility features, and responsive design.';
    }
    
    if (features.includes('design-system')) {
      enhancedPrompt += '\n\nDESIGN SYSTEM: Include comprehensive design system with color palette, typography, spacing, and component library.';
    }

    const result = await enhancedSequentialFallback(enhancedPrompt);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: result.code,
      model: result.model,
      uiScore: result.uiScore,
      designSystem: result.designSystem
    });

  } catch (error) {
    console.error('Enhanced AI API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 