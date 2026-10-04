/**
 * Admin Submission Evaluation & Shortlisting Pipeline Helpers
 * Part of Issue #9: Evaluation Pipeline, Staging, Shortlisting, & Inspector Modal
 */

export type EvaluationStage = 'pending' | 'staged' | 'shortlisted' | 'rejected';

export interface EvaluationTeamMember {
  profile_id: string;
  full_name: string;
  registration_number: string;
  college_email?: string;
  phone?: string;
  department?: string;
  year?: string;
  github_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
}

export interface EvaluationTeam {
  id: string;
  name: string;
  team_code: string;
  district?: string;
  problem_statement?: string;
  submission_url?: string;
  is_submitted: boolean;
  payment_status: EvaluationStage;
  staged_by?: string;
  staged_by_name?: string;
  staged_at?: string;
  shortlisted_by?: string;
  shortlisted_by_name?: string;
  shortlisted_at?: string;
  members: EvaluationTeamMember[];
  created_at: string;
}

/**
 * Validates permitted transitions according to the Issue #9 state machine:
 * - pending -> staged | rejected
 * - staged -> shortlisted | rejected
 * - shortlisted -> staged | rejected
 * - rejected -> staged
 */
export function isValidStageTransition(current: EvaluationStage, target: EvaluationStage): boolean {
  switch (current) {
    case 'pending':
      return target === 'staged' || target === 'rejected';
    case 'staged':
      return target === 'shortlisted' || target === 'rejected';
    case 'shortlisted':
      return target === 'staged' || target === 'rejected';
    case 'rejected':
      return target === 'staged';
    default:
      return false;
  }
}
