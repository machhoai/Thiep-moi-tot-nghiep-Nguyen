import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const sessionCookie = "nguyen_admin";
export const sessionAge = 60 * 60 * 8;

export function isConfigured() {
  return (process.env.ADMIN_PASSWORD?.length ?? 0) >= 12
    && (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
}

function hash(text: string) {
  return createHash("sha256").update(text).digest();
}

export function validPassword(password: string) {
  return isConfigured() && timingSafeEqual(hash(password), hash(process.env.ADMIN_PASSWORD!));
}

function signature(expires: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(expires).update(hash(process.env.ADMIN_PASSWORD!)).digest("hex");
}

export function createSession() {
  const expires = String(Math.floor(Date.now() / 1000) + sessionAge);
  return `${expires}.${signature(expires)}`;
}

export async function isAdmin() {
  if (!isConfigured()) return false;
  const value = (await cookies()).get(sessionCookie)?.value ?? "";
  if (!/^\d{1,12}\.[a-f0-9]{64}$/.test(value)) return false;
  const [expires, token] = value.split(".");
  return Number(expires) > Date.now() / 1000
    && timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(signature(expires), "hex"));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}
