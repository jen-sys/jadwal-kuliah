"use client";

import { useState } from "react";
import { CourseDTO, DAYS, btnGhost, btnPrimary, inputCls } from "@/lib/utils";

type Props = {
  initial?: CourseDTO | null;
  onSaved: () => void;
  onCancel: () => void;
};

export default function CourseForm({ initial, onSaved, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [lecturer, setLecturer] = useState(initial?.lecturer ?? "");
  const [room, setRoom] = useState(initial?.room ?? "");
  const [day, setDay] = useState(initial?.day ?? DAYS[0]);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "09:40");
  const [color, setColor] = useState(initial?.color ?? "#4F46E5");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch(initial ? `/api/courses/${initial.id}` : "/api/courses", {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, lecturer, room, day, startTime, endTime, color }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal menyimpan jadwal");
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
        <label className="block text-sm mb-1">Nama matkul</label>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Dosen</label>
          <input className={inputCls} value={lecturer} onChange={(e) => setLecturer(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Ruang</label>
          <input className={inputCls} value={room} onChange={(e) => setRoom(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Hari</label>
        <select className={inputCls} value={day} onChange={(e) => setDay(e.target.value)}>
          {DAYS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Jam mulai</label>
          <input type="time" className={inputCls} value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Jam selesai</label>
          <input type="time" className={inputCls} value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Warna</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-9 w-16 border border-slate-300 rounded-lg p-1 bg-white"
        />
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
