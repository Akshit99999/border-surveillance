import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "lg",
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0e0e0e]/90 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full bg-[#131313] border border-[#454843] rounded-none flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in duration-100",
          maxWidthStyles,
          className
        )}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1c1b1b] border-b border-[#454843]">
          <div>
            <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-[#F5F5F0]">
              {title}
            </h2>
            {subtitle && (
              <p className="font-mono text-[10px] text-[#8f918c] mt-0.5">// {subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#8f918c] hover:text-[#F5F5F0] p-1.5 hover:bg-[#2a2a2a] transition-colors rounded-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#131313] text-[#e5e2e1]">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#1c1b1b] border-t border-[#454843]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
