import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ListChecks,
  Eye,
  EyeOff,
  GripVertical,
  Check,
  X,
  LayoutDashboard,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs } from "@/components/custom-tabs";
import { TableToolbar, FilterSelect, Pagination } from "@/components/table-ui";
import {
  formTypes,
  questions as initialQuestions,
  type Question,
  type FormTypeId,
  type InputType,
} from "@/lib/mock-data";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Pertanyaan | RDL Report Monitoring System" },
      {
        name: "description",
        content:
          "Kelola daftar pertanyaan untuk setiap formulir laporan. Tambah, edit, susun urutan, dan atur visibilitas pertanyaan.",
      },
      { property: "og:title", content: "Pertanyaan | RDL Report Monitoring System" },
    ],
  }),
  component: QuestionsPage,
});

const INPUT_TYPE_LABELS: Record<InputType, string> = {
  text: "Long text",
  number: "Number",
  dropdown: "Dropdown",
  checkbox: "Checkbox",
  radio: "Multiple choice",
};

const INPUT_TYPE_COLORS: Record<InputType, string> = {
  text: "bg-blue-50 text-blue-700 border-blue-200",
  number: "bg-purple-50 text-purple-700 border-purple-200",
  dropdown: "bg-amber-50 text-amber-700 border-amber-200",
  checkbox: "bg-emerald-50 text-emerald-700 border-emerald-200",
  radio: "bg-rose-50 text-rose-700 border-rose-200",
};

type ModalMode = "add" | "edit";

interface ModalState {
  open: boolean;
  mode: ModalMode;
  question: Partial<Question> & { optionsText?: string };
}

