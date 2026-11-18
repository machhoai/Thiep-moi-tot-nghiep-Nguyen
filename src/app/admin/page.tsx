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

function UploadForm({ action, label }: { action: (formData: FormData) => Promise<void>; label: string }) {
  return (
    <form action={action} className="upload-form">
      <label>Chọn ảnh (tối đa 8 MB)<input type="file" name="photo" accept="image/jpeg,image/png,image/webp" required /></label>
      <label>Mô tả ảnh<input name="alt" required maxLength={160} placeholder="Ví dụ: Mỹ Nguyên trong lễ phục tốt nghiệp" /></label>
      <button type="submit" className="button">{label}</button>
    </form>
  );
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const status = (await searchParams).status;
  const message = typeof status === "string" && Object.hasOwn(notices, status) ? notices[status] : "";
  const isError = typeof status === "string" && status.endsWith("-error");
  const notice = message && <p role={isError ? "alert" : "status"} className={`admin-notice ${isError ? "form-error" : ""}`}>{message}</p>;

  if (!(await isAdmin())) {
    return (
      <main className="admin-login">
        <div className="admin-panel">
          <Link href="/" className="wordmark"><GraduationCap size={22} aria-hidden="true" /> Thiệp tốt nghiệp</Link>
          <h1>Đăng nhập quản trị</h1>
          {isConfigured()
            ? <form action={login} className="upload-form">
                <label>Mật khẩu<input type="password" name="password" autoComplete="current-password" required maxLength={256} /></label>
                {notice}
                <button className="button" type="submit">Đăng nhập <ArrowUpRight size={17} aria-hidden="true" /></button>
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
    <div className="admin-shell">
      <header className="admin-header">
        <div className="wrap">
          <span className="wordmark"><GraduationCap size={22} aria-hidden="true" /> {content.name}</span>
          <div className="admin-header-actions">
            <Link href="/" className="text-link">Xem thiệp <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <form action={logout}><button className="button secondary" type="submit"><LogOut size={15} aria-hidden="true" /> Đăng xuất</button></form>
          </div>
        </div>
      </header>
      <main className="wrap admin-main">
        <h1>Quản trị thiệp mời</h1>
        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          <a href="#phan-hoi"><MessageSquare size={17} aria-hidden="true" /> Phản hồi</a>
          <a href="#noi-dung"><PenLine size={17} aria-hidden="true" /> Nội dung</a>
          <a href="#hinh-anh"><Images size={17} aria-hidden="true" /> Hình ảnh</a>
        </nav>
        <section id="phan-hoi" className="admin-panel">
          <h2>Phản hồi khách mời</h2>
          <div className="admin-stats">
            <div><strong>{replies.length}</strong><span>Tổng phản hồi</span></div>
            <div><strong>{yes}</strong><span>Tham dự</span></div>
            <div><strong>{replies.length - yes}</strong><span>Không tham dự</span></div>
          </div>
          {replies.length
            ? <div className="reply-table" tabIndex={0} role="region" aria-label="Danh sách phản hồi">
                <table>
                  <thead><tr><th scope="col">Khách mời</th><th scope="col">Tham dự</th><th scope="col">Lời chúc</th><th scope="col">Đã gửi</th></tr></thead>
                  <tbody>{replies.map((reply) => <tr key={reply.id}>
                    <td>{reply.name}</td><td>{reply.attendance === "yes" ? "Có" : "Không"}</td><td>{reply.message || "—"}</td>
                    <td><time dateTime={reply.createdAt}>{timeFormat.format(new Date(reply.createdAt))}</time></td>
                  </tr>)}</tbody>
                </table>
              </div>
            : <p className="muted">Chưa có phản hồi nào.</p>}
        </section>

        <section id="noi-dung" className="admin-panel">
          <h2>Nội dung thiệp</h2>
          {typeof status === "string" && /^(content|date|schedule)-/.test(status) && notice}
          <form action={saveContent} className="admin-fields" key={JSON.stringify(content)}>
            {fields.map(({ key, label, type, rows }) => (
              <label key={key} className={rows || key === "address" ? "full-field" : undefined}>
                {label}
                {rows
                  ? <textarea name={key} defaultValue={content[key]} maxLength={fieldLimits[key]} rows={rows} required aria-describedby={key === "schedule" ? "schedule-help" : undefined} />
                  : <input name={key} type={type ?? "text"} defaultValue={content[key]} maxLength={fieldLimits[key]} required />}
                {key === "schedule" && <small id="schedule-help">Mỗi hoạt động một dòng, theo mẫu 14:30 | Chụp ảnh kỷ niệm.</small>}
              </label>
            ))}
            <button className="button" type="submit">Lưu nội dung</button>
          </form>
        </section>

        <section id="hinh-anh" className="admin-panel">
          <h2>Hình ảnh</h2>
          {typeof status === "string" && /^(photo|cover)-/.test(status) && notice}
          <div className="admin-cover">
            <div className="admin-cover-image"><Image src={cover.src} alt={cover.alt} fill unoptimized sizes="150px" /></div>
            <div><h3>Ảnh bìa</h3><UploadForm action={replaceCover} label="Thay ảnh bìa" /></div>
          </div>
          <div className="admin-album">
            <h3>Album ảnh · {album.length} ảnh</h3>
            <UploadForm action={addPhoto} label="Thêm ảnh vào album" />
            <ul>{album.map((photo) => (
              <li key={photo.id}>
                <div><Image src={photo.src} alt={photo.alt} fill unoptimized sizes="180px" /></div>
                <form action={removePhoto}>
                  <input type="hidden" name="id" value={photo.id} />
                  <button className="button secondary" type="submit" aria-label={`Xóa ảnh ${photo.alt}`}>Xóa ảnh</button>
                </form>
              </li>
            ))}</ul>
          </div>
        </section>
      </main>
    </div>
  );
}
