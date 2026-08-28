import React, { useState } from "react";
import { Modal } from "../shared/Modal";
import { TacticalButton } from "../shared/TacticalButton";
import { Guard } from "@/lib/types";
import { ArrowRight, CheckSquare, Square, ShieldCheck, UserCheck } from "lucide-react";
import { tacticalSound } from "@/lib/sound";

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  guards: Guard[];
  onExecuteHandover: (
    postId: string,
    outgoingGuardId: string,
    incomingGuardId: string,
    notes: string
  ) => void;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  guards,
  onExecuteHandover,
}) => {
  const activeGuards = guards.filter((g) => g.status === "on_post" || g.status === "patrolling");
  const offDutyGuards = guards.filter((g) => g.status === "off_duty" || g.status === "break");

  const [outgoingId, setOutgoingId] = useState<string>(activeGuards[0]?.id || "");
  const [incomingId, setIncomingId] = useState<string>(offDutyGuards[0]?.id || "");
  const [notes, setNotes] = useState<string>("");
  const [checklist, setChecklist] = useState({
    weaponVerified: true,
    sensorsChecked: true,
    openIncidentsBriefed: true,
    radioChannelTested: true,
  });

  const selectedOutgoing = guards.find((g) => g.id === outgoingId);
  const selectedIncoming = guards.find((g) => g.id === incomingId);

  const toggleCheck = (key: keyof typeof checklist) => {
    tacticalSound.playClick();
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outgoingId || !incomingId) return;

    const postId = selectedOutgoing?.currentPostId || "POST-A1-MAIN";
    onExecuteHandover(postId, outgoingId, incomingId, notes || "Routine shift turnover executed smoothly.");
    onClose();
  };

  const allChecked = Object.values(checklist).every(Boolean);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="POST SHIFT TURNOVER & HANDOVER"
      subtitle="Formal Human Accountability & Tactical Responsibility Transfer Protocol"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-slate-200">
        {/* Outgoing vs Incoming Guard Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded">
          {/* Outgoing */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              OUTGOING SENTRY (TRANSFERRING OUT)
            </label>
            <select
              value={outgoingId}
              onChange={(e) => setOutgoingId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-amber-500 focus:outline-none font-mono"
            >
              {activeGuards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.currentPostId || g.currentSector})
                </option>
              ))}
            </select>
            {selectedOutgoing && (
              <div className="text-[10px] text-slate-400 mt-1">
                Post: <span className="text-amber-300 font-semibold">{selectedOutgoing.currentPostId}</span> • Callsign: {selectedOutgoing.callSign}
              </div>
            )}
          </div>

          {/* Incoming */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              INCOMING SENTRY (RELIEF SQUAD)
            </label>
            <select
              value={incomingId}
              onChange={(e) => setIncomingId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
            >
              {offDutyGuards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.rank} • {g.badgeId})
                </option>
              ))}
            </select>
            {selectedIncoming && (
              <div className="text-[10px] text-slate-400 mt-1">
                Blood Group: <span className="text-emerald-300 font-semibold">{selectedIncoming.bloodGroup}</span> • Callsign: {selectedIncoming.callSign}
              </div>
            )}
          </div>
        </div>

        {/* Tactical Verification Checklist */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded space-y-2">
          <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider block">
            MANDATORY COMPLIANCE VERIFICATIONS
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleCheck("weaponVerified")}
              className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-700 rounded text-left hover:border-cyan-500 transition-colors"
            >
              {checklist.weaponVerified ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-[11px]">Assigned Arms & Ammo Checked</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCheck("sensorsChecked")}
              className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-700 rounded text-left hover:border-cyan-500 transition-colors"
            >
              {checklist.sensorsChecked ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-[11px]">Perimeter Tripwires Armed</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCheck("openIncidentsBriefed")}
              className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-700 rounded text-left hover:border-cyan-500 transition-colors"
            >
              {checklist.openIncidentsBriefed ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-[11px]">Active Threat Log Briefed</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCheck("radioChannelTested")}
              className="flex items-center gap-2 p-2 bg-slate-900/90 border border-slate-700 rounded text-left hover:border-cyan-500 transition-colors"
            >
              {checklist.radioChannelTested ? (
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-slate-500 shrink-0" />
              )}
              <span className="text-[11px]">Radio Channel Link Tested</span>
            </button>
          </div>
        </div>

        {/* Handover Observation Notes */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            HANDOVER LOG NOTES & SECTOR OBSERVATIONS
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Fog density increasing along zero line. 1 suspicious pickup sighted at 09:30. Post perimeter secure."
            className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded text-xs"
          >
            Cancel
          </button>
          <TacticalButton
            variant="primary"
            size="md"
            type="submit"
            disabled={!allChecked || !outgoingId || !incomingId}
            icon={<UserCheck className="w-4 h-4" />}
          >
            COMMIT SHIFT TURNOVER
          </TacticalButton>
        </div>
      </form>
    </Modal>
  );
};
