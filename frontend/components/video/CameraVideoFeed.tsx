"use client";

import React, { useEffect, useState } from "react";
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
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTimecode(formatTimeIST());
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + " UTC");
    };
    update();
    const interval = window.setInterval(update, 1000);
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
        "relative bg-[#131313] border border-[#454843] rounded-none overflow-hidden flex flex-col select-none font-mono",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Top HUD Overlay */}
      <div className="absolute top-0 inset-x-0 bg-[#131313]/90 border-b border-[#454843]/60 p-2.5 z-20 flex items-center justify-between text-[11px] font-mono text-[#F5F5F0]">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-2 h-2 rounded-full shrink-0", isSignalLost ? "bg-[#ffb4ab]" : "bg-[#F5F5F0] animate-pulse")} />
          <span className="font-bold tracking-widest text-[#F5F5F0] truncate max-w-[180px] sm:max-w-xs uppercase">
            {camera.id} // {camera.sector}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-[#1c1b1b] border border-[#454843] text-[10px] text-[#c5c7c1] uppercase rounded-none">
            {viewMode.replace("_", " ")}
          </span>
          {camera.fps > 0 && <span className="font-semibold text-[#8f918c] text-[10px] hidden sm:inline">{camera.fps} FPS</span>}
          <span className="text-[#F5F5F0] font-bold">{utcTime || timecode}</span>
        </div>
      </div>

      {/* Video Content Canvas */}
      <div className="relative flex-1 min-h-[220px] bg-[#0e0e0e] flex items-center justify-center overflow-hidden">
        {/* Decorative Target Reticle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-[#454843]/40 pointer-events-none flex items-center justify-center">
          <div className="w-1 h-3 bg-[#454843] absolute top-0" />
          <div className="w-1 h-3 bg-[#454843] absolute bottom-0" />
          <div className="w-3 h-1 bg-[#454843] absolute left-0" />
          <div className="w-3 h-1 bg-[#454843] absolute right-0" />
          <div className="w-1 h-1 bg-[#F5F5F0]/60" />
        </div>

        {/* GPS Coordinate Watermark Overlay */}
        <div className="absolute bottom-3 left-3 z-10 text-[10px] text-[#8f918c] pointer-events-none">
          <div>LAT: 26.8467° N</div>
          <div>LON: 80.9462° E</div>
        </div>

        <div className="relative z-10 max-w-sm p-6 text-center font-mono">
          {isSignalLost ? (
            <WifiOff className="w-8 h-8 mx-auto mb-3 text-[#ffb4ab]" />
          ) : (
            <Radio className="w-8 h-8 mx-auto mb-3 text-[#F5F5F0] opacity-80" />
          )}
          <h4 className={cn("text-xs font-bold uppercase tracking-widest", isSignalLost ? "text-[#ffb4ab]" : "text-[#F5F5F0]")}>
            {isSignalLost ? "SIGNAL LOST // LINK_DROP" : "STREAM STANDBY"}
          </h4>
          <p className="text-[11px] text-[#8f918c] mt-2 leading-relaxed font-sans">
            {isSignalLost
              ? "The configured CCTV source is currently unreachable."
              : streamConfigured
              ? "RTSP source registered. A WebRTC/HLS relay connects this camera into the browser matrix."
              : "No stream URL configured for this node."}
          </p>
          {streamConfigured && <p className="text-[10px] text-[#8f918c] mt-2 break-all font-mono">SOURCE: {camera.rtspUrl}</p>}
          {isSignalLost && (
            <div className="mt-3 inline-flex items-center gap-2 text-[10px] text-[#ffdad6] bg-[#93000a] px-3 py-1 border border-[#ffb4ab] rounded-none">
              <RefreshCw className="w-3 h-3 text-[#ffdad6] animate-spin" />
              <span>AWAITING LINK RECOVERY</span>
            </div>
          )}
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

      {/* Bottom Controls Toolbar */}
      <div className="bg-[#1c1b1b] border-t border-[#454843] px-3 py-2 flex items-center justify-between gap-2 z-20 shrink-0 font-mono text-xs text-[#c5c7c1]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("optical"); }}
            title="Optical mode"
            className={cn("px-2 py-1 rounded-none border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", viewMode === "optical" ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]" : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]")}
          >
            <Eye className="w-3 h-3" /><span className="hidden sm:inline">OPT</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("thermal"); }}
            title="Thermal mode"
            className={cn("px-2 py-1 rounded-none border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", viewMode === "thermal" ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]" : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]")}
          >
            <Flame className="w-3 h-3" /><span className="hidden sm:inline">THERM</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setViewMode("night_vision"); }}
            title="Night vision mode"
            className={cn("px-2 py-1 rounded-none border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", viewMode === "night_vision" ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]" : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]")}
          >
            <Moon className="w-3 h-3" /><span className="hidden sm:inline">NV</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {camera.type === "ptz" && !isSignalLost && (
            <button
              onClick={() => { tacticalSound.playClick(); setShowPTZ(!showPTZ); }}
              className={cn("px-2 py-1 rounded-none border text-[10px] font-bold uppercase tracking-wider", showPTZ ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]" : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]")}
            >
              <span>PTZ</span>
            </button>
          )}
          <button
            onClick={handleManualAlert}
            title="Flag an incident"
            className="px-2.5 py-1 bg-[#93000a] hover:bg-[#b00020] text-[#ffdad6] border border-[#ffb4ab] rounded-none text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider"
          >
            <AlertTriangle className="w-3 h-3" /><span>FLAG INCIDENT</span>
          </button>
          <button
            onClick={() => { tacticalSound.playClick(); setIsFullscreen(!isFullscreen); }}
            title="Toggle fullscreen"
            className="p-1 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#2a2a2a] rounded-none border border-[#454843]"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
