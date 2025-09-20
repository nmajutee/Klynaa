export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">System Overview</h3>
          <p className="mt-2 text-gray-600">Monitor overall system health and performance</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Total Users:</span>
              <span className="font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span>Active Workers:</span>
              <span className="font-semibold">34</span>
            </div>
            <div className="flex justify-between">
              <span>System Status:</span>
              <span className="font-semibold text-green-600">Healthy</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <p className="mt-2 text-gray-600">Manage customers, workers, and admins</p>
          <div className="mt-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Manage Users
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
          <p className="mt-2 text-gray-600">View detailed reports and analytics</p>
          <div className="mt-4">
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}