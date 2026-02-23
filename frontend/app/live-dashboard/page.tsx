import LiveDashboard from '@/components/LiveDashboard';

export default function LiveDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Live System Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring of AI providers, performance metrics, and system health
          </p>
        </div>
        
        <LiveDashboard />
      </div>
    </div>
  );
} 