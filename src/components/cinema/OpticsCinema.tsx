"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

function Watch({ onFallback }: { onFallback: () => void }) {
  const frames = useRef(0);
  const started = useRef<number | null>(null);
  useFrame(() => {
    frames.current += 1;
    if (started.current === null) started.current = performance.now();
    const elapsed = performance.now() - started.current;
    if (elapsed > 1200 && frames.current / (elapsed / 1000) < 20) onFallback();
  });
  return null;
}

export function OpticsCinema({
  objectCm,
  lensCm,
  pinCm,
  imageCm,
  onFallback,
}: {
  objectCm: number;
  lensCm: number;
  pinCm: number;
  imageCm: number | null;
  onFallback: () => void;
}) {
  const x = (cm: number) => (cm - 50) / 18;
  useEffect(() => {
    const timer = window.setTimeout(() => undefined, 0);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div style={{ height: 360, background: "#d7c7a8", borderRadius: 18 }}>
      <Canvas camera={{ position: [2.2, 1.4, 3.2], fov: 45 }}>
        <color attach="background" args={["#d7c7a8"]} />
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 2]} intensity={1.1} />
        <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[6.2, 0.7, 0.12]} />
          <meshStandardMaterial color="#c4a574" />
        </mesh>
        <mesh position={[x(objectCm), 0.35, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#1d3c72" />
        </mesh>
        <mesh position={[x(lensCm), 0.35, 0]}>
          <sphereGeometry args={[0.18, 24, 16]} />
          <meshStandardMaterial color="#d9ecff" transparent opacity={0.7} />
        </mesh>
        <mesh position={[x(pinCm), 0.35, 0.12]}>
          <cylinderGeometry args={[0.02, 0.02, 0.9, 8]} />
          <meshStandardMaterial color="#b85a12" />
        </mesh>
        {imageCm !== null && (
          <mesh position={[x(imageCm), 0.35, -0.12]}>
            <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
            <meshStandardMaterial color="#1d6a45" transparent opacity={0.45} />
          </mesh>
        )}
        <OrbitControls enablePan={false} />
        <Watch onFallback={onFallback} />
      </Canvas>
    </div>
  );
}
