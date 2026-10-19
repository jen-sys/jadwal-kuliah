// Util murni (aman dipakai di server maupun client)

export const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const JS_DAY_TO_NAME = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Rendah",
  MEDIUM: "Sedang",
  HIGH: "Tinggi",
};
export const PRIORITY_CLASS: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-slate-100 text-slate-600",
};

// Class Tailwind yang dipakai ulang
export const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
export const btnPrimary =
  "bg-indigo-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed";
export const btnGhost =
  "border border-slate-300 rounded-lg py-2 px-4 text-sm hover:bg-slate-50 disabled:opacity-60";
export const cardCls = "bg-white rounded-xl border border-slate-200";

// ---------- Tipe data untuk client ----------
export type CourseDTO = {
  id: string;
  name: string;
  lecturer: string | null;
  room: string | null;
  day: string;
  startTime: string;
  endTime: string;
  color: string;
};

export type TaskDTO = {
  id: string;
  title: string;
  notes: string | null;
  deadline: string;
  priority: string;
  done: boolean;
  courseId: string | null;
  course: { id: string; name: string; color: string } | null;
};

// ---------- Tanggal (zona waktu WIB / Asia/Jakarta, UTC+7 tanpa DST) ----------
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Nama hari ini + rentang [start, end) hari ini menurut WIB */
export function jakartaDayInfo(now: Date = new Date()) {
  const shifted = new Date(now.getTime() + WIB_OFFSET_MS);
  const startMs =
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) -
    WIB_OFFSET_MS;
  return {
    dayName: JS_DAY_TO_NAME[shifted.getUTCDay()],
    start: new Date(startMs),
    end: new Date(startMs + 24 * 60 * 60 * 1000),
  };
}

export function formatDeadline(d: Date | string) {
  return new Date(d).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** ISO -> value untuk <input type="datetime-local"> (zona waktu browser) */
export function toLocalInput(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ---------- Validasi input API ----------
type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const asObj = (body: unknown) => (body && typeof body === "object" ? (body as Record<string, unknown>) : {});
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type CourseInput = {
  name?: string;
  lecturer?: string | null;
  room?: string | null;
  day?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
};

/** partial=true untuk PATCH (hanya field yang dikirim yang divalidasi) */
export function parseCourse(body: unknown, partial: boolean): Result<CourseInput> {
  const b = asObj(body);
  const data: CourseInput = {};

  if (!partial || b.name !== undefined) {
    const v = str(b.name);
    if (!v) return { ok: false, error: "Nama matkul wajib diisi" };
    data.name = v;
  }
  if (b.lecturer !== undefined) data.lecturer = str(b.lecturer) || null;
  if (b.room !== undefined) data.room = str(b.room) || null;
  if (!partial || b.day !== undefined) {
    if (typeof b.day !== "string" || !DAYS.includes(b.day)) {
      return { ok: false, error: "Hari tidak valid" };
    }
    data.day = b.day;
  }
  if (!partial || b.startTime !== undefined) {
    if (typeof b.startTime !== "string" || !TIME_RE.test(b.startTime)) {
      return { ok: false, error: "Jam mulai tidak valid (format HH:MM)" };
    }
    data.startTime = b.startTime;
  }
  if (!partial || b.endTime !== undefined) {
    if (typeof b.endTime !== "string" || !TIME_RE.test(b.endTime)) {
      return { ok: false, error: "Jam selesai tidak valid (format HH:MM)" };
    }
    data.endTime = b.endTime;
  }
  if (data.startTime && data.endTime && data.startTime >= data.endTime) {
    return { ok: false, error: "Jam selesai harus setelah jam mulai" };
  }
  if (b.color !== undefined) {
    if (typeof b.color !== "string" || !HEX_RE.test(b.color)) {
      return { ok: false, error: "Warna harus berupa hex, contoh #4F46E5" };
    }
    data.color = b.color;
  }
  return { ok: true, data };
}

export type TaskInput = {
  title?: string;
  notes?: string | null;
  deadline?: Date;
  priority?: string;
  done?: boolean;
  courseId?: string | null;
};

export function parseTask(body: unknown, partial: boolean): Result<TaskInput> {
  const b = asObj(body);
  const data: TaskInput = {};

  if (!partial || b.title !== undefined) {
    const v = str(b.title);
    if (!v) return { ok: false, error: "Judul tugas wajib diisi" };
    data.title = v;
  }
  if (b.notes !== undefined) data.notes = str(b.notes) || null;
  if (!partial || b.deadline !== undefined) {
    const d = typeof b.deadline === "string" ? new Date(b.deadline) : null;
    if (!d || isNaN(d.getTime())) return { ok: false, error: "Deadline tidak valid" };
    data.deadline = d;
  }
  if (b.priority !== undefined) {
    if (typeof b.priority !== "string" || !PRIORITIES.includes(b.priority)) {
      return { ok: false, error: "Prioritas tidak valid" };
    }
    data.priority = b.priority;
  }
  if (b.done !== undefined) {
    if (typeof b.done !== "boolean") return { ok: false, error: "Status selesai tidak valid" };
    data.done = b.done;
  }
  if (b.courseId !== undefined) {
    if (b.courseId === null || b.courseId === "") data.courseId = null;
    else if (typeof b.courseId === "string") data.courseId = b.courseId;
    else return { ok: false, error: "Matkul tidak valid" };
  }
  return { ok: true, data };
}

export type RegisterInput = {
  name: string;
  nim: string;
  kelas: string;
  email: string;
  password: string;
};

export function parseRegister(body: unknown): Result<RegisterInput> {
  const b = asObj(body);
  const name = str(b.name);
  const nim = str(b.nim);
  const kelas = str(b.kelas);
  const email = str(b.email).toLowerCase();
  const password = typeof b.password === "string" ? b.password : "";

  if (!name || !nim || !kelas) return { ok: false, error: "Nama, NIM, dan kelas wajib diisi" };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Format email tidak valid" };
  if (password.length < 6) return { ok: false, error: "Password minimal 6 karakter" };
  return { ok: true, data: { name, nim, kelas, email, password } };
}
