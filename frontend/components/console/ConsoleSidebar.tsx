import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  ShieldAlert,
  MapPin,
  Users,
  Sliders,
  ExternalLink,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export const ConsoleSidebar: React.FC = () => {
  const pathname = usePathname();
  const { alerts, guards, cameras, currentUser } = useIBVAPStore();

  const openAlertsCount = alerts.filter((a) => a.status === "open").length;
  const criticalCount = alerts.filter((a) => a.status === "open" && a.level === "critical").length;
  const onlineCameraCount = cameras.filter((camera) => camera.status === "online").length;
  const onDutyGuardCount = guards.filter((guard) => ["on_post", "patrolling", "unreachable"].includes(guard.status)).length;

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      desc: "Overview & Telemetry",
    },
    {
      name: "Live Cameras",
      href: "/live-feed",
      icon: Video,
      desc: `${cameras.length} active feeds`,
      badge: cameras.length > 0 ? `${onlineCameraCount} ONLINE` : undefined,
    },
    {
      name: "Alerts & Intel",
      href: "/alerts",
      icon: ShieldAlert,
      desc: "Threats & Evidence Vault",
      badge: openAlertsCount > 0 ? `${openAlertsCount} ACTIVE` : undefined,
      isCritical: criticalCount > 0,
    },
    {
      name: "Border Map",
      href: "/map",
      icon: MapPin,
      desc: "GIS & Sensor Radar",
    },
    {
      name: "Guard Duty & Log",
      href: "/guard-duty",
      icon: Users,
      desc: "Sentries & Handover",
      badge: guards.length > 0 ? `${onDutyGuardCount}/${guards.length} ON DUTY` : undefined,
    },
    {
      name: "Camera Settings",
      href: "/admin",
      icon: Sliders,
      desc: "Power & Sensitivity",
    },
  ];

  return (
    <aside className="w-64 bg-[#131313] border-r border-[#454843] flex flex-col shrink-0 select-none z-20 overflow-y-auto">
      {/* Platform Branding */}
      <div className="p-4 border-b border-[#454843] bg-[#131313]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F5F5F0] text-[#121212] flex items-center justify-center font-bold shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-mono text-xs font-bold tracking-widest text-[#F5F5F0] uppercase leading-none">
              S_COMMAND_01
            </h1>
            <p className="font-mono text-[10px] text-[#8f918c] tracking-wider mt-1">
              SSB BORDERLENS OS
            </p>
          </div>
        </div>
      </div>

      {/* Sector / Operator Meta */}
      <div className="px-4 py-3 border-b border-[#454843] bg-[#1c1b1b] font-mono text-[10px] text-[#8f918c] flex justify-between items-center">
        <div>
          <span className="text-[#c5c7c1] font-bold block">SECTOR_NAV</span>
          <span>V_4.02.1</span>
        </div>
        <div className="text-right">
          <span className="text-[#c5c7c1] font-bold block">OPERATOR</span>
          <span>{currentUser?.badgeId || "OP_01"}</span>
        </div>
      </div>

      {/* Navigation List - Sharp 0px targets */}
      <nav className="flex-1 px-2 py-3 space-y-1 font-mono">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-none font-mono text-xs uppercase tracking-wider transition-colors group",
                isActive
                  ? "bg-[#F5F5F0] text-[#121212] font-bold shadow-none"
                  : "text-[#c5c7c1] hover:text-[#F5F5F0] hover:bg-[#1c1b1b] border border-transparent hover:border-[#454843]"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-[#121212]" : "text-[#8f918c] group-hover:text-[#F5F5F0]"
                  )}
                />
                <div className="min-w-0">
                  <div className="truncate font-bold leading-tight">
                    {item.name}
                  </div>
                  <div
                    className={cn(
                      "text-[9px] truncate font-normal tracking-normal normal-case",
                      isActive ? "text-[#313030]" : "text-[#8f918c]"
                    )}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-none font-mono font-bold shrink-0 ml-1 border",
                    isActive
                      ? "bg-[#121212] text-[#F5F5F0] border-[#121212]"
                      : item.isCritical
                      ? "bg-[#93000a] text-[#ffdad6] border-[#ffb4ab]"
                      : "bg-[#201f1f] text-[#c5c7c1] border-[#454843]"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Public Portal Link */}
      <div className="p-3 border-t border-[#454843] bg-[#131313]">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 bg-[#1c1b1b] hover:bg-[#2a2a2a] text-[#c5c7c1] hover:text-[#F5F5F0] border border-[#454843] font-mono text-xs transition-colors rounded-none"
        >
          <span className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <ExternalLink className="w-3.5 h-3.5 text-[#8f918c]" />
            <span>PUBLIC PORTAL</span>
          </span>
          <span className="text-[9px] bg-[#2a2a2a] px-1.5 py-0.5 text-[#8f918c]">DOCS</span>
        </Link>
      </div>
    </aside>
  );
};
