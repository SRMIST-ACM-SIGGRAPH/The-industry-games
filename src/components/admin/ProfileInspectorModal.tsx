'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { TributeProfile, safeHttpUrl } from '@/lib/evaluation';

function LinkRow({ label, url }: { label: string; url?: string | null }) {
  const safe = safeHttpUrl(url);
  return (
    <div className="inspector-row">
      <dt>{label}</dt>
      <dd>
        {safe ? (
          <a href={safe} target="_blank" rel="noopener noreferrer">{safe}</a>
        ) : (
          <span className="inspector-empty">—</span>
        )}
      </dd>
    </div>
  );
}

export default function ProfileInspectorModal({ profile, onClose }: { profile: TributeProfile; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="eval-overlay" role="dialog" aria-modal="true" aria-label="Tribute profile" onClick={onClose}>
      <div className="inspector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="eval-modal-header">
          <h3>Tribute Profile</h3>
          <button type="button" className="eval-icon-btn" onClick={onClose} aria-label="Close profile">
            <X size={18} />
          </button>
        </div>
        <dl className="inspector-body">
          <div className="inspector-row"><dt>Full Name</dt><dd>{profile.full_name}</dd></div>
          <div className="inspector-row"><dt>Registration No.</dt><dd>{profile.registration_number}</dd></div>
          <div className="inspector-row"><dt>College Email</dt><dd>{profile.college_email}</dd></div>
          <div className="inspector-row"><dt>Phone</dt><dd>{profile.phone_number}</dd></div>
          <div className="inspector-row"><dt>Department</dt><dd>{profile.department}</dd></div>
          <div className="inspector-row"><dt>Year of Study</dt><dd>{profile.academic_year}</dd></div>
          <LinkRow label="GitHub" url={profile.github_url} />
          <LinkRow label="Portfolio" url={profile.portfolio_url} />
          <LinkRow label="LinkedIn" url={profile.linkedin_url} />
        </dl>
      </div>
    </div>
  );
}
