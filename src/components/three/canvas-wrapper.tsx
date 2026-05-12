"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Scene } from "./scene";

type CanvasWrapperProps = {
  scrollProgress: number;
};

export function CanvasWrapper({ scrollProgress }: CanvasWrapperProps) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <Suspense fallback={null}>
          <Scene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
