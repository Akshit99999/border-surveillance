"use client";

import React from "react";
import { Sliders, Camera as CameraIcon, Power, CheckCircle2, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { StatusPill } from "@/components/shared/StatusPill";
import { tacticalSound } from "@/lib/sound";

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
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">
              CAMERA SETTINGS & SENSOR POWER
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Simple camera power toggles and detection sensitivity adjustments.
            </p>
          </div>
        </div>

        {/* Sound Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs font-bold flex items-center gap-2 min-h-[40px]"
          >
            {soundMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>UNMUTE SOUND</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>SOUND ON</span>
              </>
            )}
          </button>

          <button
            onClick={resetData}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs font-bold flex items-center gap-1.5 min-h-[40px]"
            title="Clear server-managed records"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>CLEAR SERVER DATA</span>
          </button>
        </div>
      </div>

      {/* Simplified Camera Cards List - Large Tap Targets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cameras.map((cam) => {
          const isOnline = cam.status === "online";

          return (
            <div
              key={cam.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded flex flex-col justify-between space-y-3"
            >
              {/* Header: Camera ID & Power Switch */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-100">{cam.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700 uppercase">
                      {cam.type}
                    </span>
                  </div>
                  <h4 className="text-xs text-slate-300 font-sans mt-0.5">{cam.name}</h4>
                  <p className="text-[11px] text-slate-500">{cam.sector}</p>
                </div>

                {/* Big Power On/Off Toggle Button */}
                <button
                  onClick={() => toggleCameraActive(cam.id)}
                  className={`px-4 py-2.5 rounded border text-xs font-black min-h-[44px] flex items-center gap-2 transition-all ${
                    isOnline
                      ? "bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border-emerald-500"
                      : "bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  <Power
                    className={`w-4 h-4 ${isOnline ? "text-emerald-400" : "text-slate-500"}`}
                  />
                  <span>{isOnline ? "POWER ON" : "POWER OFF"}</span>
                </button>
              </div>

              {/* Sensitivity Slider */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase">
                    DETECTION SENSITIVITY:
                  </span>
                  <span className="text-cyan-300 font-black text-sm">
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
                  className="w-full h-3 accent-cyan-500 cursor-pointer disabled:opacity-40"
                />

                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Lower (More Alerts)</span>
                  <span>Higher (Strict)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
