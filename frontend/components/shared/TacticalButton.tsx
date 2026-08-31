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
    "relative inline-flex items-center justify-center font-mono font-medium uppercase tracking-widest transition-all select-none rounded-none border disabled:opacity-40 disabled:pointer-events-none";

  const sizeStyles = {
    sm: "text-[11px] px-3 py-1.5 gap-1.5",
    md: "text-xs px-4 py-2 gap-2",
    lg: "text-xs px-6 py-3 gap-2.5",
  }[size];

  const variantStyles = {
    primary:
      "bg-[#F5F5F0] text-[#121212] border-[#F5F5F0] hover:bg-white hover:opacity-90 font-bold active:scale-[0.99]",
    secondary:
      "bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#e5e2e1] border-[#454843] hover:border-[#8f918c]",
    danger:
      "bg-[#93000a] hover:bg-[#b00020] text-[#ffdad6] border-[#ffb4ab]/60 font-bold",
    warning:
      "bg-[#353534] hover:bg-[#494949] text-[#e5e2e1] border-[#8f918c]",
    outline:
      "bg-transparent hover:bg-[#1c1b1b] text-[#e5e2e1] border-[#454843] hover:border-[#F5F5F0]",
    ghost:
      "bg-transparent hover:bg-[#201f1f] text-[#c5c7c1] hover:text-[#e5e2e1] border-transparent",
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
