import React, { useEffect, useState } from 'react';
import { useTheme } from '../src/contexts/SimpleThemeContext';
import WorkingThemeToggle from '../src/components/ui/WorkingThemeToggle';

export default function ThemeTestPage() {
  const { theme, toggleTheme } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState<string>('');

  // Update HTML classes display whenever theme changes
  useEffect(() => {
    const checkClasses = () => {
      setHtmlClasses(document.documentElement.className || 'no classes');
    };

    checkClasses();
    // Set up a small interval to continuously check
    const interval = setInterval(checkClasses, 1000);
    return () => clearInterval(interval);
  }, [theme]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
      color: theme === 'dark' ? '#f3f4f6' : '#111827',
      padding: '2rem'
    }}>
      <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>🎨 Theme Test Page</h1>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Current Status:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>🎭 <strong>Theme State:</strong> {theme}</li>
          <li>🏷️ <strong>HTML Classes:</strong> {htmlClasses}</li>
          <li>🎯 <strong>Expected:</strong> Should be 'dark' or 'light'</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => {
            console.log('=== MANUAL THEME TOGGLE TEST ===');
            console.log('Before toggle - Theme:', theme);
            console.log('Before toggle - HTML classes:', document.documentElement.className);
            toggleTheme();
            setTimeout(() => {
              console.log('After toggle - Theme should be:', theme === 'light' ? 'dark' : 'light');
              console.log('After toggle - HTML classes:', document.documentElement.className);
            }, 100);
          }}
          style={{
            padding: '1rem 2rem',
            backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            color: theme === 'dark' ? '#f3f4f6' : '#111827',
            border: '2px solid',
            borderColor: theme === 'dark' ? '#6b7280' : '#d1d5db',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          🔄 Toggle Theme
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem' }}>Navigation Toggle:</span>
          <WorkingThemeToggle />
        </div>

        <button
          onClick={() => {
            console.log('=== MANUAL THEME CHECK ===');
            console.log('Current theme state:', theme);
            console.log('Document element classes:', document.documentElement.className);
            console.log('Document element style:', document.documentElement.style.cssText);
            console.log('localStorage theme:', localStorage.getItem('klynaa-theme'));
          }}
          style={{
            padding: '1rem 2rem',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔍 Debug Info
        </button>
      </div>

      {/* Visual Test Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{
          padding: '1.5rem',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>📝 Inline Styles Test</h3>
          <p>This card uses inline styles and should always work properly.</p>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <h3 className="m-0 mb-4 text-neutral-900 dark:text-neutral-100">🎨 Tailwind Classes Test</h3>
          <p className="text-neutral-600 dark:text-neutral-300">This card uses Tailwind classes and might not work if CSS compilation is broken.</p>
        </div>
      </div>

      <div style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db'
      }}>
        <h2>Debug Console Output:</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
          Open browser DevTools → Console to see theme toggle logs
        </p>
        <pre style={{
          fontSize: '0.75rem',
          backgroundColor: theme === 'dark' ? '#111827' : '#ffffff',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          overflow: 'auto'
        }}>
Expected logs:
{`Toggling theme from: light
Setting theme to: dark
Theme applied: dark HTML classes: dark`}
        </pre>
      </div>
    </div>
  );
}