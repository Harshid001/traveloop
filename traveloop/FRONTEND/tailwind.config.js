/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo 600
          light: '#6366F1',   // Indigo 500
          dark: '#4338CA',    // Indigo 700
        },
        secondary: {
          DEFAULT: '#7C3AED', // Purple 600
          light: '#8B5CF6',   // Purple 500
          dark: '#6D28D9',    // Purple 700
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan 500
          light: '#22D3EE',   // Cyan 400
          dark: '#0891B2',    // Cyan 600
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: {
          DEFAULT: '#ffffff',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          dark: '#0F172A',
          darkCard: '#1E293B',
          darkHover: '#334155',
        },
        textDark: '#0F172A',
        textMuted: '#64748B',
        borderLight: '#E2E8F0',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0,0,0,0.04)',
        'hover': '0 12px 40px rgba(79, 70, 229, 0.12)',
        'glow': '0 0 25px rgba(79, 70, 229, 0.3)',
        'card-dark': '0 10px 30px rgba(0,0,0,0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}


