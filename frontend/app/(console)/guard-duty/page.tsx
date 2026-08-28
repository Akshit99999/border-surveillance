"use client";

import React, { useState } from "react";
import {
  Users,
  ClipboardList,
  Phone,
  Radio,
  UserCheck,
  Search,
  Calendar,
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { Guard, ActivityLogEntry } from "@/lib/types";
import { StatusPill } from "@/components/shared/StatusPill";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { Modal } from "@/components/shared/Modal";
import { formatTimeIST, formatDateIST, calculateTimeRemaining } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";

export default function GuardDutyAndLogPage() {
  const {
    guards,
    activityLog,
    shifts,
    quickHandover,
    updateGuardStatus,
    currentUser,
  } = useIBVAPStore();

  const [activeTab, setActiveTab] = useState<"on_duty" | "log">("on_duty");

  // Tab 1 (On Duty) State: Fast Handover Modal
  const [handoverOutgoing, setHandoverOutgoing] = useState<Guard | null>(null);
  const [handoverIncomingId, setHandoverIncomingId] = useState<string>("");
  const [handoverNote, setHandoverNote] = useState<string>("");

  // Tab 2 (Log) State: Search & Date Filter
  const [searchLogQuery, setSearchLogQuery] = useState<string>("");
  const [logDateFilter, setLogDateFilter] = useState<string>("ALL");

  // Eligible replacement guards (off duty or break)
  const offDutyGuards = guards.filter(
    (g) => g.status === "off_duty" || g.status === "break"
  );

  const activeOnDutyGuards = guards.filter(
    (g) => g.status === "on_post" || g.status === "patrolling" || g.status === "unreachable"
  );

  const handleOpenHandover = (guard: Guard) => {
    tacticalSound.playClick();
    setHandoverOutgoing(guard);
    setHandoverIncomingId(offDutyGuards[0]?.id || "");
    setHandoverNote("");
  };

  const handleCommitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverOutgoing || !handoverIncomingId) return;

    quickHandover(handoverOutgoing.id, handoverIncomingId, handoverNote);
    setHandoverOutgoing(null);
  };

  // Filter activity logs
  const filteredLogs = activityLog.filter((log) => {
    const matchSearch =
      log.details.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchLogQuery.toLowerCase()) ||
      log.actionType.toLowerCase().includes(searchLogQuery.toLowerCase());

    const isToday = log.timestamp.startsWith("2026-08-27");
    const isYesterday = log.timestamp.startsWith("2026-08-26");

    const matchDate =
      logDateFilter === "ALL" ||
      (logDateFilter === "TODAY" && isToday) ||
      (logDateFilter === "YESTERDAY" && isYesterday);

    return matchSearch && matchDate;
  });

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner with 2 Main Large Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">
              GUARD DUTY & ACTIVITY LOG
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Live post roster, 1-tap shift handovers, and automatic audit history.
            </p>
          </div>
        </div>

        {/* 2 Big Clear Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              tacticalSound.playClick();
              setActiveTab("on_duty");
            }}
            className={`px-5 py-2.5 rounded border text-xs font-black tracking-wider transition-all min-h-[44px] ${
              activeTab === "on_duty"
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            1. ON DUTY NOW ({activeOnDutyGuards.length})
          </button>

          <button
            onClick={() => {
              tacticalSound.playClick();
              setActiveTab("log");
            }}
            className={`px-5 py-2.5 rounded border text-xs font-black tracking-wider transition-all min-h-[44px] ${
              activeTab === "log"
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                : "bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            2. ACTIVITY LOG ({activityLog.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ON DUTY NOW (Simple Sentry List) */}
      {activeTab === "on_duty" && (
        <div className="space-y-4">
          {/* Sentry List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeOnDutyGuards.map((guard) => {
              const countdown = calculateTimeRemaining(guard.shiftEnd);
              const isUnreachable = guard.status === "unreachable";

              return (
                <div
                  key={guard.id}
                  className={`p-4 rounded border font-mono flex flex-col justify-between space-y-3 transition-all ${
                    isUnreachable
                      ? "bg-rose-950/40 border-rose-600/80 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Top: Name, Rank & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-100 truncate">
                          {guard.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {guard.rank} • Callsign: <span className="text-amber-400 font-bold">{guard.callSign}</span>
                      </p>
                    </div>
                    <StatusPill type={guard.status} size="md" />
                  </div>

                  {/* Middle: Post & Shift Countdown */}
                  <div className="p-3 bg-slate-950 rounded border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-cyan-400" /> SENTRY POST:
                      </span>
                      <span className="font-black text-cyan-300 text-sm">
                        {guard.currentPostId || "Sector Patrol"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-400" /> TIME REMAINING:
                      </span>
                      <span
                        className={
                          countdown.isExpired
                            ? "text-rose-400 font-bold"
                            : "text-emerald-400 font-bold text-xs"
                        }
                      >
                        {countdown.text}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Big Tap-To-Call & 1-Tap Handover Button */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Big Green Tap-To-Call */}
                    <a
                      href={`tel:${guard.phone.replace(/\s+/g, "")}`}
                      onClick={() => tacticalSound.playClick()}
                      className="py-3 px-3 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-xs font-black flex items-center justify-center gap-2 min-h-[44px] transition-colors"
                      title={`Call ${guard.phone}`}
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>CALL SENTRY</span>
                    </a>

                    {/* 1-Tap Handover Action */}
                    <button
                      onClick={() => handleOpenHandover(guard)}
                      className="py-3 px-3 bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-500 rounded text-xs font-black flex items-center justify-center gap-2 min-h-[44px] transition-colors"
                    >
                      <UserCheck className="w-4 h-4 text-cyan-400" />
                      <span>HANDOVER</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Simple Flat Upcoming Shift List */}
          <div className="bg-slate-900 border border-slate-800 rounded p-4 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">
              UPCOMING SHIFT ROTATIONS (NEXT 24 HOURS)
            </h3>
            <div className="divide-y divide-slate-800">
              {shifts.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="font-bold text-slate-100">{s.guardName}</span>
                      <span className="text-slate-400 text-[11px] block">{s.sector}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-cyan-300 font-bold">{s.shiftName}</span>
                    <span className="text-slate-500 text-[10px] block">{s.postId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOG (Reverse-Chronological Activity History) */}
      {activeTab === "log" && (
        <div className="space-y-3">
          {/* Search & Date Filter */}
          <div className="bg-slate-950 border border-slate-800 rounded p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLogQuery}
                onChange={(e) => setSearchLogQuery(e.target.value)}
                placeholder="Search log by guard name, action, or post..."
                className="w-full bg-slate-900 border border-slate-700 rounded py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono min-h-[40px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">
                DATE:
              </span>
              <select
                value={logDateFilter}
                onChange={(e) => {
                  tacticalSound.playClick();
                  setLogDateFilter(e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono min-h-[40px]"
              >
                <option value="ALL">ALL DATES</option>
                <option value="TODAY">TODAY (AUG 27)</option>
                <option value="YESTERDAY">YESTERDAY (AUG 26)</option>
              </select>
            </div>
          </div>

          {/* Clean Reverse-Chronological List */}
          <div className="bg-slate-900 border border-slate-800 rounded divide-y divide-slate-800">
            {filteredLogs.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No activity logs match your search.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 hover:bg-slate-800/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="text-[11px] text-slate-400 font-bold shrink-0 mt-0.5">
                      <span className="text-cyan-300 block">{formatTimeIST(log.timestamp)}</span>
                      <span className="text-[10px] text-slate-500">
                        {formatDateIST(log.timestamp)}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-100">{log.actorName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded border border-slate-700 uppercase">
                          {log.sector}
                        </span>
                      </div>
                      <p className="text-slate-300 font-sans text-xs mt-1 leading-snug">
                        {log.details}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono shrink-0 sm:text-right">
                    {log.targetId}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Simple 1-Step Handover Modal */}
      {handoverOutgoing && (
        <Modal
          isOpen={Boolean(handoverOutgoing)}
          onClose={() => setHandoverOutgoing(null)}
          title="ONE-STEP SHIFT HANDOVER"
          subtitle={`Handover Post: ${handoverOutgoing.currentPostId || "Active Post"}`}
          maxWidth="md"
        >
          <form onSubmit={handleCommitHandover} className="space-y-4 font-mono text-xs text-slate-200">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                OUTGOING SENTRY:
              </span>
              <span className="font-black text-amber-300 text-sm">
                {handoverOutgoing.name} ({handoverOutgoing.rank})
              </span>
            </div>

            <div>
              <label className="text-[11px] text-cyan-400 font-bold uppercase block mb-1">
                SELECT REPLACEMENT SENTRY:
              </label>
              <select
                required
                value={handoverIncomingId}
                onChange={(e) => setHandoverIncomingId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-xs text-slate-100 font-bold focus:outline-none focus:border-cyan-500 font-mono min-h-[44px]"
              >
                {offDutyGuards.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.rank} • Callsign: {g.callSign})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-bold uppercase block mb-1">
                TURNOVER NOTE (OPTIONAL):
              </label>
              <input
                type="text"
                value={handoverNote}
                onChange={(e) => setHandoverNote(e.target.value)}
                placeholder="e.g. All clear, perimeter quiet, fog low."
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setHandoverOutgoing(null)}
                className="px-4 py-2.5 bg-slate-900 text-slate-400 rounded text-xs"
              >
                Cancel
              </button>
              <TacticalButton
                variant="primary"
                size="md"
                type="submit"
                disabled={!handoverIncomingId}
                className="min-h-[44px] font-black"
              >
                CONFIRM HANDOVER (1-TAP)
              </TacticalButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
