/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linen: '#F7F6F2',
        warmbg: '#F7F6F2',
        charcoal: {
          DEFAULT: '#1B211E',
          50: '#F4F5F4',
          100: '#E5E7E5',
          200: '#C8CCC7',
          300: '#9EA49C',
          400: '#6E766B',
          500: '#474F44',
          600: '#343B32',
          700: '#272C25',
          800: '#1B211E',
          900: '#111513',
        },
        sage: {
          DEFAULT: '#5F7359',
          50: '#F3F5F2',
          100: '#DDE3DA',
          200: '#BAC7B6',
          300: '#97A991',
          400: '#7B8F74',
          500: '#5F7359',
          600: '#4B5C46',
          700: '#394535',
          800: '#283025',
          900: '#171C15',
        },
        warmbeige: {
          DEFAULT: '#E8E2D8',
          50: '#FCFBF9',
          100: '#FAF8F5',
          200: '#F2EFEB',
          300: '#E8E2D8',
          400: '#D3C9BC',
        },
        emerald: {
          50: '#F3F5F2',
          100: '#DDE3DA',
          200: '#BAC7B6',
          500: '#5F7359',
          600: '#4B5C46',
          700: '#394535',
        },
        gold: {
          500: '#C59A45',
          600: '#A88032',
        }
      }
    },
  },
  plugins: [],
}

