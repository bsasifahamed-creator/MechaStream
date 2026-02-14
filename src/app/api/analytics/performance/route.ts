import { NextResponse } from 'next/server'

export async function GET() {
  // Mock performance metrics data
  const performanceMetrics = {
    averageResponseTime: 1437.5, // Average of all providers
    responseTimeByProvider: {
      'openrouter': 1200,
      'deepseek': 1800,
      'qwen': 2200,
      'google-cli': 950
    },
    successRateByProvider: {
      'openrouter': 98.5,
      'deepseek': 95.2,
      'qwen': 92.1,
      'google-cli': 97.8
    },
    errorRateByProvider: {
      'openrouter': 1.5,
      'deepseek': 4.8,
      'qwen': 7.9,
      'google-cli': 2.2
    },
    throughputByHour: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      requests: Math.floor(Math.random() * 50) + 10 // Random requests between 10-60 per hour
    }))
  }

  return NextResponse.json(performanceMetrics)
} 