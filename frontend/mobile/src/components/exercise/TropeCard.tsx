import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';
import { FONTS } from '../../constants/fonts';
import { getTropeSign } from '../../utils/lessonBuilder';

export type TropeCardStatus = 'default' | 'selected' | 'correct' | 'wrong';
export type TropeCardDisplayMode = 'full' | 'nameOnly' | 'symbolOnly';

interface TropeCardProps {
  name: string;
  sign?: string;
  status?: TropeCardStatus;
  disabled?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  displayMode?: TropeCardDisplayMode;
  style?: ViewStyle;
}

export const TropeCard: React.FC<TropeCardProps> = ({
  name,
  sign,
  status = 'default',
  disabled = false,
  onPress,
  size = 'md',
  displayMode = 'full',
  style,
}) => {
  const displaySign = (sign ?? getTropeSign(name)).normalize('NFC');

  const cardStyle = () => {
    switch (status) {
      case 'selected':
        return styles.selectedCard;
      case 'correct':
        return styles.correctCard;
      case 'wrong':
        return styles.wrongCard;
      default:
        return styles.defaultCard;
    }
  };

  const nameTextStyle = () => {
    switch (status) {
      case 'selected':
        return styles.selectedText;
      case 'correct':
        return styles.correctText;
      case 'wrong':
        return styles.wrongText;
      default:
        return styles.defaultText;
    }
  };

  const sizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.baseCard, sizeStyle(), cardStyle(), disabled && styles.disabled, style]}
      disabled={disabled || !onPress}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {displayMode !== 'nameOnly' && Boolean(displaySign) && (
        <View style={styles.signWrapper}>
          <Text style={[styles.signText, size === 'sm' && styles.signTextSm, size === 'lg' && styles.signTextLg]}>
            {displaySign}
          </Text>
        </View>
      )}
      {displayMode !== 'symbolOnly' && (
        <Text style={[styles.nameText, size === 'sm' && styles.nameTextSm, size === 'lg' && styles.nameTextLg, nameTextStyle()]}>
          {name}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const fontRegular = theme.typography.fonts.regular;

const styles = StyleSheet.create({
  baseCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.card,
    borderWidth: 2,
    borderBottomWidth: 5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sizeSm: {
    minWidth: 90,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sizeMd: {
    minWidth: 140,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sizeLg: {
    minWidth: 180,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  defaultCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderBottomColor: theme.colors.borderDark,
  },
  selectedCard: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    borderBottomColor: theme.colors.primaryDark,
  },
  correctCard: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
    borderBottomColor: theme.colors.successDark,
  },
  wrongCard: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
    borderBottomColor: theme.colors.errorDark,
  },
  disabled: {
    opacity: 0.65,
  },
  signWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  signText: {
    fontFamily: FONTS.CANTILLATION,
    fontSize: 32,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  signTextSm: {
    fontSize: 24,
  },
  signTextLg: {
    fontSize: 44,
  },
  nameText: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
  },
  nameTextSm: {
    fontSize: theme.typography.sizes.sm,
  },
  nameTextLg: {
    fontSize: theme.typography.sizes.lg,
  },
  defaultText: {
    color: theme.colors.textPrimary,
  },
  selectedText: {
    color: theme.colors.primary,
  },
  correctText: {
    color: theme.colors.successDark,
  },
  wrongText: {
    color: theme.colors.errorDark,
  },
});
