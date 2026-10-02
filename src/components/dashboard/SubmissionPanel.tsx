import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EVENT_DEADLINE_LABEL } from '@/lib/event';
import { TeamView } from './AlliancePanel';
import { Receipt, Presentation, Lock, CheckCircle2 } from 'lucide-react';

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
      style={{ 
        marginTop: '2rem', 
        borderTop: '3px solid var(--accent-gold)', 
        background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.05) 0%, var(--panel-bg) 100%)' 
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 className="panel__title" style={{ marginBottom: '0.25rem' }}>Project Submission</h2>
          <p style={{ color: '#888', fontSize: '0.9rem' }}>Upload your payment proof and final presentation here.</p>
        </div>
      </div>
      
      {error && <p className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</p>}
      
      {team.isSubmitted ? (
        <div style={{ 
          background: 'rgba(76, 175, 80, 0.08)', 
          padding: '2rem', 
          borderRadius: '8px', 
          border: '1px solid #4caf50',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <CheckCircle2 size={48} color="#4caf50" />
          <div>
            <strong style={{ color: '#4caf50', fontSize: '1.4rem', display: 'block', marginBottom: '0.25rem' }}>Successfully Submitted!</strong>
            <p style={{ fontSize: '1rem', color: '#ccc', margin: 0 }}>Your project is locked in for review. Excellent work, Tribute.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          
          {/* Upload Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span className="alliance__code-label">1. Payment Verification</span>
              <label className="btn" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                cursor: loading ? 'wait' : 'pointer', background: 'transparent', border: '1px solid var(--border-color)', opacity: loading ? 0.7 : 1 
              }}>
                <Receipt size={20} />
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span className="alliance__code-label">2. Pitch Presentation</span>
              <label className="btn" style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                border: '1px dashed var(--accent-gold)'
              }}>
                <Presentation size={20} />
                {team.submissionReady ? 'Re-upload Presentation (PPT/PDF)' : 'Upload Presentation (PPT/PDF)'}
                <input 
                  type="file" 
                  accept=".ppt,.pptx,application/pdf" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleUpload(e, 'submission')}
                  disabled={loading}
                />
              </label>
              <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
                You can re-upload to replace your file as many times as needed until you lock it.
              </p>
            </div>
          </div>

          {/* Submission Lock Area */}
          <div style={{ 
            background: 'rgba(212, 175, 55, 0.05)', 
            padding: '2rem', 
            borderRadius: '8px', 
            border: '1px solid rgba(212, 175, 55, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Lock In Your Submission</h3>
            <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
              Once you lock and submit, your presentation file becomes immutable and cannot be changed. All un-submitted teams will be automatically force-submitted at <strong>{EVENT_DEADLINE_LABEL}</strong>.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', opacity: !team.submissionReady || loading ? 0.5 : 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              disabled={!team.submissionReady || loading}
              onClick={handleFinalSubmit}
            >
              <Lock size={18} /> Lock & Submit Project
            </button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
