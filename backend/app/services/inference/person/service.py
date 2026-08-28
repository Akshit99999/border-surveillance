"""Backend-safe person detection and DeepSORT tracking.

This replaces the source module's hard-coded input/output files and GUI loop
with a frame-level service that can run from a Django worker.
"""

from __future__ import annotations

from typing import Any, List

from ..contracts import BoundingBox, InferenceDetection


class PersonTrackingService:
    """Track people across sequential frames supplied by one camera worker."""

    PERSON_CLASS_ID = 0

    def __init__(
        self,
        model_path: str,
        confidence: float = 0.50,
        max_age: int = 200,
        n_init: int = 5,
    ) -> None:
        self.model_path = model_path
        self.confidence = confidence
        self.max_age = max_age
        self.n_init = n_init
        self._model: Any = None
        self._tracker: Any = None

    def process_frame(self, frame: Any) -> List[InferenceDetection]:
        """Return confirmed person tracks for the next frame of one camera."""

        self._ensure_loaded()
        result = self._model(frame, conf=self.confidence, verbose=False)[0]
        tracker_input = []
        for x1, y1, x2, y2, score, class_id in result.boxes.data.tolist():
            if int(class_id) != self.PERSON_CLASS_ID:
                continue
            tracker_input.append(
                (
                    [int(x1), int(y1), int(x2 - x1), int(y2 - y1)],
                    float(score),
                    "person",
                )
            )

        detections: List[InferenceDetection] = []
        for track in self._tracker.update_tracks(tracker_input, frame=frame):
            if not track.is_confirmed():
                continue
            left, top, right, bottom = (int(value) for value in track.to_ltrb())
            detections.append(
                InferenceDetection(
                    label="person",
                    confidence=1.0,
                    bounding_box=BoundingBox(left, top, right, bottom),
                    track_id=str(track.track_id),
                )
            )
        return detections

    def _ensure_loaded(self) -> None:
        if self._model is not None:
            return

        from deep_sort_realtime.deepsort_tracker import DeepSort
        from ultralytics import YOLO

        self._model = YOLO(self.model_path)
        self._tracker = DeepSort(max_age=self.max_age, n_init=self.n_init)
