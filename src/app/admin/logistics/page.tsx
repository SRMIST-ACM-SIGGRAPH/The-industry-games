'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, X, Utensils } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';
import AdminTabsNav from '@/components/admin/AdminTabsNav';
import { EvalTeam, fetchEvaluationData, statusOf } from '@/lib/evaluation';
import { AttendanceRecord, fetchAttendance, upsertAttendance, serveMeal } from '@/lib/logistics';

const MEALS = ['Day1_Lunch', 'Day1_Dinner', 'Day2_Breakfast', 'Day2_Lunch'];

export default function LogisticsPage() {
  const status = useAdminGuard();
  const [teams, setTeams] = useState<EvalTeam[]>([]);
  const [adminNames, setAdminNames] = useState<Record<string, string>>({});
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState('');
  const [busy, setBusy] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [attFilter, setAttFilter] = useState<'All' | 'Present' | 'Absent' | 'Unmarked'>('All');
  const FILTERS: ('All' | 'Present' | 'Absent' | 'Unmarked')[] = ['All', 'Present', 'Absent', 'Unmarked'];

  // Default to today's date (YYYY-MM-DD) for attendance tracking
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  const load = useCallback(async () => {
    try {
      const { teams, adminNames } = await fetchEvaluationData();
      const shortlistedTeams = teams.filter(t => statusOf(t) === 'shortlisted');
      setTeams(shortlistedTeams);
      setAdminNames(adminNames);

      const attendance = await fetchAttendance(currentDate);
      setAttendanceMap(attendance);
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load logistics data');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    if (status !== 'authorized') return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAdminId(session.user.id);
      }
    });
    load();
  }, [status, load]);

  const handleMarkAttendance = async (teamId: string, profileId: string, attStatus: 'Present' | 'Absent') => {
    if (!adminId) return;
    setBusy(true);
    try {
      const record = await upsertAttendance(teamId, profileId, currentDate, attStatus, adminId);
      setAttendanceMap(prev => ({ ...prev, [profileId]: record }));
    } catch (err: any) {
      alert(`Failed to update attendance: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleServeMeal = async (profileId: string, mealType: string) => {
    if (!adminId) return;
    const record = attendanceMap[profileId];
    if (!record) return;

    if (!window.confirm(`Serve ${mealType.replace('_', ' ')} to this tribute?`)) return;

    setBusy(true);
    try {
      const updatedRecord = await serveMeal(record.id, mealType, adminId, record.meals || {});
      setAttendanceMap(prev => ({ ...prev, [profileId]: updatedRecord }));
    } catch (err: any) {
      alert(`Failed to log meal: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  const who = (id: string | null | undefined) => (id ? adminNames[id] ?? 'Unknown admin' : null);

  const filteredTeams = teams.map(team => {
    let matchingMembers = team.members.filter(m => {
      const record = attendanceMap[m.id];
      if (attFilter === 'Present') return record?.status === 'Present';
      if (attFilter === 'Absent') return record?.status === 'Absent';
      if (attFilter === 'Unmarked') return !record;
      return true;
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const teamMatches = team.name.toLowerCase().includes(q) || team.team_code.toLowerCase().includes(q);
      
      if (!teamMatches) {
        matchingMembers = matchingMembers.filter(m => 
          m.full_name.toLowerCase().includes(q) || 
          m.registration_number.toLowerCase().includes(q)
        );
      }
    }

    return { ...team, members: matchingMembers };
  }).filter(team => team.members.length > 0);

  if (status === 'loading' || status === 'unauthenticated' || loading) return <LoadingPanel />;
  if (status === 'forbidden') return <ForbiddenPanel />;

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <AdminTabsNav />
      <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Logistics & Operations</h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Track tribute attendance and gamemaker sustenance distribution.
      </p>

      {error && <p style={{ color: '#e74c3c' }}>Error: {error}</p>}

      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <label style={{ color: '#ccc', fontWeight: 'bold' }}>Attendance Date:</label>
        <input 
          type="date" 
          value={currentDate} 
          onChange={(e) => setCurrentDate(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          placeholder="Search by team name, code, or member details..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '0.6rem 1rem', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.2)', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
        />
        <div className="eval-filters" role="tablist" aria-label="Filter by attendance">
          {FILTERS.map((f) => {
            let count = 0;
            teams.forEach(team => {
              team.members.forEach(m => {
                const record = attendanceMap[m.id];
                if (f === 'All') count++;
                else if (f === 'Present' && record?.status === 'Present') count++;
                else if (f === 'Absent' && record?.status === 'Absent') count++;
                else if (f === 'Unmarked' && !record) count++;
              });
            });

            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={attFilter === f}
                className={`eval-filter ${attFilter === f ? 'eval-filter-active' : ''}`}
                onClick={() => setAttFilter(f)}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="admin-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="eval-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Tribute</th>
              <th>Attendance</th>
              <th>Food Tracker</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              team.members.map((m, idx) => {
                const record = attendanceMap[m.id];
                const isPresent = record?.status === 'Present';

                return (
                  <tr key={m.id} style={{ borderTop: idx === 0 ? '2px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)' }}>
                    <td>
                      {idx === 0 && (
                        <div>
                          <strong style={{ color: 'var(--foreground)' }}>{team.name}</strong>
                          <div className="eval-sub">{team.team_code}</div>
                        </div>
                      )}
                    </td>
                    <td>
                      <div>{m.full_name}</div>
                      <div className="eval-sub">{m.registration_number}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className={`btn ${isPresent ? 'btn-primary' : ''}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                            onClick={() => handleMarkAttendance(team.id, m.id, 'Present')}
                            disabled={busy}
                          >
                            <Check size={14} /> Present
                          </button>
                          <button 
                            className={`btn ${record?.status === 'Absent' ? 'btn-primary' : ''}`}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', background: record?.status === 'Absent' ? '#e74c3c' : undefined }}
                            onClick={() => handleMarkAttendance(team.id, m.id, 'Absent')}
                            disabled={busy}
                          >
                            <X size={14} /> Absent
                          </button>
                        </div>
                        {record && (
                          <div className="eval-sub" style={{ fontSize: '0.7rem' }}>
                            Marked by: {who(record.updated_by)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {isPresent ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {MEALS.map(meal => {
                            const served = record.meals && record.meals[meal];
                            return (
                              <button
                                key={meal}
                                className="btn"
                                style={{ 
                                  padding: '0.3rem 0.6rem', 
                                  fontSize: '0.8rem', 
                                  background: served ? '#2ecc71' : 'rgba(255,255,255,0.05)',
                                  color: served ? '#000' : '#fff',
                                  border: served ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                }}
                                onClick={() => handleServeMeal(m.id, meal)}
                                disabled={busy || !!served}
                                title={served ? `Served at ${new Date(served.served_at).toLocaleTimeString()}` : `Serve ${meal}`}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {!served && <Utensils size={12} style={{ marginRight: '4px' }} />}
                                    {meal.replace('_', ' ')}
                                  </div>
                                  {served && (
                                    <span style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                                      by {who(served.served_by)}
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="eval-sub">Must be marked Present</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ))}
            {filteredTeams.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>
                  No shortlisted teams found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
