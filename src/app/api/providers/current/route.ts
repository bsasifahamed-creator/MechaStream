import { NextResponse } from 'next/server'

export async function GET() {
  // Mock current provider data
  const currentProvider = 'openrouter'
  
  return NextResponse.json({ currentProvider })
} 