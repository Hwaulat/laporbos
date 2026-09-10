export type FormTypeId =
  | "lapor-bos-v2"
  | "lapor-bos-v3"
  | "near-miss"
  | "qrp"
  | "unsafe-condition";

export type Role = "Operator" | "Technician" | "Supervisor" | "Admin";
export type ReportStatus = "Open" | "Closed";
export type InputType = "text" | "number" | "dropdown" | "checkbox" | "radio";

export const formTypes: { id: FormTypeId; name: string; short: string }[] = [
  { id: "lapor-bos-v2", name: "Lapor Bos v2", short: "LBV2" },
  { id: "lapor-bos-v3", name: "Lapor Bos v3", short: "LBV3" },
  { id: "near-miss", name: "Near-miss Report", short: "NMR" },
  { id: "qrp", name: "QRP Report", short: "QRP" },
  { id: "unsafe-condition", name: "Unsafe Condition Report", short: "UCR" },
];

export const formName = (id: FormTypeId) =>
  formTypes.find((f) => f.id === id)?.name ?? id;

export type Location = { id: string; name: string; code: string; active: boolean };
export type Area = { id: string; name: string; locationId: string; active: boolean };
export type Shift = { id: string; name: string; start: string; end: string; active: boolean };

export const locations: Location[] = [
  { id: "loc-1", name: "Plant Cikarang", code: "CKR", active: true },
  { id: "loc-2", name: "Plant Karawang", code: "KRW", active: true },
  { id: "loc-3", name: "Warehouse Marunda", code: "MRD", active: true },
  { id: "loc-4", name: "Head Office Jakarta", code: "HOJ", active: false },
];

export const areas: Area[] = [
  { id: "ar-1", name: "Assembly Line A", locationId: "loc-1", active: true },
  { id: "ar-2", name: "Assembly Line B", locationId: "loc-1", active: true },
  { id: "ar-3", name: "Utility & Boiler", locationId: "loc-1", active: true },
  { id: "ar-4", name: "Press Shop", locationId: "loc-2", active: true },
  { id: "ar-5", name: "Painting", locationId: "loc-2", active: true },
  { id: "ar-6", name: "Loading Dock", locationId: "loc-3", active: true },
  { id: "ar-7", name: "Cold Storage", locationId: "loc-3", active: true },
];

export const shifts: Shift[] = [
  { id: "sh-1", name: "Shift 1", start: "07:00", end: "15:00", active: true },
  { id: "sh-2", name: "Shift 2", start: "15:00", end: "23:00", active: true },
  { id: "sh-3", name: "Shift 3", start: "23:00", end: "07:00", active: true },
];

export type Question = {
  id: string;
  formType: FormTypeId;
  prompt: string;
  inputType: InputType;
  options?: string[];
  order: number;
  required: boolean;
  visible: boolean;
  responses: number;
};

export const questions: Question[] = [
  {
    id: "q-1",
    formType: "lapor-bos-v2",
    prompt: "Jelaskan temuan yang Anda lihat",
    inputType: "text",
    order: 1,
    required: true,
    visible: true,
    responses: 128,
  },
  {
    id: "q-2",
    formType: "lapor-bos-v2",
    prompt: "Tingkat risiko",
    inputType: "radio",
    options: ["Rendah", "Sedang", "Tinggi"],
    order: 2,
    required: true,
    visible: true,
    responses: 128,
  },
  {
    id: "q-3",
    formType: "lapor-bos-v2",
    prompt: "Estimasi jumlah orang terdampak",
    inputType: "number",
    order: 3,
    required: false,
    visible: true,
    responses: 91,
  },
  {
    id: "q-4",
    formType: "lapor-bos-v3",
    prompt: "Kategori temuan",
    inputType: "dropdown",
    options: ["Housekeeping", "Alat Pelindung Diri", "Mesin", "Ergonomi", "Lingkungan"],
    order: 1,
    required: true,
    visible: true,
    responses: 64,
  },
  {
    id: "q-5",
    formType: "lapor-bos-v3",
    prompt: "Tindakan sementara yang sudah dilakukan",
    inputType: "text",
    order: 2,
    required: false,
    visible: true,
    responses: 51,
  },
  {
    id: "q-6",
    formType: "lapor-bos-v3",
    prompt: "Peralatan terkait",
    inputType: "checkbox",
    options: ["Forklift", "Conveyor", "Crane", "Panel Listrik", "Lainnya"],
    order: 3,
    required: false,
    visible: false,
    responses: 12,
  },
  {
    id: "q-7",
    formType: "near-miss",
    prompt: "Kronologi kejadian nyaris celaka",
    inputType: "text",
    order: 1,
    required: true,
    visible: true,
    responses: 44,
  },
  {
    id: "q-8",
    formType: "near-miss",
    prompt: "Potensi konsekuensi bila terjadi",
    inputType: "radio",
    options: ["Ringan", "Serius", "Fatal"],
    order: 2,
    required: true,
    visible: true,
    responses: 44,
  },
  {
    id: "q-9",
    formType: "qrp",
    prompt: "Nomor batch / produk",
    inputType: "text",
    order: 1,
    required: true,
    visible: true,
    responses: 37,
  },
  {
    id: "q-10",
    formType: "qrp",
    prompt: "Jenis penyimpangan kualitas",
    inputType: "dropdown",
    options: ["Dimensi", "Visual", "Fungsi", "Kemasan"],
    order: 2,
    required: true,
    visible: true,
    responses: 37,
  },
  {
    id: "q-11",
    formType: "unsafe-condition",
    prompt: "Kondisi tidak aman yang ditemukan",
    inputType: "text",
    order: 1,
    required: true,
    visible: true,
    responses: 73,
  },
  {
    id: "q-12",
    formType: "unsafe-condition",
    prompt: "Apakah area sudah diisolasi?",
    inputType: "radio",
    options: ["Sudah", "Belum"],
    order: 2,
    required: true,
    visible: true,
    responses: 73,
  },
];