function Badge({ type }: { type: InputType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${INPUT_TYPE_COLORS[type]}`}
    >
      {INPUT_TYPE_LABELS[type]}
    </span>
  );
}

function QuestionsPage() {
  const [activeForm, setActiveForm] = useState<FormTypeId>("lapor-bos-v2");
  const [qs, setQs] = useState<Question[]>(initialQuestions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    mode: "add",
    question: {},
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const formQs = qs
    .filter((q) => {
      const matchForm = q.formType === activeForm;
      const matchSearch =
        !search || q.prompt.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || q.inputType === typeFilter;
      return matchForm && matchSearch && matchType;
    })
    .sort((a, b) => a.order - b.order);

  const totalPages = Math.max(1, Math.ceil(formQs.length / pageSize));
  const pageRows = formQs.slice((page - 1) * pageSize, page * pageSize);

  function openAdd() {
    const maxOrder = formQs.length ? Math.max(...formQs.map((q) => q.order)) : 0;
    setModal({
      open: true,
      mode: "add",
      question: {
        formType: activeForm,
        inputType: "text",
        required: true,
        visible: true,
        order: maxOrder + 1,
        optionsText: "",
      },
    });
  }

  function openEdit(q: Question) {
    setModal({
      open: true,
      mode: "edit",
      question: { ...q, optionsText: q.options?.join(", ") ?? "" },
    });
  }

  function saveModal() {
    const { optionsText, ...q } = modal.question;
    const options =
      optionsText?.trim()
        ? optionsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    if (!q.prompt?.trim()) return;
    if (modal.mode === "add") {
      const newQ: Question = {
        id: `q-${Date.now()}`,
        formType: activeForm,
        prompt: q.prompt,
        inputType: q.inputType ?? "text",
        options,
        order: q.order ?? 1,
        required: q.required ?? true,
        visible: q.visible ?? true,
        responses: 0,
      };
      setQs((prev) => [...prev, newQ]);
    } else {
      setQs((prev) =>
        prev.map((item) =>
          item.id === q.id
            ? {
                ...item,
                prompt: q.prompt!,
                inputType: q.inputType ?? item.inputType,
                options,
                required: q.required ?? item.required,
                visible: q.visible ?? item.visible,
              }
            : item,
        ),
      );
    }
    setModal({ open: false, mode: "add", question: {} });
  }

  function toggleVisible(id: string) {
    setQs((prev) => prev.map((q) => (q.id === id ? { ...q, visible: !q.visible } : q)));
  }

  function deleteQuestion(id: string) {
    setQs((prev) => prev.filter((q) => q.id !== id));
    setDeleteConfirm(null);
  }

  function moveOrder(id: string, dir: "up" | "down") {
    const sorted = [...formQs].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((q) => q.id === id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === sorted.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const aOrder = sorted[idx].order;
    const bOrder = sorted[swapIdx].order;
    setQs((prev) =>
      prev.map((q) => {
        if (q.id === sorted[idx].id) return { ...q, order: bOrder };
        if (q.id === sorted[swapIdx].id) return { ...q, order: aOrder };
        return q;
      }),
    );
  }

  const hasOptions = ["dropdown", "checkbox", "radio"].includes(
    modal.question.inputType ?? "",
  );

  return (
    <AppShell
      title="Questions"
      description="Manage question lists for each form"
    >
      {/* Title Panel */}
      <div className="panel mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span>Questions</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              variant="primary"
              value={activeForm}
              onValueChange={(v) => { setActiveForm(v as FormTypeId); setPage(1); }}
              items={formTypes.map((f) => ({
                value: f.id,
                label: f.name,
                badge: qs.filter((q) => q.formType === f.id).length
              }))}
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="panel overflow-hidden">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4 border-b border-border [&>div]:!mb-0">
          {/* Toolbar */}
          <TableToolbar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search questions…"
        filters={
          <FilterSelect
            id="filter-input-type"
            value={typeFilter}
            onChange={(v) => { setTypeFilter(v); setPage(1); }}
          >
            <option value="all">All Type</option>
            {(Object.keys(INPUT_TYPE_LABELS) as InputType[]).map((t) => (
              <option key={t} value={t}>
                {INPUT_TYPE_LABELS[t]}
              </option>
            ))}
          </FilterSelect>
        }
        primaryAction={
          <button
            id="btn-add-question"
            onClick={openAdd}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        }
      />
      </div>

        {formQs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ListChecks className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No questions yet</p>
            <p className="text-xs text-muted-foreground">
              Click the "Add Question" button to add a new question.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
                    <th className="w-10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Required</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Visible</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Responses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageRows.map((q, idx) => {
                    const globalIdx = (page - 1) * pageSize + idx;
                    return (
                      <tr key={q.id} className={`transition-colors hover:bg-muted/30 ${!q.visible ? "opacity-50" : ""}`}>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button id={`btn-move-up-${q.id}`} onClick={() => moveOrder(q.id, "up")} disabled={globalIdx === 0} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground" title="Move Up"><ChevronUp className="h-4 w-4" /></button>
                            <button id={`btn-move-down-${q.id}`} onClick={() => moveOrder(q.id, "down")} disabled={globalIdx === formQs.length - 1} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground" title="Move Down"><ChevronDown className="h-4 w-4" /></button>
                            <button id={`btn-edit-${q.id}`} onClick={() => openEdit(q)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary" title="Edit"><Pencil className="h-4 w-4" /></button>
                            {deleteConfirm === q.id ? (
                              <button id={`btn-confirm-delete-${q.id}`} onClick={() => deleteQuestion(q.id)} className="rounded px-1.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10">Delete?</button>
                            ) : (
                              <button id={`btn-delete-${q.id}`} onClick={() => setDeleteConfirm(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground/30" />
                            <span className="font-display font-semibold text-muted-foreground">{q.order}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{q.prompt}</p>
                          {q.options && <p className="mt-0.5 text-xs text-muted-foreground">{q.options.join(" · ")}</p>}
                        </td>
                        <td className="px-4 py-3"><Badge type={q.inputType} /></td>
                        <td className="px-4 py-3 text-center">{q.required ? <Check className="mx-auto h-4 w-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                        <td className="px-4 py-3 text-center">
                          <button id={`btn-toggle-visible-${q.id}`} onClick={() => toggleVisible(q.id)} className="mx-auto flex items-center justify-center rounded p-1 hover:bg-muted">
                            {q.visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right font-display font-semibold tabular-nums text-muted-foreground">{q.responses.toLocaleString("id-ID")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination total={formQs.length} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
          </>
        )}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setModal({ open: false, mode: "add", question: {} }); }}>
          <div className="panel w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold">{modal.mode === "add" ? "Add Question" : "Edit Question"}</h2>
              <button id="btn-close-modal" onClick={() => setModal({ open: false, mode: "add", question: {} })} className="rounded p-1 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="modal-prompt">Question Text <span className="text-destructive">*</span></label>
                <textarea id="modal-prompt" rows={3} value={modal.question.prompt ?? ""} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, prompt: e.target.value } }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Example: Describe the finding…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="modal-type">Input Type</label>
                  <select id="modal-type" value={modal.question.inputType ?? "text"} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, inputType: e.target.value as InputType } }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {(Object.keys(INPUT_TYPE_LABELS) as InputType[]).map((t) => (<option key={t} value={t}>{INPUT_TYPE_LABELS[t]}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="modal-order">Order</label>
                  <input id="modal-order" type="number" min={1} value={modal.question.order ?? 1} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, order: Number(e.target.value) } }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              {hasOptions && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium" htmlFor="modal-options">Options <span className="font-normal text-muted-foreground">(comma separated)</span></label>
                  <input id="modal-options" value={modal.question.optionsText ?? ""} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, optionsText: e.target.value } }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Low, Medium, High" />
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="modal-required"><input id="modal-required" type="checkbox" checked={modal.question.required ?? true} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, required: e.target.checked } }))} className="h-4 w-4 accent-primary" />Required</label>
                <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="modal-visible"><input id="modal-visible" type="checkbox" checked={modal.question.visible ?? true} onChange={(e) => setModal((m) => ({ ...m, question: { ...m.question, visible: e.target.checked } }))} className="h-4 w-4 accent-primary" />Visible in form</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button id="btn-cancel-modal" onClick={() => setModal({ open: false, mode: "add", question: {} })} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button>
              <button id="btn-save-modal" onClick={saveModal} disabled={!modal.question.prompt?.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{modal.mode === "add" ? "Add" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
