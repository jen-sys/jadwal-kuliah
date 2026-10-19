import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Pesan sengaja disamakan agar tidak membocorkan email mana yang terdaftar
  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
  }

  setSessionCookie(await signToken({ userId: user.id, name: user.name }));
  return NextResponse.json({ ok: true });
}
