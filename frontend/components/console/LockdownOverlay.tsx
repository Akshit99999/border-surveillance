import React from "react";
import { AlertOctagon } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { TacticalButton } from "../shared/TacticalButton";

export const LockdownOverlay: React.FC = () => {
  const { lockdownActive, abortLockdown, currentUser } = useIBVAPStore();

  if (!lockdownActive) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-6 bg-[#0e0e0e]/95">
      {/* 1px border grid frame */}
      <div className="absolute inset-4 border border-[#ffb4ab]/80 pointer-events-none" />

      {/* Center Alarm Modal */}
      <div className="relative max-w-xl w-full bg-[#131313] border border-[#ffb4ab] rounded-none p-8 text-center z-10 font-mono">
        <div className="inline-flex p-3 bg-[#93000a] text-[#ffdad6] mb-4">
          <AlertOctagon className="w-10 h-10" />
        </div>

        <h2 className="text-xl font-bold text-[#F5F5F0] uppercase tracking-widest leading-tight">
          SECURITY ALERT: GLOBAL LOCKDOWN
        </h2>
        <p className="text-xs text-[#ffb4ab] mt-2 tracking-wider">
          DEFCON 1 ACTIVE // AUTOMATED INTERCEPT & ZERO-LINE SEAL
        </p>

        <div className="my-6 p-4 bg-[#1c1b1b] border border-[#454843] text-xs text-[#c5c7c1] text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-[#8f918c]">COMMAND_AUTHOR:</span>
            <span className="font-bold text-[#F5F5F0]">{currentUser.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8f918c]">CLEARANCE_BADGE:</span>
            <span className="font-bold text-[#F5F5F0]">{currentUser.badgeId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8f918c]">PROTOCOL:</span>
            <span className="text-[#ffdad6] font-bold">ZERO-LINE SEAL & QRF MOBILIZATION</span>
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
