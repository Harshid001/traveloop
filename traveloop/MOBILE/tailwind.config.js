/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.js',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0F9D8F',
        bg: '#F8FAFC',
        dark: '#1E293B',
        navy: '#0F172A',
        muted: '#64748B',
        border: '#E2E8F0',
      },
    },
  },
  plugins: [],
};
