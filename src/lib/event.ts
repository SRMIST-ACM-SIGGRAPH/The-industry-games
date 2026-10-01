// Single source of truth for the event countdown deadline.
// Change this one value to re-point every countdown clock in the app.
//
// Target: 9th October 2026, 00:00 (Asia/Kolkata, UTC+05:30).
// NOTE: This is the EVENT countdown target shown to visitors. It is NOT the
// Oct 2 development/issue deadline — that is only our internal coding cutoff
// and must never be displayed as the countdown.
//
// Stored as an absolute instant (with offset) so the server and client always
// agree on the moment — this is what keeps <CountdownTimer /> hydration-safe.
export const EVENT_DEADLINE = '2026-10-09T00:00:00+05:30';

// Human-readable caption shown next to the clock.
export const EVENT_DEADLINE_LABEL = 'Registration & Submission Deadline';
