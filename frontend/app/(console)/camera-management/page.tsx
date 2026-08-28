"use client";

import React, { useState } from "react";
import {
  Camera as CameraIcon,
  Sliders,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Video,
  Radio,
  SlidersHorizontal,
  Flame,
  Search,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { Camera, TriggerAction } from "@/lib/mock/types";
import { StatusPill } from "@/components/shared/StatusPill";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { TacticalCard } from "@/components/shared/TacticalCard";
import { ZonePolygonEditor } from "@/components/camera/ZonePolygonEditor";
import { tacticalSound } from "@/lib/sound";

export default function CameraManagementPage() {
  const { cameras, sectors, updateCameraDetection, commitZoneMap, currentUser } =
    useIBVAPStore();

  const [selectedCameraId, setSelectedCameraId] = useState<string>(cameras[0]?.id || "");
  const [sectorFilter, setSectorFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"detection_studio" | "registry">("detection_studio");

  const selectedCamera = cameras.find((c) => c.id === selectedCameraId) || cameras[0];

  const filteredCameras = cameras.filter((c) => {
    const matchSector = sectorFilter === "ALL" || c.sector.includes(sectorFilter);
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSector && matchSearch;
  });

  const handleToggle = (key: keyof Camera, value: boolean) => {
    tacticalSound.playClick();
    updateCameraDetection(selectedCamera.id, { [key]: value });
  };

  const handleSliderChange = (key: keyof Camera, value: number) => {
    updateCameraDetection(selectedCamera.id, { [key]: value });
  };

  const handleActionChange = (action: TriggerAction) => {
    tacticalSound.playClick();
    updateCameraDetection(selectedCamera.id, { triggerAction: action });
  };

  const handlePolygonCommit = (polygon: { x: number; y: number }[]) => {
    commitZoneMap(selectedCamera.id, polygon, currentUser.name);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
              CAMERA REGISTRY & DETECTION LOGIC STUDIO
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Configure AI detection zones, thresholds, and automated response actions per sensor.
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              tacticalSound.playClick();
              setActiveTab("detection_studio");
            }}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
              activeTab === "detection_studio"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            DETECTION LOGIC STUDIO
          </button>
          <button
            onClick={() => {
              tacticalSound.playClick();
              setActiveTab("registry");
            }}
            className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors ${
              activeTab === "registry"
                ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            SENSOR REGISTRY TABLE ({cameras.length})
          </button>
        </div>
      </div>

      {activeTab === "detection_studio" ? (
        /* Detection Logic Studio View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Camera Selector List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase">
                ACTIVE SENSORS ({cameras.length})
              </span>
              <select
                value={sectorFilter}
                onChange={(e) => {
                  tacticalSound.playClick();
                  setSectorFilter(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">ALL SECTORS</option>
                {sectors.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {filteredCameras.map((cam) => {
                const isSelected = cam.id === selectedCamera.id;
                return (
                  <div
                    key={cam.id}
                    onClick={() => {
                      tacticalSound.playClick();
                      setSelectedCameraId(cam.id);
                    }}
                    className={`p-3 bg-slate-900/90 border rounded cursor-pointer transition-all ${
                      isSelected
                        ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] bg-cyan-950/30"
                        : "border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">{cam.id}</span>
                      <StatusPill type={cam.status} size="sm" />
                    </div>
                    <h4 className="text-xs text-slate-200 font-semibold mt-1 truncate">
                      {cam.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                      <span>{cam.sector}</span>
                      <span className="text-cyan-400 uppercase font-bold">{cam.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Columns: Zone Polygon Editor & Logic Config */}
          <div className="lg:col-span-2 space-y-4">
            {/* Interactive Polygon Editor Canvas */}
            <TacticalCard
              title={`DETECTION ZONE GEOFENCE: ${selectedCamera.id}`}
              subtitle={selectedCamera.name}
              badge={<StatusPill type={selectedCamera.status} size="sm" />}
            >
              <ZonePolygonEditor
                key={selectedCamera.id}
                initialPolygon={selectedCamera.zonePolygon}
                cameraId={selectedCamera.id}
                cameraName={selectedCamera.name}
                onCommit={handlePolygonCommit}
              />
            </TacticalCard>

            {/* Parameter Sliders & Detection Toggles */}
            <TacticalCard title="DETECTION LOGIC & AUTOMATION CONFIGURATION">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* AI Models Toggles */}
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                    ACTIVE AI DETECTION MODELS
                  </span>

                  <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-300 font-semibold">Master AI Active</span>
                    <button
                      onClick={() => handleToggle("aiActive", !selectedCamera.aiActive)}
                      className={`px-3 py-1 rounded text-[10px] font-bold ${
                        selectedCamera.aiActive
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-600"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {selectedCamera.aiActive ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-300">Human / Infiltration Detection</span>
                    <button
                      onClick={() =>
                        handleToggle("personDetection", !selectedCamera.personDetection)
                      }
                      className={`px-3 py-1 rounded text-[10px] font-bold ${
                        selectedCamera.personDetection
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-600"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {selectedCamera.personDetection ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-300">Vehicle / Transport Detection</span>
                    <button
                      onClick={() =>
                        handleToggle("vehicleDetection", !selectedCamera.vehicleDetection)
                      }
                      className={`px-3 py-1 rounded text-[10px] font-bold ${
                        selectedCamera.vehicleDetection
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-600"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {selectedCamera.vehicleDetection ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-slate-300">Firearms & Weapon Contour</span>
                    <button
                      onClick={() =>
                        handleToggle("weaponDetection", !selectedCamera.weaponDetection)
                      }
                      className={`px-3 py-1 rounded text-[10px] font-bold ${
                        selectedCamera.weaponDetection
                          ? "bg-rose-950 text-rose-300 border border-rose-600"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {selectedCamera.weaponDetection ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Thresholds & Trigger Action */}
                <div className="space-y-3 p-3 bg-slate-950 border border-slate-800 rounded">
                  <span className="text-[10px] text-amber-400 font-bold uppercase block">
                    SENSITIVITY & TRIGGER AUTOMATION
                  </span>

                  {/* Confidence Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Confidence Threshold:</span>
                      <span className="text-cyan-300 font-bold">
                        {selectedCamera.confidenceThreshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="98"
                      value={selectedCamera.confidenceThreshold}
                      onChange={(e) =>
                        handleSliderChange("confidenceThreshold", Number(e.target.value))
                      }
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  {/* Min Object Size Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Min Object Size (px):</span>
                      <span className="text-amber-300 font-bold">
                        {selectedCamera.minObjectSizePx} px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={selectedCamera.minObjectSizePx}
                      onChange={(e) =>
                        handleSliderChange("minObjectSizePx", Number(e.target.value))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Dwell Time */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Dwell Time Threshold:</span>
                      <span className="text-emerald-400 font-bold">
                        {selectedCamera.dwellTimeSeconds} seconds
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      value={selectedCamera.dwellTimeSeconds}
                      onChange={(e) =>
                        handleSliderChange("dwellTimeSeconds", Number(e.target.value))
                      }
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Trigger Action Selector */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">
                      AUTOMATED ESCALATION ACTION:
                    </label>
                    <select
                      value={selectedCamera.triggerAction}
                      onChange={(e) => handleActionChange(e.target.value as TriggerAction)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-rose-300 font-bold focus:outline-none focus:border-rose-500 font-mono"
                    >
                      <option value="QRF Dispatch">QRF Quick Reaction Dispatch</option>
                      <option value="Siren Alarm">High-Decibel Siren Alarm</option>
                      <option value="Guard Ping">Direct Sentry Radio Ping</option>
                      <option value="Floodlight Trigger">Perimeter Floodlight Illumination</option>
                    </select>
                  </div>
                </div>
              </div>
            </TacticalCard>
          </div>
        </div>
      ) : (
        /* Registry Table View */
        <div className="bg-slate-900/90 border border-slate-800 rounded-sm overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/90 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3.5">STATUS</th>
                  <th className="py-3 px-3">CAMERA ID</th>
                  <th className="py-3 px-3">SENSOR NAME</th>
                  <th className="py-3 px-3">SECTOR</th>
                  <th className="py-3 px-3">TYPE</th>
                  <th className="py-3 px-3">FPS</th>
                  <th className="py-3 px-3">RESOLUTION</th>
                  <th className="py-3 px-3">TRIGGER ACTION</th>
                  <th className="py-3 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCameras.map((cam) => (
                  <tr
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      setActiveTab("detection_studio");
                    }}
                    className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3.5">
                      <StatusPill type={cam.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-300">{cam.id}</td>
                    <td className="py-3 px-3 text-slate-200 font-semibold">{cam.name}</td>
                    <td className="py-3 px-3 text-slate-400">{cam.sector}</td>
                    <td className="py-3 px-3 uppercase text-cyan-400 font-bold">{cam.type}</td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{cam.fps} FPS</td>
                    <td className="py-3 px-3 text-slate-300">{cam.resolution}</td>
                    <td className="py-3 px-3 text-amber-300 font-semibold">
                      {cam.triggerAction}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 rounded text-[10px] font-bold">
                        CONFIGURE
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
