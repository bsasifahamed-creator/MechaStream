# LLM API Setup Guide

This guide will help you set up external LLM APIs for the chatbot code generation.

## Supported LLM Providers

1. **OpenAI** (GPT-4) - Most powerful, paid
2. **Groq** (Llama3) - Fast, paid
3. **OpenRouter** (Claude 3.5 Sonnet) - Multiple models, paid
4. **Fallback** - Local responses (free, limited)

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in your project root:

```bash
# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Get API Keys

#### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and add payment method
3. Generate an API key
4. Add to `.env.local`: `OPENAI_API_KEY=sk-...`

#### Groq
1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an account
3. Generate an API key
4. Add to `.env.local`: `GROQ_API_KEY=gsk_...`

#### OpenRouter
1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Create an account
3. Generate an API key
4. Add to `.env.local`: `OPENROUTER_API_KEY=sk-or-...`

### 3. Test the Setup

1. Start your development server: `npm run dev`
2. Go to: http://localhost:3000/chatbot-demo
3. Try these prompts:
   - "create a login form"
   - "create a todo list"
   - "create a counter"

### 4. Provider Selection

The chatbot will automatically try providers in this order:
1. **Fallback** (if no API keys configured)
2. **OpenAI** (if OPENAI_API_KEY is set)
3. **Groq** (if GROQ_API_KEY is set)
4. **OpenRouter** (if OPENROUTER_API_KEY is set)

## API Costs

- **OpenAI**: ~$0.03 per 1K tokens
- **Groq**: ~$0.05 per 1M tokens
- **OpenRouter**: Varies by model
- **Fallback**: Free (limited responses)

## Troubleshooting

### API Key Issues
- Ensure your API key is correct
- Check if you have sufficient credits
- Verify the key is in the correct format

### Rate Limits
- OpenAI: 3 requests per minute (free tier)
- Groq: 100 requests per minute
- OpenRouter: Varies by plan

### Fallback Mode
If all APIs fail, the system will use predefined responses for common requests like:
- "create a login form"
- "create a todo list"
- "create a counter"

## Advanced Configuration

You can specify a provider in your requests:

```javascript
// In your chatbot component
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'create a login form',
    provider: 'openai' // or 'groq', 'openrouter', 'fallback'
  })
});
``` 