"""Frame-level ANPR service suitable for a Django worker.

Model loading is lazy so Django web processes do not load GPU/CPU models until
an inference worker actually needs them. Model weights are runtime assets and
must be supplied through local, non-versioned paths.
"""

from __future__ import annotations

from typing import Any, Iterable, List, Optional, Tuple

from ..contracts import BoundingBox, InferenceDetection
from .plate_format import is_indian_plate, normalize_indian_plate


class AnprService:
    """Detect vehicles and Indian registration plates in an OpenCV BGR frame."""

    VEHICLE_CLASS_IDS = {2, 3, 5, 7}  # car, motorcycle, bus, truck in COCO

    def __init__(
        self,
        vehicle_model_path: str,
        plate_model_path: str,
        vehicle_confidence: float = 0.70,
        plate_confidence: float = 0.25,
        image_size: int = 736,
        use_gpu_for_ocr: bool = False,
    ) -> None:
        self.vehicle_model_path = vehicle_model_path
        self.plate_model_path = plate_model_path
        self.vehicle_confidence = vehicle_confidence
        self.plate_confidence = plate_confidence
        self.image_size = image_size
        self.use_gpu_for_ocr = use_gpu_for_ocr
        self._vehicle_model: Any = None
        self._plate_model: Any = None
        self._ocr_reader: Any = None

    def process_frame(self, frame: Any) -> List[InferenceDetection]:
        """Return recognized plates paired with their containing vehicle box."""

        self._ensure_loaded()
        vehicles = list(self._vehicle_boxes(frame))
        detections: List[InferenceDetection] = []

        plate_result = self._plate_model(
            frame, conf=self.plate_confidence, imgsz=self.image_size, verbose=False
        )[0]
        for x1, y1, x2, y2, confidence, _class_id in plate_result.boxes.data.tolist():
            plate_box = BoundingBox(int(x1), int(y1), int(x2), int(y2))
            vehicle_box = self._containing_vehicle(plate_box, vehicles)
            if vehicle_box is None:
                continue

            plate_text, ocr_confidence = self._read_plate(frame, plate_box)
            if plate_text is None:
                continue

            detections.append(
                InferenceDetection(
                    label="license_plate",
                    confidence=min(float(confidence), ocr_confidence),
                    bounding_box=plate_box,
                    attributes={
                        "plate_number": plate_text,
                        "ocr_confidence": ocr_confidence,
                        "vehicle_bbox": vehicle_box.as_xyxy(),
                    },
                )
            )
        return detections

    def _ensure_loaded(self) -> None:
        if self._vehicle_model is not None:
            return

        import easyocr
        from ultralytics import YOLO

        self._vehicle_model = YOLO(self.vehicle_model_path)
        self._plate_model = YOLO(self.plate_model_path)
        self._ocr_reader = easyocr.Reader(["en"], gpu=self.use_gpu_for_ocr)

    def _vehicle_boxes(self, frame: Any) -> Iterable[BoundingBox]:
        result = self._vehicle_model(
            frame, conf=self.vehicle_confidence, imgsz=self.image_size, verbose=False
        )[0]
        for x1, y1, x2, y2, _confidence, class_id in result.boxes.data.tolist():
            if int(class_id) in self.VEHICLE_CLASS_IDS:
                yield BoundingBox(int(x1), int(y1), int(x2), int(y2))

    @staticmethod
    def _containing_vehicle(
        plate_box: BoundingBox, vehicles: Iterable[BoundingBox]
    ) -> Optional[BoundingBox]:
        for vehicle in vehicles:
            if (
                vehicle.left <= plate_box.left
                and vehicle.top <= plate_box.top
                and vehicle.right >= plate_box.right
                and vehicle.bottom >= plate_box.bottom
            ):
                return vehicle
        return None

    def _read_plate(
        self, frame: Any, plate_box: BoundingBox
    ) -> Tuple[Optional[str], float]:
        crop = frame[plate_box.top : plate_box.bottom, plate_box.left : plate_box.right]
        if crop is None or crop.size == 0:
            return None, 0.0

        best_text: Optional[str] = None
        best_confidence = 0.0
        for _bbox, raw_text, confidence in self._ocr_reader.readtext(crop):
            text = normalize_indian_plate(raw_text)
            if is_indian_plate(text) and float(confidence) > best_confidence:
                best_text = text
                best_confidence = float(confidence)
        return best_text, best_confidence
