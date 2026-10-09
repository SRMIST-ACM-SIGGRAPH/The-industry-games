// Single source of truth for event deadlines.
// Registration closed: 8th October 2026, 17:00:00 (Asia/Kolkata, UTC+05:30).
export const EVENT_DEADLINE = '2026-10-08T17:00:00+05:30';
export const EVENT_DEADLINE_LABEL = 'Registration Closed (Oct 8, 5 PM)';

// Submission grace period ended: 8th October 2026, 17:05:00 IST
export const SUBMISSION_DEADLINE = '2026-10-08T17:05:00+05:30';
export const SUBMISSION_DEADLINE_LABEL = 'Submission Grace Period Ended (Oct 8, 5:05 PM)';

// Hackathon end time: 10th October 2026, 11:00:00 IST
export const HACKATHON_END = '2026-10-10T11:00:00+05:30';
export const HACKATHON_END_LABEL = 'Arena Closes (Oct 10, 11:00 AM)';

export function isRegistrationClosed(): boolean {
  return Date.now() >= new Date(EVENT_DEADLINE).getTime();
}

export function isSubmissionClosed(): boolean {
  return Date.now() >= new Date(SUBMISSION_DEADLINE).getTime();
}

export function isWithinGracePeriod(): boolean {
  const now = Date.now();
  return now >= new Date(EVENT_DEADLINE).getTime() && now < new Date(SUBMISSION_DEADLINE).getTime();
}

