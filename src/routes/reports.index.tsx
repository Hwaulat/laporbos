import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import {
  areaName,
  areas,
  formName,
  formTypes,
  locationName,
  locations,
  reports,
  shiftName,
  shifts,
} from "@/lib/mock-data";

type Search = { formType?: string };

export const Route = createFileRoute("/reports/")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    formType: typeof search.formType === "string" ? search.formType : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reports | RDL Report Monitoring System" },
      {
        name: "description",
        content: "Filter, search and close safety reports by form type, location, area, shift and status.",
      },
      { property: "og:title", content: "Reports | RDL Report Monitoring System" },
      { property: "og:description", content: "Unified report list with Open/Closed lifecycle and CSV export." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { formType: initialForm } = Route.useSearch();
  const [formType, setFormType] = useState(initialForm ?? "all");
  const [status, setStatus] = useState("Open");
  const [location, setLocation] = useState("all");
  const [area, setArea] = useState("all");
  const [shift, setShift] = useState("all");
  const [q, setQ] = useState("");

  const areaOptions = location === "all" ? areas : areas.filter((a) => a.locationId === location);

  const rows = useMemo(
    () =>
      reports
        .filter(
          (r) =>
            (formType === "all" || r.formType === formType) &&
            (status === "all" || r.status === status) &&
            (location === "all" || r.locationId === location) &&
            (area === "all" || r.areaId === area) &&
            (shift === "all" || r.shiftId === shift) &&
            (q === "" ||
              `${r.ref} ${r.reporter} ${r.summary}`.toLowerCase().includes(q.toLowerCase())),
        )
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [formType, status, location, area, shift, q],
  );

  const exportCsv = () => {
    const header = "Ref,Form,Submitted,Reporter,Location,Area,Shift,Status";
    const body = rows
      .map((r) =>
        [
          r.ref,
          formName(r.formType),
          r.submittedAt.replace("T", " "),
          r.reporter,
          locationName(r.locationId),
          areaName(r.areaId),
          shiftName(r.shiftId),
          r.status,
        ].join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell
      title="Reports"
      description={`${rows.length} report(s) match the current filters`}
      actions={
        <>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ref, reporter, summary…"
            className="w-56 rounded-lg border border-border bg-card px-3 py-2 text-sm"
          />
          <select
            value={formType}
            onChange={(e) => setFormType(e.target.value)}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="all">All form types</option>
            {formTypes.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
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
          <button
            onClick={exportCsv}
            className="ml-auto rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium"
          >
            Export CSV
          </button>
        </>
      }
    >
      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Form type</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Reporter</th>
              <th className="px-4 py-3">Location / Area</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">
                  <Link to="/reports/$reportId" params={{ reportId: r.id }} className="text-primary hover:underline">
                    {r.ref}
                  </Link>
                  <div className="text-xs text-muted-foreground">{r.summary}</div>
                </td>
                <td className="px-4 py-3">{formName(r.formType)}</td>
                <td className="px-4 py-3">{r.submittedAt.replace("T", " ").slice(0, 16)}</td>
                <td className="px-4 py-3">{r.reporter}</td>
                <td className="px-4 py-3">
                  {locationName(r.locationId)}
                  <div className="text-xs text-muted-foreground">{areaName(r.areaId)}</div>
                </td>
                <td className="px-4 py-3">{shiftName(r.shiftId)}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "Open"
                        ? "rounded-full bg-warning/20 px-2.5 py-1 text-xs font-medium text-warning-foreground"
                        : "rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success-foreground"
                    }
                  >
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-muted-foreground">
                  No data for the selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
