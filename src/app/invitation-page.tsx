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
import { eventZone, getDays, isFrontendOnly, type Photo } from "@/lib/invitation";

const loadInvitation = cache(getInvitation);
const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const agendaArt = [
    { file: "cap", width: 74, height: 55 },
    { file: "diploma", width: 83, height: 52 },
    { file: "camera", width: 75, height: 65 },
];
const shareTitle = "Thư mời tốt nghiệp của Mỹ Nguyên";
const shareDescription = "Mỹ Nguyên mời bạn đến chung vui trong ngày lễ tốt nghiệp. Mở thiệp để xem thông tin và xác nhận tham dự.";
const shareImage = {
    url: "/assets/images/thiep-tot-nghiep-preview.jpg",
    type: "image/jpeg",
    width: 1200,
    height: 630,
    alt: "Thư mời tốt nghiệp Mỹ Nguyên, khóa 2026",
};

export function generateMetadata(): Metadata {
    const { content } = loadInvitation();
    const vercelHost = process.env.VERCEL_ENV === "preview"
        ? process.env.VERCEL_URL
        : process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
    const siteUrl = process.env.SITE_URL
        ?? (vercelHost ? `https://${vercelHost}` : `http://localhost:${process.env.PORT ?? "3000"}`);

    return {
        metadataBase: new URL(siteUrl),
        title: "Lễ tốt nghiệp của " + content.name,
        description: "Thư mời dự lễ tốt nghiệp của " + content.name + " và xác nhận tham dự.",
        openGraph: {
            type: "website",
            locale: "vi_VN",
            url: "./",
            title: shareTitle,
            description: shareDescription,
            images: [shareImage],
        },
        twitter: {
            card: "summary_large_image",
            title: shareTitle,
            description: shareDescription,
            images: [shareImage],
        },
    };
}

function Album({ photos }: { photos: Photo[] }) {
    return (
        <div className="grid grid-cols-2 gap-2.5 @min-[460px]:gap-3">
            {photos.map((photo, index) => (
                <figure key={photo.id} className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f5f2ed]" data-photo-reveal={index % 2 === 0 ? "left" : "right"}>
                    <Image className="object-cover" src={photo.src} alt={photo.alt} fill sizes="(max-width: 459px) calc(50vw - 29px), (max-width: 576px) calc(50vw - 46px), 242px" unoptimized />
                </figure>
            ))}
        </div>
    );
}

