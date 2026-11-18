"use server";

import { db } from "@/lib/db";

export type ReplyResult = { kind: "idle" | "error" | "success"; message: string };

export async function submitReply(_previous: ReplyResult, fields: FormData): Promise<ReplyResult> {
  const name = String(fields.get("name") ?? "").trim();
  const message = String(fields.get("message") ?? "").trim();
  const attendance = fields.get("attendance");

  if (!name || name.length > 100 || message.length > 1000 || (attendance !== "yes" && attendance !== "no")) {
    return { kind: "error", message: "Bạn kiểm tra lại tên và lựa chọn tham dự nhé." };
  }

  db().prepare("INSERT INTO replies (name, message, attendance, createdAt) VALUES (?, ?, ?, ?)")
    .run(name, message, attendance, new Date().toISOString());

  return {
    kind: "success",
    message: attendance === "yes"
      ? `Cảm ơn ${name}! Hẹn gặp bạn trong ngày tốt nghiệp nhé.`
      : `Cảm ơn ${name} đã gửi phản hồi và nghĩ đến mình!`,
  };
}
