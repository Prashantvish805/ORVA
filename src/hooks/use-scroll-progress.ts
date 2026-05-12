"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useScrollProgress(
  containerRef: RefObject<HTMLElement | null>
): number {
  const [progress, setProgress] = useState(0);
  const triggerRef = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    triggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        setProgress(self.progress);
      },
    });

    return () => {
      triggerRef.current?.kill();
    };
  }, [containerRef]);

  return progress;
}
