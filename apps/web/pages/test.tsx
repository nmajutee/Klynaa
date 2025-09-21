import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-900">
          🧪 Test Page
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tailwind CSS Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-100 p-4 rounded text-red-800">Red Box</div>
            <div className="bg-green-100 p-4 rounded text-green-800">Green Box</div>
            <div className="bg-blue-100 p-4 rounded text-blue-800">Blue Box</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="text-yellow-800">
            If you can see colors and styling on this page, then Tailwind CSS is working correctly!
          </p>
          <p className="text-sm text-yellow-600 mt-2">
            Go to <code className="bg-yellow-200 px-1 rounded">/components</code> to see your design system components.
          </p>
        </div>
      </div>
    </div>
  );
}