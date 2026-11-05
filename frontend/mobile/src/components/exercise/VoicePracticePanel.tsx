import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { API_ENDPOINTS } from '../../config/api';
import { theme } from '../../theme';

interface EvaluationResult {
  attemptId: string;
  accuracyScore: number;
  pitchAccuracy: number;
  timingAccuracy: number;
  isPassed: boolean;
  feedbackHebrew: string;
}

interface VoicePracticePanelProps {
  userId?: string;
  referenceRecordingId?: string;
}

type EvaluationPhase = 'idle' | 'recording' | 'uploading' | 'success' | 'error';

const getUploadMetadata = (uri: string) => {
  const uriExtension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (Platform.OS === 'web' || uriExtension === 'webm') {
    return { name: 'user-attempt.webm', type: 'audio/webm' };
  }
  return { name: 'user-attempt.m4a', type: 'audio/mp4' };
};

export const VoicePracticePanel: React.FC<VoicePracticePanelProps> = ({
  userId,
  referenceRecordingId,
}) => {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 200);
  const [phase, setPhase] = useState<EvaluationPhase>('idle');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const removeTemporaryRecording = (uri: string) => {
    if (Platform.OS === 'web') return;

    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      // The recording lives in the cache directory and can also be removed by the OS.
    }
  };

  const uploadRecording = async (uri: string) => {
    if (!userId || !referenceRecordingId) {
      throw new Error('חסרים נתוני משתמש או הקלטת ייחוס');
    }

    const metadata = getUploadMetadata(uri);
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('referenceRecordingId', referenceRecordingId);

    if (Platform.OS === 'web') {
      const recordingResponse = await fetch(uri);
      const recordingBlob = await recordingResponse.blob();
      formData.append('audioFile', recordingBlob, metadata.name);
    } else {
      const recordingFile = new File(uri);
      formData.append('audioFile', recordingFile, metadata.name);
    }

    try {
      const response = await fetch(API_ENDPOINTS.audio.evaluate, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
        throw new Error(message || 'השרת לא הצליח לבדוק את ההקלטה');
      }

      setResult(data as EvaluationResult);
      setPhase('success');
    } finally {
      removeTemporaryRecording(uri);
    }
  };

  const startRecording = async () => {
    if (!userId || !referenceRecordingId) return;

    setErrorMessage(null);
    setResult(null);

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        throw new Error('נדרשת הרשאה למיקרופון כדי לבצע את התרגול');
      }

      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setPhase('recording');
    } catch (error: any) {
      setPhase('error');
      setErrorMessage(error.message || 'לא ניתן להתחיל את ההקלטה');
    }
  };

  const stopAndEvaluate = async () => {
    const recordedDuration = recorderState.durationMillis;
    setPhase('uploading');
    setErrorMessage(null);

    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const uri = recorder.uri;
      if (!uri) throw new Error('קובץ ההקלטה לא נוצר');
      if (recordedDuration < 500) {
        removeTemporaryRecording(uri);
        throw new Error('ההקלטה קצרה מדי. נסה להקליט את הטעם במלואו');
      }

      await uploadRecording(uri);
    } catch (error: any) {
      setPhase('error');
      setErrorMessage(error.message || 'בדיקת ההקלטה נכשלה');
    }
  };

  const isRecording = phase === 'recording' || recorderState.isRecording;
  const isUploading = phase === 'uploading';
  const isUnavailable = !userId || !referenceRecordingId;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          (isUploading || isUnavailable) && styles.recordButtonDisabled,
        ]}
        onPress={() => void (isRecording ? stopAndEvaluate() : startRecording())}
        disabled={isUploading || isUnavailable}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'עצירת הקלטה ושליחה לבדיקה' : 'התחלת הקלטת הטעם'}
      >
        {isUploading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.recordButtonText}>
            {isRecording
              ? `עצור ובדוק (${Math.ceil(recorderState.durationMillis / 1000)} שנ׳)`
              : 'הקלט אותי'}
          </Text>
        )}
      </TouchableOpacity>

      {isUploading && <Text style={styles.helperText}>מעבד את הקול ומשווה להקלטת החזן…</Text>}
      {isUnavailable && <Text style={styles.errorText}>אין הקלטת ייחוס זמינה לטעם הזה</Text>}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {result && (
        <View style={[styles.resultCard, result.isPassed ? styles.passCard : styles.failCard]}>
          <Text style={styles.resultTitle}>{result.isPassed ? 'עבר בהצלחה' : 'כדאי לנסות שוב'}</Text>
          <Text style={styles.scoreText}>{Math.round(result.accuracyScore)}%</Text>
          <Text style={styles.feedbackText}>{result.feedbackHebrew}</Text>
          <Text style={styles.detailsText}>
            דיוק צליל {Math.round(result.pitchAccuracy)}% · דיוק קצב {Math.round(result.timingAccuracy)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  recordButton: {
    minWidth: 180,
    minHeight: 52,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  recordButtonActive: {
    backgroundColor: theme.colors.error,
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.regular,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fonts.regular,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  passCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  failCard: {
    backgroundColor: '#FEF2F2',
    borderColor: theme.colors.error,
  },
  resultTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.md,
    fontWeight: '700',
  },
  scoreText: {
    color: theme.colors.primary,
    fontSize: 34,
    fontWeight: '800',
    marginVertical: theme.spacing.xs,
  },
  feedbackText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fonts.regular,
    textAlign: 'center',
  },
  detailsText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fonts.regular,
    fontSize: theme.typography.sizes.xs,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
