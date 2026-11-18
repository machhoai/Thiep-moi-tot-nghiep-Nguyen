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
    return <p className="countdown-status">{now < end ? "Buổi lễ đang diễn ra!" : "Buổi lễ đã kết thúc."}</p>;
  }
  const seconds = now === null ? 0 : Math.ceil((start - now) / 1000);
  const units = [
    ["Ngày", Math.floor(seconds / 86400)],
    ["Giờ", Math.floor(seconds / 3600) % 24],
    ["Phút", Math.floor(seconds / 60) % 60],
    ["Giây", seconds % 60],
  ] as const;

  return (
    <div className="countdown-grid" role="timer" aria-label="Thời gian đến lễ tốt nghiệp">
      {units.map(([label, value]) => (
        <div key={label}><strong>{now === null ? "--" : String(value).padStart(2, "0")}</strong><span>{label}</span></div>
      ))}
    </div>
  );
}
