export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-7xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Klynaa Waste Management
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Enterprise-grade waste management platform built with modern architecture
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/dashboard"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              Get started
            </a>
            <a href="/about" className="text-sm font-semibold leading-6 text-gray-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}