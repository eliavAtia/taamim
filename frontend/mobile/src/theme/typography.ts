/**
 * Typography: rounded UI font (Varela Round, Hebrew support) + cantillation font for verses
 */
import { FONTS } from '../constants/fonts';

export const typography = {
  fonts: {
    regular: 'VarelaRound_400Regular',
    bold: 'VarelaRound_400Regular', // Varela Round ships a single weight
    cantillation: FONTS.CANTILLATION,
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  } as const,
  lineHeights: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 44,
  },
} as const;

export type Typography = typeof typography;
