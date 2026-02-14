import { NextRequest, NextResponse } from 'next/server';
import { LiveMonitor } from '@/services/LiveMonitor';
import { RealProviderConnector } from '@/services/RealProviderConnector';

export async function GET(request: NextRequest) {
  try {
    const monitor = LiveMonitor.getInstance();
    const connector = RealProviderConnector.getInstance();

    // Get real-time data
    const providerStatuses = monitor.getAllProviderStatuses();
    const systemMetrics = monitor.getSystemMetrics();
    const healthSummary = monitor.getHealthSummary();
    const availableProviders = connector.getAvailableProviders();
    const usageStats = connector.getAllUsageStats();

    // Convert usage stats to array format
    const usageArray = Array.from(usageStats.entries()).map(([provider, stats]) => ({
      provider,
      totalCost: stats.totalCost,
      totalTokens: stats.totalTokens
    }));

    return NextResponse.json({
      success: true,
      data: {
        providers: providerStatuses,
        metrics: systemMetrics,
        health: healthSummary,
        available: availableProviders,
        usage: usageArray,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Live status error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get live status',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();
    const monitor = LiveMonitor.getInstance();

    switch (action) {
      case 'force_health_check':
        await monitor.forceHealthCheck();
        return NextResponse.json({
          success: true,
          message: 'Health check initiated'
        });

      case 'get_provider_status':
        const { provider } = await request.json();
        const status = monitor.getProviderStatus(provider);
        return NextResponse.json({
          success: true,
          data: status
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Live status action error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform action',
      details: error.message
    }, { status: 500 });
  }
} 