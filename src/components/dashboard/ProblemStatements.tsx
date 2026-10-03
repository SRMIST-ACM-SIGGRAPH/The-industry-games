import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { BookOpen, Download } from 'lucide-react';

export default function ProblemStatements() {
  const pdfPath = '/The_Industry_Games_2026_Problem_Statements.pdf';
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${pdfPath}` : `https://industrygames.srmacmsiggraph.dev${pdfPath}`;

  return (
    <motion.section
      id="problem-statements"
      className="panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ 
        marginTop: '2rem', 
        borderTop: '3px solid var(--accent-gold)', 
        background: 'linear-gradient(to bottom, rgba(212, 175, 55, 0.05) 0%, var(--panel-bg) 100%)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '800px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={24} color="var(--accent-gold)" />
          <h2 className="panel__title" style={{ margin: 0 }}>Official Problem Statements</h2>
        </div>
        <a
          href={pdfPath}
          download="The_Industry_Games_2026_Problem_Statements.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.1rem', fontSize: '0.8rem' }}
        >
          <Download size={16} />
          Download PDF
        </a>
      </div>
      
      <p style={{ color: '#ccc', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: 1.6 }}>
        Study the dossiers below, choose your battleground, and build the solution that survives. You must select your chosen Problem Statement in the Alliance Panel above before submitting your final presentation.
      </p>

      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: '#e5e5e5' }}>
        <iframe 
          src={`https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`} 
          title="Problem Statements PDF"
          style={{ width: '100%', height: '100%', minHeight: '700px', border: 'none' }}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <a 
          href={pdfPath} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', textDecoration: 'underline' }}
        >
          Having trouble viewing? Click here to open or download the PDF directly.
        </a>
      </div>
    </motion.section>
  );
}
