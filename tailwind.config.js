/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        telegraf: ['PP Telegraf', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['PP Telegraf', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'PP Telegraf', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#1B395D',
          'navy-light': '#24497A',
          'navy-dark': '#122640',
          orange: '#E57D30',
          'orange-light': '#F09A56',
          'orange-dark': '#C96A22',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#1B395D',
          950: '#122640',
        },
        accent: {
          50: '#fef7f0',
          100: '#fdebd5',
          200: '#fad4aa',
          300: '#f5b574',
          400: '#F09A56',
          500: '#E57D30',
          600: '#C96A22',
          700: '#a8541a',
          800: '#86431d',
          900: '#6e381b',
        },
        turquoise: {
          50: '#e0fcff',
          100: '#bef8fd',
          200: '#87eaf2',
          300: '#54d1db',
          400: '#38bec9',
          500: '#2cb1bc',
          600: '#14919b',
          700: '#0e7c86',
          800: '#0a6c74',
          900: '#044e54',
        },
      },
      borderRadius: {
        'brand': '12px',
        'brand-lg': '16px',
        'brand-xl': '20px',
      },
      boxShadow: {
        'brand-soft': '0 2px 8px rgba(27, 57, 93, 0.08)',
        'brand-md': '0 4px 16px rgba(27, 57, 93, 0.12)',
        'brand-lg': '0 8px 32px rgba(27, 57, 93, 0.16)',
        'brand-xl': '0 16px 48px rgba(27, 57, 93, 0.20)',
        'card': '0 1px 3px rgba(27, 57, 93, 0.06), 0 4px 12px rgba(27, 57, 93, 0.08)',
        'card-hover': '0 4px 12px rgba(27, 57, 93, 0.10), 0 8px 24px rgba(27, 57, 93, 0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
