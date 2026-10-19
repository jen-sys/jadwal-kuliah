"use client";

import { useState } from "react";
import {
  CourseDTO,
  PRIORITIES,
  PRIORITY_LABEL,
  TaskDTO,
  btnGhost,
  btnPrimary,
  inputCls,
  toLocalInput,
} from "@/lib/utils";

type Props = {
  initial?: TaskDTO | null;
  courses: CourseDTO[];
  onSaved: () => void;
  onCancel: () => void;
};

export default function TaskForm({ initial, courses, onSaved, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [deadline, setDeadline] = useState(initial ? toLocalInput(initial.deadline) : "");
  const [priority, setPriority] = useState(initial?.priority ?? "MEDIUM");
  const [courseId, setCourseId] = useState(initial?.courseId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const d = new Date(deadline);
    if (!deadline || isNaN(d.getTime())) {
      setError("Deadline wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(initial ? `/api/tasks/${initial.id}` : "/api/tasks", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes,
          deadline: d.toISOString(), // dari waktu lokal browser ke UTC
          priority,
          courseId: courseId || null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan tugas");
        return;
      }
      onSaved();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Judul</label>
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Catatan (opsional)</label>
        <textarea className={inputCls} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm mb-1">Deadline</label>
        <input type="datetime-local" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Prioritas</label>
          <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABEL[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Matkul (opsional)</label>
          <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">— Tidak ada —</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Batal
        </button>
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </form>
  );
}
