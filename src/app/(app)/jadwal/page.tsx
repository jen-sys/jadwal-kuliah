"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@/components/Dialog";
import CourseForm from "@/components/CourseForm";
import { CourseDTO, DAYS, btnPrimary, cardCls } from "@/lib/utils";

export default function JadwalPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error();
      setCourses(await res.json());
      setError("");
    } catch {
      setError("Gagal memuat jadwal. Coba muat ulang halaman.");
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
  function openEdit(c: CourseDTO) {
    setEditing(c);
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

  async function remove(c: CourseDTO) {
    if (!confirm(`Hapus jadwal "${c.name}"? Tugas terkait tidak ikut terhapus.`)) return;
    setDeletingId(c.id);
    try {
      const res = await fetch(`/api/courses/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCourses((prev) => prev.filter((x) => x.id !== c.id));
    } catch {
      setError("Gagal menghapus jadwal.");
    } finally {
      setDeletingId(null);
    }
  }

  const byDay = DAYS.map((day) => ({
    day,
    items: courses.filter((c) => c.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Jadwal Kuliah</h1>
        <button onClick={openAdd} className={btnPrimary}>
          + Tambah
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Memuat jadwal...</p>
      ) : byDay.length === 0 ? (
        <div className={`${cardCls} px-4 py-10 text-center text-sm text-slate-400`}>
          Belum ada jadwal. Tambahkan matkul pertamamu 📚
        </div>
      ) : (
        byDay.map((g) => (
          <section key={g.day}>
            <h2 className="text-sm font-semibold text-slate-700 mb-2">{g.day}</h2>
            <ul className={`${cardCls} divide-y divide-slate-100`}>
              {g.items.map((c) => (
                <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: c.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.startTime}–{c.endTime}
                      {c.room ? ` • ${c.room}` : ""}
                      {c.lecturer ? ` • ${c.lecturer}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm shrink-0">
                    <button onClick={() => openEdit(c)} className="text-indigo-600 hover:underline">
                      Edit
                    </button>
                    <button
                      onClick={() => remove(c)}
                      disabled={deletingId === c.id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === c.id ? "Menghapus..." : "Hapus"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <Dialog open={open} title={editing ? "Edit jadwal" : "Tambah jadwal"} onClose={close}>
        <CourseForm key={editing?.id ?? "new"} initial={editing} onSaved={saved} onCancel={close} />
      </Dialog>
    </div>
  );
}
