import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { provider } = body
    
    // Mock provider switching
    console.log('Switching to provider:', provider)
    
    return NextResponse.json({ 
      success: true, 
      message: `Switched to ${provider}`,
      currentProvider: provider
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to switch provider' },
      { status: 500 }
    )
  }
} 