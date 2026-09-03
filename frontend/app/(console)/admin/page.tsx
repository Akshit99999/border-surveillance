"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, KeyRound, ListChecks, Plus, Power, RotateCcw, ShieldCheck, Sliders, Trash2, UserPlus, Volume2, VolumeX } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";
import { GuardStatus, WatchlistStatus, WatchlistType } from "@/lib/types";

const INITIAL_GUARD_FORM = {
  name: "",
  rank: "Rifleman",
  badgeId: "",
  operatorId: "",
  passcode: "",
  phone: "",
  callSign: "",
  sector: "",
  postId: "",
  status: "off_duty" as GuardStatus,
  bloodGroup: "",
  certifications: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
};

const INITIAL_WATCHLIST_FORM = {
  type: "plate" as WatchlistType,
  value: "",
  label: "",
  status: "Blacklisted" as WatchlistStatus,
  reason: "",
};

const inputClass = "w-full border border-[#CBDCEB] bg-[#FFFFFF] px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#0284C7] font-mono";

const accessTierForRank = (rank: string) => {
  const normalized = rank.toLowerCase();
  if (["administrator", "admin"].includes(normalized)) return "ADMIN";
  if (["inspector", "sub-inspector", "assistant commandant", "commandant"].includes(normalized)) return "COMMAND";
  return "FIELD";
};

