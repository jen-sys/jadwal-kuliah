import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const COOKIE_NAME = "kuliahku_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari (detik)

export type Session = { userId: string; name: string };

function getSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("JWT_SECRET belum diset atau kurang dari 32 karakter");
  }
  return new TextEncoder().encode(s);
}

const cookieBase = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
});

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: Session) {
  return new SignJWT({ userId: payload.userId, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, { ...cookieBase(), maxAge: MAX_AGE });
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const secret = getSecret(); // di luar try agar salah konfigurasi tidak tersembunyi
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.name !== "string") return null;
    return { userId: payload.userId, name: payload.name };
  } catch {
    return null; // token kedaluwarsa / tidak valid
  }
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { ...cookieBase(), maxAge: 0 });
}
