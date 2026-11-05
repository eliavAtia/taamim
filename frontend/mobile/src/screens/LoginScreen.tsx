import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

// Ensure RTL
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

export const LoginScreen: React.FC = () => {
  const { login, register, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('david@taamim.app');
  const [password, setPassword] = useState('123456');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (!email || !password) {
      setErrorMessage('נא למלא את כל השדות');
      return;
    }

    if (isRegisterMode && !displayName) {
      setErrorMessage('נא להזין שם מלא');
      return;
    }

    const result = isRegisterMode
      ? await register(email, password, displayName)
      : await login(email, password);

    if (!result.success) {
      setErrorMessage(result.error || 'הפעולה נכשלה, נא לנסות שוב');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Moroccan Emblem & Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.emblemBadge}>
            <Text style={styles.emblemIcon}>👑</Text>
          </View>
          <Text style={styles.brandTitle}>טְעָמִים</Text>
          <Text style={styles.brandSubtitle}>
            לימוד טעמי המקרא במסורת יהדות מרוקו
          </Text>
          <View style={styles.goldDivider} />
        </View>

        {/* Auth Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleTab,
              !isRegisterMode && styles.activeToggleTab,
            ]}
            onPress={() => {
              setIsRegisterMode(false);
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleTabText,
                !isRegisterMode && styles.activeToggleTabText,
              ]}
            >
              התחברות
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleTab,
              isRegisterMode && styles.activeToggleTab,
            ]}
            onPress={() => {
              setIsRegisterMode(true);
              setErrorMessage(null);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleTabText,
                isRegisterMode && styles.activeToggleTabText,
              ]}
            >
              הרשמה
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>שם מלא</Text>
              <TextInput
                style={styles.input}
                placeholder="לדוגמה: יוסף כהן"
                placeholderTextColor={theme.colors.placeholderText}
                value={displayName}
                onChangeText={setDisplayName}
                textAlign="right"
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>כתובת אימייל</Text>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={theme.colors.placeholderText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>סיסמה</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={theme.colors.placeholderText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              textAlign="right"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.textOnGold} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isRegisterMode ? 'צור חשבון והתחל ללמוד' : 'כניסה למערכת'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer info */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            בהשראת מסורת קזבלנקה, פאס, מקנס ומרקש
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emblemBadge: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.surfaceCard,
    borderWidth: 2,
    borderColor: theme.colors.moroccanGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.goldGlow,
  },
  emblemIcon: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.xl,
  },
  brandTitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.xxl + 4,
    color: theme.colors.moroccanGold,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  goldDivider: {
    width: 80,
    height: 3,
    backgroundColor: theme.colors.moroccanGold,
    borderRadius: theme.borderRadius.pill,
    marginTop: theme.spacing.md,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  activeToggleTab: {
    backgroundColor: theme.colors.royalBlue,
  },
  toggleTabText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  activeToggleTabText: {
    color: theme.colors.textPrimary,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  errorBanner: {
    backgroundColor: theme.colors.errorDark,
    borderColor: theme.colors.error,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.errorLight,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    textAlign: 'right',
  },
  input: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.inputText,
    writingDirection: 'rtl',
  },
  submitButton: {
    backgroundColor: theme.colors.moroccanGold,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.goldGlow,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnGold,
  },
  footerContainer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
