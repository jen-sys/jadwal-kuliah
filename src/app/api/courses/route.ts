import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { parseCourse } from "@/lib/utils";

const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();

  const courses = await prisma.course.findMany({
    where: { userId: session.userId },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(courses);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  const parsed = parseCourse(await req.json().catch(() => null), false);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const d = parsed.data;

  const course = await prisma.course.create({
    data: {
      userId: session.userId,
      name: d.name!,
      lecturer: d.lecturer ?? null,
      room: d.room ?? null,
      day: d.day!,
      startTime: d.startTime!,
      endTime: d.endTime!,
      ...(d.color ? { color: d.color } : {}),
    },
  });
  return NextResponse.json(course, { status: 201 });
}
