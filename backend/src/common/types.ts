export type UserRole = 'client' | 'provider';
export type JobUrgency = 'urgent' | 'normal' | 'flexible';
export type JobStatus =
  | 'open'
  | 'recommending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'expired';
export type ApplicationStatus =
  'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedRequest extends Request {
  user: Profile;
  accessToken: string;
}
