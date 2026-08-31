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

  const setPreset = (p: number, t: number, z: number) => {
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
        "bg-[#131313] border border-[#454843] rounded-none p-3 font-mono select-none shadow-none text-[#e5e2e1]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[#454843] pb-2 mb-3">
        <div className="flex items-center gap-1.5 text-[#F5F5F0] text-xs font-bold uppercase tracking-wider">
          <Crosshair className="w-3.5 h-3.5" />
          <span>PTZ_CONTROLLER</span>
        </div>
        <span className="text-[10px] text-[#8f918c]">ID: {cameraId}</span>
      </div>

      {/* D-Pad & Zoom Column */}
      <div className="flex items-center justify-between gap-4">
        {/* Joystick D-Pad */}
        <div className="relative w-28 h-28 bg-[#1c1b1b] border border-[#454843] flex items-center justify-center p-2">
          <button
            onClick={() => handlePanTilt(0, 5)}
            className="absolute top-1 p-1 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#2a2a2a]"
            title="Tilt Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(0, -5)}
            className="absolute bottom-1 p-1 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#2a2a2a]"
            title="Tilt Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(-5, 0)}
            className="absolute left-1 p-1 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#2a2a2a]"
            title="Pan Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePanTilt(5, 0)}
            className="absolute right-1 p-1 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#2a2a2a]"
            title="Pan Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Center reset */}
          <button
            onClick={() => setPreset(0, 0, 1.0)}
            className="w-7 h-7 bg-[#131313] hover:bg-[#F5F5F0] hover:text-[#121212] border border-[#454843] flex items-center justify-center text-[#8f918c] text-[10px] transition-colors"
            title="Reset Home"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Zoom & Telemetry */}
        <div className="flex-1 space-y-2 text-xs">
          <div className="bg-[#1c1b1b] p-2 border border-[#454843] space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#8f918c]">PAN:</span>
              <span className="text-[#F5F5F0] font-bold">{pan > 0 ? `+${pan}` : pan}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8f918c]">TILT:</span>
              <span className="text-[#F5F5F0] font-bold">{tilt > 0 ? `+${tilt}` : tilt}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8f918c]">ZOOM:</span>
              <span className="text-[#F5F5F0] font-bold">{zoom}x</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleZoomChange(-0.5)}
              className="flex-1 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#c5c7c1] hover:text-[#F5F5F0] border border-[#454843] flex items-center justify-center text-[10px] font-bold"
            >
              <ZoomOut className="w-3 h-3 mr-1 text-[#8f918c]" /> OUT
            </button>
            <button
              onClick={() => handleZoomChange(0.5)}
              className="flex-1 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#c5c7c1] hover:text-[#F5F5F0] border border-[#454843] flex items-center justify-center text-[10px] font-bold"
            >
              <ZoomIn className="w-3 h-3 mr-1 text-[#8f918c]" /> IN
            </button>
          </div>
        </div>
      </div>

      {/* Preset Positions */}
      <div className="mt-3 pt-2 border-t border-[#454843]">
        <span className="text-[10px] text-[#8f918c] uppercase tracking-wider block mb-1">
          TACTICAL_PRESETS
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setPreset(30, -5, 2.5)}
            className="px-1.5 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#454843] hover:border-[#F5F5F0] text-[10px] text-[#c5c7c1] hover:text-[#F5F5F0] truncate font-bold uppercase"
          >
            P1: GATE
          </button>
          <button
            onClick={() => setPreset(120, -15, 4.0)}
            className="px-1.5 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#454843] hover:border-[#F5F5F0] text-[10px] text-[#c5c7c1] hover:text-[#F5F5F0] truncate font-bold uppercase"
          >
            P2: CULVERT
          </button>
          <button
            onClick={() => setPreset(180, 0, 1.0)}
            className="px-1.5 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] border border-[#454843] hover:border-[#F5F5F0] text-[10px] text-[#c5c7c1] hover:text-[#F5F5F0] truncate font-bold uppercase"
          >
            P3: ZERO LINE
          </button>
        </div>
      </div>
    </div>
  );
};
