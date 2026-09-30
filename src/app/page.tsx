'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, TorusKnot } from '@react-three/drei';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const problemStatements = [
  { id: 1, title: 'Resource Scarcity Simulator', desc: 'Build an AI model that optimally distributes limited food and supplies across 12 distinct districts, minimizing starvation while prioritizing capital tribute.' },
  { id: 2, title: 'Tracker Jacker Drone Protocol', desc: 'Design an autonomous swarm algorithm for drones to map heavily forested terrain without relying on GPS, mimicking the erratic but coordinated flight of tracker jackers.' },
  { id: 3, title: 'Arena Weather Manipulation', desc: 'Develop a fast-running fluid dynamics simulation capable of rendering sudden extreme weather events (fireballs, floods, acid fog) in real-time.' },
  { id: 4, title: 'Tribute Biometric Monitoring', desc: 'Create a low-latency dashboard that visualizes heart rate, adrenaline, and injury data from 24 combatants simultaneously over a lossy network connection.' },
  { id: 5, title: 'Sponsor Favor Matching System', desc: 'Implement a marketplace matchmaking algorithm that connects wealthy sponsors with tributes in real-time, optimizing for maximum audience engagement.' },
  { id: 6, title: 'Forcefield Breach Detection', desc: 'Write a computer vision script to instantly detect and localize micro-fractures in an invisible energetic barrier based on subtle light refraction patterns.' },
];

const timeline = [
  { date: 'Oct 15', event: 'Reaping Day (Registration Opens)' },
  { date: 'Nov 1', event: 'Training Center (Registration Closes)' },
  { date: 'Nov 5', event: 'Interviews (PPT Submissions Due)' },
  { date: 'Nov 10', event: 'The Arena (Hackathon Commences)' },
];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <main ref={containerRef}>
      {/* Hero Section with 3D Background */}
      <section style={{ height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} color="#d4af37" />
            <TorusKnot args={[1, 0.3, 128, 16]} rotation={[0.5, 0.5, 0]}>
              <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} wireframe />
            </TorusKnot>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
          </Canvas>
        </div>
        
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at center, transparent 0%, var(--background) 100%)',
          textAlign: 'center'
        }}>
          <motion.h1 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            style={{ fontSize: '5rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}
          >
            May The Code Be<br/>Ever In Your Favor
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
            style={{ fontSize: '1.5rem', maxWidth: '600px' }}
          >
            Welcome to the 75th Annual Industry Games. Form your alliances, prepare your algorithms, and fight for survival in the ultimate coding arena.
          </motion.p>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="container" style={{ padding: '8rem 2rem' }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--accent-red)', textAlign: 'center', marginBottom: '4rem' }}>The Schedule</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {timeline.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              style={{
                background: 'var(--panel-bg)',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                borderTop: '4px solid var(--accent-gold)',
                textAlign: 'center'
              }}
            >
              <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.5rem' }}>{item.date}</h3>
              <p>{item.event}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem Statements Section */}
      <section id="problems" className="container" style={{ padding: '4rem 2rem 8rem 2rem' }}>
        <h2 style={{ fontSize: '3rem', color: 'var(--accent-gold)', textAlign: 'center', marginBottom: '4rem' }}>Problem Statements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {problemStatements.map((prob, idx) => (
            <motion.div 
              key={prob.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, borderColor: 'var(--accent-gold)' }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              style={{
                background: 'rgba(20,20,20,0.5)',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer'
              }}
            >
              <div style={{ fontSize: '2rem', color: 'var(--accent-red)', opacity: 0.5, marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
                {String(prob.id).padStart(2, '0')}
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>{prob.title}</h3>
              <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{prob.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
