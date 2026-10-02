'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getProfile, isProfileComplete, Profile } from '@/lib/profile';
import CountdownTimer from '@/components/CountdownTimer';
import { EVENT_DEADLINE, EVENT_DEADLINE_LABEL } from '@/lib/event';
import AlliancePanel, { TeamView } from '@/components/dashboard/AlliancePanel';
import SubmissionPanel from '@/components/dashboard/SubmissionPanel';
import AnnouncementsPanel from '@/components/announcements/AnnouncementsPanel';
import ProblemStatements from '@/components/dashboard/ProblemStatements';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<TeamView | null>(null);

  const fetchFullTeam = async (teamId: string) => {
    const { data: teamData } = await supabase.from('ig_teams').select('*').eq('id', teamId).single();
    const { data: roster } = await supabase
      .from('ig_team_members')
      .select('profile_id, profiles(full_name)')
      .eq('team_id', teamId);
      
    if (teamData) {
      setTeam({
        id: teamData.id,
        name: teamData.name,
        teamCode: teamData.team_code,
        paymentStatus: teamData.payment_status,
        submissionReady: !!teamData.submission_url,
        submissionUrl: teamData.submission_url,
        isSubmitted: teamData.is_submitted,
        problemStatement: teamData.problem_statement,
        members: roster?.map((r: any) => ({ id: r.profile_id, name: r.profiles?.full_name })) || []
      });
    } else {
      setTeam(null);
    }
  };

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

      // Fetch team data
      const { data: memberData } = await supabase
        .from('ig_team_members')
        .select('team_id')
        .eq('profile_id', session.user.id)
        .single();
      
      let initialTeam: TeamView | null = null;
      if (memberData) {
        const { data: teamData } = await supabase
          .from('ig_teams')
          .select('*')
          .eq('id', memberData.team_id)
          .single();
        
        const { data: roster } = await supabase
          .from('ig_team_members')
          .select('profile_id, profiles(full_name)')
          .eq('team_id', memberData.team_id);
          
        if (teamData) {
          initialTeam = {
            id: teamData.id,
            name: teamData.name,
            teamCode: teamData.team_code,
            paymentStatus: teamData.payment_status,
            submissionReady: !!teamData.submission_url,
            submissionUrl: teamData.submission_url,
            isSubmitted: teamData.is_submitted,
            problemStatement: teamData.problem_statement,
            members: roster?.map((r: any) => ({ id: r.profile_id, name: r.profiles?.full_name })) || []
          };
        }
      }

      if (!active) return;
      setUser(session.user);
      setProfile(p);
      setTeam(initialTeam);
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
    { label: 'Project locked & submitted', done: Boolean(team?.isSubmitted) },
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
              <dt>Year</dt>
              <dd>{profile?.academic_year}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{profile?.phone_number}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile?.college_email || user?.email}</dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={profile?.github_url} target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                <a href={profile?.linkedin_url} target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              </dd>
            </div>
          </dl>
        </motion.section>

        {/* Alliance / team status */}
        {user && <AlliancePanel userId={user.id} team={team} onTeamUpdate={setTeam} fetchFullTeam={fetchFullTeam} />}

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

      {team && user && (
        <SubmissionPanel team={team} onTeamUpdate={setTeam} fetchFullTeam={fetchFullTeam} />
      )}

      {/* Announcements Section (Full width block) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginTop: '2rem' }}
      >
        <AnnouncementsPanel />
      </motion.div>

      <ProblemStatements />
    </div>
  );
}
