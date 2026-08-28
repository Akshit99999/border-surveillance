"use client";

import React from "react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { TacticalSectorMap } from "@/components/map/TacticalSectorMap";
import { TacticalCard } from "@/components/shared/TacticalCard";
import { MapPin, Shield, Radio, Video, Users, AlertTriangle } from "lucide-react";
import { StatusPill } from "@/components/shared/StatusPill";

export default function MapPage() {
  const { sectors, cameras, alerts, guards, acknowledgeAlert } = useIBVAPStore();

  const totalPosts = sectors.reduce((acc, s) => acc + s.postsCount, 0);
  const staffedPosts = sectors.reduce((acc, s) => acc + s.staffedCount, 0);
  const totalTripwires = sectors.reduce((acc, s) => acc + s.tripwires.length, 0);
  const armedTripwires = sectors.reduce(
    (acc, s) => acc + s.tripwires.filter((t) => t.armed).length,
    0
  );

  return (
    <div className="space-y-4 font-mono">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950/80 border border-cyan-500/60 flex items-center justify-center text-cyan-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-widest">
              SECTOR INTELLIGENCE GIS MAP // ZERO-LINE DEMARCATION
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live geospatial coordinate overlay of sensors, sentry patrol pins, and tripwires.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill type="high" label="1 SECTOR GAP (A4)" size="sm" />
          <StatusPill type="online" label="GIS SYNCHRONIZED" size="sm" />
        </div>
      </div>

      {/* Main Interactive Map */}
      <TacticalSectorMap
        sectors={sectors}
        cameras={cameras}
        alerts={alerts}
        guards={guards}
        onAcknowledgeAlert={acknowledgeAlert}
        className="h-[640px]"
      />

      {/* Sector Intelligence Breakdown Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TacticalCard title="SENTRY POSTS STAFFED" subtitle="HUMAN COVERAGE">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-amber-300">
              {staffedPosts} of {totalPosts}
            </span>
            <span className="text-xs text-slate-400">1 Deficit (Post #A4)</span>
          </div>
        </TacticalCard>

        <TacticalCard title="TACTICAL CAMERAS" subtitle="FOV COVERAGE">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-cyan-300">
              {cameras.length} Sensors
            </span>
            <span className="text-xs text-slate-400">6 PTZ • 4 Thermal</span>
          </div>
        </TacticalCard>

        <TacticalCard title="PERIMETER TRIPWIRES" subtitle="SEISMIC & OPTICAL">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-emerald-400">
              {armedTripwires} / {totalTripwires} Armed
            </span>
            <span className="text-xs text-slate-400">Active Breakbeams</span>
          </div>
        </TacticalCard>

        <TacticalCard title="ACTIVE THREAT ALERTS" subtitle="GIS BLIPS">
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-rose-400">
              {alerts.filter((a) => a.status === "open").length} Active
            </span>
            <span className="text-xs text-rose-400 font-bold">Pulsing Blips</span>
          </div>
        </TacticalCard>
      </div>
    </div>
  );
}
