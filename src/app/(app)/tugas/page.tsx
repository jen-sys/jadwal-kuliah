"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@/components/Dialog";
import TaskForm from "@/components/TaskForm";
import PriorityBadge from "@/components/PriorityBadge";
import { CourseDTO, TaskDTO, btnPrimary, cardCls, formatDeadline, jakartaDayInfo } from "@/lib/utils";

type Filter = "ALL" | "ACTIVE" | "DONE";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "Semua" },
  { key: "ACTIVE", label: "Aktif" },
  { key: "DONE", label: "Selesai" },
];

export default function TugasPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TaskDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [tRes, cRes] = await Promise.all([fetch("/api/tasks"), fetch("/api/courses")]);
      if (tRes.status === 401 || cRes.status === 401) {
        router.push("/login");
        return;
      }
      if (!tRes.ok || !cRes.ok) throw new Error();
      setTasks(await tRes.json());
      setCourses(await cRes.json());
      setError("");
    } catch {
      setError("Gagal memuat tugas. Coba muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(t: TaskDTO) {
    setEditing(t);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    setEditing(null);
  }
  async function saved() {
    close();
    await load();
  }

  // Centang selesai: update UI dulu (optimistic), rollback kalau gagal
  async function toggleDone(t: TaskDTO) {
    const prev = tasks;
    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    const res = await fetch(`/api/tasks/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    }).catch(() => null);
    if (!res || !res.ok) {
      setTasks(prev);
      setError("Gagal mengubah status tugas.");
    }
  }

  async function remove(t: TaskDTO) {
    if (!confirm(`Hapus tugas "${t.title}"?`)) return;
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
    } catch {
      setError("Gagal menghapus tugas.");
    } finally {
      setDeletingId(null);
    }
  }

  const visible = useMemo(
    () =>
      tasks.filter((t) => (filter === "ALL" ? true : filter === "DONE" ? t.done : !t.done)),
    [tasks, filter]
  );

  const now = new Date();
  const { start: dayStart, end: dayEnd } = jakartaDayInfo(now);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tugas</h1>
        <button onClick={openAdd} className={btnPrimary}>
          + Tambah
        </button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === f.key
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat tugas...</p>
      ) : visible.length === 0 ? (
        <div className={`${cardCls} px-4 py-10 text-center text-sm text-slate-400`}>
          {filter === "DONE" ? "Belum ada tugas selesai 🕐" : "Tidak ada tugas di sini 🎉"}
        </div>
      ) : (
        <ul className={`${cardCls} divide-y divide-slate-100 overflow-hidden`}>
          {visible.map((t) => {
            const dl = new Date(t.deadline);
            const overdue = !t.done && dl < now;
            const isToday = !t.done && dl >= dayStart && dl < dayEnd;
            return (
              <li
                key={t.id}
                className={`flex items-start gap-3 px-4 py-3 ${isToday && !overdue ? "bg-amber-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleDone(t)}
                  aria-label={`Tandai selesai: ${t.title}`}
                  className="mt-1 h-4 w-4 accent-indigo-600"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${t.done ? "line-through text-slate-400" : ""}`}>{t.title}</p>
                  {t.notes && <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-line">{t.notes}</p>}
                  <p className={`text-xs mt-1 ${overdue ? "text-red-600 font-medium" : "text-slate-500"}`}>
                    {overdue ? "Lewat: " : ""}
                    {formatDeadline(t.deadline)}
                    {t.course && (
                      <span className="ml-2 inline-flex items-center gap-1 text-slate-500">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.course.color }} />
                        {t.course.name}
                      </span>
                    )}
                  </p>
                  <div className="flex gap-3 text-xs mt-2">
                    <button onClick={() => openEdit(t)} className="text-indigo-600 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => remove(t)}
                      disabled={deletingId === t.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === t.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </div>
                <PriorityBadge priority={t.priority} />
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} title={editing ? "Edit tugas" : "Tambah tugas"} onClose={close}>
        <TaskForm key={editing?.id ?? "new"} initial={editing} courses={courses} onSaved={saved} onCancel={close} />
      </Dialog>
    </div>
  );
}
