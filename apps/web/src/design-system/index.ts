// Design System Tokens
export * from './tokens';

// Core Components
export * from './components/Typography';
export * from './components/Button';
export * from './components/Form';
export * from './components/Card';
export * from './components/Navigation';
export * from './components/Filter';
export * from './components/Widget';
export * from './components/Layout';

// Icons - export individually to avoid conflicts
export { Icons, Icon } from './components/Icons';
export type { IconProps } from './components/Icons';

// Re-export utility functions
export { cn } from '../lib/utils';

// Design System Configuration
export const designSystem = {
  name: 'Klynaa Design System',
  version: '1.0.0',
  tokens: {
    colors: {
      primary: 'var(--color-primary)',
      secondary: 'var(--color-secondary)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
      error: 'var(--color-error)',
      neutral: 'var(--color-neutral)',
    },
    typography: {
      fontFamily: {
        sans: 'var(--font-family-sans)',
        mono: 'var(--font-family-mono)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
      },
    },
    spacing: {
      unit: '0.25rem', // 4px
      scale: [0, 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64],
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    shadows: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
      xl: 'var(--shadow-xl)',
    },
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  components: {
    // Component default props and variants can be configured here
    Button: {
      defaultProps: {
        variant: 'primary',
        size: 'md',
      },
    },
    Card: {
      defaultProps: {
        variant: 'default',
        padding: 'md',
      },
    },
    Typography: {
      defaultProps: {
        variant: 'body1',
        color: 'default',
      },
    },
  },
} as const;

// Theme provider context (for future theme switching)
export interface Theme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
}

// Default themes
export const themes: Record<string, Theme> = {
  light: {
    mode: 'light',
    primaryColor: '#16a34a', // green-600
    secondaryColor: '#0369a1', // sky-700
  },
  dark: {
    mode: 'dark',
    primaryColor: '#22c55e', // green-500
    secondaryColor: '#0ea5e9', // sky-500
  },
  klynaa: {
    mode: 'light',
    primaryColor: '#059669', // emerald-600 (eco-friendly)
    secondaryColor: '#0891b2', // cyan-600 (clean/fresh)
  },
} as const;