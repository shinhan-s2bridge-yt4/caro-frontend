export const typography = {
  // Font Family
  fontFamily: {
    pretendard: 'Pretendard',
  },

  // Font Sizes
  fontSize: {
    // Headings
    h1: 28,        // Heading 1
    h2: 24,        // Heading 2
    h3: 20,        // Heading 3
    
    // Body
    body1: 18,     // Body 1
    body2: 16,     // Body 2
    body3: 14,     // Body 3
    
    // Caption
    caption: 12,   // Captions
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights (132% = 1.32, 150% = 1.5)
  lineHeight: {
    heading: 1.32,   // 132% (Heading 1, 2, 3, Body 1)
    body: 1.5,       // 150% (Body 2, Body 3, Captions)
  },

  // Letter Spacing (자간)
  // React Native는 픽셀 단위를 사용하므로 퍼센트를 픽셀로 변환
  // 공식: fontSize * (letterSpacing% / 100)
  letterSpacing: {
    tightest: -0.0236,  // -2.36% (숫자/특수문자용)
    tight: -0.02,       // -2%
    normal: -0.01,      // -1%
    none: 0,            // 0%
  },

  // 각 스타일의 완전한 정의
  styles: {
    // Heading 1
    h1Bold: {
      fontSize: 28,
      lineHeight: 28 * 1.32, // 36.96
      fontWeight: '700' as const,
      letterSpacing: 28 * -0.0236,  // -2.36%
    },
    h1Semibold: {
      fontSize: 28,
      lineHeight: 28 * 1.32,
      fontWeight: '600' as const,
      letterSpacing: 28 * -0.0236,
    },
    h1Medium: {
      fontSize: 28,
      lineHeight: 28 * 1.32,
      fontWeight: '500' as const,
      letterSpacing: 28 * -0.0236,
    },
    h1Regular: {
      fontSize: 28,
      lineHeight: 28 * 1.32,
      fontWeight: '400' as const,
      letterSpacing: 28 * -0.0236,
    },

    // Heading 2
    h2Bold: {
      fontSize: 24,
      lineHeight: 24 * 1.32, // 31.68
      fontWeight: '700' as const,
      letterSpacing: 24 * -0.02,  // -2%
    },
    h2Semibold: {
      fontSize: 24,
      lineHeight: 24 * 1.32,
      fontWeight: '600' as const,
      letterSpacing: 24 * -0.02,
    },
    h2Medium: {
      fontSize: 24,
      lineHeight: 24 * 1.32,
      fontWeight: '500' as const,
      letterSpacing: 24 * -0.02,
    },
    h2Regular: {
      fontSize: 24,
      lineHeight: 24 * 1.32,
      fontWeight: '400' as const,
      letterSpacing: 24 * -0.02,
    },

    // Heading 3
    h3Bold: {
      fontSize: 20,
      lineHeight: 20 * 1.32, // 26.4
      fontWeight: '700' as const,
      letterSpacing: 20 * -0.01, // -1%
    },
    h3Semibold: {
      fontSize: 20,
      lineHeight: 20 * 1.32,
      fontWeight: '600' as const,
      letterSpacing: 20 * -0.01,
    },
    h3Medium: {
      fontSize: 20,
      lineHeight: 20 * 1.32,
      fontWeight: '500' as const,
      letterSpacing: 20 * -0.01,
    },
    h3Regular: {
      fontSize: 20,
      lineHeight: 20 * 1.32,
      fontWeight: '400' as const,
      letterSpacing: 20 * -0.01,
    },

    // Body 1
    body1Bold: {
      fontSize: 18,
      lineHeight: 18 * 1.32, // 23.76
      fontWeight: '700' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Semibold: {
      fontSize: 18,
      lineHeight: 18 * 1.32,
      fontWeight: '600' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Medium: {
      fontSize: 18,
      lineHeight: 18 * 1.32,
      fontWeight: '500' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Regular: {
      fontSize: 18,
      lineHeight: 18 * 1.32,
      fontWeight: '400' as const,
      letterSpacing: 18 * -0.01,
    },

    // Body 2
    body2Bold: {
      fontSize: 16,
      lineHeight: 16 * 1.5, // 24
      fontWeight: '700' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Semibold: {
      fontSize: 16,
      lineHeight: 16 * 1.5,
      fontWeight: '600' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Medium: {
      fontSize: 16,
      lineHeight: 16 * 1.5,
      fontWeight: '500' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Regular: {
      fontSize: 16,
      lineHeight: 16 * 1.5,
      fontWeight: '400' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Light: {
      fontSize: 16,
      lineHeight: 16 * 1.5,
      fontWeight: '300' as const,
      letterSpacing: 16 * -0.01,
    },

    // Body 3
    body3Bold: {
      fontSize: 14,
      lineHeight: 14 * 1.5, // 21
      fontWeight: '700' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Semibold: {
      fontSize: 14,
      lineHeight: 14 * 1.5,
      fontWeight: '600' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Medium: {
      fontSize: 14,
      lineHeight: 14 * 1.5,
      fontWeight: '500' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Regular: {
      fontSize: 14,
      lineHeight: 14 * 1.5,
      fontWeight: '400' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Light: {
      fontSize: 14,
      lineHeight: 14 * 1.5,
      fontWeight: '300' as const,
      letterSpacing: 14 * -0.01,
    },

    // Captions
    captionBold: {
      fontSize: 12,
      lineHeight: 12 * 1.5, // 18
      fontWeight: '700' as const,
      letterSpacing: 12 * 0, // 0%
    },
    captionSemibold: {
      fontSize: 12,
      lineHeight: 12 * 1.5,
      fontWeight: '600' as const,
      letterSpacing: 12 * 0,
    },
    captionMedium: {
      fontSize: 12,
      lineHeight: 12 * 1.5,
      fontWeight: '500' as const,
      letterSpacing: 12 * 0,
    },
    captionRegular: {
      fontSize: 12,
      lineHeight: 12 * 1.5,
      fontWeight: '400' as const,
      letterSpacing: 12 * 0,
    },
    captionLight: {
      fontSize: 12,
      lineHeight: 12 * 1.5,
      fontWeight: '300' as const,
      letterSpacing: 12 * 0,
    },
  },
} as const;

// 타입 정의 (TypeScript 자동완성용)
export type TypographyStyle = keyof typeof typography.styles;