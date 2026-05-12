"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { easeOutCubic } from "@/lib/utils";

const MODEL_PATH = "/models/human.glb";
const TARGET_HEIGHT = 5;

type HumanModelProps = {
  opacity: number;
  visible: boolean;
  revealProgress: number;
  rotationSpeed: number;
};

export function HumanModel({ opacity, visible, revealProgress, rotationSpeed }: HumanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const { scene } = useGLTF(MODEL_PATH);

  const normalizedScene = useMemo(() => {
    const clone = scene.clone(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = TARGET_HEIGHT / maxDim;
    clone.scale.multiplyScalar(scale);
    clone.position.sub(center.multiplyScalar(scale));

    const mats: THREE.MeshStandardMaterial[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color("#e84393"),
          emissive: new THREE.Color("#e84393"),
          emissiveIntensity: 1.0,
          transparent: true,
          opacity: 1,
          wireframe: true,
          side: THREE.DoubleSide,
        });
        child.material = mat;
        mats.push(mat);
      }
    });
    materialsRef.current = mats;

    return clone;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.visible = visible;

    if (!visible) return;

    groupRef.current.rotation.y += delta * rotationSpeed;

    // Rise from below the screen upward through the smoke
    const eased = easeOutCubic(revealProgress);
    groupRef.current.position.y = THREE.MathUtils.lerp(-6, 0, eased);
    groupRef.current.scale.set(1, 1, 1);

    for (const mat of materialsRef.current) {
      mat.opacity = opacity;
      mat.emissiveIntensity = THREE.MathUtils.lerp(3.0, 0.8, revealProgress);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
