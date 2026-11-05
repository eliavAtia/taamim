import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dsp.pitch_extractor import extract_pitch_contour


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: extract_pitch_file.py <audio-file>")

    audio_path = Path(sys.argv[1]).resolve()
    if not audio_path.is_file():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    contour = extract_pitch_contour(str(audio_path))
    print(json.dumps(contour, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    main()
