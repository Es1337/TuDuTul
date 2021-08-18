module.exports = {
  // mode: 'jit',
  purge: {
    enabled: true,
    content: [
      './tudutul_webapp/templates/account/*.html',
      './tudutul_webapp/templates/login/*.html',
      './tudutul_webapp/templates/online-app/*.html',
      './tudutul_webapp/templates/offline-app/*.html',
      './tudutul_webapp/templates/register/*.html',
    ]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'background': '#400d40'
      },
      width: {
        '1/7': '14.28%',
        '2/7': '28.56%',
        '3/7': '42.84%',
        '4/7': '57.12%',
        '5/7': '71.4%',
        '6/7': '85.68%',
        
        '1/10': '10.0%',
        '2/10': '20.0%',
        '3/10': '30.0%',
        '4/10': '40.0%',
        '5/10': '50.0%',
        '6/10': '60.0%',
        '7/10': '70.0%',
        '8/10': '80.0%',
        '9/10': '90.0%',

        '1/20': '5.0%',
        '2/20': '10.0%',
        '3/20': '15.0%',
        '4/20': '20.0%',
        '5/20': '25.0%',
        '6/20': '30.0%',
        '7/20': '35.0%',
        '8/20': '40.0%',
        
      },
      height: {
        '1/10': '10.0%',
        '2/10': '20.0%',
        '3/10': '30.0%',
        '4/10': '40.0%',
        '5/10': '50.0%',
        '6/10': '60.0%',
        '7/10': '70.0%',
        '8/10': '80.0%',
        '9/10': '90.0%',

        '1/7': '14.28%',
        '2/7': '28.56%',
        '3/7': '42.84%',
        '4/7': '57.12%',
        '5/7': '71.4%',
        '6/7': '85.68%',
      },

      minHeight: {
        '0': '0',
        '16': '16rem'
      },
      borderWidth: {
        '1': '1px'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
