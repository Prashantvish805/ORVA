"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_PATH = "/models/dna.glb";
const TARGET_HEIGHT = 7;

type DNAModelProps = {
  opacity: number;
  visible: boolean;
  positionY: number;
  heightScale: number;
};

export function DNAModel({ opacity, visible, positionY, heightScale }: DNAModelProps) {
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
          emissiveIntensity: 0.8,
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

    groupRef.current.position.y = positionY;
    groupRef.current.scale.set(1, heightScale, 1);

    for (const mat of materialsRef.current) {
      mat.opacity = opacity;
      mat.emissiveIntensity = THREE.MathUtils.lerp(0.8, 1.5, 1 - opacity);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
