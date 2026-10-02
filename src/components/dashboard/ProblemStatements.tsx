import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { BookOpen } from 'lucide-react';

export default function ProblemStatements() {
  // Get the public URL for the PDF stored in the 'events' bucket
  const { data } = supabase.storage.from('events').getPublicUrl('The_Industry_Games_2026_Problem_Statements.pdf');
  const pdfUrl = data.publicUrl;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <BookOpen size={24} color="var(--accent-gold)" />
        <h2 className="panel__title" style={{ margin: 0 }}>Official Problem Statements</h2>
      </div>
      
      <p style={{ color: '#ccc', marginBottom: '2rem', fontSize: '1rem', lineHeight: 1.6 }}>
        Study the dossiers below, choose your battleground, and build the solution that survives. You must select your chosen Problem Statement in the Alliance Panel above before submitting your final presentation.
      </p>

      <div style={{ flex: 1, border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', background: '#e5e5e5' }}>
        <iframe 
          src={pdfUrl} 
          title="Problem Statements PDF"
          style={{ width: '100%', height: '100%', minHeight: '700px', border: 'none' }}
        />
      </div>
    </motion.section>
  );
}
