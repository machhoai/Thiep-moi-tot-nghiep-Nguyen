import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, GraduationCap, Images, LogOut, MessageSquare, PenLine } from "lucide-react";
import { isAdmin, isConfigured } from "@/lib/auth";
import { getInvitation, getReplies } from "@/lib/db";
import { eventZone, fieldLimits, type Invitation } from "@/lib/invitation";
import { addPhoto, login, logout, removePhoto, replaceCover, saveContent } from "./actions";

export const metadata: Metadata = {
  title: "Quản trị thiệp mời",
  robots: { index: false, follow: false },
};

const notices: Record<string, string> = {
  "login-error": "Mật khẩu chưa đúng.",
  "content-error": "Vui lòng điền đủ nội dung và kiểm tra độ dài từng mục.",
  "date-error": "Kiểm tra ngày tổ chức và đảm bảo giờ kết thúc sau giờ bắt đầu.",
  "schedule-error": "Mỗi dòng lịch trình cần theo định dạng HH:MM | Nội dung.",
  "content-saved": "Đã lưu nội dung thiệp.",
  "photo-error": "Hãy chọn ảnh JPG, PNG hoặc WEBP tối đa 8 MB và nhập mô tả ảnh.",
  "cover-saved": "Đã thay ảnh bìa.",
  "photo-added": "Đã thêm ảnh vào album.",
  "photo-removed": "Đã xóa ảnh khỏi album.",
};

const fields: { key: keyof Invitation; label: string; type?: string; rows?: number }[] = [
  { key: "name", label: "Tên tân cử nhân" },
  { key: "date", label: "Ngày tốt nghiệp", type: "date" },
  { key: "start", label: "Giờ bắt đầu", type: "time" },
  { key: "end", label: "Giờ kết thúc", type: "time" },
  { key: "university", label: "Tên trường" },
  { key: "venue", label: "Địa điểm" },
  { key: "address", label: "Địa chỉ" },
  { key: "schedule", label: "Lịch trình", rows: 4 },
  { key: "letter", label: "Thư gửi khách mời", rows: 9 },
  { key: "dedication", label: "Lời nhắn dưới thư" },
  { key: "farewell", label: "Lời chào cuối thiệp" },
];

const panel = "rounded-[5px] border border-line bg-paper p-[clamp(18px,4.5vw,34px)]";
const width = "mx-auto w-[min(1080px,calc(100%_-_44px))]";
const labelStyle = "grid gap-[5px] text-[14px] font-[650]";
const field = "min-h-[44px] w-full rounded-[3px] border border-[#c7c5c1] bg-[#fffefa] px-[11px] py-[9px] text-[16px] font-normal text-ink placeholder:text-[#696d7d]";
const button = "inline-flex items-center justify-center gap-[12px] rounded-[3px] border px-[20px] py-[11px] text-[14px] leading-[1.4] font-[650] [transition:background_.2s,color_.2s] disabled:cursor-wait disabled:opacity-65";
const primaryButton = `${button} min-h-[48px] border-navy bg-navy text-white hover:bg-blue`;
const secondaryButton = `${button} border-line bg-transparent text-navy hover:bg-admin-neutral`;
const wordmark = "inline-flex items-center gap-[9px] font-serif text-[26px] leading-[1.15] font-semibold [&>svg]:flex-none [&>svg]:text-gold";
const navLink = "inline-flex min-h-[44px] items-center gap-[6px] rounded-[3px] border border-line px-[10px] py-[5px] text-[14px] hover:bg-admin-neutral";

