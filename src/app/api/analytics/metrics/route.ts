import { NextResponse } from 'next/server'

export async function GET() {
  // Mock analytics metrics data
  const metrics = [
    {
      provider: 'openrouter',
      requests: 1250,
      tokens: 450000,
      cost: 12500,
      errors: 19,
      successRate: 98.5,
      averageResponseTime: 1200,
      lastUsed: new Date(),
      dailyUsage: [
        { date: '2024-01-15', requests: 45, tokens: 16000, cost: 450, errors: 1 },
        { date: '2024-01-16', requests: 52, tokens: 18500, cost: 520, errors: 2 },
        { date: '2024-01-17', requests: 38, tokens: 13500, cost: 380, errors: 0 }
      ],
      hourlyUsage: [
        { hour: 9, requests: 8, tokens: 2800, cost: 80 },
        { hour: 10, requests: 12, tokens: 4200, cost: 120 },
        { hour: 11, requests: 15, tokens: 5300, cost: 150 }
      ]
    },
    {
      provider: 'deepseek',
      requests: 890,
      tokens: 320000,
      cost: 8900,
      errors: 43,
      successRate: 95.2,
      averageResponseTime: 1800,
      lastUsed: new Date(Date.now() - 300000),
      dailyUsage: [
        { date: '2024-01-15', requests: 32, tokens: 11500, cost: 320, errors: 3 },
        { date: '2024-01-16', requests: 28, tokens: 10000, cost: 280, errors: 2 },
        { date: '2024-01-17', requests: 25, tokens: 9000, cost: 250, errors: 1 }
      ],
      hourlyUsage: [
        { hour: 9, requests: 5, tokens: 1800, cost: 50 },
        { hour: 10, requests: 8, tokens: 2900, cost: 80 },
        { hour: 11, requests: 10, tokens: 3600, cost: 100 }
      ]
    },
    {
      provider: 'qwen',
      requests: 567,
      tokens: 180000,
      cost: 5670,
      errors: 45,
      successRate: 92.1,
      averageResponseTime: 2200,
      lastUsed: new Date(Date.now() - 86400000),
      dailyUsage: [
        { date: '2024-01-15', requests: 20, tokens: 6500, cost: 200, errors: 4 },
        { date: '2024-01-16', requests: 18, tokens: 5800, cost: 180, errors: 3 },
        { date: '2024-01-17', requests: 15, tokens: 4800, cost: 150, errors: 2 }
      ],
      hourlyUsage: [
        { hour: 9, requests: 3, tokens: 1000, cost: 30 },
        { hour: 10, requests: 5, tokens: 1600, cost: 50 },
        { hour: 11, requests: 6, tokens: 1900, cost: 60 }
      ]
    },
    {
      provider: 'google-cli',
      requests: 2100,
      tokens: 750000,
      cost: 21000,
      errors: 46,
      successRate: 97.8,
      averageResponseTime: 950,
      lastUsed: new Date(Date.now() - 60000),
      dailyUsage: [
        { date: '2024-01-15', requests: 75, tokens: 27000, cost: 750, errors: 2 },
        { date: '2024-01-16', requests: 82, tokens: 29500, cost: 820, errors: 1 },
        { date: '2024-01-17', requests: 68, tokens: 24500, cost: 680, errors: 0 }
      ],
      hourlyUsage: [
        { hour: 9, requests: 12, tokens: 4300, cost: 120 },
        { hour: 10, requests: 18, tokens: 6500, cost: 180 },
        { hour: 11, requests: 22, tokens: 7900, cost: 220 }
      ]
    }
  ]

  return NextResponse.json({ metrics })
} 