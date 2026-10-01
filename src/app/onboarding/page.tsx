'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { getProfile, isProfileComplete } from '@/lib/profile';

const DEPARTMENTS = [
  'CSE - Core',
  'CSE - AI & ML',
  'CSE - Data Science',
  'CSE - Cyber Security',
  'CSE - IoT',
  'Information Technology',
  'ECE',
  'EEE',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Mechatronics',
  'Other',
];

// SRMIST registration numbers look like RA2211003010123 (RA + 13 digits).
const REG_PATTERN = /^RA\d{13}$/i;
const PHONE_PATTERN = /^[6-9]\d{9}$/; // 10-digit Indian mobile

export default function Onboarding() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [fullName, setFullName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Route guard: must be logged in; if already onboarded, skip to dashboard.
  // Running this on both /onboarding and /dashboard is what stops a user from
  // bypassing onboarding by typing /dashboard straight into the URL bar.
  useEffect(() => {
    let active = true;
    const run = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const profile = await getProfile(session.user.id);
      if (isProfileComplete(profile)) {
        router.replace('/dashboard');
        return;
      }
      if (!active) return;
      setUser(session.user);
      if (profile?.full_name) setFullName(profile.full_name);
      setChecking(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [router]);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!REG_PATTERN.test(regNumber.trim()))
      return 'Enter a valid SRM registration number (e.g. RA2211003010123).';
    if (!department) return 'Please select your department / branch.';
    if (!PHONE_PATTERN.test(phone.trim()))
      return 'Enter a valid 10-digit mobile number.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    if (!user) {
      setError('Session expired. Please log in again.');
      return;
    }

    setSubmitting(true);
    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        registration_number: regNumber.trim().toUpperCase(),
        department,
        phone_number: phone.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      setError(upsertError.message);
      setSubmitting(false);
      return;
    }
    router.replace('/dashboard');
  };

  if (checking) {
    return (
      <div className="onboarding-loading">
        <span className="spinner" aria-hidden />
        <p>Verifying your credentials…</p>
      </div>
    );
  }

  return (
    <div className="onboarding">
      <motion.div
        className="onboarding__card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <span className="onboarding__accent" />
        <h1 className="onboarding__title">Tribute Enrollment</h1>
        <p className="onboarding__subtitle">
          Before you enter the arena, the Capitol requires your records.
          Complete your profile to unlock the dashboard.
        </p>

        <form className="onboarding__form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              className="input-field"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Katniss Everdeen"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="regNumber">Registration Number</label>
            <input
              id="regNumber"
              className="input-field"
              type="text"
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
              placeholder="RA2211003010123"
              maxLength={15}
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department / Branch</label>
            <select
              id="department"
              className="input-field"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" disabled>
                Select your district…
              </option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Contact Number</label>
            <input
              id="phone"
              className="input-field"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="9876543210"
              maxLength={10}
              autoComplete="tel"
            />
          </div>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary onboarding__submit"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner spinner--sm" aria-hidden /> Enrolling…
              </>
            ) : (
              'Complete Enrollment'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
