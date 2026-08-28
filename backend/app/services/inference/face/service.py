"""Frame-level face detection for authorized surveillance workflows."""

from __future__ import annotations

from typing import Any, List

from ..contracts import BoundingBox, InferenceDetection


class FaceDetectionService:
    """Detect faces without persisting or matching identities in this service."""

    def __init__(self, model_path: str, confidence: float = 0.50) -> None:
        self.model_path = model_path
        self.confidence = confidence
        self._model: Any = None

    def process_frame(self, frame: Any) -> List[InferenceDetection]:
        """Return detected face locations for a single BGR frame."""

        self._ensure_loaded()
        result = self._model(frame, conf=self.confidence, verbose=False)[0]
        detections: List[InferenceDetection] = []
        for x1, y1, x2, y2, score, _class_id in result.boxes.data.tolist():
            detections.append(
                InferenceDetection(
                    label="face",
                    confidence=float(score),
                    bounding_box=BoundingBox(int(x1), int(y1), int(x2), int(y2)),
                )
            )
        return detections

    def warmup(self) -> None:
        """Load the face detector before the first live frame."""

        self._ensure_loaded()

    def _ensure_loaded(self) -> None:
        if self._model is None:
            from ultralytics import YOLO

            self._model = YOLO(self.model_path)
