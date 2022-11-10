/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./src/**/*.{html,tsx}'],
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      white: colors.white,
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
};
