'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ForbiddenPanel, LoadingPanel } from '@/components/admin/AdminPanels';
import { fetchTeamsForVerification, updateTeamPaymentStatus, getPaymentProofUrl } from '@/lib/admin-verifications';
import { Team } from '@/lib/types';

export default function VerificationsPage() {
  const status = useAdminGuard();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    if (status === 'authorized') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) setAuthToken(session.access_token);
      });

      fetchTeamsForVerification()
        .then((data) => {
          setTeams(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [status]);

  const handleStatusUpdate = async (teamId: string, newStatus: 'verified' | 'rejected' | 'pending') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      await updateTeamPaymentStatus(teamId, newStatus, user.id);
      
      // Update local state with the verifier's email (assuming current user's email)
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { 
        ...t, 
        payment_status: newStatus,
        verifier: { college_email: user.email || 'Unknown' }
      } : t)));

      setSelectedTeam(null);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return <LoadingPanel />;
  }

  if (status === 'forbidden') {
    return <ForbiddenPanel />;
  }

  return (
    <div className="container" style={{ paddingTop: '10rem', paddingBottom: '4rem', minHeight: '100vh' }}>
      <h1 style={{ color: 'var(--accent-gold)', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Verifications
      </h1>
      <p style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '3rem' }}>
        Review payment proofs and verify alliances.
      </p>

      {error && <p style={{ color: 'var(--accent-red)' }}>Error: {error}</p>}

      <div className="admin-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}>
              <th style={{ padding: '1rem' }}>Team Name</th>
              <th style={{ padding: '1rem' }}>Code</th>
              <th style={{ padding: '1rem' }}>Presentation</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Verified By</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{team.name}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{team.team_code}</td>
                <td style={{ padding: '1rem' }}>
                  {team.submission_url ? (
                    <button
                      onClick={() => {
                        setSelectedTeam(team);
                        setImageLoaded(false);
                        setImageError(false);
                      }}
                      className="btn btn-primary"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
                    >
                      Review Presentation
                    </button>
                  ) : (
                    <span style={{ color: '#666' }}>No proof</span>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    backgroundColor: team.payment_status === 'verified' ? 'rgba(46, 204, 113, 0.2)' : team.payment_status === 'rejected' ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    color: team.payment_status === 'verified' ? '#2ecc71' : team.payment_status === 'rejected' ? '#e74c3c' : '#ccc',
                  }}>
                    {team.payment_status}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                  {team.verifier?.college_email || '—'}
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>
                  No alliances have registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTeam && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            
            {/* Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--accent-gold)' }}>Review Presentation: {selectedTeam.name}</h3>
              <button onClick={() => setSelectedTeam(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

              {/* iframe Container */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '1rem', background: '#e5e5e5' }}>
              {!imageLoaded && !imageError && (
                <div style={{ position: 'absolute', color: '#888' }}>Loading document...</div>
              )}
              {imageError && (
                <div style={{ position: 'absolute', color: 'var(--accent-red)' }}>Error loading file.</div>
              )}
              <iframe 
                src={getPaymentProofUrl(selectedTeam.submission_url, authToken) || ''} 
                title="Presentation Preview"
                onLoad={() => setImageLoaded(true)}
                onError={() => { setImageError(true); setImageLoaded(true); }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none',
                  borderRadius: '4px',
                  opacity: imageLoaded && !imageError ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
              />
            </div>

            {/* Actions Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: '#111' }}>
              <button
                disabled={!imageLoaded}
                onClick={() => handleStatusUpdate(selectedTeam.id, 'rejected')}
                className="btn"
                style={{ borderColor: 'var(--accent-red)', color: 'var(--accent-red)', opacity: imageLoaded ? 1 : 0.5, cursor: imageLoaded ? 'pointer' : 'not-allowed' }}
              >
                Reject Payment
              </button>
              <button
                disabled={!imageLoaded}
                onClick={() => handleStatusUpdate(selectedTeam.id, 'verified')}
                className="btn btn-primary"
                style={{ opacity: imageLoaded ? 1 : 0.5, cursor: imageLoaded ? 'pointer' : 'not-allowed' }}
              >
                Verify Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
