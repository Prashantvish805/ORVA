"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 1800;
const SECONDARY_COUNT = 900;

type ParticleStormProps = {
  visible: boolean;
  intensity: number;
  positionY?: number;
  burstPhase?: number;
  fallProgress?: number;
};

export function ParticleStorm({
  visible,
  intensity,
  positionY = 0,
  burstPhase = 0,
  fallProgress = 0,
}: ParticleStormProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const points2Ref = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Primary: tight cylinder hugging the helix body
  const primary = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const init = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const r = 0.05 + Math.random() * 0.5;
      const y = Math.random() * 2.0;

      init[i3] = r * Math.cos(theta);
      init[i3 + 1] = y;
      init[i3 + 2] = r * Math.sin(theta);

      pos[i3] = init[i3];
      pos[i3 + 1] = init[i3 + 1];
      pos[i3 + 2] = init[i3 + 2];

      vel[i3] = (Math.random() - 0.5) * 0.8;
      vel[i3 + 1] = -(Math.random() * 1.0 + 0.3);
      vel[i3 + 2] = (Math.random() - 0.5) * 0.8;
    }

    return { positions: pos, initialPositions: init, velocities: vel };
  }, []);

  // Secondary: slightly wider halo, still close to the body
  const secondary = useMemo(() => {
    const pos = new Float32Array(SECONDARY_COUNT * 3);
    const init = new Float32Array(SECONDARY_COUNT * 3);
    const vel = new Float32Array(SECONDARY_COUNT * 3);

    for (let i = 0; i < SECONDARY_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const r = 0.15 + Math.random() * 0.9;
      const y = Math.random() * 2.5 - 0.5;

      init[i3] = r * Math.cos(theta);
      init[i3 + 1] = y;
      init[i3 + 2] = r * Math.sin(theta);

      pos[i3] = init[i3];
      pos[i3 + 1] = init[i3 + 1];
      pos[i3 + 2] = init[i3 + 2];

      vel[i3] = (Math.random() - 0.5) * 0.6;
      vel[i3 + 1] = -(Math.random() * 0.8 + 0.2);
      vel[i3 + 2] = (Math.random() - 0.5) * 0.6;
    }

    return { positions: pos, initialPositions: init, velocities: vel };
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current || !pointsRef.current || !points2Ref.current) return;

    pointsRef.current.visible = visible;
    points2Ref.current.visible = visible;
    if (!visible) return;

    groupRef.current.position.y = positionY;

    timeRef.current += delta;
    const t = timeRef.current;

    // Contained burst: small radial push, not a screen-wide explosion
    const burstExpand = 1 + burstPhase * 0.8;

    // Gentle outward drift at peak, stays tight
    const spread = intensity * 0.5 * burstExpand;

    const gravityPull = fallProgress * 3.0;

    const geo1 = pointsRef.current.geometry;
    const posAttr1 = geo1.attributes.position as THREE.BufferAttribute;
    const arr1 = posAttr1.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const particleRatio = i / PARTICLE_COUNT;

      arr1[i3] = primary.initialPositions[i3] * burstExpand
        + Math.sin(t * primary.velocities[i3] * 0.6 + i * 0.1) * spread;
      arr1[i3 + 1] = primary.initialPositions[i3 + 1]
        - gravityPull * (0.4 + particleRatio * 0.6)
        + Math.sin(t * 0.4 + i * 0.03) * intensity * 0.2;
      arr1[i3 + 2] = primary.initialPositions[i3 + 2] * burstExpand
        + Math.cos(t * primary.velocities[i3 + 2] * 0.6 + i * 0.1) * spread;
    }

    posAttr1.needsUpdate = true;
    pointsRef.current.rotation.y += delta * intensity * 1.5;

    const mat1 = pointsRef.current.material as THREE.PointsMaterial;
    mat1.opacity = intensity * 0.9;
    mat1.size = THREE.MathUtils.lerp(0.03, 0.10, intensity)
      + burstPhase * 0.04;

    const geo2 = points2Ref.current.geometry;
    const posAttr2 = geo2.attributes.position as THREE.BufferAttribute;
    const arr2 = posAttr2.array as Float32Array;

    const drift = intensity * 0.7 * burstExpand;

    for (let i = 0; i < SECONDARY_COUNT; i++) {
      const i3 = i * 3;
      const particleRatio = i / SECONDARY_COUNT;

      arr2[i3] = secondary.initialPositions[i3] * burstExpand
        + Math.cos(t * secondary.velocities[i3] * 0.4 + i * 0.15) * drift;
      arr2[i3 + 1] = secondary.initialPositions[i3 + 1]
        - gravityPull * (0.3 + particleRatio * 0.5)
        + Math.sin(t * 0.25 + i * 0.02) * intensity * 0.3;
      arr2[i3 + 2] = secondary.initialPositions[i3 + 2] * burstExpand
        + Math.sin(t * secondary.velocities[i3 + 2] * 0.4 + i * 0.15) * drift;
    }

    posAttr2.needsUpdate = true;
    points2Ref.current.rotation.y -= delta * intensity * 1.0;

    const mat2 = points2Ref.current.material as THREE.PointsMaterial;
    mat2.opacity = intensity * 0.65;
    mat2.size = THREE.MathUtils.lerp(0.05, 0.14, intensity)
      + burstPhase * 0.05;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[primary.positions, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#e84393"
          size={0.03}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <points ref={points2Ref}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[secondary.positions, 3]}
            count={SECONDARY_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff6b9d"
          size={0.05}
          transparent
          opacity={0}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
