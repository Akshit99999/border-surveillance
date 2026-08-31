"use client";

import React, { useState } from "react";
import {
  Camera as CameraIcon,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { Camera, TriggerAction } from "@/lib/types";
import { StatusPill } from "@/components/shared/StatusPill";
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

  if (!selectedCamera) {
    return (
      <div className="min-h-[360px] flex items-center justify-center bg-[#1c1b1b] border border-[#454843] rounded-none p-8 text-center font-mono">
        <div>
          <CameraIcon className="w-8 h-8 mx-auto mb-3 text-[#8f918c]" />
          <h1 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-widest">NO CAMERAS CONFIGURED</h1>
          <p className="text-xs text-[#8f918c] mt-2 max-w-md">Register a CCTV source through Django before configuring detection zones.</p>
        </div>
      </div>
    );
  }

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
      <div className="bg-[#1c1b1b] border border-[#454843] rounded-none p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F5F5F0] text-[#121212] flex items-center justify-center font-bold">
            <CameraIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-widest">
              CAMERA REGISTRY & DETECTION STUDIO
            </h1>
            <p className="text-[11px] text-[#8f918c] mt-0.5 font-sans">
              Configure detection zones, sensitivity parameters, and automated action triggers per camera.
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
            className={`px-3 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "detection_studio"
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
            }`}
          >
            DETECTION STUDIO
          </button>
          <button
            onClick={() => {
              tacticalSound.playClick();
              setActiveTab("registry");
            }}
            className={`px-3 py-1.5 rounded-none border text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "registry"
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843] hover:text-[#F5F5F0]"
            }`}
          >
            REGISTRY TABLE ({cameras.length})
          </button>
        </div>
      </div>

      {activeTab === "detection_studio" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Selector List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">
                ACTIVE SENSORS ({cameras.length})
              </span>
              <select
                value={sectorFilter}
                onChange={(e) => {
                  tacticalSound.playClick();
                  setSectorFilter(e.target.value);
                }}
                className="bg-[#131313] border border-[#454843] rounded-none px-2 py-1 text-[11px] text-[#F5F5F0] font-mono focus:border-[#F5F5F0]"
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
                    className={`p-3 border rounded-none cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#F5F5F0] bg-[#1c1b1b]"
                        : "border-[#454843] bg-[#131313] hover:bg-[#1c1b1b]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#F5F5F0]">{cam.id}</span>
                      <StatusPill type={cam.status} size="sm" />
                    </div>
                    <h4 className="text-xs text-[#c5c7c1] font-semibold mt-1 truncate">
                      {cam.name}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-[#8f918c] mt-2">
                      <span>{cam.sector}</span>
                      <span className="text-[#F5F5F0] uppercase font-bold">{cam.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Columns: Polygon Editor & Logic Config */}
          <div className="lg:col-span-2 space-y-4">
            <TacticalCard
              title={`DETECTION GEOFENCE // ${selectedCamera.id}`}
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

            <TacticalCard title="DETECTION LOGIC & AUTOMATION CONFIGURATION">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* AI Models Toggles */}
                <div className="space-y-2.5 p-3.5 bg-[#1c1b1b] border border-[#454843]">
                  <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block">
                    ACTIVE AI DETECTION MODELS
                  </span>

                  <div className="flex items-center justify-between p-2 bg-[#131313] border border-[#454843]">
                    <span className="text-[#c5c7c1] font-bold">Master AI Active</span>
                    <button
                      onClick={() => handleToggle("aiActive", !selectedCamera.aiActive)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-none border ${
                        selectedCamera.aiActive
                          ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                          : "bg-[#1c1b1b] text-[#8f918c] border-[#454843]"
                      }`}
                    >
                      {selectedCamera.aiActive ? "ENABLED" : "DISABLED"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#131313] border border-[#454843]">
                    <span className="text-[#c5c7c1]">Human / Intrusion Detection</span>
                    <button
                      onClick={() =>
                        handleToggle("personDetection", !selectedCamera.personDetection)
                      }
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-none border ${
                        selectedCamera.personDetection
                          ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                          : "bg-[#1c1b1b] text-[#8f918c] border-[#454843]"
                      }`}
                    >
                      {selectedCamera.personDetection ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#131313] border border-[#454843]">
                    <span className="text-[#c5c7c1]">Vehicle / Transport ANPR</span>
                    <button
                      onClick={() =>
                        handleToggle("vehicleDetection", !selectedCamera.vehicleDetection)
                      }
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-none border ${
                        selectedCamera.vehicleDetection
                          ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                          : "bg-[#1c1b1b] text-[#8f918c] border-[#454843]"
                      }`}
                    >
                      {selectedCamera.vehicleDetection ? "ON" : "OFF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#131313] border border-[#454843]">
                    <span className="text-[#c5c7c1]">Firearms & Weapon Contour</span>
                    <button
                      onClick={() =>
                        handleToggle("weaponDetection", !selectedCamera.weaponDetection)
                      }
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-none border ${
                        selectedCamera.weaponDetection
                          ? "bg-[#93000a] text-[#ffdad6] border-[#ffb4ab]"
                          : "bg-[#1c1b1b] text-[#8f918c] border-[#454843]"
                      }`}
                    >
                      {selectedCamera.weaponDetection ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                {/* Thresholds & Trigger Action */}
                <div className="space-y-2.5 p-3.5 bg-[#1c1b1b] border border-[#454843]">
                  <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block">
                    SENSITIVITY & TRIGGER AUTOMATION
                  </span>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8f918c]">Confidence Threshold:</span>
                      <span className="text-[#F5F5F0] font-bold">
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
                      className="w-full accent-[#F5F5F0] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8f918c]">Min Object Size (px):</span>
                      <span className="text-[#F5F5F0] font-bold">
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
                      className="w-full accent-[#F5F5F0] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block">
                      AUTOMATED ESCALATION ACTION:
                    </label>
                    <select
                      value={selectedCamera.triggerAction}
                      onChange={(e) => handleActionChange(e.target.value as TriggerAction)}
                      className="w-full bg-[#131313] border border-[#454843] rounded-none p-2 text-xs text-[#F5F5F0] font-bold focus:border-[#F5F5F0] font-mono"
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
        /* Registry Table */
        <div className="bg-[#131313] border border-[#454843] rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1c1b1b] border-b border-[#454843] text-[10px] text-[#8f918c] uppercase tracking-widest">
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
              <tbody className="divide-y divide-[#454843]">
                {filteredCameras.map((cam) => (
                  <tr
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      setActiveTab("detection_studio");
                    }}
                    className="hover:bg-[#1c1b1b] cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3.5">
                      <StatusPill type={cam.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-bold text-[#F5F5F0]">{cam.id}</td>
                    <td className="py-3 px-3 text-[#c5c7c1] font-semibold">{cam.name}</td>
                    <td className="py-3 px-3 text-[#8f918c]">{cam.sector}</td>
                    <td className="py-3 px-3 uppercase text-[#F5F5F0] font-bold">{cam.type}</td>
                    <td className="py-3 px-3 text-[#F5F5F0] font-bold">{cam.fps} FPS</td>
                    <td className="py-3 px-3 text-[#8f918c]">{cam.resolution}</td>
                    <td className="py-3 px-3 text-[#c5c7c1]">{cam.triggerAction}</td>
                    <td className="py-3 px-3 text-right">
                      <button className="px-3 py-1 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#F5F5F0] border border-[#454843] text-[10px] font-bold uppercase tracking-wider">
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
