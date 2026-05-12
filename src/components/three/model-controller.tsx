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
const DROWN_DEPTH = -6;
const DNA_MODEL_HEIGHT = 7;
const BASE_ROTATION = 1.2;
const MAX_ROTATION = 6.0;

export function ModelController({ scrollProgress }: ModelControllerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    const camZ = THREE.MathUtils.lerp(6, 5, scrollProgress);
    const camY = THREE.MathUtils.lerp(0, 0.3, scrollProgress);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, camZ, 0.03);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, camY, 0.03);
    camera.lookAt(0, 0, 0);
  });

  // ─── DNA ───────────────────────────────────────────────
  // Visible until 0.72 so you see it fully back at bottom before it fades
  const showDNA = scrollProgress < 0.72;

  // morphProgress with stall at peak
  // Rise:  0.12→0.30 (morph 0→0.5)
  // Stall: 0.30→0.42 (morph holds 0.5) — holds until smoke starts
  // Fall:  0.42→0.65 (morph 0.5→1.0) — synced with smoke descent
  let dnaMorph: number;
  if (scrollProgress < 0.12) {
    dnaMorph = 0;
  } else if (scrollProgress < 0.30) {
    dnaMorph = ((scrollProgress - 0.12) / 0.18) * 0.5;
  } else if (scrollProgress < 0.42) {
    dnaMorph = 0.5;
  } else if (scrollProgress < 0.65) {
    dnaMorph = 0.5 + ((scrollProgress - 0.42) / 0.23) * 0.5;
  } else {
    dnaMorph = 1.0;
  }

  // DNA Y position (eased) — falls past center and drowns off-screen
  let dnaPositionY: number;
  if (dnaMorph <= 0.5) {
    const riseT = dnaMorph * 2;
    dnaPositionY = THREE.MathUtils.lerp(0, PEAK_HEIGHT, easeOutQuart(riseT));
  } else {
    const fallT = (dnaMorph - 0.5) * 2;
    dnaPositionY = THREE.MathUtils.lerp(PEAK_HEIGHT, DROWN_DEPTH, easeInQuad(fallT));
  }

  // DNA opacity: fully visible until it's back at bottom (0.65), then fades
  const dnaOpacity = scrollProgress < 0.65
    ? 1
    : THREE.MathUtils.clamp(1 - (scrollProgress - 0.65) / 0.07, 0, 1);

  // Rotation
  let dnaRotationSpeed: number;
  if (scrollProgress < 0.12) {
    dnaRotationSpeed = BASE_ROTATION;
  } else if (dnaMorph <= 0.5) {
    const riseT = dnaMorph * 2;
    dnaRotationSpeed = THREE.MathUtils.lerp(BASE_ROTATION, MAX_ROTATION, easeOutQuart(riseT));
  } else {
    const fallT = (dnaMorph - 0.5) * 2;
    if (fallT < 0.7) {
      dnaRotationSpeed = MAX_ROTATION;
    } else {
      const settleT = (fallT - 0.7) / 0.3;
      dnaRotationSpeed = THREE.MathUtils.lerp(MAX_ROTATION, BASE_ROTATION * 1.5, settleT);
    }
  }

  // ─── SMOKE ─────────────────────────────────────────────
  // Smoke tracks helix while falling, then stays put and fades out in place
  const smokeSourceY = dnaPositionY + DNA_MODEL_HEIGHT * 0.5;

  const fallProgress = dnaMorph <= 0.5
    ? 0
    : (dnaMorph - 0.5) * 2;

  const showStorm = scrollProgress > 0.42 && scrollProgress < 0.72;
  let stormIntensity: number;
  if (scrollProgress < 0.42) {
    stormIntensity = 0;
  } else if (scrollProgress < 0.50) {
    stormIntensity = THREE.MathUtils.clamp((scrollProgress - 0.42) / 0.08, 0, 1);
  } else if (scrollProgress < 0.60) {
    stormIntensity = 1.0;
  } else if (scrollProgress < 0.72) {
    // Fade out in place as human appears — no sinking
    stormIntensity = THREE.MathUtils.clamp(1 - (scrollProgress - 0.60) / 0.12, 0, 1);
  } else {
    stormIntensity = 0;
  }

  const burstPhase = scrollProgress >= 0.42 && scrollProgress < 0.50
    ? THREE.MathUtils.clamp((scrollProgress - 0.42) / 0.08, 0, 1)
    : 0;

  // ─── HUMAN ─────────────────────────────────────────────
  // Appears right as the burst starts fading, same rotation direction
  const showHuman = scrollProgress > 0.58;
  const humanOpacity = scrollProgress < 0.60
    ? 0
    : THREE.MathUtils.clamp((scrollProgress - 0.60) / 0.10, 0, 1);
  const humanReveal = scrollProgress < 0.60
    ? 0
    : THREE.MathUtils.clamp((scrollProgress - 0.60) / 0.25, 0, 1);

  // Match helix rotation direction and speed, then ease to idle
  const humanRotationSpeed = THREE.MathUtils.lerp(
    dnaRotationSpeed > BASE_ROTATION ? dnaRotationSpeed : MAX_ROTATION,
    1.2,
    humanReveal,
  );

  return (
    <group ref={groupRef}>
      <DNAModel
        opacity={dnaOpacity}
        visible={showDNA}
        morphProgress={dnaMorph}
        rotationSpeed={dnaRotationSpeed}
      />
      <ParticleStorm
        visible={showStorm}
        intensity={stormIntensity}
        positionY={smokeSourceY}
        burstPhase={burstPhase}
        fallProgress={fallProgress}
      />
      <HumanModel
        opacity={humanOpacity}
        visible={showHuman}
        revealProgress={humanReveal}
        rotationSpeed={humanRotationSpeed}
      />
    </group>
  );
}
