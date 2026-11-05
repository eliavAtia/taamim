import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

const MOCK_STANDINGS = [
  { name: 'רחל א.', xp: 420 },
  { name: 'יוסף ב.', xp: 380 },
  { name: 'מרים ש.', xp: 310 },
  { name: 'אהרון ד.', xp: 150 },
];

export const LeaderboardScreen: React.FC = () => {
  const { user } = useAuth();
  const rows = [...MOCK_STANDINGS, { name: user?.displayName ?? 'את/ה', xp: user?.totalXp ?? 0, isMe: true }]
    .sort((a, b) => b.xp - a.xp);

  return (
    <SafeAreaView style={theme.presets.backgrounds.mainScreen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.trophy}>🏆</Text>
        <Text style={styles.title}>ליגת ארד</Text>
        <Text style={styles.subtitle}>3 המובילים עולים לליגה הבאה</Text>

        {rows.map((row, i) => (
          <View key={`${row.name}-${i}`} style={[styles.row, 'isMe' in row && styles.rowMe]}>
            <Text style={styles.rank}>{i + 1}</Text>
            <Text style={styles.name}>{row.name}</Text>
            <Text style={styles.xp}>{row.xp} XP</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: { padding: theme.spacing.lg, alignItems: 'center' },
  trophy: { fontSize: theme.typography.sizes.xxl * 1.5, marginTop: theme.spacing.md },
  title: { ...theme.presets.text.title, textAlign: 'center', marginTop: theme.spacing.sm },
  subtitle: { ...theme.presets.text.caption, textAlign: 'center', marginBottom: theme.spacing.lg },
  row: {
    ...theme.presets.cards.statsCard,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  rowMe: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight },
  rank: { ...theme.presets.text.body, color: theme.colors.primary, width: theme.spacing.lg },
  name: { ...theme.presets.text.body, flex: 1 },
  xp: { ...theme.presets.text.caption },
});
