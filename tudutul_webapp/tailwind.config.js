module.exports = {
  mode: 'jit',
  purge: [
      './templates/tudutul-webapp/*.html'
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
