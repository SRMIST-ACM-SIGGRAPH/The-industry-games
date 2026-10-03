'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  // Absolute instant to count down to (ISO string with offset, or a Date).
  deadline: string | Date;
  // 'hero' = large landing treatment, 'compact' = dashboard strip.
  variant?: 'hero' | 'compact';
  // Optional caption rendered above the digits.
  label?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function getTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    done: false,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function CountdownTimer({
  deadline,
  variant = 'hero',
  label,
}: CountdownTimerProps) {
  const target =
    typeof deadline === 'string'
      ? new Date(deadline).getTime()
      : deadline.getTime();

  // Hydration guard: the server and the first client paint render identical
  // placeholder markup ("--"), then we swap to live values only after mount.
  // Date.now() differs between server and client, so computing digits during
  // SSR would trigger a hydration mismatch and a visible layout shift. The
  // placeholder reserves the exact same box, so nothing jumps when it fills in.
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(target));
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (mounted && timeLeft.done) {
    return (
      <div
        className={`countdown countdown--${variant} countdown--done`}
        role="timer"
        aria-live="polite"
      >
        {label && <span className="countdown__label">{label}</span>}
        <span className="countdown__ended">Registrations Have Concluded</span>
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <div
      className={`countdown countdown--${variant}`}
      role="timer"
      aria-live="polite"
    >
      {label && <span className="countdown__label">{label}</span>}
      <div className="countdown__units">
        {units.map((u) => (
          <div className="countdown__unit" key={u.label}>
            <span className="countdown__value" suppressHydrationWarning>
              {mounted ? pad(u.value) : '--'}
            </span>
            <span className="countdown__unit-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
