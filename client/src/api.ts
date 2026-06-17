import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '' });

export type Status = 'NEW' | 'IN_PROGRESS' | 'DONE';

export interface Application {
  id: number;
  clientName: string;
  phone: string;
  equipmentType: string;
  comment: string | null;
  status: Status;
  createdAt: string;
}

export const getApplications = (status?: Status) =>
  api.get<Application[]>('/api/applications', { params: status ? { status } : {} }).then((r) => r.data);

export const createApplication = (data: Omit<Application, 'id' | 'createdAt'>) =>
  api.post<Application>('/api/applications', data).then((r) => r.data);

export const updateApplication = (id: number, data: Partial<Omit<Application, 'id' | 'createdAt'>>) =>
  api.patch<Application>(`/api/applications/${id}`, data).then((r) => r.data);

export const deleteApplication = (id: number) =>
  api.delete(`/api/applications/${id}`);
