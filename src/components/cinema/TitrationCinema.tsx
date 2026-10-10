"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";

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

export function TitrationCinema({
  colour,
  level,
  onFallback,
}: {
  colour: string;
  level: number;
  onFallback: () => void;
}) {
  return (
    <div style={{ height: 360, background: "#d7c7a8", borderRadius: 18 }}>
      <Canvas camera={{ position: [1.6, 1.4, 2.4], fov: 45 }}>
        <color attach="background" args={["#d7c7a8"]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[2, 3, 2]} />
        <mesh position={[-0.6, 0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 20]} />
          <meshStandardMaterial color="#f7f4ee" transparent opacity={0.85} />
        </mesh>
        <mesh position={[-0.6, -0.2 + level * 0.4, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.5, 16]} />
          <meshStandardMaterial color="#d7ecf8" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.55, -0.15, 0]}>
          <coneGeometry args={[0.45, 0.7, 24]} />
          <meshStandardMaterial color={colour} />
        </mesh>
        <OrbitControls enablePan={false} />
        <Watch onFallback={onFallback} />
      </Canvas>
    </div>
  );
}
