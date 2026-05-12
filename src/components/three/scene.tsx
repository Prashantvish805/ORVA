"use client";

import { ModelController } from "./model-controller";
import { Effects } from "./effects";

type SceneProps = {
  scrollProgress: number;
};

export function Scene({ scrollProgress }: SceneProps) {
  let bloomBoost = 0;
  if (scrollProgress >= 0.44 && scrollProgress < 0.54) {
    const dissolveT = (scrollProgress - 0.44) / 0.10;
    bloomBoost = Math.sin(dissolveT * Math.PI) * 1.0;
  }
  if (scrollProgress >= 0.54 && scrollProgress < 0.70) {
    const morphT = (scrollProgress - 0.54) / 0.16;
    bloomBoost = Math.max(bloomBoost, Math.sin(morphT * Math.PI) * 1.2);
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
