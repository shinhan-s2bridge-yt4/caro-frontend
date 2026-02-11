export const colors = {
  // Primary Colors (메인 컬러)
  primary: {
    10: '#EDF3FF',
    20: '#C5D9FF',
    30: '#9DBEFF',
    40: '#74A2FB',
    50: '#287FFF', //메인
    60: '#3467CB',
    70: '#2351A9',
    80: '#163C87',
    90: '#0B2A65',
    100: '#041A43',
  },

  // Semantic Colors (의미 있는 색상)
//   expense: '#FF5252',    // 지출 - 빨강
//   income: '#4CAF50',     // 수입 - 초록
  
  // Grayscale
  coolNeutral: {
    10: '#FFF',
    20: '#F7F7F8',
    30: '#DBDCDF',
    40: '#989BA2',
    50: '#70737C',
    60: '#5A5C63',
    70: '#292A2D',
    80: '#171719',
    90: '#0F0F10',
    100: '#000',
  },

  //red
  red: {
    10: '#FFEBEB',
    20: '#FFD1D1',
    30: '#FFB8B8',
    40: '#FF8585',
    50: '#FF5252',
    60: '#993131',
  },

  // Background
  background: {
    default: '#F5F6FA',
  },

  // Text
  text: {
    primary: '#171719',
    secondary: '#989BA2',
    placeholder: '#DBDCDF',
    disabled: '#989BA2',
    white: '#F5F6FA',
    blue: '#4880ED',
  },

  // System
  error: '#FF8585', // 이메일 중복 시
//   warning: '#FF9800',
//   success: '#4CAF50',
  info: '#4880ED', // 이메일 중복 아닐 시
} as const;