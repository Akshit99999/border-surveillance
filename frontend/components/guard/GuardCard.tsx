import React from "react";
import Link from "next/link";
import { Phone, Radio, AlertTriangle, Shield, Clock, MapPin, ChevronRight, MessageSquare } from "lucide-react";
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
  className,
}) => {
  const countdown = calculateTimeRemaining(guard.shiftEnd);

  const handleCall = (e: React.MouseEvent) => {
    tacticalSound.playClick();
  };

  const handleAction = (action: () => void) => {
    tacticalSound.playClick();
    action();
  };

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-sm overflow-hidden flex flex-col font-mono transition-all duration-200 group shadow-lg">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/60 pointer-events-none" />

      {/* Top Bar: Status & Sector */}
      <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <StatusPill type={guard.status} size="sm" />
        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">
          {guard.currentSector || "RESERVE POOL"}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-3.5 flex-1 flex flex-col">
        <div className="flex items-start gap-3">
          {/* Avatar Photo */}
          <div className="relative w-12 h-12 rounded bg-slate-800 border border-slate-700 shrink-0 overflow-hidden">
            <img
              src={guard.photoUrl}
              alt={guard.name}
              className="w-full h-full object-cover"
            />
            {guard.status === "unreachable" && (
              <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center text-rose-300">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
            )}
          </div>

          {/* Name & Designation */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
              {guard.name}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{guard.rank}</p>
            <p className="text-[10px] text-cyan-400/90 font-semibold mt-0.5">
              ID: {guard.badgeId}
            </p>
          </div>
        </div>

        {/* Tactical Telemetry */}
        <div className="mt-3 py-2 px-2.5 bg-slate-950/60 border border-slate-800/80 rounded space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> POST:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[140px]">
              {guard.currentPostId || "Unassigned"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" /> CALLSIGN:
            </span>
            <span className="font-semibold text-amber-300">{guard.callSign}</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> SHIFT:
            </span>
            <span className={countdown.isExpired ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {countdown.text}
            </span>
          </div>
        </div>

        {/* Certifications preview */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {guard.certifications.slice(0, 2).map((cert, idx) => (
            <span
              key={idx}
              className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-sm truncate max-w-[170px]"
            >
              {cert}
            </span>
          ))}
          {guard.certifications.length > 2 && (
            <span className="text-[9px] px-1 py-0.5 bg-slate-800 text-slate-400 rounded-sm">
              +{guard.certifications.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="px-3 py-2 bg-slate-950/90 border-t border-slate-800 grid grid-cols-4 gap-1">
        {/* Call Link */}
        <a
          href={`tel:${guard.phone.replace(/\s+/g, "")}`}
          onClick={handleCall}
          className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded text-[10px] flex items-center justify-center gap-1"
          title={`Call ${guard.phone}`}
        >
          <Phone className="w-3 h-3 text-cyan-400" />
          <span>CALL</span>
        </a>

        {/* Message */}
        <button
          onClick={() => onMessage && onMessage(guard)}
          className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 rounded text-[10px] flex items-center justify-center gap-1"
          title="Send Radio / SMS Ping"
        >
          <MessageSquare className="w-3 h-3 text-amber-400" />
          <span>PING</span>
        </button>

        {/* Flag Incident */}
        <button
          onClick={() => onFlagIncident && onFlagIncident(guard)}
          className="py-1 px-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded text-[10px] flex items-center justify-center gap-1 font-semibold"
          title="Flag Alert Tied to Guard Post"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span>FLAG</span>
        </button>

        {/* Dossier Link */}
        <Link
          href={`/guard-duty/${guard.id}`}
          className="py-1 px-2 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 rounded text-[10px] flex items-center justify-center gap-1 font-bold"
          title="View Full Guard Dossier"
        >
          <span>DOSSIER</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
