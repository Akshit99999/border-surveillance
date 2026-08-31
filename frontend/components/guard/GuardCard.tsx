import React from "react";
import Link from "next/link";
import { Phone, Radio, AlertTriangle, Clock, MapPin, ChevronRight, MessageSquare } from "lucide-react";
import { Guard } from "@/lib/types";
import { StatusPill } from "../shared/StatusPill";
import { calculateTimeRemaining } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";

interface GuardCardProps {
  guard: Guard;
  onFlagIncident?: (guard: Guard) => void;
  onMessage?: (guard: Guard) => void;
  className?: string;
}

export const GuardCard: React.FC<GuardCardProps> = ({
  guard,
  onFlagIncident,
  onMessage,
}) => {
  const countdown = calculateTimeRemaining(guard.shiftEnd);

  const handleCall = () => {
    tacticalSound.playClick();
  };

  return (
    <div className="relative bg-[#131313] border border-[#454843] rounded-none overflow-hidden flex flex-col font-mono transition-colors group">
      {/* Top Bar: Status & Sector */}
      <div className="px-3 py-2 bg-[#1c1b1b] border-b border-[#454843] flex items-center justify-between">
        <StatusPill type={guard.status} size="sm" />
        <span className="text-[10px] text-[#8f918c] font-bold truncate max-w-[140px]">
          {guard.currentSector || "RESERVE POOL"}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="flex items-start gap-3">
          {/* Avatar Photo */}
          <div className="relative w-12 h-12 bg-[#0e0e0e] border border-[#454843] shrink-0 overflow-hidden">
            <img
              src={guard.photoUrl}
              alt={guard.name}
              className="w-full h-full object-cover grayscale"
            />
            {guard.status === "unreachable" && (
              <div className="absolute inset-0 bg-[#93000a]/80 flex items-center justify-center text-[#ffdad6]">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            )}
          </div>

          {/* Name & Designation */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#F5F5F0] truncate">
              {guard.name}
            </h4>
            <p className="text-[11px] text-[#8f918c] mt-0.5">{guard.rank}</p>
            <p className="text-[10px] text-[#c5c7c1] font-bold mt-0.5">
              ID: {guard.badgeId}
            </p>
          </div>
        </div>

        {/* Telemetry */}
        <div className="py-2 px-2.5 bg-[#1c1b1b] border border-[#454843] space-y-1 text-[11px]">
          <div className="flex items-center justify-between text-[#c5c7c1]">
            <span className="text-[#8f918c] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F5F5F0]" /> POST:
            </span>
            <span className="font-bold text-[#F5F5F0] truncate max-w-[140px]">
              {guard.currentPostId || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#c5c7c1]">
            <span className="text-[#8f918c] flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#8f918c]" /> CALLSIGN:
            </span>
            <span className="font-bold text-[#F5F5F0]">{guard.callSign}</span>
          </div>

          <div className="flex items-center justify-between text-[#c5c7c1]">
            <span className="text-[#8f918c] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#8f918c]" /> SHIFT:
            </span>
            <span className={countdown.isExpired ? "text-[#ffb4ab] font-bold" : "text-[#F5F5F0] font-bold"}>
              {countdown.text}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="px-3 py-2 bg-[#1c1b1b] border-t border-[#454843] grid grid-cols-3 gap-1.5">
        <a
          href={`tel:${guard.phone.replace(/\s+/g, "")}`}
          onClick={handleCall}
          className="py-1.5 px-2 bg-[#131313] hover:bg-[#2a2a2a] text-[#F5F5F0] border border-[#454843] text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-wider"
          title={`Call ${guard.phone}`}
        >
          <Phone className="w-3 h-3" />
          <span>CALL</span>
        </a>

        <button
          onClick={() => onMessage && onMessage(guard)}
          className="py-1.5 px-2 bg-[#131313] hover:bg-[#2a2a2a] text-[#c5c7c1] hover:text-[#F5F5F0] border border-[#454843] text-[10px] font-bold flex items-center justify-center gap-1 uppercase tracking-wider"
          title="Send Radio Ping"
        >
          <MessageSquare className="w-3 h-3" />
          <span>PING</span>
        </button>

        <button
          onClick={() => onFlagIncident && onFlagIncident(guard)}
          className="py-1.5 px-2 bg-[#93000a]/40 hover:bg-[#93000a] text-[#ffdad6] border border-[#ffb4ab]/80 text-[10px] flex items-center justify-center gap-1 font-bold uppercase tracking-wider"
          title="Flag Alert"
        >
          <AlertTriangle className="w-3 h-3" />
          <span>FLAG</span>
        </button>
      </div>
    </div>
  );
};
