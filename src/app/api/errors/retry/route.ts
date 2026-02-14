import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { errorId } = body
    
    // Mock error retry
    console.log('Retrying error:', errorId)
    
    // Simulate retry success/failure
    const success = Math.random() > 0.3 // 70% success rate
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Retry successful',
        errorId
      })
    } else {
      return NextResponse.json(
        { error: 'Retry failed - error still persists' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retry error' },
      { status: 500 }
    )
  }
} 