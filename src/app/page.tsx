"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { LoadingProgress } from "@/components/three";

const CanvasWrapper = dynamic(
  () =>
    import("@/components/three/canvas-wrapper").then(
      (mod) => mod.CanvasWrapper
    ),
  { ssr: false }
);

const sections = [
  {
    id: "hero",
    title: "",
    subtitle: "Intelligent Regeneration, Redefined.",
  },
  {
    id: "story-1",
    title: "The Code of Life",
    subtitle: "Every strand carries the blueprint of who we are.",
  },
  {
    id: "story-2",
    title: "From Molecule to Form",
    subtitle: "Watch as the building blocks of life take shape.",
  },
  {
    id: "story-3",
    title: "Intelligent Regeneration",
    subtitle: "The future of human restoration begins here.",
  },
  {
    id: "finale",
    title: "Redefined.",
    subtitle: "Experience the next generation of regenerative science.",
  },
] as const;

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgress = useScrollProgress(containerRef);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadComplete = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const getSectionOpacity = (index: number) => {
    const sectionStart = index / sections.length;
    const sectionEnd = (index + 1) / sections.length;
    const sectionMid = (sectionStart + sectionEnd) / 2;
    const fadeRange = 0.08;

    if (scrollProgress < sectionStart + 0.02) {
      return index === 0 ? 1 : 0;
    }
    if (scrollProgress > sectionEnd - 0.02) {
      return 0;
    }
    if (scrollProgress < sectionMid) {
      const fadeIn = (scrollProgress - sectionStart) / fadeRange;
      return Math.min(1, index === 0 ? 1 : fadeIn);
    }
    const fadeOut = (sectionEnd - scrollProgress) / fadeRange;
    return Math.max(0, fadeOut);
  };

  return (
    <>
      <LoadingProgress onComplete={handleLoadComplete} />

      <header className="pointer-events-none fixed top-0 left-0 right-0 z-20 flex justify-center pt-8">
        <h1 className="font-serif text-xl font-bold tracking-[0.3em] text-white/60 md:text-white/80 md:text-2xl">
          ORVA
        </h1>
      </header>

      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${sections.length * 160}vh` }}
      >
        {isLoaded && <CanvasWrapper scrollProgress={scrollProgress} />}

        {sections.map((section, index) => (
          <section
            key={section.id}
            className="pointer-events-none sticky top-0 flex h-screen items-center justify-center"
          >
            <div
              className="relative z-10 max-w-4xl px-6 text-center"
              style={{
                opacity: getSectionOpacity(index),
                transform: `translateY(${(1 - getSectionOpacity(index)) * 20}px)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {index === 0 ? (
                <p className="font-serif text-2xl tracking-[0.2em] text-white md:text-4xl">
                  {section.subtitle}
                </p>
              ) : (
                <>
                  <h2 className="mb-4 font-serif text-5xl font-light text-white md:text-7xl">
                    {section.title}
                  </h2>
                  <p className="mx-auto max-w-2xl font-sans text-lg text-white/50 md:text-xl">
                    {section.subtitle}
                  </p>
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
