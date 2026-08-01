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
          DEFAULT: '#6366F1', // Indigo 500
          light: '#818CF8',   // Indigo 400
          dark: '#4F46E5',    // Indigo 600
        },
        secondary: {
          DEFAULT: '#8B5CF6', // Purple 500
          light: '#A78BFA',   // Purple 400
          dark: '#7C3AED',    // Purple 600
        },
        accent: {
          DEFAULT: '#06B6D4', // Cyan 500
          light: '#22D3EE',   // Cyan 400
          dark: '#0891B2',    // Cyan 600
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: {
          DEFAULT: '#ffffff',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          dark: '#0B0F17',
          darkCard: '#131C2E',
          darkHover: '#1E293B',
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
        'soft': '0 4px 20px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.02)',
        'hover': '0 20px 30px -10px rgba(99, 102, 241, 0.18)',
        'glow': '0 0 30px rgba(99, 102, 241, 0.35)',
        'card-dark': '0 12px 36px rgba(0,0,0,0.6)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.12)',
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


