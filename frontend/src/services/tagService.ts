import api from './api';
import { Tag } from '../types';

export const tagService = {
  getAll: async () => {
    const response = await api.get<Tag[]>('/tags');
    return response.data;
  },

  create: async (tagData: Partial<Tag>) => {
    const response = await api.post<Tag>('/tags', tagData);
    return response.data;
  },

  update: async (id: string, tagData: Partial<Tag>) => {
    const response = await api.put<Tag>(`/tags/${id}`, tagData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/tags/${id}`);
    return response.data;
  },
};
