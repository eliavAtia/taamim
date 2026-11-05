import React, { useMemo } from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';
import { FONTS } from '../constants/fonts';

interface HebrewVerseTextProps extends TextProps {
  children: string;
  fontSize?: number;
  color?: string;
  style?: TextStyle;
  highlightTaamIndex?: number;
}

/**
 * High-fidelity Biblical Hebrew Text Component
 * - Enforces Unicode Normalization Form C (NFC)
 * - Renders using Cantillation-compatible font (Taamey Frank CLM)
 * - Guarantees correct RTL layout and diacritics positioning
 */
export const HebrewVerseText: React.FC<HebrewVerseTextProps> = ({
  children,
  fontSize = 28,
  color = '#1E1B4B',
  style,
  ...rest
}) => {
  // Always normalize text with NFC before rendering
  const normalizedText = useMemo(() => {
    return (children || '').normalize('NFC');
  }, [children]);

  return (
    <Text
      {...rest}
      style={[
        styles.text,
        {
          fontSize,
          color,
          fontFamily: FONTS.CANTILLATION,
          writingDirection: 'rtl',
        },
        style,
      ]}
    >
      {normalizedText}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'right',
    lineHeight: 48,
    includeFontPadding: false,
  },
});
