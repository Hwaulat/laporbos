import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Plus,
  Pencil,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  Eye,
  RefreshCw,
  Trash2,
  Upload,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Tabs } from "@/components/custom-tabs";
import { TableToolbar, FilterSelect, Pagination } from "@/components/table-ui";
import {
  users as initialUsers,
  locations,
  type User,
  type Role,
} from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Users Management | RDL Report Monitoring System" },
      {
        name: "description",
        content: "Manage users, roles, and permissions",
      },
    ],
  }),
  component: UsersPage,
});

const ROLES: Role[] = ["Admin", "Supervisor", "Technician", "Operator"];
// Based on mock data we have Team and Entity
const TEAMS = ["Mechanical", "Electrical", "Production", "Warehouse", "Packaging"];
const ENTITIES = ["Manager", "Supervisor", "Staff", "Operator"];

function StatusToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        active ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

const MENUS = [
  "Dashboard",
  "Submit Report",
  "Master Data",
  "Reports",
  "Questions",
  "Users Management"
];

function RolesTab() {
  const [roles, setRoles] = useState([
    { id: "r1", name: "SUPER ADMIN", usersCount: 1 },
    { id: "r2", name: "user", usersCount: 0 },
    { id: "r3", name: "PIC", usersCount: 1 },
    { id: "r4", name: "Warehouse", usersCount: 1 },
    { id: "r5", name: "Approval", usersCount: 0 },
    { id: "r6", name: "Operator", usersCount: 0 },
  ]);
  const [activeRole, setActiveRole] = useState("r1");

  const role = roles.find(r => r.id === activeRole);

  return (
    <div className="grid gap-6 lg:grid-cols-3 items-start">
      {/* Left Column */}
      <div className="flex flex-col gap-4 bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Roles</h2>
          <button className="flex items-center gap-2 rounded-lg bg-[#2b4c8a] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2b4c8a]/90">
            <Plus className="h-4 w-4" /> Create New Role
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {roles.map(r => {
            const isActive = activeRole === r.id;
            return (
              <div 
                key={r.id} 
                onClick={() => setActiveRole(r.id)}
                className={`group flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-colors ${
                  isActive 
                    ? "border-[#2b4c8a] bg-[#2b4c8a] text-white" 
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                    {r.usersCount} users
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isActive 
                      ? "border-white/20 hover:bg-white/10" 
                      : "border-border text-muted-foreground hover:bg-muted hover:text-primary"
                  }`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    isActive 
                      ? "border-red-400/50 text-red-100 bg-red-500 hover:bg-red-600" 
                      : "border-red-200 text-red-500 bg-red-50 hover:bg-red-100"
                  }`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column */}
      <div className="lg:col-span-2 panel overflow-hidden p-0">
        <div className="border-b border-border p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold uppercase">{role?.name}</h2>
          <p className="text-sm text-muted-foreground">Manage permissions for this role</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Menu</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">All Access</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Create</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Update</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delete</th>
                <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Only View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MENUS.map((menu, i) => {
                // Simulate some checkboxes being active or inactive based on index to look like the design
                const isViewOnly = i < 2;
                return (
                  <tr key={menu} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-foreground">{menu}</td>
                    <td className="px-4 py-4 text-center">
                      {!isViewOnly ? <input type="checkbox" className="h-4 w-4 rounded accent-[#2b4c8a]" defaultChecked={true} /> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!isViewOnly ? <input type="checkbox" className="h-4 w-4 rounded accent-[#2b4c8a]" defaultChecked={true} /> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!isViewOnly ? <input type="checkbox" className="h-4 w-4 rounded accent-[#2b4c8a]" defaultChecked={true} /> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {!isViewOnly ? <input type="checkbox" className="h-4 w-4 rounded accent-[#2b4c8a]" defaultChecked={true} /> : <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="checkbox" className="h-4 w-4 rounded accent-[#2b4c8a]" defaultChecked={true} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "all">("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [editing, setEditing] = useState<Partial<User> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<"account" | "role">("account");

  const allFiltered = users.filter((u) => {
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.nik.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || u.role === filterRole;
    const matchTeam = filterTeam === "all" || u.team === filterTeam;
    const matchEntity = filterEntity === "all" || u.entity === filterEntity;
    return matchSearch && matchRole && matchTeam && matchEntity;
  });
  
  const filtered = allFiltered.slice((page - 1) * pageSize, page * pageSize);

  function save() {
    if (!editing?.name?.trim() || !editing?.email?.trim() || !editing?.role)
      return;
    if (editing.id) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editing.id ? { ...u, ...editing } as User : u)),
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          nik: editing.nik || `10${Math.floor(Math.random() * 100)}`,
          name: editing.name!,
          email: editing.email!,
          role: editing.role!,
          team: editing.team || "-",
          entity: editing.entity || "-",
          allocation: editing.allocation || "-",
          locationId: editing.locationId || "loc-1",
          active: editing.active ?? true,
        },
      ]);
    }
    setEditing(null);
  }

  function toggle(id: string) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  }
  
  function remove(id: string) {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter(u => u.id !== id));
    }
  }

  const summary = {
    total: users.length,
    active: users.filter((u) => u.active).length,
    inactive: users.filter((u) => !u.active).length,
  };

  return (
    <AppShell
      title="Users Management"
      description="Manage users, roles, and permissions"
    >
      {/* Tabs */}
      <div className="mb-4">
        <Tabs
          variant="primary"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "account" | "role")}
          items={[
            { value: "account", label: "User Account" },
            { value: "role", label: "Role Permission" },
          ]}
        />
      </div>

      {activeTab === "account" ? (
        <>
          {/* Summary cards */}
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div className="panel flex items-center gap-4 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="font-display text-2xl font-bold text-blue-900">{summary.total}</p>
              </div>
            </div>
            <div className="panel flex items-center gap-4 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="font-display text-2xl font-bold text-emerald-600">{summary.active}</p>
              </div>
            </div>
            <div className="panel flex items-center gap-4 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <UserMinus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Users</p>
                <p className="font-display text-2xl font-bold text-orange-600">{summary.inactive}</p>
              </div>
            </div>
          </div>

          {/* Toolbar & Table Container */}
          <div className="panel overflow-hidden">
            <div className="p-4 pb-3 sm:p-5 sm:pb-4 [&>div]:!mb-0">
              <TableToolbar
              searchValue={search}
              onSearchChange={(v) => { setSearch(v); setPage(1); }}
              searchPlaceholder="Search by username or email"
              filters={
                <>
                  <FilterSelect
                    id="filter-role"
                    value={filterRole}
                    onChange={(v) => { setFilterRole(v as Role | "all"); setPage(1); }}
                  >
                    <option value="all">All Role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-entity"
                    value={filterEntity}
                    onChange={(v) => { setFilterEntity(v); setPage(1); }}
                  >
                    <option value="all">All Position</option>
                    {ENTITIES.map((e) => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </FilterSelect>
                </>
              }
              primaryAction={
                <div className="flex items-center gap-2">
                  <button
                    className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Excel
                  </button>
                  <button
                    id="btn-add-user-toolbar"
                    onClick={() => setEditing({ active: true })}
                    className="flex items-center gap-2 rounded-lg bg-[#2b4c8a] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2b4c8a]/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create New User
                  </button>
                </div>
              }
              />
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Action</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">NIK</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Team</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Allocation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setEditing({ ...user })}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-primary" 
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => remove(user.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive" 
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusToggle active={user.active} onToggle={() => toggle(user.id)} />
                        </td>
                        <td className="px-4 py-3 font-medium">{user.nik}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{user.role}</td>
                        <td className="px-4 py-3">{user.team}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.entity}</td>
                        <td className="px-4 py-3 text-muted-foreground">{user.allocation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              total={allFiltered.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>

          {/* Edit / add modal */}
          {editing && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setEditing(null);
              }}
            >
              <div className="panel w-full max-w-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="text-base font-semibold">
                    {editing.id ? "Edit User" : "Create New User"}
                  </h2>
                  <button
                    id="btn-close-user-modal"
                    onClick={() => setEditing(null)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4 px-6 py-5 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-nik">
                        NIK <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="user-nik"
                        value={editing.nik ?? ""}
                        onChange={(e) => setEditing((p) => ({ ...p, nik: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Employee ID"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-name">
                        Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="user-name"
                        value={editing.name ?? ""}
                        onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Full name"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-email">
                        Email <span className="text-destructive">*</span>
                      </label>
                      <input
                        id="user-email"
                        type="email"
                        value={editing.email ?? ""}
                        onChange={(e) => setEditing((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-role">
                        Role <span className="text-destructive">*</span>
                      </label>
                      <select
                        id="user-role"
                        value={editing.role ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({ ...p, role: e.target.value as Role }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select role…</option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-team">
                        Team
                      </label>
                      <select
                        id="user-team"
                        value={editing.team ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({ ...p, team: e.target.value }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select team…</option>
                        {TEAMS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-entity">
                        Entity
                      </label>
                      <select
                        id="user-entity"
                        value={editing.entity ?? ""}
                        onChange={(e) =>
                          setEditing((p) => ({ ...p, entity: e.target.value }))
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select entity…</option>
                        {ENTITIES.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium" htmlFor="user-allocation">
                        Allocation
                      </label>
                      <input
                        id="user-allocation"
                        value={editing.allocation ?? ""}
                        onChange={(e) => setEditing((p) => ({ ...p, allocation: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Allocation"
                      />
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="user-active">
                    <input
                      id="user-active"
                      type="checkbox"
                      checked={editing.active ?? true}
                      onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                    Active Account
                  </label>
                </div>
                <div className="flex justify-end gap-2 border-t border-border px-6 py-4">
                  <button
                    id="btn-cancel-user"
                    onClick={() => setEditing(null)}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-save-user"
                    onClick={save}
                    disabled={
                      !editing.name?.trim() ||
                      !editing.email?.trim() ||
                      !editing.role
                    }
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {editing.id ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <RolesTab />
      )}
    </AppShell>
  );
}
