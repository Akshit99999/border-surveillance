"""Django endpoints for a local, non-persistent AI camera debug view.

The runner intentionally stops at inference. It does not create incidents,
write evidence files, call Pinata, write Firestore, or submit blockchain
transactions. This makes it safe to use while debugging camera/model output.
"""

from __future__ import annotations

import contextlib
import io
import json
import os
import threading
import time
from pathlib import Path
from typing import Any, Dict, Iterable, Optional

from django.http import FileResponse, HttpRequest, JsonResponse, StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt

from app.services.inference.anpr.service import AnprService
from app.services.inference.contracts import InferenceDetection
from app.services.inference.face.service import FaceDetectionService
from app.services.inference.person.service import PersonTrackingService


REPO_ROOT = Path(__file__).resolve().parents[3]
FRONTEND_FILE = REPO_ROOT / "frontend" / "index.html"


def _model_paths() -> Dict[str, Path]:
    configured_dir = os.getenv("BORDER_MODEL_DIR")
    model_dir = Path(configured_dir) if configured_dir else REPO_ROOT / "backend" / ".localdata" / "models"
    return {
        "person": Path(os.getenv("BORDER_PERSON_MODEL", model_dir / "yolov8n.pt")),
        "face": Path(os.getenv("BORDER_FACE_MODEL", model_dir / "yolov8n-face-keypoints.pt")),
        "plate": Path(os.getenv("BORDER_PLATE_MODEL", model_dir / "INPD_more_accuracy_n.pt")),
    }


def _detection_payload(detection: InferenceDetection) -> Dict[str, Any]:
    return {
        "label": detection.label,
        "confidence": round(float(detection.confidence), 3),
        "track_id": detection.track_id,
        "box": list(detection.bounding_box.as_xyxy()),
        "attributes": detection.attributes,
    }


