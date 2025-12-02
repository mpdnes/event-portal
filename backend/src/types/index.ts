export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
}

export interface Presenter {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  availability_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
  created_at: Date;
}

export interface PDSession {
  id: string;
  title: string;
  description?: string;
  presenter_id?: string;
  external_presenter_name?: string;
  location?: string;
  session_date: Date;
  start_time: string;
  end_time: string;
  capacity?: number;
  is_published: boolean;
  requires_password: boolean;
  session_password?: string;
  notes?: string;
  status: 'draft' | 'published' | 'full' | 'completed' | 'cancelled';
  times_offered: number;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PDSessionWithDetails extends PDSession {
  presenter?: Presenter;
  tags?: Tag[];
  registration_count?: number;
  user_registered?: boolean;
}

export interface Registration {
  id: string;
  session_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'no-show' | 'cancelled';
  registered_at: Date;
  updated_at: Date;
}

export interface Feedback {
  id: string;
  session_id: string;
  user_id?: string;
  rating: number;
  comments?: string;
  is_anonymous: boolean;
  submitted_at: Date;
}

export interface SessionTemplate {
  id: string;
  title: string;
  description?: string;
  presenter_id?: string;
  duration_minutes?: number;
  capacity?: number;
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IdeaSubmission {
  id: string;
  submitted_by?: string;
  title: string;
  description?: string;
  suggested_presenter?: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title?: string;
  message?: string;
  is_read: boolean;
  related_session_id?: string;
  created_at: Date;
}

export interface AuthRequest extends Express.Request {
  user?: UserResponse;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}
