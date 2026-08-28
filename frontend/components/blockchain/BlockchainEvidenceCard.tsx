"use client";

import { useState } from "react";
import { Link2, RefreshCw, ShieldCheck, UploadCloud } from "lucide-react";
import { Alert } from "@/lib/types";
import { backendApi, VerificationResult } from "@/lib/api/client";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export function BlockchainEvidenceCard({ alert }: { alert: Alert }) {
  const hydrateFromBackend = useIBVAPStore((state) => state.hydrateFromBackend);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verify = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await backendApi.verifyAlert(alert.id);
      setVerification(response.verification);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Verification request failed.");
    } finally {
      setBusy(false);
    }
  };

  const anchor = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await backendApi.anchorAlert(alert.id);
      void hydrateFromBackend();
      setVerification({
        status: "verified",
        verified: true,
        incidentReferenceHash: String(response.blockchain.incidentReferenceHash || ""),
        evidenceSha256: String(response.blockchain.evidenceSha256 || ""),
        transactionHash: String(response.blockchain.transactionHash || ""),
        message: "Evidence anchored and confirmed in the append-only registry.",
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Anchor request failed.");
    } finally {
      setBusy(false);
    }
  };

  const status = verification?.status || alert.blockchainStatus || "not_anchored";
  const isVerified = verification?.verified || status === "anchored";

  return (
    <div className="p-3 bg-slate-950 border border-cyan-900/70 rounded space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] text-cyan-300 font-black uppercase tracking-wider">
            Evidence Registry / Blockchain Accountability
          </span>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded border font-black uppercase ${
            isVerified
              ? "text-emerald-300 bg-emerald-950 border-emerald-700"
              : "text-amber-300 bg-amber-950 border-amber-700"
          }`}
        >
          {isVerified ? "VERIFIED" : status.replaceAll("_", " ")}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-sans">
        Django keeps the signer private. The chain stores the incident reference and evidence hash; the image stays in private evidence storage.
      </p>

      {(verification?.evidenceSha256 || alert.evidenceSha256) && (
        <div className="text-[10px] text-slate-500 break-all">
          EVIDENCE SHA-256: <span className="text-cyan-300">{verification?.evidenceSha256 || alert.evidenceSha256}</span>
        </div>
      )}

      {verification?.transactionHash && (
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 break-all">
          <Link2 className="w-3 h-3 shrink-0" /> TX: <span className="text-emerald-300">{verification.transactionHash}</span>
        </div>
      )}

      {verification?.message && <p className="text-[11px] text-slate-300">{verification.message}</p>}
      {error && <p className="text-[11px] text-rose-300">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={verify}
          disabled={busy}
          className="px-3 py-2 bg-cyan-950 hover:bg-cyan-900 disabled:opacity-50 text-cyan-200 border border-cyan-600 rounded text-[10px] font-black flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
          VERIFY HASH
        </button>
        {!isVerified && (
          <button
            onClick={anchor}
            disabled={busy}
            className="px-3 py-2 bg-amber-950 hover:bg-amber-900 disabled:opacity-50 text-amber-200 border border-amber-600 rounded text-[10px] font-black flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            ANCHOR EVIDENCE
          </button>
        )}
      </div>
    </div>
  );
}
