import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = localStorage.getItem('klynaa-theme') as Theme;
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setTheme(savedTheme);
        } else {
          // Check system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(systemPrefersDark ? 'dark' : 'light');
        }
      } catch (error) {
        console.warn('Failed to load theme from localStorage:', error);
        setTheme('light');
      }
    };

    loadTheme();
    setMounted(true);
  }, []);

  // Update document class and localStorage when theme changes
  useEffect(() => {
    if (!mounted) return;

    try {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      console.log('Theme applied:', theme, 'HTML classes:', document.documentElement.className);
      localStorage.setItem('klynaa-theme', theme);
    } catch (error) {
      console.warn('Failed to update theme:', error);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log('Toggling theme from:', theme);
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}