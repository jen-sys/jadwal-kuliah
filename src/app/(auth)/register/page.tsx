"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { btnPrimary, cardCls, inputCls } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", nim: "", kelas: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "Gagal mendaftar");
        return;
      }
      // Auto-login: cookie sudah di-set server
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className={`${cardCls} w-full max-w-sm p-6`}>
        <h1 className="text-xl font-bold text-indigo-600">Daftar KuliahKu</h1>
        <p className="text-sm text-slate-500 mb-5">Buat akun, langsung masuk tanpa verifikasi email.</p>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Nama lengkap</label>
            <input className={inputCls} value={form.name} onChange={set("name")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">NIM</label>
              <input className={inputCls} value={form.nim} onChange={set("nim")} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Kelas</label>
              <input className={inputCls} value={form.kelas} onChange={set("kelas")} required />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className={inputCls} value={form.email} onChange={set("email")} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password (min. 6 karakter)</label>
            <input type="password" minLength={6} className={inputCls} value={form.password} onChange={set("password")} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-4 text-center">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </main>
  );
}
