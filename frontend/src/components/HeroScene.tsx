import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const basePairs = 20;
  const radius = 2;
  const height = 8;
  const turns = 2;

  const { strand1, strand2, rungs } = useMemo(() => {
    const s1: THREE.Vector3[] = [];
    const s2: THREE.Vector3[] = [];
    const r: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];

    for (let i = 0; i < basePairs; i++) {
      const t = i / (basePairs - 1);
      const angle = t * Math.PI * 2 * turns;
      const y = (t - 0.5) * height;

      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);

      s1.push(p1);
      s2.push(p2);
      r.push({ from: p1, to: p2 });
    }

    return { strand1: s1, strand2: s2, rungs: r };
  }, []);

  const sphereMat1 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#90cdf4",
        transparent: true,
        opacity: 0.85,
        roughness: 0.3,
        metalness: 0.1,
      }),
    []
  );

  const sphereMat2 = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.8,
        roughness: 0.3,
        metalness: 0.1,
      }),
    []
  );

  const rungMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.35,
        roughness: 0.5,
        metalness: 0,
      }),
    []
  );

  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.18, 12, 12), []);
  const rungGeom = useMemo(() => new THREE.CylinderGeometry(0.04, 0.04, 1, 6), []);

  return (
    <group ref={groupRef}>
      {/* Strand 1 spheres */}
      {strand1.map((pos, i) => (
        <mesh key={`s1-${i}`} position={pos} geometry={sphereGeom} material={sphereMat1} />
      ))}

      {/* Strand 2 spheres */}
      {strand2.map((pos, i) => (
        <mesh key={`s2-${i}`} position={pos} geometry={sphereGeom} material={sphereMat2} />
      ))}

      {/* Connecting rungs */}
      {rungs.map(({ from, to }, i) => {
        const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(to, from);
        const len = dir.length();
        dir.normalize();

        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

        return (
          <mesh
            key={`r-${i}`}
            position={mid}
            quaternion={quat}
            scale={[1, len, 1]}
            geometry={rungGeom}
            material={rungMat}
          />
        );
      })}
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#90cdf4" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#ffffff" />
        <DNAHelix />
      </Canvas>
    </div>
  );
}
