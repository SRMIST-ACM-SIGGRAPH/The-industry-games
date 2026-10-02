'use client';

import { motion } from 'framer-motion';
import ProblemCard, { ProblemStatement } from './ProblemCard';

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 1,
    title: 'Resource Scarcity Simulator',
    desc: 'Build an AI model that optimally distributes limited food and supplies across 12 distinct districts, minimizing starvation while prioritizing capital tribute.',
  },
  {
    id: 2,
    title: 'Tracker Jacker Drone Protocol',
    desc: 'Design an autonomous swarm algorithm for drones to map heavily forested terrain without relying on GPS, mimicking the erratic but coordinated flight of tracker jackers.',
  },
  {
    id: 3,
    title: 'Arena Weather Manipulation',
    desc: 'Develop a fast-running fluid dynamics simulation capable of rendering sudden extreme weather events (fireballs, floods, acid fog) in real-time.',
  },
  {
    id: 4,
    title: 'Tribute Biometric Monitoring',
    desc: 'Create a low-latency dashboard that visualizes heart rate, adrenaline, and injury data from 24 combatants simultaneously over a lossy network connection.',
  },
  {
    id: 5,
    title: 'Sponsor Favor Matching System',
    desc: 'Implement a marketplace matchmaking algorithm that connects wealthy sponsors with tributes in real-time, optimizing for maximum audience engagement.',
  },
  {
    id: 6,
    title: 'Forcefield Breach Detection',
    desc: 'Write a computer vision script to instantly detect and localize micro-fractures in an invisible energetic barrier based on subtle light refraction patterns.',
  },
];

export default function ProblemCardsSection() {
  return (
    <section id="problems" className="container" style={{ padding: '6rem 1.5rem 8rem 1.5rem' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--accent-orange)',
            display: 'block',
            marginBottom: '0.75rem',
          }}
        >
          {'Arena Directive // 6 Sectors'}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            color: 'var(--accent-gold)',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.3)',
            marginBottom: '1rem',
          }}
        >
          Problem Statements
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            color: '#9e9e9e',
            maxWidth: '650px',
            margin: '0 auto',
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          Each district presents a distinct engineering trial designed by the Gamemakers. Choose your battleground and formulate your winning strategy.
        </motion.p>
      </div>

      {/* 6 Problem Statement Cards Responsive Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: '2rem',
          width: '100%',
        }}
      >
        {PROBLEM_STATEMENTS.map((prob, idx) => (
          <ProblemCard key={prob.id} problem={prob} index={idx} />
        ))}
      </div>
    </section>
  );
}
