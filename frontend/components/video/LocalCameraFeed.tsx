"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { TacticalButton } from "@/components/shared/TacticalButton";

interface LocalCameraFeedProps {
  className?: string;
}

type CameraState = "idle" | "starting" | "live" | "error";

export const LocalCameraFeed: React.FC<LocalCameraFeedProps> = ({ className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [error, setError] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
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

      <div className="border-t border-slate-800 bg-slate-950/95 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          {cameraState === "live" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
          {cameraState === "live" ? "VIDEO STAYS IN THIS BROWSER" : "PERMISSION REQUIRED FOR LOCAL PREVIEW"}
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
