'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { isRegistrationClosed } from '@/lib/event';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [regClosed, setRegClosed] = useState(false);

  useEffect(() => {
    setRegClosed(isRegistrationClosed());
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) {
        router.replace('/dashboard');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted && session?.user) {
        router.replace('/dashboard');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!email.trim().endsWith('@srmist.edu.in')) {
      setError('Only @srmist.edu.in email addresses are allowed to enter the arena.');
      setLoading(false);
      return;
    }

    const closed = isRegistrationClosed();

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: !closed,
        emailRedirectTo: `${window.location.origin}/dashboard`,
      }
    });

    if (signInError) {
      // Always show real error - don't mask with registration closed message
      setError(signInError.message);
    } else {
      setMessage('A secure transmission has been sent to your inbox. Check your email for the access code.');
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: 'var(--panel-bg)',
          padding: '3rem 2rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--accent-red)'
        }} />
        
        <h1 style={{ fontSize: '2rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', textAlign: 'center' }}>
          {regClosed ? 'Tribute Sign In' : 'Tribute Registration'}
        </h1>
        <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '1.5rem' }}>
          {step === 'email' ? 'Authenticate with your Capitol-issued credential.' : 'Enter the 6-digit access code sent to your email.'}
        </p>

        {regClosed && (
          <div style={{
            background: 'rgba(255, 69, 0, 0.12)',
            border: '1px solid var(--accent-orange)',
            borderRadius: '4px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#ffa07a',
            textAlign: 'center',
            lineHeight: 1.4
          }}>
            <strong>Registrations have concluded.</strong> Only previously registered tributes may enter the arena.
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
                SRM Email Address
              </label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@srmist.edu.in"
                className="input-field"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Transmitting...' : regClosed ? 'Enter Arena' : 'Request Access Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-display)', color: 'var(--accent-gold)' }}>
                Verification Code
              </label>
              <input 
                type="text" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="input-field"
                style={{ letterSpacing: '0.25rem', textAlign: 'center', fontSize: '1.5rem' }}
                maxLength={6}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Verifying...' : 'Enter Arena'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep('email')}
              style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Change Email
            </button>
          </form>
        )}

        {error && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--accent-red)', color: 'var(--accent-red)', background: 'rgba(139, 0, 0, 0.1)', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {message && step === 'email' && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.1)', textAlign: 'center' }}>
            {message}
          </div>
        )}
      </motion.div>
    </div>
  );
}
