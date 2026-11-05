import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../../theme';

export type ExerciseStatus = 'idle' | 'ready' | 'correct' | 'wrong';

interface ExerciseLayoutProps {
  onClose: () => void;
  progress: number; // 0 to 1
  hearts: number;
  instruction: string;
  children: React.ReactNode;
  buttonLabel?: string;
  buttonDisabled?: boolean;
  status?: ExerciseStatus;
  feedbackText?: string;
  onAction: () => void;
}

export const ExerciseLayout: React.FC<ExerciseLayoutProps> = ({
  onClose,
  progress,
  hearts,
  instruction,
  children,
  buttonLabel = 'בדוק',
  buttonDisabled = false,
  status = 'idle',
  feedbackText,
  onAction,
}) => {
  const isCorrect = status === 'correct';
  const isWrong = status === 'wrong';
  const hasFeedback = isCorrect || isWrong;

  const defaultFeedback = isCorrect ? 'מצוין! 🎯' : 'לא בדיוק, נסה שוב';
  const displayedFeedback = feedbackText || defaultFeedback;

  const buttonStyle = () => {
    if (buttonDisabled) return styles.buttonDisabled;
    if (isCorrect) return styles.buttonCorrect;
    if (isWrong) return styles.buttonWrong;
    return styles.buttonPrimary;
  };

  const buttonTextStyle = () => {
    if (buttonDisabled) return styles.buttonTextDisabled;
    return styles.buttonText;
  };

  const clampedProgress = Math.min(Math.max(progress, 0.05), 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. Header: Close, Progress bar, Hearts */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${clampedProgress * 100}%` }]} />
        </View>

        <View style={styles.heartsBadge}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.heartText}>{hearts}</Text>
        </View>
      </View>

      {/* 2. Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>{instruction}</Text>
      </View>

      {/* 3. Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* 4. Footer & Feedback Banner */}
      <View
        style={[
          styles.footer,
          hasFeedback && (isCorrect ? styles.footerCorrect : styles.footerWrong),
        ]}
      >
        {hasFeedback && (
          <View style={styles.feedbackBanner}>
            <Text style={[styles.feedbackText, isCorrect ? styles.feedbackTextCorrect : styles.feedbackTextWrong]}>
              {displayedFeedback}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionButton, buttonStyle()]}
          disabled={buttonDisabled}
          onPress={onAction}
          activeOpacity={0.85}
        >
          <Text style={[styles.baseButtonText, buttonTextStyle()]}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const font = theme.typography.fonts.regular;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeIcon: {
    fontFamily: font,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textMuted,
  },
  progressTrack: {
    flex: 1,
    height: 14,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.locked,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.success,
  },
  heartsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.xs,
  },
  heartIcon: {
    fontSize: theme.typography.sizes.sm,
  },
  heartText: {
    fontFamily: font,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.heartRed,
  },
  instructionContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    alignItems: 'center',
  },
  instructionText: {
    fontFamily: font,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 2,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerCorrect: {
    backgroundColor: theme.colors.successLight,
    borderTopColor: theme.colors.success,
  },
  footerWrong: {
    backgroundColor: theme.colors.errorLight,
    borderTopColor: theme.colors.error,
  },
  feedbackBanner: {
    marginBottom: theme.spacing.md,
  },
  feedbackText: {
    fontFamily: font,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'right',
  },
  feedbackTextCorrect: {
    color: theme.colors.successDark,
  },
  feedbackTextWrong: {
    color: theme.colors.errorDark,
  },
  actionButton: {
    width: '100%',
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.primaryDark,
    ...theme.shadows.primaryGlow,
  },
  buttonCorrect: {
    backgroundColor: theme.colors.success,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.successDark,
    ...theme.shadows.successGlow,
  },
  buttonWrong: {
    backgroundColor: theme.colors.error,
    borderBottomWidth: 4,
    borderBottomColor: theme.colors.errorDark,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.locked,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  baseButtonText: {
    fontFamily: font,
    fontSize: theme.typography.sizes.md,
  },
  buttonText: {
    color: theme.colors.textInverse,
  },
  buttonTextDisabled: {
    color: theme.colors.textMuted,
  },
});
