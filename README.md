# AI No-Code Builder

A powerful, modular no-code AI builder that enables users to create React applications using natural language prompts, with live preview, dependency management, and AI assistance.

## 🚀 Features

### Core Architecture
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting, autocomplete, and AI-powered suggestions
- **Sandboxed Live Preview**: Secure iframe-based preview that executes user code without Babel at runtime
- **Dependency Management**: Add/remove npm packages with real-time CDN loading
- **AI Assistant**: Natural language to code generation with suggestions and improvements

### Key Components

#### 1. Enhanced Code Editor (`EnhancedCodeEditor.tsx`)
- Monaco Editor with React-specific autocomplete
- Code formatting and syntax highlighting
- Quick templates for common patterns
- AI-powered code suggestions
- Real-time error detection

#### 2. Preview Manager (`PreviewManager.tsx`)
- Sandboxed iframe execution
- Console logging and error capture
- Dependency injection from CDN
- Live reload on code changes
- Theme application support

#### 3. AI Assistant (`AIAssistant.tsx`)
- Natural language code generation
- Context-aware suggestions
- Code explanation and debugging
- Quick action buttons
- Real-time chat interface

#### 4. No-Code Builder (`NoCodeBuilder.tsx`)
- Main application orchestrator
- Tab-based interface (Editor/Preview/AI)
- Auto-save functionality
- Project export and sharing
- Dependency management panel

### Technical Implementation

#### Sandboxed Preview System
```html
<!-- public/preview.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Live Preview</title>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    // Message handler from parent frame
    window.addEventListener('message', async (e) => {
      const { code, deps, theme } = e.data;
      
      // Load dependencies from CDN
      // Preprocess user code
      // Execute in sandboxed environment
    });
  </script>
</body>
</html>
```

#### Dependency Management
- Real-time package validation
- Multiple CDN fallbacks (Skypack, unpkg, jsDelivr)
- Automatic dependency injection
- Version management

#### AI Integration
- RESTful API endpoints (`/api/ai`)
- Multiple AI operation types:
  - `generate`: Create new components
  - `suggest`: Code improvements
  - `explain`: Code documentation
  - `fix`: Bug fixes and optimizations

## 🛠️ Installation

1. Clone the repository:
   ```bash
git clone <repository-url>
   cd ai-no-code-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
cp env.example .env.local
# Add your AI API keys if needed
```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── ai/
│   │       └── route.ts          # AI API endpoints
│   ├── page.tsx                  # Main application page
│   └── layout.tsx                # Root layout
├── components/
│   ├── NoCodeBuilder.tsx         # Main builder component
│   ├── EnhancedCodeEditor.tsx    # Monaco editor wrapper
│   ├── PreviewManager.tsx        # Live preview manager
│   ├── AIAssistant.tsx          # AI chat interface
│   └── ...                       # Other components
└── contexts/
    └── ThemeContext.tsx          # Theme management

public/
└── preview.html                  # Sandboxed preview iframe
```

## 🎯 Usage

### Basic Workflow

1. **Start Building**: Open the application and see the default welcome component
2. **Edit Code**: Use the Monaco editor to modify your React component
3. **Live Preview**: See changes instantly in the sandboxed preview
4. **Add Dependencies**: Click quick-add buttons or manually add npm packages
5. **AI Assistance**: Ask the AI to generate components, add features, or fix issues
6. **Export**: Download your code or share the project

### AI Commands

Try these natural language prompts:

- "Create a login form"
- "Build a todo list"
- "Make a counter component"
- "Add form validation"
- "Make it responsive"
- "Add animations"

### Dependency Management

- **Quick Add**: Use the predefined buttons for common packages
- **Manual Add**: Type package names to add custom dependencies
- **CDN Loading**: Dependencies are automatically loaded from CDN
- **Error Handling**: Failed dependencies are clearly marked

## 🔧 Configuration

### Environment Variables

```env
# AI API Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional: Custom CDN endpoints
SKYPACK_CDN=https://cdn.skypack.dev
UNPKG_CDN=https://unpkg.com
```

### Customization

#### Adding New AI Providers

1. Create a new API route in `src/app/api/ai/`
2. Implement the AI interface
3. Update the AI assistant to use the new provider

#### Extending Dependencies

1. Add new packages to the quick-add list in `NoCodeBuilder.tsx`
2. Update CDN validation logic in `PreviewManager.tsx`
3. Test package compatibility

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security

### Sandboxing
- Preview iframe uses `sandbox="allow-scripts"` for isolation
- No `allow-same-origin` to prevent XSS attacks
- CSP headers prevent unauthorized script execution

### Code Validation
- Input sanitization for user code
- Dependency validation before loading
- Error boundaries prevent crashes

## 🧪 Testing

   ```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Lucide React](https://lucide.dev/) for icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

Built with ❤️ using Next.js, React, and AI 