'use client';

import { motion } from 'framer-motion';
import HeroCanvas from '@/components/canvas/HeroCanvas';
import CountdownTimer from '@/components/CountdownTimer';
import TimelineSection from '@/components/landing/TimelineSection';
import ProblemCardsSection from '@/components/landing/ProblemCardsSection';
import AnnouncementsTicker from '@/components/announcements/AnnouncementsTicker';
import { EVENT_DEADLINE, EVENT_DEADLINE_LABEL } from '@/lib/event';

export default function Home() {
  return (
    <main>
      {/* Live Announcement Ticker */}
      <AnnouncementsTicker />

      {/* Hero Section with 3D Background */}
      <section style={{ minHeight: '100dvh', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <HeroCanvas />

        {/* Subtle Perspective Arena Grid Floor */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            opacity: 0.14,
            backgroundImage: `
              linear-gradient(rgba(212, 175, 55, 0.12) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 175, 55, 0.12) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 72%)',
            transform: 'perspective(650px) rotateX(24deg) scale(1.2)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        {/* Hero Content Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, rgba(10, 10, 10, 0.45) 0%, rgba(10, 10, 10, 0.85) 75%, var(--background) 100%)',
            textAlign: 'center',
            padding: '0 1.5rem',
            pointerEvents: 'none',
          }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="hero__title"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: 'var(--accent-gold)',
              marginBottom: '1rem',
              textShadow: '0 0 35px rgba(212, 175, 55, 0.3)',
            }}
          >
            May The Code Be<br />Ever In Your Favor
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.5rem)',
              maxWidth: '600px',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
            }}
          >
            Welcome to the 75th Annual Industry Games. Form your alliances, prepare your algorithms, and fight for survival in the ultimate coding arena.
          </motion.p>

          {/* Event Countdown Timer from main */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            style={{
              marginTop: '2rem',
              pointerEvents: 'auto',
            }}
          >
            <CountdownTimer
              deadline={EVENT_DEADLINE}
              variant="hero"
              label={EVENT_DEADLINE_LABEL}
            />
          </motion.div>

          {/* Hero Action CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.8 }}
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
              pointerEvents: 'auto',
            }}
          >
            <a
              href="#problems"
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
              }}
            >
              EXPLORE THE ARENA <span aria-hidden="true">↗</span>
            </a>
            <a
              href="#timeline"
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
              }}
            >
              VIEW THE SCHEDULE
            </a>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection />

      {/* Problem Statements Section */}
      <ProblemCardsSection />
    </main>
  );
}
