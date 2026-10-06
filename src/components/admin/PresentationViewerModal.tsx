'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { EvalStatus, EvalTeam, TRANSITIONS, statusOf } from '@/lib/evaluation';

interface Props {
  team: EvalTeam;
  authToken: string;
  busy: boolean;
  onTransition: (to: EvalStatus) => void;
  onClose: () => void;
}

const ACTION_LABELS: Record<EvalStatus, string> = {
  pending: 'Reset',
  staged: 'Stage Team',
  shortlisted: 'Shortlist',
  rejected: 'Reject',
};

// Mount with key={team.id} so the onLoad guard resets for every team.
export default function PresentationViewerModal({ team, authToken, busy, onTransition, onClose }: Props) {
  const [loaded, setLoaded] = useState(false);
  const status = statusOf(team);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const streamUrl = `${window.location.origin}/api/storage/view?key=${encodeURIComponent(team.submission_url ?? '')}&token=${encodeURIComponent(authToken)}`;
  const viewerUrl = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(streamUrl)}`;

  return (
    <div className="eval-overlay" role="dialog" aria-modal="true" aria-label={`Evaluate ${team.name}`}>
      <div className="viewer-modal">
        <div className="eval-modal-header">
          <h3>Evaluate: {team.name}</h3>
          <button type="button" className="eval-icon-btn" onClick={onClose} aria-label="Close viewer">
            <X size={18} />
          </button>
        </div>

        <div className="viewer-stream-note">
          {loaded ? (
            <span>Document loaded.</span>
          ) : (
            <span><Loader2 size={14} className="spinning-icon" /> Document streaming from R2... Please view before staging.</span>
          )}
        </div>

        <div className="viewer-frame-wrap">
          <iframe
            src={viewerUrl}
            title={`${team.name} presentation`}
            className="viewer-frame"
            onLoad={() => setLoaded(true)}
          />
        </div>

        <div className="viewer-footer">
          {TRANSITIONS[status].map((to) => {
            const isStage = to === 'staged';
            // Evaluation guard: staging stays locked until the iframe fires onLoad.
            const locked = busy || (isStage && !loaded);
            const reject = to === 'rejected';
            return (
              <button
                key={to}
                type="button"
                disabled={locked}
                onClick={() => onTransition(to)}
                className={`btn ${reject ? '' : 'btn-primary'}`}
                style={reject ? { borderColor: 'var(--accent-red)', color: '#e74c3c' } : undefined}
              >
                {isStage && !loaded ? 'Loading document…' : status === 'shortlisted' && isStage ? 'Revert to Staged' : status === 'rejected' && isStage ? 'Reconsider (Stage)' : ACTION_LABELS[to]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
