import { useState, useEffect, type ReactNode } from "react";
import { Bell, Moon, Sun, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { currentUser } from "@/lib/mock-data";

/* ─── Live clock + date ─────────────────────────────────────── */
function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hidden flex-col items-end leading-tight sm:flex">
      <span className="font-display text-sm font-semibold tabular-nums tracking-tight">
        {time}
      </span>
      <span className="text-[11px] text-muted-foreground">{date}</span>
    </div>
  );
}

/* ─── User dropdown ─────────────────────────────────────────── */
function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="btn-user-menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted"
      >
        {/* Avatar circle with initials */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
          {currentUser.initials}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-sm font-semibold leading-tight">{currentUser.name.split(" ")[0].toLowerCase()}</div>
          <div className="text-[11px] text-muted-foreground">{currentUser.role}</div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card py-1 shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser.role}</p>
            </div>
            <button
              id="btn-logout"
              className="w-full px-4 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
            >
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── App shell ─────────────────────────────────────────────── */
export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`hidden shrink-0 overflow-hidden transition-all duration-300 ease-in-out md:block ${
          sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <div className="h-full w-64">
          <AppSidebar />
        </div>
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* ── Top header ── */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-card px-4 md:px-5">
          {/* Sidebar toggle */}
          <button
            id="btn-toggle-sidebar"
            onClick={() => setSidebarOpen((o) => !o)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          {/* Page title (only shown on mobile when no sidebar) */}
          <div className="flex-1 min-w-0 md:hidden">
            <h1 className="truncate text-sm font-semibold">{title}</h1>
          </div>

          {/* Spacer on desktop */}
          <div className="hidden flex-1 md:block" />

          {/* Right cluster */}
          <div className="flex items-center gap-1.5">
            {/* Dark mode toggle */}
            <button
              id="btn-dark-mode"
              onClick={() => setDark((d) => !d)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Separator */}
            <div className="mx-1 h-7 w-px bg-border" />

            {/* Live clock */}
            <LiveClock />

            {/* Separator */}
            <div className="mx-1 h-7 w-px bg-border" />

            {/* Notifications */}
            <button
              id="btn-notifications"
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
            </button>

            {/* User menu */}
            <UserMenu />
          </div>
        </header>



        {/* Action bar */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-5 py-2.5">
            {actions}
          </div>
        )}

        {/* Mobile quick-nav */}
        <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2 md:hidden overflow-x-auto">
          <span className="section-label shrink-0">Menu</span>
          <div className="flex gap-3 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground">Dashboard</a>
            <a href="/submit" className="text-muted-foreground hover:text-foreground">New Report</a>
            <a href="/reports" className="text-muted-foreground hover:text-foreground">Reports</a>
            <a href="/questions" className="text-muted-foreground hover:text-foreground">Questions</a>
            <a href="/master-data" className="text-muted-foreground hover:text-foreground">Master Data</a>
            <a href="/users" className="text-muted-foreground hover:text-foreground">Users</a>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
