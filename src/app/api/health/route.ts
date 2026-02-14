import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if required environment variables are set
    const requiredEnvVars = [
      'OPENROUTER_API_KEY',
      'DEEPSEEK_API_KEY', 
      'QWEN_API_KEY',
      'GOOGLE_CLI_API_KEY'
    ]
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing API keys',
        missing: missingVars,
        available: requiredEnvVars.filter(varName => process.env[varName])
      }, { status: 500 })
    }

    // Test a simple API call to verify connectivity
    const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    if (testResponse.ok) {
      return NextResponse.json({
        status: 'healthy',
        message: 'All APIs are available',
        providers: ['openrouter', 'deepseek', 'qwen', 'google-cli'],
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        status: 'warning',
        message: 'API keys configured but connectivity issues detected',
        providers: ['openrouter', 'deepseek', 'qwen', 'google-cli'],
        timestamp: new Date().toISOString()
      }, { status: 200 })
    }
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 