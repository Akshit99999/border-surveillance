"""No-network tests for the combined local camera inference pipeline."""

from __future__ import annotations

import unittest
from pathlib import Path
from typing import Any

import numpy as np

from backend.app.services.inference.contracts import BoundingBox, InferenceDetection
from backend.app.services.inference.live import LiveInferenceConfig, LiveInferencePipeline


class FakeService:
    def __init__(self, detections: list[InferenceDetection]) -> None:
        self.detections = detections

    def process_frame(self, frame: Any) -> list[InferenceDetection]:
        return self.detections

    def warmup(self) -> None:
        return None


class LiveInferenceTests(unittest.TestCase):
    def config(self) -> LiveInferenceConfig:
        model = Path("person.pt")
        return LiveInferenceConfig(
            person_model_path=model,
            face_model_path=Path("face.pt"),
            anpr_vehicle_model_path=model,
            anpr_plate_model_path=Path("plate.pt"),
            person_enabled=True,
            face_enabled=True,
            anpr_enabled=True,
            person_confidence=0.35,
            face_confidence=0.50,
            anpr_vehicle_confidence=0.70,
            anpr_plate_confidence=0.25,
            anpr_image_size=640,
            max_frame_dimension=640,
        )

    def test_combines_person_face_and_anpr_results(self) -> None:
        def person_factory(*args: Any, **kwargs: Any) -> FakeService:
            return FakeService([
                InferenceDetection("person", 0.91, BoundingBox(10, 20, 110, 220), track_id="7")
            ])

        def face_factory(*args: Any, **kwargs: Any) -> FakeService:
            return FakeService([
                InferenceDetection("face", 0.88, BoundingBox(20, 30, 70, 90))
            ])

        def anpr_factory(*args: Any, **kwargs: Any) -> FakeService:
            return FakeService([
                InferenceDetection(
                    "license_plate",
                    0.83,
                    BoundingBox(50, 180, 100, 200),
                    attributes={"plate_number": "MH12AB1234"},
                )
            ])

        pipeline = LiveInferencePipeline(
            self.config(), person_factory=person_factory, face_factory=face_factory, anpr_factory=anpr_factory
        )
        result = pipeline.process_frame(np.zeros((240, 320, 3), dtype=np.uint8))

        self.assertEqual(result["status"], "ok")
        self.assertEqual([item["source"] for item in result["detections"]], [
            "person_tracking", "face_detection", "anpr"
        ])
        self.assertEqual(result["detections"][0]["trackId"], "7")
        self.assertEqual(result["detections"][2]["attributes"]["plate_number"], "MH12AB1234")
        self.assertEqual([module["status"] for module in result["modules"]], ["active"] * 3)

    def test_one_unavailable_module_does_not_hide_other_results(self) -> None:
        def failing_face_factory(*args: Any, **kwargs: Any) -> FakeService:
            raise RuntimeError("face model unavailable")

        pipeline = LiveInferencePipeline(
            self.config(),
            person_factory=lambda *args, **kwargs: FakeService([]),
            face_factory=failing_face_factory,
            anpr_factory=lambda *args, **kwargs: FakeService([]),
        )
        result = pipeline.process_frame(np.zeros((100, 200, 3), dtype=np.uint8))

        self.assertEqual(result["status"], "partial")
        self.assertEqual(result["modules"][1]["status"], "unavailable")
        self.assertEqual(result["modules"][1]["message"], "face model unavailable")


if __name__ == "__main__":
    unittest.main()
