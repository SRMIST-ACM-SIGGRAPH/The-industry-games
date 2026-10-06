'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Megaphone, Eye, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';
import AdminTabsNav from '@/components/admin/AdminTabsNav';
import ProfileInspectorModal from '@/components/admin/ProfileInspectorModal';
import PresentationViewerModal from '@/components/admin/PresentationViewerModal';
import TeamDetailsModal from '@/components/admin/TeamDetailsModal';
import { EVENT_DEADLINE } from '@/lib/event';
import {
  EvalStatus,
  EvalTeam,
  TributeProfile,
  announceResults,
  buildShortlistCsv,
  downloadCsv,
  fetchEvaluationData,
  fetchResultsAnnounced,
  rejectedBy,
  formatTribute,
  statusOf,
  transitionTeam,
} from '@/lib/evaluation';

const FILTERS: ('all' | EvalStatus)[] = ['all', 'pending', 'staged', 'shortlisted', 'rejected'];

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }) : '';

export default function EvaluationPage() {
  const status = useAdminGuard();
  const [teams, setTeams] = useState<EvalTeam[]>([]);
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | EvalStatus>('all');
  const [authToken, setAuthToken] = useState('');
  const [adminId, setAdminId] = useState('');
  const [evaluating, setEvaluating] = useState<EvalTeam | null>(null);
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [inspecting, setInspecting] = useState<TributeProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [announcing, setAnnouncing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [announced, setAnnounced] = useState(false);

  // Announcement gate: opens once the submission deadline (Oct 7, 23:59:59 IST) passes.
  useEffect(() => {
    const check = () => setUnlocked(Date.now() >= new Date(EVENT_DEADLINE).getTime());
    check();
    const id = setInterval(check, 15000);
    return () => clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    try {
      const [{ teams, adminNames }, isAnnounced] = await Promise.all([fetchEvaluationData(), fetchResultsAnnounced()]);
      setAnnounced(isAnnounced);
      setTeams(teams);
      setAdminNames(adminNames);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authorized') return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthToken(session.access_token);
        setAdminId(session.user.id);
      }
    });
    load();
  }, [status, load]);

  const handleTransition = async (to: EvalStatus) => {
    if (!evaluating || !adminId) return;
    setBusy(true);
    try {
      const patch = await transitionTeam(evaluating, to, adminId);
      setTeams((prev) => prev.map((t) => (t.id === evaluating.id ? { ...t, ...patch } : t)));
      setEvaluating(null);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const shortlisted = useMemo(() => teams.filter((t) => statusOf(t) === 'shortlisted'), [teams]);
  const detailsTeam = teams.find((t) => t.id === detailsId) ?? null;
  const visible = teams.filter((t) => filter === 'all' || statusOf(t) === filter);

  const handleAnnounce = async () => {
    const pending = teams.filter((t) => statusOf(t) === 'pending').length;
    const msg =
      `Announce results to all tributes?\n\n${shortlisted.length} shortlisted. ` +
      (pending > 0 ? `${pending} team(s) are still unevaluated and will see no result yet.\n\n` : '\n') +
      'This posts a broadcast to all tributes and cannot be undone from here.';
    if (!window.confirm(msg)) return;
    setAnnouncing(true);
    try {
      await announceResults();
      await load();
    } catch (err: any) {
      alert(`Failed to announce results: ${err.message}`);
    } finally {
      setAnnouncing(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) return <LoadingPanel />;
  if (status === 'forbidden') return <ForbiddenPanel />;

  const who = (id: string | null) => (id ? adminNames[id] ?? 'Unknown admin' : null);

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <AdminTabsNav />
      <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Evaluation & Shortlisting</h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Review submitted decks, stage teams, and shortlist for the final showcase.
      </p>

      {error && <p style={{ color: '#e74c3c' }}>Error: {error}</p>}

      {/* Result finalizer */}
      <section className="admin-panel finalizer">
        <div>
          <h2 className="finalizer-title">Result Finalizer</h2>
          <p className="finalizer-note">
            {announced
              ? 'Results have been announced to tribute dashboards.'
              : unlocked
              ? `${shortlisted.length} team(s) shortlisted. Ready to announce.`
              : 'Announcements locked until submission window concludes.'}
          </p>
        </div>
        <div className="finalizer-actions">
          <button
            type="button"
            className="btn"
            onClick={() => downloadCsv('shortlist.csv', buildShortlistCsv(teams, adminNames))}
            disabled={shortlisted.length === 0}
          >
            <Download size={14} /> Download Shortlist CSV
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAnnounce}
            disabled={!unlocked || announced || announcing}
          >
            {unlocked ? <Megaphone size={14} /> : <Lock size={14} />} {announcing ? 'Announcing…' : announced ? 'Announced' : 'Announce Results'}
          </button>
        </div>
      </section>

      <div className="eval-filters" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`eval-filter ${filter === f ? 'eval-filter-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f} ({f === 'all' ? teams.length : teams.filter((t) => statusOf(t) === f).length})
          </button>
        ))}
      </div>

      <div className="admin-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="eval-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Tributes</th>
              <th>Status</th>
              <th>Audit</th>
              <th>Deck</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((team) => {
              const s = statusOf(team);
              return (
                <tr key={team.id}>
                  <td>
                    <button type="button" className="eval-team-link" onClick={() => setDetailsId(team.id)} title="View team details">
                      {team.name}
                    </button>
                    <div className="eval-sub">{team.problem_statement ?? 'No district chosen'}</div>
                  </td>
                  <td>
                    {team.members.map((m) => (
                      <div key={m.id} className="eval-member">
                        <span>{formatTribute(m)}</span>
                        <button type="button" className="eval-link-btn" onClick={() => setInspecting(m)}>View Profile</button>
                      </div>
                    ))}
                  </td>
                  <td><span className={`eval-badge eval-badge-${s}`}>{s}</span></td>
                  <td className="eval-sub">
                    {s === 'rejected' && <div>Rejected by {who(rejectedBy(team)) ?? 'Unknown admin'}</div>}
                    {s !== 'rejected' && team.staged_by && <div>Staged by {who(team.staged_by)} · {fmt(team.staged_at)}</div>}
                    {s === 'shortlisted' && team.shortlisted_by && <div>Shortlisted by {who(team.shortlisted_by)} · {fmt(team.shortlisted_at)}</div>}
                    {s === 'pending' && '—'}
                  </td>
                  <td>
                    {team.submission_url ? (
                      <button type="button" className="btn btn-primary" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setEvaluating(team)}>
                        <Eye size={14} /> Evaluate
                      </button>
                    ) : (
                      <span className="eval-sub">No deck</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No submissions here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {evaluating && (
        <PresentationViewerModal
          key={evaluating.id}
          team={evaluating}
          authToken={authToken}
          busy={busy}
          onTransition={handleTransition}
          onClose={() => setEvaluating(null)}
        />
      )}
      {detailsTeam && (
        <TeamDetailsModal
          team={detailsTeam}
          inspectorOpen={inspecting !== null}
          onViewProfile={setInspecting}
          onClose={() => setDetailsId(null)}
        />
      )}
      {inspecting && <ProfileInspectorModal profile={inspecting} onClose={() => setInspecting(null)} />}
    </div>
  );
}
