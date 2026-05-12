"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { easeOutQuart, easeInQuad } from "@/lib/utils";

const MODEL_PATH = "/models/dna.glb";
const TARGET_HEIGHT = 7;
const PEAK_HEIGHT = 4.5;
const DROWN_DEPTH = -6;

type DNAModelProps = {
  opacity: number;
  visible: boolean;
  morphProgress: number;
  rotationSpeed: number;
};

export function DNAModel({ opacity, visible, morphProgress, rotationSpeed }: DNAModelProps) {
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

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    groupRef.current.visible = visible;

    if (!visible) return;

    groupRef.current.rotation.y += delta * rotationSpeed;

    groupRef.current.scale.set(1, 1, 1);

    // Eased vertical movement:
    //   rise (0->0.5): easeOutQuart -- fast launch, slow near top
    //   fall (0.5->1): easeInQuad  -- slow start, accelerating gravity
    let posY: number;
    if (morphProgress <= 0.5) {
      const riseT = morphProgress * 2;
      posY = THREE.MathUtils.lerp(0, PEAK_HEIGHT, easeOutQuart(riseT));
    } else {
      const fallT = (morphProgress - 0.5) * 2;
      posY = THREE.MathUtils.lerp(PEAK_HEIGHT, DROWN_DEPTH, easeInQuad(fallT));
    }
    groupRef.current.position.y = posY;

    for (const mat of materialsRef.current) {
      mat.opacity = opacity;
      mat.emissiveIntensity = 0.8;
      mat.wireframe = true;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
