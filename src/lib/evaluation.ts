import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/profile';

export type EvalStatus = 'pending' | 'staged' | 'shortlisted' | 'rejected';

// State machine: which statuses a team may move to from its current one.
export const TRANSITIONS: Record<EvalStatus, EvalStatus[]> = {
  pending: ['staged', 'rejected'],
  staged: ['shortlisted', 'rejected'],
  shortlisted: ['staged', 'rejected'],
  rejected: ['staged'],
};

export interface TributeProfile extends Profile {
  portfolio_url?: string | null;
}

export interface EvalTeam {
  id: string;
  name: string;
  team_code: string;
  leader_id: string;
  problem_statement: string | null;
  submission_url: string | null;
  is_submitted: boolean;
  status: EvalStatus; // derived from the audit columns (no status column in ig_teams)
  staged_by: string | null;
  staged_at: string | null;
  shortlisted_by: string | null;
  shortlisted_at: string | null;
  members: TributeProfile[];
}

export function statusOf(team: Pick<EvalTeam, 'status'>): EvalStatus {
  return team.status;
}

interface AuditColumns {
  staged_by?: string | null;
  staged_at?: string | null;
  shortlisted_by?: string | null;
  shortlisted_at?: string | null;
}

/**
 * ig_teams has no status column, so status is encoded in the audit columns:
 *   shortlisted -> shortlisted_at set
 *   staged      -> staged_at set (shortlisted_at null)
 *   rejected    -> both timestamps null but an auditor is recorded
 *                  (the rejecting admin lives in shortlisted_by if rejected
 *                  from shortlist, otherwise staged_by)
 *   pending     -> nothing recorded
 */
export function deriveStatus(t: AuditColumns): EvalStatus {
  if (t.shortlisted_at) return 'shortlisted';
  if (t.staged_at) return 'staged';
  if (t.staged_by || t.shortlisted_by) return 'rejected';
  return 'pending';
}

/** Admin who rejected the team (only meaningful when status is rejected). */
export function rejectedBy(t: Pick<EvalTeam, 'staged_by' | 'shortlisted_by'>): string | null {
  return t.shortlisted_by ?? t.staged_by ?? null;
}

export function formatTribute(p: Pick<Profile, 'full_name' | 'registration_number'>): string {
  return `${p.full_name} (${p.registration_number})`;
}

export function leaderOf(team: EvalTeam): TributeProfile | undefined {
  return team.members.find((m) => m.id === team.leader_id);
}

export interface EvaluationData {
  teams: EvalTeam[];
  adminNames: Record<string, string>;
}

