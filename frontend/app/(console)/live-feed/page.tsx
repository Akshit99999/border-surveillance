"use client";

import React, { useState } from "react";
import {
  Grid2X2,
  Grid3X3,
  Maximize,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { CameraVideoFeed } from "@/components/video/CameraVideoFeed";
import { LocalCameraFeed } from "@/components/video/LocalCameraFeed";
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
  const onlineCameraCount = cameras.filter((camera) => camera.status === "online").length;
  const signalLostCameraCount = cameras.filter((camera) => camera.status === "signal_lost").length;

  return (
    <div className="space-y-6 font-mono">
      {/* Real Local Camera / Screen Preview */}
      <LocalCameraFeed className="w-full" />

      {/* Top Matrix Controls Toolbar */}
      <div className="bg-[#1c1b1b] border border-[#454843] rounded-none p-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest">SECTOR:</span>
            <select
              value={selectedSector}
              onChange={(e) => {
                tacticalSound.playClick();
                setSelectedSector(e.target.value);
              }}
              className="bg-[#131313] border border-[#454843] rounded-none px-2.5 py-1.5 text-xs text-[#F5F5F0] focus:border-[#F5F5F0] font-mono"
            >
              <option value="ALL">ALL SECTORS ({cameras.length} CAMERAS)</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code}: {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest">OPTICS:</span>
            <select
              value={selectedCameraType}
              onChange={(e) => {
                tacticalSound.playClick();
                setSelectedCameraType(e.target.value);
              }}
              className="bg-[#131313] border border-[#454843] rounded-none px-2.5 py-1.5 text-xs text-[#F5F5F0] focus:border-[#F5F5F0] font-mono"
            >
              <option value="ALL">ALL SENSOR TYPES</option>
              <option value="ptz">PTZ OPTICAL</option>
              <option value="thermal">THERMAL INFRARED</option>
              <option value="fixed">FIXED OPTICAL</option>
            </select>
          </div>
        </div>

        {/* Layout Mode Switchers */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest mr-1 hidden sm:inline">
            LAYOUT:
          </span>

          <button
            onClick={() => handleLayoutChange("2x2")}
            className={`px-3 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              layout === "2x2"
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
            }`}
          >
            <Grid2X2 className="w-3.5 h-3.5" />
            <span>2x2</span>
          </button>

          <button
            onClick={() => handleLayoutChange("3x2")}
            className={`px-3 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              layout === "3x2"
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
            }`}
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span>3x2</span>
          </button>

          <button
            onClick={() => handleLayoutChange("focus")}
            className={`px-3 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
              layout === "focus"
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
            }`}
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>FOCUS</span>
          </button>
        </div>
      </div>

      {/* Main Video Matrix */}
      {cameras.length > 0 && (layout === "focus" ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            <span className="text-[10px] text-[#8f918c] uppercase tracking-widest font-bold block mb-2">
              STREAM SELECTOR ({filteredCameras.length})
            </span>
            {filteredCameras.map((cam) => {
              const isSelected = cam.id === focusCamera?.id;
              return (
                <div
                  key={cam.id}
                  onClick={() => {
                    tacticalSound.playClick();
                    setFocusCameraId(cam.id);
                  }}
                  className={`p-3 border rounded-none cursor-pointer transition-colors ${
                    isSelected
                      ? "border-[#F5F5F0] bg-[#1c1b1b]"
                      : "border-[#454843] bg-[#131313] hover:bg-[#1c1b1b]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-[#F5F5F0] truncate max-w-[140px]">
                      {cam.id}
                    </span>
                    <StatusPill type={cam.status} size="sm" />
                  </div>
                  <p className="text-[10px] text-[#8f918c] truncate">{cam.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
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
      ))}

      {cameras.length === 0 && (
        <div className="p-8 bg-[#1c1b1b] border border-[#454843] text-center text-xs text-[#8f918c]">
          No CCTV cameras configured. Use the local camera above to test real-time AI inference.
        </div>
      )}

      {/* Footer Telemetry */}
      <div className="p-3 bg-[#131313] border border-[#454843] flex flex-wrap items-center justify-between text-[11px] text-[#8f918c]">
        <div className="flex items-center gap-3">
          <span className="text-[#F5F5F0] font-bold">{onlineCameraCount}/{cameras.length} CONFIGURED CAMERAS ONLINE</span>
          {signalLostCameraCount > 0 && <><span>•</span><span className="text-[#ffb4ab] font-bold">{signalLostCameraCount} SIGNAL LOST</span></>}
        </div>
        <div>
          <span>AI OVERLAYS REQUIRE ACTIVE VIDEO SOURCE</span>
        </div>
      </div>
    </div>
  );
}
