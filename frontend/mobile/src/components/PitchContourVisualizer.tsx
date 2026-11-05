import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import {
  Canvas,
  Path,
  Skia,
  Circle,
  LinearGradient,
  vec,
} from '@shopify/react-native-skia';
import {
  SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

interface ReferencePoint {
  timestampMs: number;
  semitoneRel: number;
}

interface PitchContourVisualizerProps {
  // Cantor pre-computed reference contour (Static target path)
  referencePoints: ReferencePoint[];
  durationMs: number;

  // Real-time animation SharedValues (Direct 60FPS UI thread - NO useState!)
  progressMs: SharedValue<number>;     // Current playback / recording time in ms
  currentUserSemitone: SharedValue<number>; // Real-time user pitch from lightweight pitch detector

  width?: number;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 60FPS High-Performance Pitch Contour Canvas
 * Powered by React Native Skia + React Native Reanimated SharedValues.
 * Strictly adheres to project rules: Zero React state re-renders during 60FPS frame loop.
 */
export const PitchContourVisualizer: React.FC<PitchContourVisualizerProps> = ({
  referencePoints,
  durationMs,
  progressMs,
  currentUserSemitone,
  width = SCREEN_WIDTH - 40,
  height = 180,
}) => {
  const SEMITONE_RANGE = 12; // -6 to +6 semitones range around tonic

  const timeToX = (tMs: number) => {
    'worklet';
    if (durationMs <= 0) return 0;
    return (tMs / durationMs) * width;
  };

  const semitoneToY = (st: number) => {
    'worklet';
    const centerY = height / 2;
    // Positive semitone goes up (-Y in screen coords)
    return centerY - (st / SEMITONE_RANGE) * (height / 2);
  };

  // 1. Build static reference Skia Path (Cantor's reference contour)
  const referencePath = React.useMemo(() => {
    const path = Skia.Path.Make();
    if (!referencePoints || referencePoints.length === 0) return path;

    referencePoints.forEach((pt, idx) => {
      const x = (pt.timestampMs / (durationMs || 1)) * width;
      const y = (height / 2) - (pt.semitoneRel / SEMITONE_RANGE) * (height / 2);
      if (idx === 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    });

    return path;
  }, [referencePoints, durationMs, width, height]);

  // 2. Animated User Pitch Cursor position derived on UI thread (Reanimated Worklet)
  const cursorX = useDerivedValue(() => {
    return timeToX(progressMs.value);
  }, [durationMs, width]);

  const cursorY = useDerivedValue(() => {
    return semitoneToY(currentUserSemitone.value);
  }, [height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={{ width, height }}>
        {/* Baseline Center Tonic Guide (0 semitones) */}
        <Path
          path={`M 0 ${height / 2} L ${width} ${height / 2}`}
          color="rgba(255, 255, 255, 0.15)"
          style="stroke"
          strokeWidth={1}
        />

        {/* Cantor Reference Path (Glowing Gold / Moroccan Amber) */}
        <Path
          path={referencePath}
          style="stroke"
          strokeWidth={4}
          strokeCap="round"
          strokeJoin="round"
          color="#F59E0B"
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={['#FBBF24', '#D97706', '#F59E0B']}
          />
        </Path>

        {/* Real-time 60FPS User Pitch Cursor (Duolingo Cyan Glow) */}
        <Circle
          cx={cursorX}
          cy={cursorY}
          r={7}
          color="#06B6D4"
        />
        <Circle
          cx={cursorX}
          cy={cursorY}
          r={12}
          color="rgba(6, 182, 212, 0.3)"
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginVertical: 12,
  },
});
