import React from "react";
import { cn } from "@/lib/utils";

interface TacticalCardProps {
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  glow?: "none" | "cyan" | "red" | "amber" | "green";
  compact?: boolean;
}

export const TacticalCard: React.FC<TacticalCardProps> = ({
  title,
  subtitle,
  badge,
  headerAction,
  children,
  className,
  contentClassName,
  glow = "none",
  compact = false,
}) => {
  const glowStyles = {
    none: "",
    cyan: "shadow-[0_0_15px_rgba(6,182,212,0.15)] border-cyan-900/60",
    red: "shadow-[0_0_15px_rgba(244,63,94,0.2)] border-rose-900/70",
    amber: "shadow-[0_0_15px_rgba(245,158,11,0.15)] border-amber-900/60",
    green: "shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-900/60",
  }[glow];

  return (
    <div
      className={cn(
        "relative bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-sm overflow-hidden flex flex-col transition-all duration-200",
        glowStyles,
        className
      )}
    >
      {/* Corner Bracket Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/60 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/60 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-slate-700 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-700 pointer-events-none z-10" />

      {/* Header */}
      {(title || subtitle || badge || headerAction) && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-slate-800/90 bg-slate-950/60 px-3.5 py-2.5 shrink-0",
            compact && "py-1.5 px-3"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {title && (
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="font-mono text-[10px] text-slate-400 truncate hidden sm:inline">
                [{subtitle}]
              </span>
            )}
            {badge && <div>{badge}</div>}
          </div>
          {headerAction && <div className="flex items-center gap-2 shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Content */}
      <div className={cn("p-3.5 flex-1", compact && "p-2.5", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
