import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseTask } from "@/lib/utils";

type Ctx = { params: { id: string } };
const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const notFound = () => NextResponse.json({ error: "Tugas tidak ditemukan" }, { status: 404 });
const include = { course: { select: { id: true, name: true, color: true } } };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorized();

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!existing) return notFound();

  const parsed = parseTask(await req.json().catch(() => null), true);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  if (parsed.data.courseId) {
    const course = await prisma.course.findFirst({
      where: { id: parsed.data.courseId, userId: session.userId },
    });
    if (!course) return NextResponse.json({ error: "Matkul tidak ditemukan" }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data: parsed.data,
    include,
  });
  return NextResponse.json(task);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return unauthorized();

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: session.userId },
  });
  if (!existing) return notFound();

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
