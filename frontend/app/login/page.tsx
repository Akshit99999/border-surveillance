"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Fingerprint, Key, Lock, Radio, Shield } from "lucide-react";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { tacticalSound } from "@/lib/sound";

export default function LoginPage() {
  const router = useRouter();
  const [operatorId, setOperatorId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    tacticalSound.playClick();
    setIsVerifying(true);
    window.setTimeout(() => router.push("/dashboard"), 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-mono text-slate-200">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="relative max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-sm shadow-[0_0_40px_rgba(6,182,212,0.15)] p-6 z-10">
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        <div className="text-center pb-5 border-b border-slate-800">
          <div className="w-12 h-12 rounded bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.4)] mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-base font-bold uppercase tracking-widest text-slate-100">IBVAP // CONSOLE AUTH</h2>
          <p className="text-[11px] text-cyan-400/80 mt-0.5">Use credentials from the configured identity provider.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 pt-5">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">OPERATOR ID</label>
            <div className="relative">
              <Key className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={operatorId} onChange={(event) => setOperatorId(event.target.value)} placeholder="Enter operator ID" className="w-full bg-slate-950 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono" required />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">PASSCODE / TOKEN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} placeholder="Enter passcode" className="w-full bg-slate-950 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-mono" required />
            </div>
          </div>
          <div className="pt-2">
            <TacticalButton variant="primary" size="lg" type="submit" loading={isVerifying} className="w-full font-bold" icon={<Fingerprint className="w-4 h-4" />}>
              {isVerifying ? "AUTHENTICATING..." : "VERIFY & ENTER CONSOLE"}
            </TacticalButton>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-emerald-400" /><span>IDENTITY PROVIDER REQUIRED</span></div>
          <Link href="/" className="hover:text-cyan-300">← Back to Public Portal</Link>
        </div>
      </div>
    </div>
  );
}
