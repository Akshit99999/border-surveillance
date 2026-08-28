import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Crosshair,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";

interface PTZControlsProps {
  cameraId: string;
  cameraName?: string;
  onMove?: (pan: number, tilt: number) => void;
  onZoom?: (zoom: number) => void;
  className?: string;
}

export const PTZControls: React.FC<PTZControlsProps> = ({
  cameraId,
  cameraName,
  onMove,
  onZoom,
  className,
}) => {
  const [pan, setPan] = useState(45);
  const [tilt, setTilt] = useState(-10);
  const [zoom, setZoom] = useState(2.0);

  const handlePanTilt = (deltaPan: number, deltaTilt: number) => {
    tacticalSound.playClick();
    const nextPan = Math.max(-180, Math.min(180, pan + deltaPan));
    const nextTilt = Math.max(-90, Math.min(90, tilt + deltaTilt));
    setPan(nextPan);
    setTilt(nextTilt);
    if (onMove) onMove(nextPan, nextTilt);
  };

  const handleZoomChange = (deltaZoom: number) => {
    tacticalSound.playClick();
    const nextZoom = Math.max(1.0, Math.min(10.0, Number((zoom + deltaZoom).toFixed(1))));
    setZoom(nextZoom);
    if (onZoom) onZoom(nextZoom);
  };

  const setPreset = (presetName: string, p: number, t: number, z: number) => {
    tacticalSound.playClick();
    setPan(p);
    setTilt(t);
    setZoom(z);
    if (onMove) onMove(p, t);
    if (onZoom) onZoom(z);
  };

  return (
    <div
      className={cn(
        "bg-slate-950/95 border border-slate-800 rounded p-3 font-mono select-none shadow-xl",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold uppercase">
          <Crosshair className="w-3.5 h-3.5" />
          <span>PTZ CONTROLLER</span>
        </div>
        <span className="text-[10px] text-slate-400">ID: {cameraId}</span>
      </div>

      {/* D-Pad Joystick & Zoom Column */}
      <div className="flex items-center justify-between gap-4">
        {/* Joystick D-Pad */}
        <div className="relative w-28 h-28 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center p-2 shadow-inner">
          <button
            onClick={() => handlePanTilt(0, 5)}
            className="absolute top-1 p-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded"
            title="Tilt Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(0, -5)}
            className="absolute bottom-1 p-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded"
            title="Tilt Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(-5, 0)}
            className="absolute left-1 p-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded"
            title="Pan Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(5, 0)}
            className="absolute right-1 p-1 text-slate-300 hover:text-cyan-300 hover:bg-slate-800 rounded"
            title="Pan Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Center reset / home */}
          <button
            onClick={() => setPreset("HOME", 0, 0, 1.0)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-cyan-950 border border-slate-600 hover:border-cyan-500 flex items-center justify-center text-slate-300 hover:text-cyan-300 text-[10px]"
            title="Reset Home"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Zoom & Telemetry */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="bg-slate-900/80 p-2 rounded border border-slate-800 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">PAN:</span>
              <span className="text-cyan-300 font-bold">{pan > 0 ? `+${pan}` : pan}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">TILT:</span>
              <span className="text-cyan-300 font-bold">{tilt > 0 ? `+${tilt}` : tilt}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">OPTICAL ZOOM:</span>
              <span className="text-amber-300 font-bold">{zoom}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleZoomChange(-0.5)}
              className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded flex items-center justify-center text-[10px]"
            >
              <ZoomOut className="w-3 h-3 mr-1 text-cyan-400" /> OUT
            </button>
            <button
              onClick={() => handleZoomChange(0.5)}
              className="flex-1 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded flex items-center justify-center text-[10px]"
            >
              <ZoomIn className="w-3 h-3 mr-1 text-cyan-400" /> IN
            </button>
          </div>
        </div>
      </div>

      {/* Preset Positions */}
      <div className="mt-3 pt-2 border-t border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
          TACTICAL PRESETS
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setPreset("PRESET 1 - GATE", 30, -5, 2.5)}
            className="px-1.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 rounded text-[10px] text-slate-300 truncate"
          >
            P1: MAIN GATE
          </button>
          <button
            onClick={() => setPreset("PRESET 2 - CULVERT", 120, -15, 4.0)}
            className="px-1.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 rounded text-[10px] text-slate-300 truncate"
          >
            P2: CULVERT
          </button>
          <button
            onClick={() => setPreset("PRESET 3 - ZERO LINE", 180, 0, 1.0)}
            className="px-1.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 rounded text-[10px] text-slate-300 truncate"
          >
            P3: ZERO LINE
          </button>
        </div>
      </div>
    </div>
  );
};
