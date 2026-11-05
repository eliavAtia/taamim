import { ViewStyle, TextStyle } from 'react-native';
import { colors } from './colors';
import { spacing, borderRadius, shadows } from './spacing';
import { typography } from './typography';

const font = typography.fonts.regular;

const pillButton = (bg: string, shadow: ViewStyle = shadows.sm): ViewStyle => ({
  backgroundColor: bg,
  borderRadius: borderRadius.pill,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xl,
  alignItems: 'center',
  justifyContent: 'center',
  ...shadow,
});

const buttonText = (color: string, size: number = typography.sizes.md): TextStyle => ({
  color,
  fontFamily: font,
  fontSize: size,
  textAlign: 'center',
});

export const text = {
  title: { fontFamily: font, fontSize: typography.sizes.xl, color: colors.textPrimary, textAlign: 'right' } as TextStyle,
  body: { fontFamily: font, fontSize: typography.sizes.md, color: colors.textPrimary, textAlign: 'right' } as TextStyle,
  caption: { fontFamily: font, fontSize: typography.sizes.sm, color: colors.textSecondary, textAlign: 'right' } as TextStyle,
};

export const backgrounds = {
  mainScreen: { flex: 1, backgroundColor: colors.background } as ViewStyle,
  authScreen: { flex: 1, backgroundColor: colors.backgroundSecondary } as ViewStyle,
  miniGameScreen: { flex: 1, backgroundColor: colors.backgroundSecondary } as ViewStyle,
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(51, 65, 85, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  } as ViewStyle,
};

export const miniGame = {
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  } as ViewStyle,
  questionCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.lg,
  } as ViewStyle,
  optionButton: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: colors.border,
    borderRadius: borderRadius.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs + 2,
  } as ViewStyle,
  correctState: { backgroundColor: colors.successLight, borderColor: colors.success } as ViewStyle,
  wrongState: { backgroundColor: colors.errorLight, borderColor: colors.error } as ViewStyle,
  verseDisplayBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    borderWidth: 2,
    borderColor: colors.primarySoft,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  } as ViewStyle,
};

export const cards = {
  lessonNode: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.primary,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  } as ViewStyle,
  lessonNodeLocked: {
    backgroundColor: colors.locked,
    borderBottomColor: colors.lockedDark,
    ...shadows.none,
  } as ViewStyle,
  tropeFlashcard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primarySoft,
    ...shadows.md,
  } as ViewStyle,
  statsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
};

export const buttons = {
  primary: { container: pillButton(colors.primary, shadows.primaryGlow), text: buttonText(colors.textOnPrimary) },
  success: { container: pillButton(colors.success, shadows.successGlow), text: buttonText(colors.textInverse) },
  danger: { container: pillButton(colors.error), text: buttonText(colors.textInverse) },
  ghost: {
    container: {
      ...pillButton('transparent', shadows.none),
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
    } as ViewStyle,
    text: buttonText(colors.textSecondary, typography.sizes.sm),
  },
  // Legacy aliases
  primaryGold: { container: pillButton(colors.primary, shadows.primaryGlow), text: buttonText(colors.textOnPrimary) },
  secondaryRoyal: { container: pillButton(colors.primaryBright), text: buttonText(colors.textOnPrimary) },
};

export const tabBar = {
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  } as ViewStyle,
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    marginHorizontal: spacing.xs,
  } as ViewStyle,
  itemActive: { backgroundColor: colors.primaryLight } as ViewStyle,
  icon: { fontSize: typography.sizes.lg } as TextStyle,
  label: { fontFamily: font, fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: 2 } as TextStyle,
  labelActive: { color: colors.primary } as TextStyle,
};

export const presets = {
  text,
  backgrounds,
  miniGame,
  cards,
  buttons,
  tabBar,
} as const;

export type Presets = typeof presets;
