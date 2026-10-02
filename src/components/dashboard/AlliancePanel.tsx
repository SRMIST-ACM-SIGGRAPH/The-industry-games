import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export interface TeamView {
  id: string;
  name: string;
  teamCode: string;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  submissionReady: boolean;
  isSubmitted: boolean;
  members: { id: string; name: string }[];
}

interface AlliancePanelProps {
  userId: string;
  team: TeamView | null;
  onTeamUpdate: (team: TeamView | null) => void;
  fetchFullTeam: (teamId: string) => Promise<void>;
}

export default function AlliancePanel({ userId, team, onTeamUpdate, fetchFullTeam }: AlliancePanelProps) {
  const [mode, setMode] = useState<'view' | 'create' | 'join'>('view');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!inputValue.trim()) {
      setError('Team name is required.');
      return;
    }
    setLoading(true);
    
    // Generate 6 char alphanumeric code (uppercase)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // 1. Insert Team
    const { data: newTeam, error: createError } = await supabase
      .from('ig_teams')
      .insert({ name: inputValue.trim(), team_code: code, leader_id: userId })
      .select()
      .single();
      
    if (createError) {
      setError(createError.message);
      setLoading(false);
      return;
    }

    // 2. Insert Leader into Members Junction
    const { error: joinError } = await supabase
      .from('ig_team_members')
      .insert({ team_id: newTeam.id, profile_id: userId });

    if (joinError) {
      setError(joinError.message);
      setLoading(false);
      return;
    }

    await fetchFullTeam(newTeam.id);
    setMode('view');
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!inputValue.trim()) {
      setError('Team code is required.');
      return;
    }
    setLoading(true);

    // Call our custom Postgres RPC function to safely join
    const { error: rpcError } = await supabase.rpc('join_ig_team', { p_team_code: inputValue.trim().toUpperCase() });
    
    if (rpcError) {
      // Clean up postgres error messages
      setError(rpcError.message.replace('P0001: ', ''));
      setLoading(false);
      return;
    }

    // Successfully joined! Fetch team id using member table
    const { data: memberData } = await supabase
      .from('ig_team_members')
      .select('team_id')
      .eq('profile_id', userId)
      .single();
      
    if (memberData) {
      await fetchFullTeam(memberData.team_id);
    }
    
    setMode('view');
    setLoading(false);
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    if (!confirm('Are you sure you want to leave this alliance?')) return;
    setLoading(true);
    const { error: leaveError } = await supabase
      .from('ig_team_members')
      .delete()
      .eq('team_id', team.id)
      .eq('profile_id', userId);
    
    if (leaveError) {
      setError(leaveError.message);
    } else {
      onTeamUpdate(null);
    }
    setLoading(false);
  };

  const handleRenameTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !newName.trim()) return;
    setLoading(true);
    const { error: renameError } = await supabase
      .from('ig_teams')
      .update({ name: newName.trim() })
      .eq('id', team.id);
      
    if (renameError) {
      setError(renameError.message);
    } else {
      await fetchFullTeam(team.id);
      setIsRenaming(false);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (team) {
      navigator.clipboard.writeText(team.teamCode);
      alert('Team code copied to clipboard!');
    }
  };

  return (
    <motion.section
      className="panel alliance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
    >
      <h2 className="panel__title">Alliance / Team</h2>

      {team ? (
        <div className="alliance__active">
          {error && <p className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</p>}
          <div className="alliance__code" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <span className="alliance__code-label">Team Code</span>
              <span className="alliance__code-value" style={{ userSelect: 'all' }}>
                {team.teamCode}
              </span>
            </div>
            <button 
              className="btn" 
              onClick={copyToClipboard}
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}
            >
              Copy Code
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            {isRenaming ? (
              <form onSubmit={handleRenameTeam} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  defaultValue={team.name} 
                  onChange={(e) => setNewName(e.target.value)} 
                  autoFocus 
                  maxLength={30} 
                  disabled={loading}
                  style={{ padding: '0.25rem 0.5rem' }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.25rem 1rem' }}>Save</button>
                <button type="button" className="btn" onClick={() => setIsRenaming(false)} disabled={loading} style={{ padding: '0.25rem 1rem' }}>Cancel</button>
              </form>
            ) : (
              <>
                <p className="alliance__name" style={{ margin: 0 }}>{team.name}</p>
                {!team.isSubmitted && (
                  <button className="btn" onClick={() => { setNewName(team.name); setIsRenaming(true); }} style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                    Rename
                  </button>
                )}
              </>
            )}
          </div>
          
          <div className="alliance__status-bar" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#b5b5b5' }}>
            <span>Payment Proof: 
               <strong style={{ 
                 marginLeft: '8px', 
                 textTransform: 'capitalize', 
                 color: team.paymentStatus === 'verified' ? '#4caf50' : team.paymentStatus === 'rejected' ? '#f44336' : '#ff9800' 
               }}>
                 {team.paymentStatus}
               </strong>
            </span>
          </div>

          <ul className="alliance__roster" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            {team.members.map((m) => (
              <li key={m.id}>
                <span className="alliance__dot" aria-hidden style={{ background: m.id === userId ? 'var(--accent-orange)' : 'var(--border-color)' }} />
                {m.name || 'Unknown User'} {m.id === userId && '(You)'}
              </li>
            ))}
          </ul>

          {!team.isSubmitted && (
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleLeaveTeam}
                disabled={loading}
                style={{ fontSize: '0.85rem' }}
              >
                {loading ? 'Leaving...' : 'Leave Alliance'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="alliance__empty">
          <AnimatePresence mode="wait">
            {mode === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="alliance__empty-text">You are not in an Alliance.</p>
                <p className="alliance__empty-sub">
                  Form an alliance of up to 4 tributes, or join one with a team code.
                </p>
                <div className="alliance__cta">
                  <button className="btn btn-primary" onClick={() => { setMode('create'); setInputValue(''); setError(''); }}>
                    Create Alliance
                  </button>
                  <button className="btn" onClick={() => { setMode('join'); setInputValue(''); setError(''); }}>
                    Join Alliance
                  </button>
                </div>
              </motion.div>
            )}

            {mode === 'create' && (
              <motion.form
                key="create"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCreate}
                className="alliance__form"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <label className="form-label" style={{ textAlign: 'left' }}>
                  Alliance Name
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. The Mockingjays"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    maxLength={30}
                    disabled={loading}
                  />
                </label>
                {error && <div className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</div>}
                <div className="alliance__cta" style={{ marginTop: '0.5rem' }}>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Confirm'}
                  </button>
                  <button className="btn" type="button" onClick={() => setMode('view')} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'join' && (
              <motion.form
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleJoin}
                className="alliance__form"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <label className="form-label" style={{ textAlign: 'left' }}>
                  6-Character Team Code
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. A7X9Q2"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    autoFocus
                    maxLength={6}
                    disabled={loading}
                    style={{ textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                </label>
                {error && <div className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</div>}
                <div className="alliance__cta" style={{ marginTop: '0.5rem' }}>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Joining...' : 'Confirm'}
                  </button>
                  <button className="btn" type="button" onClick={() => setMode('view')} disabled={loading}>
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.section>
  );
}
