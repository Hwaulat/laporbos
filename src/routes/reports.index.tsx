import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Download, LayoutDashboard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs } from "@/components/custom-tabs";
import { TableToolbar, FilterSelect, Pagination } from "@/components/table-ui";
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
        content:
          "Filter, search and close safety reports by form type, location, area, shift and status.",
      },
      { property: "og:title", content: "Reports | RDL Report Monitoring System" },
      {
        property: "og:description",
        content: "Unified report list with Open/Closed lifecycle and CSV export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { formType: initialForm } = Route.useSearch();

  const [q, setQ] = useState("");
  const [formType, setFormType] = useState(initialForm ?? "all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [area, setArea] = useState("all");
  const [shift, setShift] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const areaOptions =
    location === "all" ? areas : areas.filter((a) => a.locationId === location);

  const allRows = useMemo(
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
              `${r.ref} ${r.reporter} ${r.summary}`
                .toLowerCase()
                .includes(q.toLowerCase())),
        )
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [formType, status, location, area, shift, q],
  );

  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const rows = allRows.slice((page - 1) * pageSize, page * pageSize);

  /* reset to page 1 on any filter change */
  function changeFilter<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  const exportCsv = () => {
    const header = "Ref,Form,Submitted,Reporter,Location,Area,Shift,Status";
    const body = allRows
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
    const url = URL.createObjectURL(
      new Blob([`${header}\n${body}`], { type: "text/csv" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderHeaders = () => {
    const thClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground";
    if (formType === "lapor-bos-v2" || formType === "lapor-bos-v3") {
      return (
        <tr className="border-b border-border bg-muted/50 text-left">
          <th className={`w-20 text-center ${thClass}`}>Action</th>
          <th className={thClass}>Submit Date</th>
          <th className={thClass}>Observation Date</th>
          <th className={thClass}>Shift</th>
          <th className={thClass}>Location</th>
          <th className={thClass}>Area</th>
          <th className={thClass}>Description</th>
        </tr>
      );
    }
    if (formType === "nearmiss") {
      return (
        <tr className="border-b border-border bg-muted/50 text-left">
          <th className={`w-20 text-center ${thClass}`}>Action</th>
          <th className={thClass}>Submit Date</th>
          <th className={thClass}>Personnel Name</th>
          <th className={thClass}>Incident Date</th>
          <th className={thClass}>Shift</th>
          <th className={thClass}>Location</th>
          <th className={thClass}>Detailed Description</th>
        </tr>
      );
    }
    if (formType === "qrp") {
      return (
        <tr className="border-b border-border bg-muted/50 text-left">
          <th className={`w-20 text-center ${thClass}`}>Action</th>
          <th className={thClass}>Work Date</th>
          <th className={thClass}>Shift</th>
          <th className={thClass}>Location</th>
          <th className={thClass}>Work Description</th>
          <th className={thClass}>Machine Name</th>
          <th className={thClass}>Hazard Risk</th>
        </tr>
      );
    }
    if (formType === "unsafe-condition") {
      return (
        <tr className="border-b border-border bg-muted/50 text-left">
          <th className={`w-20 text-center ${thClass}`}>Action</th>
          <th className={thClass}>Date</th>
          <th className={thClass}>Shift</th>
          <th className={thClass}>Location</th>
          <th className={thClass}>Description</th>
        </tr>
      );
    }
    return (
      <tr className="border-b border-border bg-muted/50 text-left">
        <th className={`w-20 text-center ${thClass}`}>Action</th>
        <th className={thClass}>Reference</th>
        <th className={thClass}>Form Type</th>
        <th className={thClass}>Date</th>
        <th className={thClass}>Reporter</th>
        <th className={thClass}>Location / Area</th>
        <th className={thClass}>Shift</th>
        <th className={thClass}>Status</th>
      </tr>
    );
  };

  const renderRow = (r: Report) => {
    const actionCol = (
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <Link
            to="/reports/$reportId"
            params={{ reportId: r.id }}
            id={`btn-view-${r.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="Lihat detail"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </td>
    );

    const dateStr = r.submittedAt.replace("T", " ").slice(0, 16);

    if (formType === "lapor-bos-v2" || formType === "lapor-bos-v3") {
      return (
        <tr key={r.id} className="transition-colors hover:bg-muted/30">
          {actionCol}
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 text-muted-foreground">{shiftName(r.shiftId)}</td>
          <td className="px-4 py-3 text-muted-foreground">{locationName(r.locationId)}</td>
          <td className="px-4 py-3 text-muted-foreground">{areaName(r.areaId)}</td>
          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.summary}</td>
        </tr>
      );
    }
    if (formType === "nearmiss") {
      return (
        <tr key={r.id} className="transition-colors hover:bg-muted/30">
          {actionCol}
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 font-medium text-foreground">{r.reporter}</td>
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 text-muted-foreground">{shiftName(r.shiftId)}</td>
          <td className="px-4 py-3 text-muted-foreground">{locationName(r.locationId)}</td>
          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.summary}</td>
        </tr>
      );
    }
    if (formType === "qrp") {
      const mesin = r.answers?.find(a => a.prompt.toLowerCase().includes("mesin"))?.value || "Mesin Press / Perakitan";
      const resiko = r.answers?.find(a => a.prompt.toLowerCase().includes("risiko"))?.value || "Risiko Sedang";
      return (
        <tr key={r.id} className="transition-colors hover:bg-muted/30">
          {actionCol}
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 text-muted-foreground">{shiftName(r.shiftId)}</td>
          <td className="px-4 py-3 text-muted-foreground">{locationName(r.locationId)}</td>
          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.summary}</td>
          <td className="px-4 py-3 text-muted-foreground">{mesin}</td>
          <td className="px-4 py-3 text-muted-foreground">{resiko}</td>
        </tr>
      );
    }
    if (formType === "unsafe-condition") {
      return (
        <tr key={r.id} className="transition-colors hover:bg-muted/30">
          {actionCol}
          <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
          <td className="px-4 py-3 text-muted-foreground">{shiftName(r.shiftId)}</td>
          <td className="px-4 py-3 text-muted-foreground">{locationName(r.locationId)}</td>
          <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{r.summary}</td>
        </tr>
      );
    }
    return (
      <tr key={r.id} className="transition-colors hover:bg-muted/30">
        {actionCol}
        <td className="px-4 py-3">
          <Link
            to="/reports/$reportId"
            params={{ reportId: r.id }}
            className="font-medium text-primary hover:underline"
          >
            {r.ref}
          </Link>
          <div className="mt-0.5 max-w-xs truncate text-xs text-muted-foreground">
            {r.summary}
          </div>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {formName(r.formType)}
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {dateStr}
        </td>
        <td className="px-4 py-3 text-muted-foreground">{r.reporter}</td>
        <td className="px-4 py-3 text-muted-foreground">
          {locationName(r.locationId)}
          <br />
          <span className="text-xs">{areaName(r.areaId)}</span>
        </td>
        <td className="px-4 py-3 text-muted-foreground">
          {shiftName(r.shiftId)}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              r.status === "Open"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {r.status}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <AppShell title="Reports" description="List of all safety and quality reports">
      {/* Title Panel */}
      <div className="panel mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span>Reports &mdash; Report Monitoring</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              variant="primary"
              value={formType}
              onValueChange={changeFilter(setFormType)}
              items={[
                { value: "all", label: "All Form Types" },
                ...formTypes.map((f) => ({
                  value: f.id,
                  label: f.name,
                }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Table & Toolbar Container ── */}
      <div className="panel overflow-hidden">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4 border-b border-border [&>div]:!mb-0">
          <TableToolbar
            searchValue={q}
            onSearchChange={changeFilter(setQ)}
            searchPlaceholder="Search ref, reporter, summary…"

            filters={
              <>
                {formType === "unsafe-condition" && (
                  <FilterSelect
                    id="filter-status"
                    value={status}
                    onChange={changeFilter(setStatus)}
                  >
                    <option value="all">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </FilterSelect>
                )}

                <FilterSelect
                  id="filter-location"
                  value={location}
                  onChange={(v) => {
                    changeFilter(setLocation)(v);
                    setArea("all");
                  }}
                >
                  <option value="all">All Location</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  id="filter-area"
                  value={area}
                  onChange={changeFilter(setArea)}
                >
                  <option value="all">All Area</option>
                  {areaOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  id="filter-shift"
                  value={shift}
                  onChange={changeFilter(setShift)}
                >
                  <option value="all">All Shift</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </FilterSelect>
              </>
            }
            primaryAction={
              <button
                id="btn-export-csv"
                onClick={exportCsv}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Download className="h-4 w-4" />
                Download Excel
              </button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              {renderHeaders()}
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-14 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada laporan yang sesuai filter
                  </td>
                </tr>
              ) : (
                rows.map((r) => renderRow(r))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <Pagination
          total={allRows.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>
    </AppShell>
  );
}
