'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { EvalTeam, TributeProfile, formatTribute, statusOf } from '@/lib/evaluation';

interface Props {
  team: EvalTeam;
  // While the profile inspector is stacked on top, Escape should only close that.
  inspectorOpen: boolean;
  onViewProfile: (member: TributeProfile) => void;
  onClose: () => void;
}

export default function TeamDetailsModal({ team, inspectorOpen, onViewProfile, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !inspectorOpen && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, inspectorOpen]);

  const status = statusOf(team);

  return (
    <div className="eval-overlay" role="dialog" aria-modal="true" aria-label={`Team details: ${team.name}`} onClick={onClose}>
      <div className="inspector-modal team-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="eval-modal-header">
          <h3>Team Details</h3>
          <button type="button" className="eval-icon-btn" onClick={onClose} aria-label="Close team details">
            <X size={18} />
          </button>
        </div>

        <dl className="inspector-body">
          <div className="inspector-row"><dt>Team Name</dt><dd>{team.name}</dd></div>
          <div className="inspector-row"><dt>Team Code</dt><dd style={{ fontFamily: 'monospace' }}>{team.team_code}</dd></div>
          <div className="inspector-row">
            <dt>Problem Statement</dt>
            <dd>{team.problem_statement ?? <span className="inspector-empty">Not chosen</span>}</dd>
          </div>
          <div className="inspector-row">
            <dt>Status</dt>
            <dd>
              {team.is_submitted ? (
                <span className={`eval-badge eval-badge-${status}`}>{status}</span>
              ) : (
                <span className="eval-badge">not submitted</span>
              )}
            </dd>
          </div>
          <div className="inspector-row">
            <dt>Presentation</dt>
            <dd>{team.is_submitted && team.submission_url ? 'Available — use Evaluate to review' : <span className="inspector-empty">{team.is_submitted ? 'No presentation uploaded' : 'Not submitted yet'}</span>}</dd>
          </div>
        </dl>

        <div className="team-details-members">
          <h4 className="team-details-heading">Members ({team.members.length})</h4>
          {team.members.length === 0 && <p className="inspector-empty">No members found.</p>}
          {team.members.map((m) => (
            <div key={m.id} className="eval-member team-details-member">
              <span>
                {formatTribute(m)}
                {m.id === team.leader_id && <span className="team-details-leader"> · Leader</span>}
              </span>
              <button type="button" className="eval-link-btn" onClick={() => onViewProfile(m)}>View Profile</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
