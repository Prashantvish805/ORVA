"use client";

import { useState, useEffect } from "react";

type LoadingProgressProps = {
  onComplete: () => void;
};

export function LoadingProgress({ onComplete }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const duration = 2000;

    const animate = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));

      if (p < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setVisible(false);
          onComplete();
        }, 400);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500"
      style={{ opacity: progress >= 100 ? 0 : 1 }}
    >
      <h1 className="mb-8 font-serif text-5xl font-bold tracking-widest text-white md:text-7xl">
        ORVA
      </h1>
      <div className="h-[2px] w-48 overflow-hidden bg-white/10">
        <div
          className="h-full bg-orva-pink transition-all duration-200 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-4 font-sans text-sm tracking-[0.3em] text-white/50">
        {progress}%
      </p>
    </div>
  );
}
