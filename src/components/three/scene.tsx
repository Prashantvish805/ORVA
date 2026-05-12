"use client";

import { ModelController } from "./model-controller";
import { Effects } from "./effects";

type SceneProps = {
  scrollProgress: number;
};

export function Scene({ scrollProgress }: SceneProps) {
  // Bloom boost: sine-shaped spike during particle burst onset (scroll 0.42–0.50)
  let bloomBoost = 0;
  if (scrollProgress >= 0.42 && scrollProgress < 0.50) {
    const burstT = (scrollProgress - 0.42) / 0.08;
    bloomBoost = Math.sin(burstT * Math.PI) * 1.2;
  }

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 15, 30]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#e84393" />
      <pointLight position={[-5, -3, 3]} intensity={1.2} color="#fd79a8" />
      <pointLight position={[0, 3, -5]} intensity={0.8} color="#ff6b9d" />
      <directionalLight position={[0, 0, 5]} intensity={0.5} color="#ffffff" />

      <ModelController scrollProgress={scrollProgress} />
      <Effects bloomBoost={bloomBoost} />
    </>
  );
}
