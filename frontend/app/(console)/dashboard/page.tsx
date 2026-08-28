"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Video,
  Activity,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Shield,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { TacticalCard } from "@/components/shared/TacticalCard";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { StatusPill } from "@/components/shared/StatusPill";
import { CameraVideoFeed } from "@/components/video/CameraVideoFeed";
import { formatTimeIST, calculateTimeRemaining } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";

export default function DashboardPage() {
  const {
    alerts,
    cameras,
    guards,
    acknowledgeAlert,
    escalateAlert,
    defconLevel,
  } = useIBVAPStore();

  const openAlerts = alerts.filter((a) => a.status === "open");
  const criticalAlerts = alerts.filter((a) => a.status === "open" && a.level === "critical");
  const onlineCameras = cameras.filter((c) => c.status === "online");
  const onDutyGuards = guards.filter(
    (g) => g.status === "on_post" || g.status === "patrolling" || g.status === "unreachable"
  );

  const previewCameras = cameras.slice(0, 4);
  const unstaffedGuardCount = Math.max(guards.length - onDutyGuards.length, 0);

  return (
    <div className="space-y-5 font-mono">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">
              BORDER COMMAND DASHBOARD // CONFIGURED AREA
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Live automated surveillance overview & on-duty guard post readiness.
            </p>
          </div>
        </div>

        {/* Quick Link to Guard Duty */}
        <Link href="/guard-duty">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-950 hover:bg-amber-900 border border-amber-500 rounded text-xs font-black text-amber-200 transition-colors min-h-[40px]">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>{guards.length > 0 ? `${onDutyGuards.length}/${guards.length} POSTS ON DUTY` : "NO ROSTER DATA"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* 4 Large High-Contrast KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Alerts KPI */}
        <Link href="/alerts" className="block group">
          <div className="p-4 bg-slate-900 border border-slate-800 hover:border-rose-500 rounded transition-all shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase">ACTIVE THREATS</span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-rose-400">{openAlerts.length}</span>
              <span className="text-xs text-rose-300 font-bold">
                {criticalAlerts.length} Critical
              </span>
            </div>
            <span className="text-[11px] text-cyan-400 mt-2 block group-hover:underline">
              View Threat Log →
            </span>
          </div>
        </Link>

        {/* Sentry Posts KPI */}
        <Link href="/guard-duty" className="block group">
          <div className="p-4 bg-slate-900 border border-slate-800 hover:border-amber-500 rounded transition-all shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase">SENTRY POSTS</span>
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-amber-300">{onDutyGuards.length} / {guards.length}</span>
              <span className="text-xs text-amber-300 font-bold">{guards.length > 0 ? `${unstaffedGuardCount} Unstaffed` : "No roster"}</span>
            </div>
            <span className="text-[11px] text-cyan-400 mt-2 block group-hover:underline">
              Manage Roster →
            </span>
          </div>
        </Link>

        {/* Cameras KPI */}
        <Link href="/live-feed" className="block group">
          <div className="p-4 bg-slate-900 border border-slate-800 hover:border-cyan-500 rounded transition-all shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 uppercase">CAMERAS ONLINE</span>
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-black text-cyan-300">
                {onlineCameras.length}/{cameras.length}
              </span>
              <span className="text-xs text-emerald-400 font-bold">{cameras.length} Configured</span>
            </div>
            <span className="text-[11px] text-cyan-400 mt-2 block group-hover:underline">
              Open Camera Matrix →
            </span>
          </div>
        </Link>

        {/* DEFCON KPI */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300 uppercase">DEFENSE LEVEL</span>
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-100">DEFCON {defconLevel}</span>
            <span className="text-xs text-emerald-400 font-bold">API reported</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            System state from Django
          </span>
        </div>
      </div>

      {/* Row 2: Live Alert Feed & Mini Camera Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Mini Live Matrix (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                LIVE CAMERA STREAMS
              </h2>
            </div>
            <Link
              href="/live-feed"
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold"
            >
              {cameras.length > 0 ? `View ${cameras.length} Cameras →` : "Open Live Camera →"}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {previewCameras.map((cam) => (
              <CameraVideoFeed
                key={cam.id}
                camera={cam}
                showBoundingBoxes={true}
                className="aspect-video"
              />
            ))}
            {previewCameras.length === 0 && (
              <div className="sm:col-span-2 p-8 bg-slate-900 border border-slate-800 rounded text-center text-xs text-slate-400">
                No backend CCTV cameras are configured. Use Live Cameras to preview the local browser camera.
              </div>
            )}
          </div>
        </div>

        {/* Real-time Threat Action Feed (1 col) */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                UNRESOLVED THREATS
              </h2>
            </div>
            <Link href="/alerts" className="text-xs text-cyan-400 hover:underline font-bold">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2"
              >
                <div className="flex items-center justify-between">
                  <StatusPill type={alert.level} size="sm" />
                  <span className="text-[10px] text-cyan-400 font-bold">
                    {formatTimeIST(alert.timestamp)}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-100 truncate">
                    {alert.eventType}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                    {alert.notes}
                  </p>
                </div>

                {alert.status === "open" ? (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="py-2 px-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-[11px] font-black min-h-[38px]"
                    >
                      ACKNOWLEDGE
                    </button>
                    <button
                      onClick={() => escalateAlert(alert.id)}
                      className="py-2 px-2 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500 rounded text-[11px] font-black min-h-[38px]"
                    >
                      ESCALATE (QRF)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span>Status: {alert.status.toUpperCase()}</span>
                    <span>by {alert.acknowledgedBy}</span>
                  </div>
                )}
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">No alerts received from Django.</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: On Duty Sentries Quick Action List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
              ON-DUTY SENTRIES (1-TAP CALL & HANDOVER)
            </h2>
          </div>
          <Link href="/guard-duty" className="text-xs text-cyan-400 hover:underline font-bold">
            Full Guard Duty & Audit →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {onDutyGuards.slice(0, 4).map((guard) => {
            const countdown = calculateTimeRemaining(guard.shiftEnd);
            return (
              <div
                key={guard.id}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <StatusPill type={guard.status} size="sm" />
                    <span className="text-[10px] text-slate-400 font-bold">{guard.callSign}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-100 mt-2 truncate">
                    {guard.name}
                  </h4>
                  <p className="text-[11px] text-cyan-300 font-bold mt-0.5">
                    {guard.currentPostId || "Sector Patrol"}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">{countdown.text}</p>
                </div>

                <a
                  href={`tel:${guard.phone.replace(/\s+/g, "")}`}
                  onClick={() => tacticalSound.playClick()}
                  className="py-2.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-xs font-black flex items-center justify-center gap-2 min-h-[42px] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CALL SENTRY</span>
                </a>
              </div>
            );
          })}
          {onDutyGuards.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-4 p-8 bg-slate-900 border border-slate-800 rounded text-center text-xs text-slate-500">
              No guard roster records received from Django.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
