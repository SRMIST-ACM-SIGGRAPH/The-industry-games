'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLenis } from 'lenis/react';
import { motion } from 'framer-motion';
import HeroCanvas from '@/components/canvas/HeroCanvas';
import CountdownTimer from '@/components/CountdownTimer';
import TimelineSection from '@/components/landing/TimelineSection';
import ProblemCardsSection from '@/components/landing/ProblemCardsSection';
import SponsorsSection from '@/components/landing/SponsorsSection';
import { EVENT_DEADLINE, EVENT_DEADLINE_LABEL, isRegistrationClosed } from '@/lib/event';

export default function Home() {
  const lenis = useLenis();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    setClosed(isRegistrationClosed());
    const interval = setInterval(() => {
      setClosed(isRegistrationClosed());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id: string) => {
    if (lenis) {
      lenis.scrollTo(id);
    } else {
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <main>
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
              marginTop: '4rem',
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
            Welcome to the 1st Annual Industry Games. Form your alliances, prepare your algorithms, and fight for survival in the ultimate coding arena.
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
              flexDirection: 'column',
              gap: '1.5rem',
              marginTop: '2rem',
              alignItems: 'center',
              pointerEvents: 'auto',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={(e) => { e.preventDefault(); scrollTo('#problems'); }}
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
              </button>
              <Link
                href="/login"
                className="btn"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  opacity: closed ? 0.8 : 1,
                  border: closed ? '1px solid rgba(212, 175, 55, 0.4)' : undefined,
                }}
              >
                {closed ? 'REGISTRATIONS CLOSED' : 'REGISTER'}
              </Link>
            </div>
            
            <button
              onClick={(e) => { e.preventDefault(); scrollTo('#timeline'); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-gold)',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.1em',
                padding: '0.5rem',
                transition: 'opacity 0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              VIEW THE SCHEDULE
            </button>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <TimelineSection />

      {/* Arena Awaits Text Separator */}
      <section style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8rem 1.5rem', textAlign: 'center' }}>
        <motion.img 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          src="/mockingjay-logo.jpg" 
          alt="Mockingjay Logo" 
          style={{ width: '120px', height: '120px', borderRadius: '50%', marginBottom: '2rem', objectFit: 'cover', boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)' }}
        />
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            color: 'var(--accent-gold)', 
            fontFamily: 'var(--font-display)',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            marginBottom: '2rem',
            letterSpacing: '0.05em'
          }}
        >
          THE ARENA AWAITS
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ 
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
            letterSpacing: '0.2em', 
            lineHeight: 2,
            color: '#ccc',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase'
          }}
        >
          <div>Choose Your District.</div>
          <div>Forge Your Solution.</div>
          <div style={{ color: 'var(--accent-orange)', marginTop: '0.5rem', fontWeight: 'bold' }}>Claim The Crown.</div>
        </motion.div>
      </section>

      {/* Problem Statements Section */}
      <ProblemCardsSection />

      {/* Arena Benefactors & Sponsors Carousel */}
      <SponsorsSection />
    </main>
  );
}
