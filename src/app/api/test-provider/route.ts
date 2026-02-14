import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { provider } = body
    
    // Mock provider testing
    console.log('Testing provider:', provider)
    
    // Simulate different test results based on provider
    const testResults = {
      'openrouter': { success: true, responseTime: 1200, message: 'OpenRouter test successful' },
      'deepseek': { success: true, responseTime: 1800, message: 'DeepSeek test successful' },
      'qwen': { success: false, responseTime: 0, message: 'Qwen API key is invalid' },
      'google-cli': { success: true, responseTime: 950, message: 'Google CLI test successful' }
    }
    
    const result = (testResults as any)[provider] || {
      success: false,
      responseTime: 0,
      message: 'Provider not found'
    }
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.message,
        responseTime: result.responseTime
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to test provider' },
      { status: 500 }
    )
  }
} 