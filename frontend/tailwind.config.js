/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        heading: ['Satoshi', 'Avenir Next', 'Segoe UI', 'sans-serif'],
        sans: ['Satoshi', 'Avenir Next', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fffbf9',
          100: '#fff3ed',
          200: '#ffe4d6',
          300: '#ffc9a8',
          400: '#ff9d87', // Warm Coral
          500: '#ff6b6b', // Primary Coral
          600: '#ff5f5f',
          700: '#e85555',
          800: '#d94949',
          900: '#c43f3f',
          950: '#8a2f2f',
        },
        accent: {
          50: '#fffef9',
          100: '#fff9f0',
          200: '#ffefd4',
          300: '#ffddb5',
          400: '#ffa07a', // Warm Peach
          500: '#ffcc80', // Light Peach
          600: '#ffb366',
          700: '#ff9d4d',
          800: '#ff8833',
          900: '#e67e22',
          950: '#c25900',
        },
        sage: {
          50: '#f6fbf9',
          100: '#ecfdf5',
          200: '#d1fae5',
          300: '#a7f3d0',
          400: '#6ee7b7',
          500: '#34d399',
          600: '#059669',
          700: '#047857',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

