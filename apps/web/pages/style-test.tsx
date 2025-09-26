import React from 'react';

export default function StyleTest() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Klynaa Style Test</h1>

      {/* Primary Button Test */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Primary Buttons</h2>
        <button className="bg-klynaa-primary hover:bg-klynaa-darkgreen text-white px-4 py-2 rounded-lg transition-colors font-medium mr-4">
          Klynaa Green Button
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
          Blue Button (Old)
        </button>
      </div>

      {/* Outline Button Test */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Outline Buttons</h2>
        <button className="bg-transparent border border-klynaa-primary text-klynaa-primary hover:bg-klynaa-primary hover:text-white px-4 py-2 rounded-lg transition-colors font-medium mr-4">
          Klynaa Green Outline
        </button>
        <button className="bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium">
          Blue Outline (Old)
        </button>
      </div>

      {/* Color Swatches */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Color Swatches</h2>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-klynaa-primary rounded-lg flex items-center justify-center text-white text-xs">
            Primary
          </div>
          <div className="w-16 h-16 bg-klynaa-darkgreen rounded-lg flex items-center justify-center text-white text-xs">
            Dark Green
          </div>
          <div className="w-16 h-16 bg-klynaa-yellow rounded-lg flex items-center justify-center text-white text-xs">
            Yellow
          </div>
          <div className="w-16 h-16 bg-klynaa-dark rounded-lg flex items-center justify-center text-white text-xs">
            Dark
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Dashboard Links</h2>
        <div className="space-y-2">
          <a href="/admin/dashboard" className="block text-klynaa-primary hover:text-klynaa-darkgreen">
            → Admin Dashboard
          </a>
          <a href="/worker/dashboard" className="block text-klynaa-primary hover:text-klynaa-darkgreen">
            → Worker Dashboard
          </a>
          <a href="/bin-owner/dashboard" className="block text-klynaa-primary hover:text-klynaa-darkgreen">
            → Bin Owner Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}