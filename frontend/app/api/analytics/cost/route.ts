import { NextResponse } from 'next/server'

export async function GET() {
  // Mock cost analysis data
  const costAnalysis = {
    totalCost: 47070, // $470.70
    costByProvider: {
      'openrouter': 12500,
      'deepseek': 8900,
      'qwen': 5670,
      'google-cli': 21000
    },
    costByModel: {
      'gpt-4': 15000,
      'gpt-3.5-turbo': 8000,
      'claude-3': 12000,
      'deepseek-chat': 6000,
      'qwen-turbo': 4000,
      'gemini-1.5-flash': 18000,
      'gemini-1.5-pro': 3000
    },
    costTrend: Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        cost: Math.floor(Math.random() * 2000) + 500 // Random cost between $5-25
      }
    }),
    budgetAlerts: [
      {
        provider: 'google-cli',
        threshold: 15000,
        currentCost: 21000,
        percentage: 140
      },
      {
        provider: 'openrouter',
        threshold: 10000,
        currentCost: 12500,
        percentage: 125
      },
      {
        provider: 'deepseek',
        threshold: 5000,
        currentCost: 8900,
        percentage: 178
      }
    ]
  }

  return NextResponse.json(costAnalysis)
} 