export function InvitationPage({ guestName }: { guestName?: string }) {
    const { content, cover, album } = loadInvitation();
    const frontendOnly = isFrontendOnly();
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
                    <div className="px-6 pt-12 pb-4 @min-[460px]:px-10">
                        <svg
                            className="mx-auto mb-4 block h-auto w-48 max-w-full text-card-ink"
                            viewBox="0 0 504 112"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.8}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            data-cap-drawing
                        >
                            <path pathLength={1} d="M4 54c25 15 49-8 78-14 29-7 49 9 68 14 12 4 22 1 31-5M312 48c25 6 45-17 68-17 31-1 54 23 84 18 15-2 27-9 36-19" />
                            <path pathLength={1} d="M151 34 249 5l109 17-92 48c-5 2-9 2-14 0L151 34Z" />
                            <path pathLength={1} d="m203 52 4 35c1 5 4 7 10 8 17 3 31 7 43 14 10-10 26-16 47-21 5-1 7-4 7-9l-2-31" />
                            <path pathLength={1} d="m255 32-74 14v42m0 0c-5 0-7 9-7 18h14c0-9-2-18-7-18Z" />
                            <circle cx="255" cy="32" r="3" fill="currentColor" stroke="none" />
                        </svg>
                        <p className="font-serif text-3xl italic" data-enter>Thương mời</p>
                        {guestName && (
                            <p className="mx-auto mt-3 max-w-sm font-serif text-[clamp(3rem,7cqw,2.75rem)] leading-tight font-semibold wrap-anywhere" data-enter>{guestName}</p>
                        )}
                        <p className="mt-4 text-sm text-muted" data-enter>Đến tham dự lễ tốt nghiệp của</p>
                        <h1 id="invitation-title" className="mt-2 !font-serif text-[clamp(2.5rem,11cqw,4rem)] leading-[1.5] font-semibold wrap-anywhere" data-invite-name>{content.name}</h1>
                        <p className="mt-2 text-sm text-muted" data-enter>vào ngày</p>
                        <time className="relative mx-auto mt-2 grid max-w-sm grid-cols-3 items-center border-y border-line pt-3 pb-4" dateTime={content.date} data-entrance-group>
                            <span className="font-sans text-xs tracking-widest text-muted uppercase" data-step>Tháng {month}</span>
                            <strong className="-top-2 relative font-serif text-6xl leading-none font-normal tabular-nums" data-step>{String(day).padStart(2, "0")}</strong>
                            <span className="font-sans text-xs tracking-widest text-muted uppercase" data-step>Năm {year}</span>
                        </time>
                        <p className="mt-4 text-sm leading-relaxed" data-enter>
                            <span className="capitalize">{weekday}</span>
                            {" · "}
                            <time dateTime={content.start}>{content.start.replace(":", "h")}</time>
                            {" – "}
                            <time dateTime={content.end}>{content.end.replace(":", "h")}</time>
                        </p>
                        <p className="mt-3 text-sm text-muted" data-enter>diễn ra ở</p>
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

                    <div className="relative mx-6 aspect-[2/1] overflow-hidden rounded-sm @min-[460px]:mx-10" data-photo-reveal="left">
                        <Image className="object-cover" src="/assets/images/bach-khoa.webp" alt="Khuôn viên Trường Đại học Bách khoa TPHCM" fill sizes="(max-width: 459px) calc(100vw - 48px), (max-width: 576px) calc(100vw - 80px), 496px" unoptimized />
                    </div>
                    <div className="grid gap-10 px-6 py-8 @min-[460px]:grid-cols-2 @min-[460px]:gap-8 @min-[460px]:px-10">
                        <section className="@min-[460px]:col-span-2" aria-labelledby="calendar-title">
                            <h2 id="calendar-title" className="text-2xl leading-tight italic" data-enter>Tháng {month}</h2>
                            <div className="mx-auto mt-5 grid max-w-md grid-cols-7 items-center gap-y-1 text-base tabular-nums @min-[460px]:text-lg" data-calendar>
                                {weekdays.map((label) => <span key={label} className="mb-3 py-1 font-sans text-[11px] font-medium text-card-ink @min-[460px]:text-xs" data-calendar-cell>{label}</span>)}
                                {Array.from({ length: offset }, (_, index) => <span key={"empty-" + index} aria-hidden="true" />)}
                                {Array.from({ length }, (_, index) => {
                                    const date = index + 1;
                                    const current = date === day;
                                    const weekend = (offset + index) % 7 >= 5;
                                    return (
                                        <span key={date} className={`relative mx-auto grid h-9 w-full place-items-center font-semibold ${weekend ? "text-card-ink" : "text-[#4e7f9e]"} forced-colors:aria-[current=date]:outline`} aria-current={current ? "date" : undefined} data-calendar-cell>
                                            {date}
                                            {current && (
                                                <Image
                                                    className="pointer-events-none absolute top-1/2 left-1/2 h-auto w-[115%] max-w-none [transform:translate(-50%,-50%)]"
                                                    src="/assets/images/ornaments/date-ring.png"
                                                    alt=""
                                                    width={58}
                                                    height={45}
                                                    unoptimized
                                                    data-date-ring
                                                />
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="@min-[460px]:col-span-2" aria-labelledby="agenda-title">
                            <h2 id="agenda-title" className="text-2xl leading-tight italic" data-enter>Lịch trình</h2>
                            <div className="relative mx-auto mt-6 max-w-md">
                                <span className="pointer-events-none absolute inset-y-0 left-[calc(50%_-_0.5px)] w-px bg-card-ink" aria-hidden="true" data-agenda-line />
                                <ol className="m-0 list-none p-0">
                                    {schedule.map(({ time, description }, index) => {
                                        const art = agendaArt[index % agendaArt.length];
                                        return (
                                            <li key={index} className="group/agenda grid min-h-28 grid-cols-2 items-start gap-x-7 py-1.5 text-left @min-[460px]:min-h-32 @min-[460px]:gap-x-8 even:text-right" data-agenda-row>
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
                            </div>
                        </section>
                    </div>
                </section>

                <section aria-labelledby="countdown-title" data-entrance-group>
                    <h2 id="countdown-title" className="text-2xl" data-step>Đếm ngược nè</h2>
                    <div className="flow-root" data-step><Countdown start={start} end={end} /></div>
                </section>

                <section className="mx-auto max-w-xl px-6 py-12 @min-[460px]:px-10" aria-labelledby="letter-title">
                    <h2 id="letter-title" className="text-2xl leading-tight" data-enter>Lời yêu thương từ mình</h2>
                    <div className="mt-6 space-y-4 text-left text-[15px] leading-[1.85] text-muted @min-[460px]:text-base">
                        {content.letter.split(/\n\s*\n/).map((paragraph, index) => (
                            <p key={index} className="wrap-anywhere whitespace-pre-line" data-enter>{paragraph}</p>
                        ))}
                    </div>
                    <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed italic" data-enter>{content.dedication}</p>
                </section>

                <section className="bg-[#f5f2ed] px-6 py-6 @min-[460px]:px-10" id="rsvp" aria-labelledby="rsvp-title">
                    <div data-entrance-group>
                        <h2 id="rsvp-title" className="text-2xl leading-tight" data-step>Xác nhận tham dự</h2>
                        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted" data-step>
                            {frontendOnly ? "Tính năng xác nhận tham dự sẽ mở sau." : "Bạn xác nhận tham dự để mình chuẩn bị đón tiếp một cách chu đáo nhất nhé!"}
                        </p>
                    </div>
                    <RsvpForm key={guestName ?? ""} guestName={guestName} disabled={frontendOnly} />
                </section>

                <section className="px-6 py-6 @min-[460px]:px-10" id="album" aria-labelledby="album-title">
                    <h2 id="album-title" className="mb-6 text-2xl leading-tight" data-enter>Xem hình của tui nè</h2>
                    {album.length ? <Album photos={album} /> : <p className="font-sans text-sm text-muted" data-enter>Album sẽ được cập nhật thêm.</p>}
                </section>
                <footer className="bg-card-ink px-6 py-2 font-serif text-3xl leading-tight wrap-anywhere text-white italic">
                    <p data-enter>{content.farewell}</p>
                </footer>
                <p className="text-[9pt] pt-0 pb-2 font-sans! mt-1">For Nguyen, from Hoai. Powered by machhoai</p>
            </main>
        </ScrollReveal>
    );
}
