module.exports = {
  mode: 'jit',
  purge: [
      './tudutul_webapp/templates/tudutul-webapp/*.html'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'background': '#400d40'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
