import API from './api';

export const contentService = {
  getContents: (params?: {
    search?: string;
    module_id?: number;
    type?: string;
    page?: number;
    per_page?: number;
  }) => API.get('/contents', { params }),

  getContent: (id: number) => API.get(`/contents/${id}`),

  createContent: (data: FormData) =>
    API.post('/contents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateContent: (id: number, data: FormData) =>
    API.post(`/contents/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteContent: (id: number) => API.delete(`/contents/${id}`),
};

export const moduleService = {
  getModules: (params?: { search?: string; page?: number; per_page?: number }) =>
    API.get('/modules', { params }),

  getModule: (id: number) => API.get(`/modules/${id}`),

  createModule: (data: FormData) =>
    API.post('/modules', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateModule: (id: number, data: FormData) =>
    API.post(`/modules/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteModule: (id: number) => API.delete(`/modules/${id}`),
};

export const dashboardService = {
  getDashboard: () => API.get('/dashboard'),
};