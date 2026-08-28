"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Eye,
  Flame,
  Maximize2,
  Minimize2,
  Moon,
  Radio,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { Camera } from "@/lib/types";
import { cn, formatTimeIST } from "@/lib/utils";
import { PTZControls } from "./PTZControls";
import { tacticalSound } from "@/lib/sound";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

interface CameraVideoFeedProps {
  camera: Camera;
  mode?: "optical" | "thermal" | "night_vision";
  showBoundingBoxes?: boolean;
  showPTZ?: boolean;
  interactive?: boolean;
  onFlagIncident?: (camera: Camera) => void;
  className?: string;
}

export const CameraVideoFeed: React.FC<CameraVideoFeedProps> = ({
  camera,
  mode: initialMode,
  showPTZ: initialShowPTZ = false,
  onFlagIncident,
  className,
}) => {
  const { addAlert, updateCameraDetection } = useIBVAPStore();
  const [viewMode, setViewMode] = useState<"optical" | "thermal" | "night_vision">(
    initialMode || (camera.type === "thermal" ? "thermal" : "optical")
  );
  const [showPTZ, setShowPTZ] = useState(initialShowPTZ);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timecode, setTimecode] = useState("");

  useEffect(() => {
    setTimecode(formatTimeIST());
    const interval = window.setInterval(() => setTimecode(formatTimeIST()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleManualAlert = () => {
    tacticalSound.playAlert();
    addAlert({
      level: "critical",
      sourceCameraId: camera.id,
      sourceCameraName: camera.name,
      eventType: "Manual Operator Incident Flag",
      confidence: 0,
      coordinates: camera.coordinates,
      objectClass: "Unknown",
      evidenceUrl: "",
      sector: camera.sector,
      notes: `Operator flagged an incident from ${camera.name}. Evidence capture is not attached yet.`,
    });
    onFlagIncident?.(camera);
  };

  const isSignalLost = camera.status === "signal_lost";
  const streamConfigured = Boolean(camera.rtspUrl);

  return (
    <div
      className={cn(
        "relative bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex flex-col select-none",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-2.5 z-20 flex items-center justify-between text-[11px] font-mono text-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn("w-2 h-2 rounded-full shrink-0", isSignalLost ? "bg-rose-500" : "bg-slate-500")} />
          <span className="font-bold tracking-wider text-cyan-300 truncate max-w-[180px] sm:max-w-xs">{camera.id}</span>
          <span className="hidden sm:inline text-slate-400">[{camera.sector}]</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-slate-900/90 border border-slate-700 text-[10px] text-cyan-400 uppercase rounded">
            {viewMode.replace("_", " ")}
          </span>
          {camera.fps > 0 && <span className="font-semibold text-slate-400 text-[10px] hidden sm:inline">{camera.fps} FPS</span>}
          <span className="text-slate-300 font-semibold">{timecode}</span>
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
        <div className="relative z-10 max-w-sm p-6 text-center font-mono">
          {isSignalLost ? (
            <WifiOff className="w-10 h-10 mx-auto mb-3 text-rose-400" />
          ) : (
            <Radio className="w-10 h-10 mx-auto mb-3 text-cyan-400 opacity-70" />
          )}
          <h4 className={cn("text-sm font-bold uppercase tracking-widest", isSignalLost ? "text-rose-400" : "text-slate-300")}>
            {isSignalLost ? "SIGNAL LOST" : "STREAM NOT CONNECTED"}
          </h4>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {isSignalLost
              ? "The configured CCTV source is currently unavailable."
              : streamConfigured
              ? "An RTSP source is registered. A WebRTC/HLS relay is required before a browser can display it."
              : "No stream URL is configured for this camera."}
          </p>
          {streamConfigured && <p className="text-[10px] text-slate-500 mt-3 break-all">Source: {camera.rtspUrl}</p>}
          {isSignalLost && (
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] text-rose-300 bg-rose-950/60 px-3 py-1 border border-rose-800 rounded">
              <RefreshCw className="w-3 h-3 text-rose-400" />
              <span>WAITING FOR SOURCE RECOVERY</span>
            </div>
          )}
          {!isSignalLost && <p className="text-[10px] text-amber-300 mt-4">AI overlays are hidden until a real video stream is available.</p>}
        </div>

        {showPTZ && !isSignalLost && (
          <div className="absolute bottom-3 right-3 z-30 max-w-xs">
            <PTZControls
              cameraId={camera.id}
              cameraName={camera.name}
              onMove={(pan, tilt) => updateCameraDetection(camera.id, { pan, tilt })}
              onZoom={(zoom) => updateCameraDetection(camera.id, { zoom })}
            />
          </div>
        )}
      </div>

      <div className="bg-slate-950/95 border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 z-20 shrink-0 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("optical"); }}
            title="Optical mode"
            className={cn("p-1.5 rounded border text-[10px] flex items-center gap-1", viewMode === "optical" ? "bg-cyan-950 text-cyan-300 border-cyan-500" : "bg-slate-900 text-slate-400 border-slate-700")}
          >
            <Eye className="w-3 h-3" /><span className="hidden sm:inline">OPT</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("thermal"); }}
            title="Thermal mode"
            className={cn("p-1.5 rounded border text-[10px] flex items-center gap-1", viewMode === "thermal" ? "bg-rose-950 text-rose-300 border-rose-500" : "bg-slate-900 text-slate-400 border-slate-700")}
          >
            <Flame className="w-3 h-3" /><span className="hidden sm:inline">THERM</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("night_vision"); }}
            title="Night vision mode"
            className={cn("p-1.5 rounded border text-[10px] flex items-center gap-1", viewMode === "night_vision" ? "bg-emerald-950 text-emerald-300 border-emerald-500" : "bg-slate-900 text-slate-400 border-slate-700")}
          >
            <Moon className="w-3 h-3" /><span className="hidden sm:inline">NV</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {camera.type === "ptz" && !isSignalLost && (
            <button
              onClick={() => { tacticalSound.playClick(); setShowPTZ(!showPTZ); }}
              className={cn("p-1.5 rounded border text-[10px] flex items-center gap-1", showPTZ ? "bg-cyan-950 text-cyan-300 border-cyan-500" : "bg-slate-900 text-slate-400 border-slate-700")}
            >
              <span>PTZ</span>
            </button>
          )}
          <button
            onClick={handleManualAlert}
            title="Flag an operator incident without attaching fabricated evidence"
            className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600 rounded text-[10px] flex items-center gap-1 font-bold"
          >
            <AlertTriangle className="w-3 h-3" /><span>FLAG INCIDENT</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setIsFullscreen(!isFullscreen); }}
            title="Toggle fullscreen"
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded border border-slate-800"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
