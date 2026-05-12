"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { easeOutQuart, easeInQuad } from "@/lib/utils";
import { DNAModel } from "./dna-model";
import { HumanModel } from "./human-model";
import { MorphParticles } from "./morph-particles";

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
  // Shared spin on the parent group. Both meshes + morph particles inherit it.
  // Fast spin through the entire morph sells the metamorphosis illusion.
  let rotationSpeed: number;
  if (scrollProgress < 0.10) {
    rotationSpeed = BASE_ROTATION;
  } else if (scrollProgress < 0.28) {
    const t = (scrollProgress - 0.10) / 0.18;
    rotationSpeed = THREE.MathUtils.lerp(BASE_ROTATION, MAX_ROTATION, easeOutQuart(t));
  } else if (scrollProgress < 0.66) {
    rotationSpeed = MAX_ROTATION;
  } else if (scrollProgress < 0.80) {
    const t = (scrollProgress - 0.66) / 0.14;
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

  // ─── DNA WIREFRAME ─────────────────────────────────────
  // Rise → stall at peak → fall back to center → dissolve into particles.
  // Fall + shrink finish at 0.46 so DNA is at center when particles take over.
  const showDNA = scrollProgress < 0.54;

  let dnaPositionY: number;
  if (scrollProgress < 0.10) {
    dnaPositionY = 0;
  } else if (scrollProgress < 0.28) {
    const t = (scrollProgress - 0.10) / 0.18;
    dnaPositionY = THREE.MathUtils.lerp(0, PEAK_HEIGHT, easeOutQuart(t));
  } else if (scrollProgress < 0.38) {
    dnaPositionY = PEAK_HEIGHT;
  } else if (scrollProgress < 0.46) {
    const t = (scrollProgress - 0.38) / 0.08;
    dnaPositionY = THREE.MathUtils.lerp(PEAK_HEIGHT, 0, easeInQuad(t));
  } else {
    dnaPositionY = 0;
  }

  let dnaHeightScale: number;
  if (scrollProgress < 0.38) {
    dnaHeightScale = 1.0;
  } else if (scrollProgress < 0.46) {
    const t = (scrollProgress - 0.38) / 0.08;
    dnaHeightScale = THREE.MathUtils.lerp(1.0, 0.8, t);
  } else {
    dnaHeightScale = 0.8;
  }

  // DNA wireframe fades as particles appear in the same shape
  const dnaOpacity = scrollProgress < 0.46
    ? 1
    : THREE.MathUtils.clamp(1 - (scrollProgress - 0.46) / 0.08, 0, 1);

  // ─── MORPH PARTICLES ───────────────────────────────────
  // The transition medium: DNA surface points → scattered cloud → Human surface points.
  // Particles appear as DNA dissolves, hold during scatter, fade as Human solidifies.
  const showMorphParticles = scrollProgress > 0.44 && scrollProgress < 0.74;

  let morphParticleOpacity: number;
  if (scrollProgress < 0.44) {
    morphParticleOpacity = 0;
  } else if (scrollProgress < 0.50) {
    morphParticleOpacity = (scrollProgress - 0.44) / 0.06;
  } else if (scrollProgress < 0.68) {
    morphParticleOpacity = 1;
  } else if (scrollProgress < 0.74) {
    morphParticleOpacity = 1 - (scrollProgress - 0.68) / 0.06;
  } else {
    morphParticleOpacity = 0;
  }

  // morphProgress: 0 = DNA shape, 1 = Human shape
  const morphProgress = scrollProgress < 0.50
    ? 0
    : scrollProgress > 0.68
      ? 1
      : (scrollProgress - 0.50) / 0.18;

  // ─── HUMAN WIREFRAME ───────────────────────────────────
  // Solidifies from particles — fades in as morph particles converge on Human shape.
  const showHuman = scrollProgress > 0.64;
  const humanOpacity = scrollProgress < 0.66
    ? 0
    : THREE.MathUtils.clamp((scrollProgress - 0.66) / 0.08, 0, 1);

  return (
    <group ref={spinRef}>
      <DNAModel
        opacity={dnaOpacity}
        visible={showDNA}
        positionY={dnaPositionY}
        heightScale={dnaHeightScale}
      />
      <MorphParticles
        visible={showMorphParticles}
        morphProgress={morphProgress}
        opacity={morphParticleOpacity}
        dnaHeightScale={dnaHeightScale}
      />
      <HumanModel
        opacity={humanOpacity}
        visible={showHuman}
      />
    </group>
  );
}
