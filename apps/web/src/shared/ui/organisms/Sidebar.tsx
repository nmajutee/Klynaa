'use client'

export function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Bins', href: '/dashboard/bins', icon: '🗑️' },
    { name: 'Pickups', href: '/dashboard/pickups', icon: '🚚' },
    { name: 'Routes', href: '/dashboard/routes', icon: '🗺️' },
    { name: 'Workers', href: '/dashboard/workers', icon: '👷' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  ]

  return (
    <div className="w-64 bg-white shadow-sm">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Klynaa</h1>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="flex items-center rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}