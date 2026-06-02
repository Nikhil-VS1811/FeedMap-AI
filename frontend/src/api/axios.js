import axios from 'axios';

import { clearAuthSession, getStoredToken } from '../utils/authStorage';
import { showApiError } from '../utils/toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log('[api request]', {
    headers: config.headers,
    method: config.method,
    token,
    url: `${config.baseURL || ''}${config.url || ''}`,
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[api response]', {
      data: response.data,
      status: response.status,
      url: response.config?.url,
    });

    return response;
  },
  (error) => {
    console.log('[api error]', {
      data: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      clearAuthSession();
    }

    showApiError(error);

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    console.log('[api auth] default Authorization set', api.defaults.headers.common.Authorization);
    return;
  }

  delete api.defaults.headers.common.Authorization;
  console.log('[api auth] default Authorization cleared');
};

export default api;
