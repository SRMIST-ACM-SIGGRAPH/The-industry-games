import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Copy, Check } from 'lucide-react';

export interface TeamView {
  id: string;
  name: string;
  teamCode: string;
  paymentStatus: 'pending' | 'verified' | 'rejected';
  submissionReady: boolean;
  submissionUrl: string | null;
  isSubmitted: boolean;
  problemStatement: string | null;
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
  const [copied, setCopied] = useState(false);
  
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
    
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
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

    const { error: rpcError } = await supabase.rpc('join_ig_team', { p_team_code: inputValue.trim().toUpperCase() });
    
    if (rpcError) {
      setError(rpcError.message.replace('P0001: ', ''));
      setLoading(false);
      return;
    }

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
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProblemStatementChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!team || team.isSubmitted) return;
    setLoading(true);
    const { error: psError } = await supabase
      .from('ig_teams')
      .update({ problem_statement: val })
      .eq('id', team.id);
      
    if (psError) {
      setError(psError.message);
    } else {
      await fetchFullTeam(team.id);
    }
    setLoading(false);
  };

  return (
    <motion.section
      className="panel alliance"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <h2 className="panel__title">Alliance / Team</h2>

      {team ? (
        <div className="alliance__active" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {error && <p className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '1.5rem' }}>
            <span className="alliance__code-label" style={{ marginBottom: '0.5rem' }}>Join Code</span>
            <div 
              onClick={copyToClipboard}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'rgba(212, 175, 55, 0.08)', 
                border: '1px dashed var(--accent-gold)', 
                padding: '1rem', 
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: copied ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)'}
            >
              <span className="alliance__code-value" style={{ letterSpacing: '0.3em', margin: 0 }}>
                {team.teamCode}
              </span>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {copied ? (
                  <>
                    <Check size={18} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} /> Copy
                  </>
                )}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {isRenaming ? (
              <form onSubmit={handleRenameTeam} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  defaultValue={team.name} 
                  onChange={(e) => setNewName(e.target.value)} 
                  autoFocus 
                  maxLength={30} 
                  disabled={loading}
                  style={{ padding: '0.5rem', flexGrow: 1 }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.5rem 1rem' }}>Save</button>
                <button type="button" className="btn" onClick={() => setIsRenaming(false)} disabled={loading} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
              </form>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <p className="alliance__name" style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold' }}>{team.name}</p>
                {!team.isSubmitted && (
                  <button className="btn" onClick={() => { setNewName(team.name); setIsRenaming(true); }} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                    Rename
                  </button>
                )}
              </div>
            )}
          </div>
          


          <div style={{ flexGrow: 1 }}>
            <span className="alliance__code-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Roster</span>
            <ul className="alliance__roster" style={{ margin: '0' }}>
              {team.members.map((m) => (
                <li key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', color: '#ddd' }}>
                  <span className="alliance__dot" aria-hidden style={{ background: m.id === userId ? 'var(--accent-orange)' : 'var(--border-color)' }} />
                  {m.name || 'Unknown User'} {m.id === userId && <span style={{ color: '#888', fontSize: '0.85rem' }}>(You)</span>}
                </li>
              ))}
            </ul>
          </div>

          {!team.isSubmitted && (
            <div style={{ marginTop: '2rem' }}>
              <button 
                className="btn btn-danger" 
                onClick={handleLeaveTeam}
                disabled={loading}
                style={{ fontSize: '0.85rem', width: '100%' }}
              >
                {loading ? 'Leaving...' : 'Leave Alliance'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="alliance__empty" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
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
                <div className="alliance__cta" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <label className="form-group" style={{ textAlign: 'left' }}>
                  Alliance Name
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. The Mockingjays"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    maxLength={30}
                    disabled={loading}
                  />
                </label>
                {error && <div className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</div>}
                <div className="alliance__cta" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
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
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                <label className="form-group" style={{ textAlign: 'left' }}>
                  6-Character Team Code
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. A7X9Q2"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                    autoFocus
                    maxLength={6}
                    disabled={loading}
                    style={{ textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 'bold', textAlign: 'center' }}
                  />
                </label>
                {error && <div className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{error}</div>}
                <div className="alliance__cta" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
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
