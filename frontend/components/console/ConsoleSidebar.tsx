import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  ShieldAlert,
  MapPin,
  Users,
  Settings,
  ExternalLink,
  Shield,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIBVAPStore } from "@/lib/store/useIBVAPStore";

export const ConsoleSidebar: React.FC = () => {
  const pathname = usePathname();
  const { alerts, guards, cameras } = useIBVAPStore();

  const openAlertsCount = alerts.filter((a) => a.status === "open").length;
  const criticalCount = alerts.filter((a) => a.status === "open" && a.level === "critical").length;
  const onlineCameraCount = cameras.filter((camera) => camera.status === "online").length;
  const onDutyGuardCount = guards.filter((guard) => ["on_post", "patrolling", "unreachable"].includes(guard.status)).length;

  // Simplified 6 primary navigation items - high contrast, large touch targets
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      desc: "Overview & Status",
    },
    {
      name: "Live Cameras",
      href: "/live-feed",
      icon: Video,
      desc: `${cameras.length} configured cameras`,
      badge: cameras.length > 0 ? `${onlineCameraCount} ONLINE` : "NO CAMERAS",
      badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-600",
    },
    {
      name: "Alerts & Intel",
      href: "/alerts",
      icon: ShieldAlert,
      desc: "Threats, POI, ANPR",
      badge: openAlertsCount > 0 ? `${openAlertsCount} ACTIVE` : undefined,
      badgeColor:
        criticalCount > 0
          ? "bg-rose-950 text-rose-300 border-rose-600 animate-pulse"
          : "bg-amber-950 text-amber-300 border-amber-600",
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
      desc: "Sentries, Handover & Audit",
      badge: guards.length > 0 ? `${onDutyGuardCount}/${guards.length} ON DUTY` : "NO ROSTER",
      badgeColor: "bg-amber-950 text-amber-300 border-amber-600",
    },
    {
      name: "Camera Settings",
      href: "/admin",
      icon: Sliders,
      desc: "Power & Sensitivity",
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 select-none z-20 overflow-y-auto">
      {/* Platform Branding */}
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
        <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-mono text-sm font-black tracking-widest text-slate-100 uppercase leading-none">
            SSB BORDERLENS
          </h1>
          <p className="font-mono text-[10px] text-cyan-400 font-bold tracking-wider mt-1">
            BORDER COMMAND OS
          </p>
        </div>
      </div>

      {/* Simplified Navigation List - Large Tap Targets */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded border font-mono transition-all duration-150 group min-h-[52px]",
                isActive
                  ? "bg-cyan-950/80 text-cyan-200 border-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800 hover:border-slate-700"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "p-2 rounded shrink-0",
                    isActive ? "bg-cyan-500 text-slate-950" : "bg-slate-900 text-cyan-400 group-hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs truncate font-bold text-slate-100 group-hover:text-cyan-300">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "font-mono text-[9px] px-2 py-0.5 rounded border shrink-0 font-bold ml-1",
                    item.badgeColor || "bg-slate-800 text-slate-300 border-slate-700"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to Public Landing Page */}
      <div className="p-3 border-t border-slate-800 bg-slate-950">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 rounded font-mono text-xs transition-colors"
        >
          <span className="flex items-center gap-2 font-bold">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Public Demo Portal</span>
          </span>
          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">INFO</span>
        </Link>
      </div>
    </aside>
  );
};
