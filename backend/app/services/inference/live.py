"""On-demand frame inference for the local camera preview.

The web process loads the model lazily on the first request. Production camera
workers can use the specialised person, face, and ANPR services instead; this
small endpoint makes the local browser camera observable during development.
"""

from __future__ import annotations

import os
import threading
import time
from pathlib import Path
from typing import Any


class InferenceConfigurationError(RuntimeError):
    """Raised when the configured model or inference dependency is unavailable."""


_MODEL_LOCK = threading.Lock()
_MODEL: Any = None
_MODEL_PATH: Path | None = None


def _model_path() -> Path:
    configured = os.getenv("PERSON_MODEL_PATH", "").strip()
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[3] / ".localdata" / "models" / "yolov8n.pt"


def _load_model() -> tuple[Any, Path]:
    global _MODEL, _MODEL_PATH
    path = _model_path()
    if _MODEL is not None and _MODEL_PATH == path:
        return _MODEL, path

    if not path.is_file():
        raise InferenceConfigurationError(
            f"AI model not found at {path}. Set PERSON_MODEL_PATH or place yolov8n.pt in backend/.localdata/models/."
        )

    with _MODEL_LOCK:
        if _MODEL is None or _MODEL_PATH != path:
            try:
                from ultralytics import YOLO
            except ImportError as exc:
                raise InferenceConfigurationError(
                    "Ultralytics is not installed. Install backend/requirements-ai.txt in the inference environment."
                ) from exc
            _MODEL = YOLO(str(path))
            _MODEL_PATH = path
    return _MODEL, path


def detect_frame(frame_bytes: bytes) -> dict[str, Any]:
    """Run YOLO on one JPEG frame and return browser-friendly coordinates."""

    try:
        import cv2
        import numpy as np
    except ImportError as exc:
        raise InferenceConfigurationError(
            "OpenCV and NumPy are not installed. Install backend/requirements-ai.txt."
        ) from exc

    frame = cv2.imdecode(np.frombuffer(frame_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("The request body is not a readable JPEG frame.")

    model, path = _load_model()
    try:
        confidence = float(os.getenv("AI_FRAME_CONFIDENCE", "0.35"))
    except ValueError:
        confidence = 0.35
    confidence = max(0.05, min(confidence, 0.99))

    started = time.perf_counter()
    result = model.predict(source=frame, conf=confidence, verbose=False)[0]
    height, width = frame.shape[:2]
    detections = []
    names = model.names
    for x1, y1, x2, y2, score, class_id in result.boxes.data.tolist():
        label = names[int(class_id)] if isinstance(names, (list, tuple)) else names.get(int(class_id), str(class_id))
        detections.append(
            {
                "label": str(label),
                "confidence": round(float(score), 4),
                "box": {
                    "x": round(max(0.0, min(100.0, float(x1) / width * 100)), 3),
                    "y": round(max(0.0, min(100.0, float(y1) / height * 100)), 3),
                    "width": round(max(0.0, min(100.0, (float(x2) - float(x1)) / width * 100)), 3),
                    "height": round(max(0.0, min(100.0, (float(y2) - float(y1)) / height * 100)), 3),
                },
            }
        )

    device = str(getattr(model, "device", "cpu"))
    return {
        "status": "ok",
        "model": path.name,
        "device": device,
        "confidenceThreshold": confidence,
        "inferenceMs": round((time.perf_counter() - started) * 1000, 1),
        "frameWidth": width,
        "frameHeight": height,
        "detections": detections,
    }
