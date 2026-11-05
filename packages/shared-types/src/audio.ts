/**
 * Audio DSP & Pitch Processing Types
 */

export interface PitchPoint {
  timestampMs: number;
  f0Hz: number;          // Fundamental frequency in Hz (0 if unvoiced/silent)
  semitoneRel: number;   // Semitone relative to baseline tonic F0: 12 * log2(f0 / tonicF0)
  confidence: number;    // Detection probability (0.0 - 1.0)
  isVoiced: boolean;
}

export interface PitchContourData {
  tonicF0Hz: number;     // Median F0 baseline used as the key anchor
  durationMs: number;
  sampleRate: number;
  points: PitchPoint[];
}

export interface DTWAnalysisRequest {
  userRecordingUrl?: string;
  referenceRecordingId: string;
}

export interface DTWAnalysisResponse {
  overallScore: number;       // 0 to 100 accuracy score
  pitchDistance: number;      // Raw DTW normalized distance
  pitchAccuracy: number;      // 0 to 100 percentage
  timingAccuracy: number;     // 0 to 100 percentage
  isPassed: boolean;          // True if overallScore >= threshold (typically 75)
  feedbackHebrew: string;     // e.g. "דיוק מושלם בסלסול המרוקאי!", "שים לב להארכת הטעם בסיום"
  userTonicF0: number;
  referenceTonicF0: number;
  userPitchContour: PitchPoint[];
  referencePitchContour: PitchPoint[];
}
