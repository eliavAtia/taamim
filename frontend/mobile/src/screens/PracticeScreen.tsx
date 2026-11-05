import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { ExerciseLayout, ExerciseStatus } from '../components/exercise/ExerciseLayout';
import { TropeCard } from '../components/exercise/TropeCard';
import { AudioPlayerButton } from '../components/exercise/AudioPlayerButton';
import { VoicePracticePanel } from '../components/exercise/VoicePracticePanel';
import { SequenceSlot } from '../components/exercise/SequenceSlot';
import {
  buildSessionExercises,
  DEFAULT_EXERCISE_BANK,
} from '../utils/lessonBuilder';
import { API_ENDPOINTS } from '../config/api';

interface PracticeScreenProps {
  title: string;
  unitId?: number;
  lessonId?: number;
  onBack: () => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  title,
  unitId = 1,
  lessonId = 1,
  onBack,
}) => {
  const { user } = useAuth();
  const [hearts, setHearts] = useState(user?.hearts ?? 5);

  const sessionExercises = useMemo(() => {
    const list = buildSessionExercises(DEFAULT_EXERCISE_BANK, unitId, lessonId);
    return list.length > 0
      ? list
      : buildSessionExercises(DEFAULT_EXERCISE_BANK, 1, 1);
  }, [lessonId, unitId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [status, setStatus] = useState<ExerciseStatus>('idle');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [taamSound, setTaamSound] = useState<
    { id: string; audioUrl?: string } | undefined
  >();
  const currentExercise = sessionExercises[currentIndex];

  useEffect(() => {
    let isActive = true;

    const loadTaamSound = async () => {
      if (!currentExercise?.answer) {
        setTaamSound(undefined);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.taamim.list);
        if (!response.ok) throw new Error('Failed to load taamim');

        const taamim: Array<{
          nameHebrew: string;
          taamSound?: { id: string; audioUrl?: string } | null;
        }> = await response.json();
        const taam = taamim.find((item) => item.nameHebrew === currentExercise.answer);

        if (isActive) setTaamSound(taam?.taamSound ?? undefined);
      } catch {
        if (isActive) setTaamSound(undefined);
      }
    };

    void loadTaamSound();
    return () => {
      isActive = false;
    };
  }, [currentExercise?.answer]);

  // Victory screen
  if (currentIndex >= sessionExercises.length) {
    return (
      <SafeAreaView style={styles.victoryScreen}>
        <View style={styles.victoryContent}>
          <Text style={styles.victoryEmoji}>🎉</Text>
          <Text style={styles.victoryTitle}>סיימת את השיעור!</Text>
          <Text style={styles.victorySubtitle}>{title} • +20 XP</Text>
        </View>
        <TouchableOpacity
          style={[theme.presets.buttons.primary.container, styles.victoryButton]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={[theme.presets.buttons.primary.text, styles.victoryButtonText]}>חזרה למפה</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progress = (currentIndex + 1) / sessionExercises.length;
  const isIntro = currentExercise.kind === 'INTRO';

  const handleSelectOption = (option: string) => {
    if (status === 'correct') return;
    setSelectedOption(option);
    setStatus('ready');
  };

  const handlePlayAudio = () => {
    setIsPlayingAudio(true);
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1400);
  };

  const handleAction = () => {
    if (isIntro) {
      // Advance to next
      advanceNext();
      return;
    }

    if (status === 'idle') {
      return;
    }

    if (status === 'ready') {
      const isCorrect = selectedOption === currentExercise.answer;
      if (isCorrect) {
        setStatus('correct');
      } else {
        setStatus('wrong');
        setHearts((h) => Math.max(0, h - 1));
      }
      return;
    }

    if (status === 'correct') {
      advanceNext();
      return;
    }

    if (status === 'wrong') {
      // Allow retry
      setSelectedOption(null);
      setStatus('idle');
    }
  };

  const advanceNext = () => {
    setSelectedOption(null);
    setStatus('idle');
    setIsPlayingAudio(false);
    setCurrentIndex((i) => i + 1);
  };

  const getButtonLabel = () => {
    if (isIntro) return 'המשך';
    if (status === 'correct') return 'המשך';
    if (status === 'wrong') return 'נסה שוב';
    return 'בדוק';
  };

  const isButtonDisabled = !isIntro && status === 'idle';

  return (
    <ExerciseLayout
      onClose={onBack}
      progress={progress}
      hearts={hearts}
      instruction={currentExercise.instruction}
      status={status}
      buttonLabel={getButtonLabel()}
      buttonDisabled={isButtonDisabled}
      onAction={handleAction}
    >
      {/* 1. INTRO Stage */}
      {isIntro && (
        <View style={styles.introContainer}>
          <TropeCard
            name={currentExercise.answer}
            size="lg"
            status="selected"
            style={styles.introCard}
          />
          <View style={styles.audioWrapper}>
            <AudioPlayerButton
              audioUrl={taamSound?.audioUrl}
              isPlaying={isPlayingAudio}
              onPress={handlePlayAudio}
            />
          </View>
          <VoicePracticePanel
            userId={user?.id}
            referenceRecordingId={taamSound?.id}
          />
          <Text style={styles.introHelperText}>הקשב היטב למנגינת הטעם</Text>
        </View>
      )}

      {/* 2. CHOOSE_TROPE Stage */}
      {currentExercise.kind === 'CHOOSE_TROPE' && (
        <View style={styles.chooseContainer}>
          <View style={styles.promptWrapper}>
            <Text style={styles.promptText}>
              {currentExercise.prompt ?? 'איזה טעם זה?'}
            </Text>
            <TropeCard
              name={currentExercise.answer}
              size="md"
              displayMode="symbolOnly"
              status="default"
              disabled
            />
          </View>

          <View style={styles.optionsGrid}>
            {currentExercise.options.map((option) => {
              const isSelected = selectedOption === option;
              let cardStatus: 'default' | 'selected' | 'correct' | 'wrong' = 'default';
              if (isSelected) {
                if (status === 'correct') cardStatus = 'correct';
                else if (status === 'wrong') cardStatus = 'wrong';
                else cardStatus = 'selected';
              }

              return (
                <TropeCard
                  key={option}
                  name={option}
                  size="md"
                  displayMode="nameOnly"
                  status={cardStatus}
                  onPress={() => handleSelectOption(option)}
                  disabled={status === 'correct'}
                  style={styles.gridCard}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* 3. COMPLETE_SEQUENCE Stage */}
      {currentExercise.kind === 'COMPLETE_SEQUENCE' && (
        <View style={styles.sequenceContainer}>
          <Text style={styles.sequencePrompt}>השלם את הטעם החסר ברצף:</Text>

          <View style={styles.sequenceRow}>
            {(currentExercise.sequence ?? []).map((trope, idx) => {
              const isTarget = trope === currentExercise.answer;
              if (isTarget) {
                const filledLabel = selectedOption ?? undefined;
                let slotStatus: 'empty' | 'active' | 'filled' | 'correct' | 'wrong' = filledLabel ? 'filled' : 'empty';
                if (status === 'correct') slotStatus = 'correct';
                if (status === 'wrong') slotStatus = 'wrong';

                return (
                  <SequenceSlot
                    key={`slot-${idx}`}
                    label={filledLabel}
                    isPlaceholder={!filledLabel}
                    status={slotStatus}
                  />
                );
              }

              return (
                <SequenceSlot
                  key={`slot-${idx}`}
                  label={trope}
                  status="filled"
                  disabled
                />
              );
            })}
          </View>

          <View style={styles.optionsRow}>
            {currentExercise.options.map((option) => {
              const isSelected = selectedOption === option;
              let cardStatus: 'default' | 'selected' | 'correct' | 'wrong' = 'default';
              if (isSelected) {
                if (status === 'correct') cardStatus = 'correct';
                else if (status === 'wrong') cardStatus = 'wrong';
                else cardStatus = 'selected';
              }

              return (
                <TropeCard
                  key={option}
                  name={option}
                  size="sm"
                  status={cardStatus}
                  onPress={() => handleSelectOption(option)}
                  disabled={status === 'correct'}
                  style={styles.sequenceOptionCard}
                />
              );
            })}
          </View>
        </View>
      )}
    </ExerciseLayout>
  );
};

const fontRegular = theme.typography.fonts.regular;

const styles = StyleSheet.create({
  introContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: theme.spacing.lg,
  },
  introCard: {
    marginBottom: theme.spacing.xl,
  },
  audioWrapper: {
    marginVertical: theme.spacing.md,
  },
  introHelperText: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  chooseContainer: {
    width: '100%',
    alignItems: 'center',
  },
  promptWrapper: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  promptText: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
    width: '100%',
  },
  gridCard: {
    width: '45%',
  },
  sequenceContainer: {
    width: '100%',
    alignItems: 'center',
  },
  sequencePrompt: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  sequenceRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.xs,
  },
  optionsRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    width: '100%',
  },
  sequenceOptionCard: {
    minWidth: 100,
  },
  victoryScreen: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  victoryContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victoryEmoji: {
    fontSize: 96,
  },
  victoryTitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textInverse,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  victorySubtitle: {
    fontFamily: fontRegular,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.primaryLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  victoryButton: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  victoryButtonText: {
    color: theme.colors.primary,
  },
});
