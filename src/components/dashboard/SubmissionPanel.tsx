import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EVENT_DEADLINE_LABEL } from '@/lib/event';
import { TeamView } from './AlliancePanel';
import { Receipt, Presentation, Lock, CheckCircle2, Eye, UploadCloud } from 'lucide-react';

interface SubmissionPanelProps {
  team: TeamView;
  onTeamUpdate: (team: TeamView | null) => void;
  fetchFullTeam: (teamId: string) => Promise<void>;
}

export default function SubmissionPanel({ team, fetchFullTeam }: SubmissionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'proof' | 'submission') => {
    const file = e.target.files?.[0];
    if (!file || !team) return;

    setError('');
    
    // File size validation
    const maxSize = type === 'proof' ? 2 * 1024 * 1024 : 15 * 1024 * 1024; // 2MB or 15MB
    if (file.size > maxSize) {
      setError(`File size exceeds the maximum limit of ${type === 'proof' ? '2MB' : '15MB'}. Please choose a smaller file.`);
      return;
    }

    setLoading(true);

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
    // Force cache bust on the public URL so the view button loads the new image immediately
    const cacheBustedUrl = `${publicUrl}?t=${Date.now()}`;
    const updateField = type === 'proof' ? { payment_proof_url: cacheBustedUrl } : { submission_url: cacheBustedUrl };

    const { error: updateError } = await supabase
      .from('ig_teams')
      .update(updateField)
      .eq('id', team.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await fetchFullTeam(team.id);
      showToast(type === 'proof' ? 'Payment Proof uploaded successfully!' : 'Presentation uploaded successfully!');
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
      showToast('Project successfully locked and submitted!');
    }
    setLoading(false);
  };

  return (
    <>
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              background: 'rgba(76, 175, 80, 0.95)',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 9999,
              border: '1px solid #4caf50'
            }}
          >
            <CheckCircle2 size={24} />
            <span style={{ fontWeight: 600, letterSpacing: '0.05em' }}>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {team.paymentProofUrl && (
                <a href={team.paymentProofUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> View Payment Proof
                </a>
              )}
              {team.submissionUrl && (
                <a href={team.submissionUrl} target="_blank" rel="noreferrer" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> View Presentation
                </a>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            
            {/* Upload Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="alliance__code-label">1. Payment Verification</span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>(Max 2MB)</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label className="btn" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', 
                    cursor: loading ? 'wait' : 'pointer', background: 'transparent', border: '1px solid var(--border-color)', opacity: loading ? 0.7 : 1, flex: 1, padding: '0.75rem 0.5rem' 
                  }}>
                    <UploadCloud size={18} />
                    {team.paymentProofUrl ? 'Re-upload Proof' : 'Upload Proof (Image/PDF)'}
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleUpload(e, 'proof')}
                      disabled={loading}
                    />
                  </label>
                  
                  {team.paymentProofUrl && (
                    <a href={team.paymentProofUrl} target="_blank" rel="noreferrer" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem' }} title="View Uploaded File">
                      <Eye size={18} />
                    </a>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="alliance__code-label">2. Pitch Presentation</span>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>(Max 15MB)</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <label className="btn" style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
                    border: '1px dashed var(--accent-gold)', flex: 1, padding: '0.75rem 0.5rem'
                  }}>
                    <UploadCloud size={18} />
                    {team.submissionUrl ? 'Re-upload Presentation' : 'Upload Presentation (PPT/PDF)'}
                    <input 
                      type="file" 
                      accept=".ppt,.pptx,application/pdf" 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleUpload(e, 'submission')}
                      disabled={loading}
                    />
                  </label>
                  
                  {team.submissionUrl && (
                    <a href={team.submissionUrl} target="_blank" rel="noreferrer" className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', border: '1px dashed var(--accent-gold)' }} title="View Uploaded File">
                      <Eye size={18} />
                    </a>
                  )}
                </div>
                
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
    </>
  );
}
