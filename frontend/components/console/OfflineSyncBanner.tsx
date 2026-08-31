import React from "react";
import { WifiOff } from "lucide-react";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export const OfflineSyncBanner: React.FC = () => {
  const {
    offlineQueue,
    offlineLogQueue,
    flushOfflineQueue,
    backendStatus,
  } = useIBVAPStore();

  const totalQueued = offlineQueue.length + offlineLogQueue.length;

  if (backendStatus !== "offline" && totalQueued === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-[#1c1b1b] border border-[#ffb4ab] rounded-none p-4 max-w-sm w-full font-mono">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#93000a] text-[#ffdad6] shrink-0">
          <WifiOff className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-wider">
              OFFLINE BUFFER ACTIVE
            </h4>
            <span className="text-[10px] bg-[#93000a] text-[#ffdad6] px-1.5 py-0.5 font-bold">
              {totalQueued} QUEUED
            </span>
          </div>
          <p className="text-[11px] text-[#c5c7c1] mt-1">
            {totalQueued > 0 ? `${totalQueued} updates queued locally.` : "Django API offline. Operator actions preserved locally."}
          </p>

          {totalQueued > 0 && (
            <div className="mt-2 flex items-center justify-end">
              <button
                onClick={flushOfflineQueue}
                className="text-xs text-[#F5F5F0] hover:text-white font-bold underline uppercase tracking-wider"
              >
                SYNC NOW →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
