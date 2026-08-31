"use client";

import React from "react";
import { Sliders, Power, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export default function CameraSettingsAdminPage() {
  const {
    cameras,
    toggleCameraActive,
    setCameraSensitivity,
    soundMuted,
    toggleSound,
    resetData,
  } = useIBVAPStore();

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-[#1c1b1b] border border-[#454843] rounded-none p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F5F5F0] text-[#121212] flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-widest">
              CAMERA SETTINGS // SENSOR_POWER_CONTROL
            </h1>
            <p className="text-[11px] text-[#8f918c] mt-0.5 font-sans">
              Camera power control, sensitivity thresholds, and audio telemetry configuration.
            </p>
          </div>
        </div>

        {/* Sound Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="px-3.5 py-2 bg-[#131313] hover:bg-[#2a2a2a] text-[#F5F5F0] border border-[#454843] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            {soundMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#ffb4ab]" />
                <span>UNMUTE AUDIO</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#F5F5F0]" />
                <span>AUDIO ACTIVE</span>
              </>
            )}
          </button>

          <button
            onClick={resetData}
            className="px-3.5 py-2 bg-[#131313] hover:bg-[#2a2a2a] text-[#8f918c] hover:text-[#F5F5F0] border border-[#454843] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            title="Clear server records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET CACHE</span>
          </button>
        </div>
      </div>

      {/* Simplified Camera Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => {
          const isOnline = cam.status === "online";

          return (
            <div
              key={cam.id}
              className="p-5 bg-[#131313] border border-[#454843] rounded-none flex flex-col justify-between space-y-4"
            >
              {/* Header: Camera ID & Power Switch */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#F5F5F0]">{cam.id}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#1c1b1b] text-[#c5c7c1] rounded-none border border-[#454843] uppercase font-bold">
                      {cam.type}
                    </span>
                  </div>
                  <h4 className="text-xs text-[#c5c7c1] mt-1">{cam.name}</h4>
                  <p className="text-[11px] text-[#8f918c]">{cam.sector}</p>
                </div>

                {/* Big Power On/Off Toggle Button */}
                <button
                  onClick={() => toggleCameraActive(cam.id)}
                  className={`px-4 py-2 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                    isOnline
                      ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                      : "bg-[#1c1b1b] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
                  }`}
                >
                  <Power
                    className={`w-3.5 h-3.5 ${isOnline ? "text-[#121212]" : "text-[#8f918c]"}`}
                  />
                  <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                </button>
              </div>

              {/* Sensitivity Slider */}
              <div className="p-3.5 bg-[#1c1b1b] border border-[#454843] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8f918c] font-bold uppercase tracking-widest">
                    DETECTION_SENSITIVITY:
                  </span>
                  <span className="text-[#F5F5F0] font-bold text-sm">
                    {cam.confidenceThreshold}%
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="98"
                  value={cam.confidenceThreshold}
                  onChange={(e) => setCameraSensitivity(cam.id, Number(e.target.value))}
                  disabled={!isOnline}
                  className="w-full h-2 accent-[#F5F5F0] cursor-pointer disabled:opacity-30"
                />

                <div className="flex justify-between text-[10px] text-[#8f918c]">
                  <span>Lower (High Recall)</span>
                  <span>Higher (High Precision)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
