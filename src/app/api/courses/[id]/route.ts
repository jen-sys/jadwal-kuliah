import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseCourse } from "@/lib/utils";

type Ctx = { params: { id: string } };
const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Jadwal tidak ditemukan" }, { status: 404 });

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorized();

  // Validasi kepemilikan
  const existing = await prisma.course.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!existing) return notFound();

  const parsed = parseCourse(await req.json().catch(() => null), true);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Cek urutan jam terhadap data yang sudah ada jika hanya salah satu yang diubah
  const start = parsed.data.startTime ?? existing.startTime;
  const end = parsed.data.endTime ?? existing.endTime;
  if (start >= end) {
    return NextResponse.json({ error: "Jam selesai harus setelah jam mulai" }, { status: 400 });
  }

  const course = await prisma.course.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(course);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorized();

  const existing = await prisma.course.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!existing) return notFound();

  await prisma.course.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
