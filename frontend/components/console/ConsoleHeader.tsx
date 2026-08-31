"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Clock,
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
    soundMuted,
    toggleSound,
    offlineQueue,
    offlineLogQueue,
    currentUser,
    backendStatus,
    blockchainStatus,
  } = useIBVAPStore();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [utcTime, setUtcTime] = useState<string>("");
  const totalQueued = offlineQueue.length + offlineLogQueue.length;

  useEffect(() => {
    const updateTimes = () => {
      setCurrentTime(formatTimeIST());
      const now = new Date();
      setUtcTime(now.toISOString().substring(11, 19) + " UTC");
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[#131313] border-b border-[#454843] px-4 flex items-center justify-between z-30 shrink-0 select-none font-mono">
      {/* Left: Terminal Node & Clock */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#F5F5F0] animate-pulse" />
          <span className="text-xs font-bold text-[#F5F5F0] tracking-widest uppercase">
            S_COMMAND_01
          </span>
        </div>

        <span className="text-[#454843] hidden sm:inline">|</span>

        {/* DEFCON Level */}
        <div
          className={`text-[11px] px-2.5 py-1 border font-bold uppercase tracking-wider ${
            defconLevel === 1
              ? "bg-[#93000a] text-[#ffdad6] border-[#ffb4ab] animate-pulse"
              : defconLevel === 2
              ? "bg-[#2a2a2a] text-[#e5e2e1] border-[#8f918c]"
              : "bg-[#1c1b1b] text-[#c5c7c1] border-[#454843]"
          }`}
        >
          DEFCON_{defconLevel}
        </div>

        {/* Live Clock (UTC & IST) */}
        <div className="hidden md:flex items-center gap-2 text-xs text-[#8f918c]">
          <Clock className="w-3.5 h-3.5 text-[#8f918c]" />
          <span className="text-[#F5F5F0] font-bold">{utcTime || "00:00:00 UTC"}</span>
          <span className="text-[10px] text-[#8f918c]">({currentTime || "00:00:00"} IST)</span>
        </div>
      </div>

      {/* Quick Center Nav for Desktop */}
      <nav className="hidden xl:flex items-center gap-6 text-[11px] uppercase tracking-widest text-[#8f918c]">
        <Link href="/live-feed" className="hover:text-[#F5F5F0] transition-colors">LIVE_FEED</Link>
        <Link href="/alerts" className="hover:text-[#F5F5F0] transition-colors">EVIDENCE_VAULT</Link>
        <Link href="/map" className="hover:text-[#F5F5F0] transition-colors">RADAR_GIS</Link>
        <Link href="/guard-duty" className="hover:text-[#F5F5F0] transition-colors">ROSTER</Link>
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Blockchain Status */}
        <div
          title={blockchainStatus.message}
          className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-bold uppercase ${
            blockchainStatus.connected
              ? "bg-[#1c1b1b] text-[#F5F5F0] border-[#8f918c]"
              : "bg-[#131313] text-[#8f918c] border-[#454843]"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{blockchainStatus.connected ? "CHAIN_SYNCED" : "CHAIN_STANDBY"}</span>
        </div>

        {/* API Status */}
        <div
          className={`text-[11px] px-2.5 py-1 border flex items-center gap-1.5 font-bold uppercase ${
            backendStatus === "online"
              ? "bg-[#1c1b1b] text-[#F5F5F0] border-[#8f918c]"
              : "bg-[#93000a]/40 text-[#ffdad6] border-[#ffb4ab]"
          }`}
        >
          {backendStatus === "online" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{backendStatus === "online" ? "API_ONLINE" : "OFFLINE"}</span>
          {totalQueued > 0 && <span className="text-[#ffb4ab]">({totalQueued}Q)</span>}
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundMuted ? "Unmute Audio" : "Mute Audio"}
          className="p-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#8f918c] hover:text-[#F5F5F0] border border-[#454843] rounded-none transition-colors"
        >
          {soundMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-[#ffb4ab]" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-[#F5F5F0]" />
          )}
        </button>

        {/* Lockdown Action Button */}
        <TacticalButton
          variant="danger"
          size="sm"
          onClick={triggerLockdown}
          icon={<AlertTriangle className="w-3.5 h-3.5" />}
          className="font-bold"
        >
          LOCKDOWN
        </TacticalButton>

        {/* User / Logout */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#454843]">
          <div className="text-right text-[10px]">
            <p className="font-bold text-[#F5F5F0] leading-none">{currentUser.name}</p>
            <p className="text-[#8f918c] mt-0.5">{currentUser.rank}</p>
          </div>
          <Link
            href="/login"
            title="Logout / Switch Operator"
            className="p-1.5 text-[#8f918c] hover:text-[#F5F5F0] hover:bg-[#1c1b1b] border border-transparent hover:border-[#454843] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
