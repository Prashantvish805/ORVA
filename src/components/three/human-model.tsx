"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/human.glb";
const TARGET_HEIGHT = 5;

type HumanModelProps = {
  opacity: number;
  visible: boolean;
};

export function HumanModel({ opacity, visible }: HumanModelProps) {
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

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.visible = visible;
    if (!visible) return;

    for (const mat of materialsRef.current) {
      mat.opacity = opacity;
      mat.emissiveIntensity = THREE.MathUtils.lerp(2.5, 0.8, opacity);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
