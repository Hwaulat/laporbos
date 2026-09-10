import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import {
  areas,
  formTypes,
  locations,
  questions,
  shifts,
  type FormTypeId,
} from "@/lib/mock-data";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "New Report | RDL Report Monitoring System" },
      {
        name: "description",
        content: "Submit a safety or quality observation in under two minutes with cascading location and area.",
      },
      { property: "og:title", content: "New Report | RDL Report Monitoring System" },
      { property: "og:description", content: "Dynamic reporting form for all five report types." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  const [formType, setFormType] = useState<FormTypeId>("lapor-bos-v2");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [shift, setShift] = useState("sh-1");
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ref, setRef] = useState("");

  const visible = useMemo(
    () => questions.filter((q) => q.formType === formType && q.visible).sort((a, b) => a.order - b.order),
    [formType],
  );
  const areaOptions = areas.filter((a) => a.locationId === location && a.active);

  const setAnswer = (id: string, value: string | string[]) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!location) next.location = "Location is required";
    if (!area) next.area = "Area is required";
    visible.forEach((q) => {
      const v = answers[q.id];
      if (q.required && (!v || (Array.isArray(v) && v.length === 0))) {
        next[q.id] = "This question is required";
      }
    });
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const short = formTypes.find((f) => f.id === formType)!.short;
    setRef(`${short}-2609-${String(Math.floor(Math.random() * 900) + 100)}`);
    setAnswers({});
  };

  if (ref) {
    return (
      <AppShell title="New Report" description="Submission confirmed">
        <div className="panel mx-auto max-w-lg p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h2 className="mt-4 text-lg font-semibold">Report submitted</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your reference ID is</p>
          <p className="mt-2 font-display text-2xl font-bold text-primary">{ref}</p>
          <button
            onClick={() => setRef("")}
            className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Submit another report
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="New Report" description="Only questions configured for the selected form are shown">
      <form onSubmit={submit} className="panel mx-auto max-w-3xl space-y-6 p-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Report type</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {formTypes.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => {
                  setFormType(f.id);
                  setAnswers({});
                  setErrors({});
                }}
                className={
                  formType === f.id
                    ? "rounded-lg border border-primary bg-primary/10 px-4 py-3 text-left text-sm font-medium"
                    : "rounded-lg border border-border px-4 py-3 text-left text-sm hover:bg-muted"
                }
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setArea("");
              }}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="">Select location</option>
              {locations
                .filter((l) => l.active)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
            </select>
            {errors.location ? <p className="mt-1 text-xs text-destructive">{errors.location}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Area</label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              disabled={!location || areaOptions.length === 0}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">{location ? "Select area" : "Select a location first"}</option>
              {areaOptions.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {location && areaOptions.length === 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                No areas mapped to this location yet.
              </p>
            ) : null}
            {errors.area ? <p className="mt-1 text-xs text-destructive">{errors.area}</p> : null}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Shift</label>
            <select
              value={shift}
              onChange={(e) => setShift(e.target.value)}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.start}–{s.end})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5 border-t border-border pt-5">
          {visible.map((q) => {
            const value = answers[q.id];
            return (
              <div key={q.id}>
                <label className="mb-2 block text-sm font-medium">
                  {q.prompt}
                  {q.required ? <span className="text-destructive"> *</span> : null}
                </label>

                {q.inputType === "text" && (
                  <textarea
                    rows={3}
                    value={(value as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-card p-3 text-sm"
                  />
                )}
                {q.inputType === "number" && (
                  <input
                    type="number"
                    value={(value as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-card p-2.5 text-sm"
                  />
                )}
                {q.inputType === "dropdown" && (
                  <select
                    value={(value as string) ?? ""}
                    onChange={(e) => setAnswer(q.id, e.target.value)}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="">Select an option</option>
                    {q.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
                {q.inputType === "radio" && (
                  <div className="flex flex-wrap gap-4">
                    {q.options?.map((o) => (
                      <label key={o} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          checked={value === o}
                          onChange={() => setAnswer(q.id, o)}
                        />
                        {o}
                      </label>
                    ))}
                  </div>
                )}
                {q.inputType === "checkbox" && (
                  <div className="flex flex-wrap gap-4">
                    {q.options?.map((o) => {
                      const list = (value as string[]) ?? [];
                      return (
                        <label key={o} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={list.includes(o)}
                            onChange={() =>
                              setAnswer(
                                q.id,
                                list.includes(o) ? list.filter((x) => x !== o) : [...list, o],
                              )
                            }
                          />
                          {o}
                        </label>
                      );
                    })}
                  </div>
                )}
                {errors[q.id] ? <p className="mt-1 text-xs text-destructive">{errors[q.id]}</p> : null}
              </div>
            );
          })}

          <div>
            <label className="mb-2 block text-sm font-medium">Photo evidence (optional)</label>
            <input type="file" accept="image/*" className="text-sm" />
            <p className="mt-1 text-xs text-muted-foreground">
              Images are compressed before upload. The report can still be submitted without a photo.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Submit report
        </button>
      </form>
    </AppShell>
  );
}
