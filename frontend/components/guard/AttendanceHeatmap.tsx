import React from "react";
import { AttendanceRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AttendanceHeatmapProps {
  records: AttendanceRecord[];
  className?: string;
}

export const AttendanceHeatmap: React.FC<AttendanceHeatmapProps> = ({ records, className }) => {
  const statusColors = {
    present: "bg-[#1c1b1b] border-[#F5F5F0] text-[#F5F5F0]",
    late: "bg-[#2a2a2a] border-[#8f918c] text-[#c5c7c1]",
    absent: "bg-[#93000a] border-[#ffb4ab] text-[#ffdad6]",
    leave: "bg-[#131313] border-[#454843] text-[#8f918c]",
    swap: "bg-[#353534] border-[#8f918c] text-[#F5F5F0]",
  };

  const total = records.length;
  const presentCount = records.filter((r) => r.status === "present" || r.status === "swap").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const attendanceRate = total > 0 ? (((presentCount + lateCount) / total) * 100).toFixed(1) : "100";

  return (
    <div className={cn("p-4 bg-[#131313] border border-[#454843] rounded-none font-mono", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h4 className="text-xs font-bold text-[#F5F5F0] uppercase tracking-widest">
            30-DAY OPERATIONAL ATTENDANCE HEATMAP
          </h4>
          <p className="text-[10px] text-[#8f918c] mt-0.5 font-sans">
            Historical sentry post fulfillment and duty punctuality records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8f918c] font-bold uppercase">COMPLIANCE:</span>
          <span className="text-xs font-bold text-[#121212] bg-[#F5F5F0] px-2.5 py-0.5 rounded-none">
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
                "h-8 rounded-none border flex flex-col items-center justify-center p-1 transition-colors cursor-pointer group relative font-bold text-[10px]",
                statusColors[r.status]
              )}
              title={`${r.date}: ${r.status.toUpperCase()} (${r.hours} hrs on post)`}
            >
              <span>{dayNum}</span>
              <span className="text-[7px] font-mono leading-none opacity-80 uppercase">
                {r.status[0]}
              </span>

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-[#131313] border border-[#454843] text-[#F5F5F0] text-[9px] rounded-none whitespace-nowrap hidden group-hover:block z-20 pointer-events-none">
                {r.date} • {r.status.toUpperCase()} ({r.hours}h)
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center gap-3 pt-3 mt-2 border-t border-[#454843] text-[10px] text-[#8f918c]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#1c1b1b] border border-[#F5F5F0]" />
          <span>Present (P)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#2a2a2a] border border-[#8f918c]" />
          <span>Late Shift (L)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#353534] border border-[#8f918c]" />
          <span>Shift Swap (S)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#131313] border border-[#454843]" />
          <span>Approved Leave (V)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-[#93000a] border border-[#ffb4ab]" />
          <span>Absent (A)</span>
        </div>
      </div>
    </div>
  );
};
