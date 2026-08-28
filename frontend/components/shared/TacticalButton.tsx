import React from "react";
import { cn } from "@/lib/utils";
import { tacticalSound } from "@/lib/sound";

interface TacticalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

export const TacticalButton: React.FC<TacticalButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className,
  onClick,
  disabled,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    if (variant === "danger") {
      tacticalSound.playWarning();
    } else {
      tacticalSound.playClick();
    }
    if (onClick) onClick(e);
  };

  const baseStyles =
    "relative inline-flex items-center justify-center font-mono font-medium uppercase tracking-wider transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none rounded-sm border";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-xs px-3.5 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_16px_rgba(6,182,212,0.4)]",
    secondary:
      "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-500",
    danger:
      "bg-rose-950/90 hover:bg-rose-900 text-rose-200 border-rose-600/80 shadow-[0_0_12px_rgba(244,63,94,0.3)] hover:shadow-[0_0_18px_rgba(244,63,94,0.5)]",
    warning:
      "bg-amber-950/90 hover:bg-amber-900 text-amber-200 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 border-slate-700 hover:border-cyan-500/70 hover:text-cyan-300",
    ghost:
      "bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 border-transparent",
  }[variant];

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
