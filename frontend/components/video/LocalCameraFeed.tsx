"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  CheckCircle2,
  FileVideo,
  Link2,
  RefreshCw,
  ShieldAlert,
  Upload,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { backendApi, FrameDetection, FrameInferenceModule } from "@/lib/api/client";

interface LocalCameraFeedProps {
  className?: string;
}

type CameraState = "idle" | "starting" | "live" | "error";
type InferenceState = "idle" | "analyzing" | "ready" | "error";
type SourceMode = "camera" | "file" | "network";

const INFERENCE_MODULES = ["person_tracking", "face_detection", "anpr"];

const canvasToBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));

const sourceButtonClass = (active: boolean) =>
  cn(
    "inline-flex items-center justify-center gap-1.5 rounded-sm border px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors",
    active
      ? "border-cyan-500 bg-cyan-950 text-cyan-300"
      : "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500 hover:text-slate-200"
  );

export const LocalCameraFeed: React.FC<LocalCameraFeedProps> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [sourceMode, setSourceMode] = useState<SourceMode>("camera");
  const [activeSourceUrl, setActiveSourceUrl] = useState("");
  const [networkUrl, setNetworkUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [sourceLabel, setSourceLabel] = useState("LOCAL DEVICE CAMERA");
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

  const resetAnalysis = useCallback(() => {
    setDetections([]);
    setInferenceState("idle");
    setInferenceError("");
    setModules([]);
    setModelName("");
    setInferenceMs(null);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const clearVideoSource = useCallback(() => {
    stopStream();
    releaseObjectUrl();
    setActiveSourceUrl("");
    setFileName("");
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    resetAnalysis();
  }, [releaseObjectUrl, resetAnalysis, stopStream]);

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

      setSourceMode("camera");
      setSourceLabel("LOCAL DEVICE CAMERA");
      setCameraState("starting");
      setError("");
      clearVideoSource();

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
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
    [clearVideoSource, listDevices]
  );

  const chooseSourceMode = useCallback(
    (mode: SourceMode) => {
      if (mode === sourceMode) return;
      clearVideoSource();
      setSourceMode(mode);
      setSourceLabel(mode === "file" ? "VIDEO FILE" : "NETWORK CCTV");
      setCameraState("idle");
      setError("");
    },
    [clearVideoSource, sourceMode]
  );

  const loadVideoFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      clearVideoSource();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setSourceMode("file");
      setSourceLabel(file.name.toUpperCase());
      setFileName(file.name);
      setActiveSourceUrl(objectUrl);
      setCameraState("starting");
      setError("");
    },
    [clearVideoSource]
  );

  const connectNetwork = useCallback(() => {
    const enteredUrl = networkUrl.trim();
    if (!enteredUrl) {
      setError("Enter an HTTP(S) camera URL or stream address first.");
      setCameraState("error");
      return;
    }
    if (/^rtsps?:\/\//i.test(enteredUrl)) {
      setError("RTSP cannot play directly in a browser. Provide an HLS, WebRTC, or HTTP(S) relay URL instead.");
      setCameraState("error");
      return;
    }

    const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(enteredUrl)
      ? enteredUrl
      : `http://${enteredUrl}`;
    try {
      const parsed = new URL(normalizedUrl);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported protocol");
      clearVideoSource();
      setSourceMode("network");
      setSourceLabel(`CCTV ${parsed.hostname}`.toUpperCase());
      setActiveSourceUrl(parsed.toString());
      setCameraState("starting");
      setError("");
    } catch {
      setError("Enter a valid HTTP(S) camera URL, for example http://192.168.1.50:8080/video.");
      setCameraState("error");
    }
  }, [clearVideoSource, networkUrl]);

  useEffect(() => {
    void listDevices();
    return () => {
      stopStream();
      releaseObjectUrl();
    };
  }, [listDevices, releaseObjectUrl, stopStream]);

  useEffect(() => {
    if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
  }, [cameraState]);

  useEffect(() => {
    if (cameraState !== "live") {
      resetAnalysis();
      return;
    }

    let cancelled = false;
    let requestRunning = false;
    let nextRun: number | null = null;

    const applyResult = (result: Awaited<ReturnType<typeof backendApi.analyzeFrame>>) => {
      setDetections(result.detections);
      setModules(result.modules);
      setModelName(`${result.model} · ${result.device.toUpperCase()}`);
      setInferenceMs(result.inferenceMs);
      setInferenceState("ready");
    };

    const analyzeCurrentFrame = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (cancelled) return;
      if (
        requestRunning ||
        !video ||
        !canvas ||
        video.readyState < 2 ||
        video.videoWidth === 0 ||
        (sourceMode !== "camera" && video.paused)
      ) {
        nextRun = window.setTimeout(() => void analyzeCurrentFrame(), 150);
        return;
      }

      requestRunning = true;
      setInferenceState("analyzing");
      setInferenceError("");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        requestRunning = false;
        setInferenceState("error");
        setInferenceError("The browser could not prepare a frame for AI analysis.");
        return;
      }

      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = await canvasToBlob(canvas);
        if (!frame) throw new Error("Could not encode the source frame.");
        const result = await backendApi.analyzeFrame(frame, INFERENCE_MODULES);
        if (!cancelled) applyResult(result);
      } catch (analysisError) {
        if (!cancelled) {
          setInferenceState("error");
          setInferenceError(
            analysisError instanceof Error
              ? analysisError.message
              : "The AI endpoint is unavailable."
          );
        }
      } finally {
        requestRunning = false;
        if (!cancelled) nextRun = window.setTimeout(() => void analyzeCurrentFrame(), 80);
      }
    };

    void analyzeCurrentFrame();
    return () => {
      cancelled = true;
      if (nextRun !== null) window.clearTimeout(nextRun);
    };
  }, [cameraState, resetAnalysis, sourceMode]);

  const handleVideoReady = () => {
    if (sourceMode === "camera") return;
    setError("");
    setCameraState("live");
    void videoRef.current?.play().catch(() => undefined);
  };

  const handleVideoError = () => {
    setCameraState("error");
    setError(
      sourceMode === "network"
        ? "The CCTV URL could not be played. Check the URL, camera access, and CORS; browser playback requires a compatible HTTP(S) stream."
        : "The selected video could not be decoded by this browser. Try MP4/H.264 or WebM."
    );
  };

  const isLive = cameraState === "live";

  return (
    <section
      className={cn(
        "relative bg-slate-950 border border-cyan-900/70 rounded-sm overflow-hidden flex flex-col font-mono",
        className
      )}
    >
      <div className="absolute top-0 inset-x-0 z-10 bg-gradient-to-b from-black/90 to-transparent p-3 flex items-center justify-between text-[11px] pointer-events-none">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("w-2 h-2 rounded-full shrink-0", isLive ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
          <span className="font-bold tracking-wider text-cyan-300 truncate">{sourceLabel}</span>
        </div>
        <span className={cn("text-[10px] font-bold", isLive ? "text-emerald-400" : "text-slate-400")}>
          {isLive ? "LIVE" : cameraState === "starting" ? "OPENING" : cameraState === "error" ? "UNAVAILABLE" : "READY"}
        </span>
      </div>

      <div className="border-b border-slate-800 bg-slate-950/95 px-3 pt-3 pb-2.5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider mr-1">VIDEO SOURCE</span>
          <button type="button" className={sourceButtonClass(sourceMode === "camera")} onClick={() => chooseSourceMode("camera")}>
            <Camera className="w-3.5 h-3.5" /> DEVICE CAMERA
          </button>
          <button type="button" className={sourceButtonClass(sourceMode === "file")} onClick={() => chooseSourceMode("file")}>
            <FileVideo className="w-3.5 h-3.5" /> VIDEO FILE
          </button>
          <button type="button" className={sourceButtonClass(sourceMode === "network")} onClick={() => chooseSourceMode("network")}>
            <Wifi className="w-3.5 h-3.5" /> CCTV / IP URL
          </button>
        </div>

        {sourceMode === "camera" && (
          <div className="flex flex-wrap items-center gap-2">
            {devices.length > 0 && (
              <select
                value={selectedDeviceId}
                onChange={(event) => setSelectedDeviceId(event.target.value)}
                className="min-w-0 flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-cyan-300"
                aria-label="Select local camera"
              >
                {devices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            )}
            <TacticalButton
              size="sm"
              onClick={() => void startCamera(selectedDeviceId || undefined)}
              icon={cameraState === "error" ? <RefreshCw className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
            >
              {cameraState === "live" ? "RESTART CAMERA" : "ENABLE CAMERA"}
            </TacticalButton>
          </div>
        )}

        {sourceMode === "file" && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-sm border border-cyan-500/60 bg-cyan-950/60 px-2.5 py-1.5 text-[10px] font-bold text-cyan-300 uppercase">
              <Upload className="w-3.5 h-3.5" /> CHOOSE VIDEO
              <input
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(event) => loadVideoFile(event.target.files?.[0])}
              />
            </label>
            <span className="text-[10px] text-slate-400 truncate max-w-full">
              {fileName || "MP4/H.264, WebM, and other browser-supported files"}
            </span>
          </div>
        )}

        {sourceMode === "network" && (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Link2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <input
                value={networkUrl}
                onChange={(event) => setNetworkUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") connectNetwork();
                }}
                placeholder="http://192.168.1.50:8080/video"
                className="w-full min-w-0 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-[10px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                aria-label="CCTV network stream URL"
              />
            </div>
            <TacticalButton size="sm" onClick={connectNetwork} icon={<Wifi className="w-3.5 h-3.5" />}>
              CONNECT STREAM
            </TacticalButton>
          </div>
        )}

        <p className="text-[9px] leading-relaxed text-slate-500">
          {sourceMode === "network"
            ? "Use a browser-playable HTTP(S) video/HLS endpoint. RTSP camera addresses need an HLS/WebRTC relay such as MediaMTX or go2rtc before they can be displayed here."
            : "Frames are sent to Django for person tracking, face detection, and Indian ANPR. No video is saved by this preview."}
        </p>
      </div>

      <div className="relative aspect-video min-h-[220px] bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          src={activeSourceUrl || undefined}
          autoPlay
          muted
          playsInline
          controls={sourceMode !== "camera"}
          crossOrigin={sourceMode === "network" ? "anonymous" : undefined}
          onLoadedMetadata={handleVideoReady}
          onCanPlay={handleVideoReady}
          onError={handleVideoError}
          onEnded={() => {
            if (sourceMode === "file") {
              setCameraState("idle");
              setError("Video finished. Choose the file again to replay it.");
            }
          }}
          className={cn("w-full h-full object-contain", !isLive && "hidden")}
        />
        <canvas ref={canvasRef} className="hidden" />
        {isLive && (
          <>
            {detections.map((detection, index) => (
              <div
                key={`${detection.source}-${detection.label}-${index}`}
                className={cn(
                  "absolute border-2 shadow-[0_0_12px_rgba(251,113,133,0.75)] pointer-events-none",
                  detection.source === "face_detection"
                    ? "border-violet-400"
                    : detection.source === "anpr"
                    ? "border-amber-400"
                    : "border-rose-400"
                )}
                style={{
                  left: `${detection.box.x}%`,
                  top: `${detection.box.y}%`,
                  width: `${detection.box.width}%`,
                  height: `${detection.box.height}%`,
                }}
              >
                <span
                  className={cn(
                    "absolute -top-5 left-0 whitespace-nowrap text-white px-1.5 py-0.5 text-[10px] font-bold uppercase",
                    detection.source === "face_detection"
                      ? "bg-violet-500"
                      : detection.source === "anpr"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  )}
                >
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
        {!isLive && (
          <div className="p-6 text-center max-w-md">
            {cameraState === "error" ? (
              <CameraOff className="w-10 h-10 mx-auto mb-3 text-rose-400" />
            ) : (
              <Camera className="w-10 h-10 mx-auto mb-3 text-cyan-400 opacity-70" />
            )}
            <p className="text-xs text-slate-300 uppercase tracking-wide">
              {cameraState === "starting"
                ? "Opening video source"
                : cameraState === "error"
                ? error
                : sourceMode === "file"
                ? "Choose a video file to start analysis"
                : sourceMode === "network"
                ? "Enter a CCTV / IP stream URL above"
                : "No local camera stream started"}
            </p>
            {cameraState === "error" && sourceMode === "camera" && (
              <TacticalButton size="sm" className="mt-4" onClick={() => void startCamera(selectedDeviceId || undefined)} icon={<RefreshCw className="w-3.5 h-3.5" />}>
                TRY CAMERA AGAIN
              </TacticalButton>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2.5 font-mono">
        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
          <span className="text-cyan-300 font-bold">AI MODULE PIPELINE</span>
          <span className="truncate">{modelName || "Waiting for frame analysis"}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {modules.length === 0 && (
            <div className="sm:col-span-3 border border-dashed border-slate-800 rounded-sm px-2 py-2 text-[10px] text-slate-500">
              Start a camera, choose a video file, or connect a browser-compatible CCTV URL to run all AI modules.
            </div>
          )}
          {modules.map((module) => (
            <div key={module.id} className="border border-slate-800 rounded-sm bg-slate-900/70 px-2 py-1.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-200 truncate">{module.label}</span>
                <span className={cn(
                  "text-[9px] font-bold uppercase",
                  module.status === "active" ? "text-emerald-400" : module.status === "unavailable" ? "text-rose-400" : "text-slate-500"
                )}>{module.status}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1 text-[9px] text-slate-500">
                <span className="truncate">{module.model}</span>
                <span>{module.detectionCount} found</span>
              </div>
              {module.message && <p className="mt-1 text-[9px] text-amber-300 truncate" title={module.message}>{module.message}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5 min-w-0">
          {isLive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
          <span className="truncate">
            {!isLive
              ? sourceMode === "network"
                ? "WAITING FOR CCTV STREAM"
                : sourceMode === "file"
                ? "WAITING FOR VIDEO FILE"
                : "PERMISSION REQUIRED FOR LOCAL PREVIEW"
              : inferenceState === "error"
              ? inferenceError
              : `AI ${inferenceState === "analyzing" ? "ANALYZING" : "ACTIVE"}${modelName ? ` · ${modelName}` : ""}${inferenceMs !== null ? ` · ${inferenceMs}ms` : ""}`}
          </span>
        </span>
      </div>
    </section>
  );
};
