'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { fetchResultsAnnounced } from '@/lib/evaluation';
import { TIMELINE_EVENTS } from '@/components/landing/TimelineSection';

type Outcome = 'shortlisted' | 'not-selected' | null;

// Final-round schedule is taken from the landing-page timeline (Oct 9 + Oct 10).
const FINALE = TIMELINE_EVENTS.filter((e) => e.date === 'Oct 09' || e.date === 'Oct 10');

export default function ResultsPanel({ evalStatus }: { evalStatus?: string | null }) {
  const [announced, setAnnounced] = useState(false);

  useEffect(() => {
    let active = true;
    fetchResultsAnnounced()
      .then((v) => active && setAnnounced(v))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Only rendered for submitted teams. Unevaluated (pending) teams see nothing;
  // everything else that is not shortlisted (staged, rejected) is non-selected.
  const outcome: Outcome =
    !announced || !evalStatus || evalStatus === 'pending' ? null : evalStatus === 'shortlisted' ? 'shortlisted' : 'not-selected';

  if (!outcome) return null;

  if (outcome === 'shortlisted') {
    return (
      <motion.section className="panel results-card results-card--gold" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="results-badge"><Trophy size={16} /> Finalist Qualifier</div>
        <h2 className="panel__title">Your alliance has been chosen for the Final Showcase</h2>
        <p className="results-text">
          The Gamemakers were impressed. Prepare to present your project at the Capitol Grand Finale on October 10th.
        </p>
        <ul className="results-timetable">
          {FINALE.map((e) => (
            <li key={e.id}>
              <span className="results-date">{e.date}</span>
              <span><strong>{e.event}</strong><br />{e.subtitle}</span>
            </li>
          ))}
        </ul>
      </motion.section>
    );
  }

  return (
    <motion.section className="panel results-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="panel__title">Capitol Transmission</h2>
      <p className="results-text">
        The Capitol acknowledges your dedication and courage in the Arena. While your team was not selected for the final
        showcase, your work demonstrated exceptional technical grit. May the odds be ever in your favor.
      </p>
    </motion.section>
  );
}
