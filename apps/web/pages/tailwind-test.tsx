import React from 'react';

export default function TailwindTest() {
  return (
    <div className="p-8 bg-blue-500">
      <h1 className="text-4xl font-bold text-white mb-4">Tailwind Test</h1>
      <div className="space-y-4">
        <div className="bg-red-500 text-white p-4 rounded">Red Background</div>
        <div className="bg-green-500 text-white p-4 rounded">Green Background</div>
        <div className="bg-klynaa-primary text-white p-4 rounded">Klynaa Primary</div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Test Button
        </button>
      </div>
    </div>
  );
}