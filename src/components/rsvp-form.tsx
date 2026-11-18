"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitReply, type ReplyResult } from "@/app/actions";

const initial: ReplyResult = { kind: "idle", message: "" };
const field = "min-h-12 w-full rounded-sm border border-[#a9abb7] bg-card-canvas px-3 py-2.5  text-base leading-normal font-normal text-card-ink";
const label = "grid gap-1.5  text-sm font-medium";

export function RsvpForm({ guestName }: { guestName?: string }) {
    const [state, action, pending] = useActionState(submitReply, initial);

    if (state.kind === "success") {
        return (
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3 rounded-sm border border-line bg-card-canvas p-4 text-left  text-sm leading-relaxed" role="status">
                <CheckCircle2 className="flex-none" size={25} />
                <p>{state.message}</p>
            </div>
        );
    }

    return (
        <form action={action} className="mx-auto mt-6 grid max-w-sm gap-4 text-left">
            {guestName ? (
                <div className="grid gap-1.5">
                    <p className="text-sm text-muted">Tên của bạn</p>
                    <p className="text-base font-medium wrap-anywhere text-card-ink">{guestName}</p>
                    <input type="hidden" name="name" value={guestName} />
                </div>
            ) : (
                <label className={label}>
                    Tên của bạn
                    <input className={field} name="name" autoComplete="name" required maxLength={100} />
                </label>
            )}
            <label className={label}>
                Bạn sẽ đến chứ?
                <select className={field} name="attendance" defaultValue="" required>
                    <option value="" disabled>Chọn phản hồi</option>
                    <option value="yes">Mình sẽ tham dự</option>
                    <option value="no">Mình không thể tham dự</option>
                </select>
            </label>
            <label className={label}>
                <span>Lời chúc <span className="font-normal text-muted">(không bắt buộc)</span></span>
                <textarea className={`${field} resize-y`} name="message" rows={3} maxLength={1000} placeholder="Lời chúc của bạn mình hứa sẽ đọc hết dù bạn có viết dài như thế nào đi nữa."/>
            </label>
            {state.kind === "error" && <p role="alert" className="text-[14px] text-form-error">{state.message}</p>}
            <button type="submit" className="min-h-12 rounded-sm border border-transparent bg-card-ink px-5 py-3  text-sm font-medium text-white transition-colors hover:bg-card-blue disabled:cursor-wait disabled:opacity-65" disabled={pending}>{pending ? "Đang gửi cho Mỹ Nguyên…" : "Gửi đến Mỹ Nguyên"}</button>
        </form>
    );
}

