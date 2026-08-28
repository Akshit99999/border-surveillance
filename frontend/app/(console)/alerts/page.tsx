"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
  Phone,
  UserCheck,
  Fingerprint,
  Car,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { Alert } from "@/lib/types";
import { StatusPill } from "@/components/shared/StatusPill";
import { TacticalButton } from "@/components/shared/TacticalButton";
import { Modal } from "@/components/shared/Modal";
import { formatTimeIST, formatDateIST } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";
import { BlockchainEvidenceCard } from "@/components/blockchain/BlockchainEvidenceCard";

export default function AlertsPage() {
  const { alerts, guards, acknowledgeAlert, escalateAlert } = useIBVAPStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "PERIMETER" | "POI" | "ANPR" | "OPEN">("ALL");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    const matchSearch =
      a.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sourceCameraId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isPoi = a.eventType.includes("POI") || a.eventType.includes("Facial");
    const isAnpr = a.eventType.includes("ANPR") || a.objectClass === "Vehicle";
    const isPerimeter = a.objectClass === "Person" || a.objectClass === "Weapon" || a.objectClass === "Drone";

    let matchCategory = true;
    if (categoryFilter === "OPEN") matchCategory = a.status === "open";
    else if (categoryFilter === "POI") matchCategory = isPoi;
    else if (categoryFilter === "ANPR") matchCategory = isAnpr;
    else if (categoryFilter === "PERIMETER") matchCategory = isPerimeter && !isPoi;

    return matchSearch && matchCategory;
  });

  const linkedGuard = selectedAlert
    ? guards.find((g) => g.currentSector === selectedAlert.sector)
    : null;

  return (
    <div className="space-y-4 font-mono">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-rose-950 border border-rose-600 flex items-center justify-center text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-100 uppercase tracking-widest">
              BORDER THREAT ALERTS & RECONNAISSANCE
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Real-time feed of perimeter incursions, POI watchlist matches, and ANPR vehicle alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-rose-400 font-bold bg-rose-950 px-2.5 py-1 rounded border border-rose-700">
            {alerts.filter((a) => a.status === "open").length} UNRESOLVED
          </span>
        </div>
      </div>

      {/* Quick Category Filter Chips - Large Tap Targets */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { key: "ALL", label: `ALL ALERTS (${alerts.length})` },
          { key: "OPEN", label: `OPEN ONLY (${alerts.filter((a) => a.status === "open").length})` },
          { key: "PERIMETER", label: "PERIMETER & WEAPONS" },
          { key: "POI", label: "POI & FACE MATCHES" },
          { key: "ANPR", label: "VEHICLES & ANPR" },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => {
              tacticalSound.playClick();
              setCategoryFilter(chip.key as any);
            }}
            className={`px-4 py-2 rounded border text-xs font-black tracking-wider transition-all min-h-[40px] ${
              categoryFilter === chip.key
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by threat, suspect name, vehicle plate, or sector..."
          className="w-full bg-slate-900 border border-slate-700 rounded py-3 pl-11 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono min-h-[46px]"
        />
      </div>

      {/* High-Contrast Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded text-slate-400 text-xs">
            No incident alerts match your filter criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.level === "critical";
            const isOpen = alert.status === "open";
            const isPoi = alert.eventType.includes("POI");
            const isAnpr = alert.eventType.includes("ANPR");

            return (
              <div
                key={alert.id}
                onClick={() => {
                  tacticalSound.playClick();
                  setSelectedAlert(alert);
                }}
                className={`p-4 rounded border font-mono cursor-pointer transition-all ${
                  isOpen && isCritical
                    ? "bg-rose-950/30 border-rose-600/90 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="relative w-20 h-16 rounded bg-slate-950 border border-slate-700 overflow-hidden shrink-0 shadow">
                      <img
                        src={alert.evidenceUrl}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                      {isPoi && (
                        <div className="absolute top-0 right-0 p-1 bg-cyan-600 text-slate-950">
                          <Fingerprint className="w-3 h-3" />
                        </div>
                      )}
                      {isAnpr && (
                        <div className="absolute top-0 right-0 p-1 bg-amber-600 text-slate-950">
                          <Car className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <StatusPill type={alert.level} size="sm" />
                        <span className="text-[10px] text-slate-400">{alert.id}</span>
                        <span className="text-[10px] text-cyan-400 font-bold ml-auto sm:ml-0">
                          {formatTimeIST(alert.timestamp)}
                        </span>
                      </div>

                      <h3 className="text-sm font-black text-slate-100 mt-1 truncate">
                        {alert.eventType}
                      </h3>

                      <p className="text-xs text-slate-300 font-sans mt-0.5 line-clamp-1">
                        {alert.notes}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>Cam: <strong className="text-slate-200">{alert.sourceCameraId}</strong></span>
                        <span>•</span>
                        <span>Sector: <strong className="text-slate-200">{alert.sector}</strong></span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">Conf: {alert.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Action Buttons (Max 1-Tap) */}
                  <div
                    className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOpen ? (
                      <>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-xs font-black min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>ACKNOWLEDGE</span>
                        </button>

                        <button
                          onClick={() => escalateAlert(alert.id)}
                          className="flex-1 md:flex-none px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500 rounded text-xs font-black min-h-[44px] flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>ESCALATE (QRF)</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <StatusPill type={alert.status} size="md" />
                        <span className="text-xs text-slate-400 font-sans hidden sm:inline">
                          by {alert.acknowledgedBy || "Operator"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Alert Evidence Modal */}
      {selectedAlert && (
        <Modal
          isOpen={Boolean(selectedAlert)}
          onClose={() => setSelectedAlert(null)}
          title={`INCIDENT DOSSIER: ${selectedAlert.id}`}
          subtitle={`${selectedAlert.sector} • ${formatDateIST(selectedAlert.timestamp)} ${formatTimeIST(selectedAlert.timestamp)}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 font-mono text-xs text-slate-200">
            {/* Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusPill type={selectedAlert.level} size="md" />
                <StatusPill type={selectedAlert.status} size="md" />
              </div>
              <span className="text-emerald-400 font-black text-sm">
                AI CONFIDENCE: {selectedAlert.confidence}%
              </span>
            </div>

            {/* Evidence Image */}
            <div className="relative aspect-video bg-slate-950 border border-slate-700 rounded overflow-hidden shadow-2xl">
              <img
                src={selectedAlert.evidenceUrl}
                alt="High-Res Evidence"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 text-[10px] bg-black/80 px-2 py-0.5 rounded text-cyan-300">
                SOURCE: {selectedAlert.sourceCameraId}
              </div>
            </div>

            {/* Description */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1">
              <h4 className="font-black text-cyan-300 text-sm">{selectedAlert.eventType}</h4>
              <p className="text-slate-300 font-sans text-xs leading-relaxed">{selectedAlert.notes}</p>
            </div>

            <BlockchainEvidenceCard alert={selectedAlert} />

            {/* Sentry On Duty Call Option */}
            {linkedGuard && (
              <div className="p-3 bg-slate-950 border border-emerald-600/70 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    ON-DUTY SENTRY FOR THIS SECTOR:
                  </span>
                  <span className="font-bold text-slate-100">{linkedGuard.name} ({linkedGuard.callSign})</span>
                </div>
                <a
                  href={`tel:${linkedGuard.phone.replace(/\s+/g, "")}`}
                  className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-xs font-black flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>CALL SENTRY</span>
                </a>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              {selectedAlert.status === "open" && (
                <>
                  <button
                    onClick={() => {
                      acknowledgeAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-500 rounded text-xs font-black min-h-[44px]"
                  >
                    ACKNOWLEDGE
                  </button>
                  <button
                    onClick={() => {
                      escalateAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="px-4 py-2.5 bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-500 rounded text-xs font-black min-h-[44px]"
                  >
                    ESCALATE TO QRF
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
