"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  MemoryStick,
  Anchor,
  Link as LinkIcon,
  Camera,
  Radio,
  ShieldAlert,
  Users,
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

  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1] flex flex-col font-mono selection:bg-[#F5F5F0] selection:text-[#121212]">
      {/* Top Docked Navigation */}
      <header className="bg-[#131313] border-b border-[#454843] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#F5F5F0] text-[#121212] flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs tracking-widest text-[#F5F5F0] uppercase">
              S_COMMAND_01 // BORDERLENS
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs tracking-widest uppercase text-[#8f918c]">
            <Link href="/live-feed" className="hover:text-[#F5F5F0] transition-colors">LIVE_FEED</Link>
            <Link href="/alerts" className="hover:text-[#F5F5F0] transition-colors">ARCHIVES</Link>
            <Link href="/dashboard" className="text-[#F5F5F0] border-b border-[#F5F5F0] pb-0.5">ANALYTICS</Link>
            <Link href="/map" className="hover:text-[#F5F5F0] transition-colors">NODES</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-xs text-[#8f918c] hover:text-[#F5F5F0] uppercase tracking-wider px-3 py-1.5 border border-transparent hover:border-[#454843]">
              SIGN_IN
            </Link>
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                LAUNCH CONSOLE
              </TacticalButton>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-20 w-full border-b border-[#454843]">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#454843] bg-[#1c1b1b] text-[#c5c7c1] text-[10px] uppercase tracking-widest mb-6">
            <span className={"w-2 h-2 rounded-full " + (backendStatus === "online" ? "bg-[#F5F5F0]" : "bg-[#8f918c]")} />
            <span>DJANGO_API: {backendStatus.toUpperCase()} // BLOCKCHAIN: {blockchainStatus.connected ? "CONNECTED" : "STANDBY"}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#F5F5F0] max-w-5xl leading-tight font-sans">
            Intelligent Border Video Analytics
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#c5c7c1] max-w-3xl leading-relaxed font-sans font-normal">
            Precision monitoring and evidentiary documentation for high-security border environments. Local AI edge processing, cryptographic hash anchoring, and verifiable guard accountability.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/dashboard">
              <button className="bg-[#F5F5F0] text-[#121212] font-mono text-xs uppercase font-bold tracking-widest px-8 py-3.5 hover:opacity-90 transition-opacity rounded-none">
                DEPLOY SYSTEM
              </button>
            </Link>
            <Link href="/live-feed">
              <button className="text-[#F5F5F0] border border-[#454843] hover:border-[#F5F5F0] font-mono text-xs uppercase font-bold tracking-widest px-8 py-3.5 transition-colors rounded-none bg-[#1c1b1b]">
                PREVIEW REAL CAMERA
              </button>
            </Link>
          </div>

          {/* Telemetry Metrics Grid */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#454843] border border-[#454843]">
            <div className="p-4 bg-[#131313]">
              <span className="text-[10px] text-[#8f918c] uppercase tracking-widest block">BACKEND SECTORS</span>
              <span className="text-2xl font-bold text-[#F5F5F0] block mt-1">{isHydrated ? String(sectors.length) : "—"}</span>
              <span className="text-[10px] text-[#8f918c]">from Django</span>
            </div>
            <div className="p-4 bg-[#131313]">
              <span className="text-[10px] text-[#8f918c] uppercase tracking-widest block">CAMERAS ONLINE</span>
              <span className="text-2xl font-bold text-[#F5F5F0] block mt-1">{isHydrated ? `${onlineCameras}/${cameras.length}` : "—"}</span>
              <span className="text-[10px] text-[#8f918c]">configured feeds</span>
            </div>
            <div className="p-4 bg-[#131313]">
              <span className="text-[10px] text-[#8f918c] uppercase tracking-widest block">ACTIVE THREATS</span>
              <span className="text-2xl font-bold text-[#F5F5F0] block mt-1">{isHydrated ? String(openAlerts) : "—"}</span>
              <span className="text-[10px] text-[#8f918c]">unresolved alerts</span>
            </div>
            <div className="p-4 bg-[#131313]">
              <span className="text-[10px] text-[#8f918c] uppercase tracking-widest block">GUARD ROSTER</span>
              <span className="text-2xl font-bold text-[#F5F5F0] block mt-1">{isHydrated ? String(guards.length) : "—"}</span>
              <span className="text-[10px] text-[#8f918c]">sentry records</span>
            </div>
          </div>
        </section>

        {/* Core Modules 3-Column Grid */}
        <section className="border-b border-[#454843]">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#454843] border-x border-[#454843]">
              {/* Feature 1 */}
              <div className="p-8 bg-[#131313] space-y-4">
                <div className="text-[11px] text-[#8f918c] uppercase tracking-widest flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-[#F5F5F0]" />
                  <span>SYS.MODULE.01</span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F0] uppercase tracking-wider font-sans">
                  Local AI Inference
                </h3>
                <p className="text-xs text-[#c5c7c1] font-sans leading-relaxed">
                  On-edge processing ensures zero-latency threat detection without reliance on external network uplinks. Complete operational security maintained locally with automatic offline queueing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 bg-[#131313] space-y-4">
                <div className="text-[11px] text-[#8f918c] uppercase tracking-widest flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-[#F5F5F0]" />
                  <span>SYS.MODULE.02</span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F0] uppercase tracking-wider font-sans">
                  Evidence Anchoring
                </h3>
                <p className="text-xs text-[#c5c7c1] font-sans leading-relaxed">
                  Cryptographic SHA-256 hashing of raw video feeds at the point of capture. Immutable incident records committed to an append-only blockchain contract tied to GPS coordinates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 bg-[#131313] space-y-4">
                <div className="text-[11px] text-[#8f918c] uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-[#F5F5F0]" />
                  <span>SYS.MODULE.03</span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F0] uppercase tracking-wider font-sans">
                  Chain of Custody
                </h3>
                <p className="text-xs text-[#c5c7c1] font-sans leading-relaxed">
                  Automated shift rotation logs, 1-tap sentry handovers, and immutable operator audit trails ensure complete human accountability across sensitive sectors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Operating Model & Architecture */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 w-full">
          <div className="border border-[#454843] bg-[#1c1b1b] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8f918c] uppercase tracking-widest">DEPLOYMENT ARCHITECTURE</span>
              <h4 className="text-lg font-bold text-[#F5F5F0] uppercase tracking-wider">
                Ready for Isolated Outpost Operations
              </h4>
              <p className="text-xs text-[#c5c7c1] font-sans max-w-2xl mt-1">
                Zero telemetry leakage. Operates fully offline during communications dropouts and synchronizes cryptographic incident records upon link restoration.
              </p>
            </div>
            <Link href="/dashboard">
              <TacticalButton variant="primary" size="md">
                ENTER COMMAND TERMINAL →
              </TacticalButton>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#454843] py-8 bg-[#131313] text-center text-xs text-[#8f918c]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-bold text-[#F5F5F0] uppercase tracking-widest">
            SSB BORDERLENS // OVERSIGHT TERMINAL V4.0
          </div>
          <div>
            SYSTEM_UPTIME: <span className="text-[#F5F5F0]">99.98%</span> // ENCRYPTION: <span className="text-[#F5F5F0]">AES-256</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
