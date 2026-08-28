import React, { useState } from "react";
import {
  Camera,
  Alert,
  Guard,
  Sector,
  Tripwire,
} from "@/lib/types";
import {
  Video,
  ShieldAlert,
  User,
  Layers,
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

  // Convert GPS coordinates (lat: 31.61 - 31.69, lng: 74.86 - 74.95) to SVG viewbox coords (0 - 1000, 0 - 600)
  const minLat = 31.615;
  const maxLat = 31.692;
  const minLng = 74.862;
  const maxLng = 74.948;

  const toMapCoords = (lat: number, lng: number): { x: number; y: number } => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 500 + 50; // Inverted Y for map
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
        "relative w-full h-[620px] bg-slate-950 border border-slate-800 rounded-sm overflow-hidden flex flex-col font-mono select-none shadow-2xl",
        className
      )}
    >
      {/* Top Map Toolbar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-20 shrink-0 text-xs">
        {/* Left: Sector Focus Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase">SECTOR FOCUS:</span>
          <select
            value={selectedSector}
            onChange={(e) => {
              tacticalSound.playClick();
              setSelectedSector(e.target.value);
            }}
            className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">ALL BORDER SECTORS (ALPHA 1-6)</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.code}>
                {s.code}: {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center: Quick Layer Toggles */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => toggleLayer("cameras")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors",
              layers.cameras
                ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            <Video className="w-3 h-3" /> CAMERAS
          </button>

          <button
            onClick={() => toggleLayer("fovCones")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors",
              layers.fovCones
                ? "bg-cyan-950 text-cyan-300 border-cyan-500"
                : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            <Eye className="w-3 h-3" /> FOV CONES
          </button>

          <button
            onClick={() => toggleLayer("guards")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors",
              layers.guards
                ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            <User className="w-3 h-3" /> SENTRIES
          </button>

          <button
            onClick={() => toggleLayer("alerts")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors",
              layers.alerts
                ? "bg-rose-950 text-rose-300 border-rose-500"
                : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            <ShieldAlert className="w-3 h-3" /> ALERTS
          </button>

          <button
            onClick={() => toggleLayer("tripwires")}
            className={cn(
              "px-2 py-0.5 rounded text-[10px] border flex items-center gap-1 transition-colors",
              layers.tripwires
                ? "bg-amber-950 text-amber-300 border-amber-500"
                : "bg-slate-900 text-slate-500 border-slate-800"
            )}
          >
            <Radio className="w-3 h-3" /> TRIPWIRES
          </button>
        </div>

        {/* Right: Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              tacticalSound.playClick();
              setZoomLevel(Math.min(2.2, zoomLevel + 0.3));
            }}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              tacticalSound.playClick();
              setZoomLevel(Math.max(0.8, zoomLevel - 0.3));
            }}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
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
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
            title="Reset Map View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Tactical Canvas Viewport */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Tactical Radar Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40f_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40f_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Radar concentric range rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[300px] h-[300px] border border-cyan-500/40 rounded-full" />
          <div className="w-[500px] h-[500px] border border-cyan-500/30 rounded-full absolute" />
          <div className="w-[750px] h-[750px] border border-cyan-500/20 rounded-full absolute" />
        </div>

        {/* Radar Sweep Line Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 overflow-hidden">
          <div className="w-[800px] h-[800px] rounded-full border border-cyan-500/20 animate-radar-sweep bg-gradient-to-tr from-transparent via-cyan-500/10 to-transparent" />
        </div>

        {/* SVG Interactive Map Elements */}
        <svg
          viewBox="0 0 1000 600"
          className="absolute inset-0 w-full h-full transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Zero-Line Border (Tactical demarcation boundary) */}
          <path
            d="M 60 50 Q 250 180 500 280 T 940 550"
            className="stroke-rose-600/60 stroke-[3] stroke-dasharray-4 fill-none"
            strokeDasharray="8 6"
          />
          <text x="70" y="45" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="monospace">
            ZERO LINE / INTERNATIONAL BORDER BOUNDARY
          </text>

          {/* Sector Geofence Polygons */}
          {layers.geofences &&
            sectors.map((sector) => {
              const polyPoints = sector.polygon
                .map((p) => {
                  const pt = toMapCoords(p.lat, p.lng);
                  return `${pt.x},${pt.y}`;
                })
                .join(" ");

              const center = toMapCoords(sector.centerCoordinates.lat, sector.centerCoordinates.lng);

              return (
                <g key={sector.id} className="cursor-pointer group">
                  <polygon
                    points={polyPoints}
                    className={cn(
                      "transition-all duration-200 stroke-cyan-500/40 stroke-[1.2]",
                      selectedSector === sector.code
                        ? "fill-cyan-500/25 stroke-cyan-400 stroke-[2]"
                        : "fill-cyan-950/20 hover:fill-cyan-900/30"
                    )}
                    onClick={() => {
                      tacticalSound.playClick();
                      setSelectedSector(sector.code);
                    }}
                  />
                  <text
                    x={center.x}
                    y={center.y}
                    textAnchor="middle"
                    fill="#38bdf8"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none drop-shadow"
                  >
                    {sector.code}
                  </text>
                  <text
                    x={center.x}
                    y={center.y + 14}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                    fontFamily="monospace"
                    className="pointer-events-none"
                  >
                    {sector.staffedCount}/{sector.postsCount} POSTS
                  </text>
                </g>
              );
            })}

          {/* Tripwire Sensors */}
          {layers.tripwires &&
            sectors.flatMap((sec) =>
              sec.tripwires.map((tw) => {
                const pStart = toMapCoords(tw.start.lat, tw.start.lng);
                const pEnd = toMapCoords(tw.end.lat, tw.end.lng);
                return (
                  <g key={tw.id}>
                    <line
                      x1={pStart.x}
                      y1={pStart.y}
                      x2={pEnd.x}
                      y2={pEnd.y}
                      className={cn(
                        "stroke-[2]",
                        tw.armed ? "stroke-amber-400/80 stroke-dasharray-2" : "stroke-slate-600/60"
                      )}
                      strokeDasharray="4 4"
                    />
                    <circle cx={pStart.x} cy={pStart.y} r="2.5" className="fill-amber-400" />
                    <circle cx={pEnd.x} cy={pEnd.y} r="2.5" className="fill-amber-400" />
                  </g>
                );
              })
            )}

          {/* Camera Field of View (FOV) Cones */}
          {layers.cameras &&
            layers.fovCones &&
            filteredCameras.map((cam) => {
              if (cam.status === "signal_lost") return null;
              const pos = toMapCoords(cam.coordinates.lat, cam.coordinates.lng);
              const angleRad = ((cam.pan || 45) * Math.PI) / 180;
              const fovSpan = ((cam.fovAngle || 80) * Math.PI) / 180;
              const range = 65;

              const p1x = pos.x + range * Math.cos(angleRad - fovSpan / 2);
              const p1y = pos.y + range * Math.sin(angleRad - fovSpan / 2);
              const p2x = pos.x + range * Math.cos(angleRad + fovSpan / 2);
              const p2y = pos.y + range * Math.sin(angleRad + fovSpan / 2);

              return (
                <path
                  key={`fov-${cam.id}`}
                  d={`M ${pos.x} ${pos.y} L ${p1x} ${p1y} A ${range} ${range} 0 0 1 ${p2x} ${p2y} Z`}
                  className="fill-cyan-400/15 stroke-cyan-400/30 stroke-[0.5] pointer-events-none"
                />
              );
            })}

          {/* Camera Markers */}
          {layers.cameras &&
            filteredCameras.map((cam) => {
              const pos = toMapCoords(cam.coordinates.lat, cam.coordinates.lng);
              const isSelected = selectedCamera?.id === cam.id;
              const isSignalLost = cam.status === "signal_lost";

              return (
                <g
                  key={cam.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer"
                  onClick={() => {
                    tacticalSound.playClick();
                    setSelectedCamera(cam);
                    setSelectedAlert(null);
                    setSelectedGuard(null);
                  }}
                >
                  <circle
                    r="8"
                    className={cn(
                      "transition-all duration-200 stroke-2",
                      isSignalLost
                        ? "fill-rose-950 stroke-rose-500 animate-ping"
                        : isSelected
                        ? "fill-cyan-400 stroke-white shadow-lg"
                        : "fill-slate-900 stroke-cyan-400 hover:fill-cyan-950"
                    )}
                  />
                  <circle r="3" className={isSignalLost ? "fill-rose-400" : "fill-cyan-300"} />
                  <text
                    x="11"
                    y="3"
                    fill="#38bdf8"
                    fontSize="8"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {cam.id.split("-").slice(1).join("-")}
                  </text>
                </g>
              );
            })}

          {/* Guard Patrol Markers */}
          {layers.guards &&
            filteredGuards.map((guard) => {
              if (guard.status === "off_duty") return null;
              // Guard coordinates approximated near post or sector
              const post = sectors.flatMap((s) => s.posts).find((p) => p.id === guard.currentPostId);
              const baseCoords = post?.coordinates || { lat: 31.6234, lng: 74.8712 };
              const pos = toMapCoords(baseCoords.lat, baseCoords.lng);
              const isSelected = selectedGuard?.id === guard.id;

              return (
                <g
                  key={guard.id}
                  transform={`translate(${pos.x + 8}, ${pos.y - 8})`}
                  className="cursor-pointer"
                  onClick={() => {
                    tacticalSound.playClick();
                    setSelectedGuard(guard);
                    setSelectedCamera(null);
                    setSelectedAlert(null);
                  }}
                >
                  <circle
                    r="6"
                    className={cn(
                      "stroke-2",
                      guard.status === "unreachable"
                        ? "fill-rose-950 stroke-rose-500 animate-pulse"
                        : isSelected
                        ? "fill-emerald-400 stroke-white"
                        : "fill-slate-900 stroke-emerald-400 hover:fill-emerald-950"
                    )}
                  />
                  <circle
                    r="2.5"
                    className={guard.status === "unreachable" ? "fill-rose-400" : "fill-emerald-300"}
                  />
                </g>
              );
            })}

          {/* Active Alert Radar Markers */}
          {layers.alerts &&
            filteredAlerts
              .filter((a) => a.status === "open" || a.status === "escalated")
              .map((alert) => {
                const pos = toMapCoords(alert.coordinates.lat, alert.coordinates.lng);
                const isCritical = alert.level === "critical";

                return (
                  <g
                    key={alert.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="cursor-pointer"
                    onClick={() => {
                      tacticalSound.playAlert();
                      setSelectedAlert(alert);
                      setSelectedCamera(null);
                      setSelectedGuard(null);
                    }}
                  >
                    {/* Concentric pulsing threat rings */}
                    <circle
                      r="14"
                      className={cn(
                        "animate-ping opacity-40",
                        isCritical ? "fill-rose-500" : "fill-amber-500"
                      )}
                    />
                    <circle
                      r="9"
                      className={cn(
                        "stroke-2",
                        isCritical
                          ? "fill-rose-900 stroke-rose-400 shadow-[0_0_15px_#f43f5e]"
                          : "fill-amber-900 stroke-amber-400"
                      )}
                    />
                    <circle r="3" className="fill-white animate-pulse" />
                    <text
                      x="12"
                      y="-4"
                      fill={isCritical ? "#f43f5e" : "#fbbf24"}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      ! {alert.eventType.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
        </svg>

        {/* Selected Camera Drawer / Popup */}
        {selectedCamera && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-slate-950 border border-cyan-500/60 rounded p-3 shadow-2xl animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-100 truncate">{selectedCamera.id}</h4>
              </div>
              <button
                onClick={() => setSelectedCamera(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-1.5">
              <p className="text-slate-300 font-semibold">{selectedCamera.name}</p>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Sector:</span>
                <span className="text-cyan-300">{selectedCamera.sector}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Status:</span>
                <StatusPill type={selectedCamera.status} size="sm" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>GPS Coords:</span>
                <span className="text-slate-300 font-mono">
                  {selectedCamera.coordinates.lat.toFixed(4)}°N, {selectedCamera.coordinates.lng.toFixed(4)}°E
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              <Link
                href="/live-feed"
                className="flex-1 py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-600 rounded text-center text-xs font-bold"
              >
                VIEW LIVE MATRIX
              </Link>
              <Link
                href="/camera-management"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs"
              >
                CONFIG
              </Link>
            </div>
          </div>
        )}

        {/* Selected Alert Drawer / Popup */}
        {selectedAlert && (
          <div className="absolute top-4 right-4 z-30 w-84 bg-slate-950 border-2 border-rose-500/80 rounded p-3.5 shadow-2xl animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-rose-900/60 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                <h4 className="text-xs font-bold text-rose-300">{selectedAlert.id}</h4>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <StatusPill type={selectedAlert.level} size="sm" />
              <h5 className="font-bold text-slate-100">{selectedAlert.eventType}</h5>
              <p className="text-[11px] text-slate-400">{selectedAlert.notes}</p>

              <div className="py-1.5 px-2 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="text-emerald-400 font-bold">{selectedAlert.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Source:</span>
                  <span className="text-cyan-300">{selectedAlert.sourceCameraId}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              {selectedAlert.status === "open" && (
                <button
                  onClick={() => {
                    if (onAcknowledgeAlert) onAcknowledgeAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 rounded text-center text-xs font-bold"
                >
                  ACKNOWLEDGE
                </button>
              )}
              <Link
                href="/alerts"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-xs"
              >
                FULL LOG
              </Link>
            </div>
          </div>
        )}

        {/* Selected Guard Drawer / Popup */}
        {selectedGuard && (
          <div className="absolute top-4 right-4 z-30 w-80 bg-slate-950 border border-emerald-500/60 rounded p-3.5 shadow-2xl animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-100">{selectedGuard.name}</h4>
              </div>
              <button
                onClick={() => setSelectedGuard(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{selectedGuard.rank}</span>
                <StatusPill type={selectedGuard.status} size="sm" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Callsign:</span>
                <span className="text-amber-300 font-bold">{selectedGuard.callSign}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Current Post:</span>
                <span className="text-cyan-300">{selectedGuard.currentPostId || "Patrol"}</span>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-2">
              <a
                href={`tel:${selectedGuard.phone.replace(/\s+/g, "")}`}
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-center text-xs flex items-center justify-center gap-1"
              >
                <Phone className="w-3 h-3 text-cyan-400" /> CALL
              </a>
              <Link
                href={`/guard-duty/${selectedGuard.id}`}
                className="flex-1 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600 rounded text-center text-xs font-bold"
              >
                DOSSIER
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="bg-slate-950/95 border-t border-slate-800 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-400 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <span>LAT: 31.6234°N to 31.6880°N</span>
          <span>LNG: 74.8712°E to 74.9420°E</span>
          <span className="text-emerald-400 font-semibold">GIS PROJECTION: EPSG:4326</span>
        </div>
        <div>
          <span>TOTAL ASSETS: {cameras.length} CAMS • {guards.length} GUARDS • 6 SECTORS</span>
        </div>
      </div>
    </div>
  );
};
