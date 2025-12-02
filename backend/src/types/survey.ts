// Survey Types
export interface Survey {
  id: string;
  title: string;
  description?: string;
  session_id: string;
  status: 'draft' | 'active' | 'closed' | 'archived';
  is_anonymous: boolean;
  allow_multiple_responses: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_type: 'text' | 'rating' | 'multiple_choice' | 'checkbox' | 'likert';
  order_id: number;
  is_required: boolean;
  rating_scale?: number;
  options?: SurveyQuestionOption[];
  created_at: Date;
  updated_at: Date;
}

export interface SurveyQuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  order_id: number;
  created_at: Date;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  user_id?: string;
  started_at?: Date;
  submitted_at?: Date;
  completed: boolean;
  created_at: Date;
}

export interface SurveyAnswer {
  id: string;
  response_id: string;
  question_id: string;
  answer_text?: string;
  rating_value?: number;
  selected_option_id?: string;
  created_at: Date;
}

export interface SurveyWithQuestions extends Survey {
  questions: SurveyQuestion[];
  response_count?: number;
}

// Email Types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  text_body?: string;
  template_variables: string[]; // JSON array of variable names
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface EmailLog {
  id: string;
  recipient_email: string;
  subject?: string;
  template_name?: string;
  user_id?: string;
  session_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  error_message?: string;
  sent_at?: Date;
  created_at: Date;
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  receive_session_reminders: boolean;
  receive_new_sessions: boolean;
  receive_feedback_requests: boolean;
  receive_admin_notifications: boolean;
  updated_at: Date;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateName?: string;
  userId?: string;
  sessionId?: string;
}
