'use client';

import { motion } from 'framer-motion';

export interface ProblemStatement {
  id: number;
  title: string;
  desc: string;
}

interface ProblemCardProps {
  problem: ProblemStatement;
  index: number;
}

export default function ProblemCard({ problem, index }: ProblemCardProps) {
  const formattedId = String(problem.id).padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 35 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(25, 25, 25, 0.85) 0%, rgba(12, 12, 12, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '4px',
        padding: '2.25rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        cursor: 'default',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6)',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className="arena-problem-card"
    >
      {/* Top golden glowing indicator line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, var(--accent-gold) 50%, transparent 100%)',
          opacity: 0.8,
        }}
      />

      {/* Decorative corner notch */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '18px',
          height: '18px',
          borderTop: '2px solid var(--accent-gold)',
          borderRight: '2px solid var(--accent-gold)',
        }}
      />

      <div>
        {/* District Sector Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              lineHeight: 1,
              letterSpacing: '0.05em',
              textShadow: '0 0 15px rgba(212, 175, 55, 0.4)',
            }}
          >
            {formattedId}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent-orange)',
              fontFamily: 'var(--font-display)',
              opacity: 0.85,
            }}
          >
            {`Arena Challenge`}
          </span>
        </div>

        {/* Challenge Title */}
        <h3
          style={{
            fontSize: '1.35rem',
            color: '#fff',
            marginBottom: '1rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.04em',
            lineHeight: 1.35,
          }}
        >
          {problem.title}
        </h3>

        {/* Challenge Description */}
        <p
          style={{
            color: '#b5b5b5',
            fontSize: '0.95rem',
            lineHeight: 1.65,
          }}
        >
          {problem.desc}
        </p>
      </div>

      {/* Card Footer status indicator */}
      <div
        style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(212, 175, 55, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-gold)',
            opacity: 0.8,
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-gold)',
              boxShadow: '0 0 8px var(--accent-gold)',
              display: 'inline-block',
            }}
          />
          District Briefing Open
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'var(--font-display)',
          }}
        >
          0{index + 1}/05
        </span>
      </div>
    </motion.div>
  );
}
