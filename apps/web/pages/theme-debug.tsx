import React, { useEffect, useState } from 'react';
import { useTheme } from '../src/contexts/SimpleThemeContext';
import WorkingThemeToggle from '../src/components/ui/WorkingThemeToggle';

export default function ThemeDebugPage() {
  const { theme, toggleTheme } = useTheme();
  const [hasDarkClass, setHasDarkClass] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window !== 'undefined') {
      setHasDarkClass(document.documentElement.classList.contains('dark'));
    }
  }, [theme]);

  const testToggle = () => {
    console.log('=== MANUAL TOGGLE TEST ===');
    console.log('Current theme:', theme);
    console.log('HTML classes:', document.documentElement.className);
    console.log('Has dark class:', document.documentElement.classList.contains('dark'));

    toggleTheme();

    setTimeout(() => {
      console.log('After toggle HTML classes:', document.documentElement.className);
      console.log('After toggle has dark class:', document.documentElement.classList.contains('dark'));
    }, 100);
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Theme Debug Page
        </h1>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Theme Toggle Component
          </h2>
          <WorkingThemeToggle />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Debug Information
          </h2>
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p><strong>Current theme:</strong> {theme}</p>
            <p><strong>HTML has dark class:</strong> {hasDarkClass ? 'Yes' : 'No'}</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Manual Test Button
            </h2>
            <button
              onClick={testToggle}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Toggle (Check Console)
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Visual Test Elements
            </h2>
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <p>This should be yellow in light mode, dark yellow in dark mode</p>
            </div>
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg">
              <p>This should be red in light mode, dark red in dark mode</p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p>This should be blue in light mode, dark blue in dark mode</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}