export type StatusEvent = { at: string; actor: string; action: string; note?: string };

export type Report = {
  id: string;
  ref: string;
  formType: FormTypeId;
  submittedAt: string;
  reporter: string;
  locationId: string;
  areaId: string;
  shiftId: string;
  status: ReportStatus;
  summary: string;
  answers: { prompt: string; value: string }[];
  history: StatusEvent[];
};

const reporters = [
  "Budi Santoso",
  "Siti Rahayu",
  "Agus Prakoso",
  "Dewi Lestari",
  "Rizky Ananda",
  "Joko Widarto",
  "Maria Kurnia",
  "Hendra Wijaya",
];

const summaries = [
  "Ceceran oli di jalur pejalan kaki",
  "Guard mesin press terlepas",
  "Kabel panel terbuka tanpa penutup",
  "Forklift melaju melebihi batas kecepatan",
  "APAR kedaluwarsa di pos 3",
  "Pekerja tidak memakai kacamata safety",
  "Kemasan produk penyok pada batch pagi",
  "Lantai licin dekat area pencucian",
  "Rak penyimpanan miring dan berpotensi roboh",
  "Alarm evakuasi tidak berbunyi saat uji coba",
  "Selang hidran bocor di area utility",
  "Palet bertumpuk melebihi batas aman",
];

function pad(n: number) {
  return String(n).padStart(3, "0");
}

export const reports: Report[] = Array.from({ length: 48 }).map((_, i) => {
  const form = formTypes[i % formTypes.length];
  const area = areas[i % areas.length];
  const shift = shifts[i % shifts.length];
  const status: ReportStatus = i % 3 === 0 ? "Closed" : "Open";
  const day = 28 - (i % 28);
  const submittedAt = `2026-09-${pad(day).slice(1)}T${pad(7 + (i % 12)).slice(1)}:${i % 2 ? "30" : "05"}:00`;
  const reporter = reporters[i % reporters.length];
  const summary = summaries[i % summaries.length];

  return {
    id: `rep-${i + 1}`,
    ref: `${form.short}-2609-${pad(i + 1)}`,
    formType: form.id,
    submittedAt,
    reporter,
    locationId: area.locationId,
    areaId: area.id,
    shiftId: shift.id,
    status,
    summary,
    answers: questions
      .filter((q) => q.formType === form.id && q.visible)
      .map((q) => ({
        prompt: q.prompt,
        value:
          q.inputType === "number"
            ? String(2 + (i % 7))
            : q.options
              ? q.options[i % q.options.length]
              : summary,
      })),
    history:
      status === "Closed"
        ? [
            { at: submittedAt, actor: reporter, action: "Report submitted" },
            {
              at: submittedAt.replace("T0", "T1"),
              actor: "Hendra Wijaya (Supervisor)",
              action: "Status changed Open → Closed",
              note: "Temuan sudah diperbaiki dan diverifikasi di lapangan.",
            },
          ]
        : [{ at: submittedAt, actor: reporter, action: "Report submitted" }],
  };
});

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  locationId: string;
  active: boolean;
};

export const users: User[] = [
  { id: "u-1", name: "Agung Gumelar", email: "agung@rdl.co.id", role: "Admin", locationId: "loc-1", active: true },
  { id: "u-2", name: "Hendra Wijaya", email: "hendra@rdl.co.id", role: "Supervisor", locationId: "loc-1", active: true },
  { id: "u-3", name: "Maria Kurnia", email: "maria@rdl.co.id", role: "Supervisor", locationId: "loc-2", active: true },
  { id: "u-4", name: "Rizky Ananda", email: "rizky@rdl.co.id", role: "Technician", locationId: "loc-1", active: true },
  { id: "u-5", name: "Budi Santoso", email: "budi@rdl.co.id", role: "Operator", locationId: "loc-1", active: true },
  { id: "u-6", name: "Siti Rahayu", email: "siti@rdl.co.id", role: "Operator", locationId: "loc-2", active: true },
  { id: "u-7", name: "Joko Widarto", email: "joko@rdl.co.id", role: "Operator", locationId: "loc-3", active: false },
];

export const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? "-";
export const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? "-";
export const shiftName = (id: string) => shifts.find((s) => s.id === id)?.name ?? "-";

export const currentUser = { name: "Agung Gumelar", role: "Admin" as Role, initials: "AG" };