function UploadForm({ action, label }: { action: (formData: FormData) => Promise<void>; label: string }) {
  return (
    <form action={action} className="grid max-w-[460px] gap-[14px]">
      <label className={labelStyle}>Chọn ảnh (tối đa 8 MB)<input className={field} type="file" name="photo" accept="image/jpeg,image/png,image/webp" required /></label>
      <label className={labelStyle}>Mô tả ảnh<input className={field} name="alt" required maxLength={160} placeholder="Ví dụ: Mỹ Nguyên trong lễ phục tốt nghiệp" /></label>
      <button type="submit" className={`${primaryButton} justify-self-start`}>{label}</button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const status = (await searchParams).status;
  const message = typeof status === "string" && Object.hasOwn(notices, status) ? notices[status] : "";
  const isError = typeof status === "string" && status.endsWith("-error");
  const notice = message && <p role={isError ? "alert" : "status"} className={`mb-[12px] bg-admin-neutral px-[12px] py-[8px] ${isError ? "text-[14px] text-form-error" : ""}`}>{message}</p>;

  if (!(await isAdmin())) {
    return (
      <main className="grid min-h-svh place-items-center p-[20px]">
        <div className={`${panel} w-[min(100%,490px)]`}>
          <Link href="/" className={wordmark}><GraduationCap size={22} aria-hidden="true" /> Thiệp tốt nghiệp</Link>
          <h1 className="mt-[16px] mb-[24px] text-[clamp(42px,7vw,62px)]">Đăng nhập quản trị</h1>
          {isConfigured()
            ? <form action={login} className="grid gap-[14px]">
                <label className={labelStyle}>Mật khẩu<input className={field} type="password" name="password" autoComplete="current-password" required maxLength={256} /></label>
                {notice}
                <button className={`${primaryButton} justify-self-start`} type="submit">Đăng nhập <ArrowUpRight size={17} aria-hidden="true" /></button>
              </form>
            : <p>Hãy cấu hình mật khẩu và khóa phiên đăng nhập theo hướng dẫn trong README.</p>}
        </div>
      </main>
    );
  }

  const { content, cover, album } = getInvitation();
  const replies = getReplies();
  const yes = replies.filter((reply) => reply.attendance === "yes").length;
  const timeFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: eventZone });

  return (
    <div>
      <header className="border-b border-line">
        <div className={`${width} flex min-h-[72px] items-center justify-between gap-[13px]`}>
          <span className={wordmark}><GraduationCap size={22} aria-hidden="true" /> {content.name}</span>
          <div className="flex items-center gap-[13px] [@media(max-width:560px)]:gap-[8px] [@media(max-width:560px)]:[&_svg]:hidden">
            <Link href="/" className="inline-flex min-h-[44px] w-fit items-center gap-[8px] text-[14px] font-[650] hover:underline hover:underline-offset-[4px]">Xem thiệp <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <form action={logout}><button className={`${secondaryButton} min-h-[48px] [@media(max-width:560px)]:px-[8px]`} type="submit"><LogOut size={15} aria-hidden="true" /> Đăng xuất</button></form>
          </div>
        </div>
      </header>
      <main className={`${width} pt-[32px] pb-[60px]`}>
        <h1 className="text-[clamp(42px,7vw,62px)]">Quản trị thiệp mời</h1>
        <nav className="mt-[15px] flex flex-wrap items-center gap-[13px]" aria-label="Điều hướng quản trị">
          <a className={navLink} href="#phan-hoi"><MessageSquare size={17} aria-hidden="true" /> Phản hồi</a>
          <a className={navLink} href="#noi-dung"><PenLine size={17} aria-hidden="true" /> Nội dung</a>
          <a className={navLink} href="#hinh-anh"><Images size={17} aria-hidden="true" /> Hình ảnh</a>
        </nav>
        <section id="phan-hoi" className={`${panel} mt-[21px]`}>
          <h2 className="mb-[22px] text-[clamp(33px,5vw,44px)]">Phản hồi khách mời</h2>
          <div className="mb-[19px] grid grid-cols-[repeat(3,1fr)] gap-[8px] [&>div]:grid [&>div]:bg-[#eeece5] [&>div]:p-[9px] [&_strong]:font-serif [&_strong]:text-[34px] [&_strong]:leading-[1.1] [&_strong]:font-semibold [&_span]:text-[12px] [&_span]:text-muted">
            <div><strong>{replies.length}</strong><span>Tổng phản hồi</span></div>
            <div><strong>{yes}</strong><span>Tham dự</span></div>
            <div><strong>{replies.length - yes}</strong><span>Không tham dự</span></div>
          </div>
          {replies.length
            ? <div className="overflow-auto" tabIndex={0} role="region" aria-label="Danh sách phản hồi">
                <table className="w-full min-w-[600px] border-collapse text-left text-[14px] [&_:is(th,td)]:border-b [&_:is(th,td)]:border-line [&_:is(th,td)]:p-[10px] [&_:is(th,td)]:align-top [&_td]:wrap-anywhere [&_td]:whitespace-pre-line [&_td:last-child]:whitespace-nowrap">
                  <thead><tr><th scope="col">Khách mời</th><th scope="col">Tham dự</th><th scope="col">Lời chúc</th><th scope="col">Đã gửi</th></tr></thead>
                  <tbody>{replies.map((reply) => <tr key={reply.id}>
                    <td>{reply.name}</td><td>{reply.attendance === "yes" ? "Có" : "Không"}</td><td>{reply.message || "—"}</td>
                    <td><time dateTime={reply.createdAt}>{timeFormat.format(new Date(reply.createdAt))}</time></td>
                  </tr>)}</tbody>
                </table>
              </div>
            : <p className="text-muted">Chưa có phản hồi nào.</p>}
        </section>

        <section id="noi-dung" className={`${panel} mt-[21px]`}>
          <h2 className="mb-[22px] text-[clamp(33px,5vw,44px)]">Nội dung thiệp</h2>
          {typeof status === "string" && /^(content|date|schedule)-/.test(status) && notice}
          <form action={saveContent} className="grid grid-cols-[1fr_1fr] gap-[15px] [@media(max-width:560px)]:grid-cols-[1fr]" key={JSON.stringify(content)}>
            {fields.map(({ key, label, type, rows }) => (
              <label key={key} className={`${labelStyle} ${rows || key === "address" ? "col-span-full" : ""}`}>
                {label}
                {rows
                  ? <textarea className={`${field} resize-y`} name={key} defaultValue={content[key]} maxLength={fieldLimits[key]} rows={rows} required aria-describedby={key === "schedule" ? "schedule-help" : undefined} />
                  : <input className={field} name={key} type={type ?? "text"} defaultValue={content[key]} maxLength={fieldLimits[key]} required />}
                {key === "schedule" && <small id="schedule-help" className="text-muted">Mỗi hoạt động một dòng, theo mẫu 14:30 | Chụp ảnh kỷ niệm.</small>}
              </label>
            ))}
            <button className={`${primaryButton} justify-self-start`} type="submit">Lưu nội dung</button>
          </form>
        </section>

        <section id="hinh-anh" className={`${panel} mt-[21px]`}>
          <h2 className="mb-[22px] text-[clamp(33px,5vw,44px)]">Hình ảnh</h2>
          {typeof status === "string" && /^(photo|cover)-/.test(status) && notice}
          <div className="grid grid-cols-[minmax(95px,150px)_minmax(0,1fr)] gap-[15px] [@media(max-width:560px)]:grid-cols-[1fr]">
            <div className="relative aspect-[.94] bg-[#ede9df] [@media(max-width:560px)]:max-w-[140px]">
              <Image className="object-cover" src={cover.src} alt={cover.alt} fill unoptimized sizes="150px" />
            </div>
            <div><h3 className="mb-[13px] text-[28px]">Ảnh bìa</h3><UploadForm action={replaceCover} label="Thay ảnh bìa" /></div>
          </div>
          <div className="mt-[25px] border-t border-line pt-[24px]">
            <h3 className="mb-[13px] text-[28px]">Album ảnh · {album.length} ảnh</h3>
            <UploadForm action={addPhoto} label="Thêm ảnh vào album" />
            <ul className="mx-0 mt-[22px] mb-0 grid list-none grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-[13px] p-0">{album.map((photo) => (
              <li key={photo.id} className="max-w-[220px]">
                <div className="relative aspect-[.94] bg-[#ede9df]"><Image className="object-cover" src={photo.src} alt={photo.alt} fill unoptimized sizes="180px" /></div>
                <form action={removePhoto}>
                  <input type="hidden" name="id" value={photo.id} />
                  <button className={`${secondaryButton} mt-[4px] min-h-[44px]`} type="submit" aria-label={`Xóa ảnh ${photo.alt}`}>Xóa ảnh</button>
                </form>
              </li>
            ))}</ul>
          </div>
        </section>
      </main>
    </div>
  );
}
