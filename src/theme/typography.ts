export const typography = {
  // Font Family
  fontFamily: {
    pretendard: 'Pretendard',
  },

  // Font Sizes
  fontSize: {
    // Title
    T1: 32,  // Title 1
    T2: 30,  // Title 2

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

  // 각 스타일의 완전한 정의
  styles: {
    // Title 1
    T1Bold: {
      fontSize: 32,
      lineHeight: 42.24,
      fontWeight: '700' as const,
      letterSpacing: -0.755,
    },
    T1Semibold: {
      fontSize: 32,
      lineHeight: 42.24,
      fontWeight: '600' as const,
      letterSpacing: -0.755,
    },
    T1Medium: {
      fontSize: 32,
      lineHeight: 42.24,
      fontWeight: '500' as const,
      letterSpacing: -0.755,
    },
    T1Regular: {
      fontSize: 32,
      lineHeight: 42.24,
      fontWeight: '400' as const,
      letterSpacing: -0.755,
    },

    // Title 2
    T2Bold: {
      fontSize: 30,
      lineHeight: 39.6,
      fontWeight: '700' as const,
      letterSpacing: -0.708,
    },
    T2Semibold: {
      fontSize: 30,
      lineHeight: 39.6,
      fontWeight: '600' as const,
      letterSpacing: -0.708,
    },
    T2Medium: {
      fontSize: 30,
      lineHeight: 39.6,
      fontWeight: '500' as const,
      letterSpacing: -0.708,
    },
    T2Regular: {
      fontSize: 30,
      lineHeight: 39.6,
      fontWeight: '400' as const,
      letterSpacing: -0.708,
    },

    // Heading 1
    h1Bold: {
      fontSize: 28,
      lineHeight: 36.96,
      fontWeight: '700' as const,
      letterSpacing: -0.661,
    },
    h1Semibold: {
      fontSize: 28,
      lineHeight: 36.96,
      fontWeight: '600' as const,
      letterSpacing: -0.661,
    },
    h1Medium: {
      fontSize: 28,
      lineHeight: 36.96,
      fontWeight: '500' as const,
      letterSpacing: -0.661,
    },
    h1Regular: {
      fontSize: 28,
      lineHeight: 36.96,
      fontWeight: '400' as const,
      letterSpacing: -0.661,
    },

    // Heading 2
    h2Bold: {
      fontSize: 24,
      lineHeight: 31.68,
      fontWeight: '700' as const,
      letterSpacing: -0.48,
    },
    h2Semibold: {
      fontSize: 24,
      lineHeight: 31.68,
      fontWeight: '600' as const,
      letterSpacing: -0.48,
    },
    h2Medium: {
      fontSize: 24,
      lineHeight: 31.68,
      fontWeight: '500' as const,
      letterSpacing: -0.48,
    },
    h2Regular: {
      fontSize: 24,
      lineHeight: 31.68,
      fontWeight: '400' as const,
      letterSpacing: -0.48,
    },

    // Heading 3
    h3Bold: {
      fontSize: 20,
      lineHeight: 27.2,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
    },
    h3Semibold: {
      fontSize: 20,
      lineHeight: 27.2,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    h3Medium: {
      fontSize: 20,
      lineHeight: 27.2,
      fontWeight: '500' as const,
      letterSpacing: -0.2,
    },
    h3Regular: {
      fontSize: 20,
      lineHeight: 27.2,
      fontWeight: '400' as const,
      letterSpacing: -0.2,
    },

    // Body 1
    body1Bold: {
      fontSize: 18,
      fontStyle: 'normal',
      lineHeight: 24.48,
      fontWeight: '700' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Semibold: {
      fontSize: 18,
      fontStyle: 'normal',
      lineHeight: 24.48,
      fontWeight: '600' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Medium: {
      fontSize: 18,
      fontStyle: 'normal',
      lineHeight: 24.48,
      fontWeight: '500' as const,
      letterSpacing: 18 * -0.01,
    },
    body1Regular: {
      fontSize: 18,
      fontStyle: 'normal',
      lineHeight: 24.48,
      fontWeight: '400' as const,
      letterSpacing: 18 * -0.01,
    },

    // Body 2
    body2Bold: {
      fontSize: 16,
      fontStyle: 'normal',
      lineHeight: 24,
      fontWeight: '700' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Semibold: {
      fontSize: 16,
      fontStyle: 'normal',
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Medium: {
      fontSize: 16,
      fontStyle: 'normal',
      lineHeight: 24,
      fontWeight: '500' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Regular: {
      fontSize: 16,
      fontStyle: 'normal',
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: 16 * -0.01,
    },
    body2Light: {
      fontSize: 16,
      fontStyle: 'normal',
      lineHeight: 24,
      fontWeight: '300' as const,
      letterSpacing: 16 * -0.01,
    },

    // Body 3
    body3Bold: {
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: 21,
      fontWeight: '700' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Semibold: {
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: 21,
      fontWeight: '600' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Medium: {
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: 21,
      fontWeight: '500' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Regular: {
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: 21,
      fontWeight: '400' as const,
      letterSpacing: 14 * -0.01,
    },
    body3Light: {
      fontSize: 14,
      fontStyle: 'normal',
      lineHeight: 21,
      fontWeight: '300' as const,
      letterSpacing: 14 * -0.01,
    },

    // Captions
    captionBold: {
      fontSize: 12,
      fontStyle: 'normal',
      lineHeight: 18,
      fontWeight: '700' as const,
    },
    captionSemibold: {
      fontSize: 12,
      fontStyle: 'normal',
      lineHeight: 18,
      fontWeight: '600' as const,
    },
    captionMedium: {
      fontSize: 12,
      fontStyle: 'normal',
      lineHeight: 18,
      fontWeight: '500' as const,
    },
    captionRegular: {
      fontSize: 12,
      fontStyle: 'normal',
      lineHeight: 18,
      fontWeight: '400' as const,
    },
    captionLight: {
      fontSize: 12,
      fontStyle: 'normal',
      lineHeight: 18,
      fontWeight: '300' as const,
    },
  },
} as const;

// 타입 정의 (TypeScript 자동완성용)
export type TypographyStyle = keyof typeof typography.styles;