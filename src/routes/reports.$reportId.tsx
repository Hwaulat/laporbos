import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  areaName,
  currentUser,
  formName,
  locationName,
  reports,
  shiftName,
  type StatusEvent,
} from "@/lib/mock-data";

export const Route = createFileRoute("/reports/$reportId")({
  head: () => ({
    meta: [
      { title: "Report detail | RDL Report Monitoring System" },
      {
        name: "description",
        content: "Full report detail with submitted answers, metadata, closure note and status history.",
      },
      { property: "og:title", content: "Report detail | RDL Report Monitoring System" },
      { property: "og:description", content: "Review a safety report and close it with an audited closure note." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => {
    const report = reports.find((r) => r.id === params.reportId);
    if (!report) throw notFound();
    return report;
  },
  component: ReportDetail,
});

function ReportDetail() {
  const report = Route.useLoaderData();
  const canClose = currentUser.role === "Supervisor" || currentUser.role === "Admin";

  const [status, setStatus] = useState(report.status);
  const [history, setHistory] = useState<StatusEvent[]>(report.history);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    if (!note.trim()) {
      setError("A closure note is required before closing this report.");
      return;
    }
    setStatus("Closed");
    setHistory([
      ...history,
      {
        at: new Date().toISOString().slice(0, 19),
        actor: `${currentUser.name} (${currentUser.role})`,
        action: "Status changed Open → Closed",
        note,
      },
    ]);
    setNote("");
    setError("");
  };

  const meta = [
    ["Form type", formName(report.formType)],
    ["Submitted", report.submittedAt.replace("T", " ").slice(0, 16)],
    ["Reporter", report.reporter],
    ["Location", locationName(report.locationId)],
    ["Area", areaName(report.areaId)],
    ["Shift", shiftName(report.shiftId)],
  ];

  return (
    <AppShell title={report.ref} description={report.summary}>
      <Link to="/reports" className="mb-4 inline-flex items-center gap-2 text-sm text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to reports
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="panel p-5">
            <h3 className="mb-4 text-sm font-semibold">Submitted answers</h3>
            <dl className="space-y-4">
              {report.answers.map((a) => (
                <div key={a.prompt}>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{a.prompt}</dt>
                  <dd className="mt-1 text-sm">{a.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="panel p-5">
            <h3 className="mb-4 text-sm font-semibold">Status history</h3>
            <ol className="space-y-4 border-l border-border pl-4">
              {history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="text-sm font-medium">{h.action}</div>
                  <div className="text-xs text-muted-foreground">
                    {h.actor} · {h.at.replace("T", " ").slice(0, 16)}
                  </div>
                  {h.note ? <p className="mt-1 text-sm">{h.note}</p> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div className="panel p-5">
            <h3 className="mb-4 text-sm font-semibold">Metadata</h3>
            <dl className="space-y-3 text-sm">
              {meta.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <span
                    className={
                      status === "Open"
                        ? "rounded-full bg-warning/20 px-2.5 py-1 text-xs font-medium text-warning-foreground"
                        : "rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success-foreground"
                    }
                  >
                    {status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel p-5">
            <h3 className="mb-2 text-sm font-semibold">Closure</h3>
            {status === "Closed" ? (
              <p className="text-sm text-muted-foreground">
                This report is closed. Reopening is Admin-only.
              </p>
            ) : canClose ? (
              <>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Closure note (required)"
                  className="w-full rounded-lg border border-border bg-card p-3 text-sm"
                />
                {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
                <button
                  onClick={close}
                  className="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                >
                  Close report
                </button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only Supervisor and Admin can close a report. Status is read-only for your role.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
