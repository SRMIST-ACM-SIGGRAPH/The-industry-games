'use client';

import { motion } from 'framer-motion';
import ProblemCard, { ProblemStatement } from './ProblemCard';

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  {
    id: 2,
    title: 'District 02: Project Portfolio Management & Risk Monitoring Platform',
    desc: 'Develop a Project Portfolio Management (PPM) platform for a fire and rescue organization to manage multiple projects, track their progress, identify risks, and provide management with a consolidated view of portfolio performance.',
  },
  {
    id: 3,
    title: 'District 03: AI-Powered Lead Generation & Sales Automation Platform',
    desc: 'Develop an AI-powered sales intelligence and lead automation platform that can identify potential customers, research companies, qualify leads, prepare personalized outreach, and track opportunities.',
  },
  {
    id: 4,
    title: 'District 04: AI-Native Education OS for Intelligent Doubt Resolution',
    desc: 'Build an AI-powered education platform that helps students receive the right assistance for their doubts at the right time using AI explanations, practice, or relevant human teachers.',
  },
  {
    id: 5,
    title: 'District 05: AI-Native EMR for Intelligent Clinical Assistance',
    desc: 'Develop an AI-powered Electronic Medical Record platform that helps healthcare professionals capture, organize, understand, and retrieve patient information efficiently.',
  },
  {
    id: 6,
    title: 'District 06: Intelligent Business Operations & Customer Engagement',
    desc: 'Build a smart and scalable business management platform that intelligently leverages organizational and customer data to streamline operations, automate routine processes, and identify actionable business opportunities.',
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
