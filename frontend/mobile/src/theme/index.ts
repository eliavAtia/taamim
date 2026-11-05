import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { presets } from './presets';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  presets,
} as const;

export type Theme = typeof theme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './presets';
export default theme;
