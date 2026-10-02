import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { EVENT_DEADLINE_LABEL } from '@/lib/event';
import { TeamView } from './AlliancePanel';
import { Receipt, Presentation, Lock, CheckCircle2, Eye, UploadCloud, X, AlertTriangle } from 'lucide-react';

interface SubmissionPanelProps {
  team: TeamView;
  onTeamUpdate: (team: TeamView | null) => void;
  fetchFullTeam: (teamId: string) => Promise<void>;
}

const PreviewModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.85)', zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          background: 'var(--panel-bg)', width: '100%', maxWidth: '900px', height: '85vh',
          borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: 'var(--accent-gold)', margin: 0, fontFamily: 'var(--font-display)' }}>File Preview</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        </div>
        <div style={{ flex: 1, padding: '1rem', overflow: 'hidden' }}>
          <iframe 
            src={url} 
            title="File Preview"
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '4px', background: '#fff' }} 
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function SubmissionPanel({ team, fetchFullTeam }: SubmissionPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleViewFile = async (type: 'proof' | 'submission') => {
    const bucket = type === 'proof' ? 'ig_payment_proofs' : 'ig_submissions';
    
    // We now just extract the file name directly (since we store it directly now, but for legacy it might be a full URL, so we extract it)
    const rawValue = type === 'proof' ? team.paymentProofUrl : team.submissionUrl;
    if (!rawValue) return;

    // Extract filename from old CDN format or just use the raw value if it's already a filename
    const fileName = rawValue.split('/').pop()?.split('?')[0] || rawValue;

    setLoading(true);
    setError('');

    // Request a signed URL valid for 60 minutes
    const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(fileName, 60 * 60);
    
    if (signError) {
      setError(`Could not access file: ${signError.message}`);
      setLoading(false);
      return;
    }

    if (data?.signedUrl) {
      setPreviewUrl(data.signedUrl);
    }
    setLoading(false);
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

    // Explicitly fetch the team row from DB to get the LATEST URL
    const { data: latestTeam } = await supabase.from('ig_teams').select('payment_proof_url, submission_url').eq('id', team.id).single();

    if (latestTeam) {
      const oldUrl = type === 'proof' ? latestTeam.payment_proof_url : latestTeam.submission_url;
      if (oldUrl) {
        await supabase.storage.from(bucket).remove([oldUrl]);
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      if (uploadError.message.includes('Bucket not found')) {
        setError(`Database Error: The storage bucket '${bucket}' does not exist. Please contact the administrators.`);
      } else {
        setError(uploadError.message);
      }
      setLoading(false);
      return;
    }

    // Store the raw fileName in the database instead of a public URL
    // since the bucket is private and we must generate signed URLs on the fly
    const updateField = type === 'proof' ? { payment_proof_url: fileName } : { submission_url: fileName };

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
    setShowConfirmModal(false);

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

      <AnimatePresence>
        {previewUrl && <PreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.85)', zIndex: 10000,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
            }}
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                background: 'var(--panel-bg)', width: '100%', maxWidth: '400px',
                borderRadius: '8px', border: '1px solid var(--border-color)', padding: '2rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(10px)'
              }}
            >
              <AlertTriangle size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Lock Project Submission?</h3>
              <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Are you sure you want to lock and submit? <br/><br/>
                <strong style={{ color: 'var(--accent-gold)' }}>You cannot re-upload any files after this point.</strong>
              </p>
              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button className="btn" onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleFinalSubmit} style={{ flex: 1, padding: '0.75rem' }}>Yes, Lock It</button>
              </div>
            </motion.div>
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
        
        {error && <p className="form-error" style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {error}
        </p>}
        
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
                <button onClick={() => handleViewFile('proof')} disabled={loading} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> View Payment Proof
                </button>
              )}
              {team.submissionUrl && (
                <button onClick={() => handleViewFile('submission')} disabled={loading} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Eye size={16} /> View Presentation
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
            
            {/* Upload Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="alliance__code-label">1. Pitch Presentation</span>
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
                    <button type="button" onClick={() => handleViewFile('submission')} disabled={loading} className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem', border: '1px dashed var(--accent-gold)' }} title="View Uploaded File">
                      <Eye size={18} />
                    </button>
                  )}
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
                  You can re-upload to replace your file as many times as needed until you lock it.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span className="alliance__code-label">2. Payment Verification</span>
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
                    <button type="button" onClick={() => handleViewFile('proof')} disabled={loading} className="btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 1rem' }} title="View Uploaded File">
                      <Eye size={18} />
                    </button>
                  )}
                </div>
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
              <h3 style={{ color: 'var(--accent-gold)', margin: '0 0 1rem 0', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>Lock In Your Submission</h3>
              <p style={{ fontSize: '0.95rem', color: '#ccc', margin: '0 0 1.5rem 0', lineHeight: 1.6 }}>
                Once you lock and submit, your presentation file becomes immutable and cannot be changed. All un-submitted teams will be automatically force-submitted at <strong>{EVENT_DEADLINE_LABEL}</strong>.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', opacity: !team.submissionReady || loading ? 0.5 : 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={!team.submissionReady || loading}
                onClick={() => setShowConfirmModal(true)}
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
