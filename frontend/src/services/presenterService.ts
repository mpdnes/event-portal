import api from './api';
import { Presenter } from '../types';

export const presenterService = {
  getAll: async () => {
    const response = await api.get<Presenter[]>('/presenters');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<Presenter>(`/presenters/${id}`);
    return response.data;
  },

  create: async (presenterData: Partial<Presenter>) => {
    const response = await api.post<Presenter>('/presenters', presenterData);
    return response.data;
  },

  update: async (id: string, presenterData: Partial<Presenter>) => {
    const response = await api.put<Presenter>(`/presenters/${id}`, presenterData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/presenters/${id}`);
    return response.data;
  },
};
