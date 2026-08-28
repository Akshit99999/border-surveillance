import React from "react";
import { AttendanceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  className?: string;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ records, className }) => {
  const statusColors = {
    present: "bg-emerald-500 hover:bg-emerald-400 border-emerald-400/50 text-emerald-950",
    late: "bg-amber-500 hover:bg-amber-400 border-amber-400/50 text-amber-950",
    absent: "bg-rose-500 hover:bg-rose-400 border-rose-400/50 text-rose-950",
    leave: "bg-sky-500 hover:bg-sky-400 border-sky-400/50 text-sky-950",
    swap: "bg-purple-500 hover:bg-purple-400 border-purple-400/50 text-purple-950",
  };

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present" || r.status === "swap").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const attendanceRate = total > 0 ? (((presentCount + lateCount) / total) * 100).toFixed(1) : "100";

  return (
    <div className={cn("p-4 bg-slate-950/80 border border-slate-800 rounded font-mono", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            30-DAY OPERATIONAL ATTENDANCE HEATMAP
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Historical duty attendance, punctuality, and post fulfillment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">COMPLIANCE RATE:</span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 border border-emerald-700 rounded">
            {attendanceRate}%
          </span>
        </div>
      </div>

      {/* Grid of 30 days */}
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 py-2">
        {records.map((r, idx) => {
          const dayNum = idx + 1;
          return (
            <div
              key={idx}
              className={cn(
                "h-8 rounded-sm border flex flex-col items-center justify-center p-1 transition-all cursor-pointer group relative font-bold text-[10px]",
                statusColors[r.status]
              )}
              title={`${r.date}: ${r.status.toUpperCase()} (${r.hours} hrs on post)`}
            >
              <span>{dayNum}</span>
              <span className="text-[7px] font-mono leading-none opacity-80 uppercase">
                {r.status[0]}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-[9px] rounded shadow-xl whitespace-nowrap hidden group-hover:block z-20 pointer-events-none">
                {r.date} • {r.status.toUpperCase()} ({r.hours}h)
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 mt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
          <span>Present (P)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
          <span>Late Shift (L)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
          <span>Shift Swap (S)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
          <span>Approved Leave (V)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
          <span>Absent (A)</span>
        </div>
      </div>
    </div>
  );
};
