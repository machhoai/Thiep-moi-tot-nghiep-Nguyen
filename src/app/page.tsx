import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import { Countdown } from "@/components/countdown";
import { RsvpForm } from "@/components/rsvp-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getInvitation } from "@/lib/db";
import { eventZone, getDays, type Photo } from "@/lib/invitation";
import "./invitation.css";

export const dynamic = "force-dynamic";

const loadInvitation = cache(getInvitation);
const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const agendaArt = [
  { file: "cap", width: 74, height: 55 },
  { file: "diploma", width: 83, height: 52 },
  { file: "camera", width: 75, height: 65 },
];

export function generateMetadata(): Metadata {
  const { content } = loadInvitation();
  return {
    title: "Lễ tốt nghiệp của " + content.name,
    description: "Thư mời dự lễ tốt nghiệp của " + content.name + " và xác nhận tham dự.",
  };
}

function Ornament() {
  return <div className="card-ornament" aria-hidden="true"><span /><i /><span /></div>;
}

function Album({ photos }: { photos: Photo[] }) {
  const mosaic = photos.length >= 8;
  return (
    <div className={mosaic ? "card-album card-album-mosaic" : "card-album"}>
      {photos.map((photo, position) => (
        <figure key={photo.id} data-album-slot={mosaic && position < 8 ? position + 1 : undefined}>
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 576px) 34vw, 193px" unoptimized />
        </figure>
      ))}
    </div>
  );
}

export default function Home() {
  const { content, cover, album } = loadInvitation();
  const { year, month, day, length, offset } = getDays(content.date);
  const start = Date.parse(content.date + "T" + content.start + ":00+07:00");
  const end = Date.parse(content.date + "T" + content.end + ":00+07:00");
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long", timeZone: eventZone }).format(start).toLocaleLowerCase("vi-VN");
  const schedule = content.schedule.split("\n").filter((line) => line.trim()).map((line) => {
    const [time, ...parts] = line.split("|");
    return { time: time.trim(), description: parts.join("|").trim() };
  });
  const maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(
    [content.venue, content.university, content.address].join(", "),
  );
  const gate = content.address.match(/^(.*?)\s+(\(cổng [^)]+\))$/i);


  return (
    <ScrollReveal>
      <main className="invitation">
        <header className="card-cover">
          <div className="card-cover-top">Graduation</div>
          <div className="card-cover-image">
            <Image src={cover.src} alt={cover.alt} fill sizes="(max-width: 576px) 100vw, 576px" preload unoptimized />
          </div>
          <div className="card-cover-bottom">
            <span>Graduation</span>
            <span>Ceremony</span>
          </div>
        </header>

        <section id="buoi-le" className="card-event" aria-labelledby="invitation-title">
          <div className="card-event-copy" data-reveal>
            <p className="card-invite-label">Thương mời</p>
            <div className="card-invite-line" aria-hidden="true" />
            <p className="card-invite-intro">Đến tham dự lễ tốt nghiệp của</p>
            <h1 id="invitation-title">{content.name}</h1>
            <p className="card-event-time">
              VÀO <time dateTime={content.start}>{content.start.replace(":", "h")}</time>
              {" - "}
              <time dateTime={content.end}>{content.end.replace(":", "h")}</time> ({weekday})
            </p>
            <time className="card-date" dateTime={content.date}>
              <span>{String(month).padStart(2, "0")}</span>
              <strong>{String(day).padStart(2, "0")}</strong>
              <span>{year}</span>
            </time>
            <div className="card-venue">
              <p>Tổ chức tại</p>
              <div><strong>{content.venue}</strong><strong>{content.university}</strong></div>
              <a href={maps} target="_blank" rel="noreferrer" aria-label={"Chỉ đường đến " + content.address}>
                {gate ? <>{gate[1]}<br />{gate[2]}</> : content.address}
              </a>
            </div>
          </div>

          <div className="card-campus">
            <Image src="/assets/images/bach-khoa.webp" alt="Khuôn viên Trường Đại học Bách khoa TPHCM" fill sizes="(max-width: 576px) 100vw, 576px" unoptimized />
          </div>
          <Ornament />

          <section className="card-calendar" aria-labelledby="calendar-title" data-reveal>
            <h2 id="calendar-title" className="card-italic-title">Tháng {month}</h2>
            <div className="card-calendar-grid">
              {weekdays.map((label) => <span key={label} className="card-weekday">{label}</span>)}
              {Array.from({ length: offset }, (_, index) => <span key={"empty-" + index} aria-hidden="true" />)}
              {Array.from({ length }, (_, index) => {
                const date = index + 1;
                const weekend = (offset + index) % 7 >= 5;
                return <span key={date} className={weekend ? "card-weekend" : "card-weekday-date"} aria-current={date === day ? "date" : undefined}>{date}</span>;
              })}
            </div>
          </section>

          <section className="card-agenda" aria-labelledby="agenda-title" data-reveal>
            <h2 id="agenda-title" className="card-italic-title">Lịch trình</h2>
            <ol>{schedule.map(({ time, description }, index) => {
              const art = agendaArt[index % agendaArt.length];
              return (
                <li key={index}>
                  <Image className="card-agenda-icon" src={"/assets/images/ornaments/" + art.file + ".png"} alt="" width={art.width} height={art.height} unoptimized />
                  <div><time dateTime={time}>{time}</time><p>{description}</p></div>
                </li>
              );
            })}</ol>
          </section>
        </section>

        <section className="card-countdown" aria-labelledby="countdown-title" data-reveal>
          <h2 id="countdown-title">Đếm ngược nè</h2>
          <Countdown start={start} end={end} />
        </section>

        <section className="card-letter" aria-labelledby="letter-title" data-reveal>
          <h2 id="letter-title">Lời yêu thương từ mình</h2>
          <div>{content.letter.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          <p className="card-dedication">{content.dedication}</p>
        </section>

        <section className="card-rsvp" id="rsvp" aria-labelledby="rsvp-title">
          <div data-reveal>
            <h2 id="rsvp-title">Xác nhận tham dự</h2>
            <p>Xin vui lòng xác nhận sự có mặt để mình chuẩn bị<br className="card-rsvp-break" /> đón tiếp một cách chu đáo nhất nhé!</p>
          </div>
          <RsvpForm />
        </section>

        <Ornament />
        <section className="card-album-section" id="album" aria-label="Album kỷ niệm" data-reveal>
          {album.length ? <Album photos={album} /> : <p className="card-album-empty">Album sẽ được cập nhật thêm.</p>}
        </section>
        <footer className="card-footer"><p>{content.farewell}</p></footer>
      </main>
    </ScrollReveal>
  );
}

