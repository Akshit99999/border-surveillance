"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Video,
  Users,
  Activity,
  Zap,
  Lock,
  ArrowRight,
  Crosshair,
  Wifi,
  Eye,
  AlertTriangle,
  Play,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  Database,
  Radio,
} from "lucide-react";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { StatusPill } from "@/components/shared/StatusPill";
import { tacticalSound } from "@/lib/sound";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"surveillance" | "guard_duty" | "edge_resilience">("guard_duty");
  const [simulatedInfiltration, setSimulatedInfiltration] = useState(false);

  const triggerThreatSim = () => {
    tacticalSound.playAlert();
    setSimulatedInfiltration(true);
    setTimeout(() => setSimulatedInfiltration(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Marketing Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-mono text-sm font-black tracking-widest text-slate-100 uppercase">
                IBVAP
              </span>
              <span className="font-mono text-[10px] text-cyan-400 block tracking-wider leading-none">
                INTELLIGENT BORDER OS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 font-mono text-xs text-slate-300">
            <a href="#capabilities" className="hover:text-cyan-400 transition-colors">
              CORE MODULES
            </a>
            <a href="#guard-duty-system" className="hover:text-cyan-400 transition-colors">
              HUMAN ACCOUNTABILITY
            </a>
            <a href="#architecture" className="hover:text-cyan-400 transition-colors">
              EDGE ARCHITECTURE
            </a>
            <a href="#simulator" className="hover:text-cyan-400 transition-colors">
              LIVE SIMULATOR
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="font-mono text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded"
            >
              Sign In
            </Link>
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                LAUNCH CONSOLE
              </TacticalButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Background Glowing Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Operational Ready • Defense Grade Video Analytics Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-5xl mx-auto leading-tight font-mono">
            Intelligent Border Video Analytics & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Guard Accountability System
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto font-sans leading-relaxed">
            A mission-critical command console bridging multi-zone computer vision, real-time tactical matrix surveillance, and an append-only guard duty human-accountability layer for national security and border defense.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="lg" icon={<Play className="w-4 h-4 fill-current" />}>
                ENTER LIVE COMMAND CENTER
              </TacticalButton>
            </Link>
            <Link href="/guard-duty">
              <TacticalButton variant="secondary" size="lg" icon={<Users className="w-4 h-4" />}>
                EXPLORE GUARD ROSTER & AUDIT
              </TacticalButton>
            </Link>
          </div>

          {/* Live Telemetry Ticker */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">SECTORS MONITORED</span>
              <span className="text-xl font-bold text-cyan-300">6 Sectors (Alpha 1–6)</span>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">ACTIVE CAMERA MATRIX</span>
              <span className="text-xl font-bold text-emerald-400">15 PTZ / Thermal</span>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">HUMAN SENTRY POSTS</span>
              <span className="text-xl font-bold text-amber-400">5 of 6 Staffed</span>
            </div>
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 block uppercase">EDGE LATENCY</span>
              <span className="text-xl font-bold text-sky-400">&lt; 18ms In-Mesh</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Threat Simulator Showcase */}
      <section id="simulator" className="py-16 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              INTERACTIVE THREAT SIMULATOR
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-100 font-mono">
              Experience Real-Time AI Detection & Human Sentry Dispatch
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Trigger a simulated night stealth incursion to witness automated AI classification, sector tripwire tripping, and guard duty escalation.
            </p>
          </div>

          {/* Simulator Console Mockup */}
          <div className="bg-slate-950 border border-slate-700 rounded-sm shadow-2xl p-4 sm:p-6 max-w-5xl mx-auto relative overflow-hidden font-mono">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-cyan-300">SIMULATOR NODE: SECTOR ALPHA-2</span>
              </div>
              <div className="flex items-center gap-2">
                <TacticalButton
                  variant={simulatedInfiltration ? "danger" : "primary"}
                  size="sm"
                  onClick={triggerThreatSim}
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                >
                  {simulatedInfiltration ? "INCURSION IN PROGRESS..." : "SIMULATE PERIMETER BREACH"}
                </TacticalButton>
              </div>
            </div>

            {/* Viewport Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Video Tile */}
              <div className="md:col-span-2 relative aspect-video bg-slate-900 border border-slate-800 rounded overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[radial-gradient(#06b6d412_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute top-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-cyan-300">
                  CAM-A02-WEST • PTZ CULVERT
                </div>

                {simulatedInfiltration ? (
                  <div className="relative z-10 text-center animate-in zoom-in-95">
                    <div className="w-36 h-48 border-2 border-rose-500 bg-rose-950/40 rounded flex flex-col items-center justify-between p-2 shadow-[0_0_20px_#f43f5e] animate-pulse">
                      <span className="text-[9px] bg-rose-600 text-white px-1 font-bold">
                        BREACH DETECTED [97.8%]
                      </span>
                      <span className="text-xs text-rose-300 font-bold">WEAPON PROFILE #AK-203</span>
                      <span className="text-[9px] text-slate-300">TRACK_ID: #INFIL-88</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs">
                    <Crosshair className="w-10 h-10 mx-auto mb-2 opacity-40 text-cyan-400" />
                    <span>PERIMETER SECURE • STANDBY READY</span>
                  </div>
                )}
              </div>

              {/* Real-time Reaction Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded p-3 text-xs flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    SECTOR DISPATCH PROTOCOL
                  </span>
                  <div className="mt-2 space-y-2">
                    <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-[10px] text-slate-400 block">ON-DUTY SENTRY:</span>
                      <span className="font-bold text-slate-200">Head Constable Vikram Singh</span>
                      <span className="text-[10px] text-cyan-400 block">Callsign: ALPHA-7-NINER</span>
                    </div>

                    <div className="p-2 bg-slate-950 border border-slate-800 rounded">
                      <span className="text-[10px] text-slate-400 block">SYSTEM ACTION:</span>
                      <span className={simulatedInfiltration ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                        {simulatedInfiltration ? "QRF DISPATCHED & ALARM ACTIVE" : "MONITORING (NORMAL)"}
                      </span>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard">
                  <TacticalButton variant="outline" size="sm" className="w-full">
                    VIEW FULL TELEMETRY
                  </TacticalButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Human Accountability & Guard Duty Highlight */}
      <section id="guard-duty-system" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs uppercase mb-4">
              <Users className="w-3.5 h-3.5" />
              <span>THE HUMAN ACCOUNTABILITY LAYER</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 font-mono leading-tight">
              Surveillance AI Is Only as Strong as Human Follow-Through
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Standard AI demos stop at drawing bounding boxes. IBVAP integrates a complete, immutable **Guard Duty & Roster System** linking every sensor detection to the exact sentry on post, enforcing verified shift handovers, and recording append-only audit trails for mission-grade accountability.
            </p>

            <div className="mt-6 space-y-3 font-mono text-xs">
              <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded">
                <div className="p-1.5 bg-cyan-950 border border-cyan-500 text-cyan-400 rounded">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Live Roster & Shift Countdowns</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Real-time operational board showing active posts, contact callsigns, and live time-to-relief countdowns.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded">
                <div className="p-1.5 bg-emerald-950 border border-emerald-500 text-emerald-400 rounded">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Formal Shift Handover Protocol</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Digital checklist verifying weapons, tripwires, and open alerts between incoming and outgoing sentries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-800 rounded">
                <div className="p-1.5 bg-purple-950 border border-purple-500 text-purple-400 rounded">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">Append-Only Activity Audit Trail</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Immutable event log recording every alert acknowledgment, zone edit, lockdown order, and patrol check-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/guard-duty">
                <TacticalButton variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                  OPEN GUARD DUTY ROSTER
                </TacticalButton>
              </Link>
            </div>
          </div>

          {/* Roster Card Preview Mockup */}
          <div className="bg-slate-900 border border-slate-800 rounded-sm p-5 font-mono shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-bold text-slate-200">ROSTER SNAPSHOT: 5/6 STAFFED</span>
              </div>
              <StatusPill type="high" label="1 UNDERSTAFFED GAP" size="sm" />
            </div>

            <div className="space-y-3">
              {/* Sample Guard 1 */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
                      alt="SI Sharma"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200">SI Rajesh Sharma</h5>
                    <p className="text-[10px] text-slate-400">Post Alpha-1 • Callsign: ALPHA-COMMAND-1</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusPill type="on_post" size="sm" />
                  <span className="text-[10px] text-emerald-400 block mt-1">Ends in 2h 14m</span>
                </div>
              </div>

              {/* Sample Guard 2 (Unreachable realism detail) */}
              <div className="p-3 bg-slate-950 border border-rose-900/60 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-800 border border-rose-700 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
                      alt="HC Ramesh"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-rose-300">HC Ramesh Kumar</h5>
                    <p className="text-[10px] text-slate-400">Post Alpha-4 (Gully) • NO COMMS</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusPill type="unreachable" size="sm" />
                  <span className="text-[10px] text-rose-400 block mt-1">CHECK REQUIRED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Edge Resilience */}
      <section id="architecture" className="py-16 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              TECHNICAL SPECIFICATIONS
            </h2>
            <p className="mt-2 text-3xl font-bold text-slate-100 font-mono">
              Designed for Severe Remote Environments
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Offline-first buffering, AES-256 local encrypted queues, and instant sync upon network recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-2.5">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase">Edge AI Acceleration</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Low-power embedded inference nodes running YOLOv8 & thermal neural networks directly at border watchtowers.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-2.5">
              <Wifi className="w-6 h-6 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase">Offline Buffer Mesh</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Maintains local state and stores un-synced incident evidence when connectivity drops, auto-flushing upon handshake restore.
              </p>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-2.5">
              <Lock className="w-6 h-6 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase">Encrypted Audit Logs</h3>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Cryptographically signed activity logs preventing tampering of guard handover records and lockdown authorizations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <div className="w-10 h-10 rounded bg-cyan-600/30 border border-cyan-500 mx-auto flex items-center justify-center text-cyan-300 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 uppercase">
            IBVAP — INTELLIGENT BORDER PLATFORM
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Sashastra Seema Bal (SSB) Tactical Operations Console & Human Guard Duty System
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="md">
                LAUNCH COMMAND CONSOLE
              </TacticalButton>
            </Link>
          </div>

          <p className="text-[10px] text-slate-600 mt-8">
            © 2026 IBVAP Defense Systems. Demo & Portfolio Grade Operational Release.
          </p>
        </div>
      </footer>
    </div>
  );
}
