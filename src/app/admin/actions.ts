"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { createSession, requireAdmin, sessionAge, sessionCookie, validPassword } from "@/lib/auth";
import { db, savePhoto } from "@/lib/db";
import { fieldLimits, type Invitation } from "@/lib/invitation";

function finish(section: string, status: string): never {
  redirect(`/admin?status=${status}#${section}`);
}

export async function login(formData: FormData) {
  if (!validPassword(String(formData.get("password") ?? ""))) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    redirect("/admin?status=login-error");
  }
  (await cookies()).set(sessionCookie, createSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(sessionCookie);
  redirect("/admin");
}

export async function saveContent(formData: FormData) {
  await requireAdmin();
  const fields = Object.keys(fieldLimits) as (keyof Invitation)[];
  const content = Object.fromEntries(fields.map((key) => [key, String(formData.get(key) ?? "").trim()])) as Invitation;
  if (fields.some((key) => !content[key] || content[key].length > fieldLimits[key])) finish("noi-dung", "content-error");

  const date = new Date(`${content.date}T00:00:00Z`);
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  if (!/^[2-9]\d{3}-\d{2}-\d{2}$/.test(content.date) || Number.isNaN(date.getTime())
    || date.toISOString().slice(0, 10) !== content.date || !time.test(content.start)
    || !time.test(content.end) || content.end <= content.start) {
    finish("noi-dung", "date-error");
  }
  const lines = content.schedule.split("\n").filter((line) => line.trim());
  if (lines.some((line) => {
    const [start, ...description] = line.split("|");
    return !time.test(start.trim()) || !description.join("|").trim();
  })) finish("noi-dung", "schedule-error");

  db().prepare("UPDATE invitation SET content = ? WHERE id = 1").run(JSON.stringify(content));
  revalidatePath("/");
  finish("noi-dung", "content-saved");
}

async function upload(role: "cover" | "gallery", formData: FormData) {
  await requireAdmin();
  const file = formData.get("photo");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024 || !alt || alt.length > 160) {
    finish("hinh-anh", "photo-error");
  }

  let bytes: Buffer;
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 32_000_000 });
    const { format } = await image.metadata();
    if (!format || !["jpeg", "png", "webp"].includes(format)) finish("hinh-anh", "photo-error");
    bytes = await image.autoOrient().resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 88 }).toBuffer();
  } catch {
    finish("hinh-anh", "photo-error");
  }
  savePhoto(randomUUID(), role, bytes, alt);
  revalidatePath("/");
  finish("hinh-anh", role === "cover" ? "cover-saved" : "photo-added");
}

export async function replaceCover(formData: FormData) {
  await upload("cover", formData);
}

export async function addPhoto(formData: FormData) {
  await upload("gallery", formData);
}

export async function removePhoto(formData: FormData) {
  await requireAdmin();
  db().prepare("DELETE FROM photos WHERE id = ? AND role = 'gallery'").run(String(formData.get("id") ?? ""));
  revalidatePath("/");
  finish("hinh-anh", "photo-removed");
}
