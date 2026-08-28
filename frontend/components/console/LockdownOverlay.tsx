import React from "react";
import { AlertOctagon, ShieldAlert, X } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { TacticalButton } from "../shared/TacticalButton";

export const LockdownOverlay: React.FC = () => {
  const { lockdownActive, abortLockdown, currentUser } = useIBVAPStore();

  if (!lockdownActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-6 bg-rose-950/80 backdrop-blur-md animate-pulse">
      {/* Scanline / Flashing red border */}
      <div className="absolute inset-0 border-8 border-rose-600/90 pointer-events-none shadow-[inset_0_0_100px_rgba(225,29,72,0.8)]" />

      {/* Center Alarm Modal */}
      <div className="relative max-w-xl w-full bg-slate-950 border-2 border-rose-500 rounded-sm shadow-[0_0_50px_rgba(244,63,94,0.6)] p-6 text-center z-10">
        <div className="inline-flex p-3 rounded-full bg-rose-900/60 border border-rose-500 mb-4 animate-bounce">
          <AlertOctagon className="w-12 h-12 text-rose-400" />
        </div>

        <h2 className="font-mono text-2xl font-black text-rose-400 uppercase tracking-widest leading-tight">
          SECURITY ALERT: GLOBAL PERIMETER LOCKDOWN
        </h2>
        <p className="font-mono text-xs text-rose-200 mt-2 tracking-wide">
          DEFCON 1 ACTIVE • AUTOMATED INTERCEPT & SIREN MEASURES ENGAGED
        </p>

        <div className="my-5 p-4 bg-rose-950/60 border border-rose-800/80 rounded font-mono text-xs text-rose-300 text-left space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">COMMAND AUTHOR:</span>
            <span className="font-bold">{currentUser.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">CLEARANCE BADGE:</span>
            <span className="font-bold">{currentUser.badgeId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">PROTOCOL:</span>
            <span className="text-rose-300 font-bold">ZERO-LINE SEAL & QRF MOBILIZATION</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <TacticalButton
            variant="danger"
            size="lg"
            onClick={abortLockdown}
            className="w-full font-bold"
          >
            DISARM & ABORT LOCKDOWN
          </TacticalButton>
        </div>
      </div>
    </div>
  );
};
