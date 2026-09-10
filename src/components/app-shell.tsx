import type { ReactNode } from "react";
import { Bell, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { currentUser } from "@/lib/mock-data";

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
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{title}</h1>
            {description ? (
              <p className="truncate text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 lg:flex">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search reports…"
              className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            className="relative rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium leading-tight">{currentUser.name}</div>
              <div className="text-xs text-muted-foreground">{currentUser.role}</div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {currentUser.initials}
            </div>
          </div>
        </header>

        <div className="flex items-center gap-4 border-b border-border bg-card px-4 py-2 md:hidden">
          <span className="section-label">Menu</span>
          <div className="flex gap-3 overflow-x-auto text-sm">
            <a href="/">Dashboard</a>
            <a href="/submit">New Report</a>
            <a href="/reports">Reports</a>
            <a href="/questions">Questions</a>
            <a href="/master-data">Master Data</a>
            <a href="/users">Users</a>
          </div>
        </div>

        {actions ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3 md:px-6">
            {actions}
          </div>
        ) : null}

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
