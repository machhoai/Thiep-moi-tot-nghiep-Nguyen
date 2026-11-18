"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitReply, type ReplyResult } from "@/app/actions";

const initial: ReplyResult = { kind: "idle", message: "" };

export function RsvpForm() {
  const [state, action, pending] = useActionState(submitReply, initial);

  if (state.kind === "success") {
    return <div className="confirmation" role="status"><CheckCircle2 size={25} /><p>{state.message}</p></div>;
  }

  return (
    <form action={action} className="rsvp-form">
      <input name="name" aria-label="Tên của bạn" placeholder="[TÊN CỦA BẠN]" autoComplete="name" required maxLength={100} />
      <textarea name="message" aria-label="Lời chúc đến tân cử nhân (không bắt buộc)" placeholder="[GỬI LỜI CHÚC ĐẾN TÂN CỬ NHÂN]" rows={4} maxLength={1000} />
      <div className="card-select">
        <select name="attendance" aria-label="Bạn sẽ đến chứ?" defaultValue="" required>
          <option value="" disabled>[BẠN SẼ ĐẾN CHỨ?]</option>
          <option value="yes">Mình sẽ tham dự</option>
          <option value="no">Mình không thể tham dự</option>
        </select>
      </div>
      {state.kind === "error" && <p role="alert" className="form-error">{state.message}</p>}
      <button type="submit" className="button" disabled={pending}>{pending ? "ĐANG GỬI…" : "XÁC NHẬN"}</button>
    </form>
  );
}

