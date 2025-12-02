import api from './api';
import type { ProgressSummary } from '../types/progression';

export const petService = {
  async getProgressSummary(): Promise<ProgressSummary> {
    const response = await api.get('/pets/progress-summary');
    return response.data;
  },

  async getMyPet() {
    const response = await api.get('/pets/my-pet');
    return response.data;
  },

  async createPet(name: string, petType: string = 'companion') {
    const response = await api.post('/pets', { name, pet_type: petType });
    return response.data;
  },

  async updatePetName(name: string) {
    const response = await api.put('/pets/name', { name });
    return response.data;
  },

  async addExperience(
    experience: number,
    reason: 'registration' | 'attendance' | 'interaction',
    sessionId?: string
  ) {
    const response = await api.post('/pets/experience', {
      experience,
      reason,
      session_id: sessionId,
    });
    return response.data;
  },
};
