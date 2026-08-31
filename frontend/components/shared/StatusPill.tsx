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

  let colorClasses = "bg-[#1c1b1b] text-[#c5c7c1] border-[#454843]";
  let dotClass = "bg-[#8f918c]";
  let displayLabel = label || type.toUpperCase().replace(/_/g, " ");
  let shouldPulse = pulse;

  switch (normalizedType) {
    case "critical":
    case "signal_lost":
    case "blacklisted":
    case "unreachable":
      colorClasses = "bg-[#93000a]/40 text-[#ffdad6] border-[#ffb4ab]/80";
      dotClass = "bg-[#ffb4ab]";
      shouldPulse = shouldPulse ?? true;
      if (normalizedType === "signal_lost") displayLabel = label || "SIGNAL LOST";
      break;

    case "high":
    case "break":
    case "suspicious":
    case "flagged":
      colorClasses = "bg-[#2a2a2a] text-[#e5e2e1] border-[#8f918c]";
      dotClass = "bg-[#c8c6c6]";
      if (normalizedType === "high") displayLabel = label || "HIGH";
      break;

    case "medium":
    case "patrolling":
    case "elevated":
      colorClasses = "bg-[#1c1b1b] text-[#e5e2e1] border-[#454843]";
      dotClass = "bg-[#ffffff]";
      if (normalizedType === "patrolling") displayLabel = label || "PATROLLING";
      break;

    case "online":
    case "on_post":
    case "authorized":
    case "low":
      colorClasses = "bg-[#1c1b1b] text-[#ffffff] border-[#8f918c]";
      dotClass = "bg-[#ffffff]";
      if (normalizedType === "on_post") displayLabel = label || "ON POST";
      if (normalizedType === "online") displayLabel = label || "ONLINE";
      break;

    case "offline":
    case "off_duty":
      colorClasses = "bg-[#131313] text-[#8f918c] border-[#454843]";
      dotClass = "bg-[#454843]";
      if (normalizedType === "off_duty") displayLabel = label || "OFF DUTY";
      break;
  }

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 tracking-wider font-mono",
    md: "text-xs px-2.5 py-1 tracking-wider font-mono",
    lg: "text-xs px-3.5 py-1.5 tracking-widest font-mono",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold rounded-none border uppercase transition-colors select-none",
        sizeClasses,
        colorClasses,
        className
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full shrink-0",
          size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-2.5 h-2.5",
          dotClass,
          shouldPulse && "animate-pulse"
        )}
      />
      <span>{displayLabel}</span>
    </span>
  );
};
