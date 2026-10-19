import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { parseRegister } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = parseRegister(body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { name, nim, kelas, email, password } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });

  const user = await prisma.user.create({
    data: { name, nim, kelas, email, password: await hashPassword(password) },
  });

  // Auto-login tanpa verifikasi email
  setSessionCookie(await signToken({ userId: user.id, name: user.name }));
  return NextResponse.json({ ok: true }, { status: 201 });
}
