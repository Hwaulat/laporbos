import { type ReactNode } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Table Toolbar ──────────────────────────────────────────────
   Layout mirrors the screenshot:
   [🔍 Search input]  [Filter...]  [Filter...]  ...  [+ Primary Button]
──────────────────────────────────────────────────────────────── */
export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari…",
  filters,
  primaryAction,
}: {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  /** Extra controls rendered between search and primary button */
  filters?: ReactNode;
  /** The right-most primary CTA button */
  primaryAction?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange("")}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filters slot */}
      {filters}

      {/* Primary action — pushed to the right */}
      {primaryAction && <div className="ml-auto">{primaryAction}</div>}
    </div>
  );
}

/* ─── Filter Select ──────────────────────────────────────────────
   Thin styled <select> that matches the toolbar style.
──────────────────────────────────────────────────────────────── */
export function FilterSelect({
  id,
  value,
  onChange,
  children,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );
}

/* ─── Pagination ─────────────────────────────────────────────────
   Bottom bar:  "Rows per page: [10▼]   1–10 of 40   ‹ 1 2 3 4 ›"
──────────────────────────────────────────────────────────────── */
const PAGE_SIZES = [10, 20, 50];
const MAX_VISIBLE_PAGES = 5;

export function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  total: number;
  page: number;     // 1-indexed
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  /* build visible page numbers */
  const pages: (number | "…")[] = [];
  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);
    if (end - start < MAX_VISIBLE_PAGES - 1) start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    if (start > 1) { pages.push(1); if (start > 2) pages.push("…"); }
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) { if (end < totalPages - 1) pages.push("…"); pages.push(totalPages); }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-b-xl border-t border-border bg-card px-5 py-3">
      {/* Left: rows per page + range info */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Rows per page:</span>
        <select
          id="pagination-page-size"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {PAGE_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="tabular-nums">
          {from}–{to} of {total}
        </span>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <NavBtn
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </NavBtn>

        {pages.map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              id={`page-btn-${p}`}
              onClick={() => onPageChange(p as number)}
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-foreground hover:bg-muted border border-border"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <NavBtn
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </NavBtn>
      </div>
    </div>
  );
}

function NavBtn({
  onClick,
  disabled,
  children,
  "aria-label": label,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}
