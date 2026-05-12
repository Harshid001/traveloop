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
          DEFAULT: '#0077B6', // Main brand blue
          light: '#00B4D8', // Secondary teal/light blue
          dark: '#023E8A', // Darker blue for hovers
        },
        accent: {
          DEFAULT: '#4F46E5', // Indigo
          hover: '#4338CA',
        },
        surface: {
          DEFAULT: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(0,0,0,0.04)',
        'hover': '0 8px 30px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(0, 119, 182, 0.3)',
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
