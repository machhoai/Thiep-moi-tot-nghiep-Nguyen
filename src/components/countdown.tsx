"use client";

import { useEffect, useState } from "react";

export function Countdown({ start, end }: { start: number; end: number }) {
    const [now, setNow] = useState<number | null>(null);
    useEffect(() => {
        const tick = () => setNow(Date.now());
        const initial = window.setTimeout(tick, 0);
        const timer = window.setInterval(tick, 1000);
        return () => {
            window.clearTimeout(initial);
            window.clearInterval(timer);
        };
    }, []);

    if (now !== null && now >= start) {
        return <p className="mt-4 font-sans text-sm">{now < end ? "Buổi lễ đang diễn ra!" : "Buổi lễ đã kết thúc."}</p>;
    }
    const seconds = now === null ? 0 : Math.ceil((start - now) / 1000);
    const units = [
        ["Ngày", Math.floor(seconds / 86400)],
        ["Giờ", Math.floor(seconds / 3600) % 24],
        ["Phút", Math.floor(seconds / 60) % 60],
        ["Giây", seconds % 60],
    ] as const;

    return (
        <div className="mx-auto mt-5 grid max-w-sm grid-cols-4" role="timer" aria-label="Thời gian đến lễ tốt nghiệp">
            {units.map(([label, value]) => (
                <div key={label} className="grid gap-1 px-1">
                    <strong className="font-serif text-5xl leading-none font-normal wrap-anywhere tabular-nums">
                        {now === null ? "--" : String(value).padStart(2, "0")}
                    </strong>
                    <span className="mt-1 text-sm text-muted">{label}</span>
                </div>
            ))}
        </div>
    );
}
