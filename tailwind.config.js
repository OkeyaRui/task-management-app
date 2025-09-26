/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F4F6',
          100: '#E5D9DC',
          200: '#D4C4C9',
          300: '#C3AFB6',
          400: '#B29AA3',
          500: '#A18590',
          600: '#7C8AC3',
          700: '#6B7AB0',
          800: '#5A6A9D',
          900: '#495A8A',
        },
        accent: {
          50: '#F5F4F6',
          100: '#E5D9DC',
          200: '#D4C4C9',
          300: '#C3AFB6',
          400: '#B29AA3',
          500: '#A18590',
          600: '#7C8AC3',
          700: '#6B7AB0',
          800: '#5A6A9D',
          900: '#495A8A',
        },
        background: '#E5D9DC',
        text: '#7C8AC3'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans JP',
          'Hiragino Kaku Gothic ProN',
          'Meiryo',
          'sans-serif'
        ],
      },
    },
  },
  plugins: [],
}
