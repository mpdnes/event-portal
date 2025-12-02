import api from './api';
import { PDSession, Registration } from '../types';

export const sessionService = {
  // Get all published sessions
  getAllSessions: async (params?: {
    start_date?: string;
    end_date?: string;
    tag?: string;
  }) => {
    const response = await api.get<PDSession[]>('/sessions', { params });
    return response.data;
  },

  // Get single session by ID
  getSessionById: async (id: string) => {
    const response = await api.get<PDSession>(`/sessions/${id}`);
    return response.data;
  },

  // Create new session (admin/manager)
  createSession: async (sessionData: Partial<PDSession>) => {
    const response = await api.post<PDSession>('/sessions', sessionData);
    return response.data;
  },

  // Update session (admin/manager)
  updateSession: async (id: string, sessionData: Partial<PDSession>) => {
    const response = await api.put<PDSession>(`/sessions/${id}`, sessionData);
    return response.data;
  },

  // Delete session (admin)
  deleteSession: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },

  // Get admin stats
  getAdminStats: async () => {
    const response = await api.get('/sessions/admin/stats');
    return response.data;
  },
};

export const registrationService = {
  // Register for a session
  register: async (sessionId: string) => {
    const response = await api.post<Registration>('/registrations', {
      session_id: sessionId,
    });
    return response.data;
  },

  // Cancel registration
  cancel: async (sessionId: string) => {
    const response = await api.delete(`/registrations/${sessionId}`);
    return response.data;
  },

  // Get user's registrations
  getMyRegistrations: async () => {
    const response = await api.get<Registration[]>('/registrations/my-registrations');
    return response.data;
  },

  // Get session registrants (admin/manager)
  getSessionRegistrants: async (sessionId: string) => {
    const response = await api.get(`/registrations/session/${sessionId}`);
    return response.data;
  },
};
