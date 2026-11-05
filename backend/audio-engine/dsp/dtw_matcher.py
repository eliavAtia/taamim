import numpy as np
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
from typing import Dict, Any, List
from pydantic import BaseModel
from .normalizer import normalize_pitch_points

class DTWResult(BaseModel):
    dtwDistance: float
    accuracyScore: float
    pitchAccuracy: float
    timingAccuracy: float
    isPassed: bool
    feedbackHebrew: str


def pitch_accuracy_from_distance(normalized_distance: float) -> float:
    """Map average semitone error to the product's calibrated pitch score."""
    distance_anchors = np.array([0.0, 0.5, 1.0, 2.0, 2.5, 3.0, 4.0, 5.0])
    score_anchors = np.array([100.0, 85.0, 75.0, 60.0, 50.0, 30.0, 10.0, 0.0])
    return float(
        np.interp(
            max(0.0, normalized_distance),
            distance_anchors,
            score_anchors,
        )
    )

def match_pitch_contours(
    user_points: List[Dict[str, Any]],
    reference_points: List[Dict[str, Any]],
    user_tonic_f0: float | None = None,
    reference_tonic_f0: float | None = None,
    pass_threshold: float = 75.0,
) -> Dict[str, Any]:
    """
    Performs Dynamic Time Warping (DTW) between user relative semitone sequence
    and Cantor reference sequence.
    """
    # Normalize each voice around its own tonic before comparing melodic shape.
    user_points = normalize_pitch_points(user_points, user_tonic_f0)
    reference_points = normalize_pitch_points(reference_points, reference_tonic_f0)

    # Filter voiced frames for pure melodic comparison
    user_voiced = [p["semitoneRel"] for p in user_points if p.get("isVoiced", True)]
    ref_voiced = [p["semitoneRel"] for p in reference_points if p.get("isVoiced", True)]

    if len(user_voiced) < 5:
        return {
            "dtwDistance": 999.0,
            "accuracyScore": 0.0,
            "pitchAccuracy": 0.0,
            "timingAccuracy": 0.0,
            "isPassed": False,
            "feedbackHebrew": "לא זוהה קול ברור. נסה לשיר שוב קרוב יותר למיקרופון.",
        }

    user_seq = np.array(user_voiced).reshape(-1, 1)
    ref_seq = np.array(ref_voiced).reshape(-1, 1)

    # Compute DTW distance with Euclidean metric
    distance, path = fastdtw(user_seq, ref_seq, dist=euclidean)
    normalized_distance = distance / len(path)

    # Product-calibrated piecewise mapping. Values between anchors are interpolated.
    pitch_accuracy = pitch_accuracy_from_distance(normalized_distance)

    # Duration comparison (timing accuracy)
    user_len = len(user_voiced)
    ref_len = len(ref_voiced)
    duration_ratio = min(user_len, ref_len) / max(user_len, ref_len)
    timing_accuracy = round(float(duration_ratio * 100.0), 1)

    # Timing is currently only a rough voiced-duration estimate. It may reduce the
    # melodic score slightly, but it must never inflate it above the requested curve.
    timing_factor = 0.85 + 0.15 * duration_ratio
    overall_score = round(pitch_accuracy * timing_factor, 1)
    is_passed = overall_score >= pass_threshold

    # Formulate Hebrew feedback based on Moroccan cantillation performance
    if overall_score >= 90:
        feedback = "מצוין! סלסול מרוקאי מדויק ומלוטש להפליא!"
    elif overall_score >= 80:
        feedback = "יפה מאוד! הנגינה נכונה והסלסול יושב היטב על הטעם."
    elif overall_score >= 70:
        feedback = "כמעט שם! שים לב להדגשת העלייה או הירידה בסיום הטעם."
    elif overall_score >= 50:
        feedback = "יש דיוק חלקי. האזן שוב לביצוע של החזן ונסה לשמור על גובה יציב."
    else:
        feedback = "לא נורא, כל התחלה קשה! הקשב שוב לקו המלודי ונסה לחזור אחריו במדויק."

    return {
        "dtwDistance": round(float(normalized_distance), 3),
        "accuracyScore": overall_score,
        "pitchAccuracy": round(pitch_accuracy, 1),
        "timingAccuracy": timing_accuracy,
        "isPassed": is_passed,
        "feedbackHebrew": feedback,
    }
