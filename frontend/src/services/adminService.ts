import api from './api';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'staff';
  is_active: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  emoji?: string;
  color?: string;
  description?: string;
  created_at: string;
}

export interface Presenter {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  availability_notes?: string;
  created_at: string;
}

export interface DatabaseStats {
  users: number;
  sessions: number;
  registrations: number;
  tags: number;
  presenters: number;
}

export const adminService = {
  // Users
  getUsers: () => api.get<User[]>('/admin/users').then(r => r.data),
  getUser: (id: string) => api.get<User>(`/admin/users/${id}`).then(r => r.data),
  updateUser: (id: string, data: Partial<User>) => api.put<User>(`/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`).then(r => r.data),
  resetPassword: (id: string, password: string) => api.post(`/admin/users/${id}/reset-password`, { password }).then(r => r.data),

  // Tags
  getTags: () => api.get<Tag[]>('/admin/tags').then(r => r.data),
  createTag: (data: Omit<Tag, 'id' | 'created_at'>) => api.post<Tag>('/admin/tags', data).then(r => r.data),
  updateTag: (id: string, data: Partial<Tag>) => api.put<Tag>(`/admin/tags/${id}`, data).then(r => r.data),
  deleteTag: (id: string) => api.delete(`/admin/tags/${id}`).then(r => r.data),

  // Presenters
  getPresenters: () => api.get<Presenter[]>('/admin/presenters').then(r => r.data),
  createPresenter: (data: Omit<Presenter, 'id' | 'created_at'>) => api.post<Presenter>('/admin/presenters', data).then(r => r.data),
  updatePresenter: (id: string, data: Partial<Presenter>) => api.put<Presenter>(`/admin/presenters/${id}`, data).then(r => r.data),
  deletePresenter: (id: string) => api.delete(`/admin/presenters/${id}`).then(r => r.data),

  // Stats
  getStats: () => api.get<DatabaseStats>('/admin/stats').then(r => r.data),
};
