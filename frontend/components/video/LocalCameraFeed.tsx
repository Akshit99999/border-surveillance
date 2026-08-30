"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { backendApi, FrameDetection, FrameInferenceModule } from "@/lib/api/client";

interface LocalCameraFeedProps {
  className?: string;
}

type CameraState = "idle" | "starting" | "live" | "error";
type InferenceState = "idle" | "analyzing" | "ready" | "error";

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));

const ANPR_INTERVAL_MS = 250;
const FACE_INTERVAL_MS = 120;

export const LocalCameraFeed: React.FC<LocalCameraFeedProps> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [detections, setDetections] = useState<FrameDetection[]>([]);
  const [inferenceState, setInferenceState] = useState<InferenceState>("idle");
  const [inferenceError, setInferenceError] = useState("");
  const [modelName, setModelName] = useState("");
  const [inferenceMs, setInferenceMs] = useState<number | null>(null);
  const [modules, setModules] = useState<FrameInferenceModule[]>([]);
  const detectionsBySourceRef = useRef<Record<string, FrameDetection[]>>({});
  const modulesByIdRef = useRef<Record<string, FrameInferenceModule>>({});

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const listDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const available = (await navigator.mediaDevices.enumerateDevices()).filter(
      (device) => device.kind === "videoinput"
    );
    setDevices(available);
    setSelectedDeviceId((current) => current || available[0]?.deviceId || "");
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("This browser does not expose a local camera.");
        setCameraState("error");
        return;
      }

      setCameraState("starting");
      setError("");
      stopStream();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraState("live");
        await listDevices();
      } catch (cameraError) {
        const errorName = cameraError instanceof DOMException ? cameraError.name : "";
        setError(
          errorName === "NotAllowedError"
            ? "Camera permission was denied. Allow access in the browser and try again."
            : errorName === "NotFoundError"
            ? "No camera device is available on this machine."
            : "The local camera could not be opened. Check that it is not in use by another app."
        );
        setCameraState("error");
      }
    },
    [listDevices, stopStream]
  );

  useEffect(() => {
    void listDevices();
    return stopStream;
  }, [listDevices, stopStream]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraState]);

  useEffect(() => {
    if (cameraState !== "live") {
      detectionsBySourceRef.current = {};
      modulesByIdRef.current = {};
      setDetections([]);
      setInferenceState("idle");
      setModules([]);
      setModelName("");
      setInferenceMs(null);
      return;
    }

    let cancelled = false;
    let personRequestRunning = false;
    let anprRequestRunning = false;
    let faceRequestRunning = false;
    let lastAnprStartedAt = 0;
    let lastFaceStartedAt = 0;
    let nextRun: number | null = null;

    const applyResult = (result: Awaited<ReturnType<typeof backendApi.analyzeFrame>>) => {
      for (const module of result.modules) {
        modulesByIdRef.current[module.id] = module;
        detectionsBySourceRef.current[module.id] = result.detections.filter(
          (detection) => detection.source === module.id
        );
      }
      setDetections(Object.values(detectionsBySourceRef.current).flat());
      setModules(Object.values(modulesByIdRef.current));
      setModelName("Person tracking + face detection + Indian ANPR");
      setInferenceMs(result.inferenceMs);
      setInferenceState("ready");
    };

    const analyzePlate = (frame: Blob) => {
      anprRequestRunning = true;
      void backendApi
        .analyzeFrame(frame, ["anpr"])
        .then((result) => {
          if (!cancelled) applyResult(result);
        })
        .catch((analysisError) => {
          if (!cancelled) {
            setInferenceError(analysisError instanceof Error ? analysisError.message : "Indian ANPR is unavailable.");
          }
        })
        .finally(() => {
          anprRequestRunning = false;
        });
    };

    const analyzeFaces = (frame: Blob) => {
      faceRequestRunning = true;
      void backendApi
        .analyzeFrame(frame, ["face_detection"])
        .then((result) => {
          if (!cancelled) applyResult(result);
        })
        .catch((analysisError) => {
          if (!cancelled) {
            setInferenceError(analysisError instanceof Error ? analysisError.message : "Face detection is unavailable.");
          }
        })
        .finally(() => {
          faceRequestRunning = false;
        });
    };

    const analyzeCurrentFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (cancelled) return;
      if (personRequestRunning || !video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
        nextRun = window.setTimeout(() => void analyzeCurrentFrame(), 50);
        return;
      }

      personRequestRunning = true;
      setInferenceState("analyzing");
      setInferenceError("");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        personRequestRunning = false;
        setInferenceState("error");
        setInferenceError("The browser could not prepare a frame for AI analysis.");
        return;
      }

      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = await canvasToBlob(canvas);
        if (!frame) throw new Error("Could not encode the source frame.");
        const now = performance.now();
        if (!anprRequestRunning && now - lastAnprStartedAt >= ANPR_INTERVAL_MS) {
          lastAnprStartedAt = now;
          analyzePlate(frame);
        }
        if (!faceRequestRunning && now - lastFaceStartedAt >= FACE_INTERVAL_MS) {
          lastFaceStartedAt = now;
          analyzeFaces(frame);
        }
        const result = await backendApi.analyzeFrame(frame, ["person_tracking"]);
        if (!cancelled) {
          applyResult(result);
        }
      } catch (analysisError) {
        if (!cancelled) {
          setInferenceState("error");
          setInferenceError(analysisError instanceof Error ? analysisError.message : "The AI endpoint is unavailable.");
        }
      } finally {
        personRequestRunning = false;
        if (!cancelled) {
          nextRun = window.setTimeout(() => void analyzeCurrentFrame(), 10);
        }
      }
    };

    void analyzeCurrentFrame();
    return () => {
      cancelled = true;
      if (nextRun !== null) window.clearTimeout(nextRun);
    };
  }, [cameraState]);

  return (
    <section
      className={cn(
        "relative bg-slate-950 border border-cyan-900/70 rounded-sm overflow-hidden flex flex-col font-mono",
        className
      )}
    >
      <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-3 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              cameraState === "live" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
            )}
          />
          <span className="font-bold tracking-wider text-cyan-300 truncate">LOCAL DEVICE CAMERA</span>
        </div>
        <span className={cn("text-[10px] font-bold", cameraState === "live" ? "text-emerald-400" : "text-slate-400")}>
          {cameraState === "live" ? "LIVE" : cameraState === "starting" ? "OPENING" : cameraState === "error" ? "UNAVAILABLE" : "READY"}
        </span>
      </div>

      <div className="relative aspect-video min-h-[220px] bg-black flex items-center justify-center overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover", cameraState !== "live" && "hidden")} />
        <canvas ref={canvasRef} className="hidden" />
        {cameraState === "live" && (
          <>
            {detections.map((detection, index) => (
              <div
                key={`${detection.source}-${detection.label}-${index}`}
                className={`absolute border-2 shadow-[0_0_12px_rgba(251,113,133,0.75)] pointer-events-none ${
                  detection.source === "face_detection"
                    ? "border-violet-400"
                    : detection.source === "anpr"
                    ? "border-amber-400"
                    : "border-rose-400"
                }`}
                style={{
                  left: `${detection.box.x}%`,
                  top: `${detection.box.y}%`,
                  width: `${detection.box.width}%`,
                  height: `${detection.box.height}%`,
                }}
              >
                <span className={`absolute -top-5 left-0 whitespace-nowrap text-white px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                  detection.source === "face_detection"
                    ? "bg-violet-500"
                    : detection.source === "anpr"
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}>
                  {detection.attributes?.plate_number
                    ? String(detection.attributes.plate_number)
                    : detection.label}
                  {detection.trackId ? ` #${detection.trackId}` : ""} {(detection.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
            <div className="absolute top-10 left-3 bg-slate-950/85 border border-cyan-500/60 rounded px-2 py-1 text-[10px] text-cyan-300 font-mono">
              AI {inferenceState === "analyzing" ? "ANALYZING" : inferenceState === "error" ? "UNAVAILABLE" : "ACTIVE"} · {detections.length} OBJECT{detections.length === 1 ? "" : "S"}
            </div>
          </>
        )}
        {cameraState !== "live" && (
          <div className="p-6 text-center max-w-md">
            {cameraState === "error" ? (
              <CameraOff className="w-10 h-10 mx-auto mb-3 text-rose-400" />
            ) : (
              <Camera className="w-10 h-10 mx-auto mb-3 text-cyan-400 opacity-70" />
            )}
            <p className="text-xs text-slate-300 uppercase tracking-wide">
              {cameraState === "starting" ? "Requesting local camera access" : cameraState === "error" ? error : "No local camera stream started"}
            </p>
            {cameraState !== "starting" && (
              <TacticalButton
                size="sm"
                className="mt-4"
                onClick={() => void startCamera(selectedDeviceId || undefined)}
                icon={cameraState === "error" ? <RefreshCw className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
              >
                {cameraState === "error" ? "TRY CAMERA AGAIN" : "ENABLE LOCAL CAMERA"}
              </TacticalButton>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2.5 font-mono">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
          <span className="text-cyan-300 font-bold">AI MODULE PIPELINE</span>
          <span>{modelName || "Waiting for frame analysis"}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {modules.length === 0 && (
            <div className="sm:col-span-3 border border-dashed border-slate-800 rounded-sm px-2 py-2 text-[10px] text-slate-500">
              Enable the local camera to start person tracking, face detection, and Indian ANPR.
            </div>
          )}
          {modules.map((module) => (
            <div key={module.id} className="border border-slate-800 rounded-sm bg-slate-900/70 px-2 py-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-200 truncate">{module.label}</span>
                <span className={`text-[9px] font-bold uppercase ${
                  module.status === "active" ? "text-emerald-400" : module.status === "unavailable" ? "text-rose-400" : "text-slate-500"
                }`}>{module.status}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1 text-[9px] text-slate-500">
                <span className="truncate">{module.model}</span>
                <span>{module.detectionCount} found</span>
              </div>
              {module.message && <p className="mt-1 text-[9px] text-rose-300 truncate" title={module.message}>{module.message}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          {cameraState === "live" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
          {cameraState !== "live"
            ? "PERMISSION REQUIRED FOR LOCAL PREVIEW"
            : inferenceState === "error"
            ? inferenceError
            : `AI ${inferenceState === "analyzing" ? "ANALYZING" : "ACTIVE"}${modelName ? ` · ${modelName}` : ""}${inferenceMs !== null ? ` · ${inferenceMs}ms` : ""}`}
        </span>
        {devices.length > 1 && (
          <select
            value={selectedDeviceId}
            onChange={(event) => {
              setSelectedDeviceId(event.target.value);
              void startCamera(event.target.value);
            }}
            className="max-w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] text-cyan-300"
            aria-label="Select local camera"
          >
            {devices.map((device, index) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${index + 1}`}
              </option>
            ))}
          </select>
        )}
      </div>
    </section>
  );
};
