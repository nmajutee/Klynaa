import React from 'react';
import { useTheme } from '../../src/contexts/SimpleThemeContext';

export default function ThemeDebugger() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-4 left-4 z-50 p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">Theme Debug</h3>
      <div className="space-y-1 text-sm">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Current theme:</strong> {theme}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>HTML has dark class:</strong> {document?.documentElement?.classList?.contains('dark') ? 'Yes' : 'No'}
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Background should be:</strong> {theme === 'dark' ? 'Dark' : 'Light'}
        </p>
        <button
          onClick={toggleTheme}
          className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
        >
          Toggle Theme (Current: {theme})
        </button>
      </div>
    </div>
  );
}