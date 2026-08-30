"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Camera,
  CheckCircle2,
  Cpu,
  Database,
  Lock,
  Radio,
  Shield,
  ShieldAlert,
  Users,
  Video,
  Wifi,
} from "lucide-react";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export default function LandingPage() {
  const {
    alerts,
    cameras,
    sectors,
    guards,
    backendStatus,
    blockchainStatus,
    isHydrated,
    hydrateFromBackend,
  } = useIBVAPStore();

  useEffect(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend]);

  const onlineCameras = cameras.filter((camera) => camera.status === "online").length;
  const openAlerts = alerts.filter((alert) => alert.status === "open").length;
  const statusLabel = backendStatus === "online" ? "Django API ONLINE" : backendStatus === "offline" ? "Django API OFFLINE" : "CONNECTING TO DJANGO";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      <nav className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-mono font-black tracking-widest text-sm text-slate-100 block">SSB BORDERLENS</span>
              <span className="font-mono text-[9px] text-cyan-400 tracking-wider">BORDER COMMAND PLATFORM</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="font-mono text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded">Sign In</Link>
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>LAUNCH CONSOLE</TacticalButton>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative pt-20 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:60px_60px]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs uppercase tracking-wider mb-6">
              <span className={"w-2 h-2 rounded-full " + (backendStatus === "online" ? "bg-emerald-400" : "bg-amber-400")} />
              <span>{statusLabel}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-5xl mx-auto leading-tight font-mono">
              Intelligent Border Video Analytics & <br />
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">Guard Accountability</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              A local-first command console for connecting real camera sources, running computer vision, recording operator actions, and preserving verified incident evidence for border security teams.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/live-feed"><TacticalButton variant="primary" size="lg" icon={<Video className="w-4 h-4" />}>OPEN LIVE CAMERAS</TacticalButton></Link>
              <Link href="/dashboard"><TacticalButton variant="secondary" size="lg" icon={<Activity className="w-4 h-4" />}>VIEW COMMAND STATUS</TacticalButton></Link>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left font-mono">
              <Metric label="BACKEND SECTORS" value={isHydrated ? String(sectors.length) : "—"} detail="from Django" icon={<Radio className="w-4 h-4 text-cyan-400" />} />
              <Metric label="CAMERAS ONLINE" value={isHydrated ? `${onlineCameras}/${cameras.length}` : "—"} detail="configured sources" icon={<Camera className="w-4 h-4 text-emerald-400" />} />
              <Metric label="OPEN ALERTS" value={isHydrated ? String(openAlerts) : "—"} detail="from incident log" icon={<ShieldAlert className="w-4 h-4 text-rose-400" />} />
              <Metric label="GUARD ROSTER" value={isHydrated ? String(guards.length) : "—"} detail="records loaded" icon={<Users className="w-4 h-4 text-amber-400" />} />
            </div>
          </div>
        </section>

        <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">REAL CAMERA PREVIEW</h2>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-100 font-mono">Test the available camera from Live Cameras</p>
              <p className="mt-2 text-sm text-slate-400">The browser camera preview is local to this operator session. No fabricated feed, detection box, incident, or evidence image is shown when no real source is connected.</p>
            </div>
            <div className="max-w-3xl mx-auto p-6 bg-slate-950 border border-slate-800 rounded-sm flex flex-col sm:flex-row items-center gap-5">
              <div className="w-16 h-16 rounded bg-cyan-950 border border-cyan-500/60 flex items-center justify-center shrink-0"><Camera className="w-8 h-8 text-cyan-400" /></div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-mono font-bold text-slate-100 uppercase">LOCAL DEVICE CAMERA</h3>
                <p className="text-sm text-slate-400 mt-1">Open the live-feed page and grant camera permission to preview a connected webcam.</p>
              </div>
              <Link href="/live-feed"><TacticalButton variant="outline" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>OPEN FEED</TacticalButton></Link>
            </div>
          </div>
        </section>

        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">IMPLEMENTED SECURITY BOUNDARIES</h2>
            <p className="mt-2 text-3xl font-bold text-slate-100 font-mono">Evidence and operations remain verifiable</p>
            <p className="mt-2 text-sm text-slate-400">The system keeps large media off-chain while committing hashes and audit references to an append-only blockchain contract when configured.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <Feature icon={<Cpu className="w-6 h-6 text-cyan-400" />} title="Local AI and camera input" text="Run inference close to the camera when possible, queue events locally during link outages, and sync them when the connection returns." />
            <Feature icon={<Database className="w-6 h-6 text-emerald-400" />} title="Evidence hash anchoring" text="Store the image or video in controlled storage such as private IPFS, then anchor only its cryptographic hash and incident metadata on-chain." />
            <Feature icon={<Lock className="w-6 h-6 text-amber-400" />} title="Chain of custody" text="Record evidence actions and AI model provenance so commanders can verify who handled an incident and which model produced a detection." />
          </div>
          <div className="mt-6 p-4 bg-slate-950 border border-slate-800 rounded flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="flex items-center gap-2 text-slate-300"><CheckCircle2 className={"w-4 h-4 " + (blockchainStatus.connected ? "text-emerald-400" : "text-amber-400")} /> Blockchain: {blockchainStatus.connected ? "connected" : "not configured"}</span>
            <span className="text-slate-500">Configure the RPC, contract address, signer, and Pinata credentials on the backend before anchoring evidence.</span>
          </div>
        </section>

        <section className="py-16 bg-slate-900/40 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">OPERATING MODEL</h2>
              <p className="mt-2 text-3xl font-bold text-slate-100 font-mono">Designed for remote border links</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <Feature icon={<Cpu className="w-6 h-6 text-cyan-400" />} title="Edge-capable inference" text="Connect the AI pipeline to a local camera or an authenticated CCTV relay without inventing a signal when none is available." />
              <Feature icon={<Wifi className="w-6 h-6 text-emerald-400" />} title="Offline event queue" text="Keep incident payloads in the outpost’s local queue while connectivity is unavailable and submit them after link recovery." />
              <Feature icon={<Lock className="w-6 h-6 text-amber-400" />} title="Controlled access" text="Keep evidence private by default and expose verification through authenticated command-center workflows." />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-12 bg-slate-950 text-center font-mono">
        <div className="max-w-7xl mx-auto px-4">
          <Shield className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-100 uppercase">BORDERLENS — INTELLIGENT BORDER PLATFORM</h3>
          <p className="text-xs text-slate-400 mt-1">Indian border surveillance command console with local camera testing and verifiable evidence workflows.</p>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded"><span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase">{icon}{label}</span><span className="text-xl font-bold text-slate-100 block mt-1">{value}</span><span className="text-[10px] text-slate-500">{detail}</span></div>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="p-5 bg-slate-950 border border-slate-800 rounded space-y-2.5"><div>{icon}</div><h3 className="text-sm font-bold text-slate-200 uppercase">{title}</h3><p className="text-slate-400 leading-relaxed text-[11px]">{text}</p></div>;
}
