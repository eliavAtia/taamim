/**
 * Clean, playful light palette (white + sky blue, Duolingo-like)
 */
const palette = {
  white: '#FFFFFF',
  skyBg: '#F0F9FF',
  sky50: '#E0F2FE',
  sky200: '#BAE6FD',
  sky400: '#38BDF8',
  sky500: '#0EA5E9',
  sky700: '#0369A1',
  green: '#10B981',
  greenLight: '#D1FAE5',
  greenDark: '#047857',
  rose: '#F43F5E',
  roseLight: '#FFE4E6',
  roseDark: '#BE123C',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  orange: '#F97316',
  slate700: '#334155',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
};

export const colors = {
  // Brand
  primary: palette.sky500,
  primaryLight: palette.sky50,
  primarySoft: palette.sky200,
  primaryBright: palette.sky400,
  primaryDark: palette.sky700,

  // Status
  success: palette.green,
  successLight: palette.greenLight,
  successDark: palette.greenDark,
  error: palette.rose,
  errorLight: palette.roseLight,
  errorDark: palette.roseDark,
  warning: palette.amber,
  info: palette.sky500,

  // Gamification
  heartRed: palette.rose,
  streakOrange: palette.orange,
  xpYellow: palette.amber,
  cantorOrange: palette.amber,

  // Surfaces
  background: palette.white,
  backgroundSecondary: palette.skyBg,
  surface: palette.white,
  surfaceCard: palette.skyBg,
  surfaceLight: palette.white,
  locked: palette.slate200,
  lockedDark: palette.slate300,

  // Borders
  border: palette.slate200,
  borderLight: palette.sky200,
  borderDark: palette.slate300,

  // Text
  textPrimary: palette.slate700,
  textSecondary: palette.slate500,
  textMuted: palette.slate400,
  textDark: palette.slate700,
  textInverse: palette.white,
  textOnPrimary: palette.white,

  // Inputs
  inputBackground: palette.skyBg,
  inputBorder: palette.sky200,
  inputText: palette.slate700,
  placeholderText: palette.slate400,

  // Legacy aliases (kept for backward compatibility with older screens)
  moroccanGold: palette.sky500,
  moroccanGoldLight: palette.amberLight,
  moroccanGoldDark: palette.amber,
  royalBlue: palette.sky500,
  royalBlueLight: palette.sky400,
  royalBlueDark: palette.sky700,
  textOnGold: palette.white,
} as const;

export type Colors = typeof colors;
