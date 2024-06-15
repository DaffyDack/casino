import colors from 'tailwindcss/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      md: { max: '840px' },
    },
    extend: {
      colors: {
        transparent: 'transparent',
        white: '#ffffff',
        black: '#000000',
        blue: '#3575E6',
        green: '#26B72C',

        'red-600': '#e32645',

        // Colors matched to new theme colors by least Euqlide distance.
        // Match code: https://gist.github.com/marvel-code/771d815af2769f585591c16126762734

        'gray-11': 'rgb(var(--primary-50))',
        'gray-3': 'rgb(var(--primary-100))',

        'gray-7': 'rgb(var(--surface-100))',

        'gray-5': 'rgb(var(--surface-300))',
        'gray-6': 'rgb(var(--surface-300))',

        'gray-4': 'rgb(var(--surface-400))',
        'gray-10': 'rgb(var(--surface-400))',
        'gray-12': 'rgb(var(--surface-400))',

        'gray-2': 'rgb(var(--surface-500))',

        'gray-8': 'rgb(var(--surface-700))',

        'gray-9': 'rgb(var(--surface-800))',
        'gray-14': 'rgb(var(--surface-800))',

        'gray-1': 'rgb(var(--surface-900))',
        'gray-13': 'rgb(var(--surface-900))',
        'gray-15': '#f3f7fe',
        'gray-16': '#74757B',

        // Old:
        // blue: '#3575e6',
        // red: '#e32645',
        // green: '#26B72C',
        // yellow: '#F6C51A',
        // gray: {
        //   1: '#171923',
        //   2: '#74757b',
        //   3: '#d7e3fa',
        //   4: '#aaaaaa',
        //   5: '#cccccc',
        //   6: '#d7d8dc',
        //   7: '#f1f6f9',
        //   8: '#2d3044',
        //   9: '#232637',
        //   10: '#9AA0B8',
        //   11: '#f3f7fe',
        //   12: '#ACADB5',
        //   13: '#1B1D2B',
        //   14: '#242635',
        // },

        // For tailwind preset. See: https://tailwind.primevue.org/vite/#tailwind-config
        'primary-50': 'rgb(var(--primary-50))',
        'primary-100': 'rgb(var(--primary-100))',
        'primary-200': 'rgb(var(--primary-200))',
        'primary-300': 'rgb(var(--primary-300))',
        'primary-400': 'rgb(var(--primary-400))',
        'primary-500': 'rgb(var(--primary-500))',
        'primary-600': 'rgb(var(--primary-600))',
        'primary-700': 'rgb(var(--primary-700))',
        'primary-800': 'rgb(var(--primary-800))',
        'primary-900': 'rgb(var(--primary-900))',
        'primary-950': 'rgb(var(--primary-950))',
        'surface-0': 'rgb(var(--surface-0))',
        'surface-50': 'rgb(var(--surface-50))',
        'surface-100': 'rgb(var(--surface-100))',
        'surface-200': 'rgb(var(--surface-200))',
        'surface-300': 'rgb(var(--surface-300))',
        'surface-400': 'rgb(var(--surface-400))',
        'surface-500': 'rgb(var(--surface-500))',
        'surface-600': 'rgb(var(--surface-600))',
        'surface-700': 'rgb(var(--surface-700))',
        'surface-800': 'rgb(var(--surface-800))',
        'surface-850': 'rgb(var(--surface-850))',
        'surface-900': 'rgb(var(--surface-900))',
        'surface-950': 'rgb(var(--surface-950))',
      },
    },
  },
  plugins: [],
}
