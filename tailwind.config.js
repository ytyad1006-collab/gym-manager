/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 'Inter' ko default sans font banaya gaya hai
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dashboard specific palette
        brand: {
          light: '#eff6ff',
          DEFAULT: '#3b82f6', // Primary Blue
          dark: '#1d4ed8',
        },
        sidebar: '#1e293b', // Dark slate for sidebar
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
}