import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Simple function to apply theme directly to DOM
  const applyTheme = (newTheme: Theme) => {
    console.log('Applying theme:', newTheme);

    // Remove existing classes
    document.documentElement.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');

    // Add new theme class
    document.documentElement.classList.add(newTheme);
    document.body.classList.add(newTheme);

    // Set data attribute as well for extra compatibility
    document.documentElement.setAttribute('data-theme', newTheme);

    // Update CSS custom properties directly
    if (newTheme === 'dark') {
      document.documentElement.style.setProperty('--bg-color', '#111827');
      document.documentElement.style.setProperty('--text-color', '#f3f4f6');
    } else {
      document.documentElement.style.setProperty('--bg-color', '#f9fafb');
      document.documentElement.style.setProperty('--text-color', '#111827');
    }

    // Save to localStorage
    try {
      localStorage.setItem('klynaa-theme', newTheme);
      console.log('Theme saved to localStorage:', newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }

    console.log('Theme applied successfully. HTML classes:', document.documentElement.className);
  };

  // Load theme on mount
  useEffect(() => {
    console.log('ThemeProvider: Loading initial theme');

    let initialTheme: Theme = 'light';

    try {
      const savedTheme = localStorage.getItem('klynaa-theme') as Theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        initialTheme = savedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
    } catch (e) {
      console.warn('Failed to load theme:', e);
    }

    console.log('Initial theme will be:', initialTheme);
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    console.log('🎨 THEME TOGGLE CALLED - Current theme:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('🎨 SWITCHING TO:', newTheme);

    setTheme(newTheme);
    applyTheme(newTheme);

    console.log('🎨 THEME TOGGLE COMPLETED');
  };

  const value = {
    theme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}