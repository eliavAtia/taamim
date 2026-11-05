import os
import shutil
import tempfile
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from dsp.pitch_extractor import extract_pitch_contour
from dsp.dtw_matcher import match_pitch_contours

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Ta'amim Audio DSP Engine",
    description="Moroccan Cantillation Pitch Extraction & DTW Scoring Microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScoreAttemptPayload(BaseModel):
    userContour: Dict[str, Any]
    referenceContour: Any  # JSONB pitch points
    referenceTonicF0: Optional[float] = None

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "taamim-audio-engine",
        "dsp": "librosa-pYIN-fastdtw",
    }

@app.post("/api/v1/extract-pitch")
async def extract_pitch(file: UploadFile = File(...)):
    """
    Extracts F0 pitch contour, tonic baseline, and relative semitones from an uploaded audio file.
    """
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        contour_data = extract_pitch_contour(tmp_path)
        return contour_data
    except Exception as e:
        logger.exception("Failed to extract pitch from uploaded audio")
        raise HTTPException(status_code=500, detail=f"Audio processing error: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/api/v1/score-attempt")
def score_attempt(payload: ScoreAttemptPayload):
    """
    Compares user pitch contour with Cantor reference recording via DTW
    and returns Moroccan cantillation accuracy and Hebrew pedagogical feedback.
    """
    user_points = payload.userContour.get("points", [])
    
    # Handle reference contour either as direct list or wrapped object
    if isinstance(payload.referenceContour, dict):
        ref_points = payload.referenceContour.get("points", [])
    elif isinstance(payload.referenceContour, list):
        ref_points = payload.referenceContour
    else:
        ref_points = []

    if not user_points or not ref_points:
        raise HTTPException(status_code=400, detail="Invalid user or reference contour data")

    result = match_pitch_contours(
        user_points,
        ref_points,
        user_tonic_f0=payload.userContour.get("tonicF0Hz"),
        reference_tonic_f0=payload.referenceTonicF0,
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
