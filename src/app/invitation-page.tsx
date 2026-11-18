import type { Metadata } from "next";
import Image from "next/image";
import { cache } from "react";
import "@fontsource-variable/ballet";
import "@fontsource/tinos/latin-400.css";
import { Countdown } from "@/components/countdown";
import { GraduationSash } from "@/components/graduation-sash";
import { RsvpForm } from "@/components/rsvp-form";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getInvitation } from "@/lib/db";
import { eventZone, getDays, type Photo } from "@/lib/invitation";

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

function Album({ photos }: { photos: Photo[] }) {
    return (
        <div className="grid grid-cols-2 gap-2.5 @min-[460px]:gap-3">
            {photos.map((photo) => (
                <figure key={photo.id} className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f5f2ed]">
                    <Image className="object-cover" src={photo.src} alt={photo.alt} fill sizes="(max-width: 459px) calc(50vw - 29px), (max-width: 576px) calc(50vw - 46px), 242px" unoptimized />
                </figure>
            ))}
        </div>
    );
}

export function InvitationPage({ guestName }: { guestName?: string }) {
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
            <main className="@container mx-auto w-[min(100%,576px)] bg-card-canvas text-center font-card text-[18px] leading-[1.35] text-card-ink [--u:0.173611111cqw] [&_h2]:font-card [&_h2]:font-normal">
                <header className="card-cover relative flex h-screen flex-col justify-between overflow-hidden text-white ">
                    <div className="card-cover-image absolute inset-0">
                        <Image className="object-cover" src={cover.src} alt={cover.alt} fill sizes="(max-width: 576px) 100vw, 576px" preload unoptimized />
                    </div>
                    <GraduationSash />
                    <div className="relative z-10 mr-8 flex flex-col pt-2">
                        <span className="font-cover-script !text-[30pt] text-[clamp(2.25rem,9cqw,3.25rem)] leading-[1.45]">Class of</span>
                        <span className="ml-22 -mt-8 font-cover-year text-[37pt]">2026</span>
                    </div>
                    <Image
                        className="relative z-10 mx-auto mb-[calc(28*var(--u))] h-auto w-[min(86%,496px)] drop-shadow-[0_1px_6px_#101834]"
                        src="/assets/images/ornaments/graduate-ceremony.webp"
                        alt="Graduate ceremony"
                        width={2232}
                        height={957}
                        loading="eager"
                        unoptimized
                    />
                </header>

                <section id="buoi-le" className="card-event" aria-labelledby="invitation-title">
                    <div className="px-6 pt-12 pb-4 @min-[460px]:px-10" data-reveal>
                        <svg
                            className="mx-auto mb-4 block h-auto w-48 max-w-full text-card-ink"
                            viewBox="0 0 504 112"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M4 54c25 15 49-8 78-14 29-7 49 9 68 14 12 4 22 1 31-5M312 48c25 6 45-17 68-17 31-1 54 23 84 18 15-2 27-9 36-19" />
                            <path d="M151 34 249 5l109 17-92 48c-5 2-9 2-14 0L151 34Z" />
                            <path d="m203 52 4 35c1 5 4 7 10 8 17 3 31 7 43 14 10-10 26-16 47-21 5-1 7-4 7-9l-2-31" />
                            <path d="m255 32-74 14v42m0 0c-5 0-7 9-7 18h14c0-9-2-18-7-18Z" />
                            <circle cx="255" cy="32" r="3" fill="currentColor" stroke="none" />
                        </svg>
                        <p className="font-serif text-3xl italic">Thương mời</p>
                        {guestName && (
                            <p className="mx-auto mt-3 max-w-sm font-serif text-[clamp(3rem,7cqw,2.75rem)] leading-tight font-semibold wrap-anywhere">{guestName}</p>
                        )}
                        <p className="mt-4 text-sm text-muted">Đến tham dự lễ tốt nghiệp của</p>
                        <h1 id="invitation-title" className="mt-2 !font-serif text-[clamp(2.5rem,11cqw,4rem)] leading-[1.5] font-semibold wrap-anywhere">{content.name}</h1>
                        <p className="mt-2 text-sm text-muted">vào ngày</p>
                        <time className="relative mx-auto mt-2 grid max-w-sm grid-cols-3 items-center border-y border-line pt-3 pb-4" dateTime={content.date}>
                            <span className="font-sans text-xs tracking-widest text-muted uppercase">Tháng {month}</span>
                            <strong className="-top-2 relative font-serif text-6xl leading-none font-normal tabular-nums">{String(day).padStart(2, "0")}</strong>
                            <span className="font-sans text-xs tracking-widest text-muted uppercase">Năm {year}</span>
                        </time>
                        <p className="mt-4 text-sm leading-relaxed">
                            <span className="capitalize">{weekday}</span>
                            {" · "}
                            <time dateTime={content.start}>{content.start.replace(":", "h")}</time>
                            {" – "}
                            <time dateTime={content.end}>{content.end.replace(":", "h")}</time>
                        </p>
                        <p className="mt-3 text-sm text-muted">diễn ra ở</p>
                        <address className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed wrap-anywhere not-italic">
                            <a className="group/map isolate flex cursor-pointer flex-col rounded-sm transition-colors hover:bg-card-ink/3 focus-visible:bg-card-ink/3" href={maps} target="_blank" rel="noreferrer">
                                <span className="min-w-0">
                                    <strong className="block font-semibold text-md">{content.venue}</strong>
                                    <span className="block text-muted text-md">{content.university}</span>
                                </span>
                                <span className="min-w-0 text-muted">
                                    <span className="block">{gate?.[1] ?? content.address} {gate && <span className="">{gate[2]}</span>}</span>
                                </span>
                                <span className="sr-only">Mở trong Google Maps (tab mới)</span>
                                <span className="mt-1 inline-flex items-center gap-1 self-end text-[10px] leading-4 text-muted transition-colors group-hover/map:text-card-blue group-focus-visible/map:text-card-blue" aria-hidden="true">
                                    <span>Bấm thử đi</span>
                                    <svg className="size-3 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 12 12 4M5 4h7v7" />
                                    </svg>
                                </span>
                            </a>
                        </address>
                    </div>

                    <div className="relative mx-6 aspect-[2/1] overflow-hidden rounded-sm @min-[460px]:mx-10">
                        <Image className="object-cover" src="/assets/images/bach-khoa.webp" alt="Khuôn viên Trường Đại học Bách khoa TPHCM" fill sizes="(max-width: 459px) calc(100vw - 48px), (max-width: 576px) calc(100vw - 80px), 496px" unoptimized />
                    </div>
                    <div className="grid gap-10 px-6 py-8 @min-[460px]:grid-cols-2 @min-[460px]:gap-8 @min-[460px]:px-10">
                        <section className="@min-[460px]:col-span-2" aria-labelledby="calendar-title" data-reveal>
                            <h2 id="calendar-title" className="text-2xl leading-tight italic">Tháng {month}</h2>
                            <div className="mx-auto mt-5 grid max-w-md grid-cols-7 items-center gap-y-1 text-base tabular-nums @min-[460px]:text-lg">
                                {weekdays.map((label) => <span key={label} className="mb-3 py-1 font-sans text-[11px] font-medium text-card-ink @min-[460px]:text-xs">{label}</span>)}
                                {Array.from({ length: offset }, (_, index) => <span key={"empty-" + index} aria-hidden="true" />)}
                                {Array.from({ length }, (_, index) => {
                                    const date = index + 1;
                                    const current = date === day;
                                    const weekend = (offset + index) % 7 >= 5;
                                    return (
                                        <span key={date} className={`relative mx-auto grid h-9 w-full place-items-center font-semibold ${weekend ? "text-card-ink" : "text-[#4e7f9e]"} forced-colors:aria-[current=date]:outline`} aria-current={current ? "date" : undefined}>
                                            {date}
                                            {current && (
                                                <Image
                                                    className="pointer-events-none absolute top-1/2 left-1/2 h-auto w-[115%] max-w-none [transform:translate(-50%,-50%)]"
                                                    src="/assets/images/ornaments/date-ring.png"
                                                    alt=""
                                                    width={58}
                                                    height={45}
                                                    unoptimized
                                                />
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="@min-[460px]:col-span-2" aria-labelledby="agenda-title" data-reveal>
                            <h2 id="agenda-title" className="text-2xl leading-tight italic">Lịch trình</h2>
                            <ol className="relative mx-auto mt-6 max-w-md list-none p-0 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:bg-card-ink before:[transform:translateX(-50%)]">
                                {schedule.map(({ time, description }, index) => {
                                    const art = agendaArt[index % agendaArt.length];
                                    return (
                                        <li key={index} className="group/agenda grid min-h-28 grid-cols-2 items-start gap-x-7 py-1.5 text-left @min-[460px]:min-h-32 @min-[460px]:gap-x-8 even:text-right">
                                            <Image
                                                className="mt-1 h-auto w-[min(100%,78px)] justify-self-end group-even/agenda:col-start-2 group-even/agenda:justify-self-start"
                                                src={"/assets/images/ornaments/" + art.file + ".png"}
                                                alt=""
                                                width={art.width}
                                                height={art.height}
                                                unoptimized
                                                loading="eager"
                                            />
                                            <div className="min-w-0 group-even/agenda:col-start-1 group-even/agenda:row-start-1">
                                                <time className="block text-[clamp(1.25rem,5cqw,1.6rem)] leading-tight tabular-nums">{time}</time>
                                                <p className="mt-1 text-[clamp(.875rem,3.5cqw,1.125rem)] leading-relaxed wrap-anywhere">{description}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    </div>
                </section>

                <section className="" aria-labelledby="countdown-title" data-reveal>
                    <h2 id="countdown-title" className="text-2xl">Đếm ngược nè</h2>
                    <Countdown start={start} end={end} />
                </section>

                <section className="mx-auto max-w-xl px-6 py-12 @min-[460px]:px-10" aria-labelledby="letter-title" data-reveal>
                    <h2 id="letter-title" className="text-2xl leading-tight">Lời yêu thương từ mình</h2>
                    <div className="mt-6 space-y-4 text-left text-[15px] leading-[1.85] text-muted @min-[460px]:text-base">
                        {content.letter.split(/\n\s*\n/).map((paragraph, index) => (
                            <p key={index} className="wrap-anywhere whitespace-pre-line">{paragraph}</p>
                        ))}
                    </div>
                    <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed italic">{content.dedication}</p>
                </section>

                <section className="bg-[#f5f2ed] px-6 py-6 @min-[460px]:px-10" id="rsvp" aria-labelledby="rsvp-title">
                    <div data-reveal>
                        <h2 id="rsvp-title" className="text-2xl leading-tight">Xác nhận tham dự</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">Bạn xác nhận tham dự để mình chuẩn bị đón tiếp một cách chu đáo nhất nhé!</p>
                    </div>
                    <RsvpForm key={guestName ?? ""} guestName={guestName} />
                </section>

                <section className="px-6 py-6 @min-[460px]:px-10" id="album" aria-labelledby="album-title" data-reveal>
                    <h2 id="album-title" className="mb-6 text-2xl leading-tight">Xem hình của tui nè</h2>
                    {album.length ? <Album photos={album} /> : <p className="font-sans text-sm text-muted">Album sẽ được cập nhật thêm.</p>}
                </section>
                <footer className="bg-card-ink px-6 py-2 font-serif text-3xl leading-tight wrap-anywhere text-white italic">
                    <p>{content.farewell}</p>
                </footer>
                <p className="text-[9pt] py-1 font-sans! leading-0 mt-2">For Nguyen, from Hoai. Powered by machhoai</p>
            </main>
        </ScrollReveal>
    );
}
