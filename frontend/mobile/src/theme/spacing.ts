/**
 * Spacing, Border Radius and soft Shadow tokens
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 20,
  card: 20,
  pill: 9999,
} as const;

const softShadow = (opacity: number, radius: number, height: number, elevation: number, color = '#0EA5E9') => ({
  shadowColor: color,
  shadowOffset: { width: 0, height },
  shadowOpacity: opacity,
  shadowRadius: radius,
  elevation,
});

export const shadows = {
  none: softShadow(0, 0, 0, 0, 'transparent'),
  sm: softShadow(0.08, 4, 2, 1),
  md: softShadow(0.12, 10, 4, 3),
  lg: softShadow(0.18, 16, 8, 6),
  primaryGlow: softShadow(0.3, 10, 4, 5),
  successGlow: softShadow(0.3, 8, 4, 4, '#10B981'),
  // Legacy alias
  goldGlow: softShadow(0.3, 10, 4, 5),
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type Shadows = typeof shadows;
