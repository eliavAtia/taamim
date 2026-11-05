import unittest
from unittest.mock import patch

import numpy as np

from dsp.dtw_matcher import match_pitch_contours, pitch_accuracy_from_distance
from dsp.pitch_extractor import extract_pitch_contour


class DspPipelineTests(unittest.TestCase):
    def test_pitch_score_matches_calibrated_semitone_anchors(self):
        expected_scores = {
            0.0: 100.0,
            0.5: 85.0,
            1.0: 75.0,
            2.0: 60.0,
            2.5: 50.0,
            3.0: 30.0,
            4.0: 10.0,
            5.0: 0.0,
        }

        for distance, expected_score in expected_scores.items():
            with self.subTest(distance=distance):
                self.assertEqual(
                    pitch_accuracy_from_distance(distance),
                    expected_score,
                )

    def test_pitch_score_interpolates_between_anchors(self):
        self.assertEqual(pitch_accuracy_from_distance(1.5), 67.5)
        self.assertEqual(pitch_accuracy_from_distance(3.5), 20.0)
        self.assertEqual(pitch_accuracy_from_distance(6.0), 0.0)

    def test_matcher_normalizes_each_voice_with_its_own_tonic(self):
        shape = [0, 1, 3, 5, 2]

        def contour(tonic):
            return [
                {
                    "f0Hz": tonic * (2 ** (semitone / 12)),
                    "semitoneRel": 99,
                    "isVoiced": True,
                }
                for semitone in shape
            ]

        result = match_pitch_contours(
            contour(220),
            contour(110),
            user_tonic_f0=220,
            reference_tonic_f0=110,
        )

        self.assertEqual(result["accuracyScore"], 100.0)
        self.assertTrue(result["isPassed"])

    @patch("dsp.pitch_extractor.librosa.times_like")
    @patch("dsp.pitch_extractor.librosa.pyin")
    @patch("dsp.pitch_extractor.librosa.load")
    def test_extractor_strips_silent_edges_and_rebases_timestamps(
        self,
        mock_load,
        mock_pyin,
        mock_times_like,
    ):
        mock_load.return_value = (np.zeros(4096), 22050)
        mock_pyin.return_value = (
            np.array([0.0, 0.0, 100.0, 110.0, 120.0, 0.0]),
            np.array([False, False, True, True, True, False]),
            np.array([0.0, 0.0, 0.95, 0.98, 0.96, 0.0]),
        )
        mock_times_like.return_value = np.array([0.0, 0.1, 0.2, 0.3, 0.4, 0.5])

        result = extract_pitch_contour("ignored.wav")

        self.assertEqual(len(result["points"]), 3)
        self.assertEqual([point["timestampMs"] for point in result["points"]], [0, 100, 200])
        self.assertTrue(all(point["isVoiced"] for point in result["points"]))
        self.assertEqual(result["durationMs"], 223)


if __name__ == "__main__":
    unittest.main()
