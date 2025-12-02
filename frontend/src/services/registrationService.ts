import api from './api';
import { Registration } from '../types';

export const registrationService = {
  // Get all registrations for the current user
  async getMyRegistrations(): Promise<Registration[]> {
    const response = await api.get('/registrations/my-registrations');
    return response.data;
  },

  // Register for a session
  async register(sessionId: string): Promise<Registration> {
    const response = await api.post('/registrations', { session_id: sessionId });
    return response.data;
  },

  // Cancel a registration
  async cancel(sessionId: string): Promise<void> {
    await api.delete(`/registrations/${sessionId}`);
  }
};
