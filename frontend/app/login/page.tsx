"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Fingerprint,
  Key,
  UserCheck,
  Lock,
  ArrowRight,
  ShieldCheck,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { tacticalSound } from "@/lib/sound";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser } = useIBVAPStore();

  const [badgeId, setBadgeId] = useState("SSB-SI-4921");
  const [passcode, setPasscode] = useState("••••••••");
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Sub-Inspector Rajesh Sharma (Sector Command)");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    tacticalSound.playClick();
    setIsVerifying(true);

    setTimeout(() => {
      tacticalSound.playAlert();
      router.push("/dashboard");
    }, 900);
  };

  const selectPreset = (name: string, badge: string, role: string) => {
    tacticalSound.playClick();
    setBadgeId(badge);
    setSelectedRole(`${name} (${role})`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono text-slate-200">
      {/* Background HUD Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-sm shadow-[0_0_40px_rgba(6,182,212,0.15)] p-6 z-10">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Header */}
        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-12 h-12 rounded bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-base font-bold uppercase tracking-widest text-slate-100">
            IBVAP // SECURE CONSOLE AUTH
          </h2>
          <p className="text-[11px] text-cyan-400/80 mt-0.5">
            Sashastra Seema Bal (SSB) Tactical Command Access
          </p>
        </div>

        {/* Demo Preset Selector */}
        <div className="my-4">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-2">
            DEMO OPERATOR PRESETS (ONE-CLICK)
          </span>
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() =>
                selectPreset("Sub-Inspector Rajesh Sharma", "SSB-SI-4921", "Sector Command")
              }
              className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                badgeId === "SSB-SI-4921"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <div>
                <span className="font-bold">SI Rajesh Sharma</span>
                <span className="text-[10px] text-slate-400 block">Sector Command Officer</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">
                LEVEL 3
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                selectPreset("Sub-Inspector Priya Rawat", "SSB-SI-1108", "Intel Lead")
              }
              className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                badgeId === "SSB-SI-1108"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <div>
                <span className="font-bold">SI Priya Rawat</span>
                <span className="text-[10px] text-slate-400 block">Video Intelligence & ANPR</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-cyan-400">
                LEVEL 3
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                selectPreset("Asst Commandant Karan Rathore", "SSB-AC-0402", "Special Ops")
              }
              className={`w-full text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                badgeId === "SSB-AC-0402"
                  ? "bg-cyan-950/80 text-cyan-300 border-cyan-500"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900"
              }`}
            >
              <div>
                <span className="font-bold">Asst Commandant Rathore</span>
                <span className="text-[10px] text-slate-400 block">HQ Tactical Commander</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                LEVEL 1 (MAX)
              </span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              SECURITY BADGE / OPERATOR ID
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              ENCRYPTED TOKEN / PASSCODE
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <TacticalButton
              variant="primary"
              size="lg"
              type="submit"
              loading={isVerifying}
              className="w-full font-bold"
              icon={<Fingerprint className="w-4 h-4" />}
            >
              {isVerifying ? "AUTHENTICATING TELEMETRY..." : "VERIFY & ENTER CONSOLE"}
            </TacticalButton>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>AES-256 SESSION</span>
          </div>
          <Link href="/" className="hover:text-cyan-300">
            ← Back to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
