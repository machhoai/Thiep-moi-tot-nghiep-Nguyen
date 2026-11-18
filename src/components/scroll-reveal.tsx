"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current).forEach((element) => {
        gsap.from(element, {
          y: 18,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "clamp(top 92%)", once: true },
        });
      });
    }, root);
    return () => media.revert();
  }, { scope: root });
  return <div ref={root}>{children}</div>;
}
