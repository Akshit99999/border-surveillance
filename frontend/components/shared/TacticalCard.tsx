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
  compact = false,
}) => {
  return (
    <div
      className={cn(
        "relative bg-[#131313] border border-[#454843] rounded-none overflow-hidden flex flex-col transition-colors",
        className
      )}
    >
      {/* Header */}
      {(title || subtitle || badge || headerAction) && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-[#454843] bg-[#1c1b1b] px-4 py-2.5 shrink-0",
            compact && "py-1.5 px-3"
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {title && (
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[#e5e2e1] truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="font-mono text-[10px] text-[#8f918c] truncate hidden sm:inline">
                // {subtitle}
              </span>
            )}
            {badge && <div>{badge}</div>}
          </div>
          {headerAction && <div className="flex items-center gap-2 shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Content */}
      <div className={cn("p-4 flex-1 bg-[#131313]", compact && "p-2.5", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
