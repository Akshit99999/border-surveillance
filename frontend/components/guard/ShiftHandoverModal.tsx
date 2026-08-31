import React, { useState } from "react";
import { Modal } from "../shared/Modal";
import { TacticalButton } from "../shared/TacticalButton";
import { Guard } from "@/lib/types";
import { CheckSquare, Square, ShieldCheck } from "lucide-react";
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
      subtitle="Formal Human Accountability Transfer Protocol"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs text-[#e5e2e1]">
        {/* Outgoing vs Incoming Guard Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#1c1b1b] border border-[#454843]">
          {/* Outgoing */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block">
              OUTGOING SENTRY
            </label>
            <select
              value={outgoingId}
              onChange={(e) => setOutgoingId(e.target.value)}
              className="w-full bg-[#131313] border border-[#454843] rounded-none p-2 text-xs text-[#F5F5F0] focus:border-[#F5F5F0] font-mono"
            >
              {activeGuards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.currentPostId || g.currentSector})
                </option>
              ))}
            </select>
            {selectedOutgoing && (
              <div className="text-[10px] text-[#8f918c] mt-1">
                Post: <span className="text-[#F5F5F0] font-semibold">{selectedOutgoing.currentPostId}</span> • Callsign: {selectedOutgoing.callSign}
              </div>
            )}
          </div>

          {/* Incoming */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block">
              INCOMING SENTRY
            </label>
            <select
              value={incomingId}
              onChange={(e) => setIncomingId(e.target.value)}
              className="w-full bg-[#131313] border border-[#454843] rounded-none p-2 text-xs text-[#F5F5F0] focus:border-[#F5F5F0] font-mono"
            >
              {offDutyGuards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (Callsign: {g.callSign})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-2 p-3 bg-[#1c1b1b] border border-[#454843]">
          <span className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block mb-1">
            MANDATORY TURNOVER CHECKLIST
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { key: "weaponVerified", label: "Weapons & Ammo Accounted" },
              { key: "sensorsChecked", label: "Breakbeams & CCTV Clear" },
              { key: "openIncidentsBriefed", label: "Open Threat Log Briefed" },
              { key: "radioChannelTested", label: "Radio Channel Frequency OK" },
            ].map(({ key, label }) => {
              const isChecked = checklist[key as keyof typeof checklist];
              return (
                <div
                  key={key}
                  onClick={() => toggleCheck(key as keyof typeof checklist)}
                  className="flex items-center gap-2 cursor-pointer p-2 bg-[#131313] border border-[#454843] text-xs hover:border-[#8f918c]"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#F5F5F0]" />
                  ) : (
                    <Square className="w-4 h-4 text-[#8f918c]" />
                  )}
                  <span className={isChecked ? "text-[#F5F5F0]" : "text-[#8f918c]"}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Turnover Log Note */}
        <div>
          <label className="text-[10px] text-[#8f918c] font-bold uppercase tracking-widest block mb-1">
            HANDOVER LOG NOTE:
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. All clear, zero line calm, weather foggy."
            className="w-full bg-[#131313] border border-[#454843] rounded-none p-2.5 text-xs text-[#F5F5F0] placeholder:text-[#454843] focus:border-[#F5F5F0] font-mono"
          />
        </div>

        <div className="pt-3 flex items-center justify-between border-t border-[#454843]">
          <div className="text-[10px] text-[#8f918c] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#F5F5F0]" />
            <span>IMMUTABLE AUDIT ENTRY WILL BE LOGGED</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1c1b1b] text-[#8f918c] hover:text-[#F5F5F0] border border-[#454843] text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <TacticalButton
              variant="primary"
              size="md"
              type="submit"
              disabled={!outgoingId || !incomingId || !allChecked}
              className="font-bold"
            >
              EXECUTE HANDOVER
            </TacticalButton>
          </div>
        </div>
      </form>
    </Modal>
  );
};
