export { colors } from './colors';
export { typography } from './typography';
export { spacing, borderRadius } from './spacing';

// import해서 다시 사용
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

// 전체 테마 객체
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;