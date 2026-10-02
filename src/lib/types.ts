export type Urgency = 'general' | 'urgent' | 'critical';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  urgency: Urgency;
  created_at: string;
}
export interface Team {
  id: string;
  name: string;
  team_code: string;
  leader_id: string;
  payment_proof_url?: string;
  payment_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verifier?: { college_email: string };
  submission_url?: string;
  is_submitted: boolean;
  problem_statement?: string;
  created_at: string;
}
