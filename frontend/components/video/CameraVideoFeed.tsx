import React, { useState, useEffect, useRef } from "react";
import {
  Maximize2,
  Minimize2,
  Video,
  Radio,
  Eye,
  Flame,
  Moon,
  AlertTriangle,
  Camera as CameraIcon,
  Crosshair,
  WifiOff,
  RefreshCw,
} from "lucide-react";
import { Camera } from "@/lib/mock/types";
import { cn, formatTimeIST } from "@/lib/utils";
import { BoundingBoxOverlay, BoundingBox } from "./BoundingBoxOverlay";
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
  showBoundingBoxes = true,
  showPTZ: initialShowPTZ = false,
  interactive = true,
  onFlagIncident,
  className,
}) => {
  const { addAlert, updateCameraDetection } = useIBVAPStore();
  const [viewMode, setViewMode] = useState<"optical" | "thermal" | "night_vision">(
    initialMode || (camera.type === "thermal" ? "thermal" : "optical")
  );
  const [showPTZ, setShowPTZ] = useState<boolean>(initialShowPTZ);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [liveFps, setLiveFps] = useState<number>(camera.fps || 30);
  const [timecode, setTimecode] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Timecode generator
  useEffect(() => {
    setTimecode(formatTimeIST());
    const interval = setInterval(() => {
      setTimecode(formatTimeIST());
      // Slight simulated jitter in FPS
      if (camera.status === "online") {
        setLiveFps(Number(((camera.fps || 30) + (Math.random() * 0.8 - 0.4)).toFixed(1)));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [camera]);

  // Simulated dynamic bounding boxes based on camera location
  useEffect(() => {
    if (camera.status !== "online" || !camera.aiActive) {
      setBoxes([]);
      return;
    }

    // Define simulated targets per camera
    let initialBoxes: BoundingBox[] = [];
    if (camera.id.includes("A01-NORTH") || camera.id.includes("A02-WEST")) {
      initialBoxes = [
        {
          id: "BOX-01",
          label: "Infiltration Movement",
          type: "person",
          confidence: 96.4,
          x: 32,
          y: 42,
          width: 14,
          height: 28,
        },
        {
          id: "BOX-02",
          label: "Assault Weapon Contour",
          type: "weapon",
          confidence: 93.8,
          x: 44,
          y: 50,
          width: 8,
          height: 12,
        },
      ];
    } else if (camera.id.includes("A05-HIGHWAY") || camera.id.includes("A06-TOWER")) {
      initialBoxes = [
        {
          id: "BOX-03",
          label: "Blacklisted 4x4 (PB-02)",
          type: "vehicle",
          confidence: 98.2,
          x: 40,
          y: 35,
          width: 28,
          height: 32,
        },
      ];
    } else if (camera.id.includes("DRONE")) {
      initialBoxes = [
        {
          id: "BOX-04",
          label: "Rogue Micro-UAV",
          type: "drone",
          confidence: 91.5,
          x: 48,
          y: 22,
          width: 12,
          height: 10,
        },
      ];
    } else {
      initialBoxes = [
        {
          id: "BOX-05",
          label: "Sector Sentry Patrol",
          type: "person",
          confidence: 94.0,
          x: 20,
          y: 40,
          width: 12,
          height: 25,
        },
      ];
    }

    setBoxes(initialBoxes);

    // Subtle drift animation for AI bounding boxes
    const interval = setInterval(() => {
      setBoxes((prev) =>
        prev.map((b) => ({
          ...b,
          x: Math.max(5, Math.min(80, b.x + (Math.random() * 1.5 - 0.75))),
          y: Math.max(10, Math.min(70, b.y + (Math.random() * 1.2 - 0.6))),
          confidence: Math.min(99.9, Math.max(80.0, b.confidence + (Math.random() * 0.6 - 0.3))),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [camera]);

  const handleManualAlert = () => {
    tacticalSound.playAlert();
    addAlert({
      level: "critical",
      sourceCameraId: camera.id,
      sourceCameraName: camera.name,
      eventType: "Manual Operator Incident Flag",
      confidence: 99.0,
      coordinates: camera.coordinates,
      objectClass: "Person",
      evidenceUrl: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=600&auto=format&fit=crop&q=80",
      sector: camera.sector,
      notes: `Operator flagged high-risk movement from ${camera.name}.`,
    });
    if (onFlagIncident) onFlagIncident(camera);
  };

  const isSignalLost = camera.status === "signal_lost";

  // Mode-based styles
  const filterStyles = {
    optical: "",
    thermal:
      "filter contrast-150 saturate-200 hue-rotate-[180deg] invert brightness-90 bg-gradient-to-tr from-amber-950 via-rose-950 to-indigo-950",
    night_vision:
      "filter contrast-125 brightness-125 saturate-150 hue-rotate-[90deg] bg-emerald-950/40",
  }[viewMode];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex flex-col select-none group transition-all",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Top Telemetry Header */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-2.5 z-20 flex items-center justify-between text-[11px] font-mono text-slate-200">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isSignalLost
                ? "bg-rose-500 animate-ping"
                : "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"
            )}
          />
          <span className="font-bold tracking-wider text-cyan-300 truncate max-w-[180px] sm:max-w-xs">
            {camera.id}
          </span>
          <span className="hidden sm:inline text-slate-400">[{camera.sector}]</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Mode Pill */}
          <span className="px-1.5 py-0.5 bg-slate-900/90 border border-slate-700 text-[10px] text-cyan-400 uppercase rounded">
            {viewMode.replace("_", " ")}
          </span>

          {!isSignalLost && (
            <span className="font-semibold text-emerald-400 text-[10px] bg-slate-900/90 px-1.5 py-0.5 border border-slate-700 rounded hidden sm:inline">
              {liveFps} FPS
            </span>
          )}

          <span className="text-slate-300 font-semibold">{timecode}</span>
        </div>
      </div>

      {/* Main Video Viewport */}
      <div className="relative flex-1 min-h-[220px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Background Visual Layer */}
        {isSignalLost ? (
          /* Realistic Signal Lost Screen */
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 text-center z-10">
            {/* TV Static Noise Canvas / CSS Animation */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] animate-pulse" />
            <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-600 flex items-center justify-center text-rose-400 mb-3 animate-pulse">
              <WifiOff className="w-6 h-6" />
            </div>
            <h4 className="font-mono text-sm font-bold text-rose-400 uppercase tracking-widest">
              SIGNAL LOST – RECONNECTING…
            </h4>
            <p className="font-mono text-xs text-slate-400 mt-1 max-w-xs">
              RTSP handshake dropped on {camera.rtspUrl}. Auto-failover mesh retry active (Attempt 4/10).
            </p>
            <div className="mt-3 flex items-center gap-2 font-mono text-[10px] text-rose-300 bg-rose-950/60 px-3 py-1 border border-rose-800 rounded">
              <RefreshCw className="w-3 h-3 animate-spin text-rose-400" />
              <span>RE-ESTABLISHING SECURE UDP STREAM...</span>
            </div>
          </div>
        ) : (
          /* Simulated Tactical Stream */
          <div className={cn("absolute inset-0 transition-all duration-300", filterStyles)}>
            {/* Tactical Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Tactical Crosshair Reticle in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-20 h-20 border border-cyan-500/30 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" />
              </div>
              <div className="w-32 h-px bg-cyan-400/20 absolute" />
              <div className="h-32 w-px bg-cyan-400/20 absolute" />
            </div>

            {/* Corner Framing Brackets */}
            <div className="absolute top-10 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50 pointer-events-none" />
            <div className="absolute top-10 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50 pointer-events-none" />
            <div className="absolute bottom-10 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50 pointer-events-none" />
            <div className="absolute bottom-10 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50 pointer-events-none" />

            {/* Background Texture / Camera Scenery Simulation */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-950/80 opacity-90" />
          </div>
        )}

        {/* AI Bounding Boxes Overlay */}
        {!isSignalLost && showBoundingBoxes && <BoundingBoxOverlay boxes={boxes} />}

        {/* PTZ Floating Overlay Controls (if toggled) */}
        {showPTZ && !isSignalLost && (
          <div className="absolute bottom-12 right-3 z-30 max-w-xs animate-in zoom-in-95">
            <PTZControls
              cameraId={camera.id}
              cameraName={camera.name}
              onMove={(pan, tilt) => updateCameraDetection(camera.id, { pan, tilt })}
              onZoom={(zoom) => updateCameraDetection(camera.id, { zoom })}
            />
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-3 py-2 flex items-center justify-between z-20 shrink-0 font-mono text-xs text-slate-300">
        {/* Left: Mode Switchers */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              tacticalSound.playClick();
              setViewMode("optical");
            }}
            title="Optical Camera Mode"
            className={cn(
              "p-1.5 rounded border text-[10px] flex items-center gap-1 transition-colors",
              viewMode === "optical"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
            )}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">OPT</span>
          </button>

          <button
            onClick={() => {
              tacticalSound.playClick();
              setViewMode("thermal");
            }}
            title="Thermal Infrared Mode"
            className={cn(
              "p-1.5 rounded border text-[10px] flex items-center gap-1 transition-colors",
              viewMode === "thermal"
                ? "bg-rose-950 text-rose-300 border-rose-500"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
            )}
          >
            <Flame className="w-3 h-3" />
            <span className="hidden sm:inline">THERM</span>
          </button>

          <button
            onClick={() => {
              tacticalSound.playClick();
              setViewMode("night_vision");
            }}
            title="Night Vision Mode"
            className={cn(
              "p-1.5 rounded border text-[10px] flex items-center gap-1 transition-colors",
              viewMode === "night_vision"
                ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
            )}
          >
            <Moon className="w-3 h-3" />
            <span className="hidden sm:inline">NV</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {camera.type === "ptz" && !isSignalLost && (
            <button
              onClick={() => {
                tacticalSound.playClick();
                setShowPTZ(!showPTZ);
              }}
              className={cn(
                "p-1.5 rounded border text-[10px] flex items-center gap-1 transition-colors",
                showPTZ
                  ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                  : "bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200"
              )}
            >
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>PTZ</span>
            </button>
          )}

          {/* Quick Flag Incident */}
          <button
            onClick={handleManualAlert}
            title="Flag Emergency Incident on this Camera"
            className="px-2 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600 rounded text-[10px] flex items-center gap-1 font-bold transition-colors"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>FLAG INCIDENT</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              tacticalSound.playClick();
              setIsFullscreen(!isFullscreen);
            }}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded border border-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
