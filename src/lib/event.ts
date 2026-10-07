// Single source of truth for event deadlines.
// Target: 8th October 2026, 17:00:00 (Asia/Kolkata, UTC+05:30).
export const EVENT_DEADLINE = '2026-10-08T17:00:00+05:30';
export const EVENT_DEADLINE_LABEL = 'Registration Closes (Oct 8, 5 PM)';

// 5-minute grace period for submissions: 8th October 2026, 17:05:00 IST
export const SUBMISSION_DEADLINE = '2026-10-08T17:05:00+05:30';
export const SUBMISSION_DEADLINE_LABEL = 'Submission Grace Period (Oct 8, 5:05 PM)';

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

