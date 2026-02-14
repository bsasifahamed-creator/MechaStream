import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { errorId } = body
    
    // Mock error resolution
    console.log('Resolving error:', errorId)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Error marked as resolved',
      errorId,
      resolutionTime: new Date()
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to resolve error' },
      { status: 500 }
    )
  }
} 