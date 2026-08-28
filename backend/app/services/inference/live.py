"""Live multi-module inference for the local camera preview.

The local preview uses the supplied person-tracking, face-detection, and ANPR
modules through their backend-safe frame services. It performs detection only:
no face identity matching, watchlist lookup, frame persistence, or automatic
incident creation happens here.
"""

from __future__ import annotations

import os
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, Mapping

from .anpr import AnprService
from .contracts import BoundingBox, InferenceDetection
from .face import FaceDetectionService
from .person import PersonTrackingService


class InferenceConfigurationError(RuntimeError):
    """Raised when the JPEG frame or inference dependencies are unavailable."""


_PIPELINE_LOCK = threading.Lock()
_PIPELINE: "LiveInferencePipeline | None" = None


def _backend_dir() -> Path:
    return Path(__file__).resolve().parents[3]


def _env_flag(values: Mapping[str, str], name: str, default: bool) -> bool:
    value = values.get(name, "").strip().lower()
    if not value:
        return default
    return value in {"1", "true", "yes", "on"}


def _env_float(values: Mapping[str, str], name: str, default: float) -> float:
    try:
        return max(0.05, min(float(values.get(name, str(default))), 0.99))
    except (TypeError, ValueError):
        return default


def _env_int(values: Mapping[str, str], name: str, default: int) -> int:
    try:
        return max(320, min(int(values.get(name, str(default))), 1280))
    except (TypeError, ValueError):
        return default


def _model_path(values: Mapping[str, str], name: str, fallback: Path) -> Path:
    configured = values.get(name, "").strip()
    return Path(configured).expanduser() if configured else fallback


@dataclass(frozen=True)
class LiveInferenceConfig:
    """Runtime configuration for the three supplied frame-level modules."""

    person_model_path: Path
    face_model_path: Path
    anpr_vehicle_model_path: Path
    anpr_plate_model_path: Path
    person_enabled: bool
    face_enabled: bool
    anpr_enabled: bool
    person_confidence: float
    face_confidence: float
    anpr_vehicle_confidence: float
    anpr_plate_confidence: float
    anpr_image_size: int

    @classmethod
    def from_env(cls, environ: Mapping[str, str] | None = None) -> "LiveInferenceConfig":
        values = environ if environ is not None else os.environ
        model_dir = _backend_dir() / ".localdata" / "models"
        person_model_path = _model_path(values, "PERSON_MODEL_PATH", model_dir / "yolov8n.pt")
        return cls(
            person_model_path=person_model_path,
            face_model_path=_model_path(values, "FACE_MODEL_PATH", model_dir / "yolov8n-face-keypoints.pt"),
            anpr_vehicle_model_path=_model_path(values, "ANPR_VEHICLE_MODEL_PATH", person_model_path),
            anpr_plate_model_path=_model_path(values, "ANPR_PLATE_MODEL_PATH", model_dir / "INPD_more_accuracy_n.pt"),
            person_enabled=_env_flag(values, "AI_ENABLE_PERSON_TRACKING", True),
            face_enabled=_env_flag(values, "AI_ENABLE_FACE_DETECTION", True),
            anpr_enabled=_env_flag(values, "AI_ENABLE_ANPR", True),
            person_confidence=_env_float(values, "AI_FRAME_CONFIDENCE", 0.35),
            face_confidence=_env_float(values, "AI_FACE_CONFIDENCE", 0.50),
            anpr_vehicle_confidence=_env_float(values, "AI_ANPR_VEHICLE_CONFIDENCE", 0.70),
            anpr_plate_confidence=_env_float(values, "AI_ANPR_PLATE_CONFIDENCE", 0.25),
            anpr_image_size=_env_int(values, "AI_ANPR_IMAGE_SIZE", 640),
        )


