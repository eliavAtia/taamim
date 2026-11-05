import numpy as np
from typing import Any, Dict, List, Optional, Tuple

def compute_median_tonic(f0_series: np.ndarray, voiced_mask: np.ndarray) -> float:
    """
    Computes the baseline tonic F0 (Median fundamental frequency of voiced frames).
    Filters out silence and unvoiced noise.
    """
    voiced_f0 = f0_series[voiced_mask & (f0_series > 50.0) & (f0_series < 800.0)]
    if len(voiced_f0) == 0:
        return 220.0  # Fallback default tonic (A3)
    return float(np.median(voiced_f0))

def normalize_to_semitones(
    f0_series: np.ndarray,
    tonic_f0: float,
    voiced_mask: np.ndarray,
) -> np.ndarray:
    """
    Converts fundamental frequency (Hz) into semitones relative to tonic:
    semitone = 12 * log2(f0 / tonic_f0)
    
    This crucial normalization enables invariant melodic contour matching across
    different vocal registers (men, women, and children).
    Unvoiced/silent frames are mapped to NaN or 0.0 depending on downstream DTW needs.
    """
    semitones = np.zeros_like(f0_series, dtype=np.float32)
    valid_idx = voiced_mask & (f0_series > 0.0) & (tonic_f0 > 0.0)
    semitones[valid_idx] = 12.0 * np.log2(f0_series[valid_idx] / tonic_f0)
    return semitones

def normalize_pitch_points(
    points: List[Dict[str, Any]],
    tonic_f0: Optional[float],
) -> List[Dict[str, Any]]:
    """Recomputes relative semitones from F0 using the contour's own tonic."""
    if tonic_f0 is None or tonic_f0 <= 0:
        return points

    normalized_points: List[Dict[str, Any]] = []
    for point in points:
        normalized_point = dict(point)
        f0_hz = float(point.get("f0Hz", 0.0) or 0.0)
        is_voiced = bool(point.get("isVoiced", f0_hz > 0.0))

        if is_voiced and f0_hz > 0.0:
            normalized_point["semitoneRel"] = float(12.0 * np.log2(f0_hz / tonic_f0))
        else:
            normalized_point["semitoneRel"] = 0.0

        normalized_points.append(normalized_point)

    return normalized_points

def strip_silent_edges(
    semitones: np.ndarray,
    voiced_mask: np.ndarray,
    times_ms: np.ndarray,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Strips leading and trailing unvoiced/silent frames so DTW compares
    only active singing/cantillation portions.
    """
    voiced_indices = np.where(voiced_mask)[0]
    if len(voiced_indices) == 0:
        return semitones, voiced_mask, times_ms
    
    start_idx = voiced_indices[0]
    end_idx = voiced_indices[-1] + 1
    return (
        semitones[start_idx:end_idx],
        voiced_mask[start_idx:end_idx],
        times_ms[start_idx:end_idx],
    )
