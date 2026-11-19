"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function entrance(trigger: Element) {
  return gsap.timeline({
    defaults: { duration: 0.72, ease: "power3.out" },
    scrollTrigger: {
      trigger,
      start: "clamp(top bottom)",
      end: "clamp(top 70%)",
      scrub: 0.25,
    },
  });
}

export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const card = root.current;
    if (!card) return;
    const select = gsap.utils.selector(card);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      select<HTMLElement>("[data-enter]").forEach((element) => {
        entrance(element).from(element, {
          y: 22, opacity: 0, clearProps: "transform,opacity",
        });
      });

      select<HTMLElement>("[data-entrance-group]").forEach((group) => {
        entrance(group).from(group.querySelectorAll("[data-step]"), {
          y: 16,
          opacity: 0,
          stagger: { amount: 0.25 },
          clearProps: "transform,opacity",
        });
      });

      const [drawing] = select<SVGSVGElement>("[data-cap-drawing]");
      entrance(drawing)
        .fromTo(drawing.querySelectorAll("path"), {
          strokeDasharray: "1 1",
          strokeDashoffset: "1",
        }, {
          strokeDasharray: "1 1",
          strokeDashoffset: "0",
          autoRound: false,
          duration: 0.95,
          ease: "power2.inOut",
          stagger: 0.085,
          clearProps: "strokeDasharray,strokeDashoffset",
        })
        .from(drawing.querySelector("circle"), { opacity: 0, duration: 0.28, clearProps: "opacity" }, "-=0.34");

      const [name] = select<HTMLElement>("[data-invite-name]");
      entrance(name).fromTo(name, {
        clipPath: "inset(0% 0% 100% 0%)",
        y: 18,
      }, {
        clipPath: "inset(0% 0% 0% 0%)",
        y: 0,
        duration: 0.95,
        clearProps: "clipPath,transform",
      });

      const [cover] = select<HTMLElement>(".card-cover");
      gsap.to(cover.querySelector(".card-cover-image img"), {
        yPercent: 7,
        scale: 1.16,
        ease: "none",
        scrollTrigger: { trigger: cover, start: "top top", end: "bottom top", scrub: 0.4 },
      });

      const [calendar] = select<HTMLElement>("[data-calendar]");
      entrance(calendar).from(calendar.querySelectorAll("[data-calendar-cell]"), {
        y: 12,
        opacity: 0,
        duration: 0.5,
        stagger: { amount: 0.44, from: "start" },
        clearProps: "transform,opacity",
      });

      const [eventDay] = select<HTMLElement>('[data-calendar-cell][aria-current="date"]');
      if (eventDay) {
        entrance(eventDay).fromTo(eventDay.querySelector("[data-date-ring]"), {
          clipPath: "inset(0% 100% 0% 0%)",
        }, {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.8,
          clearProps: "clipPath",
        }, 0.17);
      }

      const [agendaLine] = select<HTMLElement>("[data-agenda-line]");
      gsap.from(agendaLine, {
        scaleY: 0,
        transformOrigin: "top",
        ease: "none",
        scrollTrigger: {
          trigger: agendaLine.parentElement,
          start: "clamp(top 87%)",
          end: "clamp(bottom 68%)",
          scrub: 0.2,
        },
      });

      select<HTMLElement>("[data-agenda-row]").forEach((row, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        entrance(row)
          .from(row.querySelector("img"), {
            x: direction * 20, rotation: direction * 11, scale: 0.83,
            opacity: 0, ease: "back.out(1.5)", clearProps: "transform,opacity",
          })
          .from(row.querySelector("div"), {
            x: direction * -16, opacity: 0, clearProps: "transform,opacity",
          }, 0.1);
      });

      select<HTMLElement>("[data-photo-reveal]").forEach((frame) => {
        const fromRight = frame.getAttribute("data-photo-reveal") === "right";
        const delay = fromRight ? 0.12 : 0;
        entrance(frame)
          .fromTo(frame, {
            clipPath: fromRight ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)",
          }, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.85,
            clearProps: "clipPath",
          }, delay)
          .from(frame.querySelector("img"), {
            scale: 1.13, duration: 1.05, clearProps: "transform",
          }, delay);
      });
    }, root);

    return () => media.revert();
  }, { scope: root });
  return <div ref={root}>{children}</div>;
}
