import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { theme } from '../../theme';
import { FONTS } from '../../constants/fonts';
import { getTropeSign } from '../../utils/lessonBuilder';

export type SequenceSlotStatus = 'empty' | 'active' | 'filled' | 'correct' | 'wrong';

interface SequenceSlotProps {
  label?: string;
  sign?: string;
  isPlaceholder?: boolean;
  status?: SequenceSlotStatus;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SequenceSlot: React.FC<SequenceSlotProps> = ({
  label,
  sign,
  isPlaceholder = false,
  status = 'filled',
  disabled = false,
  onPress,
  style,
}) => {
  const isQuestion = isPlaceholder || !label;
  const displaySign = (!isQuestion && label ? (sign ?? getTropeSign(label)) : '').normalize('NFC');

  const containerStyle = () => {
    if (isQuestion) {
      return status === 'active' ? styles.placeholderActive : styles.placeholder;
    }
    switch (status) {
      case 'correct':
        return styles.correctSlot;
      case 'wrong':
        return styles.wrongSlot;
      case 'active':
        return styles.activeSlot;
      default:
        return styles.filledSlot;
    }
  };

  const textStyle = () => {
    if (isQuestion) {
      return styles.placeholderText;
    }
    switch (status) {
      case 'correct':
        return styles.correctText;
      case 'wrong':
        return styles.wrongText;
      case 'active':
        return styles.activeText;
      default:
        return styles.filledText;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseSlot, containerStyle(), disabled && styles.disabled, style]}
      disabled={disabled || !onPress}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isQuestion ? (
        <Text style={[styles.baseText, textStyle()]}>[ ? ]</Text>
      ) : (
        <View style={styles.contentRow}>
          {Boolean(displaySign) && (
            <Text style={styles.signText}>{displaySign}</Text>
          )}
          <Text style={[styles.baseText, textStyle()]}>[{label}]</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const fontRegular = theme.typography.fonts.regular;

const styles = StyleSheet.create({
  baseSlot: {
    minHeight: 52,
    minWidth: 96,
    borderRadius: theme.borderRadius.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  placeholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderDark,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  placeholderActive: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  filledSlot: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.colors.border,
    borderBottomColor: theme.colors.borderDark,
    backgroundColor: theme.colors.surface,
  },
  activeSlot: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.colors.primary,
    borderBottomColor: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryLight,
  },
  correctSlot: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.colors.success,
    borderBottomColor: theme.colors.successDark,
    backgroundColor: theme.colors.successLight,
  },
  wrongSlot: {
    borderWidth: 2,
    borderBottomWidth: 4,
    borderColor: theme.colors.error,
    borderBottomColor: theme.colors.errorDark,
    backgroundColor: theme.colors.errorLight,
  },
  disabled: {
    opacity: 0.8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  signText: {
    fontFamily: FONTS.CANTILLATION,
    fontSize: 22,
    color: theme.colors.primary,
  },
  baseText: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.md,
  },
  placeholderText: {
    color: theme.colors.textMuted,
    letterSpacing: 2,
  },
  filledText: {
    color: theme.colors.textPrimary,
  },
  activeText: {
    color: theme.colors.primary,
  },
  correctText: {
    color: theme.colors.successDark,
  },
  wrongText: {
    color: theme.colors.errorDark,
  },
});
