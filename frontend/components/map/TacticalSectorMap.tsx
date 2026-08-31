import React, { useState } from "react";
import {
  Camera,
  Alert,
  Guard,
  Sector,
} from "@/lib/types";
import {
  Video,
  ShieldAlert,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Radio,
  Eye,
  Phone,
  Crosshair,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "../shared/StatusPill";
import { tacticalSound } from "@/lib/sound";
import Link from "next/link";

interface TacticalSectorMapProps {
  sectors: Sector[];
  cameras: Camera[];
  alerts: Alert[];
  guards: Guard[];
  onAcknowledgeAlert?: (alertId: string) => void;
  className?: string;
}

export const TacticalSectorMap: React.FC<TacticalSectorMapProps> = ({
  sectors,
  cameras,
  alerts,
  guards,
  onAcknowledgeAlert,
  className,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);

  // Layer Toggles
  const [layers, setLayers] = useState({
    cameras: true,
    guards: true,
    alerts: true,
    tripwires: true,
    fovCones: true,
    geofences: true,
  });

  const toggleLayer = (layerKey: keyof typeof layers) => {
    tacticalSound.playClick();
    setLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Convert GPS coordinates to SVG viewbox coords (0 - 1000, 0 - 600)
  const minLat = 31.615;
  const maxLat = 31.692;
  const minLng = 74.862;
  const maxLng = 74.948;

  const toMapCoords = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50;
    return { x: Math.max(30, Math.min(970, x)), y: Math.max(30, Math.min(570, y)) };
  };

  const filteredCameras =
    selectedSector === "ALL" ? cameras : cameras.filter((c) => c.sector.includes(selectedSector));
  const filteredAlerts =
    selectedSector === "ALL" ? alerts : alerts.filter((a) => a.sector.includes(selectedSector));
  const filteredGuards =
    selectedSector === "ALL" ? guards : guards.filter((g) => g.currentSector?.includes(selectedSector));

  return (
    <div
      className={cn(
        "relative w-full h-[620px] bg-[#131313] border border-[#454843] rounded-none overflow-hidden flex flex-col font-mono select-none shadow-none",
        className
      )}
    >
      {/* Top Map Toolbar */}
      <div className="bg-[#1c1b1b] border-b border-[#454843] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 shrink-0 text-xs">
        {/* Sector Focus Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest">SECTOR FOCUS:</span>
          <select
            value={selectedSector}
            onChange={(e) => {
              tacticalSound.playClick();
              setSelectedSector(e.target.value);
            }}
            className="bg-[#131313] border border-[#454843] rounded-none px-2.5 py-1 text-xs text-[#F5F5F0] font-mono focus:border-[#F5F5F0]"
          >
            <option value="ALL">ALL BORDER SECTORS (ALPHA 1-6)</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.code}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => toggleLayer("cameras")}
            className={cn(
              "px-2 py-0.5 rounded-none text-[10px] border flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
              layers.cameras
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843]"
            )}
          >
            <Video className="w-3 h-3" /> CAMERAS
          </button>

          <button
            onClick={() => toggleLayer("fovCones")}
            className={cn(
              "px-2 py-0.5 rounded-none text-[10px] border flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
              layers.fovCones
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843]"
            )}
          >
            <Eye className="w-3 h-3" /> FOV CONES
          </button>

          <button
            onClick={() => toggleLayer("guards")}
            className={cn(
              "px-2 py-0.5 rounded-none text-[10px] border flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
              layers.guards
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843]"
            )}
          >
            <User className="w-3 h-3" /> SENTRIES
          </button>

          <button
            onClick={() => toggleLayer("alerts")}
            className={cn(
              "px-2 py-0.5 rounded-none text-[10px] border flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
              layers.alerts
                ? "bg-[#93000a] text-[#ffdad6] border-[#ffb4ab]"
                : "bg-[#131313] text-[#8f918c] border-[#454843]"
            )}
          >
            <ShieldAlert className="w-3 h-3" /> ALERTS
          </button>

          <button
            onClick={() => toggleLayer("tripwires")}
            className={cn(
              "px-2 py-0.5 rounded-none text-[10px] border flex items-center gap-1 transition-colors font-bold uppercase tracking-wider",
              layers.tripwires
                ? "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0]"
                : "bg-[#131313] text-[#8f918c] border-[#454843]"
            )}
          >
            <Radio className="w-3 h-3" /> TRIPWIRES
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              tacticalSound.playClick();
              setZoomLevel(Math.min(2.2, zoomLevel + 0.3));
            }}
            className="p-1.5 bg-[#131313] hover:bg-[#2a2a2a] text-[#8f918c] hover:text-[#F5F5F0] rounded-none border border-[#454843]"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              tacticalSound.playClick();
              setZoomLevel(Math.max(0.8, zoomLevel - 0.3));
            }}
            className="p-1.5 bg-[#131313] hover:bg-[#2a2a2a] text-[#8f918c] hover:text-[#F5F5F0] rounded-none border border-[#454843]"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              tacticalSound.playClick();
              setZoomLevel(1);
              setSelectedSector("ALL");
            }}
            className="p-1.5 bg-[#131313] hover:bg-[#2a2a2a] text-[#8f918c] hover:text-[#F5F5F0] rounded-none border border-[#454843]"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Canvas Viewport */}
      <div className="relative flex-1 bg-[#0e0e0e] overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Range rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] border border-[#454843] rounded-full" />
          <div className="w-[500px] h-[500px] border border-[#454843] rounded-full absolute" />
          <div className="w-[750px] h-[750px] border border-[#454843] rounded-full absolute" />
        </div>

        {/* SVG Map Elements */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Zero-Line Border */}
          <path
            d="M 60 50 Q 250 180 500 280 T 940 550"
            className="stroke-[#ffb4ab]/80 stroke-[2] fill-none"
            strokeDasharray="8 6"
          />
          <text x="70" y="45" fill="#ffb4ab" fontSize="10" fontWeight="bold" fontFamily="monospace">
            ZERO LINE // INTERNATIONAL DEMARCATION
          </text>

          {/* Sector Geofence Polygons */}
          {layers.geofences &&
            sectors.map((sector) => {
              const polyPoints = sector.polygon
                .map((p) => {
                  const coords = toMapCoords(p.lat, p.lng);
                  return `${coords.x},${coords.y}`;
                })
                .join(" ");

              const isSectorFocused = selectedSector === "ALL" || selectedSector === sector.code;

              return (
                <g key={sector.id} className="cursor-pointer">
                  <polygon
                    points={polyPoints}
                    className={cn(
                      "transition-all duration-200",
                      isSectorFocused
                        ? "fill-[#454843]/10 stroke-[#8f918c] stroke-[1]"
                        : "fill-transparent stroke-[#454843]/40 stroke-[1]"
                    )}
                  />
                  {sector.polygon[0] && (
                    <text
                      x={toMapCoords(sector.polygon[0].lat, sector.polygon[0].lng).x + 10}
                      y={toMapCoords(sector.polygon[0].lat, sector.polygon[0].lng).y + 20}
                      fill="#F5F5F0"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {sector.code}
                    </text>
                  )}
                </g>
              );
            })}

          {/* Perimeter Tripwires */}
          {layers.tripwires &&
            sectors.flatMap((sector) =>
              sector.tripwires.map((wire) => {
                const start = toMapCoords(wire.start.lat, wire.start.lng);
                const end = toMapCoords(wire.end.lat, wire.end.lng);
                return (
                  <g key={wire.id}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      className={cn(
                        "stroke-[2]",
                        wire.armed ? "stroke-[#F5F5F0] stroke-dasharray-2" : "stroke-[#454843]"
                      )}
                      strokeDasharray="4 4"
                    />
                    <circle cx={start.x} cy={start.y} r="2.5" fill="#F5F5F0" />
                    <circle cx={end.x} cy={end.y} r="2.5" fill="#F5F5F0" />
                  </g>
                );
              })
            )}

          {/* Camera FOV Cones */}
          {layers.fovCones &&
            filteredCameras.map((cam) => {
              const pos = toMapCoords(cam.coordinates.lat, cam.coordinates.lng);
              const angleRad = ((cam.pan || 0) * Math.PI) / 180;
              const fovRad = ((cam.fovAngle || 60) * Math.PI) / 180;
              const radius = 80;

              const x1 = pos.x + radius * Math.sin(angleRad - fovRad / 2);
              const y1 = pos.y - radius * Math.cos(angleRad - fovRad / 2);
              const x2 = pos.x + radius * Math.sin(angleRad + fovRad / 2);
              const y2 = pos.y - radius * Math.cos(angleRad + fovRad / 2);

              return (
                <path
                  key={`fov-${cam.id}`}
                  d={`M ${pos.x} ${pos.y} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                  className="fill-[#F5F5F0]/5 stroke-[#F5F5F0]/20 stroke-[1] pointer-events-none"
                />
              );
            })}

          {/* Camera Marker Pins */}
          {layers.cameras &&
            filteredCameras.map((cam) => {
              const pos = toMapCoords(cam.coordinates.lat, cam.coordinates.lng);
              const isSelected = selectedCamera?.id === cam.id;

              return (
                <g
                  key={cam.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    tacticalSound.playClick();
                    setSelectedCamera(cam);
                    setSelectedAlert(null);
                    setSelectedGuard(null);
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    r="8"
                    className={cn(
                      "transition-all",
                      isSelected
                        ? "fill-[#F5F5F0] stroke-[#121212] stroke-2"
                        : "fill-[#1c1b1b] stroke-[#8f918c] stroke-[1] hover:stroke-[#F5F5F0]"
                    )}
                  />
                  <text
                    x="12"
                    y="4"
                    fill={isSelected ? "#F5F5F0" : "#8f918c"}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {cam.id}
                  </text>
                </g>
              );
            })}

          {/* Guard Patrol Pins */}
          {layers.guards &&
            filteredGuards.map((guard, idx) => {
              const matchingSector = sectors.find(
                (s) => s.code === guard.currentSector || s.name.includes(guard.currentSector || "")
              );
              const baseCoord = matchingSector?.polygon[0] || {
                lat: 31.65 + ((idx * 0.012) % 0.04),
                lng: 74.88 + ((idx * 0.015) % 0.05),
              };
              const pos = toMapCoords(
                baseCoord.lat + (((idx % 3) - 1) * 0.004),
                baseCoord.lng + (((idx % 2) - 0.5) * 0.004)
              );
              const isSelected = selectedGuard?.id === guard.id;

              return (
                <g
                  key={guard.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => {
                    tacticalSound.playClick();
                    setSelectedGuard(guard);
                    setSelectedCamera(null);
                    setSelectedAlert(null);
                  }}
                  className="cursor-pointer"
                >
                  <rect
                    x="-6"
                    y="-6"
                    width="12"
                    height="12"
                    className={cn(
                      "transition-all",
                      isSelected
                        ? "fill-[#F5F5F0] stroke-[#121212] stroke-2"
                        : "fill-[#1c1b1b] stroke-[#8f918c] stroke-[1]"
                    )}
                  />
                  <text
                    x="10"
                    y="3"
                    fill="#c5c7c1"
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {guard.callSign}
                  </text>
                </g>
              );
            })}

          {/* Active Alert Threat Blips */}
          {layers.alerts &&
            filteredAlerts
              .filter((a) => a.status === "open")
              .map((alert) => {
                const pos = toMapCoords(alert.coordinates.lat, alert.coordinates.lng);
                const isSelected = selectedAlert?.id === alert.id;

                return (
                  <g
                    key={alert.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => {
                      tacticalSound.playAlert();
                      setSelectedAlert(alert);
                      setSelectedCamera(null);
                      setSelectedGuard(null);
                    }}
                    className="cursor-pointer"
                  >
                    <circle r="12" className="fill-[#93000a]/40 stroke-[#ffb4ab] stroke-[1] animate-ping" />
                    <circle r="6" className="fill-[#93000a] stroke-[#ffb4ab] stroke-2" />
                    <text
                      x="14"
                      y="4"
                      fill="#ffb4ab"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      THREAT: {alert.eventType}
                    </text>
                  </g>
                );
              })}
        </svg>

        {/* Selected Inspector Panel */}
        {(selectedCamera || selectedAlert || selectedGuard) && (
          <div className="absolute bottom-4 left-4 max-w-sm w-full bg-[#1c1b1b] border border-[#454843] p-4 text-xs z-30 font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-[#454843] pb-2">
              <span className="font-bold text-[#F5F5F0] uppercase tracking-wider">
                {selectedCamera
                  ? `SENSOR // ${selectedCamera.id}`
                  : selectedAlert
                  ? `THREAT // ${selectedAlert.id}`
                  : `SENTRY // ${selectedGuard?.callSign}`}
              </span>
              <button
                onClick={() => {
                  setSelectedCamera(null);
                  setSelectedAlert(null);
                  setSelectedGuard(null);
                }}
                className="text-[#8f918c] hover:text-[#F5F5F0]"
              >
                ✕
              </button>
            </div>

            {selectedCamera && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#c5c7c1]">
                  <div>NAME: {selectedCamera.name}</div>
                  <div>SECTOR: {selectedCamera.sector}</div>
                  <div>STATUS: <strong className="text-[#F5F5F0]">{selectedCamera.status.toUpperCase()}</strong></div>
                </div>
                <Link
                  href="/live-feed"
                  className="block text-center py-1.5 bg-[#F5F5F0] text-[#121212] font-bold text-[10px] uppercase tracking-wider hover:opacity-90"
                >
                  OPEN STREAM VIEW →
                </Link>
              </div>
            )}

            {selectedAlert && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#c5c7c1]">
                  <div className="text-[#ffdad6] font-bold">{selectedAlert.eventType}</div>
                  <div>SECTOR: {selectedAlert.sector}</div>
                  <div>CONFIDENCE: {selectedAlert.confidence}%</div>
                </div>
                {onAcknowledgeAlert && selectedAlert.status === "open" && (
                  <button
                    onClick={() => {
                      onAcknowledgeAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="w-full py-1.5 bg-[#F5F5F0] text-[#121212] font-bold text-[10px] uppercase tracking-wider hover:opacity-90"
                  >
                    ACKNOWLEDGE INCIDENT
                  </button>
                )}
              </div>
            )}

            {selectedGuard && (
              <div className="space-y-2">
                <div className="text-[11px] text-[#c5c7c1]">
                  <div className="font-bold text-[#F5F5F0]">{selectedGuard.name} ({selectedGuard.rank})</div>
                  <div>POST: {selectedGuard.currentPostId || "Sector Patrol"}</div>
                  <div>PHONE: {selectedGuard.phone}</div>
                </div>
                <a
                  href={`tel:${selectedGuard.phone.replace(/\s+/g, "")}`}
                  className="block text-center py-1.5 bg-[#F5F5F0] text-[#121212] font-bold text-[10px] uppercase tracking-wider hover:opacity-90"
                >
                  CALL SENTRY
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coordinate & GIS Status Footer */}
      <div className="bg-[#131313] border-t border-[#454843] px-4 py-2 flex items-center justify-between text-[10px] text-[#8f918c]">
        <div>COORDINATES: LAT 31.6540° N // LON 74.9050° E</div>
        <div className="flex items-center gap-2">
          <span>GIS_RADAR_ACTIVE</span>
        </div>
      </div>
    </div>
  );
};
