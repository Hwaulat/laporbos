import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import {
  areaName,
  areas,
  formTypes,
  locationName,
  locations,
  reports,
  shiftName,
  shifts,
  type FormTypeId,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | RDL Report Monitoring System" },
      {
        name: "description",
        content:
          "Monitor safety and quality reports across all sites with per-form dashboards, filters and Open/Closed tracking.",
      },
      { property: "og:title", content: "Dashboard | RDL Report Monitoring System" },
      {
        property: "og:description",
        content: "Unified safety reporting dashboard for Lapor Bos, near-miss, QRP and unsafe condition reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const chartColors = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Empty() {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
      No data for the selected filters
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel p-5">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Dashboard() {
  const [formType, setFormType] = useState<FormTypeId>("lapor-bos-v2");
  const [location, setLocation] = useState("all");
  const [area, setArea] = useState("all");
  const [shift, setShift] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          r.formType === formType &&
          (location === "all" || r.locationId === location) &&
          (area === "all" || r.areaId === area) &&
          (shift === "all" || r.shiftId === shift) &&
          (status === "all" || r.status === status),
      ),
    [formType, location, area, shift, status],
  );

  const open = filtered.filter((r) => r.status === "Open").length;
  const closed = filtered.length - open;
  const closureRate = filtered.length ? Math.round((closed / filtered.length) * 100) : 0;

  const overTime = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      const key = r.submittedAt.slice(5, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].sort().map(([date, total]) => ({ date, total }));
  }, [filtered]);

  const byKey = (get: (id: string) => string, field: "locationId" | "areaId" | "shiftId") => {
    const map = new Map<string, number>();
    filtered.forEach((r) => map.set(get(r[field]), (map.get(get(r[field])) ?? 0) + 1));
    return [...map.entries()].map(([name, total]) => ({ name, total }));
  };

  const areaOptions = location === "all" ? areas : areas.filter((a) => a.locationId === location);

  const stats = [
    { label: "Total submissions", value: filtered.length },
    { label: "Open", value: open },
    { label: "Closed", value: closed },
    { label: "Closure rate", value: `${closureRate}%` },
  ];

  return (
    <AppShell
      title="Dashboard"
      description="Per-form visualisations with shared filters"
      actions={
        <>
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value as FormTypeId)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
          >
            {formTypes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setArea("all");
            }}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All locations</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={areaOptions.length === 0}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All areas</option>
            {areaOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All shifts</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
          <Link
            to="/reports"
            search={{ formType }}
            className="ml-auto rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Open report list
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Submissions over time">
            {overTime.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="var(--color-chart-1)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
        <Panel title="Open vs Closed">
          {filtered.length === 0 ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Open", value: open },
                    { name: "Closed", value: closed },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  label
                >
                  <Cell fill="var(--color-chart-2)" />
                  <Cell fill="var(--color-chart-3)" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {[
          { title: "By location", data: byKey(locationName, "locationId") },
          { title: "By area", data: byKey(areaName, "areaId") },
          { title: "By shift", data: byKey(shiftName, "shiftId") },
        ].map((c) => (
          <Panel key={c.title} title={c.title}>
            {c.data.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={c.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis allowDecimals={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {c.data.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Panel>
        ))}
      </div>
    </AppShell>
  );
}
