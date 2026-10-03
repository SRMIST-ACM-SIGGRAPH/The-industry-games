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

import { isRegistrationClosed } from '@/lib/event';

export default function Onboarding() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [regClosed, setRegClosed] = useState(false);

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

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
      if (isRegistrationClosed()) {
        if (active) {
          setRegClosed(true);
          setChecking(false);
        }
        return;
      }
      if (!active) return;
      setUser(session.user);
      if (profile?.full_name) setFullName(profile.full_name);
      
      if (profile?.college_email) {
        setCollegeEmail(profile.college_email);
      } else if (session.user.email) {
        setCollegeEmail(session.user.email);
      }

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

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Full name is required.';
      case 'collegeEmail':
        return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid college email address.';
      case 'regNumber':
        return REG_PATTERN.test(value.trim()) ? '' : 'Enter a valid SRM registration number (e.g. RA2611003010123).';
      case 'department':
        return value ? '' : 'Please select your department / branch.';
      case 'otherDepartment':
        return value.trim() ? '' : 'Please specify your department.';
      case 'academicYear':
        return value ? '' : 'Please select your academic year.';
      case 'phone':
        return PHONE_PATTERN.test(value.trim()) ? '' : 'Enter a valid 10-digit mobile number.';
      case 'githubUrl':
        if (!value.trim()) return '';
        return GITHUB_PATTERN.test(value.trim()) ? '' : 'Enter a valid GitHub profile URL.';
      case 'linkedinUrl':
        if (!value.trim()) return '';
        return LINKEDIN_PATTERN.test(value.trim()) ? '' : 'Enter a valid LinkedIn profile URL.';
      default:
        return '';
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    // For 'otherDepartment', validate only if department is 'Other'
    if (id === 'otherDepartment' && department !== 'Other') return;
    
    const errorMsg = validateField(id, value);
    setErrors((prev) => ({ ...prev, [id]: errorMsg }));
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {
      fullName: validateField('fullName', fullName),
      collegeEmail: validateField('collegeEmail', collegeEmail),
      regNumber: validateField('regNumber', regNumber),
      department: validateField('department', department),
      otherDepartment: department === 'Other' ? validateField('otherDepartment', otherDepartment) : '',
      academicYear: validateField('academicYear', academicYear),
      phone: validateField('phone', phone),
      githubUrl: validateField('githubUrl', githubUrl),
      linkedinUrl: validateField('linkedinUrl', linkedinUrl),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => err !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validateAll()) {
      return;
    }
    if (!user) {
      setSubmitError('Session expired. Please log in again.');
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
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      setSubmitError(upsertError.message);
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

  if (regClosed) {
    return (
      <div className="onboarding">
        <motion.div
          className="onboarding__card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', padding: '3rem 2rem' }}
        >
          <span className="onboarding__accent" />
          <h1 className="onboarding__title" style={{ color: 'var(--accent-orange)' }}>
            Registrations Have Concluded
          </h1>
          <p className="onboarding__subtitle" style={{ marginBottom: '2rem' }}>
            The registration window for the 1st Annual Industry Games has closed. New tributes can no longer be enrolled into the arena.
          </p>
          <button
            className="btn"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
          >
            Return to Arena Home
          </button>
        </motion.div>
      </div>
    );
  }

  const renderFieldError = (fieldName: string) => {
    return errors[fieldName] ? (
      <span style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.375rem', display: 'block' }}>
        {errors[fieldName]}
      </span>
    ) : null;
  };

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
              className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
              type="text"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors(p => ({...p, fullName: ''})) }}
              onBlur={handleBlur}
              placeholder="Katniss Everdeen"
              autoComplete="name"
            />
            {renderFieldError('fullName')}
          </div>

          <div className="form-group">
            <label htmlFor="collegeEmail">College Email</label>
            <input
              id="collegeEmail"
              className={`input-field ${errors.collegeEmail ? 'border-red-500' : ''}`}
              type="email"
              value={collegeEmail}
              onChange={(e) => { setCollegeEmail(e.target.value); setErrors(p => ({...p, collegeEmail: ''})) }}
              onBlur={handleBlur}
              placeholder="ab1234@srmist.edu.in"
              autoComplete="email"
              readOnly={!!user?.email}
              disabled={!!user?.email}
            />
            {renderFieldError('collegeEmail')}
          </div>

          <div className="form-group">
            <label htmlFor="regNumber">Registration Number</label>
            <input
              id="regNumber"
              className={`input-field ${errors.regNumber ? 'border-red-500' : ''}`}
              type="text"
              value={regNumber}
              onChange={(e) => { setRegNumber(e.target.value.toUpperCase()); setErrors(p => ({...p, regNumber: ''})) }}
              onBlur={handleBlur}
              placeholder="RA2611003010123"
              maxLength={15}
              style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}
            />
            {renderFieldError('regNumber')}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department / Branch</label>
            <select
              id="department"
              className={`input-field ${errors.department ? 'border-red-500' : ''}`}
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setErrors(p => ({...p, department: ''})) }}
              onBlur={handleBlur}
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
            {renderFieldError('department')}
          </div>

          {department === 'Other' && (
            <div className="form-group">
              <label htmlFor="otherDepartment">Specify Department</label>
              <input
                id="otherDepartment"
                className={`input-field ${errors.otherDepartment ? 'border-red-500' : ''}`}
                type="text"
                value={otherDepartment}
                onChange={(e) => { setOtherDepartment(e.target.value); setErrors(p => ({...p, otherDepartment: ''})) }}
                onBlur={handleBlur}
                placeholder="e.g. Architecture"
              />
              {renderFieldError('otherDepartment')}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="academicYear">Academic Year</label>
            <select
              id="academicYear"
              className={`input-field ${errors.academicYear ? 'border-red-500' : ''}`}
              value={academicYear}
              onChange={(e) => { setAcademicYear(e.target.value); setErrors(p => ({...p, academicYear: ''})) }}
              onBlur={handleBlur}
            >
              <option value="" disabled>Select Year…</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Passed Out">Passed Out</option>
            </select>
            {renderFieldError('academicYear')}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Contact Number</label>
            <input
              id="phone"
              className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/[^\d]/g, '')); setErrors(p => ({...p, phone: ''})) }}
              onBlur={handleBlur}
              placeholder="9876543210"
              maxLength={10}
              autoComplete="tel"
            />
            {renderFieldError('phone')}
          </div>

          <div className="form-group">
            <label htmlFor="githubUrl">
              GitHub Profile URL <span style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <input
              id="githubUrl"
              className={`input-field ${errors.githubUrl ? 'border-red-500' : ''}`}
              type="url"
              value={githubUrl}
              onChange={(e) => { setGithubUrl(e.target.value); setErrors(p => ({...p, githubUrl: ''})) }}
              onBlur={handleBlur}
              placeholder="https://github.com/username"
            />
            {renderFieldError('githubUrl')}
          </div>

          <div className="form-group">
            <label htmlFor="linkedinUrl">
              LinkedIn Profile URL <span style={{ opacity: 0.5, fontSize: '0.8rem', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <input
              id="linkedinUrl"
              className={`input-field ${errors.linkedinUrl ? 'border-red-500' : ''}`}
              type="url"
              value={linkedinUrl}
              onChange={(e) => { setLinkedinUrl(e.target.value); setErrors(p => ({...p, linkedinUrl: ''})) }}
              onBlur={handleBlur}
              placeholder="https://linkedin.com/in/username"
            />
            {renderFieldError('linkedinUrl')}
          </div>

          {submitError && (
            <div className="form-error" role="alert">
              {submitError}
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
