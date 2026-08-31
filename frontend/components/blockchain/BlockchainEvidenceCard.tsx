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
    <div className="p-4 bg-[#1c1b1b] border border-[#454843] rounded-none space-y-3 font-mono">
      <div className="flex items-center justify-between gap-3 border-b border-[#454843] pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#F5F5F0]" />
          <span className="text-[11px] text-[#F5F5F0] font-bold uppercase tracking-widest">
            EVIDENCE_REGISTRY // CRYPTO_ANCHOR
          </span>
        </div>
        <span
          className={`text-[10px] px-2.5 py-1 rounded-none border font-bold uppercase tracking-wider ${
            isVerified
              ? "text-[#121212] bg-[#F5F5F0] border-[#F5F5F0]"
              : "text-[#e5e2e1] bg-[#2a2a2a] border-[#8f918c]"
          }`}
        >
          {isVerified ? "VERIFIED_ON_CHAIN" : status.replaceAll("_", " ")}
        </span>
      </div>

      <p className="text-[11px] text-[#c5c7c1] font-sans leading-relaxed">
        Cryptographic hashing at capture. Immutable incident reference anchored on-chain while raw media remains in private evidence storage.
      </p>

      {(verification?.evidenceSha256 || alert.evidenceSha256) && (
        <div className="p-2.5 bg-[#131313] border-l-2 border-[#F5F5F0] text-[11px] text-[#8f918c] break-all">
          <span className="text-[#c5c7c1] block text-[10px] uppercase font-bold mb-0.5">CRYPTO_HASH (SHA-256):</span>
          <span className="text-[#F5F5F0]">{verification?.evidenceSha256 || alert.evidenceSha256}</span>
        </div>
      )}

      {verification?.transactionHash && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#8f918c] break-all bg-[#131313] p-2 border border-[#454843]">
          <Link2 className="w-3.5 h-3.5 text-[#F5F5F0] shrink-0" />
          <span>TX_HASH:</span> <span className="text-[#F5F5F0] font-bold">{verification.transactionHash}</span>
        </div>
      )}

      {verification?.message && <p className="text-[11px] text-[#e5e2e1]">{verification.message}</p>}
      {error && <p className="text-[11px] text-[#ffb4ab]">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={verify}
          disabled={busy}
          className="px-4 py-2 bg-[#F5F5F0] hover:bg-white text-[#121212] border border-[#F5F5F0] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-opacity"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
          VERIFY HASH
        </button>
        {!isVerified && (
          <button
            onClick={anchor}
            disabled={busy}
            className="px-4 py-2 bg-transparent hover:bg-[#2a2a2a] text-[#F5F5F0] border border-[#8f918c] rounded-none text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            ANCHOR TO CHAIN
          </button>
        )}
      </div>
    </div>
  );
}
