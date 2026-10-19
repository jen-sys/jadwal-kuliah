# KuliahKu

Pengingat jadwal kuliah & tugas untuk mahasiswa.
Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma + SQLite.

## Setup lokal

### Opsi A — pakai file proyek ini (paling cepat)
```bash
npm install
cp .env.example .env        # lalu isi JWT_SECRET (min. 32 karakter)
npx prisma migrate dev --name init
npm run dev
```
Buka http://localhost:3000

Buat JWT_SECRET acak: `openssl rand -base64 48`

### Opsi B — mulai dari create-next-app
```bash
npx create-next-app@14 kuliahku --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd kuliahku
npm install @prisma/client@5 bcryptjs jose
npm install -D prisma@5 @types/bcryptjs
npx prisma init --datasource-provider sqlite
```
Lalu timpa `prisma/schema.prisma`, `src/`, dan `.env` dengan isi dari proyek ini,
tambahkan `"postinstall": "prisma generate"` dan ubah `"build"` menjadi
`"prisma generate && next build"` di package.json, lalu:
```bash
npx prisma migrate dev --name init
npm run dev
```

## Deploy ke Vercel — PENTING
SQLite adalah file lokal; filesystem Vercel bersifat sementara/read-only, jadi data
**tidak akan tersimpan** di produksi. Untuk Vercel, pakai database hosted
(Neon, Vercel Postgres, Supabase, dll):

1. Di `prisma/schema.prisma` ubah `provider = "sqlite"` menjadi `provider = "postgresql"`.
2. Set `DATABASE_URL` ke connection string Postgres di Environment Variables Vercel.
3. Set juga `JWT_SECRET` di Vercel.
4. Jalankan `npx prisma migrate dev --name init` secara lokal (terhadap DB Postgres),
   commit folder `prisma/migrations`, lalu di Vercel gunakan build command:
   `prisma migrate deploy && next build`

Kode aplikasi tidak perlu diubah.

## Catatan
- "Hari ini" dan batas hari dihitung dengan zona waktu WIB (Asia/Jakarta).
- Dashboard: tugas yang deadline-nya sudah lewat muncul di "Deadline Lewat",
  "Deadline Hari Ini" hanya yang belum lewat, "Deadline Terdekat" = 5 tugas setelah hari ini.