class CameraRunner:
    """Own one camera and one set of lazy-loaded inference services."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._latest_jpeg: Optional[bytes] = None
        self._state: Dict[str, Any] = self._initial_state()

    @staticmethod
    def _initial_state() -> Dict[str, Any]:
        return {
            "running": False,
            "camera_index": None,
            "frames": 0,
            "read_failures": 0,
            "fps": 0.0,
            "started_at": None,
            "last_frame_at": None,
            "last_detections": [],
            "last_error": None,
            "models_loaded": {"person": False, "face": False, "anpr": False},
            "anpr_enabled": True,
        }

    def model_status(self) -> Dict[str, Dict[str, Any]]:
        return {
            name: {"path": str(path), "available": path.exists()}
            for name, path in _model_paths().items()
        }

    def start(self, camera_index: int = 0, enable_anpr: bool = True) -> Dict[str, Any]:
        with self._lock:
            if self._thread and self._thread.is_alive():
                return self.snapshot()
            self._stop_event = threading.Event()
            self._latest_jpeg = None
            self._state = self._initial_state()
            self._state.update(
                {
                    "running": True,
                    "camera_index": camera_index,
                    "started_at": time.time(),
                    "anpr_enabled": enable_anpr,
                }
            )
            self._thread = threading.Thread(
                target=self._run,
                args=(camera_index, enable_anpr),
                daemon=True,
                name="border-surveillance-camera",
            )
            self._thread.start()
            return self.snapshot()

    def stop(self) -> Dict[str, Any]:
        self._stop_event.set()
        thread = self._thread
        if thread and thread is not threading.current_thread():
            thread.join(timeout=2.0)
        with self._lock:
            self._state["running"] = False
        return self.snapshot()

    def snapshot(self) -> Dict[str, Any]:
        with self._lock:
            state = dict(self._state)
            state["models_loaded"] = dict(self._state["models_loaded"])
            state["last_detections"] = list(self._state["last_detections"])
        state.update(
            {
                "logging_disabled": True,
                "cloud_integrations_disabled": True,
                "evidence_persistence_disabled": True,
            }
        )
        return state

    def latest_frame(self) -> Optional[bytes]:
        with self._lock:
            return self._latest_jpeg

    def _run(self, camera_index: int, enable_anpr: bool) -> None:
        capture = None
        try:
            import cv2

            paths = _model_paths()
            missing = [str(path) for path in paths.values() if not path.exists()]
            if missing:
                raise RuntimeError("missing model weights: " + ", ".join(missing))

            capture = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
            if not capture.isOpened():
                capture.release()
                capture = cv2.VideoCapture(camera_index)
            if not capture.isOpened():
                raise RuntimeError(f"camera index {camera_index} could not be opened")

            person_service = PersonTrackingService(str(paths["person"]), confidence=0.35, n_init=1)
            face_service = FaceDetectionService(str(paths["face"]), confidence=0.35)
            anpr_service = (
                AnprService(
                    str(paths["person"]),
                    str(paths["plate"]),
                    vehicle_confidence=0.35,
                    plate_confidence=0.25,
                    image_size=640,
                )
                if enable_anpr
                else None
            )
            anpr_every = max(1, int(os.getenv("BORDER_ANPR_EVERY_N_FRAMES", "3")))
            last_plate_detections: list[InferenceDetection] = []
            started = time.perf_counter()

            while not self._stop_event.is_set():
                ok, frame = capture.read()
                if not ok:
                    with self._lock:
                        self._state["read_failures"] += 1
                    time.sleep(0.05)
                    continue

                # Model libraries are noisy on stdout/stderr during lazy load;
                # suppress that output in this intentionally quiet debug mode.
                with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
                    person_detections = person_service.process_frame(frame)
                    face_detections = face_service.process_frame(frame)
                    if anpr_service and self._state["frames"] % anpr_every == 0:
                        last_plate_detections = anpr_service.process_frame(frame)

                detections = person_detections + face_detections + last_plate_detections
                annotated = self._annotate(cv2, frame, detections)
                encoded_ok, encoded = cv2.imencode(
                    ".jpg", annotated, [int(cv2.IMWRITE_JPEG_QUALITY), 80]
                )
                if encoded_ok:
                    with self._lock:
                        self._latest_jpeg = encoded.tobytes()

                now = time.time()
                with self._lock:
                    self._state["frames"] += 1
                    elapsed = time.perf_counter() - started
                    self._state["fps"] = self._state["frames"] / elapsed if elapsed else 0.0
                    self._state["last_frame_at"] = now
                    self._state["last_detections"] = [_detection_payload(item) for item in detections]
                    self._state["models_loaded"] = {
                        "person": person_service._model is not None,
                        "face": face_service._model is not None,
                        "anpr": bool(anpr_service and anpr_service._plate_model is not None),
                    }
        except Exception as exc:  # surfaced in the UI for local debugging
            with self._lock:
                self._state["last_error"] = f"{type(exc).__name__}: {exc}"
        finally:
            if capture is not None:
                capture.release()
            with self._lock:
                self._state["running"] = False

    @staticmethod
    def _annotate(cv2: Any, frame: Any, detections: Iterable[InferenceDetection]) -> Any:
        colors = {
            "person": (66, 214, 163),
            "face": (56, 189, 248),
            "license_plate": (232, 121, 249),
        }
        for detection in detections:
            box = detection.bounding_box
            color = colors.get(detection.label, (255, 255, 255))
            cv2.rectangle(frame, (box.left, box.top), (box.right, box.bottom), color, 2)
            label = detection.label.replace("_", " ")
            if detection.track_id:
                label += f" #{detection.track_id}"
            if detection.attributes.get("plate_number"):
                label += f" {detection.attributes['plate_number']}"
            label += f" {detection.confidence:.0%}"
            text_y = max(18, box.top - 7)
            cv2.putText(
                frame,
                label,
                (box.left, text_y),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.52,
                color,
                2,
                cv2.LINE_AA,
            )
        return frame


runner = CameraRunner()


def index(_request: HttpRequest) -> FileResponse:
    return FileResponse(FRONTEND_FILE.open("rb"), content_type="text/html")


def _frontend_asset(filename: str, content_type: str) -> FileResponse:
    asset = FRONTEND_FILE.parent / filename
    if not asset.is_file() or asset.parent != FRONTEND_FILE.parent:
        raise FileNotFoundError(filename)
    return FileResponse(asset.open("rb"), content_type=content_type)


def stylesheet(_request: HttpRequest) -> FileResponse:
    return _frontend_asset("debug-ui.css", "text/css")


def script(_request: HttpRequest) -> FileResponse:
    return _frontend_asset("debug-ui.js", "text/javascript")


def health(_request: HttpRequest) -> JsonResponse:
    return JsonResponse(
        {
            "ok": True,
            "mode": "local-ai-debug",
            "logging_disabled": True,
            "cloud_integrations_disabled": True,
            "models": runner.model_status(),
        }
    )


def status(_request: HttpRequest) -> JsonResponse:
    return JsonResponse(runner.snapshot())


@csrf_exempt
def start_camera(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    try:
        body = json.loads(request.body or b"{}")
        camera_index = int(body.get("camera_index", 0))
        enable_anpr = bool(body.get("enable_anpr", True))
    except (TypeError, ValueError, json.JSONDecodeError) as exc:
        return JsonResponse({"error": f"invalid request: {exc}"}, status=400)
    if camera_index < 0 or camera_index > 9:
        return JsonResponse({"error": "camera_index must be between 0 and 9"}, status=400)
    return JsonResponse(runner.start(camera_index, enable_anpr))


@csrf_exempt
def stop_camera(request: HttpRequest) -> JsonResponse:
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=405)
    return JsonResponse(runner.stop())


def video_stream(_request: HttpRequest) -> StreamingHttpResponse:
    def frames() -> Iterable[bytes]:
        while True:
            frame = runner.latest_frame()
            if frame:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            if not runner.snapshot()["running"]:
                break
            time.sleep(0.12)

    response = StreamingHttpResponse(
        frames(), content_type="multipart/x-mixed-replace; boundary=frame"
    )
    response["Cache-Control"] = "no-store"
    return response
