import { NextResponse } from 'next/server'

export async function GET() {
  // Mock analytics export data
  const exportData = {
    metrics: [
      {
        provider: 'openrouter',
        requests: 1250,
        tokens: 450000,
        cost: 12500,
        errors: 19,
        successRate: 98.5,
        averageResponseTime: 1200,
        lastUsed: new Date()
      },
      {
        provider: 'deepseek',
        requests: 890,
        tokens: 320000,
        cost: 8900,
        errors: 43,
        successRate: 95.2,
        averageResponseTime: 1800,
        lastUsed: new Date(Date.now() - 300000)
      },
      {
        provider: 'qwen',
        requests: 567,
        tokens: 180000,
        cost: 5670,
        errors: 45,
        successRate: 92.1,
        averageResponseTime: 2200,
        lastUsed: new Date(Date.now() - 86400000)
      },
      {
        provider: 'google-cli',
        requests: 2100,
        tokens: 750000,
        cost: 21000,
        errors: 46,
        successRate: 97.8,
        averageResponseTime: 950,
        lastUsed: new Date(Date.now() - 60000)
      }
    ],
    costAnalysis: {
      totalCost: 47070,
      costByProvider: {
        'openrouter': 12500,
        'deepseek': 8900,
        'qwen': 5670,
        'google-cli': 21000
      }
    },
    performanceMetrics: {
      averageResponseTime: 1437.5,
      responseTimeByProvider: {
        'openrouter': 1200,
        'deepseek': 1800,
        'qwen': 2200,
        'google-cli': 950
      }
    },
    alerts: [
      {
        id: 'cost-google-cli-1',
        type: 'cost_threshold',
        severity: 'high',
        message: 'Google CLI cost threshold exceeded: $210.00',
        provider: 'google-cli',
        timestamp: new Date(Date.now() - 3600000),
        resolved: false
      }
    ],
    summary: {
      totalRequests: 4807,
      totalTokens: 1700000,
      totalCost: 47070,
      totalErrors: 153,
      averageSuccessRate: 96.8,
      averageResponseTime: 1437.5
    },
    exportDate: new Date().toISOString()
  }

  return NextResponse.json(exportData)
} 