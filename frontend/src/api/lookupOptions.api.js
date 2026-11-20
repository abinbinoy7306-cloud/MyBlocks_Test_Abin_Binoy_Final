import api from './axios';

export const getLookupOptions = (category) => api.get(`/lookups/${category}`);
export const getLookupAdmin = () => api.get('/lookups');
export const createLookupOption = (data) => api.post('/lookups', data);
export const updateLookupOption = (id, data) => api.put(`/lookups/${id}`, data);
export const toggleLookupOption = (id) => api.put(`/lookups/${id}/toggle`);
