import os
import subprocess
import tempfile

import numpy as np
import librosa
from imageio_ffmpeg import get_ffmpeg_exe
from typing import Dict, Any, List
from .normalizer import compute_median_tonic, normalize_to_semitones, strip_silent_edges


def _load_audio(audio_path: str, target_sr: int) -> tuple[np.ndarray, int]:
    """Load audio directly, falling back to bundled FFmpeg for M4A/AAC/WebM."""
    compressed_extensions = {".m4a", ".mp4", ".aac", ".webm", ".3gp"}
    direct_error: Exception | None = None

    if os.path.splitext(audio_path)[1].lower() not in compressed_extensions:
        try:
            return librosa.load(audio_path, sr=target_sr, mono=True)
        except Exception as error:
            direct_error = error

    wav_path = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as wav_file:
            wav_path = wav_file.name

        creation_flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        conversion = subprocess.run(
            [
                get_ffmpeg_exe(),
                "-v", "error",
                "-nostdin",
                "-y",
                "-i", audio_path,
                "-vn",
                "-t", "60",
                "-ac", "1",
                "-ar", str(target_sr),
                "-c:a", "pcm_s16le",
                wav_path,
            ],
            capture_output=True,
            text=True,
            timeout=30,
            creationflags=creation_flags,
            check=False,
        )
        if conversion.returncode != 0:
            detail = conversion.stderr.strip() or "unknown FFmpeg error"
            raise ValueError(f"Unsupported or invalid audio file: {detail}") from direct_error

        return librosa.load(wav_path, sr=target_sr, mono=True)
    except subprocess.TimeoutExpired as error:
        raise ValueError("Audio conversion timed out") from error
    finally:
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)

def extract_pitch_contour(
    audio_path: str,
    target_sr: int = 22050,
    hop_length: int = 512,
    fmin: float = 65.0,  # C2
    fmax: float = 800.0, # G5
    min_voiced_probability: float = 0.1,
) -> Dict[str, Any]:
    """
    Extracts high-resolution F0 pitch contour using librosa pYIN algorithm.
    Calculates median baseline tonic and relative semitone values.
    """
    # 1. Load audio with target sample rate
    y, sr = _load_audio(audio_path, target_sr)
    if y.size == 0:
        raise ValueError("The audio file is empty")
    frame_duration_ms = int(round(hop_length / sr * 1000))

    # 2. Extract F0 and voiced probability via pYIN
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y,
        fmin=fmin,
        fmax=fmax,
        sr=sr,
        hop_length=hop_length,
        fill_na=0.0,
    )

    times = librosa.times_like(f0, sr=sr, hop_length=hop_length)
    times_ms = (times * 1000.0).astype(np.int32)
    f0 = np.nan_to_num(f0, nan=0.0)

    # WhatsApp/Opus recordings can produce low-confidence pYIN floor values
    # that are marked as voiced. Exclude them from tonic and DTW data.
    voiced_flag = voiced_flag & (voiced_probs >= min_voiced_probability)

    # 3. Determine baseline tonic (Median voiced F0)
    tonic_f0 = compute_median_tonic(f0, voiced_flag)

    # 4. Normalize to relative semitones
    semitones = normalize_to_semitones(f0, tonic_f0, voiced_flag)

    # 5. Remove leading/trailing silence and keep every frame array aligned
    original_times_ms = times_ms
    semitones, voiced_flag, times_ms = strip_silent_edges(
        semitones,
        voiced_flag,
        original_times_ms,
    )
    if len(times_ms) > 0:
        start_idx = int(np.searchsorted(original_times_ms, times_ms[0]))
        end_idx = start_idx + len(times_ms)
        f0 = f0[start_idx:end_idx]
        voiced_probs = voiced_probs[start_idx:end_idx]
        times_ms = times_ms - times_ms[0]

    duration_ms = int(times_ms[-1] + frame_duration_ms) if len(times_ms) else 0

    # 6. Build structured points
    points: List[Dict[str, Any]] = []
    for i in range(len(f0)):
        points.append({
            "timestampMs": int(times_ms[i]),
            "f0Hz": round(float(f0[i]), 2),
            "semitoneRel": round(float(semitones[i]), 2),
            "confidence": round(float(voiced_probs[i]), 3),
            "isVoiced": bool(voiced_flag[i]),
        })

    return {
        "tonicF0Hz": round(tonic_f0, 2),
        "durationMs": duration_ms,
        "sampleRate": sr,
        "points": points,
    }
