/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Blue 600
          light: '#3B82F6',   // Blue 500
          dark: '#1D4ED8',    // Blue 700
        },
        accent: {
          DEFAULT: '#4F46E5', // Indigo 600
          light: '#6366F1',   // Indigo 500
          dark: '#4338CA',    // Indigo 700
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: {
          DEFAULT: '#ffffff',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
        },
        textDark: '#0F172A',
        textMuted: '#64748B',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.03)',
        'hover': '0 10px 40px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
