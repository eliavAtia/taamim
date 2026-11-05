import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { API_BASE_URL } from '../../config/api';

interface AudioPlayerButtonProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onPress?: () => void;
}

const resolveAudioUrl = (audioUrl: string): string => {
  if (/^https?:\/\//i.test(audioUrl)) return audioUrl;
  return `${API_BASE_URL}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
};

export const AudioPlayerButton: React.FC<AudioPlayerButtonProps> = ({
  audioUrl,
  isPlaying: externalIsPlaying = false,
  onPress,
}) => {
  const source = useMemo(() => (audioUrl ? resolveAudioUrl(audioUrl) : null), [audioUrl]);
  const player = useAudioPlayer(source);
  const playbackStatus = useAudioPlayerStatus(player);
  const pulse = useRef(new Animated.Value(1)).current;
  const isPlaying = playbackStatus.playing;
  const active = isPlaying || externalIsPlaying;

  useEffect(() => {
    if (!active) {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulse]);

  const handlePress = async () => {
    if (!source || isPlaying) return;

    onPress?.();

    if (playbackStatus.didJustFinish || playbackStatus.currentTime >= playbackStatus.duration) {
      await player.seekTo(0);
    }

    player.play();
  };

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <TouchableOpacity
        style={[styles.button, active && styles.buttonPlaying, !source && styles.buttonDisabled]}
        onPress={() => void handlePress()}
        disabled={!source || isPlaying}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="השמעת הקלטת הטעם"
      >
        <Text style={styles.icon}>{active ? '🔊' : '▶️'}</Text>
        <Text style={styles.label}>{active ? 'מנגן...' : 'השמע'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 112,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonPlaying: {
    backgroundColor: '#F59E0B',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
