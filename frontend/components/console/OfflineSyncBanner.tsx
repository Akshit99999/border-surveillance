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
    <div className="fixed bottom-4 right-4 z-50 bg-rose-950 border-2 border-rose-500 rounded p-3.5 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-5 font-mono">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-900 border border-rose-600 rounded shrink-0">
          <WifiOff className="w-5 h-5 text-rose-300 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-rose-200 uppercase tracking-wider">
              OFFLINE BUFFER ACTIVE
            </h4>
            <span className="text-[10px] bg-rose-900 text-rose-100 px-2 py-0.5 rounded border border-rose-700 font-bold">
              {totalQueued} QUEUED
            </span>
          </div>
          <p className="text-xs text-rose-200 mt-1 font-semibold">
            {totalQueued > 0 ? `${totalQueued} updates waiting to sync locally.` : "The Django API is unavailable. New operator actions will remain local until it returns."}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            {totalQueued > 0 && (
              <button
                onClick={flushOfflineQueue}
                className="text-xs text-cyan-300 hover:text-cyan-200 font-bold underline"
              >
                Sync Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
