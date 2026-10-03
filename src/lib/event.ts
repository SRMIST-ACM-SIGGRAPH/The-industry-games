// Single source of truth for event deadlines.
// Target: 7th October 2026, 23:59:59 (Asia/Kolkata, UTC+05:30).
export const EVENT_DEADLINE = '2026-10-07T23:59:59+05:30';
export const EVENT_DEADLINE_LABEL = 'Registration Closes (Oct 7)';

// 5-minute grace period for submissions: 8th October 2026, 00:04:59 IST
export const SUBMISSION_DEADLINE = '2026-10-08T00:04:59+05:30';
export const SUBMISSION_DEADLINE_LABEL = 'Submission Grace Period (Oct 8, 12:05 AM)';

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