export default function CameraSettingsAdminPage() {
  const {
    cameras,
    guards,
    addGuard,
    watchlistEntries,
    addWatchlistEntry,
    removeWatchlistEntry,
    toggleCameraActive,
    setCameraSensitivity,
    soundMuted,
    toggleSound,
    resetData,
  } = useIBVAPStore();

  const [guardForm, setGuardForm] = useState(INITIAL_GUARD_FORM);
  const [isSavingGuard, setIsSavingGuard] = useState(false);
  const [guardError, setGuardError] = useState("");
  const [guardSuccess, setGuardSuccess] = useState("");
  const [watchlistForm, setWatchlistForm] = useState(INITIAL_WATCHLIST_FORM);
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [watchlistSuccess, setWatchlistSuccess] = useState("");

  const updateGuardForm = (field: keyof typeof INITIAL_GUARD_FORM, value: string) => {
    setGuardForm((current) => ({ ...current, [field]: value }));
    setGuardError("");
    setGuardSuccess("");
  };

  const handleCreateGuard = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingGuard(true);
    setGuardError("");
    setGuardSuccess("");
    try {
      const created = await addGuard({
        ...guardForm,
        operatorId: guardForm.operatorId || guardForm.badgeId,
      });
      setGuardSuccess(`${created.name} added // ${accessTierForRank(created.rank)} access credentials active.`);
      setGuardForm(INITIAL_GUARD_FORM);
    } catch (error) {
      setGuardError(error instanceof Error ? error.message : "Could not create guard record.");
    } finally {
      setIsSavingGuard(false);
    }
  };

  const handleCreateWatchlistEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSavingWatchlist(true);
    setWatchlistError("");
    setWatchlistSuccess("");
    try {
      const entry = await addWatchlistEntry(watchlistForm);
      setWatchlistSuccess(`${entry.value} added // ${entry.status} watchlist rule active.`);
      setWatchlistForm(INITIAL_WATCHLIST_FORM);
    } catch (error) {
      setWatchlistError(error instanceof Error ? error.message : "Could not create watchlist entry.");
    } finally {
      setIsSavingWatchlist(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-[#FFFFFF] border border-[#CBDCEB] rounded-none p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0284C7] text-white flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest">
              CAMERA SETTINGS // SENSOR_POWER_CONTROL
            </h1>
            <p className="text-[11px] text-[#475569] mt-0.5 font-sans">
              Camera power control, sensitivity thresholds, and audio telemetry configuration.
            </p>
          </div>
        </div>

        {/* Sound Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="px-3.5 py-2 bg-[#F0F6FC] hover:bg-[#E0F2FE] text-[#0369A1] border border-[#CBDCEB] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            {soundMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-[#DC2626]" />
                <span className="text-[#DC2626]">UNMUTE AUDIO</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>AUDIO ACTIVE</span>
              </>
            )}
          </button>

          <button
            onClick={resetData}
            className="px-3.5 py-2 bg-[#F0F6FC] hover:bg-[#E0F2FE] text-[#475569] hover:text-[#0F172A] border border-[#CBDCEB] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            title="Clear server records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET CACHE</span>
          </button>
        </div>
      </div>

      {/* Guard Registry & Credential Provisioning */}
      <section className="border border-[#CBDCEB] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#CBDCEB] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-[#0284C7] text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F172A]">GUARD REGISTRY // CREDENTIAL PROVISIONING</h2>
              <p className="mt-1 text-[11px] text-[#475569]">Create a guard profile and a rank-based console login. Passwords are hashed by Django and never returned to the browser.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-[#BAE6FD] bg-[#F0F9FF] px-2.5 py-1.5 text-[10px] font-bold uppercase text-[#0369A1]">
            <ShieldCheck className="h-3.5 w-3.5" /> ADMIN ONLY
          </div>
        </div>

        <form onSubmit={handleCreateGuard} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Full name *
              <input required value={guardForm.name} onChange={(event) => updateGuardForm("name", event.target.value)} placeholder="Rifleman Priya Sharma" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Rank *
              <select required value={guardForm.rank} onChange={(event) => updateGuardForm("rank", event.target.value)} className={inputClass}>
                <option>Rifleman</option>
                <option>Constable</option>
                <option>Assistant Sub-Inspector</option>
                <option>Head Constable</option>
                <option>Sub-Inspector</option>
                <option>Inspector</option>
              </select>
            </label>
            <div className="border border-[#CBDCEB] bg-[#F0F6FC] px-3 py-2 text-[10px] font-bold uppercase text-[#475569]">
              Access tier
              <div className="mt-1 text-sm text-[#0284C7]">{accessTierForRank(guardForm.rank)}</div>
              <div className="mt-0.5 text-[9px] font-normal normal-case text-[#64748B]">Derived from rank automatically</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Badge ID *
              <input required value={guardForm.badgeId} onChange={(event) => updateGuardForm("badgeId", event.target.value)} placeholder="SSB-3012" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Operator ID
              <input value={guardForm.operatorId} onChange={(event) => updateGuardForm("operatorId", event.target.value)} placeholder="Defaults to badge ID" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Login passcode *
              <input required minLength={6} type="password" value={guardForm.passcode} onChange={(event) => updateGuardForm("passcode", event.target.value)} placeholder="Minimum 6 characters" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Call sign
              <input value={guardForm.callSign} onChange={(event) => updateGuardForm("callSign", event.target.value)} placeholder="ALPHA-3" className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Phone
              <input type="tel" value={guardForm.phone} onChange={(event) => updateGuardForm("phone", event.target.value)} placeholder="+91 98765 43210" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Sector
              <input value={guardForm.sector} onChange={(event) => updateGuardForm("sector", event.target.value)} placeholder="Sector Alpha" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Current post
              <input value={guardForm.postId} onChange={(event) => updateGuardForm("postId", event.target.value)} placeholder="POST-A3-RIDGE" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Duty status
              <select value={guardForm.status} onChange={(event) => updateGuardForm("status", event.target.value)} className={inputClass}>
                <option value="off_duty">Off duty</option>
                <option value="on_post">On post</option>
                <option value="patrolling">Patrolling</option>
                <option value="break">Break</option>
                <option value="unreachable">Unreachable</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Blood group
              <input value={guardForm.bloodGroup} onChange={(event) => updateGuardForm("bloodGroup", event.target.value)} placeholder="O+" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Certifications
              <input value={guardForm.certifications} onChange={(event) => updateGuardForm("certifications", event.target.value)} placeholder="First Aid, Night Vision" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Emergency contact
              <input value={guardForm.emergencyContactName} onChange={(event) => updateGuardForm("emergencyContactName", event.target.value)} placeholder="Name" className={inputClass} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Emergency phone
              <input type="tel" value={guardForm.emergencyContactPhone} onChange={(event) => updateGuardForm("emergencyContactPhone", event.target.value)} placeholder="+91 98765 43211" className={inputClass} />
            </label>
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Relationship
              <input value={guardForm.emergencyContactRelation} onChange={(event) => updateGuardForm("emergencyContactRelation", event.target.value)} placeholder="Father / Brother" className={inputClass} />
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#CBDCEB] pt-4">
            <div className="text-[10px] text-[#64748B]">Credentials use the entered Operator ID and passcode. Keep them with the assigned guard.</div>
            <button type="submit" disabled={isSavingGuard} className="inline-flex items-center gap-2 border border-[#0284C7] bg-[#0284C7] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#0369A1] disabled:cursor-wait disabled:opacity-60">
              {isSavingGuard ? <KeyRound className="h-3.5 w-3.5 animate-pulse" /> : <Plus className="h-3.5 w-3.5" />}
              {isSavingGuard ? "PROVISIONING..." : "ADD GUARD & CREDENTIALS"}
            </button>
          </div>

          {guardError && <div className="flex items-center gap-2 border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[10px] font-bold text-[#B91C1C]"><AlertCircle className="h-3.5 w-3.5" /> {guardError}</div>}
          {guardSuccess && <div className="flex items-center gap-2 border border-[#86EFAC] bg-[#F0FDF4] px-3 py-2 text-[10px] font-bold text-[#166534]"><CheckCircle2 className="h-3.5 w-3.5" /> {guardSuccess}</div>}
        </form>

        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
          {guards.map((guard) => (
            <div key={guard.id} className="flex items-center justify-between border border-[#CBDCEB] bg-[#F8FBFE] px-3 py-2.5 text-[10px]">
              <div>
                <div className="font-bold text-[#0F172A]">{guard.name} <span className="font-normal text-[#64748B]">// {guard.rank}</span></div>
                <div className="mt-0.5 text-[#64748B]">{guard.badgeId} {guard.currentSector ? `// ${guard.currentSector}` : "// UNASSIGNED"}</div>
              </div>
              <span className="border border-[#BAE6FD] bg-[#E0F2FE] px-2 py-1 font-bold text-[#0369A1]">{accessTierForRank(guard.rank)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Watchlist Management */}
      <section className="border border-[#CBDCEB] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#CBDCEB] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-[#DC2626] text-white">
              <ListChecks className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#0F172A]">WATCHLIST CONTROL // ANPR & FACE INTELLIGENCE</h2>
              <p className="mt-1 text-[11px] text-[#475569]">Create demo-safe plate or face watch rules. A matching plate from an active video source creates a logged incident.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-[#FCA5A5] bg-[#FEF2F2] px-2.5 py-1.5 text-[10px] font-bold uppercase text-[#991B1B]">
            <Eye className="h-3.5 w-3.5" /> ADMIN ONLY
          </div>
        </div>

        <form onSubmit={handleCreateWatchlistEntry} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Record type *
              <select required value={watchlistForm.type} onChange={(event) => setWatchlistForm((current) => ({ ...current, type: event.target.value as WatchlistType }))} className={inputClass}>
                <option value="plate">License plate</option>
                <option value="face">Face reference</option>
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Match value *
              <input required value={watchlistForm.value} onChange={(event) => setWatchlistForm((current) => ({ ...current, value: event.target.value }))} placeholder={watchlistForm.type === "plate" ? "DL01AB1234" : "subject-reference-07"} className={inputClass} />
            </label>
            <label className="space-y-1.5 md:col-span-2 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Label *
              <input required value={watchlistForm.label} onChange={(event) => setWatchlistForm((current) => ({ ...current, label: event.target.value }))} placeholder="Blacklisted transport" className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="space-y-1.5 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Match status
              <select value={watchlistForm.status} onChange={(event) => setWatchlistForm((current) => ({ ...current, status: event.target.value as WatchlistStatus }))} className={inputClass}>
                <option>Blacklisted</option>
                <option>Suspicious</option>
                <option>Authorized</option>
                <option>Missing Person</option>
                <option>Under Surveillance</option>
              </select>
            </label>
            <label className="space-y-1.5 md:col-span-2 text-[10px] font-bold uppercase tracking-wider text-[#475569]">
              Reason / operator note
              <input value={watchlistForm.reason} onChange={(event) => setWatchlistForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Why this record should be highlighted" className={inputClass} />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#CBDCEB] pt-4">
            <div className="text-[10px] text-[#64748B]">Plate values are normalized for matching. Face entries are ready for approved face-identity adapters.</div>
            <button type="submit" disabled={isSavingWatchlist} className="inline-flex items-center gap-2 border border-[#DC2626] bg-[#DC2626] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#B91C1C] disabled:cursor-wait disabled:opacity-60">
              {isSavingWatchlist ? <KeyRound className="h-3.5 w-3.5 animate-pulse" /> : <Plus className="h-3.5 w-3.5" />}
              {isSavingWatchlist ? "SAVING..." : "ADD WATCHLIST RULE"}
            </button>
          </div>
          {watchlistError && <div className="flex items-center gap-2 border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 text-[10px] font-bold text-[#B91C1C]"><AlertCircle className="h-3.5 w-3.5" /> {watchlistError}</div>}
          {watchlistSuccess && <div className="flex items-center gap-2 border border-[#86EFAC] bg-[#F0FDF4] px-3 py-2 text-[10px] font-bold text-[#166534]"><CheckCircle2 className="h-3.5 w-3.5" /> {watchlistSuccess}</div>}
        </form>

        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
          {watchlistEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-3 border border-[#CBDCEB] bg-[#F8FBFE] px-3 py-2.5 text-[10px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 font-bold text-[#0F172A]"><span className="text-[#DC2626]">{entry.type.toUpperCase()}</span> {entry.value}</div>
                <div className="mt-0.5 truncate text-[#64748B]">{entry.label} // {entry.status}</div>
              </div>
              <button type="button" onClick={() => void removeWatchlistEntry(entry.id)} className="shrink-0 border border-[#FCA5A5] bg-[#FEF2F2] p-2 text-[#B91C1C] hover:bg-[#FEE2E2]" title={`Delete ${entry.value}`} aria-label={`Delete ${entry.value}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified Camera Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map((cam) => {
          const isOnline = cam.status === "online";

          return (
            <div
              key={cam.id}
              className="p-5 bg-[#FFFFFF] border border-[#CBDCEB] rounded-none flex flex-col justify-between space-y-4 shadow-sm"
            >
              {/* Header: Camera ID & Power Switch */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0F172A]">{cam.id}</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#E0F2FE] text-[#0369A1] rounded-none border border-[#BAE6FD] uppercase font-bold">
                      {cam.type}
                    </span>
                  </div>
                  <h4 className="text-xs text-[#475569] font-bold mt-1">{cam.name}</h4>
                  <p className="text-[11px] text-[#64748B]">{cam.sector}</p>
                </div>

                {/* Big Power On/Off Toggle Button */}
                <button
                  onClick={() => toggleCameraActive(cam.id)}
                  className={`px-4 py-2 rounded-none border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm ${
                    isOnline
                      ? "bg-[#0284C7] text-white border-[#0284C7] hover:bg-[#0369A1]"
                      : "bg-[#F1F5F9] text-[#64748B] border-[#CBDCEB] hover:text-[#0F172A]"
                  }`}
                >
                  <Power
                    className={`w-3.5 h-3.5 ${isOnline ? "text-white" : "text-[#64748B]"}`}
                  />
                  <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                </button>
              </div>

              {/* Sensitivity Slider */}
              <div className="p-3.5 bg-[#F0F6FC] border border-[#CBDCEB] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#475569] font-bold uppercase tracking-widest">
                    DETECTION_SENSITIVITY:
                  </span>
                  <span className="text-[#0284C7] font-bold text-sm">
                    {cam.confidenceThreshold}%
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="98"
                  value={cam.confidenceThreshold}
                  onChange={(e) => setCameraSensitivity(cam.id, Number(e.target.value))}
                  disabled={!isOnline}
                  className="w-full h-2 accent-[#0284C7] cursor-pointer disabled:opacity-30"
                />

                <div className="flex justify-between text-[10px] text-[#64748B]">
                  <span>Lower (High Recall)</span>
                  <span>Higher (High Precision)</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
