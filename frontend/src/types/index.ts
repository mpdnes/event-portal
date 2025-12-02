export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Presenter {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
}

export interface Tag {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
}

export interface PDSession {
  id: string;
  title: string;
  description?: string;
  presenter_id?: string;
  presenter_name?: string;
  presenter?: Presenter;
  external_presenter_name?: string;
  location?: string;
  session_date: string;
  start_time: string;
  end_time: string;
  capacity?: number;
  is_published: boolean;
  requires_password: boolean;
  session_password?: string;
  notes?: string;
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled';
  times_offered: number;
  tags?: Tag[];
  registration_count?: number;
  user_registered?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  session_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'no-show' | 'cancelled';
  session?: PDSession;
  registered_at: string;
}

export interface Feedback {
  id: string;
  session_id: string;
  user_id?: string;
  rating: number;
  comments?: string;
  is_anonymous: boolean;
  submitted_at: string;
}

export interface AdminStats {
  published_sessions: number;
  draft_sessions: number;
  completed_sessions: number;
  total_participants: number;
  average_rating: number;
  low_signup_sessions: Array<{
    id: string;
    title: string;
    session_date: string;
    signup_count: number;
  }>;
}

export interface IdeaSubmission {
  id: string;
  submitted_by?: string;
  title: string;
  description?: string;
  suggested_presenter?: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  admin_notes?: string;
  created_at: string;
}
