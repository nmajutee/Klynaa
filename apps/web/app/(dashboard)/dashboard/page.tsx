import { DashboardStats } from '../../../src/widgets/dashboard-stats';

export default function Page() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to your waste management dashboard
        </p>
      </div>

      <DashboardStats
        totalBins={156}
        pendingPickups={23}
        activeWorkers={12}
        completionRate={89}
      />

      <div className="mt-8">
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500">
              Recent pickup requests and bin status updates will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}