export type Urgency = 'general' | 'urgent' | 'critical';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  urgency: Urgency;
  created_at: string;
}
