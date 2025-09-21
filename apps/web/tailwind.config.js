/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Klynaa Design System Colors
        klynaa: {
          primary: '#4CAF50',      // Primary Green
          darkgreen: '#2E7D32',    // Dark Green
          yellow: '#FBC02D',       // Yellow/Accent
          dark: '#1C1C1C',         // Black/Dark Gray
          neutral: '#6E6E6E',      // Body Text Gray
          lightgray: '#F5F5F5',    // Light Gray
          graylabel: '#9E9E9E',    // Caption/Label Gray
        },
        // Keep existing colors for backward compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        green: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4CAF50',
          600: '#2E7D32',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        }
      },
    },
  },
  plugins: [],
};
