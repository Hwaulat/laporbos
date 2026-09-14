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

const topBehaviorsData = [
  { code: "WHSU1", title: "Playing Mobile Phone while Walking", count: 9, percentage: 90 },
  { code: "WHSU2", title: "Careless / Tilted Pallet Stacking", count: 6, percentage: 60 },
  { code: "GMLU3", title: "Bluetooth Earphone in Work Area", count: 4, percentage: 40 },
  { code: "WHSU4", title: "Crawling Under Active Conveyor", count: 3, percentage: 30 },
  { code: "GMLU2", title: "Sleeping in Operational Room / Silo", count: 2, percentage: 20 },
  { code: "PRDL1", title: "Not Wearing Safety Goggles", count: 2, percentage: 20 },
  { code: "PRDL2", title: "Running in Production Area", count: 1, percentage: 10 },
  { code: "UTL01", title: "Smoking Outside Designated Area", count: 1, percentage: 10 },
  { code: "WHSU5", title: "Improper Lifting Posture", count: 1, percentage: 10 },
  { code: "GMLU1", title: "Ignoring Warning Signs", count: 1, percentage: 10 },
];

function TopUnsafeBehaviors() {
  return (
    <div className="panel h-full p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Top 10 Unsafe Behaviors</h3>
          <p className="mt-1 text-sm text-slate-500">Specific observation codes recorded by supervisors at the plant.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Shifts</option>
            <option>Shift 1</option>
            <option>Shift 2</option>
            <option>Shift 3</option>
          </select>
          <select className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Locations</option>
            <option>Plant Cikarang</option>
            <option>Plant Karawang</option>
          </select>
          <select className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary">
            <option>All Areas</option>
            <option>Assembly Line A</option>
            <option>Press Shop</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 flex flex-col space-y-4">
        {topBehaviorsData.map((item) => (
          <div key={item.code}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                  {item.code}
                </span>
                <span className="text-sm font-semibold text-slate-800">{item.title}</span>
              </div>
              <span className="text-sm font-bold text-slate-700">{item.count}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-red-700"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const areaReportData = [
  { rank: 1, name: "Line 2 (Ritz Cracker)", code: "PROD-L2", supervisor: "Ferry Sanjaya", count: 24 },
  { rank: 2, name: "Grinding Meal", code: "GML-01", supervisor: "Rudi Hartono", count: 18 },
  { rank: 3, name: "Line 1 (Oreo Standard)", code: "PROD-L1", supervisor: "Bambang Sudirjo", count: 15 },
  { rank: 4, name: "Line 3 (Biskuat Energy)", code: "PROD-L3", supervisor: "Siti Rahmawati", count: 12 },
  { rank: 5, name: "Warehouse Packaging Material", code: "WHS-PM", supervisor: "Asep Ridwan", count: 9 },
  { rank: 6, name: "Utility & Boiler", code: "UTL-01", supervisor: "Budi Santoso", count: 7 },
  { rank: 7, name: "Cold Storage", code: "WHS-CS", supervisor: "Agus Prakoso", count: 4 },
];

function AreaObservationList() {
  return (
    <div className="panel h-full p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-800">Report Distribution by Area</h3>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
              Total Reports
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Production lines and warehouse areas sorted by the total number of submitted reports.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col space-y-3">
        {areaReportData.map((item) => (
          <div key={item.rank} className="flex items-center rounded-xl bg-slate-50 p-3.5">
            <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
              #{item.rank}
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-semibold text-slate-800">
                {item.name} <span className="font-normal text-slate-400">({item.code})</span>
              </div>
              <div className="mt-0.5 text-xs text-slate-500">Supervisor: {item.supervisor}</div>
            </div>
            <div className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
              {item.count}
            </div>
          </div>
        ))}
      </div>
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

  const top10Pelanggaran = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach((r) => {
      map.set(r.summary, (map.get(r.summary) ?? 0) + 1);
    });
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name, total }));
  }, [filtered]);

  const sebaranShiftArea = useMemo(() => {
    const map = new Map<string, { name: string; shift1: number; shift2: number; shift3: number }>();
    filtered.forEach((r) => {
      const area = areaName(r.areaId);
      if (!map.has(area)) {
        map.set(area, { name: area, shift1: 0, shift2: 0, shift3: 0 });
      }
      const data = map.get(area)!;
      if (r.shiftId === "sh-1") data.shift1 += 1;
      else if (r.shiftId === "sh-2") data.shift2 += 1;
      else if (r.shiftId === "sh-3") data.shift3 += 1;
    });
    return [...map.values()];
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
      {(activeForm !== "lapor-bos-v2" && activeForm !== "lapor-bos-v3") && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className={activeForm === "unsafe-condition" ? "lg:col-span-2" : "lg:col-span-3"}>
              <Panel title={activeForm === "unsafe-condition" ? "Report Unsafe" : "Reports Over Time"}>
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
      )}

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

      {/* Charts row 3 (Custom Lists for Lapor Bos) */}
      {(activeForm === "lapor-bos-v2" || activeForm === "lapor-bos-v3") && (
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TopUnsafeBehaviors />
          </div>
          <div className="lg:col-span-1">
            <AreaObservationList />
          </div>
        </div>
      )}
    </AppShell>
  );
}
