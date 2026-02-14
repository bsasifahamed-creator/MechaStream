import { NextResponse } from 'next/server'

export async function GET() {
  // Mock usage data
  const usage = [
    {
      provider: 'openrouter',
      requests: 1250,
      tokens: 450000,
      cost: 12500, // $125.00 in cents
      errors: 19,
      lastUsed: new Date()
    },
    {
      provider: 'deepseek',
      requests: 890,
      tokens: 320000,
      cost: 8900, // $89.00 in cents
      errors: 43,
      lastUsed: new Date(Date.now() - 300000) // 5 minutes ago
    },
    {
      provider: 'qwen',
      requests: 567,
      tokens: 180000,
      cost: 5670, // $56.70 in cents
      errors: 45,
      lastUsed: new Date(Date.now() - 86400000) // 1 day ago
    },
    {
      provider: 'google-cli',
      requests: 2100,
      tokens: 750000,
      cost: 21000, // $210.00 in cents
      errors: 46,
      lastUsed: new Date(Date.now() - 60000) // 1 minute ago
    }
  ]

  return NextResponse.json({ usage })
} 