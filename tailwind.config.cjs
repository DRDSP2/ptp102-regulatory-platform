/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d8ecff',
          200: '#bcddff',
          300: '#8ac9ff',
          400: '#54a9ff',
          500: '#2b8af7',
          600: '#1b6df0',
          700: '#154fd4',
          800: '#1740a6',
          900: '#18387d',
          950: '#0c1f4d',
        },
        ink: {
          50: '#f7f9fc',
          100: '#edf1f7',
          200: '#dde4ed',
          300: '#c2cddb',
          400: '#9aaabb',
          500: '#758291',
          600: '#5b6578',
          700: '#484f5f',
          800: '#3d434f',
          900: '#23262d',
          950: '#0d0f13',
        },
        clinical: {
          teal: '#0d9488',
          sky: '#0284c7',
        },
        danger: '#dc2626',
        warn: '#f59e0b',
        success: '#10b981',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(15,23,42,0.06), 0 4px 12px rgba(15,23,42,0.08)',
        card: '0 10px 35px rgba(15,23,42,0.08)',
        floating: '0 20px 60px rgba(15,23,42,0.12)',
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },
      typography: {
        display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0.0' },
          '100%': { transform: 'translateY(0px)', opacity: '1.0' },
        },
        'fade-in': {
          '0%': { opacity: '0.0' },
          '100%': { opacity: '1.0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200%' },
          '100%': { backgroundPosition: '200%' },
        },
      },
      animation: {
        'slide-up': 'slide-up 220ms cubic-bezier(0,.6,.4,1) both',
        'fade-in': 'fade-in 180ms ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
