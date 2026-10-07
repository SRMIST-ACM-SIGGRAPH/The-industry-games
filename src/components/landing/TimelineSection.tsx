'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export const TIMELINE_EVENTS = [
  {
    id: 1,
    phase: 'Phase 01',
    date: 'Oct 03',
    event: 'Reaping Day (Registration Opens)',
    subtitle: 'SRMIST District Enrollment & Tributes Roster',
  },
  {
    id: 2,
    phase: 'Phase 02',
    date: 'Oct 08',
    event: 'Training Center (Registration Closes)',
    subtitle: 'Alliance Lockdown & Final Team Submission',
  },
  {
    id: 3,
    phase: 'Phase 03',
    date: 'Oct 08',
    event: 'Tribute Selection (Results Announced)',
    subtitle: 'Shortlisted Alliances Announced for the Arena',
  },
  {
    id: 4,
    phase: 'Phase 04',
    date: 'Oct 09',
    event: 'The Arena (Event Day)',
    subtitle: 'The Cornucopia Opens — Live Hackathon & Gamemaker Evaluation',
  },
  {
    id: 5,
    phase: 'Phase 05',
    date: 'Oct 10',
    event: "The Victor's Crowning (Final Day)",
    subtitle: 'Capitol Grand Finale — Project Pitches, Gamemaker Judgment & Awarding the Victor',
  },
];

export default function TimelineSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Connect Framer Motion's useScroll to this section
  // Works seamlessly with Lenis since Lenis updates window.scrollY smoothly
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 65%', 'end 80%'],
  });

  // Smooth the scroll line progress for a fluid visual feel
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const progressGlow = useTransform(
    scaleY,
    [0, 1],
    ['0 0 10px rgba(212, 175, 55, 0.3)', '0 0 25px rgba(255, 69, 0, 0.7)']
  );

  return (
    <section
      ref={sectionRef}
      id="timeline"
      className="container timeline-container"
      style={{
        position: 'relative',
        padding: '7rem 1.5rem 8rem 1.5rem',
        overflow: 'hidden',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
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
          {'Arena Milestones - The Protocol'}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            color: 'var(--accent-red)',
            textShadow: '0 0 25px rgba(139, 0, 0, 0.5)',
            marginBottom: '1rem',
          }}
        >
          The Schedule
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            color: '#9e9e9e',
            maxWidth: '600px',
            margin: '0 auto',
            fontSize: '1rem',
            lineHeight: 1.6,
          }}
        >
          Keep vigilant watch over the timeline. Missing a milestone marks immediate disqualification from the games.
        </motion.p>
      </div>

      {/* Interactive Timeline Wrapper */}
      <div className="timeline-track-wrapper">
        {/* Background Guide Line */}
        <div className="timeline-track-bg" />

        {/* Scroll-Driven Active Progress Line */}
        <motion.div
          className="timeline-track-progress"
          style={{
            scaleY,
            boxShadow: progressGlow,
          }}
        />

        {/* Timeline Event Nodes */}
        <div className="timeline-events-list">
          {TIMELINE_EVENTS.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div key={item.id} className={`timeline-row ${isEven ? 'timeline-row-even' : 'timeline-row-odd'}`}>
                {/* Center Milestone Beacon / Node */}
                <div className="timeline-beacon-wrap">
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="timeline-beacon-outer"
                  >
                    <div className="timeline-beacon-inner" />
                  </motion.div>
                </div>

                {/* Event Card Content */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  className="timeline-card"
                >
                  {/* Phase & Date Badge */}
                  <div className="timeline-card-header">
                    <span className="timeline-card-phase">{item.phase}</span>
                    <span className="timeline-card-date">{item.date}</span>
                  </div>

                  {/* Main Event Title */}
                  <h3 className="timeline-card-title">{item.event}</h3>

                  {/* Subtitle / Description */}
                  <p className="timeline-card-subtitle">{item.subtitle}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vanilla CSS styles for timeline layout and responsiveness */}
      <style>{`
        .timeline-track-wrapper {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 0;
        }

        /* Central Background Track Line */
        .timeline-track-bg {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          transform: translateX(-50%);
          background: rgba(212, 175, 55, 0.15);
          border-radius: 2px;
        }

        /* Active Scroll-Driven Glowing Line */
        .timeline-track-progress {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 3px;
          transform: translateX(-50%);
          transform-origin: top;
          background: linear-gradient(to bottom, var(--accent-gold) 0%, var(--accent-orange) 60%, var(--accent-red) 100%);
          border-radius: 2px;
          z-index: 1;
        }

        .timeline-events-list {
          display: flex;
          flex-direction: column;
          gap: 4rem;
          position: relative;
          z-index: 2;
        }

        .timeline-row {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        /* Desktop: Even rows on left, Odd rows on right */
        .timeline-row-even {
          justify-content: flex-start;
          padding-right: 50%;
        }

        .timeline-row-odd {
          justify-content: flex-end;
          padding-left: 50%;
        }

        /* Milestone Beacon */
        .timeline-beacon-wrap {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
        }

        .timeline-beacon-outer {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--background);
          border: 2px solid var(--accent-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
        }

        .timeline-beacon-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent-orange);
          box-shadow: 0 0 8px var(--accent-orange);
        }

        /* Milestone Card */
        .timeline-card {
          width: calc(100% - 2.5rem);
          background: linear-gradient(135deg, rgba(20, 20, 20, 0.9) 0%, rgba(12, 12, 12, 0.95) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-top: 3px solid var(--accent-gold);
          padding: 2rem;
          border-radius: 4px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
          cursor: default;
        }

        .timeline-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .timeline-card-phase {
          font-family: var(--font-display);
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: var(--accent-orange);
          text-transform: uppercase;
        }

        .timeline-card-date {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-gold);
          text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
        }

        .timeline-card-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          color: #fff;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }

        .timeline-card-subtitle {
          color: #b5b5b5;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        /* Mobile Responsive Viewport adjustments */
        @media (max-width: 768px) {
          .timeline-track-bg,
          .timeline-track-progress {
            left: 20px;
            transform: none;
          }

          .timeline-row-even,
          .timeline-row-odd {
            justify-content: flex-start;
            padding-left: 50px;
            padding-right: 0;
          }

          .timeline-beacon-wrap {
            left: 20px;
            transform: translate(-50%, -50%);
          }

          .timeline-card {
            width: 100%;
            padding: 1.5rem;
          }

          .timeline-card-date {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </section>
  );
}
