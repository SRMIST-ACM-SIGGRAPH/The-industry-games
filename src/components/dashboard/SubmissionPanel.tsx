import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EVENT_DEADLINE_LABEL } from '@/lib/event';
import { TeamView } from './AlliancePanel';

interface SubmissionPanelProps {
  team: TeamView;
  onTeamUpdate: (team: TeamView | null) => void;
  fetchFullTeam: (teamId: string) => Promise<void>;
}

export default function SubmissionPanel({ team, fetchFullTeam }: SubmissionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'proof' | 'submission') => {
    const file = e.target.files?.[0];
    if (!file || !team) return;

    setLoading(true);
    setError('');

    const bucket = type === 'proof' ? 'ig_payment_proofs' : 'ig_submissions';
    const fileExt = file.name.split('.').pop();
    const fileName = `${team.id}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const updateField = type === 'proof' ? { payment_proof_url: publicUrl } : { submission_url: publicUrl };

    const { error: updateError } = await supabase
      .from('ig_teams')
      .update(updateField)
      .eq('id', team.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await fetchFullTeam(team.id);
    }
    setLoading(false);
  };

  const handleFinalSubmit = async () => {
    if (!team || !team.submissionReady) return;
    if (!confirm('Are you sure you want to lock and submit? You cannot re-upload after this point.')) return;

    setLoading(true);
    const { error: updateError } = await supabase
      .from('ig_teams')
      .update({ is_submitted: true })
      .eq('id', team.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await fetchFullTeam(team.id);
    }
    setLoading(false);
  };

  return (
    <motion.section
      className="panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ marginTop: '2rem' }}
    >
      <h2 className="panel__title">Project Submission</h2>
      {error && <p className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
      
      {team.isSubmitted ? (
        <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '1.5rem', borderRadius: '4px', border: '1px solid #4caf50' }}>
          <strong style={{ color: '#4caf50', fontSize: '1.2rem' }}>✓ Successfully Submitted!</strong>
          <p style={{ fontSize: '1rem', color: '#ccc', margin: '0.5rem 0 0 0' }}>Your project is locked in for review. Excellent work, Tribute.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Upload Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="btn" style={{ display: 'block', textAlign: 'center', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {team.submissionReady ? 'Re-upload Presentation (PPT/PDF)' : 'Upload Presentation (PPT/PDF)'}
                <input 
                  type="file" 
                  accept=".ppt,.pptx,application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleUpload(e, 'submission')}
                  disabled={loading}
                />
              </label>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>
                You can re-upload to replace your file as many times as needed until you lock it.
              </p>
            </div>

            <div>
              <label className="btn" style={{ display: 'block', textAlign: 'center', cursor: loading ? 'wait' : 'pointer', background: 'transparent', border: '1px solid var(--border-color)', opacity: loading ? 0.7 : 1 }}>
                {team.paymentStatus !== 'pending' ? 'Re-upload Payment Proof (Image/PDF)' : 'Upload Payment Proof (Image/PDF)'}
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleUpload(e, 'proof')}
                  disabled={loading}
                />
              </label>
            </div>
          </div>

          {/* Submission Lock Area */}
          <div style={{ background: 'rgba(212, 175, 55, 0.05)', padding: '1.5rem', borderRadius: '4px', border: '1px dashed var(--accent-gold)' }}>
            <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
              Once you lock and submit, your file becomes immutable and cannot be changed. All un-submitted teams will be auto-submitted at <strong>{EVENT_DEADLINE_LABEL}</strong>.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', opacity: !team.submissionReady || loading ? 0.5 : 1 }}
              disabled={!team.submissionReady || loading}
              onClick={handleFinalSubmit}
            >
              Lock & Submit Project
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
