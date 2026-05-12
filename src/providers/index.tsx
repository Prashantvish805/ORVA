"use client";

import type { ReactNode } from "react";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useSmoothScroll();
  return <>{children}</>;
}

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <SmoothScrollProvider>{children}</SmoothScrollProvider>;
}
