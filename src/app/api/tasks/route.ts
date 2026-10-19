import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseTask } from "@/lib/utils";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const include = { course: { select: { id: true, name: true, color: true } } };

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const tasks = await prisma.task.findMany({
    where: { userId: session.userId },
    include,
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const parsed = parseTask(await req.json().catch(() => null), false);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const d = parsed.data;

  // Matkul yang dipilih harus milik user ini
  if (d.courseId) {
    const course = await prisma.course.findFirst({
      where: { id: d.courseId, userId: session.userId },
    });
    if (!course) return NextResponse.json({ error: "Matkul tidak ditemukan" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: session.userId,
      title: d.title!,
      notes: d.notes ?? null,
      deadline: d.deadline!,
      priority: d.priority ?? "MEDIUM",
      done: d.done ?? false,
      courseId: d.courseId ?? null,
    },
    include,
  });
  return NextResponse.json(task, { status: 201 });
}
