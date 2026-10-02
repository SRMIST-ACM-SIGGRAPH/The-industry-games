'use client';

import { Suspense, useSyncExternalStore } from 'react';
import { Canvas } from '@react-three/fiber';
import EmblemScene from './EmblemScene';

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function CanvasFallback() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '2px solid rgba(212, 175, 55, 0.15)',
          borderTopColor: 'var(--accent-gold)',
          animation: 'spin 1.5s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function HeroCanvas() {
  const isClient = useIsClient();

  if (!isClient) {
    return <CanvasFallback />;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none', // Crucial: ensure mobile touch scroll and pointer clicks pass through effortlessly
      }}
    >
      <Suspense fallback={<CanvasFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{
            powerPreference: 'high-performance',
            antialias: true,
            alpha: true,
            depth: true,
          }}
          style={{ width: '100%', height: '100%' }}
        >
          <EmblemScene />
        </Canvas>
      </Suspense>
    </div>
  );
}
