/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#effdf5',
          100: '#d9fae7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        ink: {
          900: '#111827',
          700: '#374151',
          500: '#6b7280',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
