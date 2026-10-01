'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getProfile, isProfileComplete, Profile } from '@/lib/profile';
import CountdownTimer from '@/components/CountdownTimer';
import { EVENT_DEADLINE, EVENT_DEADLINE_LABEL } from '@/lib/event';

// Minimal shape of an alliance/team as the dashboard needs to *render* it.
// The real team data + create/join logic is owned by Pod 3 (Issue #5); this
// dashboard only displays it. Until #5 lands, `team` stays null and the
// "no alliance" empty state is shown.
interface TeamView {
  name: string;
  teamCode: string;
  members: { id: string; name: string }[];
  submissionReady: boolean;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Owned by Pod 3 (#5). Hard-coded null so the empty state renders without
  // duplicating team backend logic that belongs to another pod.
  const [team] = useState<TeamView | null>(null);

  // Route guard: not logged in -> /login; logged in but profile incomplete
  // -> /onboarding; otherwise render. This mirrors the guard in /onboarding
  // so neither route can be reached in an invalid state via the URL bar.
  useEffect(() => {
    let active = true;
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const p = await getProfile(session.user.id);
      if (!isProfileComplete(p)) {
        router.replace('/onboarding');
        return;
      }
      if (!active) return;
      setUser(session.user);
      setProfile(p);
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <span className="spinner" aria-hidden />
        <p>Loading Arena Data…</p>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  const readiness = [
    { label: 'Profile completed', done: true },
    { label: 'Alliance formed', done: Boolean(team) },
    { label: 'Presentation submitted', done: Boolean(team?.submissionReady) },
  ];

  return (
    <div className="container dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Tribute Dashboard</h1>
          <p className="dashboard__welcome">
            Welcome back, <span>{profile?.full_name}</span>.
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          Sign Out / Disconnect
        </button>
      </header>

      <CountdownTimer
        deadline={EVENT_DEADLINE}
        variant="compact"
        label={EVENT_DEADLINE_LABEL}
      />

      <div className="dashboard__grid">
        {/* Tribute profile summary badge */}
        <motion.section
          className="panel profile-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-badge__avatar" aria-hidden>
            {initials}
          </div>
          <h2 className="profile-badge__name">{profile?.full_name}</h2>
          <dl className="profile-badge__meta">
            <div>
              <dt>Reg. No</dt>
              <dd>{profile?.registration_number}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{profile?.department}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{profile?.phone_number}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
          </dl>
        </motion.section>

        {/* Alliance / team status */}
        <motion.section
          className="panel alliance"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <h2 className="panel__title">Alliance / Team</h2>
          {team ? (
            <div className="alliance__active">
              <div className="alliance__code">
                <span className="alliance__code-label">Team Code</span>
                <span className="alliance__code-value">{team.teamCode}</span>
              </div>
              <p className="alliance__name">{team.name}</p>
              <ul className="alliance__roster">
                {team.members.map((m) => (
                  <li key={m.id}>
                    <span className="alliance__dot" aria-hidden />
                    {m.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="alliance__empty">
              <p className="alliance__empty-text">You are not in an Alliance.</p>
              <p className="alliance__empty-sub">
                Form an alliance of up to 4 tributes, or join one with a team
                code.
              </p>
              <div className="alliance__cta">
                {/* Wiring owned by Pod 3 (Issue #5). */}
                <button className="btn btn-primary" type="button">
                  Create Alliance
                </button>
                <button className="btn" type="button">
                  Join Alliance
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Submission readiness */}
        <motion.section
          className="panel readiness"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <h2 className="panel__title">Submission Readiness</h2>
          <ul className="readiness__list">
            {readiness.map((r) => (
              <li key={r.label} className={r.done ? 'is-done' : 'is-pending'}>
                <span className="readiness__mark" aria-hidden>
                  {r.done ? '✓' : '○'}
                </span>
                {r.label}
              </li>
            ))}
          </ul>
          <p className="readiness__hint">
            {team
              ? 'Your alliance is assembled. Prepare your submission before the deadline.'
              : 'Join or create an alliance to unlock submissions.'}
          </p>
        </motion.section>
      </div>
    </div>
  );
}
