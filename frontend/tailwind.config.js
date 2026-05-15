/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Banking Theme (BCA/BRI Style)
        primary: {
          DEFAULT: '#0056B3', // BCA Blue
          50: '#E6F0FA',
          100: '#B3D4F0',
          200: '#80B8E6',
          300: '#4D9CDB',
          400: '#1A80D1',
          500: '#0056B3', // Main brand color
          600: '#004494',
          700: '#003375',
          800: '#002256',
          900: '#001137',
          dark: '#003D82',
          light: '#0066CC',
        },
        secondary: {
          DEFAULT: '#F7931E', // Orange accent
          50: '#FFF5E6',
          100: '#FFE0B3',
          200: '#FFCB80',
          300: '#FFB64D',
          400: '#FFA11A',
          500: '#F7931E',
          600: '#E07E00',
          700: '#AD6200',
          800: '#7A4600',
          900: '#472900',
        },
        background: {
          DEFAULT: '#F5F7FA', // Light gray background
          dark: '#0F172A',
          light: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          elevated: '#FFFFFF',
          pressed: '#F1F5F9',
        },
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          tertiary: '#94A3B8',
          disabled: '#CBD5E1',
          inverse: '#FFFFFF',
        },
        success: '#059669',
        error: '#DC2626',
        warning: '#D97706',
        info: '#2563EB',
        border: '#E2E8F0',
        divider: '#E2E8F0',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevated': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'soft': '0 4px 20px rgba(0, 86, 179, 0.1)',
        'glow': '0 0 20px rgba(0, 86, 179, 0.3)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