export async function fetchEvaluationData(): Promise<EvaluationData> {
  const { data: teamRows, error: teamErr } = await supabase
    .from('ig_teams')
    .select('*')
    .order('created_at', { ascending: true });
  if (teamErr) throw teamErr;

  const rows = teamRows ?? [];
  const ids = rows.map((t) => t.id);

  const membersByTeam: Record<string, TributeProfile[]> = {};
  if (ids.length > 0) {
    const { data: memberRows, error: memErr } = await supabase
      .from('ig_team_members')
      .select('team_id, profiles(*)')
      .in('team_id', ids);
    if (memErr) throw memErr;
    for (const r of (memberRows ?? []) as any[]) {
      const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
      if (!profile) continue;
      (membersByTeam[r.team_id] ??= []).push(profile as TributeProfile);
    }
  }

  // Auditor identity: resolve admin UUIDs to full names, never emails.
  const { data: admins, error: adminErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('is_admin', true);
  if (adminErr) throw adminErr;
  const adminNames: Record<string, string> = {};
  for (const a of admins ?? []) adminNames[a.id] = a.full_name;

  const teams: EvalTeam[] = rows.map((t: any) => ({
    id: t.id,
    name: t.name,
    team_code: t.team_code,
    leader_id: t.leader_id,
    problem_statement: t.problem_statement ?? null,
    submission_url: t.submission_url ?? null,
    is_submitted: !!t.is_submitted,
    status: deriveStatus(t),
    staged_by: t.staged_by ?? null,
    staged_at: t.staged_at ?? null,
    shortlisted_by: t.shortlisted_by ?? null,
    shortlisted_at: t.shortlisted_at ?? null,
    members: membersByTeam[t.id] ?? [],
  }));

  return { teams, adminNames };
}

/**
 * Applies a transition and returns the fields that changed (for local state).
 * Throws if the matrix forbids it or the team changed under us.
 */
export async function transitionTeam(
  team: EvalTeam,
  to: EvalStatus,
  adminId: string
): Promise<Partial<EvalTeam>> {
  if (!team.is_submitted) throw new Error('Only submitted teams can be evaluated.');
  const from = statusOf(team);
  if (!TRANSITIONS[from].includes(to)) {
    throw new Error(`Transition ${from} → ${to} is not allowed.`);
  }

  const now = new Date().toISOString();
  const patch: Partial<EvalTeam> = { status: to };
  const cols: AuditColumns = {};

  if (to === 'staged') {
    cols.staged_by = adminId;
    cols.staged_at = now;
    // Clear shortlist state / rejection marker.
    cols.shortlisted_by = null;
    cols.shortlisted_at = null;
    if (from === 'shortlisted') {
      // Revert: keep the original staging audit.
      delete cols.staged_by;
      delete cols.staged_at;
    }
  } else if (to === 'shortlisted') {
    cols.shortlisted_by = adminId;
    cols.shortlisted_at = now;
  } else if (to === 'rejected') {
    cols.staged_at = null;
    cols.shortlisted_at = null;
    if (from === 'shortlisted') cols.shortlisted_by = adminId;
    else cols.staged_by = adminId; // from pending or staged
  }

  Object.assign(patch, cols);

  // Optimistic check: only update if the team is still in the state we saw.
  let query = supabase.from('ig_teams').update(cols).eq('id', team.id);
  if (from === 'pending') {
    query = query.is('staged_at', null).is('shortlisted_at', null).is('staged_by', null).is('shortlisted_by', null);
  } else if (from === 'staged') {
    query = query.not('staged_at', 'is', null).is('shortlisted_at', null);
  } else if (from === 'shortlisted') {
    query = query.not('shortlisted_at', 'is', null);
  } else {
    query = query
      .is('staged_at', null)
      .is('shortlisted_at', null)
      .or('staged_by.not.is.null,shortlisted_by.not.is.null');
  }

  const { data, error } = await query.select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('This team was changed by another admin (or the update was blocked). Refresh and retry.');
  return patch;
}

// ig_teams has no "announced" flag, so announcing posts a broadcast with this
// exact title. Tribute dashboards show results once such a broadcast exists.
export const RESULTS_ANNOUNCEMENT_TITLE = 'Results Announced';

export async function fetchResultsAnnounced(): Promise<boolean> {
  const { data, error } = await supabase
    .from('announcements')
    .select('id')
    .eq('title', RESULTS_ANNOUNCEMENT_TITLE)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function announceResults(): Promise<void> {
  if (await fetchResultsAnnounced()) return;
  const { error } = await supabase.from('announcements').insert({
    title: RESULTS_ANNOUNCEMENT_TITLE,
    content: 'Tribute selection results are now live. Check your dashboard.',
    urgency: 'critical',
  });
  if (error) throw error;
}

function csvCell(value: string | null | undefined): string {
  let s = value ?? '';
  // Neutralise spreadsheet formula injection from user-supplied text.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildShortlistCsv(
  teams: EvalTeam[],
  adminNames: Record<string, string>
): string {
  // Order: shortlisted, pending (submitted, undecided or staged), not submitted, rejected.
  const included = [
    ...teams.filter((t) => t.is_submitted && statusOf(t) === 'shortlisted'),
    ...teams.filter((t) => t.is_submitted && (statusOf(t) === 'pending' || statusOf(t) === 'staged')),
    ...teams.filter((t) => !t.is_submitted),
    ...teams.filter((t) => t.is_submitted && statusOf(t) === 'rejected'),
  ];

  // Members other than the leader, each person once.
  const othersOf = (t: EvalTeam) => {
    const seen = new Set<string>();
    return t.members.filter((m) => {
      if (m.id === t.leader_id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  // Only create as many Member N columns as the biggest team needs.
  const memberSlots = Math.max(1, ...included.map((t) => othersOf(t).length));

  const header = ['Team Name', 'District', 'Team Leader Name', 'Team Leader Registration Number', 'Team Leader Email'];
  for (let i = 1; i <= memberSlots; i++) {
    header.push(`Member ${i} Name`, `Member ${i} Registration Number`, `Member ${i} Email`);
  }
  header.push('Evaluated By');

  const evaluatedBy = (t: EvalTeam): string => {
    if (!t.is_submitted) return 'Not submitted';
    const s = statusOf(t);
    if (s === 'shortlisted') return t.shortlisted_by ? adminNames[t.shortlisted_by] ?? 'Unknown admin' : '';
    if (s === 'rejected') return 'Rejected';
    return 'Pending';
  };

  const lines = included.map((t) => {
    const leader = leaderOf(t);
    const others = othersOf(t);
    const row = [t.name, t.problem_statement ?? '', leader?.full_name ?? '', leader?.registration_number ?? '', leader?.college_email ?? ''];
    for (let i = 0; i < memberSlots; i++) {
      const m = others[i];
      row.push(m?.full_name ?? '', m?.registration_number ?? '', m?.college_email ?? '');
    }
    row.push(evaluatedBy(t));
    return row.map(csvCell).join(',');
  });

  return [header.map(csvCell).join(','), ...lines].join('\r\n');
}

  // Only create as many Member N columns as the biggest shortlisted team needs.
  const memberSlots = Math.max(1, ...shortlisted.map((t) => othersOf(t).length));

  const header = ['Team Name', 'District', 'Team Leader Name', 'Team Leader Registration Number', 'Team Leader Email'];
  for (let i = 1; i <= memberSlots; i++) {
    header.push(`Member ${i} Name`, `Member ${i} Registration Number`, `Member ${i} Email`);
  }
  header.push('Evaluated By');

  const lines = shortlisted.map((t) => {
    const leader = leaderOf(t);
    const others = othersOf(t);
    const row = [t.name, t.problem_statement ?? '', leader?.full_name ?? '', leader?.registration_number ?? '', leader?.college_email ?? ''];
    for (let i = 0; i < memberSlots; i++) {
      const m = others[i];
      row.push(m?.full_name ?? '', m?.registration_number ?? '', m?.college_email ?? '');
    }
    row.push(
      !t.is_submitted
        ? 'Not submitted'
        : statusOf(t) === 'shortlisted'
        ? t.shortlisted_by
          ? adminNames[t.shortlisted_by] ?? 'Unknown admin'
          : ''
        : 'Pending'
    );

  return [header.map(csvCell).join(','), ...lines].join('\r\n');
}


export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeHttpUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null;
  } catch {
    return null;
  }
}
