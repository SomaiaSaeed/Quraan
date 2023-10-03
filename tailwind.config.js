module.exports = {
  important: true,
  mode: 'jit',
  prefix: 'tw-',
  purge: {
    enabled: true,
    content: ["./src/**/*.{html,ts}"]
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily: {
      'quraanFont': ['Alkalami','serif'],
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    container: {
      center: true,
      padding: '1rem',
    },
    fontSize: {
      'microXs': '0.625rem',
      'xs': '.75rem',
      'sm': '.875rem',
      'tiny': '.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
    extend: {
      backgroundImage: {
        'hero-pattern': "url('./assets/images/DSCF2059.png')",
      },
      colors: {
        bgSTC: '#3A0E65',
        lightPurple: '#faf5ff',
        coral: '#FF375E',
        coralLight: '#FFDEE4',
        coralLight2: '#FFECF0',
        whiteLight1:'#FAF5FF',
        greenStc:'#159E0B',
        textsColorPurple:'#4F008C',
        textsColorGray:'#848081',
        textColorLiteGray:'#00000061',
        bgPink:'#FF375E',
        lightPurple2:'#A54EE1',
      },
      flex: {
        '2': '2 2 0%',
        '3': '3 3 0%'
      },
      width:{
        'fit':"fit-content",
        97:"26rem",
        101:"50rem"
      },
      height:{
        101:"50rem"
      },
      minWidth: {
        14: "1.875rem",
        16: "2rem",
        17: "2.5rem",
        110: "6.875rem",
        40: "40vw",
      },
      maxWidth: {
        16: "2rem",
        18: "3rem",
      },
      minHeight:{
        248:"15.5rem"
      },
      boxShadow: {
        xl3: '0px 7px 10px rgba(41, 38, 50, 0.03)',
        newShadow:'0px 0px 0px 3px rgba(255,55,94,0.7)',
        none0:'0'
      },
      spacing: {
        99: '-2.25rem',
        44: '-1rem',
        13:'-3.125rem',
        '0.25':'-0.25rem',
        11:'-0.188rem',
      }
    },
  },
  variants: {
    extend: {
      textTransform: ['hover', 'focus'],
      margin: ['responsive', 'direction', 'odd', 'last', 'first', 'even'],
      padding: ['responsive', 'direction', 'hover'],
      inset: ['responsive', 'direction', 'hover', 'focus'],
      space: ['responsive', 'direction', 'odd', 'even'],
      boxShadow: ['active'],
      scrollbar: ['dark'],
      divideWidth: ['hover', 'focus'],
      gridColumn:['responsive']
    },
  },
  plugins: [],
};
