import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { PracticeScreen } from './PracticeScreen';
import {
  CURRICULUM_UNITS,
  CurriculumLesson,
  CurriculumUnit,
} from '../utils/lessonBuilder';

// Zig-zag offsets for a playful Duolingo-style road.
const PATH_OFFSETS = [0, -theme.spacing.xl * 1.5, theme.spacing.xl * 1.5];

interface ActiveLesson {
  unit: CurriculumUnit;
  lesson: CurriculumLesson;
}

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);

  if (activeLesson) {
    return (
      <PracticeScreen
        unitId={activeLesson.unit.id}
        lessonId={activeLesson.lesson.id}
        title={`יחידה ${activeLesson.unit.id} · שיעור ${activeLesson.lesson.id}`}
        onBack={() => setActiveLesson(null)}
      />
    );
  }

  return (
    <SafeAreaView style={theme.presets.backgrounds.mainScreen}>
      <View style={styles.header}>
        <View style={styles.counter}>
          <Text style={styles.counterIcon}>❤️</Text>
          <Text style={[styles.counterValue, { color: theme.colors.heartRed }]}>
            {user?.hearts ?? 5}
          </Text>
        </View>
        <Text style={styles.headerTitle}>טְעָמִים</Text>
        <View style={styles.counter}>
          <Text style={styles.counterIcon}>🔥</Text>
          <Text style={[styles.counterValue, { color: theme.colors.streakOrange }]}>
            {user?.streak ?? 1}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.curriculumBanner}>
          <Text style={styles.curriculumLabel}>תכנית הלימודים המרוקאית</Text>
          <Text style={styles.curriculumTitle}>80 שיעורים בעשר יחידות</Text>
          <Text style={styles.curriculumSubtitle}>התחל מהיסודות והתקדם לאורך מסלול הטעמים</Text>
        </View>

        {CURRICULUM_UNITS.map((unit) => (
          <View key={unit.id} style={styles.unitSection}>
            <View style={styles.unitHeader}>
              <Text style={styles.unitNumber}>יחידה {unit.id}</Text>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <Text style={styles.unitTropes}>{unit.tropes.join(' • ')}</Text>
            </View>

            <View style={styles.lessonPath}>
              {unit.lessons.map((lesson, lessonIndex) => {
                // Temporary rule until persistent lesson progress is connected.
                const isUnlocked = unit.id <= 2;
                const icon = !isUnlocked ? '🔒' : lesson.id === 1 ? '⭐' : '📖';

                return (
                  <View
                    key={`${unit.id}-${lesson.id}`}
                    style={[
                      styles.nodeWrapper,
                      {
                        transform: [
                          { translateX: PATH_OFFSETS[lessonIndex % PATH_OFFSETS.length] },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={[
                        theme.presets.cards.lessonNode,
                        !isUnlocked && theme.presets.cards.lessonNodeLocked,
                      ]}
                      disabled={!isUnlocked}
                      activeOpacity={0.85}
                      onPress={() => setActiveLesson({ unit, lesson })}
                    >
                      <Text style={styles.nodeIcon}>{icon}</Text>
                    </TouchableOpacity>
                    <View style={styles.nodeLabelBox}>
                      <Text style={[styles.nodeLessonNumber, !isUnlocked && styles.nodeTextLocked]}>
                        שיעור {lesson.id}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const fontRegular = theme.typography.fonts.regular;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  counterIcon: {
    fontSize: theme.typography.sizes.md,
    marginEnd: theme.spacing.xs,
  },
  counterValue: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.md,
  },
  content: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    paddingBottom: theme.spacing.xxl * 2,
  },
  curriculumBanner: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.primaryGlow,
  },
  curriculumLabel: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primaryLight,
    textAlign: 'right',
  },
  curriculumTitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textInverse,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  curriculumSubtitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primaryLight,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  unitSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  unitHeader: {
    width: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.card,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  unitNumber: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  unitTitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  unitTropes: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  lessonPath: {
    width: '100%',
    alignItems: 'center',
  },
  nodeWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  nodeIcon: {
    fontSize: theme.typography.sizes.xxl,
  },
  nodeLabelBox: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  nodeLessonNumber: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  nodeTextLocked: {
    color: theme.colors.textMuted,
  },
});
