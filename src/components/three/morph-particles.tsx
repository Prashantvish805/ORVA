"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const DNA_PATH = "/models/dna.glb";
const HUMAN_PATH = "/models/human.glb";
const DNA_HEIGHT = 7;
const HUMAN_HEIGHT = 5;
const PARTICLE_COUNT = 4000;

type MorphParticlesProps = {
  visible: boolean;
  morphProgress: number;
  opacity: number;
  dnaHeightScale: number;
};

function sampleMeshPositions(
  scene: THREE.Object3D,
  targetHeight: number,
  count: number,
): Float32Array {
  const clone = scene.clone(true);

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const s = targetHeight / maxDim;
  clone.scale.multiplyScalar(s);
  clone.position.sub(center.multiplyScalar(s));
  clone.updateMatrixWorld(true);

  const meshes: THREE.Mesh[] = [];
  clone.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry) {
      meshes.push(child);
    }
  });

  const positions = new Float32Array(count * 3);
  if (meshes.length === 0) return positions;

  const tempVec = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const mesh = meshes[Math.floor(Math.random() * meshes.length)];
    const geo = mesh.geometry;
    const posAttr = geo.attributes.position;

    if (geo.index) {
      const indices = geo.index.array;
      const triCount = indices.length / 3;
      const tri = Math.floor(Math.random() * triCount);

      const i0 = indices[tri * 3];
      const i1 = indices[tri * 3 + 1];
      const i2 = indices[tri * 3 + 2];

      let u = Math.random();
      let v = Math.random();
      if (u + v > 1) {
        u = 1 - u;
        v = 1 - v;
      }
      const w = 1 - u - v;

      tempVec.set(
        posAttr.getX(i0) * u + posAttr.getX(i1) * v + posAttr.getX(i2) * w,
        posAttr.getY(i0) * u + posAttr.getY(i1) * v + posAttr.getY(i2) * w,
        posAttr.getZ(i0) * u + posAttr.getZ(i1) * v + posAttr.getZ(i2) * w,
      );
    } else {
      const vi = Math.floor(Math.random() * posAttr.count);
      tempVec.set(posAttr.getX(vi), posAttr.getY(vi), posAttr.getZ(vi));
    }

    tempVec.applyMatrix4(mesh.matrixWorld);

    positions[i * 3] = tempVec.x;
    positions[i * 3 + 1] = tempVec.y;
    positions[i * 3 + 2] = tempVec.z;
  }

  return positions;
}

export function MorphParticles({
  visible,
  morphProgress,
  opacity,
  dnaHeightScale,
}: MorphParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  const { scene: dnaScene } = useGLTF(DNA_PATH);
  const { scene: humanScene } = useGLTF(HUMAN_PATH);

  const { positions, dnaPositions, humanPositions, scatteredPositions, timeOffsets } =
    useMemo(() => {
      const dna = sampleMeshPositions(dnaScene, DNA_HEIGHT, PARTICLE_COUNT);
      const human = sampleMeshPositions(humanScene, HUMAN_HEIGHT, PARTICLE_COUNT);
      const scattered = new Float32Array(PARTICLE_COUNT * 3);
      const offsets = new Float32Array(PARTICLE_COUNT);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        const midX = (dna[i3] + human[i3]) / 2;
        const midY = (dna[i3 + 1] + human[i3 + 1]) / 2;
        const midZ = (dna[i3 + 2] + human[i3 + 2]) / 2;

        const angle = Math.atan2(midZ, midX) + (Math.random() - 0.5) * 2.0;
        const push = 1.2 + Math.random() * 2.5;

        scattered[i3] = midX + Math.cos(angle) * push;
        scattered[i3 + 1] = midY + (Math.random() - 0.5) * 2.5;
        scattered[i3 + 2] = midZ + Math.sin(angle) * push;

        offsets[i] = Math.random() * 0.15 - 0.075;
      }

      return {
        positions: new Float32Array(PARTICLE_COUNT * 3),
        dnaPositions: dna,
        humanPositions: human,
        scatteredPositions: scattered,
        timeOffsets: offsets,
      };
    }, [dnaScene, humanScene]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    pointsRef.current.visible = visible;
    if (!visible) return;

    timeRef.current += delta;
    const time = timeRef.current;

    const posAttr = pointsRef.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;

    const turbulenceStrength = Math.sin(morphProgress * Math.PI) * 0.35;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const t = THREE.MathUtils.clamp(
        morphProgress + timeOffsets[i],
        0,
        1,
      );
      const omt = 1 - t;

      // DNA Y scaled by current heightScale to match the wireframe
      const dnaY = dnaPositions[i3 + 1] * dnaHeightScale;

      // Quadratic bezier: DNA → scattered → Human
      arr[i3] =
        omt * omt * dnaPositions[i3] +
        2 * omt * t * scatteredPositions[i3] +
        t * t * humanPositions[i3] +
        Math.sin(time * 2.0 + i * 0.1) * turbulenceStrength;

      arr[i3 + 1] =
        omt * omt * dnaY +
        2 * omt * t * scatteredPositions[i3 + 1] +
        t * t * humanPositions[i3 + 1] +
        Math.cos(time * 1.5 + i * 0.05) * turbulenceStrength;

      arr[i3 + 2] =
        omt * omt * dnaPositions[i3 + 2] +
        2 * omt * t * scatteredPositions[i3 + 2] +
        t * t * humanPositions[i3 + 2] +
        Math.sin(time * 1.8 + i * 0.08) * turbulenceStrength;
    }

    posAttr.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = opacity;

    const sizeBoost = Math.sin(morphProgress * Math.PI) * 0.05;
    mat.size = 0.04 + sizeBoost;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={PARTICLE_COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#e84393"
        size={0.04}
        transparent
        opacity={0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
