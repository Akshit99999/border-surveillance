import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Clock,
  User,
  LogOut,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { formatTimeIST } from "@/lib/utils";
import { TacticalButton } from "../shared/TacticalButton";

export const ConsoleHeader: React.FC = () => {
  const {
    lockdownActive,
    triggerLockdown,
    defconLevel,
    setDefconLevel,
    soundMuted,
    toggleSound,
    offlineQueue,
    offlineLogQueue,
    alerts,
    currentUser,
    backendStatus,
    blockchainStatus,
    firebaseStatus,
  } = useIBVAPStore();

  const [currentTime, setCurrentTime] = useState<string>("");
  const totalQueued = offlineQueue.length + offlineLogQueue.length;

  useEffect(() => {
    setCurrentTime(formatTimeIST());
    const interval = setInterval(() => {
      setCurrentTime(formatTimeIST());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const openAlertsCount = alerts.filter((a) => a.status === "open").length;

  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Left: High-Contrast Status & Defcon Indicator */}
      <div className="flex items-center gap-3">
        {/* DEFCON Level Pill */}
        <div
          className={`font-mono text-xs px-3 py-1.5 rounded border flex items-center gap-2 font-bold ${
            defconLevel === 1
              ? "bg-rose-950 text-rose-200 border-rose-600 animate-pulse"
              : defconLevel === 2
              ? "bg-amber-950 text-amber-200 border-amber-600"
              : "bg-emerald-950 text-emerald-200 border-emerald-600"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          <span>DEFCON {defconLevel}</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900 px-3 py-1.5 border border-slate-800 rounded font-mono text-xs text-slate-200 font-bold">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>{currentTime || "12:00:00"} IST</span>
        </div>
      </div>

      {/* Right: Connection status, Audio, Lockdown */}
      <div className="flex items-center gap-2.5 font-mono">
        <div
          title={blockchainStatus.message}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-2 rounded border text-[10px] font-black uppercase ${
            blockchainStatus.connected
              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
              : "bg-slate-900 text-amber-300 border-slate-700"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{blockchainStatus.connected ? "CHAIN LIVE" : "CHAIN STAGED"}</span>
          <span className="text-slate-500">/ API {backendStatus}</span>
        </div>

        <div
          title={firebaseStatus.message}
          className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-2 rounded border text-[10px] font-black uppercase ${
            firebaseStatus.initialized
              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
              : "bg-slate-900 text-amber-300 border-slate-700"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>{firebaseStatus.initialized ? "FIREBASE LIVE" : "FIREBASE STAGED"}</span>
        </div>

        <div
          title="Live Django API connection status"
          className={`text-xs px-3 py-2 rounded border flex items-center gap-2 font-bold min-h-[40px] ${
            backendStatus === "online"
              ? "bg-slate-900 text-emerald-400 border-slate-700"
              : "bg-rose-950 text-rose-200 border-rose-700"
          }`}
        >
          {backendStatus === "online" ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          <span>{backendStatus === "online" ? "API ONLINE" : backendStatus === "offline" ? "API OFFLINE" : "CONNECTING"}</span>
          {totalQueued > 0 && <span className="text-amber-300">{totalQueued} QUEUED</span>}
        </div>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={soundMuted ? "Unmute Audio" : "Mute Audio"}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded min-h-[40px] flex items-center justify-center transition-colors"
        >
          {soundMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Big Red Lockdown Button */}
        <TacticalButton
          variant="danger"
          size="md"
          onClick={triggerLockdown}
          icon={<AlertTriangle className="w-4 h-4" />}
          className="font-bold min-h-[40px]"
        >
          LOCKDOWN
        </TacticalButton>

        {/* User Badge / Logout */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-100 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-cyan-400 mt-0.5">{currentUser.rank}</p>
          </div>
          <Link
            href="/login"
            title="Logout / Switch Guard"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded border border-slate-800 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
