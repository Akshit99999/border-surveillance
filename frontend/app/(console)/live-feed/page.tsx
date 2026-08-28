"use client";

import React, { useState } from "react";
import {
  Video,
  Grid2X2,
  Grid3X3,
  Maximize,
  Filter,
  Eye,
  Crosshair,
  WifiOff,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { CameraVideoFeed } from "@/components/video/CameraVideoFeed";
import { TacticalCard } from "@/components/shared/TacticalCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { tacticalSound } from "@/lib/sound";

export default function LiveFeedPage() {
  const { cameras, sectors } = useIBVAPStore();

  const [layout, setLayout] = useState<"2x2" | "3x2" | "focus">("2x2");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedCameraType, setSelectedCameraType] = useState<string>("ALL");
  const [focusCameraId, setFocusCameraId] = useState<string>(cameras[0]?.id || "");

  const handleLayoutChange = (newLayout: "2x2" | "3x2" | "focus") => {
    tacticalSound.playClick();
    setLayout(newLayout);
  };

  const filteredCameras = cameras.filter((cam) => {
    const matchSector = selectedSector === "ALL" || cam.sector.includes(selectedSector);
    const matchType = selectedCameraType === "ALL" || cam.type === selectedCameraType;
    return matchSector && matchType;
  });

  const displayedCameras =
    layout === "2x2"
      ? filteredCameras.slice(0, 4)
      : layout === "3x2"
      ? filteredCameras.slice(0, 6)
      : filteredCameras;

  const focusCamera = cameras.find((c) => c.id === focusCameraId) || cameras[0];

  return (
    <div className="space-y-4 font-mono">
      {/* Top Controls Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        {/* Left: Sector & Type Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">SECTOR:</span>
            <select
              value={selectedSector}
              onChange={(e) => {
                tacticalSound.playClick();
                setSelectedSector(e.target.value);
              }}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">ALL SECTORS (15 FEEDS)</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">OPTICS:</span>
            <select
              value={selectedCameraType}
              onChange={(e) => {
                tacticalSound.playClick();
                setSelectedCameraType(e.target.value);
              }}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">ALL SENSOR TYPES</option>
              <option value="ptz">PTZ CAMERAS</option>
              <option value="thermal">THERMAL INFRARED</option>
              <option value="fixed">FIXED OPTICAL</option>
            </select>
          </div>
        </div>

        {/* Right: Layout Switchers */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">
            LAYOUT MATRIX:
          </span>

          <button
            onClick={() => handleLayoutChange("2x2")}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              layout === "2x2"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>2x2 GRID</span>
          </button>

          <button
            onClick={() => handleLayoutChange("3x2")}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              layout === "3x2"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>3x2 GRID</span>
          </button>

          <button
            onClick={() => handleLayoutChange("focus")}
            className={`px-2.5 py-1.5 rounded border text-xs flex items-center gap-1.5 transition-colors ${
              layout === "focus"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500 font-bold"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Maximize className="w-3.5 h-3.5 text-cyan-400" />
            <span>FOCUS + THUMBNAILS</span>
          </button>
        </div>
      </div>

      {/* Main Video Feeds Layout */}
      {layout === "focus" ? (
        /* Focus Mode: 1 Large Feed + Sidebar Thumbnails */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Focus Viewport */}
          <div className="lg:col-span-3">
            {focusCamera && (
              <CameraVideoFeed
                camera={focusCamera}
                showBoundingBoxes={true}
                showPTZ={focusCamera.type === "ptz"}
                className="h-[580px]"
              />
            )}
          </div>

          {/* Thumbnail Carousel / Selector */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              SELECT ACTIVE STREAM ({filteredCameras.length})
            </span>
            {filteredCameras.map((cam) => {
              const isSelected = cam.id === focusCamera.id;
              return (
                <div
                  key={cam.id}
                  onClick={() => {
                    tacticalSound.playClick();
                    setFocusCameraId(cam.id);
                  }}
                  className={`p-2 bg-slate-900 border rounded cursor-pointer transition-all ${
                    isSelected
                      ? "border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)] bg-cyan-950/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-slate-200 truncate max-w-[140px]">
                      {cam.id}
                    </span>
                    <StatusPill type={cam.status} size="sm" />
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{cam.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid Mode: 2x2 or 3x2 */
        <div
          className={`grid gap-4 ${
            layout === "2x2"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {displayedCameras.map((cam) => (
            <CameraVideoFeed
              key={cam.id}
              camera={cam}
              showBoundingBoxes={true}
              className="aspect-video"
            />
          ))}
        </div>
      )}

      {/* Footer Telemetry Banner */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">14/15 SENSORS OPERATIONAL</span>
          <span>•</span>
          <span className="text-rose-400 font-semibold">1 RECONNECTING: CAM-A04-NORTH</span>
        </div>
        <div className="flex items-center gap-2">
          <span>AI INFERENCE ENGINE: YOLOv8-X + THERMAL DETECTOR</span>
        </div>
      </div>
    </div>
  );
}
