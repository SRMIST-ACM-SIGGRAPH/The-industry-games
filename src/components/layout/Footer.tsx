'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ position: 'relative', width: '100%', padding: '3rem 1.5rem', zIndex: 20, marginTop: '2.5rem' }}>
      {/* Glowing boundary */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, var(--accent-orange), transparent)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '10rem', background: 'linear-gradient(to bottom, rgba(217, 119, 6, 0.05), transparent)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.25rem' }}>
          {/* Brand */}
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--foreground)' }}>
              SRMIST ACM <span style={{ fontWeight: 300, color: 'var(--accent-orange)' }}>SIGGRAPH</span>
            </h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.4)', maxWidth: '24rem', margin: '0.5rem auto 0', lineHeight: 1.6 }}>
              Exploring the boundaries of computer graphics, interactive techniques, and digital art.
            </p>
          </div>

          {/* Socials & Links */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
            <Link href="https://srmacmsiggraph.dev" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Official Website" title="Official Website: srmacmsiggraph.dev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </Link>
            <Link href="https://www.instagram.com/srm_acm_siggraph" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </Link>
            <Link href="https://www.linkedin.com/company/srmist-acm-siggraph-student-chapter" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </Link>
            <Link href="mailto:srmacmsiggraph@gmail.com" className="footer-social-link" aria-label="Email" title="srmacmsiggraph@gmail.com">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            </Link>
            <Link href="https://github.com/SRMIST-ACM-SIGGRAPH" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </Link>
          </div>

          {/* Copyright */}
          <div style={{ marginTop: '0.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.2)', width: '100%', maxWidth: '28rem', margin: '0.5rem auto 0', fontFamily: 'var(--font-sans)' }}>
            © {new Date().getFullYear()} SRMIST ACM SIGGRAPH. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

