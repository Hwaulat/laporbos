import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
import {
  LayoutDashboard,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs } from "@/components/custom-tabs";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DateRangePicker } from "@/components/ui/calendar/date-picker-untitled/date-range-picker-untitled";
import {
  areaName,
  formTypes,
  locationName,
  reports,
  shiftName,
  type FormTypeId,
  type ReportStatus,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | RDL Report Monitoring System" },
      {
        name: "description",
        content:
          "Monitor safety and quality reports across all sites with Open/Closed tracking.",
      },
      { property: "og:title", content: "Dashboard | RDL Report Monitoring System" },
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
      No data available
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

function DashboardToolbar({
  range,
  setRange,
  activeForm,
  setActiveForm,
}: {
  range: { start: DateValue; end: DateValue } | null;
  setRange: (r: { start: DateValue; end: DateValue } | null) => void;
  activeForm: FormTypeId;
  setActiveForm: (f: FormTypeId) => void;
}) {
  return (
    <div className="panel mb-5 overflow-hidden">
      {/* Top row — title + right controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        {/* Left: icon + title */}
        <div className="flex items-center gap-2 font-display font-bold text-foreground">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span>Dashboard &mdash; Report Monitoring</span>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-4">
          <Tabs
            variant="primary"
            value={activeForm}
            onValueChange={(v) => setActiveForm(v as FormTypeId)}
            items={formTypes.map((f) => ({
              value: f.id,
              label: f.name,
            }))}
          />
          <DateRangePicker
            value={range}
            onChange={setRange}
            showPresets={false}
            showDateInputs={false}
            onApply={() => console.log('apply range')}
          />
        </div>
      </div>
    </div>
  );
}


function Dashboard() {
  const [activeForm, setActiveForm] = useState<FormTypeId>(formTypes[0].id);
  
  const currentDate = today(getLocalTimeZone());
  const [range, setRange] = useState<{ start: DateValue; end: DateValue } | null>({
    start: currentDate.subtract({ days: 6 }),
    end: currentDate,
  });

  const filtered = useMemo(
    () =>
      reports.filter((r) => {
        const matchForm = r.formType === activeForm;
        return matchForm;
      }),
    [activeForm, range]
  );

  const open = filtered.filter((r) => r.status === "Open").length;
  const closed = filtered.length - open;
  const closureRate = filtered.length
    ? Math.round((closed / filtered.length) * 100)
    : 0;

  const overTime = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      const key = r.submittedAt.slice(5, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return [...map.entries()].sort().map(([date, total]) => ({ date, total }));
  }, [filtered]);

  const byKey = (
    get: (id: string) => string,
    field: "locationId" | "areaId" | "shiftId",
  ) => {
    const map = new Map<string, number>();
    filtered.forEach((r) =>
      map.set(get(r[field]), (map.get(get(r[field])) ?? 0) + 1),
    );
    return [...map.entries()].map(([name, total]) => ({ name, total }));
  };

  const shift1 = filtered.filter((r) => r.shiftId === "sh-1").length;
  const shift2 = filtered.filter((r) => r.shiftId === "sh-2").length;
  const shift3 = filtered.filter((r) => r.shiftId === "sh-3").length;

  const stats = [
    { label: "Total Reports", value: filtered.length },
    ...(activeForm === "unsafe-condition"
      ? [
          { label: "Open", value: open },
          { label: "Closed", value: closed },
          { label: "Closure Rate", value: `${closureRate}%` },
        ]
      : [
          { label: "Shift 1 Reports", value: shift1 },
          { label: "Shift 2 Reports", value: shift2 },
          { label: "Shift 3 Reports", value: shift3 },
        ]),
  ];

  return (
    <AppShell
      title="Dashboard"
      description="Safety and quality reports overview across all sites"
    >
      <DashboardToolbar
        range={range}
        setRange={setRange}
        activeForm={activeForm}
        setActiveForm={setActiveForm}
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-2 font-display text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className={activeForm === "unsafe-condition" ? "lg:col-span-2" : "lg:col-span-3"}>
          <Panel title="Reports Over Time">
            {overTime.length === 0 ? (
              <Empty />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" fontSize={12} stroke="var(--color-muted-foreground)" />
                  <YAxis allowDecimals={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Panel>
        </div>
        {activeForm === "unsafe-condition" && (
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
        )}
      </div>

      {/* Charts row 2 */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {[
          { title: "By Location", data: byKey(locationName, "locationId") },
          { title: "By Area", data: byKey(areaName, "areaId") },
          { title: "By Shift", data: byKey(shiftName, "shiftId") },
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
