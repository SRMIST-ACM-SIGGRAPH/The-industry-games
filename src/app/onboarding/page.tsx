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

// SRMIST registration numbers look like RA2611003010123 (RA + 13 digits).
const REG_PATTERN = /^RA\d{13}$/i;
const PHONE_PATTERN = /^[6-9]\d{9}$/; // 10-digit Indian mobile
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GITHUB_PATTERN = /^https:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?.*$/i;
const LINKEDIN_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?.*$/i;

export default function Onboarding() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const [fullName, setFullName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [otherDepartment, setOtherDepartment] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [phone, setPhone] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

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
      if (profile?.college_email) setCollegeEmail(profile.college_email);
      if (profile?.registration_number) setRegNumber(profile.registration_number);
      if (profile?.department) {
        if (DEPARTMENTS.includes(profile.department)) {
          setDepartment(profile.department);
        } else {
          setDepartment('Other');
          setOtherDepartment(profile.department);
        }
      }
      if (profile?.academic_year) setAcademicYear(profile.academic_year);
      if (profile?.phone_number) setPhone(profile.phone_number);
      if (profile?.github_url) setGithubUrl(profile.github_url);
      if (profile?.linkedin_url) setLinkedinUrl(profile.linkedin_url);
      setChecking(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [router]);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Full name is required.';
    if (!EMAIL_PATTERN.test(collegeEmail.trim())) return 'Enter a valid college email address.';
    if (!REG_PATTERN.test(regNumber.trim()))
      return 'Enter a valid SRM registration number (e.g. RA2611003010123).';
    if (!department) return 'Please select your department / branch.';
    if (department === 'Other' && !otherDepartment.trim()) return 'Please specify your department.';
    if (!academicYear) return 'Please select your academic year.';
    if (!PHONE_PATTERN.test(phone.trim()))
      return 'Enter a valid 10-digit mobile number.';
    if (!GITHUB_PATTERN.test(githubUrl.trim())) return 'Enter a valid GitHub profile URL.';
    if (!LINKEDIN_PATTERN.test(linkedinUrl.trim())) return 'Enter a valid LinkedIn profile URL.';
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
    
    const finalDepartment = department === 'Other' ? otherDepartment.trim() : department;

    const { error: upsertError } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName.trim(),
        college_email: collegeEmail.trim(),
        registration_number: regNumber.trim().toUpperCase(),
        department: finalDepartment,
        academic_year: academicYear,
        phone_number: phone.trim(),
        github_url: githubUrl.trim(),
        linkedin_url: linkedinUrl.trim(),
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
            <label htmlFor="collegeEmail">College Email</label>
            <input
              id="collegeEmail"
              className="input-field"
              type="email"
              value={collegeEmail}
              onChange={(e) => setCollegeEmail(e.target.value)}
              placeholder="katniss.everdeen@srmist.edu.in"
              autoComplete="email"
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
              placeholder="RA2611003010123"
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

          {department === 'Other' && (
            <div className="form-group">
              <label htmlFor="otherDepartment">Specify Department</label>
              <input
                id="otherDepartment"
                className="input-field"
                type="text"
                value={otherDepartment}
                onChange={(e) => setOtherDepartment(e.target.value)}
                placeholder="e.g. Architecture"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <select
              id="academicYear"
              className="input-field"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="" disabled>Select Year…</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Passed Out">Passed Out</option>
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

          <div className="form-group">
            <label htmlFor="githubUrl">GitHub Profile URL</label>
            <input
              id="githubUrl"
              className="input-field"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="linkedinUrl">LinkedIn Profile URL</label>
            <input
              id="linkedinUrl"
              className="input-field"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/username"
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
