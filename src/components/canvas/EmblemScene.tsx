'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';

// Deterministic pseudo-random generator for pure rendering
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// Procedural arena embers (particles)
function ArenaEmbers({ count = 180, reducedMotion = false }: { count?: number; reducedMotion?: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Deterministic cylindrical distribution around arena
      const r1 = pseudoRandom(i * 4 + 1);
      const r2 = pseudoRandom(i * 4 + 2);
      const r3 = pseudoRandom(i * 4 + 3);
      const r4 = pseudoRandom(i * 4 + 4);

      const angle = r1 * Math.PI * 2;
      const radius = 1.2 + r2 * 3.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (r3 - 0.5) * 6; // Y spread
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      spd[i] = 0.3 + r4 * 0.7; // Upward velocity
    }
    return [pos, spd];
  }, [count]);

  useFrame((_, delta) => {
    if (reducedMotion || !pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const array = posAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3 + 1;
      array[idx] += speeds[i] * delta;
      // Wrap around when rising past upper boundary
      if (array[idx] > 3.5) {
        array[idx] = -3.5;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#ff7a1a"
        transparent
        opacity={0.75}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// 12 Arena District Spoke Markers
function ArenaDial({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const dialRef = useRef<THREE.Group>(null);
  const spokes = useMemo(() => {
    const items = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      items.push({
        id: i,
        x: Math.cos(angle) * 2.35,
        y: Math.sin(angle) * 2.35,
        rotZ: angle,
      });
    }
    return items;
  }, []);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (dialRef.current) {
      dialRef.current.rotation.z -= delta * 0.05;
    }
  });

  return (
    <group ref={dialRef}>
      {/* 12 segment markers around outer perimeter */}
      {spokes.map((spoke) => (
        <mesh key={spoke.id} position={[spoke.x, spoke.y, 0]} rotation={[0, 0, spoke.rotZ]}>
          <boxGeometry args={[0.08, 0.02, 0.04]} />
          <meshStandardMaterial
            color="#d4af37"
            emissive="#d4af37"
            emissiveIntensity={0.6}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}

      {/* Segmented outer ring */}
      <mesh>
        <torusGeometry args={[2.35, 0.012, 16, 72]} />
        <meshStandardMaterial color="#8b0000" emissive="#ff4500" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

// Central Arena Structure: Cornucopia/Capitol Emblem core with kinetic rings
function ArenaEmblemCore({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const midRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);
  const cageRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = t * 0.25;
      outerRingRef.current.rotation.y = t * 0.35;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.x = -t * 0.3;
      midRingRef.current.rotation.z = t * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.position.y = Math.sin(t * 1.5) * 0.08;
    }
    if (cageRef.current) {
      cageRef.current.rotation.x = -t * 0.2;
      cageRef.current.rotation.y = -t * 0.45;
    }
  });

  return (
    <group>
      {/* Center Levitating Core Emblem */}
      <group ref={coreRef}>
        {/* Solid faceted geometric center */}
        <mesh>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial
            color="#d4af37"
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={1.2}
          />
        </mesh>

        {/* Inner pulsing energy diamond */}
        <mesh scale={0.5}>
          <octahedronGeometry args={[0.85, 0]} />
          <meshBasicMaterial color="#ff4500" wireframe />
        </mesh>

        {/* Outer wireframe protective cage */}
        <mesh ref={cageRef} scale={1.25}>
          <icosahedronGeometry args={[0.9, 0]} />
          <meshStandardMaterial
            color="#e5e5e5"
            metalness={0.8}
            roughness={0.2}
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      </group>

      {/* Dynamic Gimbal Rings */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[1.75, 0.025, 16, 64]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={midRingRef}>
        <torusGeometry args={[1.4, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#ff4500"
          emissive="#8b0000"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// Main Interactive Scene Component with pointer & orientation parallax
export default function EmblemScene() {
  const sceneGroupRef = useRef<THREE.Group>(null);
  const shouldReduceMotion = useReducedMotion();
  const reducedMotion = Boolean(shouldReduceMotion);

  // Interaction target coordinates (normalized -1 to 1)
  const targetX = useRef(0);
  const targetY = useRef(0);
  const hasOrientation = useRef(false);

  useEffect(() => {
    // 1. Desktop Pointer Move
    const handlePointerMove = (e: MouseEvent) => {
      if (hasOrientation.current) return; // Prioritize orientation if active
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      targetX.current = nx * 0.85;
      targetY.current = ny * 0.65;
    };

    // 2. Mobile Device Orientation
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        hasOrientation.current = true;
        // gamma: left to right [-90, 90]
        // beta: front to back [-180, 180] (natural phone tilt ~ 45 deg)
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(0, Math.min(90, e.beta - 40));

        targetX.current = (clampedGamma / 45) * 0.5;
        targetY.current = -(clampedBeta / 45) * 0.4;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Safely check deviceorientation availability
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // Modern iOS permission guard if needed
      const maybeRequest = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
      if (typeof maybeRequest === 'function') {
        // Safe check without forcing alert on initial page load
        maybeRequest()
          .then((permissionState) => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation, { passive: true });
            }
          })
          .catch(() => {
            // Permission rejected or prompt blocked; graceful fallback to ambient animation
          });
      } else {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      }
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useFrame((state, delta) => {
    if (!sceneGroupRef.current) return;

    // Smooth spring lerp for orientation/pointer responsiveness
    const smoothFactor = Math.min(delta * 2.8, 1);
    // When prefers-reduced-motion is active, disable ambient sway while keeping pointer parallax functional
    const ambientSwayX = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    const ambientSwayY = reducedMotion ? 0 : Math.cos(state.clock.elapsedTime * 0.8) * 0.06;

    const finalTargetX = targetX.current + ambientSwayX;
    const finalTargetY = targetY.current + ambientSwayY;

    sceneGroupRef.current.rotation.y = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.y,
      finalTargetX,
      smoothFactor
    );
    sceneGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      sceneGroupRef.current.rotation.x,
      -finalTargetY,
      smoothFactor
    );
  });

  return (
    <>
      {/* Lighting Rig tailored for Hunger Games Gold & Crimson theme */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 8, 5]} intensity={1.8} color="#ffd700" />
      <directionalLight position={[-6, -4, -3]} intensity={1.2} color="#8b0000" />
      <pointLight position={[0, 0, 0]} intensity={2.2} color="#ff4500" distance={6} />

      {/* Interactive Parallax Pivot */}
      <group ref={sceneGroupRef}>
        <ArenaEmblemCore reducedMotion={reducedMotion} />
        <ArenaDial reducedMotion={reducedMotion} />
        <ArenaEmbers count={160} reducedMotion={reducedMotion} />
      </group>
    </>
  );
}
