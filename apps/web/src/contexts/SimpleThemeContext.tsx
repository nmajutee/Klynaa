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
  const applyTheme = (theme: Theme) => {
    console.log('🔥 applyTheme called with:', theme);

    if (typeof window !== 'undefined') {
      const html = document.documentElement;
      console.log('🔥 HTML element before:', html.className);

      // Force remove and add classes
      html.classList.remove('light', 'dark');

      if (theme === 'dark') {
        html.classList.add('dark');
        // Also set attribute for maximum compatibility
        html.setAttribute('data-theme', 'dark');
        // Force CSS custom properties
        document.body.style.setProperty('--theme', 'dark');
      } else {
        html.classList.add('light');
        html.setAttribute('data-theme', 'light');
        document.body.style.setProperty('--theme', 'light');
      }

      console.log('🔥 HTML element after:', html.className);
      console.log('🔥 Has dark class:', html.classList.contains('dark'));
      console.log('🔥 Data theme attribute:', html.getAttribute('data-theme'));

      // Force a repaint
      html.style.display = 'none';
      html.offsetHeight; // Trigger reflow
      html.style.display = '';
    }
  };  // Load theme on mount
  useEffect(() => {
    console.log('🎨 ThemeProvider: Loading initial theme');

    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    let initialTheme: Theme = 'light';

    try {
      const savedTheme = localStorage.getItem('klynaa-theme') as Theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        initialTheme = savedTheme;
        console.log('🎨 Found saved theme:', savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
        console.log('🎨 Using system preference: dark');
      } else {
        console.log('🎨 Using default: light');
      }
    } catch (e) {
      console.warn('Failed to load theme:', e);
    }

    console.log('🎨 Initial theme will be:', initialTheme);
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