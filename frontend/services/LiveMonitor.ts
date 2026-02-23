import { RealProviderConnector } from './RealProviderConnector';

export interface ProviderStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  uptime: number;
  costToday: number;
  requestsToday: number;
}

export interface SystemMetrics {
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  errorRate: number;
  activeProviders: number;
  lastUpdated: Date;
}

export class LiveMonitor {
  private static instance: LiveMonitor;
  private statusCache: Map<string, ProviderStatus> = new Map();
  private metrics: SystemMetrics = {
    totalRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    errorRate: 0,
    activeProviders: 0,
    lastUpdated: new Date()
  };
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: any) => void> = new Set();

  private constructor() {
    this.startHealthChecks();
  }

  public static getInstance(): LiveMonitor {
    if (!LiveMonitor.instance) {
      LiveMonitor.instance = new LiveMonitor();
    }
    return LiveMonitor.instance;
  }

  private async startHealthChecks(): Promise<void> {
    // Initial health check
    await this.performHealthCheck();

    // Set up periodic health checks every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    const connector = RealProviderConnector.getInstance();
    const providers = connector.getAvailableProviders();
    
    const healthPromises = providers.map(async (provider) => {
      const status = await this.checkProviderHealth(provider);
      this.statusCache.set(provider, status);
      return status;
    });

    await Promise.all(healthPromises);
    this.updateSystemMetrics();
    this.notifySubscribers();
  }

  private async checkProviderHealth(provider: string): Promise<ProviderStatus> {
    const startTime = Date.now();
    const connector = RealProviderConnector.getInstance();
    const config = connector.getProviderConfig(provider);
    const usage = connector.getUsageStats(provider);

    if (!config) {
      return {
        name: provider,
        status: 'unknown',
        responseTime: 0,
        errorRate: 0,
        lastCheck: new Date(),
        uptime: 0,
        costToday: 0,
        requestsToday: 0
      };
    }

    try {
      // Perform a simple test request
      const testPrompt = 'Generate a simple React component that displays "Hello World"';
      let response;

      if (provider === 'google') {
        response = await connector.generateWithGoogle(testPrompt);
      } else if (provider === 'anthropic') {
        response = await connector.generateWithAnthropic(testPrompt);
      } else {
        response = await connector.generateWithOpenAI(provider, testPrompt);
      }

      const responseTime = Date.now() - startTime;
      const status: ProviderStatus = {
        name: config.name,
        status: response.success ? 'online' : 'degraded',
        responseTime,
        errorRate: response.success ? 0 : 1,
        lastCheck: new Date(),
        uptime: response.success ? 100 : 0,
        costToday: usage?.totalCost || 0,
        requestsToday: Math.floor((usage?.totalTokens || 0) / 100) // Estimate
      };

      return status;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        name: config.name,
        status: 'offline',
        responseTime,
        errorRate: 1,
        lastCheck: new Date(),
        uptime: 0,
        costToday: usage?.totalCost || 0,
        requestsToday: Math.floor((usage?.totalTokens || 0) / 100)
      };
    }
  }

  private updateSystemMetrics(): void {
    const statuses = Array.from(this.statusCache.values());
    const onlineProviders = statuses.filter(s => s.status === 'online');
    
    this.metrics = {
      totalRequests: statuses.reduce((sum, s) => sum + s.requestsToday, 0),
      totalCost: statuses.reduce((sum, s) => sum + s.costToday, 0),
      averageResponseTime: statuses.length > 0 
        ? statuses.reduce((sum, s) => sum + s.responseTime, 0) / statuses.length 
        : 0,
      errorRate: statuses.length > 0 
        ? statuses.reduce((sum, s) => sum + s.errorRate, 0) / statuses.length 
        : 0,
      activeProviders: onlineProviders.length,
      lastUpdated: new Date()
    };
  }

  public subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const data = {
      providers: Array.from(this.statusCache.values()),
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };

    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  public getProviderStatus(provider: string): ProviderStatus | undefined {
    return this.statusCache.get(provider);
  }

  public getAllProviderStatuses(): ProviderStatus[] {
    return Array.from(this.statusCache.values());
  }

  public getSystemMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public async forceHealthCheck(): Promise<void> {
    await this.performHealthCheck();
  }

  public getHealthSummary(): {
    online: number;
    offline: number;
    degraded: number;
    total: number;
  } {
    const statuses = Array.from(this.statusCache.values());
    return {
      online: statuses.filter(s => s.status === 'online').length,
      offline: statuses.filter(s => s.status === 'offline').length,
      degraded: statuses.filter(s => s.status === 'degraded').length,
      total: statuses.length
    };
  }

  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.subscribers.clear();
  }
} 