import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  Files,
  ListChecks,
  Layers,
  Users,
  ShieldCheck,
} from "lucide-react";
import { reports } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Item = {
  to: string;
  label: string;
  icon: typeof LayoutGrid;
  badge?: number;
};

const openCount = reports.filter((r) => r.status === "Open").length;

const groups: { label: string; items: Item[] }[] = [
  {
    label: "Core functions",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutGrid },
      { to: "/reports", label: "Reports", icon: Files, badge: openCount },
    ],
  },
  {
    label: "Form configuration",
    items: [
      { to: "/questions", label: "Questions", icon: ListChecks },
      { to: "/master-data", label: "Master Data", icon: Layers },
    ],
  },
  {
    label: "Setup system",
    items: [{ to: "/users", label: "Users Management", icon: Users }],
  },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
            <ShieldCheck className="h-[18px] w-[18px] text-sidebar-primary-foreground" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold text-sidebar-primary-foreground">
              RDL - Report
            </div>
            <div className="font-display text-xs text-sidebar-accent">Monitoring System</div>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
        {groups.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <div className="section-label px-3">{group.label}</div>
            <div className="flex flex-col gap-[5px]">
              {group.items.map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group flex h-10 items-center gap-3 rounded-[10px] pr-3 text-sm transition-colors",
                      active
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                        : "pl-4 text-sidebar-foreground hover:bg-sidebar-primary/25 hover:text-sidebar-primary-foreground",
                    )}
                  >
                    {active && (
                      <span className="h-8 w-1 rounded-r-full bg-sidebar-accent" aria-hidden />
                    )}
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span
                        className={cn(
                          "flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "bg-sidebar-primary text-sidebar-primary-foreground",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-6 py-3">
        <div className="flex items-center justify-between font-display text-xs text-sidebar-label">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[oklch(0.8_0.18_150)] opacity-90" />
            System Online
          </span>
          <span>v2.4.1</span>
        </div>
      </div>
    </aside>
  );
}
