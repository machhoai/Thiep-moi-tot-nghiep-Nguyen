"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { createSashScene } from "./sash-scene";

const poster = "/assets/models/sash-my-nguyen.webp";

export function GraduationSash() {
    const image = useRef<HTMLImageElement>(null);
    const canvas = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState<boolean | null>(null);

    useEffect(() => {
        const element = canvas.current;
        const artwork = image.current;
        if (!element || !artwork) return;

        let active = true;
        let visible = false;
        let loading = false;
        let scene: ReturnType<typeof createSashScene> | undefined;

        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            scene?.setVisible(visible);
            if (!visible || loading) return;

            loading = true;
            void Promise.all([import("./sash-scene"), artwork.decode()]).then(([{ createSashScene }]) => {
                if (!active) return;
                scene = createSashScene(element, artwork, setReady);
                scene.setVisible(visible);
            }).catch(() => {
                if (!active) return;
                scene?.dispose();
                scene = undefined;
                setReady(false);
            });
        });

        observer.observe(element);
        return () => {
            active = false;
            observer.disconnect();
            scene?.dispose();
        };
    }, []);

    return (
        <div className="card-sash pointer-events-none absolute top-40 left-1/2 z-[100] aspect-[1350/2048] w-(--sash-width) [--sash-x:44%] [--sash-width:100%] [--sash-gap:35%] [transform:translate(-50%,-50%)]">
            <Image
                ref={image}
                src={poster}
                alt="Khăn tốt nghiệp viền xanh, in tên Phạm Thị Mỹ Nguyên, khóa 2026"
                fill
                sizes="(max-width: 576px) 120vw, 692px"
                unoptimized
                className={`object-fill [clip-path:inset(0_50%_0_0)] [transform:translateX(calc(var(--sash-gap)/-2))] ${ready !== false ? "opacity-0 motion-reduce:opacity-100" : ""}`}
            />
            <Image
                src={poster}
                alt=""
                fill
                sizes="(max-width: 576px) 120vw, 692px"
                unoptimized
                className={`object-fill [clip-path:inset(0_0_0_50%)] [transform:translateX(calc(var(--sash-gap)/2))] ${ready !== false ? "opacity-0 motion-reduce:opacity-100" : ""}`}
            />
            <canvas ref={canvas} className={`card-sash-canvas absolute inset-0 block size-full ${ready ? "is-ready opacity-100" : "opacity-0"}`} aria-hidden="true" />
        </div>
    );
}
