'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getProfile, isProfileComplete, Profile } from '@/lib/profile';
import CountdownTimer from '@/components/CountdownTimer';
import { EVENT_DEADLINE, EVENT_DEADLINE_LABEL, isSubmissionClosed } from '@/lib/event';
import AlliancePanel, { TeamView } from '@/components/dashboard/AlliancePanel';
import SubmissionPanel from '@/components/dashboard/SubmissionPanel';
import AnnouncementsPanel from '@/components/announcements/AnnouncementsPanel';
import ProblemStatements from '@/components/dashboard/ProblemStatements';
import { deriveStatus } from '@/lib/evaluation';
import ResultsPanel from '@/components/dashboard/ResultsPanel';

const GithubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a5.5 5.5 0 0 0-1.5-3.8 5.5 5.5 0 0 0-.1-3.8s-1.2-.4-3.9 1.4a13.4 13.4 0 0 0-7 0c-2.7-1.8-3.9-1.4-3.9-1.4a5.5 5.5 0 0 0-.1 3.8 5.5 5.5 0 0 0-1.5 3.8c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

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
      if (isSubmissionClosed() && teamData.submission_url && !teamData.is_submitted) {
        teamData.is_submitted = true;
        supabase.from('ig_teams').update({ is_submitted: true }).eq('id', teamData.id).then();
      }

      setTeam({
        id: teamData.id,
        name: teamData.name,
        teamCode: teamData.team_code,
        paymentStatus: teamData.payment_status,
        submissionReady: !!(teamData.submission_url && teamData.problem_statement),
        submissionUrl: teamData.submission_url,
        isSubmitted: teamData.is_submitted,
        problemStatement: teamData.problem_statement,
        evalStatus: deriveStatus(teamData),
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
          if (isSubmissionClosed() && teamData.submission_url && !teamData.is_submitted) {
            teamData.is_submitted = true;
            supabase.from('ig_teams').update({ is_submitted: true }).eq('id', teamData.id).then();
          }

          initialTeam = {
            id: teamData.id,
            name: teamData.name,
            teamCode: teamData.team_code,
            paymentStatus: teamData.payment_status,
            submissionReady: !!(teamData.submission_url && teamData.problem_statement),
            submissionUrl: teamData.submission_url,
            isSubmitted: teamData.is_submitted,
            problemStatement: teamData.problem_statement,
            evalStatus: deriveStatus(teamData),
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

  const isTeamSizeValid = Boolean(team && team.members.length >= 2 && team.members.length <= 4);
  const readiness = [
    { label: 'Profile completed', done: true },
    { 
      label: team ? `Alliance formed (${team.members.length}/4 tributes${team.members.length < 2 ? ' — min 2 required' : ''})` : 'Alliance formed (min 2, max 4)', 
      done: isTeamSizeValid 
    },
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
          Sign out
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
          </dl>
          {(profile?.github_url || profile?.linkedin_url) && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <GithubIcon /> GitHub
                </a>
              )}
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  <LinkedinIcon /> LinkedIn
                </a>
              )}
            </div>
          )}
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
            {!team
              ? 'Join or create an alliance of 2 to 4 tributes to unlock submissions.'
              : team.members.length < 2
              ? 'Invite at least 1 more tribute to your alliance (minimum 2 required).'
              : 'Your alliance is assembled. Prepare your submission before the deadline.'}
          </p>
        </motion.section>

      </div>

      {team?.isSubmitted && (
        <div style={{ marginTop: '2rem' }}>
          <ResultsPanel evalStatus={team.evalStatus} />
        </div>
      )}

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
