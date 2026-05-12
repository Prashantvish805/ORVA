"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easeOutQuart, easeInQuad } from "@/lib/utils";
import { DNAModel } from "./dna-model";
import { HumanModel } from "./human-model";
import { ParticleStorm } from "./particle-storm";

type ModelControllerProps = {
  scrollProgress: number;
};

const PEAK_HEIGHT = 4.5;
const BASE_ROTATION = 1.2;
const MAX_ROTATION = 8.0;

export function ModelController({ scrollProgress }: ModelControllerProps) {
  const spinRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  // ─── ROTATION ───────────────────────────────────────────
  // Shared spin applied to a parent group — both models rotate as one object.
  // Base → Max during rise, hold max through morph, ease back after.
  let rotationSpeed: number;
  if (scrollProgress < 0.10) {
    rotationSpeed = BASE_ROTATION;
  } else if (scrollProgress < 0.28) {
    const t = (scrollProgress - 0.10) / 0.18;
    rotationSpeed = THREE.MathUtils.lerp(BASE_ROTATION, MAX_ROTATION, easeOutQuart(t));
  } else if (scrollProgress < 0.62) {
    rotationSpeed = MAX_ROTATION;
  } else if (scrollProgress < 0.78) {
    const t = (scrollProgress - 0.62) / 0.16;
    rotationSpeed = THREE.MathUtils.lerp(MAX_ROTATION, BASE_ROTATION, t);
  } else {
    rotationSpeed = BASE_ROTATION;
  }

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += delta * rotationSpeed;
    }

    const camZ = THREE.MathUtils.lerp(6, 5, scrollProgress);
    const camY = THREE.MathUtils.lerp(0, 0.3, scrollProgress);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, 0.03);
    camera.lookAt(0, 0, 0);
  });

  // ─── DNA ───────────────────────────────────────────────
  // Rise:  0.10→0.28  (y: 0 → peak)
  // Stall: 0.28→0.38  (holds at peak, spinning fast)
  // Fall:  0.38→0.50  (y: peak → 0, height shrinks to 80%)
  // Morph: 0.50→0.65  (opacity crossfade out while at center)
  const showDNA = scrollProgress < 0.68;

  let dnaPositionY: number;
  if (scrollProgress < 0.10) {
    dnaPositionY = 0;
  } else if (scrollProgress < 0.28) {
    const t = (scrollProgress - 0.10) / 0.18;
    dnaPositionY = THREE.MathUtils.lerp(0, PEAK_HEIGHT, easeOutQuart(t));
  } else if (scrollProgress < 0.38) {
    dnaPositionY = PEAK_HEIGHT;
  } else if (scrollProgress < 0.50) {
    const t = (scrollProgress - 0.38) / 0.12;
    dnaPositionY = THREE.MathUtils.lerp(PEAK_HEIGHT, 0, easeInQuad(t));
  } else {
    dnaPositionY = 0;
  }

  let dnaHeightScale: number;
  if (scrollProgress < 0.38) {
    dnaHeightScale = 1.0;
  } else if (scrollProgress < 0.50) {
    const t = (scrollProgress - 0.38) / 0.12;
    dnaHeightScale = THREE.MathUtils.lerp(1.0, 0.8, t);
  } else {
    dnaHeightScale = 0.8;
  }

  const dnaOpacity = scrollProgress < 0.50
    ? 1
    : THREE.MathUtils.clamp(1 - (scrollProgress - 0.50) / 0.15, 0, 1);

  // ─── HUMAN ─────────────────────────────────────────────
  // Fades in exactly as DNA fades out — same spin group, same center.
  // The spinning object "becomes" the human.
  const showHuman = scrollProgress > 0.48;
  const humanOpacity = scrollProgress < 0.50
    ? 0
    : THREE.MathUtils.clamp((scrollProgress - 0.50) / 0.15, 0, 1);

  // ─── PARTICLES ─────────────────────────────────────────
  // Appear during fall, peak during morph (masking the swap), fade after.
  const showStorm = scrollProgress > 0.36 && scrollProgress < 0.72;
  let stormIntensity: number;
  if (scrollProgress < 0.36) {
    stormIntensity = 0;
  } else if (scrollProgress < 0.46) {
    stormIntensity = THREE.MathUtils.clamp((scrollProgress - 0.36) / 0.10, 0, 1);
  } else if (scrollProgress < 0.60) {
    stormIntensity = 1.0;
  } else if (scrollProgress < 0.72) {
    stormIntensity = THREE.MathUtils.clamp(1 - (scrollProgress - 0.60) / 0.12, 0, 1);
  } else {
    stormIntensity = 0;
  }

  const burstPhase = scrollProgress >= 0.38 && scrollProgress < 0.48
    ? THREE.MathUtils.clamp((scrollProgress - 0.38) / 0.10, 0, 1)
    : 0;

  // morphPhase drives the tight vortex cocoon effect during the swap
  let morphPhase: number;
  if (scrollProgress < 0.48) {
    morphPhase = 0;
  } else if (scrollProgress < 0.52) {
    morphPhase = (scrollProgress - 0.48) / 0.04;
  } else if (scrollProgress < 0.60) {
    morphPhase = 1.0;
  } else if (scrollProgress < 0.66) {
    morphPhase = 1 - (scrollProgress - 0.60) / 0.06;
  } else {
    morphPhase = 0;
  }

  return (
    <group>
      <group ref={spinRef}>
        <DNAModel
          opacity={dnaOpacity}
          visible={showDNA}
          positionY={dnaPositionY}
          heightScale={dnaHeightScale}
        />
        <HumanModel
          opacity={humanOpacity}
          visible={showHuman}
        />
      </group>
      <ParticleStorm
        visible={showStorm}
        intensity={stormIntensity}
        positionY={dnaPositionY}
        burstPhase={burstPhase}
        fallProgress={0}
        morphPhase={morphPhase}
      />
    </group>
  );
}
