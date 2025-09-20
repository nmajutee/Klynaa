'use client'

interface DashboardStatsProps {
  totalBins: number;
  pendingPickups: number;
  activeWorkers: number;
  completionRate: number;
}

export function DashboardStats({
  totalBins,
  pendingPickups,
  activeWorkers,
  completionRate,
}: DashboardStatsProps) {
  const stats = [
    { name: 'Total Bins', value: totalBins, icon: '🗑️' },
    { name: 'Pending Pickups', value: pendingPickups, icon: '🚚' },
    { name: 'Active Workers', value: activeWorkers, icon: '👷' },
    { name: 'Today\'s Collections', value: `${completionRate}%`, icon: '📈' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.name} className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">
                  {stat.name}
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stat.value}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}