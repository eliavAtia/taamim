import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const initial = (user?.displayName ?? '?').charAt(0);

  return (
    <SafeAreaView style={theme.presets.backgrounds.mainScreen}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName ?? 'אורח'}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.statsRow}>
          <View style={[theme.presets.cards.statsCard, styles.stat]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{user?.streak ?? 0}</Text>
            <Text style={styles.statLabel}>רצף ימים</Text>
          </View>
          <View style={[theme.presets.cards.statsCard, styles.stat]}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{user?.totalXp ?? 0}</Text>
            <Text style={styles.statLabel}>נקודות XP</Text>
          </View>
        </View>

        <TouchableOpacity style={[theme.presets.buttons.danger.container, styles.logout]} onPress={logout} activeOpacity={0.85}>
          <Text style={theme.presets.buttons.danger.text}>התנתקות</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { flex: 1, alignItems: 'center', padding: theme.spacing.lg },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  avatarText: { fontFamily: theme.typography.fonts.regular, fontSize: theme.typography.sizes.xxl, color: theme.colors.primary },
  name: { ...theme.presets.text.title, textAlign: 'center', marginTop: theme.spacing.md },
  email: { ...theme.presets.text.caption, textAlign: 'center' },
  statsRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.xl, width: '100%' },
  stat: { flex: 1 },
  statIcon: { fontSize: theme.typography.sizes.xl },
  statValue: { ...theme.presets.text.title, textAlign: 'center' },
  statLabel: { ...theme.presets.text.caption, textAlign: 'center' },
  logout: { width: '100%', marginTop: 'auto', marginBottom: theme.spacing.lg },
});
