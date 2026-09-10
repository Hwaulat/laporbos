import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  MapPin,
  Building2,
  Clock,
  Plus,
  Pencil,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  LayoutDashboard,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs } from "@/components/custom-tabs";
import { TableToolbar, Pagination } from "@/components/table-ui";
import {
  locations as initialLocations,
  areas as initialAreas,
  shifts as initialShifts,
  type Location,
  type Area,
  type Shift,
} from "@/lib/mock-data";

export const Route = createFileRoute("/master-data")({
  head: () => ({
    meta: [
      { title: "Data Master | RDL Report Monitoring System" },
      {
        name: "description",
        content:
          "Kelola data referensi sistem: lokasi, area kerja, dan shift. Data ini digunakan di seluruh formulir dan laporan.",
      },
      { property: "og:title", content: "Data Master | RDL Report Monitoring System" },
    ],
  }),
  component: MasterDataPage,
});

type ActiveTab = "locations" | "areas" | "shifts";

const TABS: { id: ActiveTab; label: string; icon: typeof MapPin }[] = [
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "areas", label: "Areas", icon: Building2 },
  { id: "shifts", label: "Shifts", icon: Clock },
];

/* ─── Generic status badge ─────────────────────────────────── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground"}`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ─── Locations tab ─────────────────────────────────────────── */
function LocationsTab() {
  const [items, setItems] = useState<Location[]>(initialLocations);
  const [editing, setEditing] = useState<Partial<Location> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function save() {
    if (!editing?.name?.trim() || !editing?.code?.trim()) return;
    if (editing.id) {
      setItems((prev) =>
        prev.map((l) => (l.id === editing.id ? { ...l, ...editing } as Location : l)),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `loc-${Date.now()}`,
          name: editing.name!,
          code: editing.code!.toUpperCase(),
          active: editing.active ?? true,
        },
      ]);
    }
    setEditing(null);
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l)));
  }

  const filteredItems = items.filter(
    (l) =>
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4 border-b border-border [&>div]:!mb-0">
          <TableToolbar
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search locations…"
            primaryAction={
              <button
                id="btn-add-location"
                onClick={() => setEditing({ active: true })}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Location
              </button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-24 px-4 py-3 text-center font-semibold text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Location Name</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Code</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedItems.map((loc) => (
              <tr key={loc.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      id={`btn-edit-loc-${loc.id}`}
                      onClick={() => setEditing({ ...loc })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-toggle-loc-${loc.id}`}
                      onClick={() => toggle(loc.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent transition-colors hover:bg-muted ${
                        loc.active ? "text-success hover:text-success/80" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={loc.active ? "Deactivate" : "Activate"}
                    >
                      {loc.active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{loc.name}</td>
                <td className="px-4 py-3">
                  <span className="font-display text-xs font-bold tracking-wider text-muted-foreground bg-muted px-2 py-1 rounded">
                    {loc.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge active={loc.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Pagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* Modal edit/add panel */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="panel w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold">
                {editing.id ? "Edit Location" : "New Location"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="loc-name">
                  Location Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="loc-name"
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Example: Plant Bekasi"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="loc-code">
                  Code <span className="text-destructive">*</span>
                </label>
                <input
                  id="loc-code"
                  value={editing.code ?? ""}
                  maxLength={5}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, code: e.target.value.toUpperCase() }))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-display font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="BKS"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="loc-active"
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <label className="cursor-pointer text-sm" htmlFor="loc-active">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button
                id="btn-cancel-loc"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                id="btn-save-loc"
                onClick={save}
                disabled={!editing.name?.trim() || !editing.code?.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Areas tab ─────────────────────────────────────────────── */
function AreasTab({ locations }: { locations: Location[] }) {
  const [items, setItems] = useState<Area[]>(initialAreas);
  const [editing, setEditing] = useState<Partial<Area> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function save() {
    if (!editing?.name?.trim() || !editing?.locationIds || editing.locationIds.length === 0) return;
    if (editing.id) {
      setItems((prev) =>
        prev.map((a) => (a.id === editing.id ? { ...a, ...editing } as Area : a)),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `ar-${Date.now()}`,
          name: editing.name!,
          locationIds: editing.locationIds!,
          active: editing.active ?? true,
        },
      ]);
    }
    setEditing(null);
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }

  const locName = (ids: string[] | undefined, singleId: string | undefined) => {
    if (ids && ids.length > 0) {
      return ids.map(id => locations.find(l => l.id === id)?.name ?? id).join(", ");
    }
    if (singleId) {
      return locations.find(l => l.id === singleId)?.name ?? singleId;
    }
    return "-";
  };

  const filteredItems = items.filter(
    (a) =>
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      locName(a.locationIds, a.locationId).toLowerCase().includes(search.toLowerCase())
  );
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const toggleLocation = (locId: string) => {
    setEditing(prev => {
      if (!prev) return prev;
      const currentIds = prev.locationIds || (prev.locationId ? [prev.locationId] : []);
      if (currentIds.includes(locId)) {
        return { ...prev, locationIds: currentIds.filter(id => id !== locId) };
      } else {
        return { ...prev, locationIds: [...currentIds, locId] };
      }
    });
  };

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4 border-b border-border [&>div]:!mb-0">
          <TableToolbar
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search areas…"
            primaryAction={
              <button
                id="btn-add-area"
                onClick={() => setEditing({ active: true, locationIds: [] })}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Area
              </button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-24 px-4 py-3 text-center font-semibold text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Area Name</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Location</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedItems.map((area) => (
              <tr key={area.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      id={`btn-edit-area-${area.id}`}
                      onClick={() => setEditing({ ...area, locationIds: area.locationIds || (area.locationId ? [area.locationId] : []) })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-toggle-area-${area.id}`}
                      onClick={() => toggle(area.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent transition-colors hover:bg-muted ${
                        area.active ? "text-success hover:text-success/80" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={area.active ? "Deactivate" : "Activate"}
                    >
                      {area.active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{area.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{locName(area.locationIds, area.locationId)}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge active={area.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Pagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* Modal edit/add panel */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="panel w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold">
                {editing.id ? "Edit Area" : "New Area"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="area-name">
                  Area Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="area-name"
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Example: Warehouse Area"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Locations <span className="text-destructive">*</span>
                </label>
                <div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20 max-h-48 overflow-y-auto">
                  {locations.map((l) => {
                    const isChecked = (editing.locationIds || (editing.locationId ? [editing.locationId] : [])).includes(l.id);
                    return (
                      <label key={l.id} className="flex items-center gap-2 cursor-pointer text-sm hover:bg-muted/50 p-1.5 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleLocation(l.id)}
                          className="h-4 w-4 accent-primary"
                        />
                        {l.name}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="area-active"
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <label className="cursor-pointer text-sm" htmlFor="area-active">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button
                id="btn-cancel-area"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                id="btn-save-area"
                onClick={save}
                disabled={!editing.name?.trim() || !(editing.locationIds?.length || editing.locationId)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Shifts tab */
function ShiftsTab() {
  const [items, setItems] = useState<Shift[]>(initialShifts);
  const [editing, setEditing] = useState<Partial<Shift> | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  function save() {
    if (!editing?.name?.trim() || !editing?.start || !editing?.end) return;
    if (editing.id) {
      setItems((prev) =>
        prev.map((s) => (s.id === editing.id ? { ...s, ...editing } as Shift : s)),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          id: `sh-${Date.now()}`,
          name: editing.name!,
          start: editing.start!,
          end: editing.end!,
          active: editing.active ?? true,
        },
      ]);
    }
    setEditing(null);
  }

  function toggle(id: string) {
    setItems((prev) => prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  }

  const filteredItems = items.filter(
    (s) => !search || s.name.toLowerCase().includes(search.toLowerCase())
  );
  const pagedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="panel overflow-hidden">
        <div className="p-4 pb-3 sm:p-5 sm:pb-4 border-b border-border [&>div]:!mb-0">
          <TableToolbar
            searchValue={search}
            onSearchChange={(v) => { setSearch(v); setPage(1); }}
            searchPlaceholder="Search shifts…"
            primaryAction={
              <button
                id="btn-add-shift"
                onClick={() => setEditing({ active: true })}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Shift
              </button>
            }
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-24 px-4 py-3 text-center font-semibold text-muted-foreground">Action</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Shift Name</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Start</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">End</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pagedItems.map((shift) => (
              <tr key={shift.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      id={`btn-edit-shift-${shift.id}`}
                      onClick={() => setEditing({ ...shift })}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      id={`btn-toggle-shift-${shift.id}`}
                      onClick={() => toggle(shift.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent transition-colors hover:bg-muted ${
                        shift.active ? "text-success hover:text-success/80" : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={shift.active ? "Deactivate" : "Activate"}
                    >
                      {shift.active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{shift.name}</td>
                <td className="px-4 py-3 font-display font-semibold tabular-nums">
                  {shift.start}
                </td>
                <td className="px-4 py-3 font-display font-semibold tabular-nums">
                  {shift.end}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge active={shift.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <Pagination
          total={filteredItems.length}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
        />
      </div>

      {/* Modal edit/add panel */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div className="panel w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold">
                {editing.id ? "Edit Shift" : "New Shift"}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="rounded p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shift-name">
                  Shift Name <span className="text-destructive">*</span>
                </label>
                <input
                  id="shift-name"
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Example: Shift 1"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shift-start">
                  Start Time <span className="text-destructive">*</span>
                </label>
                <input
                  id="shift-start"
                  type="time"
                  value={editing.start ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, start: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shift-end">
                  End Time <span className="text-destructive">*</span>
                </label>
                <input
                  id="shift-end"
                  type="time"
                  value={editing.end ?? ""}
                  onChange={(e) => setEditing((p) => ({ ...p, end: e.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  id="shift-active"
                  type="checkbox"
                  checked={editing.active ?? true}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                  className="h-4 w-4 accent-primary"
                />
                <label className="cursor-pointer text-sm" htmlFor="shift-active">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
              <button
                id="btn-cancel-shift"
                onClick={() => setEditing(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                id="btn-save-shift"
                onClick={save}
                disabled={!editing.name?.trim() || !editing.start || !editing.end}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
function MasterDataPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("locations");
  const [locations] = useState<Location[]>(initialLocations);

  return (
    <AppShell
      title="Master Data"
      description="Location, area, and shift references used across all forms"
    >
      {/* Title Panel */}
      <div className="panel mb-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-2 font-display font-bold text-foreground">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <span>Master Data &mdash; System References</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              variant="primary"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as ActiveTab)}
              items={TABS.map((tab) => ({
                value: tab.id,
                label: tab.label,
                icon: <tab.icon className="h-4 w-4" />,
              }))}
            />
          </div>
        </div>
      </div>

      {activeTab === "locations" && (
        <LocationsTab key="locations" />
      )}
      {activeTab === "areas" && (
        <AreasTab key="areas" locations={locations} />
      )}
      {activeTab === "shifts" && <ShiftsTab key="shifts" />}
    </AppShell>
  );
}
