"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMediaQuery } from "@/hooks";

type EffectsProps = {
  bloomBoost?: number;
};

export function Effects({ bloomBoost = 0 }: EffectsProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) return null;

  return (
    <EffectComposer>
      <Bloom
        intensity={1.5 + bloomBoost}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  );
}
