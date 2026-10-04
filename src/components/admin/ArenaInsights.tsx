'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Shield, FileEdit, Send, RefreshCw } from 'lucide-react';

interface TelemetryStats {
  registered: number;
  teams: number;
  drafts: number;
  submissions: number;
}

export default function ArenaInsights() {
  const [stats, setStats] = useState<TelemetryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTelemetry = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError(null);

    try {
      // 1. Fetch non-admin count, all admin profile IDs, and all teams
      const [nonAdminProfilesRes, adminProfilesRes, teamsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).or('is_admin.is.null,is_admin.eq.false'),
        supabase.from('profiles').select('id').eq('is_admin', true),
        supabase.from('ig_teams').select('id, leader_id, submission_url, is_submitted')
      ]);

      if (nonAdminProfilesRes.error) throw nonAdminProfilesRes.error;
      if (adminProfilesRes.error) throw adminProfilesRes.error;
      if (teamsRes.error) throw teamsRes.error;

      const adminIds = new Set((adminProfilesRes.data || []).map((p) => p.id));
      const adminTeamIds = new Set<string>();

      // Identify teams led by an admin
      const allTeams = teamsRes.data || [];
      for (const t of allTeams) {
        if (t.leader_id && adminIds.has(t.leader_id)) {
          adminTeamIds.add(t.id);
        }
      }

      // Identify teams where an admin is a member
      if (adminIds.size > 0) {
        const { data: memberRows, error: memberErr } = await supabase
          .from('ig_team_members')
          .select('team_id')
          .in('profile_id', Array.from(adminIds));

        if (!memberErr && memberRows) {
          for (const row of memberRows) {
            if (row.team_id) adminTeamIds.add(row.team_id);
          }
        }
      }

      // Filter out admin teams from all metrics
      const nonAdminTeams = allTeams.filter((t) => !adminTeamIds.has(t.id));

      const registered = nonAdminProfilesRes.count ?? 0;
      const teams = nonAdminTeams.length;
      const drafts = nonAdminTeams.filter((t) => Boolean(t.submission_url) && !t.is_submitted).length;
      const submissions = nonAdminTeams.filter((t) => Boolean(t.is_submitted)).length;

      setStats({
        registered,
        teams,
        drafts,
        submissions,
      });
    } catch (err: any) {
      console.error('Failed to fetch arena telemetry:', err);
      setError(err.message || 'Failed to load telemetry');
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    // Poll telemetry every 30 seconds
    const interval = setInterval(() => fetchTelemetry(), 30000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const cards = [
    {
      key: 'registered',
      label: 'Registered',
      value: stats?.registered,
      icon: Users,
      description: 'Individual tributes in the arena',
    },
    {
      key: 'teams',
      label: 'Teams',
      value: stats?.teams,
      icon: Shield,
      description: 'Alliances formed across districts',
    },
    {
      key: 'drafts',
      label: 'Drafts',
      value: stats?.drafts,
      icon: FileEdit,
      description: 'Decks uploaded, awaiting lock',
    },
    {
      key: 'submissions',
      label: 'Submissions',
      value: stats?.submissions,
      icon: Send,
      description: 'Locked & ready for evaluation',
    },
  ];

  return (
    <section className="arena-insights" aria-label="Arena Telemetry Insights">
      <div className="arena-insights-header">
        <div className="arena-insights-title">
          <span>Live Arena Telemetry</span>
          <span className="arena-pulse-dot" aria-hidden="true" />
        </div>
        <button
          type="button"
          onClick={() => fetchTelemetry(true)}
          disabled={refreshing || loading}
          className="arena-refresh-btn"
          title="Refresh live metrics"
          aria-label="Refresh live metrics"
        >
          <RefreshCw size={13} className={refreshing ? 'spinning-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="arena-insights-error">
          <span>Telemetry sync notice: {error}</span>
        </div>
      )}

      <div className="arena-insights-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="insight-card">
              <div className="insight-card-top">
                <span className="insight-card-label">{card.label}</span>
                <div className="insight-card-icon" aria-hidden="true">
                  <Icon size={18} />
                </div>
              </div>
              <div className="insight-card-main">
                {loading ? (
                  <span className="insight-card-skeleton">Loading...</span>
                ) : (
                  <span className="insight-card-value">{card.value?.toLocaleString() ?? 0}</span>
                )}
              </div>
              <span className="insight-card-desc">{card.description}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
