import { NextResponse } from 'next/server'

export async function GET() {
  // Mock analytics alerts data
  const alerts = [
    {
      id: 'cost-google-cli-1',
      type: 'cost_threshold',
      severity: 'high',
      message: 'Google CLI cost threshold exceeded: $210.00',
      provider: 'google-cli',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      resolved: false
    },
    {
      id: 'cost-openrouter-1',
      type: 'cost_threshold',
      severity: 'medium',
      message: 'OpenRouter cost threshold exceeded: $125.00',
      provider: 'openrouter',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      resolved: false
    },
    {
      id: 'perf-qwen-1',
      type: 'performance_degradation',
      severity: 'high',
      message: 'Qwen response time degraded: 8500ms',
      provider: 'qwen',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      resolved: true,
      resolutionTime: new Date(Date.now() - 5400000) // 1.5 hours ago
    },
    {
      id: 'error-deepseek-1',
      type: 'error_spike',
      severity: 'critical',
      message: 'DeepSeek error spike detected: 85 errors in last 7 days',
      provider: 'deepseek',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      resolved: false
    },
    {
      id: 'rate-openrouter-1',
      type: 'rate_limit',
      severity: 'medium',
      message: 'OpenRouter rate limit exceeded',
      provider: 'openrouter',
      timestamp: new Date(Date.now() - 18000000), // 5 hours ago
      resolved: true,
      resolutionTime: new Date(Date.now() - 9000000) // 2.5 hours ago
    }
  ]

  return NextResponse.json({ alerts })
} 