import api from './axios';

export const signupUser = (payload) => api.post('/auth/signup', payload);

export const loginUser = (payload) => api.post('/auth/login', payload);

export const getCurrentUser = () => api.get('/auth/me');
