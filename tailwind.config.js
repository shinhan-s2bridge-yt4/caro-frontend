/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          10: '#EDF3FF',
          20: '#C5D9FF',
          30: '#9DBEFF',
          40: '#74A2FB',
          50: '#4880ED',
          60: '#3467CB',
          70: '#2351A9',
          80: '#163C87',
          90: '#0B2A65',
          100: '#041A43',
        },
        coolNeutral: {
          10: '#F5F6FA',
          20: '#F7F7F8',
          30: '#DBDCDF',
          40: '#989BA2',
          50: '#70737C',
          60: '#5A5C63',
          70: '#292A2D',
          80: '#171719',
          90: '#0F0F10',
          100: '#000000',
        },
        red: {
          10: '#FFEBEB',
          20: '#FFD1D1',
          30: '#FFB8B8',
          40: '#FF8585',
          50: '#FF5252',
          60: '#993131',
        },
        background: {
          default: '#F5F6FA',
        },
        text: {
          primary: '#171719',
          secondary: '#989BA2',
          placeholder: '#DBDCDF',
          disabled: '#989BA2',
          white: '#F5F6FA',
          blue: '#4880ED',
        },
        error: '#FF8585', // 이메일 중복 시
        info: '#4880ED', // 이메일 중복 아닐 시
      },

      /* =======================
       * Spacing
       ======================= */
      spacing: {
        0: '0px',
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },
      /* =======================
       * Border Radius
       ======================= */
      borderRadius: {
        none: '0px',
        sm: '4px',
        base: '8px',
        md: '12px',
        lg: '20px',
        full: '9999px',
      },
      /* =======================
       * Typography (size + lineHeight only)
       ======================= */
      fontSize: {
        h1: ['28px', { lineHeight: '36.96px' }],
        h2: ['24px', { lineHeight: '31.68px' }],
        h3: ['20px', { lineHeight: '26.4px' }],
        body1: ['18px', { lineHeight: '23.76px' }],
        body2: ['16px', { lineHeight: '24px' }],
        body3: ['14px', { lineHeight: '21px' }],
        caption: ['12px', { lineHeight: '18px' }],
      },
    },
  },
  plugins: [],
}