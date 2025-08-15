import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.jsx',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0047AB',
          50:  '#eff6ff', 100:'#dbeafe', 200:'#bfdbfe', 300:'#93c5fd',
          400:'#60a5fa', 500:'#3b82f6', 600:'#2563eb', 700:'#1d4ed8',
          800:'#1e40af', 900:'#1e3a8a', 950:'#172554',
        },
        secondary: { DEFAULT: '#FF8A00' },
        accent: '#39B54A',
        sand: '#F6E7C1',
        brandDark: '#0B2E6B',
        bgSoft: '#F3F7FB',
      },
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [forms],
};