import React from "react";
import { cn } from "@/lib/utils";

export type StatusPillType =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "on_post"
  | "patrolling"
  | "break"
  | "unreachable"
  | "off_duty"
  | "online"
  | "offline"
  | "signal_lost"
  | "blacklisted"
  | "authorized"
  | "suspicious"
  | "flagged";

interface StatusPillProps {
  type: StatusPillType | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  type,
  label,
  size = "md",
  pulse,
  className,
}) => {
  const normalizedType = type.toLowerCase().replace(/\s+/g, "_");

  let colorClasses = "bg-slate-800 text-slate-300 border-slate-700";
  let dotClass = "bg-slate-400";
  let displayLabel = label || type.toUpperCase().replace(/_/g, " ");
  let shouldPulse = pulse;

  switch (normalizedType) {
    case "critical":
    case "signal_lost":
    case "blacklisted":
    case "unreachable":
      colorClasses = "bg-rose-950/80 text-rose-300 border-rose-600/60 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
      dotClass = "bg-rose-500";
      shouldPulse = shouldPulse ?? true;
      if (normalizedType === "signal_lost") displayLabel = label || "SIGNAL LOST";
      break;

    case "high":
    case "break":
    case "suspicious":
    case "flagged":
      colorClasses = "bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      dotClass = "bg-amber-500";
      if (normalizedType === "high") displayLabel = label || "HIGH";
      break;

    case "medium":
    case "patrolling":
    case "elevated":
      colorClasses = "bg-sky-950/80 text-sky-300 border-sky-600/60 shadow-[0_0_8px_rgba(56,189,248,0.15)]";
      dotClass = "bg-sky-400";
      if (normalizedType === "patrolling") displayLabel = label || "PATROLLING";
      break;

    case "online":
    case "on_post":
    case "authorized":
    case "low":
      colorClasses = "bg-emerald-950/80 text-emerald-300 border-emerald-600/60 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
      dotClass = "bg-emerald-400";
      if (normalizedType === "on_post") displayLabel = label || "ON POST";
      if (normalizedType === "online") displayLabel = label || "ONLINE";
      break;

    case "offline":
    case "off_duty":
      colorClasses = "bg-slate-900/80 text-slate-400 border-slate-700";
      dotClass = "bg-slate-500";
      if (normalizedType === "off_duty") displayLabel = label || "OFF DUTY";
      break;
  }

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 tracking-wider font-mono",
    md: "text-xs px-2.5 py-1 tracking-wider font-mono",
    lg: "text-sm px-3.5 py-1.5 tracking-wide font-mono",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-sm border uppercase transition-all duration-200 select-none",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full",
          size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5",
          dotClass,
          shouldPulse && "animate-pulse"
        )}
      />
      <span>{displayLabel}</span>
    </span>
  );
};