class LiveInferencePipeline:
    """Cache model services and merge their normalized frame results.

    A pipeline instance represents one local preview stream. Production camera
    workers should construct one instance per physical camera so DeepSORT IDs
    cannot cross between feeds.
    """

    def __init__(
        self,
        config: LiveInferenceConfig,
        person_factory: Callable[..., Any] = PersonTrackingService,
        face_factory: Callable[..., Any] = FaceDetectionService,
        anpr_factory: Callable[..., Any] = AnprService,
    ) -> None:
        self.config = config
        self._person_factory = person_factory
        self._face_factory = face_factory
        self._anpr_factory = anpr_factory
        self._person_service: Any = None
        self._face_service: Any = None
        self._anpr_service: Any = None

    def process_frame(self, frame: Any) -> dict[str, Any]:
        height, width = frame.shape[:2]
        started = time.perf_counter()
        detections: list[dict[str, Any]] = []
        modules = [
            self._run_person(frame, width, height, detections),
            self._run_face(frame, width, height, detections),
            self._run_anpr(frame, width, height, detections),
        ]
        unavailable = any(module["status"] == "unavailable" for module in modules)
        return {
            "status": "partial" if unavailable else "ok",
            "model": "person-tracking + face-detection + indian-anpr",
            "device": _device_name(),
            "confidenceThreshold": self.config.person_confidence,
            "inferenceMs": round((time.perf_counter() - started) * 1000, 1),
            "frameWidth": width,
            "frameHeight": height,
            "detections": detections,
            "modules": modules,
        }

    def _run_person(
        self, frame: Any, width: int, height: int, output: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not self.config.person_enabled:
            return _module_result("person_tracking", "Person tracking", self.config.person_model_path, "disabled")
        try:
            if self._person_service is None:
                self._person_service = self._person_factory(
                    str(self.config.person_model_path), confidence=self.config.person_confidence
                )
            detections = self._person_service.process_frame(frame)
            output.extend(_serialize_detection(item, "person_tracking", width, height) for item in detections)
            return _module_result(
                "person_tracking", "Person tracking", self.config.person_model_path, "active", len(detections)
            )
        except Exception as exc:
            return _module_result(
                "person_tracking", "Person tracking", self.config.person_model_path, "unavailable", message=_module_error(exc)
            )

    def _run_face(
        self, frame: Any, width: int, height: int, output: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not self.config.face_enabled:
            return _module_result("face_detection", "Face detection", self.config.face_model_path, "disabled")
        try:
            if self._face_service is None:
                self._face_service = self._face_factory(
                    str(self.config.face_model_path), confidence=self.config.face_confidence
                )
            detections = self._face_service.process_frame(frame)
            output.extend(_serialize_detection(item, "face_detection", width, height) for item in detections)
            return _module_result(
                "face_detection", "Face detection", self.config.face_model_path, "active", len(detections)
            )
        except Exception as exc:
            return _module_result(
                "face_detection", "Face detection", self.config.face_model_path, "unavailable", message=_module_error(exc)
            )

    def _run_anpr(
        self, frame: Any, width: int, height: int, output: list[dict[str, Any]]
    ) -> dict[str, Any]:
        if not self.config.anpr_enabled:
            return _module_result("anpr", "Indian ANPR", self.config.anpr_plate_model_path, "disabled")
        try:
            if self._anpr_service is None:
                self._anpr_service = self._anpr_factory(
                    str(self.config.anpr_vehicle_model_path),
                    str(self.config.anpr_plate_model_path),
                    vehicle_confidence=self.config.anpr_vehicle_confidence,
                    plate_confidence=self.config.anpr_plate_confidence,
                    image_size=self.config.anpr_image_size,
                )
            detections = self._anpr_service.process_frame(frame)
            output.extend(_serialize_detection(item, "anpr", width, height) for item in detections)
            return _module_result("anpr", "Indian ANPR", self.config.anpr_plate_model_path, "active", len(detections))
        except Exception as exc:
            return _module_result(
                "anpr", "Indian ANPR", self.config.anpr_plate_model_path, "unavailable", message=_module_error(exc)
            )


def _module_result(
    module_id: str,
    label: str,
    model_path: Path,
    status: str,
    detection_count: int = 0,
    message: str = "",
) -> dict[str, Any]:
    return {
        "id": module_id,
        "label": label,
        "model": model_path.name,
        "status": status,
        "detectionCount": detection_count,
        "message": message,
    }


def _serialize_detection(
    detection: InferenceDetection, source: str, width: int, height: int
) -> dict[str, Any]:
    return {
        "label": detection.label,
        "source": source,
        "confidence": round(float(detection.confidence), 4),
        "box": _normalized_box(detection.bounding_box, width, height),
        "trackId": detection.track_id,
        "attributes": detection.attributes,
    }


def _normalized_box(box: BoundingBox, width: int, height: int) -> dict[str, float]:
    left = max(0, min(width, box.left))
    top = max(0, min(height, box.top))
    right = max(left, min(width, box.right))
    bottom = max(top, min(height, box.bottom))
    return {
        "x": round(left / width * 100, 3),
        "y": round(top / height * 100, 3),
        "width": round((right - left) / width * 100, 3),
        "height": round((bottom - top) / height * 100, 3),
    }


def _module_error(exc: Exception) -> str:
    message = str(exc).strip()
    return message[:220] if message else "Module initialization failed."


def _device_name() -> str:
    try:
        import torch

        return "cuda" if torch.cuda.is_available() else "cpu"
    except Exception:
        return "cpu"


def _get_pipeline() -> LiveInferencePipeline:
    global _PIPELINE
    config = LiveInferenceConfig.from_env()
    with _PIPELINE_LOCK:
        if _PIPELINE is None or _PIPELINE.config != config:
            _PIPELINE = LiveInferencePipeline(config)
        return _PIPELINE


def detect_frame(frame_bytes: bytes) -> dict[str, Any]:
    """Run the enabled supplied modules on one browser-captured JPEG frame."""

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
    return _get_pipeline().process_frame(frame)
