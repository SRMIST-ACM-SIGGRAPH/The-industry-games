'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Sponsor {
  id: string;
  name: string;
  category: 'TITLE SPONSOR' | 'FOOD SPONSOR' | 'INTERNSHIP SPONSOR' | 'COMMUNITY PARTNER';
  badgeType: 'title' | 'food' | 'internship' | 'partner';
  logo: string;
  subtitle: string;
  description: string;
}

const SPONSORS: Sponsor[] = [
  {
    id: 'hamdard',
    name: 'Hamdard',
    category: 'TITLE SPONSOR',
    badgeType: 'title',
    logo: '/logo/hamdard.png',
    subtitle: 'Presenting Benefactor',
    description: 'Pioneering natural wellness, health, and trusted food innovations across India.',
  },
  {
    id: 'rooh-afza',
    name: 'Rooh Afza',
    category: 'TITLE SPONSOR',
    badgeType: 'title',
    logo: '/logo/rooh-afza.png',
    subtitle: 'Official Refreshment Partner',
    description: 'The legendary elixir powering high-energy focus and vitality in the arena.',
  },
  {
    id: 'ark-bistro',
    name: 'Ark Bistro',
    category: 'FOOD SPONSOR',
    badgeType: 'food',
    logo: '/logo/ark-bistro.png',
    subtitle: 'Official Sustenance Partner',
    description: 'Fueling tributes through the 24-hour hackathon with gourmet culinary nourishment.',
  },
  {
    id: 'spazor-labs',
    name: 'Spazor Labs',
    category: 'INTERNSHIP SPONSOR',
    badgeType: 'internship',
    logo: '/logo/Spazorlabs.jpg',
    subtitle: 'Career Accelerator Partner',
    description: 'Offering premier internship pathways in modern software engineering and systems.',
  },
  {
    id: 'qualcs-1',
    name: 'Qualcs - I',
    category: 'INTERNSHIP SPONSOR',
    badgeType: 'internship',
    logo: '/logo/Qulacs-1.png',
    subtitle: 'Tech Innovation Partner',
    description: 'Exciting internship opportunities for top-ranking arena problem solvers and developers.',
  },
  {
    id: 'atom-talk',
    name: 'Atom Talk',
    category: 'INTERNSHIP SPONSOR',
    badgeType: 'internship',
    logo: '/logo/atomtalk.svg',
    subtitle: 'Industry Fellowship Partner',
    description: 'Fast-track industry mentorship and development fellowships for standout tributes.',
  },
  {
    id: 'altygen-biopharm',
    name: 'Altygen Biopharm',
    category: 'INTERNSHIP SPONSOR',
    badgeType: 'internship',
    logo: '/logo/altygen-biopharm.png',
    subtitle: 'Applied Tech Partner',
    description: 'Innovative internships bridging computational intelligence and modern biotechnology.',
  },
  {
    id: 'dcc',
    name: 'DCC',
    category: 'COMMUNITY PARTNER',
    badgeType: 'partner',
    logo: '/logo/DCC.jpg',
    subtitle: 'Ecosystem Partner',
    description: 'Empowering developer communities with collaborative resources and mentorship.',
  },
];

export default function SponsorsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Update visible card count based on screen width
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const maxIndex = Math.max(0, SPONSORS.length - visibleCount);

  // Reset index if visible count changes and index exceeds maxIndex
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-slide every 3.5 seconds when not paused by user
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(interval);
  }, [handleNext, isPaused]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="sponsors"
      className="sponsors-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Official Sponsors and Arena Benefactors"
    >
      <div className="container">
        {/* Section Header */}
        <div className="sponsors-header">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sponsors-pill-tag"
          >
            ARENA BENEFACTORS
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="sponsors-title"
          >
            OFFICIAL SPONSORS & PARTNERS
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="sponsors-subtitle"
          >
            Powering the 1st Annual Industry Games with premier internships, sustenance, and career opportunities.
          </motion.p>
        </div>

        {/* Carousel Window Container */}
        <div className="sponsors-carousel-wrapper">
          {/* Navigation Prev Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="sponsors-nav-btn sponsors-nav-prev"
            aria-label="Previous sponsors"
            title="Previous sponsors"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Sliding Viewport */}
          <div className="sponsors-viewport">
            <motion.div
              className="sponsors-track"
              animate={{
                x: `-${currentIndex * (100 / visibleCount)}%`,
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 32,
              }}
            >
              {SPONSORS.map((sponsor) => (
                <div
                  key={sponsor.id}
                  className="sponsor-slide-col"
                  style={{ flex: `0 0 ${100 / visibleCount}%` }}
                >
                  <div className={`sponsor-card sponsor-card-${sponsor.badgeType}`}>
                    {/* Badge */}
                    <div className="sponsor-badge-row">
                      <span className={`sponsor-badge sponsor-badge-${sponsor.badgeType}`}>
                        {sponsor.category}
                      </span>
                    </div>

                    {/* Logo Box */}
                    <div className="sponsor-logo-container">
                      <img
                        src={sponsor.logo}
                        alt={`${sponsor.name} Logo`}
                        className="sponsor-logo-img"
                        loading="lazy"
                      />
                    </div>

                    {/* Information */}
                    <div className="sponsor-info">
                      <h3 className="sponsor-name">{sponsor.name}</h3>
                      <span className="sponsor-sub">{sponsor.subtitle}</span>
                      <p className="sponsor-desc">{sponsor.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Next Button */}
          <button
            type="button"
            onClick={handleNext}
            className="sponsors-nav-btn sponsors-nav-next"
            aria-label="Next sponsors"
            title="Next sponsors"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Dots Pagination */}
        <div className="sponsors-dots" role="tablist" aria-label="Sponsors Carousel Pagination">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`sponsor-dot ${currentIndex === idx ? 'sponsor-dot-active' : ''}`}
              aria-label={`Go to slide ${idx + 1}`}
              aria-selected={currentIndex === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
